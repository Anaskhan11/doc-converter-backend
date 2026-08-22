const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const PDFDocument = require('pdfkit');
const Diff = require('diff');

const comparePdfs = async (inputPath1, inputPath2, outputDir) => {
  const outputPath = path.join(outputDir, `pdf-comparison-${Date.now()}.pdf`);

  try {
    const buf1 = await fs.promises.readFile(inputPath1);
    const buf2 = await fs.promises.readFile(inputPath2);

    const pdf1Data = await pdfParse(buf1);
    const pdf2Data = await pdfParse(buf2);

    const text1 = pdf1Data.text || '';
    const text2 = pdf2Data.text || '';

    const diffResult = Diff.diffLines(text1, text2);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40 });
      const writeStream = fs.createWriteStream(outputPath);

      doc.pipe(writeStream);

      doc.font('Helvetica-Bold').fontSize(16).text('PDF Document Comparison Report', { align: 'center' });
      doc.moveDown(1);

      doc.font('Helvetica').fontSize(10);

      diffResult.forEach((part) => {
        const color = part.added ? '#15803d' : part.removed ? '#b91c1c' : '#334155';
        const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';

        if (part.added || part.removed) {
          doc.fillColor(color).font('Helvetica-Bold');
        } else {
          doc.fillColor(color).font('Helvetica');
        }

        const lines = part.value.split(/\r?\n/).filter((l) => l.length > 0);
        lines.forEach((line) => {
          doc.text(`${prefix}${line.substring(0, 100)}`, { lineGap: 2 });
        });
      });

      doc.end();

      writeStream.on('finish', () => resolve(outputPath));
      writeStream.on('error', (err) => reject(err));
    });
  } catch (err) {
    console.error('PDF Compare Service Error:', err.message);
    throw new Error('Failed to compare PDF documents.');
  }
};

module.exports = {
  comparePdfs
};
