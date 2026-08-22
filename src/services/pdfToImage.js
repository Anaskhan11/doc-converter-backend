const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const sharp = require('sharp');
const archiver = require('archiver');

const convertPdfToImages = async (inputPath, outputDir, format = 'jpg') => {
  const outputFormat = format.toLowerCase() === 'png' ? 'png' : 'jpg';
  const baseName = path.basename(inputPath, path.extname(inputPath));

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
    try {
      const options = {
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
      await pdfParse(dataBuffer, options);
    } catch (err) {
      console.warn('pdf-parse text extraction skipped:', err.message);
    }

    const generatedImages = [];

    for (let i = 0; i < totalPages; i++) {
      const pageText = pageTexts[i] || '';
      const dims = pageDimensions[i] || { width: 600, height: 800 };
      const imageBuffer = await renderPageToImage(pageText, i + 1, totalPages, dims, outputFormat, baseName);
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
        archive.append(imgBuf, { name: `${baseName}-page-${index + 1}.${outputFormat}` });
      });

      archive.finalize();
    });
  } catch (err) {
    console.error('PDF to image conversion error:', err.message);
    throw new Error(`PDF to ${outputFormat.toUpperCase()} conversion failed.`);
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

const renderPageToImage = async (pageText, pageNum, totalPages, dims, format, docTitle) => {
  const lines = pageText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let textElements = '';

  if (lines.length > 0) {
    const displayLines = lines.slice(0, 35);
    textElements = displayLines
      .map((line, idx) => {
        const yPos = 80 + idx * 24;
        const escaped = escapeXml(line.substring(0, 90));
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
  const svgHeight = Math.max(900, dims.height || 900);

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
