const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const { badRequest } = require('../utils/optionParser');

// displayNames is the user's own filename per input, index-aligned with inputPaths.
// The stored path is an opaque "files-<ts>-<uuid>.png", so without it a refusal
// could not tell the user which of their images to replace.
const convertImagesToPdf = async (inputPaths, outputDir, displayNames = []) => {
  const pdfDoc = await PDFDocument.create();
  let embedded = 0;
  const unreadable = [];

  for (let i = 0; i < inputPaths.length; i++) {
    const inputPath = inputPaths[i];
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
      embedded += 1;
    } catch (err) {
      unreadable.push(displayNames[i] || path.basename(inputPath));
      console.error(`Failed to embed image ${inputPath} into PDF:`, err.message);
    }
  }

  // A PNG with the right signature but a broken body used to answer 200 with a
  // one-page, zero-image PDF -- a successful-looking artifact that contained
  // none of what was sent.
  if (embedded === 0) {
    throw badRequest(
      inputPaths.length > 1
        ? `None of the ${inputPaths.length} images you sent could be read, so no PDF was created.`
        : 'That image could not be read, so no PDF was created. Please check the file and try again.'
    );
  }
  /* Skipping a failed image and carrying on produced a PDF with fewer pages than
     there were inputs, and the only evidence was a console.warn on the server --
     the same silent-loss family as the truncation caps. A success here is a binary
     download (sendFileAndCleanup), so there is no response slot to attach "N files
     were dropped" to without changing this route's contract; refusing the batch and
     naming the files is the honest option available. */
  if (unreadable.length > 0) {
    throw badRequest(
      `${unreadable.length} of the ${inputPaths.length} images you sent could not be read (${unreadable
        .map((n) => `"${n}"`)
        .join(', ')}), so no PDF was created. Please replace ${unreadable.length === 1 ? 'it' : 'them'} and try again.`
    );
  }

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(outputDir, `converted-${Date.now()}.pdf`);
  await fs.promises.writeFile(outputPath, pdfBytes);
  return outputPath;
};

module.exports = {
  convertImagesToPdf
};
