const path = require('path');
const fs = require('fs');
const { extractPdfText: pdfParse, PdfExtractionError } = require('./pdfExtraction');
const { noTextLayerError } = require('../utils/optionParser');
const { Document, Packer, Paragraph, TextRun, PageBreak } = require('docx');
const env = require('../config/env');

const convertPdfToWord = async (inputPath, outputDir) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}.docx`);

  if (env.pdfToWordApiUrl) {
    try {
      return await convertViaExternalApi(inputPath, outputPath);
    } catch (err) {
      console.warn('External PDF conversion service failed, falling back to local engine:', err.message);
    }
  }

  return await convertLocally(inputPath, outputPath);
};

const convertLocally = async (inputPath, outputPath) => {
  try {
    const dataBuffer = await fs.promises.readFile(inputPath);
    const pdfData = await pdfParse(dataBuffer);

    const pages = pdfData.pages;

    /* Every blank source line still pushes an empty Paragraph below, so
       `children.length` can never be zero and a gate on it is dead code. The
       honest question is whether the document yielded any text at all. */
    if (pages.every((p) => !p || p.trim().length === 0)) throw noTextLayerError();

    const children = [];

    pages.forEach((pageText, pageIndex) => {
      if (pageIndex > 0) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
      }

      const lines = pageText.split(/\r?\n/);
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.length > 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 24
                })
              ],
              spacing: { after: 120 }
            })
          );
        } else {
          children.push(new Paragraph({ children: [] }));
        }
      });
    });

    if (children.length === 0) {
      // Unreachable in practice (blank lines push empty paragraphs) and replaced
      // by the document-level gate above; kept as a last-resort refusal rather
      // than the old paragraph claiming "Document content extracted from PDF."
      throw noTextLayerError();
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children
        }
      ]
    });

    const buffer = await Packer.toBuffer(doc);
    await fs.promises.writeFile(outputPath, buffer);

    return outputPath;
  } catch (err) {
    // Keep deliberate refusals intact: without this a badRequest thrown above is
    // rewrapped into a generic 500 and the user never sees the real reason.
    if (err && err.statusCode) throw err;
    console.error('Local PDF to Word conversion failed:', err.message);
    throw err instanceof PdfExtractionError ? err : new Error('Failed to convert PDF document to Word format.');
  }
};

const convertViaExternalApi = async (inputPath, outputPath) => {
  throw new Error('External API not implemented');
};

module.exports = {
  convertPdfToWord
};
