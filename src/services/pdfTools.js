const fs = require('fs');
const path = require('path');
const { PDFDocument, degrees } = require('pdf-lib');
const archiver = require('archiver');

const mergePdfs = async (inputPaths, outputDir) => {
  const mergedPdf = await PDFDocument.create();

  for (const inputPath of inputPaths) {
    const pdfBytes = await fs.promises.readFile(inputPath);
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  const outputPath = path.join(outputDir, `merged-${Date.now()}.pdf`);
  await fs.promises.writeFile(outputPath, mergedPdfBytes);
  return outputPath;
};

const rotatePdf = async (inputPath, outputDir, angle = 90) => {
  const pdfBytes = await fs.promises.readFile(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const pages = pdfDoc.getPages();
  const rotationAngle = parseInt(angle, 10) || 90;

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
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-compressed.pdf`);
  await fs.promises.writeFile(outputPath, compressedPdfBytes);
  return outputPath;
};

const splitPdf = async (inputPath, outputDir, pagesRangeStr = '') => {
  const pdfBytes = await fs.promises.readFile(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const totalPages = pdfDoc.getPageCount();

  let targetIndices = [];
  if (pagesRangeStr && pagesRangeStr.trim().length > 0) {
    targetIndices = parsePageRanges(pagesRangeStr, totalPages);
  } else {
    for (let i = 0; i < totalPages; i++) {
      targetIndices.push(i);
    }
  }

  if (targetIndices.length === 0) {
    throw new Error('Invalid page range specified.');
  }

  const baseName = path.basename(inputPath, path.extname(inputPath));

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
      archive.append(Buffer.from(bytes), { name: `${baseName}-page-${index + 1}.pdf` });
    }

    archive.finalize();
  });
};

const parsePageRanges = (rangeStr, totalPages) => {
  const indices = new Set();
  const parts = rangeStr.split(',');

  parts.forEach((part) => {
    const p = part.trim();
    if (p.includes('-')) {
      const [startStr, endStr] = p.split('-');
      const start = Math.max(1, parseInt(startStr, 10) || 1);
      const end = Math.min(totalPages, parseInt(endStr, 10) || totalPages);
      for (let i = start; i <= end; i++) {
        indices.add(i - 1);
      }
    } else {
      const num = parseInt(p, 10);
      if (num >= 1 && num <= totalPages) {
        indices.add(num - 1);
      }
    }
  });

  return Array.from(indices).sort((a, b) => a - b);
};

module.exports = {
  mergePdfs,
  rotatePdf,
  compressPdf,
  splitPdf
};
