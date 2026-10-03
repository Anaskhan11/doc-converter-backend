const fs = require('fs');
const { extractPdfText: pdfParse, PdfExtractionError } = require('./pdfExtraction');

// No input can be OCR'd here: reading a scanned page needs a PDF renderer this
// server does not have. The text-bearing branch used to fall through to a
// pdf-lib re-save and hand that back as a completed OCR, so a PDF that already
// had selectable text got a byte-reshuffled copy of itself labelled "done" --
// the same facade protect-pdf and powerpoint-to-pdf were ruled out of.
const REFUSAL =
  'Optical character recognition is not available in this build, so your file was not changed. Reading text out of a scanned page needs a PDF renderer this server does not have. If your PDF already has selectable text, use PDF to Text instead.';

const performOcrOnPdf = async (inputPath) => {
  try {
    const dataBuffer = await fs.promises.readFile(inputPath);
    // Deliberately unused: extracting first is what keeps a damaged or non-PDF
    // upload answering the 400 extraction message instead of this 501.
    await pdfParse(dataBuffer);

    const err = new Error(REFUSAL);
    err.statusCode = 501;
    throw err;
  } catch (err) {
    console.error('OCR PDF Service Error:', err.message);
    // An error that already carries a status is deliberate (the 501 refusal above, or a
    // PdfExtractionError 400) and must reach the client intact; re-wrapping it here turned a
    // specific refusal into a generic 500 "please try again".
    if (err && err.statusCode) throw err;
    throw err instanceof PdfExtractionError ? err : new Error('OCR PDF processing failed.');
  }
};

module.exports = {
  performOcrOnPdf
};
