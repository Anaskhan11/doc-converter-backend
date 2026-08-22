const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const unlockPdf = async (inputPath, outputDir, password = '') => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-unlocked.pdf`);

  try {
    const dataBuffer = await fs.promises.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(dataBuffer, { ignoreEncryption: true });

    const unlockedPdf = await PDFDocument.create();
    const pageIndices = pdfDoc.getPageIndices();
    const copiedPages = await unlockedPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach((page) => unlockedPdf.addPage(page));

    const unlockedBytes = await unlockedPdf.save();
    await fs.promises.writeFile(outputPath, unlockedBytes);

    return outputPath;
  } catch (err) {
    console.error('Unlock PDF Service Error:', err.message);
    throw new Error('Failed to unlock PDF document.');
  }
};

module.exports = {
  unlockPdf
};
