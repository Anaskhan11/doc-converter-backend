const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');
const { parseNumericOption, badRequest } = require('../utils/optionParser');
const { parsePageList } = require('../utils/pageRangeParser');
const { loadPdf } = require('./pdfExtraction');

const reorderHint = (totalPages) => {
  const reverseExample = [];
  for (let i = totalPages; i >= 1; i--) reverseExample.push(i);
  return `List all ${totalPages} page${totalPages === 1 ? '' : 's'} exactly once, in the order you want them (e.g. ${reverseExample.join(', ')}).`;
};

const extractPdfPages = async (inputPath, outputDir, pagesRangeStr) => {
  const pdfBytes = await fs.promises.readFile(inputPath);
  const pdfDoc = await loadPdf(pdfBytes);
  const totalPages = pdfDoc.getPageCount();

  const indices = parsePageList(pagesRangeStr, totalPages, { name: 'the pages to extract' });

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
  const pdfDoc = await loadPdf(pdfBytes);
  const totalPages = pdfDoc.getPageCount();

  const deleteSet = new Set(parsePageList(pagesToDeleteStr, totalPages, { name: 'the pages to delete' }));
  const keepIndices = [];
  for (let i = 0; i < totalPages; i++) {
    if (!deleteSet.has(i)) {
      keepIndices.push(i);
    }
  }

  if (keepIndices.length === 0) {
    throw badRequest('That would delete every page, leaving an empty document. Leave at least one page out of the list.');
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

// Reordering rewrites the whole document, so a page left out of the list is
// deleted with no warning. The shared parser already rejects unreadable tokens,
// out-of-bounds pages and duplicates, so all that is left to check is that every
// page is named exactly once.
const validateReorderIndices = (indices, totalPages) => {
  const missing = [];
  for (let i = 0; i < totalPages; i++) {
    if (!indices.includes(i)) missing.push(i + 1);
  }
  if (missing.length > 0) {
    throw badRequest(
      `Page${missing.length > 1 ? 's' : ''} ${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} missing from the order, so ${missing.length > 1 ? 'they would be' : 'it would be'} deleted from the result. ${reorderHint(totalPages)}`
    );
  }
};

const reorderPdfPages = async (inputPath, outputDir, newOrderStr) => {
  const pdfBytes = await fs.promises.readFile(inputPath);
  const pdfDoc = await loadPdf(pdfBytes);
  const totalPages = pdfDoc.getPageCount();

  const indices = parsePageList(newOrderStr, totalPages, { name: 'the new page order', hint: reorderHint(totalPages) });
  validateReorderIndices(indices, totalPages);

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, indices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const newPdfBytes = await newPdf.save();
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-reordered.pdf`);
  await fs.promises.writeFile(outputPath, newPdfBytes);
  return outputPath;
};

const watermarkPdf = async (inputPath, outputDir, text = 'CONFIDENTIAL', opacityVal) => {
  const pdfBytes = await fs.promises.readFile(inputPath);
  const pdfDoc = await loadPdf(pdfBytes);

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();
  const watermarkText = text && text.trim() ? text.trim() : 'CONFIDENTIAL';
  const opacity = parseNumericOption(opacityVal, { name: 'Watermark opacity', def: 0.25, min: 0, max: 1 });

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
  const pdfDoc = await loadPdf(pdfBytes);

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

// pdf-lib's save() accepts only {useObjectStreams, addDefaultPage, objectsPerPage,
// objectsPerTick}; the userPassword/ownerPassword it used to be passed here were
// ignored, so the endpoint wrote an UNENCRYPTED file and reported success. Real
// encryption needs a real engine (qpdf/Ghostscript), neither of which is installed.
// Until one is wired in, refuse instead of handing back a document the user
// believes is password-protected.
const protectPdf = async () => {
  const err = new Error(
    'Password protection is not available in this build, so your file was not changed. Encrypting a PDF needs an engine this server does not have (qpdf or Ghostscript).'
  );
  err.statusCode = 501;
  throw err;
};

module.exports = {
  extractPdfPages,
  deletePdfPages,
  reorderPdfPages,
  watermarkPdf,
  addPageNumbers,
  protectPdf
};
