const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const repairPdf = async (inputPath, outputDir) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-repaired.pdf`);

  try {
    const dataBuffer = await fs.promises.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(dataBuffer, {
      ignoreEncryption: true,
      parseSpeed: 1
    });

    const repairedPdf = await PDFDocument.create();
    const pageIndices = pdfDoc.getPageIndices();
    const copiedPages = await repairedPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach((page) => repairedPdf.addPage(page));

    const repairedBytes = await repairedPdf.save({ useObjectStreams: true });
    await fs.promises.writeFile(outputPath, repairedBytes);

    return outputPath;
  } catch (err) {
    console.error('PDF Repair Service Error:', err.message);
    throw new Error('Failed to repair PDF document structure.');
  }
};

module.exports = {
  repairPdf
};
