const path = require('path');
const fs = require('fs');
const { rgb, StandardFonts } = require('pdf-lib');
const { parseNumericOption, badRequest } = require('../utils/optionParser');
const { loadPdf } = require('./pdfExtraction');

const signPdf = async (inputPath, outputDir, signerName = 'Digitally Signed') => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-signed.pdf`);

  try {
    const dataBuffer = await fs.promises.readFile(inputPath);
    const pdfDoc = await loadPdf(dataBuffer);
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
    if (err && err.statusCode) throw err;
    console.error('Sign PDF Service Error:', err.message);
    throw new Error('Failed to sign PDF document.');
  }
};

// The previous version drew one black rectangle at a fixed position on every
// page and never looked at redactText, so the "redacted" document still
// contained every character of the original in its text layer while the page
// promised a permanent blackout. Real redaction means deleting the text
// operators from the page content stream, which pdf-lib cannot do.
// Refuse rather than hand back a document the user believes is scrubbed.
const redactPdf = async () => {
  const err = new Error(
    'Redaction is not available in this build, so your file was not changed. Covering text with a black box leaves the original words selectable and extractable; removing them needs an engine this server does not have (qpdf or Ghostscript).'
  );
  err.statusCode = 501;
  throw err;
};

const cropPdf = async (inputPath, outputDir, cropMargin) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-cropped.pdf`);

  // Read the option before the try: the catch below rewrites every failure
  // into a generic 500, and "crop margin must be a number" is a client error.
  const margin = parseNumericOption(cropMargin, { name: 'Crop margin', def: 20, min: 0, max: 100 });

  try {
    const dataBuffer = await fs.promises.readFile(inputPath);
    const pdfDoc = await loadPdf(dataBuffer);

    const pages = pdfDoc.getPages();

    const sizes = pages.map((page) => page.getSize());
    const overflowing = [];
    let largestSafeMargin = null;
    sizes.forEach((size, index) => {
      const allowed = Math.floor((Math.min(size.width, size.height) - 1) / 2);
      if (largestSafeMargin === null || allowed < largestSafeMargin) largestSafeMargin = allowed;
      if (size.width - margin * 2 < 1 || size.height - margin * 2 < 1) {
        overflowing.push(`page ${index + 1} (${Math.round(size.width)}x${Math.round(size.height)} pt)`);
      }
    });
    if (overflowing.length > 0) {
      const list = overflowing.slice(0, 3).join(', ');
      throw badRequest(
        `A ${margin} pt crop margin leaves nothing of ${list}${overflowing.length > 3 ? ` and ${overflowing.length - 3} other page(s)` : ''}. The largest margin every page in this document can take is ${largestSafeMargin} pt.`
      );
    }

    sizes.forEach((size, index) => {
      const croppedWidth = size.width - margin * 2;
      const croppedHeight = size.height - margin * 2;
      // /MediaBox has to move with /CropBox: Chrome's viewer, Preview and most
      // print pipelines read /MediaBox, so a CropBox-only edit left the page
      // measuring its original size everywhere the crop was supposed to show.
      pages[index].setMediaBox(margin, margin, croppedWidth, croppedHeight);
      pages[index].setCropBox(margin, margin, croppedWidth, croppedHeight);
    });

    const croppedBytes = await pdfDoc.save();
    await fs.promises.writeFile(outputPath, croppedBytes);
    return outputPath;
  } catch (err) {
    if (err && err.statusCode) throw err;
    console.error('Crop PDF Service Error:', err.message);
    throw new Error('Failed to crop PDF document.');
  }
};

const editPdf = async (inputPath, outputDir, annotationText = 'Edited Document Note') => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}-edited.pdf`);

  try {
    const dataBuffer = await fs.promises.readFile(inputPath);
    const pdfDoc = await loadPdf(dataBuffer);
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
    if (err && err.statusCode) throw err;
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
