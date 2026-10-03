const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

// The upload guards only ever check a file against its own name, so a genuine JPEG
// or .docx reaches this loader intact and throws here. That is an input problem, not
// a server fault: as a bare Error it became a 500 "Something went wrong... Please try
// again", which promises a retry would help. One shared sentence with every other
// route that cannot read a PDF (pdfExtraction.UNREADABLE_PDF).
const { UNREADABLE_PDF } = require('./pdfExtraction');

const unlockPdf = async (inputPath, outputDir, password = '') => {
  const dataBuffer = await fs.promises.readFile(inputPath);
  let pdfDoc;
  try {
    pdfDoc = await PDFDocument.load(dataBuffer, { ignoreEncryption: true });
  } catch (err) {
    console.error('Unlock PDF Service Error:', err.message);
    const unreadable = new Error(UNREADABLE_PDF);
    unreadable.statusCode = 400;
    throw unreadable;
  }

  // pdf-lib cannot decrypt anything, so the old implementation ignored
  // `password` entirely and re-saved whatever it was given: an unencrypted
  // upload came back as a "successful" unlock and an encrypted one came back
  // still locked. isEncrypted is pdf-lib's own trailer /Encrypt lookup, and it
  // is read BEFORE the page tree below, because a document whose page tree lives
  // in encrypted object streams cannot be walked here - and that file is still
  // password-protected, which is the honest and more useful answer.
  if (pdfDoc.isEncrypted) {
    const unsupported = new Error(
      'This PDF is genuinely encrypted, and removing that encryption needs an engine this server does not have (qpdf or Ghostscript). Your file was not changed.'
    );
    unsupported.statusCode = 501;
    throw unsupported;
  }

  // pdf-lib's load() is lenient: a header-only or junk-bodied file survives it and
  // only fails when the page tree is walked. Without this check a damaged upload
  // fell through to the "not password-protected" sentence below, while every other
  // route that cannot read a PDF says UNREADABLE_PDF (loadPdf in pdfExtraction does
  // exactly this getPages() walk for that reason).
  try {
    pdfDoc.getPages();
  } catch (err) {
    console.error('Unlock PDF Page Tree Error:', err.message);
    const unreadable = new Error(UNREADABLE_PDF);
    unreadable.statusCode = 400;
    throw unreadable;
  }

  const notProtected = new Error(
    'This PDF is not password-protected, so there was nothing to unlock and your file was not changed.'
  );
  notProtected.statusCode = 400;
  throw notProtected;
};

module.exports = {
  unlockPdf
};
