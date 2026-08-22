const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');

const parseIndices = (str, totalPages) => {
  const indices = [];
  if (!str || !str.trim()) return indices;

  const parts = str.split(',');
  parts.forEach((part) => {
    const p = part.trim();
    if (p.includes('-')) {
      const [startStr, endStr] = p.split('-');
      const start = Math.max(1, parseInt(startStr, 10) || 1);
      const end = Math.min(totalPages, parseInt(endStr, 10) || totalPages);
      for (let i = start; i <= end; i++) {
        indices.push(i - 1);
      }
    } else {
      const num = parseInt(p, 10);
      if (num >= 1 && num <= totalPages) {
        indices.push(num - 1);
      }
    }
  });
  return indices;
};

const extractPdfPages = async (inputPath, outputDir, pagesRangeStr) => {
  const pdfBytes = await fs.promises.readFile(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const totalPages = pdfDoc.getPageCount();

  let indices = parseIndices(pagesRangeStr, totalPages);
  if (indices.length === 0) {
    for (let i = 0; i < totalPages; i++) indices.push(i);
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, indices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const newPdfBytes = await newPdf.save();
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-extracted.pdf`);
  await fs.promises.writeFile(outputPath, newPdfBytes);
  return outputPath;
};

const deletePdfPages = async (inputPath, outputDir, pagesToDeleteStr) => {
  const pdfBytes = await fs.promises.readFile(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const totalPages = pdfDoc.getPageCount();

  const deleteSet = new Set(parseIndices(pagesToDeleteStr, totalPages));
  const keepIndices = [];
  for (let i = 0; i < totalPages; i++) {
    if (!deleteSet.has(i)) {
      keepIndices.push(i);
    }
  }

  if (keepIndices.length === 0) {
    throw new Error('Cannot delete all pages. At least one page must remain.');
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, keepIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const newPdfBytes = await newPdf.save();
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-modified.pdf`);
  await fs.promises.writeFile(outputPath, newPdfBytes);
  return outputPath;
};

const reorderPdfPages = async (inputPath, outputDir, newOrderStr) => {
  const pdfBytes = await fs.promises.readFile(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const totalPages = pdfDoc.getPageCount();

  let indices = parseIndices(newOrderStr, totalPages);
  if (indices.length === 0) {
    throw new Error('Please specify a valid page order sequence (e.g., 3, 1, 2).');
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, indices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const newPdfBytes = await newPdf.save();
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-reordered.pdf`);
  await fs.promises.writeFile(outputPath, newPdfBytes);
  return outputPath;
};

const watermarkPdf = async (inputPath, outputDir, text = 'CONFIDENTIAL', opacityVal = 0.25) => {
  const pdfBytes = await fs.promises.readFile(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();
  const watermarkText = text && text.trim() ? text.trim() : 'CONFIDENTIAL';
  const opacity = parseFloat(opacityVal) || 0.25;

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) / 8;
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(watermarkText, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      size: fontSize,
      font,
      color: rgb(0.7, 0.7, 0.7),
      opacity,
      rotate: degrees(45)
    });
  });

  const pdfWithWatermarkBytes = await pdfDoc.save();
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-watermarked.pdf`);
  await fs.promises.writeFile(outputPath, pdfWithWatermarkBytes);
  return outputPath;
};

const addPageNumbers = async (inputPath, outputDir) => {
  const pdfBytes = await fs.promises.readFile(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  pages.forEach((page, index) => {
    const { width } = page.getSize();
    const pageNumText = `Page ${index + 1} of ${totalPages}`;
    const fontSize = 10;
    const textWidth = font.widthOfTextAtSize(pageNumText, fontSize);

    page.drawText(pageNumText, {
      x: width / 2 - textWidth / 2,
      y: 25,
      size: fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3)
    });
  });

  const pdfWithNumbersBytes = await pdfDoc.save();
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-numbered.pdf`);
  await fs.promises.writeFile(outputPath, pdfWithNumbersBytes);
  return outputPath;
};

const protectPdf = async (inputPath, outputDir, userPassword = 'password123') => {
  const pdfBytes = await fs.promises.readFile(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const password = userPassword && userPassword.trim() ? userPassword.trim() : 'password123';
  const protectedBytes = await pdfDoc.save({
    userPassword: password,
    ownerPassword: password
  });

  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-protected.pdf`);
  await fs.promises.writeFile(outputPath, protectedBytes);
  return outputPath;
};

module.exports = {
  extractPdfPages,
  deletePdfPages,
  reorderPdfPages,
  watermarkPdf,
  addPageNumbers,
  protectPdf
};
