const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const signPdf = async (inputPath, outputDir, signerName = 'Digitally Signed') => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-signed.pdf`);

  try {
    const dataBuffer = await fs.promises.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(dataBuffer, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pages = pdfDoc.getPages();
    const signText = signerName && signerName.trim() ? signerName.trim() : 'Digitally Signed';
    const dateStr = new Date().toISOString().split('T')[0];

    pages.forEach((page) => {
      const { width } = page.getSize();
      const text = `SIGNED BY: ${signText} (${dateStr})`;

      page.drawRectangle({
        x: width - 260,
        y: 20,
        width: 240,
        height: 35,
        color: rgb(0.95, 0.98, 0.95),
        borderColor: rgb(0.1, 0.7, 0.2),
        borderWidth: 1.5
      });

      page.drawText(text, {
        x: width - 250,
        y: 32,
        size: 9,
        font,
        color: rgb(0.1, 0.5, 0.2)
      });
    });

    const signedBytes = await pdfDoc.save();
    await fs.promises.writeFile(outputPath, signedBytes);
    return outputPath;
  } catch (err) {
    console.error('Sign PDF Service Error:', err.message);
    throw new Error('Failed to sign PDF document.');
  }
};

const redactPdf = async (inputPath, outputDir, redactText = 'CONFIDENTIAL') => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-redacted.pdf`);

  try {
    const dataBuffer = await fs.promises.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(dataBuffer, { ignoreEncryption: true });

    const pages = pdfDoc.getPages();
    pages.forEach((page) => {
      const { width, height } = page.getSize();
      page.drawRectangle({
        x: 50,
        y: height - 100,
        width: width - 100,
        height: 40,
        color: rgb(0, 0, 0)
      });
    });

    const redactedBytes = await pdfDoc.save();
    await fs.promises.writeFile(outputPath, redactedBytes);
    return outputPath;
  } catch (err) {
    console.error('Redact PDF Service Error:', err.message);
    throw new Error('Failed to redact PDF document.');
  }
};

const cropPdf = async (inputPath, outputDir, cropMargin = 20) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-cropped.pdf`);

  try {
    const dataBuffer = await fs.promises.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(dataBuffer, { ignoreEncryption: true });

    const pages = pdfDoc.getPages();
    const margin = parseInt(cropMargin, 10) || 20;

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      page.setCropBox(margin, margin, Math.max(100, width - margin * 2), Math.max(100, height - margin * 2));
    });

    const croppedBytes = await pdfDoc.save();
    await fs.promises.writeFile(outputPath, croppedBytes);
    return outputPath;
  } catch (err) {
    console.error('Crop PDF Service Error:', err.message);
    throw new Error('Failed to crop PDF document.');
  }
};

const editPdf = async (inputPath, outputDir, annotationText = 'Edited Document Note') => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-edited.pdf`);

  try {
    const dataBuffer = await fs.promises.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(dataBuffer, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();
    const note = annotationText && annotationText.trim() ? annotationText.trim() : 'Edited Document Note';

    pages.forEach((page) => {
      const { height } = page.getSize();
      page.drawText(`[NOTE: ${note}]`, {
        x: 50,
        y: height - 30,
        size: 10,
        font,
        color: rgb(0.2, 0.4, 0.8)
      });
    });

    const editedBytes = await pdfDoc.save();
    await fs.promises.writeFile(outputPath, editedBytes);
    return outputPath;
  } catch (err) {
    console.error('Edit PDF Service Error:', err.message);
    throw new Error('Failed to edit PDF document.');
  }
};

module.exports = {
  signPdf,
  redactPdf,
  cropPdf,
  editPdf
};
