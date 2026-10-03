const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
const PDFDocument = require('pdfkit');
const env = require('../config/env');
const { badRequest } = require('../utils/optionParser');
const { runCommand, checkCommandExists } = require('../utils/commandUtils');

const convertWordToPdf = async (inputPath, outputDir) => {
  const binary = env.libreofficePath;
  const isAvailable = await checkCommandExists(binary);
  const defaultWinPath = 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';

  if (isAvailable) {
    try {
      return await executeLibreOffice(binary, inputPath, outputDir);
    } catch (err) {
      console.warn('LibreOffice conversion failed, falling back to local JS engine:', err.message);
    }
  } else if (process.platform === 'win32' && fs.existsSync(defaultWinPath)) {
    try {
      return await executeLibreOffice(defaultWinPath, inputPath, outputDir);
    } catch (err) {
      console.warn('LibreOffice Windows fallback failed, using local JS engine:', err.message);
    }
  }

  return await convertLocally(inputPath, outputDir);
};

const convertLocally = async (inputPath, outputDir) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const expectedPdfPath = path.join(outputDir, `${baseName}.pdf`);

  let rawText;
  try {
    rawText = (await mammoth.extractRawText({ path: inputPath })).value || '';
  } catch (err) {
    // An upload this engine cannot read is a client-input problem, so it has to
    // reach the user as a 400 sentence instead of a 500 "please try again".
    // The write below keeps its 500: a failed write really is our fault.
    console.error('Word document could not be read:', err.message);
    throw badRequest('The Word document could not be read. It may be damaged, or it may not be a Word document at all.');
  }

  try {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(expectedPdfPath);

      doc.pipe(writeStream);

      const lines = rawText.split(/\r?\n/);
      doc.font('Helvetica').fontSize(11);

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.length > 0) {
          doc.text(trimmed, { align: 'left', lineGap: 4 });
        } else {
          doc.moveDown(0.5);
        }
      });

      doc.end();

      writeStream.on('finish', () => {
        resolve(expectedPdfPath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    });
  } catch (err) {
    console.error('Local Word to PDF conversion failed:', err.message);
    throw new Error('Failed to convert Word document to PDF format.');
  }
};

const executeLibreOffice = async (binary, inputPath, outputDir) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const expectedPdfPath = path.join(outputDir, `${baseName}.pdf`);

  const args = ['--headless', '--convert-to', 'pdf', '--outdir', outputDir, inputPath];

  await runCommand(binary, args, { timeout: 60000 });

  if (!fs.existsSync(expectedPdfPath)) {
    throw new Error('LibreOffice conversion output file missing.');
  }

  return expectedPdfPath;
};

module.exports = {
  convertWordToPdf
};
