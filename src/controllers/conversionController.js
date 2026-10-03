const path = require('path');
const env = require('../config/env');
const { convertPdfToWord } = require('../services/pdfToWord');
const { convertWordToPdf } = require('../services/wordToPdf');
const { convertPdfToImages } = require('../services/pdfToImage');
const { convertImagesToPdf } = require('../services/imageToPdf');
const { mergePdfs, rotatePdf, compressPdf, splitPdf } = require('../services/pdfTools');
const {
  extractPdfPages,
  deletePdfPages,
  reorderPdfPages,
  watermarkPdf,
  addPageNumbers,
  protectPdf
} = require('../services/pdfAdvancedTools');
const {
  convertPdfToExcel,
  convertExcelToPdf,
  convertPdfToPowerPoint,
  convertPowerPointToPdf
} = require('../services/officeTools');
const { performOcrOnPdf } = require('../services/ocrService');
const { repairPdf } = require('../services/pdfRepairService');
const { unlockPdf } = require('../services/pdfSecurityService');
const { signPdf, redactPdf, cropPdf, editPdf } = require('../services/pdfEditorService');
const { comparePdfs } = require('../services/pdfDiffService');
const { convertPdfToText, convertPdfToMarkdown } = require('../services/textMarkdownService');
const { deleteFileSilently } = require('../utils/fileUtils');

/* A download name is user-supplied text, so it has to survive two things: the
   quoted-string grammar (a `"` in the original filename used to terminate the
   early and mangle the header) and non-ASCII bytes (which arrived as mojibake).
   The plain `filename` keeps a folded ASCII fallback for old clients and the
   RFC 5987 `filename*` carries the true name; 6266 says prefer the later one. */
const dispositionName = (name) => {
  const clean = String(name || 'document').replace(/["\\]/g, '').replace(/[\r\n]+/g, ' ');
  const folded = clean
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^ -~]/g, '_')
    .trim() || 'document';
  const extValue = encodeURIComponent(clean).replace(
    /[!'()*]/g,
    (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`
  );
  return `attachment; filename="${folded}"; filename*=UTF-8''${extValue}`;
};

const sendFileAndCleanup = (res, outputPath, downloadName, contentType, inputFiles = [], next) => {
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', dispositionName(downloadName));
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

  res.sendFile(outputPath, (err) => {
    inputFiles.forEach((file) => deleteFileSilently(file));
    deleteFileSilently(outputPath);
    if (err && !res.headersSent) {
      next(err);
    }
  });
};

const convertPdfToWordController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await convertPdfToWord(inputPath, env.convertedDir);
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}.docx`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const convertWordToPdfController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a Word document.' });
    outputPath = await convertWordToPdf(inputPath, env.convertedDir);
    const downloadName = `${path.basename(req.file.originalname, '.docx')}.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const convertPdfToJpgController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await convertPdfToImages(inputPath, env.convertedDir, 'jpg', req.file.originalname);
    const isZip = outputPath.endsWith('.zip');
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-jpg${isZip ? '.zip' : '.jpg'}`;
    sendFileAndCleanup(res, outputPath, downloadName, isZip ? 'application/zip' : 'image/jpeg', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const convertPdfToPngController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await convertPdfToImages(inputPath, env.convertedDir, 'png', req.file.originalname);
    const isZip = outputPath.endsWith('.zip');
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-png${isZip ? '.zip' : '.png'}`;
    sendFileAndCleanup(res, outputPath, downloadName, isZip ? 'application/zip' : 'image/png', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const convertJpgToPdfController = async (req, res, next) => {
  const inputFiles = req.files ? req.files.map((f) => f.path) : [];
  let outputPath = null;
  try {
    if (inputFiles.length === 0) return res.status(400).json({ success: false, message: 'Please select JPG images.' });
    outputPath = await convertImagesToPdf(inputFiles, env.convertedDir, req.files.map((f) => f.originalname));
    sendFileAndCleanup(res, outputPath, 'images-converted.pdf', 'application/pdf', inputFiles, next);
  } catch (err) {
    inputFiles.forEach((f) => deleteFileSilently(f));
    deleteFileSilently(outputPath);
    next(err);
  }
};

const convertPngToPdfController = async (req, res, next) => {
  const inputFiles = req.files ? req.files.map((f) => f.path) : [];
  let outputPath = null;
  try {
    if (inputFiles.length === 0) return res.status(400).json({ success: false, message: 'Please select PNG images.' });
    outputPath = await convertImagesToPdf(inputFiles, env.convertedDir, req.files.map((f) => f.originalname));
    sendFileAndCleanup(res, outputPath, 'images-converted.pdf', 'application/pdf', inputFiles, next);
  } catch (err) {
    inputFiles.forEach((f) => deleteFileSilently(f));
    deleteFileSilently(outputPath);
    next(err);
  }
};

const mergePdfController = async (req, res, next) => {
  const inputFiles = req.files ? req.files.map((f) => f.path) : [];
  let outputPath = null;
  try {
    if (inputFiles.length < 2) {
      // multer has already written the upload, and returning from inside the try
      // skips the cleanup in the catch below, so a one-file merge attempt stranded
      // that upload in uploads/ forever.
      inputFiles.forEach((f) => deleteFileSilently(f));
      return res.status(400).json({ success: false, message: 'Please select at least 2 PDF files to merge.' });
    }
    outputPath = await mergePdfs(inputFiles, env.convertedDir);
    sendFileAndCleanup(res, outputPath, 'merged-document.pdf', 'application/pdf', inputFiles, next);
  } catch (err) {
    inputFiles.forEach((f) => deleteFileSilently(f));
    deleteFileSilently(outputPath);
    next(err);
  }
};

const splitPdfController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await splitPdf(inputPath, env.convertedDir, req.body.pagesRange || '', req.file.originalname);
    const isZip = outputPath.endsWith('.zip');
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-split${isZip ? '.zip' : '.pdf'}`;
    sendFileAndCleanup(res, outputPath, downloadName, isZip ? 'application/zip' : 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const compressPdfController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await compressPdf(inputPath, env.convertedDir);
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-compressed.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const rotatePdfController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await rotatePdf(inputPath, env.convertedDir, req.body.angle);
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-rotated.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const convertPdfToExcelController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await convertPdfToExcel(inputPath, env.convertedDir);
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}.xlsx`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const convertExcelToPdfController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select an Excel file.' });
    outputPath = await convertExcelToPdf(inputPath, env.convertedDir, req.file.originalname);
    const downloadName = `${path.basename(req.file.originalname, path.extname(req.file.originalname))}.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const convertPdfToPowerPointController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await convertPdfToPowerPoint(inputPath, env.convertedDir);
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}.pptx`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/vnd.openxmlformats-officedocument.presentationml.presentation', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const convertPowerPointToPdfController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PowerPoint presentation.' });
    outputPath = await convertPowerPointToPdf(inputPath, env.convertedDir);
    const downloadName = `${path.basename(req.file.originalname, path.extname(req.file.originalname))}.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const extractPdfPagesController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await extractPdfPages(inputPath, env.convertedDir, req.body.pagesRange || '');
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-extracted.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const deletePdfPagesController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await deletePdfPages(inputPath, env.convertedDir, req.body.pagesToDelete || '');
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-modified.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const reorderPdfPagesController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await reorderPdfPages(inputPath, env.convertedDir, req.body.newOrder || '');
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-reordered.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const watermarkPdfController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await watermarkPdf(inputPath, env.convertedDir, req.body.watermarkText, req.body.opacity);
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-watermarked.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const addPageNumbersController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await addPageNumbers(inputPath, env.convertedDir);
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-numbered.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const protectPdfController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await protectPdf(inputPath, env.convertedDir, req.body.password);
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-protected.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const ocrPdfController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await performOcrOnPdf(inputPath);
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-ocr.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const repairPdfController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await repairPdf(inputPath, env.convertedDir);
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-repaired.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const unlockPdfController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await unlockPdf(inputPath, env.convertedDir, req.body.password);
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-unlocked.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const signPdfController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await signPdf(inputPath, env.convertedDir, req.body.signerName);
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-signed.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const redactPdfController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await redactPdf(inputPath, env.convertedDir, req.body.redactText);
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-redacted.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const cropPdfController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await cropPdf(inputPath, env.convertedDir, req.body.cropMargin);
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-cropped.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const editPdfController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await editPdf(inputPath, env.convertedDir, req.body.annotationText);
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}-edited.pdf`;
    sendFileAndCleanup(res, outputPath, downloadName, 'application/pdf', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const comparePdfController = async (req, res, next) => {
  const inputFiles = req.files ? req.files.map((f) => f.path) : [];
  let outputPath = null;
  try {
    if (inputFiles.length < 2) return res.status(400).json({ success: false, message: 'Please select 2 PDF files to compare.' });
    outputPath = await comparePdfs(inputFiles[0], inputFiles[1], env.convertedDir);
    sendFileAndCleanup(res, outputPath, 'pdf-comparison-report.pdf', 'application/pdf', inputFiles, next);
  } catch (err) {
    inputFiles.forEach((f) => deleteFileSilently(f));
    deleteFileSilently(outputPath);
    next(err);
  }
};

const convertPdfToTextController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await convertPdfToText(inputPath, env.convertedDir);
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}.txt`;
    sendFileAndCleanup(res, outputPath, downloadName, 'text/plain', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

const convertPdfToMarkdownController = async (req, res, next) => {
  const inputPath = req.file ? req.file.path : null;
  let outputPath = null;
  try {
    if (!inputPath) return res.status(400).json({ success: false, message: 'Please select a PDF file.' });
    outputPath = await convertPdfToMarkdown(inputPath, env.convertedDir, req.file.originalname);
    const downloadName = `${path.basename(req.file.originalname, '.pdf')}.md`;
    sendFileAndCleanup(res, outputPath, downloadName, 'text/markdown', [inputPath], next);
  } catch (err) {
    deleteFileSilently(inputPath);
    deleteFileSilently(outputPath);
    next(err);
  }
};

module.exports = {
  convertPdfToWordController,
  convertWordToPdfController,
  convertPdfToJpgController,
  convertPdfToPngController,
  convertJpgToPdfController,
  convertPngToPdfController,
  mergePdfController,
  splitPdfController,
  compressPdfController,
  rotatePdfController,
  convertPdfToExcelController,
  convertExcelToPdfController,
  convertPdfToPowerPointController,
  convertPowerPointToPdfController,
  extractPdfPagesController,
  deletePdfPagesController,
  reorderPdfPagesController,
  watermarkPdfController,
  addPageNumbersController,
  protectPdfController,
  ocrPdfController,
  repairPdfController,
  unlockPdfController,
  signPdfController,
  redactPdfController,
  cropPdfController,
  editPdfController,
  comparePdfController,
  convertPdfToTextController,
  convertPdfToMarkdownController
};
