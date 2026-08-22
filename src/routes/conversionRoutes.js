const express = require('express');
const { uploadSingleFile, uploadMultipleFiles } = require('../middleware/uploadMiddleware');
const {
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
} = require('../controllers/conversionController');

const router = express.Router();

router.post('/convert/pdf-to-word', uploadSingleFile, convertPdfToWordController);
router.post('/convert/word-to-pdf', uploadSingleFile, convertWordToPdfController);
router.post('/convert/pdf-to-jpg', uploadSingleFile, convertPdfToJpgController);
router.post('/convert/pdf-to-png', uploadSingleFile, convertPdfToPngController);
router.post('/convert/jpg-to-pdf', uploadMultipleFiles, convertJpgToPdfController);
router.post('/convert/png-to-pdf', uploadMultipleFiles, convertPngToPdfController);
router.post('/convert/merge-pdf', uploadMultipleFiles, mergePdfController);
router.post('/convert/split-pdf', uploadSingleFile, splitPdfController);
router.post('/convert/compress-pdf', uploadSingleFile, compressPdfController);
router.post('/convert/rotate-pdf', uploadSingleFile, rotatePdfController);
router.post('/convert/pdf-to-excel', uploadSingleFile, convertPdfToExcelController);
router.post('/convert/excel-to-pdf', uploadSingleFile, convertExcelToPdfController);
router.post('/convert/pdf-to-powerpoint', uploadSingleFile, convertPdfToPowerPointController);
router.post('/convert/powerpoint-to-pdf', uploadSingleFile, convertPowerPointToPdfController);
router.post('/convert/extract-pdf-pages', uploadSingleFile, extractPdfPagesController);
router.post('/convert/delete-pdf-pages', uploadSingleFile, deletePdfPagesController);
router.post('/convert/reorder-pdf-pages', uploadSingleFile, reorderPdfPagesController);
router.post('/convert/watermark-pdf', uploadSingleFile, watermarkPdfController);
router.post('/convert/add-page-numbers', uploadSingleFile, addPageNumbersController);
router.post('/convert/protect-pdf', uploadSingleFile, protectPdfController);

router.post('/convert/ocr-pdf', uploadSingleFile, ocrPdfController);
router.post('/convert/repair-pdf', uploadSingleFile, repairPdfController);
router.post('/convert/unlock-pdf', uploadSingleFile, unlockPdfController);
router.post('/convert/sign-pdf', uploadSingleFile, signPdfController);
router.post('/convert/redact-pdf', uploadSingleFile, redactPdfController);
router.post('/convert/crop-pdf', uploadSingleFile, cropPdfController);
router.post('/convert/edit-pdf', uploadSingleFile, editPdfController);
router.post('/convert/compare-pdf', uploadMultipleFiles, comparePdfController);
router.post('/convert/pdf-to-text', uploadSingleFile, convertPdfToTextController);
router.post('/convert/pdf-to-markdown', uploadSingleFile, convertPdfToMarkdownController);

module.exports = router;
