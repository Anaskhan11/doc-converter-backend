const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');

const convertImagesToPdf = async (inputPaths, outputDir) => {
  const pdfDoc = await PDFDocument.create();

  for (const inputPath of inputPaths) {
    const ext = path.extname(inputPath).toLowerCase();
    let imageBytes = await fs.promises.readFile(inputPath);
    let embeddedImage;

    try {
      if (ext === '.jpg' || ext === '.jpeg') {
        const jpegBuffer = await sharp(imageBytes).jpeg({ quality: 90 }).toBuffer();
        embeddedImage = await pdfDoc.embedJpg(jpegBuffer);
      } else if (ext === '.png') {
        const pngBuffer = await sharp(imageBytes).png().toBuffer();
        embeddedImage = await pdfDoc.embedPng(pngBuffer);
      } else {
        const pngBuffer = await sharp(imageBytes).png().toBuffer();
        embeddedImage = await pdfDoc.embedPng(pngBuffer);
      }

      const { width, height } = embeddedImage;
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width,
        height
      });
    } catch (err) {
      console.error(`Failed to embed image ${inputPath} into PDF:`, err.message);
    }
  }

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(outputDir, `converted-${Date.now()}.pdf`);
  await fs.promises.writeFile(outputPath, pdfBytes);
  return outputPath;
};

module.exports = {
  convertImagesToPdf
};
