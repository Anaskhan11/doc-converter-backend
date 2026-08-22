const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const TurndownService = require('turndown');

const convertPdfToText = async (inputPath, outputDir) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}.txt`);

  try {
    const dataBuffer = await fs.promises.readFile(inputPath);
    const pdfData = await pdfParse(dataBuffer);

    const rawText = pdfData.text || 'No text extracted from PDF.';
    await fs.promises.writeFile(outputPath, rawText, 'utf8');

    return outputPath;
  } catch (err) {
    console.error('PDF to Text Service Error:', err.message);
    throw new Error('Failed to extract plain text from PDF.');
  }
};

const convertPdfToMarkdown = async (inputPath, outputDir) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}.md`);

  try {
    const dataBuffer = await fs.promises.readFile(inputPath);
    const pdfData = await pdfParse(dataBuffer);
    const rawText = pdfData.text || '';

    const lines = rawText.split(/\r?\n/);
    let htmlContent = `<h1>${baseName}</h1>\n`;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.length > 0) {
        if (trimmed.length < 40 && !trimmed.endsWith('.')) {
          htmlContent += `<h2>${trimmed}</h2>\n`;
        } else {
          htmlContent += `<p>${trimmed}</p>\n`;
        }
      }
    });

    const turndownService = new TurndownService({ headingStyle: 'atx' });
    const markdownText = turndownService.turndown(htmlContent);

    await fs.promises.writeFile(outputPath, markdownText, 'utf8');
    return outputPath;
  } catch (err) {
    console.error('PDF to Markdown Service Error:', err.message);
    throw new Error('Failed to convert PDF to Markdown format.');
  }
};

module.exports = {
  convertPdfToText,
  convertPdfToMarkdown
};
