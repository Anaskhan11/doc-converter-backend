const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { extractPdfText: pdfParse, PdfExtractionError } = require('./pdfExtraction');
const sharp = require('sharp');
const archiver = require('archiver');
const { displayTitleOf } = require('../utils/fileUtils');

const convertPdfToImages = async (inputPath, outputDir, format = 'jpg', originalName) => {
  const outputFormat = format.toLowerCase() === 'png' ? 'png' : 'jpg';
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const docTitle = displayTitleOf(originalName);

  try {
    const dataBuffer = await fs.promises.readFile(inputPath);

    let totalPages = 1;
    let pageDimensions = [];
    try {
      const pdfDoc = await PDFDocument.load(dataBuffer, { ignoreEncryption: true });
      totalPages = pdfDoc.getPageCount();
      for (let i = 0; i < totalPages; i++) {
        const p = pdfDoc.getPage(i);
        const { width, height } = p.getSize();
        pageDimensions.push({ width: Math.round(width || 600), height: Math.round(height || 800) });
      }
    } catch (err) {
      console.warn('pdf-lib dimension check warning:', err.message);
    }

    const pageTexts = [];
    const options = {
      beforeAttempt: () => {
        pageTexts.length = 0;
      },
      pagerender: (pageData) => {
        return pageData.getTextContent().then((textContent) => {
          let lastY = null;
          let text = '';
          for (const item of textContent.items) {
            if (lastY !== item.transform[5] && lastY !== null) {
              text += '\n';
            }
            text += item.str + ' ';
            lastY = item.transform[5];
          }
          pageTexts.push(text);
          return text;
        });
      }
    };
    // An extraction failure used to be warned about and skipped, which let the
    // endpoint return a ZIP of textless images as a success. Let it propagate.
    await pdfParse(dataBuffer, options);

    const generatedImages = [];

    for (let i = 0; i < totalPages; i++) {
      const pageText = pageTexts[i] || '';
      const dims = pageDimensions[i] || { width: 600, height: 800 };
      const imageBuffer = await renderPageToImage(pageText, i + 1, totalPages, dims, outputFormat, docTitle);
      generatedImages.push(imageBuffer);
    }

    if (generatedImages.length === 1) {
      const singleImagePath = path.join(outputDir, `${baseName}.${outputFormat}`);
      await fs.promises.writeFile(singleImagePath, generatedImages[0]);
      return singleImagePath;
    }

    const zipPath = path.join(outputDir, `${baseName}-images.zip`);
    const outputStream = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      outputStream.on('close', () => resolve(zipPath));
      archive.on('error', (err) => reject(err));
      archive.pipe(outputStream);

      generatedImages.forEach((imgBuf, index) => {
        archive.append(imgBuf, { name: `${docTitle}-page-${index + 1}.${outputFormat}` });
      });

      archive.finalize();
    });
  } catch (err) {
    console.error('PDF to image conversion error:', err.message);
    throw err instanceof PdfExtractionError ? err : new Error(`PDF to ${outputFormat.toUpperCase()} conversion failed.`);
  }
};

const escapeXml = (str) =>
  String(str || '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// Wraps a line to roughly the canvas width at font-size 15. Used to replace the
// old clip: nothing here throws text away, long lines continue on the next row.
const wrapSvgLine = (line, maxChars) => {
  const rows = [];
  let current = '';
  for (const word of line.split(/\s+/).filter(Boolean)) {
    if (word.length > maxChars) {
      if (current) { rows.push(current); current = ''; }
      for (let i = 0; i < word.length; i += maxChars) rows.push(word.slice(i, i + maxChars));
      continue;
    }
    if (current && `${current} ${word}`.length > maxChars) {
      rows.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) rows.push(current);
  return rows.length ? rows : [''];
};

const renderPageToImage = async (pageText, pageNum, totalPages, dims, format, docTitle) => {
  const lines = pageText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let textElements = '';
  let renderedRows = 0;

  if (lines.length > 0) {
    const rows = [];
    for (const line of lines) rows.push(...wrapSvgLine(line, 90));
    renderedRows = rows.length;
    textElements = rows
      .map((line, idx) => {
        const yPos = 80 + idx * 24;
        const escaped = escapeXml(line);
        return `<text x="50" y="${yPos}" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="#1e293b">${escaped}</text>`;
      })
      .join('\n');
  } else {
    textElements = `
      <text x="400" y="380" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#0f172a" text-anchor="middle">${escapeXml(docTitle)}</text>
      <text x="400" y="420" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#64748b" text-anchor="middle">Page ${pageNum} of ${totalPages}</text>
      <rect x="50" y="60" width="700" height="700" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="8 8" rx="12"/>
    `;
  }

  const svgWidth = Math.max(800, dims.width || 800);
  // The canvas grows to hold every wrapped row; the previous fixed 900px height is
  // what made a cap on the line count look harmless.
  const neededHeight = renderedRows > 0 ? 80 + renderedRows * 24 + 40 : 900;
  const svgHeight = Math.max(900, dims.height || 0, neededHeight);

  const svgString = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <line x1="50" y1="45" x2="${svgWidth - 50}" y2="45" stroke="#e2e8f0" stroke-width="1"/>
    ${textElements}
    <text x="${svgWidth - 50}" y="30" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="bold" fill="#64748b" text-anchor="end">Page ${pageNum} of ${totalPages}</text>
  </svg>`;

  let buffer = Buffer.from(svgString);

  if (format === 'jpg') {
    buffer = await sharp(buffer).jpeg({ quality: 95 }).toBuffer();
  } else {
    buffer = await sharp(buffer).png().toBuffer();
  }

  return buffer;
};

module.exports = {
  convertPdfToImages
};
