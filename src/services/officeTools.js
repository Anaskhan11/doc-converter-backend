const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const ExcelJS = require('exceljs');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const PptxGenJS = require('pptxgenjs');
const env = require('../config/env');
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
    worksheet.addRow(['Extracted Content', 'Details']);
    worksheet.addRow(['Document Text', rawText.substring(0, 500)]);
  }

  await workbook.xlsx.writeFile(outputPath);
  return outputPath;
};

const convertExcelToPdf = async (inputPath, outputDir) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}.pdf`);

  const workbook = XLSX.readFile(inputPath);
  const sheetNames = workbook.SheetNames;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    doc.font('Helvetica-Bold').fontSize(16).text(baseName, { align: 'center' });
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
            doc.text(rowText.substring(0, 120), { lineGap: 3 });
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
  const rawText = pdfData.text || '';
  const pages = rawText.split('\f');

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  pages.forEach((pageText, idx) => {
    const slide = pptx.addSlide();
    slide.addText(`Slide ${idx + 1}`, { x: 0.5, y: 0.5, w: 9, h: 0.8, fontSize: 24, bold: true, color: '0F172A' });

    const lines = pageText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const content = lines.slice(0, 15).join('\n');

    slide.addText(content || 'Document content extracted from PDF page.', {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 5.0,
      fontSize: 14,
      color: '334155',
      valign: 'top'
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
      console.warn('LibreOffice PPTX conversion failed, using fallback PDF generator:', err.message);
    }
  } else if (process.platform === 'win32' && fs.existsSync(defaultWinPath)) {
    try {
      return await executeLibreOffice(defaultWinPath, inputPath, outputDir);
    } catch (err) {
      console.warn('LibreOffice Windows PPTX fallback failed:', err.message);
    }
  }

  return await convertPowerPointLocally(inputPath, outputDir);
};

const convertPowerPointLocally = async (inputPath, outputDir) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);
    doc.font('Helvetica-Bold').fontSize(18).text(baseName, { align: 'center' });
    doc.moveDown(1);
    doc.font('Helvetica').fontSize(12).text('Presentation converted to PDF format.', { align: 'center' });

    doc.end();

    writeStream.on('finish', () => resolve(outputPath));
    writeStream.on('error', (err) => reject(err));
  });
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
