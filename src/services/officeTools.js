const path = require('path');
const fs = require('fs');
const { extractPdfText: pdfParse } = require('./pdfExtraction');
const ExcelJS = require('exceljs');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const PptxGenJS = require('pptxgenjs');
const env = require('../config/env');
const { displayTitleOf } = require('../utils/fileUtils');
const { noTextLayerError } = require('../utils/optionParser');
const { runCommand, checkCommandExists } = require('../utils/commandUtils');

const convertPdfToExcel = async (inputPath, outputDir) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}.xlsx`);

  const dataBuffer = await fs.promises.readFile(inputPath);
  const pdfData = await pdfParse(dataBuffer);
  const rawText = pdfData.text || '';

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Extracted Sheet');

  const lines = rawText.split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.length > 0) {
      const columns = trimmed.split(/\s{2,}|\t/);
      worksheet.addRow(columns);
    }
  });

  if (worksheet.rowCount === 0) {
    // Seed rows ("Extracted Content" / "Document Text") used to be written here,
    // so an empty extraction came back as a spreadsheet that looked like output.
    throw noTextLayerError();
  }

  await workbook.xlsx.writeFile(outputPath);
  return outputPath;
};

const convertExcelToPdf = async (inputPath, outputDir, originalName) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}.pdf`);
  const title = displayTitleOf(originalName);

  let workbook;
  try {
    workbook = XLSX.readFile(inputPath);
  } catch (err) {
    /* SheetJS throws a bare Error for a damaged or not-really-a-spreadsheet upload,
       and a bare Error carries no statusCode, so the handler rendered it as a 500
       "Something went wrong... Please try again" - which promises a retry helps. This
       is an input problem, and wordToPdf.js words the same refusal the same way. */
    console.error('Excel read failed:', err.message);
    const unreadable = new Error('The spreadsheet could not be read. It may be damaged, or it may not be a spreadsheet at all.');
    unreadable.statusCode = 400;
    throw unreadable;
  }
  const sheetNames = workbook.SheetNames;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    doc.font('Helvetica-Bold').fontSize(16).text(title, { align: 'center' });
    doc.moveDown(1);

    sheetNames.forEach((sheetName, index) => {
      if (index > 0) doc.addPage();
      doc.font('Helvetica-Bold').fontSize(13).text(`Sheet: ${sheetName}`, { underline: true });
      doc.moveDown(0.5);

      const worksheet = workbook.Sheets[sheetName];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      doc.font('Helvetica').fontSize(10);
      jsonRows.forEach((row) => {
        if (Array.isArray(row) && row.length > 0) {
          const rowText = row.map((cell) => (cell !== undefined && cell !== null ? String(cell) : '')).join('  |  ');
          if (rowText.trim().length > 0) {
            // pdfkit already wraps to the page width and paginates, so the old
            // 120-char clip threw away the tail of every long row.
            doc.text(rowText, { lineGap: 3 });
          }
        }
      });
    });

    doc.end();

    writeStream.on('finish', () => resolve(outputPath));
    writeStream.on('error', (err) => reject(err));
  });
};

const convertPdfToPowerPoint = async (inputPath, outputDir) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}.pptx`);

  const dataBuffer = await fs.promises.readFile(inputPath);
  const pdfData = await pdfParse(dataBuffer);
  const pages = pdfData.pages;

  // A deck where every slide reads "Document content extracted from PDF page." is
  // not a conversion, it is a claim about a document that yielded nothing.
  if (pages.every((p) => !p || p.trim().length === 0)) throw noTextLayerError();

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  pages.forEach((pageText, idx) => {
    const slide = pptx.addSlide();
    slide.addText(`Slide ${idx + 1}`, { x: 0.5, y: 0.5, w: 9, h: 0.8, fontSize: 24, bold: true, color: '0F172A' });

    const lines = pageText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    // Every line of the page goes on the slide. The old slice(0, 15) deleted the
    // rest of the page silently; `fit: 'shrink'` asks the viewer to reduce the
    // font size instead of dropping text.
    const content = lines.join('\n');

    slide.addText(content || '(No extractable text on this page.)', {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 5.0,
      fontSize: 14,
      color: '334155',
      valign: 'top',
      fit: 'shrink'
    });
  });

  await pptx.writeFile({ fileName: outputPath });
  return outputPath;
};

const convertPowerPointToPdf = async (inputPath, outputDir) => {
  const binary = env.libreofficePath;
  const isAvailable = await checkCommandExists(binary);
  const defaultWinPath = 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';

  if (isAvailable) {
    try {
      return await executeLibreOffice(binary, inputPath, outputDir);
    } catch (err) {
      console.warn('LibreOffice PPTX conversion failed, refusing instead of faking a PDF:', err.message);
    }
  } else if (process.platform === 'win32' && fs.existsSync(defaultWinPath)) {
    try {
      return await executeLibreOffice(defaultWinPath, inputPath, outputDir);
    } catch (err) {
      console.warn('LibreOffice Windows PPTX conversion failed, refusing:', err.message);
    }
  }

  /* The old fallback never opened inputPath: it drew the filename plus
     "Presentation converted to PDF format." and returned 200, so a real 2-slide
     deck came back as a 1-page PDF containing none of it. Refusing is the only
     honest option without a pptx reader, and matches protect/redact/unlock. */
  const unsupported = new Error(
    'This server has no PowerPoint engine (LibreOffice), so it cannot render your slides. Nothing was produced rather than a placeholder page that leaves out your content.'
  );
  unsupported.statusCode = 501;
  throw unsupported;
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
  convertPdfToExcel,
  convertExcelToPdf,
  convertPdfToPowerPoint,
  convertPowerPointToPdf
};
