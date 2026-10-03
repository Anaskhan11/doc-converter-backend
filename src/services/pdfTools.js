const fs = require('fs');
const path = require('path');
const { PDFDocument, degrees } = require('pdf-lib');
const archiver = require('archiver');
const { parseNumericOption } = require('../utils/optionParser');
const { parsePageList } = require('../utils/pageRangeParser');
const { displayTitleOf } = require('../utils/fileUtils');
const { loadPdf } = require('./pdfExtraction');

const mergePdfs = async (inputPaths, outputDir) => {
  const mergedPdf = await PDFDocument.create();

  for (const inputPath of inputPaths) {
    const pdfBytes = await fs.promises.readFile(inputPath);
    const pdf = await loadPdf(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  const outputPath = path.join(outputDir, `merged-${Date.now()}.pdf`);
  await fs.promises.writeFile(outputPath, mergedPdfBytes);
  return outputPath;
};

const rotatePdf = async (inputPath, outputDir, angle) => {
  const pdfBytes = await fs.promises.readFile(inputPath);
  const pdfDoc = await loadPdf(pdfBytes);

  const pages = pdfDoc.getPages();
  const rotationAngle = parseNumericOption(angle, {
    name: 'Rotation angle',
    def: 90,
    integer: true,
    multipleOf: 90
  });

  pages.forEach((page) => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + rotationAngle) % 360));
  });

  const rotatedPdfBytes = await pdfDoc.save();
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-rotated.pdf`);
  await fs.promises.writeFile(outputPath, rotatedPdfBytes);
  return outputPath;
};

const compressPdf = async (inputPath, outputDir) => {
  const pdfBytes = await fs.promises.readFile(inputPath);
  const pdfDoc = await loadPdf(pdfBytes);

  const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-compressed.pdf`);
  await fs.promises.writeFile(outputPath, compressedPdfBytes);
  return outputPath;
};

const splitPdf = async (inputPath, outputDir, pagesRangeStr = '', originalName) => {
  const pdfBytes = await fs.promises.readFile(inputPath);
  const pdfDoc = await loadPdf(pdfBytes);
  const totalPages = pdfDoc.getPageCount();

  const targetIndices = parsePageList(pagesRangeStr, totalPages, {
    name: 'the pages to split',
    onEmpty: 'all'
  });

  const baseName = path.basename(inputPath, path.extname(inputPath));
  const entryName = displayTitleOf(originalName);

  if (targetIndices.length === 1) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [targetIndices[0]]);
    newPdf.addPage(copiedPage);
    const newPdfBytes = await newPdf.save();
    const outputPath = path.join(outputDir, `${baseName}-page-${targetIndices[0] + 1}.pdf`);
    await fs.promises.writeFile(outputPath, newPdfBytes);
    return outputPath;
  }

  const zipPath = path.join(outputDir, `${baseName}-split.zip`);
  const outputStream = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise(async (resolve, reject) => {
    outputStream.on('close', () => resolve(zipPath));
    archive.on('error', (err) => reject(err));
    archive.pipe(outputStream);

    for (const index of targetIndices) {
      const singlePdf = await PDFDocument.create();
      const [copiedPage] = await singlePdf.copyPages(pdfDoc, [index]);
      singlePdf.addPage(copiedPage);
      const bytes = await singlePdf.save();
      archive.append(Buffer.from(bytes), { name: `${entryName}-page-${index + 1}.pdf` });
    }

    archive.finalize();
  });
};

module.exports = {
  mergePdfs,
  rotatePdf,
  compressPdf,
  splitPdf
};
