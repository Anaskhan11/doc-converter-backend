const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
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

    const rawText = pdfData.text || '';
    const pages = rawText.split('\f');

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
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Document content extracted from PDF.',
              size: 24
            })
          ]
        })
      );
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
    console.error('Local PDF to Word conversion failed:', err.message);
    throw new Error('Failed to convert PDF document to Word format.');
  }
};

const convertViaExternalApi = async (inputPath, outputPath) => {
  throw new Error('External API not implemented');
};

module.exports = {
  convertPdfToWord
};
