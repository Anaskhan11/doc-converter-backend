const { PDFDocument } = require('pdf-lib');

const MAX_ATTEMPTS = 3;

// pdf-parse hands pdf.js a bare Node Buffer (its PDF() wrapper calls
// getDocument(dataBuffer)), and pdf.js then reads the pooled ArrayBuffer behind
// that view instead of just the file bytes: ~half of all parses died with
// "Invalid PDF structure" / "bad XRef entry" / "Unknown compression method in
// flate stream", including on files this app had written itself, so chaining two
// tools failed at coin-flip odds. Handing over { data } fixes it, which is why
// the vendored pdf.js builds are driven directly here. No new dependency: these
// are the builds already inside node_modules/pdf-parse/lib/pdf.js.
//
// pdf-parse also caches its first build process-wide
// (node_modules/pdf-parse/lib/pdf-parse.js:62), so its `version` option only
// applies to whichever request happens to parse first after boot. Requiring the
// build by name makes the choice real.
const EXTRACTOR_VERSION = process.env.PDF_PARSE_VERSION || 'v2.0.550';

// One sentence for every route that cannot read an upload, so a damaged file
// never gets a different explanation depending on which tool it was sent to.
const UNREADABLE_PDF = 'The PDF document could not be read. The file may be damaged or use a feature this converter cannot parse.';

// A password-protected PDF is the one input this app cannot round-trip at all:
// pdf-lib cannot decrypt, so it reads the still-encrypted object streams and
// re-saves them under new object numbers, which leaves a file no engine can
// read any more. Measured on a genuine RC4-40 fixture (empty user password, so
// pdf.js *can* open it): /compress-pdf, /crop-pdf, /sign-pdf and /edit-pdf each
// returned 200 with an output their own extractor then refused, and /repair-pdf
// returned 200 with the /Encrypt dictionary stripped and 2 characters of text
// left in the document. Refusing in the one loader every pdf-lib route shares is
// what makes those five answer the same way the strict-load routes already did.
const ENCRYPTED_PDF = 'This PDF is password-protected. This build has no decryption engine, so the document was not converted and your file was not changed.';

// A PDF with no pages is a legal file, but there is nothing for any of these
// tools to act on. Measured on a hand-written /Kids [] /Count 0 upload: nine
// pdf-lib routes re-saved the same empty document as a 200 (sign, watermark and
// add-page-numbers reported success while drawing on zero pages), and /split-pdf
// fell through to a bare throw that the handler turned into a 500 "Please try
// again" -- for a file that is perfectly fine, just empty. Guarding the shared
// loader is what makes every one of them name the input instead.
const EMPTY_PDF = 'This PDF has no pages, so there was nothing to convert and your file was not changed.';

class PdfExtractionError extends Error {
  constructor(message, attempts, causes) {
    super(message);
    this.name = 'PdfExtractionError';
    this.attempts = attempts;
    this.causes = causes;
    // an unreadable upload is a client-input problem, and every caller that used
    // to flatten this into its own generic Error now rethrows it unchanged
    this.statusCode = 400;
  }
}

const renderPage = (pageData) => {
  return pageData
    .getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false })
    .then((textContent) => {
      let lastY;
      let text = '';
      for (const item of textContent.items) {
        if (lastY == item.transform[5] || !lastY) {
          text += item.str;
        } else {
          text += '\n' + item.str;
        }
        lastY = item.transform[5];
      }
      return text;
    });
};

const extractWith = async (dataBuffer, pdfjsLib, parseOptions) => {
  const doc = await pdfjsLib.getDocument({ data: dataBuffer }).promise;
  const ret = {
    numpages: doc.numPages,
    numrender: 0,
    info: null,
    metadata: null,
    text: '',
    // text alone is not enough for the page-per-block consumers: the joined
    // document has no page separator at all (pages are glued with "\n\n"), so
    // a caller that split on the form-feed pdf.js used to emit sees one chunk
    // and collapses a multi-page document into a single page/slide.
    pages: [],
    version: pdfjsLib.version
  };

  const metaData = await doc.getMetadata().catch(() => null);
  ret.info = metaData ? metaData.info : null;
  ret.metadata = metaData ? metaData.metadata : null;

  let counter = parseOptions.max > 0 ? parseOptions.max : doc.numPages;
  counter = counter > doc.numPages ? doc.numPages : counter;

  for (let i = 1; i <= counter; i++) {
    const pageText = await doc
      .getPage(i)
      .then((pageData) => parseOptions.pagerender(pageData))
      .catch(() => '');
    ret.pages.push(pageText);
    ret.text = `${ret.text}\n\n${pageText}`;
  }

  ret.numrender = counter;
  await doc.destroy();
  return ret;
};

const extractPdfText = async (dataBuffer, options = {}) => {
  const causes = [];
  const { beforeAttempt, ...parseOptions } = options;
  if (typeof parseOptions.pagerender !== 'function') parseOptions.pagerender = renderPage;

  let pdfjsLib;
  try {
    pdfjsLib = require(`pdf-parse/lib/pdf.js/${EXTRACTOR_VERSION}/build/pdf.js`);
  } catch (err) {
    causes.push(err.message);
    pdfjsLib = require('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js');
  }
  pdfjsLib.disableWorker = true;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // callers that accumulate state through a custom pagerender need it
      // reset before each try, or a retry would append to the failed attempt's
      if (beforeAttempt) beforeAttempt(attempt);
      // pdf.js can leave the buffer it is handed in a partially-consumed
      // state, so every attempt must get its own copy.
      const freshCopy = new Uint8Array(Buffer.from(dataBuffer));
      return await extractWith(freshCopy, pdfjsLib, parseOptions);
    } catch (err) {
      causes.push(err.message);
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 50 * attempt));
      }
    }
  }

  throw new PdfExtractionError(
    UNREADABLE_PDF,
    MAX_ATTEMPTS,
    causes
  );
};

// pdf-lib's load() is lenient: it accepts any file that begins with %PDF and
// only walks the page tree later, when getPages() runs. A truncated or
// junk-bodied upload therefore survived load() and died inside pdf-lib with an
// untyped TypeError, which errorHandler can only report as a server fault -- so
// every input mistake on a pdf-lib route answered 500 "Please try again" while
// the pdf-parse routes answered 400 "could not be read" for the same file.
// Validating the read here, at the one place that knows what a readable PDF
// means, is what lets errorHandler classify it honestly.
const loadPdf = async (pdfBytes, options = {}) => {
  let pdfDoc;
  try {
    // ignoreEncryption is forced on so the check below can actually see the
    // trailer: a strict load throws before isEncrypted can be read, which would
    // leave every route reporting the damaged-file sentence for a protected file.
    pdfDoc = await PDFDocument.load(pdfBytes, { ...options, ignoreEncryption: true });
  } catch (err) {
    throw new PdfExtractionError(UNREADABLE_PDF, 1, [err.message]);
  }
  // isEncrypted before the page-tree walk: a document whose pages live in
  // encrypted object streams cannot be walked at all, and "password-protected"
  // is the accurate answer for it, not "may be damaged".
  if (pdfDoc.isEncrypted) {
    throw new PdfExtractionError(ENCRYPTED_PDF, 1, ['document is encrypted']);
  }
  let pages;
  try {
    pages = pdfDoc.getPages();
  } catch (err) {
    throw new PdfExtractionError(UNREADABLE_PDF, 1, [err.message]);
  }
  if (pages.length === 0) {
    throw new PdfExtractionError(EMPTY_PDF, 1, ['document has no pages']);
  }
  return pdfDoc;
};

module.exports = {
  extractPdfText,
  loadPdf,
  PdfExtractionError,
  UNREADABLE_PDF,
  ENCRYPTED_PDF,
  EMPTY_PDF,
  EXTRACTOR_VERSION,
  MAX_ATTEMPTS
};
