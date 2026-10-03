const path = require('path');
const fs = require('fs');
const { extractPdfText: pdfParse, PdfExtractionError } = require('./pdfExtraction');
const TurndownService = require('turndown');
const { displayTitleOf } = require('../utils/fileUtils');
const { noTextLayerError } = require('../utils/optionParser');

/* PDF text is data, not markup, but it was concatenated straight into the HTML fed
   to Turndown, so a document containing <b>hi</b> or an <img> tag came out of the
   converter with that tag applied as real formatting (bold, break, list) instead of
   preserved as the characters the document actually has. */
const escapeHtml = (str) =>
  String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const convertPdfToText = async (inputPath, outputDir) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}.txt`);

  try {
    const dataBuffer = await fs.promises.readFile(inputPath);
    const pdfData = await pdfParse(dataBuffer);

    const rawText = pdfData.text;
    if (!rawText || rawText.trim().length === 0) throw noTextLayerError();
    await fs.promises.writeFile(outputPath, rawText, 'utf8');

    return outputPath;
  } catch (err) {
    if (err && err.statusCode) throw err;
    console.error('PDF to Text Service Error:', err.message);
    throw err instanceof PdfExtractionError ? err : new Error('Failed to extract plain text from PDF.');
  }
};

const convertPdfToMarkdown = async (inputPath, outputDir, originalName) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}.md`);

  try {
    const dataBuffer = await fs.promises.readFile(inputPath);
    const pdfData = await pdfParse(dataBuffer);
    const rawText = pdfData.text;
    // Without this the whole Markdown body was empty and the file was just an
    // <h1> of the filename -- a successful-looking document with nothing in it.
    if (!rawText || rawText.trim().length === 0) throw noTextLayerError();

    const lines = rawText.split(/\r?\n/);
    let htmlContent = `<h1>${escapeHtml(displayTitleOf(originalName))}</h1>\n`;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.length > 0) {
        if (trimmed.length < 40 && !trimmed.endsWith('.')) {
          htmlContent += `<h2>${escapeHtml(trimmed)}</h2>\n`;
        } else {
          htmlContent += `<p>${escapeHtml(trimmed)}</p>\n`;
        }
      }
    });

    const turndownService = new TurndownService({ headingStyle: 'atx' });
    const markdownText = turndownService.turndown(htmlContent);

    await fs.promises.writeFile(outputPath, markdownText, 'utf8');
    return outputPath;
  } catch (err) {
    if (err && err.statusCode) throw err;
    console.error('PDF to Markdown Service Error:', err.message);
    throw err instanceof PdfExtractionError ? err : new Error('Failed to convert PDF to Markdown format.');
  }
};

module.exports = {
  convertPdfToText,
  convertPdfToMarkdown
};
