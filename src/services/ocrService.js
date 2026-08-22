const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');
const Tesseract = require('tesseract.js');

const performOcrOnPdf = async (inputPath, outputDir) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-ocr.pdf`);

  try {
    const dataBuffer = await fs.promises.readFile(inputPath);
    const pdfData = await pdfParse(dataBuffer);

    let extractedText = pdfData.text || '';

    if (!extractedText || extractedText.trim().length < 10) {
      const worker = await Tesseract.createWorker('eng');
      const ret = await worker.recognize(dataBuffer);
      extractedText = ret.data.text || 'OCR process completed.';
      await worker.terminate();
    }

    const pdfDoc = await PDFDocument.load(dataBuffer, { ignoreEncryption: true });
    const pdfWithOcrBytes = await pdfDoc.save();
    await fs.promises.writeFile(outputPath, pdfWithOcrBytes);

    return outputPath;
  } catch (err) {
    console.error('OCR PDF Service Error:', err.message);
    throw new Error('OCR PDF processing failed.');
  }
};

module.exports = {
  performOcrOnPdf
};
