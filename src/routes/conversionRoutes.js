const express = require('express');
const { uploadSingleFile, uploadMultipleFiles, requireFileCount, requiresExtension} = require('../middleware/uploadMiddleware');
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

const { rejectUnknownOptions } = require('../middleware/optionWhitelist');

const router = express.Router();

router.post('/convert/pdf-to-word', uploadSingleFile, rejectUnknownOptions(), convertPdfToWordController);
router.post('/convert/word-to-pdf', uploadSingleFile, requiresExtension(['.docx']), rejectUnknownOptions(), convertWordToPdfController);
router.post('/convert/pdf-to-jpg', uploadSingleFile, rejectUnknownOptions(), convertPdfToJpgController);
router.post('/convert/pdf-to-png', uploadSingleFile, rejectUnknownOptions(), convertPdfToPngController);
// Same set the shared fileFilter admits (uploadMiddleware.js), so this adds no new
// rejection: a .gif/.webp never reached this far to begin with, and the cross-type
// uploads that used to work (png into jpg-to-pdf, jpg into png-to-pdf) stay allowed.
// Without it a real document posted here passed the magic-bytes gate - its bytes
// agreed with its own name - and was refused only after sharp failed on it. This
// middleware still runs after that gate, so a file whose bytes disagree with its own
// extension keeps reporting the disagreement instead of this tool's formats.
router.post('/convert/jpg-to-pdf', uploadMultipleFiles, requiresExtension(['.jpg', '.jpeg', '.png']), rejectUnknownOptions(), convertJpgToPdfController);
router.post('/convert/png-to-pdf', uploadMultipleFiles, requiresExtension(['.jpg', '.jpeg', '.png']), rejectUnknownOptions(), convertPngToPdfController);
router.post('/convert/merge-pdf', uploadMultipleFiles, rejectUnknownOptions(), mergePdfController);
router.post('/convert/split-pdf', uploadSingleFile, rejectUnknownOptions(['pagesRange']), splitPdfController);
router.post('/convert/compress-pdf', uploadSingleFile, rejectUnknownOptions(), compressPdfController);
router.post('/convert/rotate-pdf', uploadSingleFile, rejectUnknownOptions(['angle']), rotatePdfController);
router.post('/convert/pdf-to-excel', uploadSingleFile, rejectUnknownOptions(), convertPdfToExcelController);
router.post('/convert/excel-to-pdf', uploadSingleFile, requiresExtension(['.xlsx', '.xls']), rejectUnknownOptions(), convertExcelToPdfController);
router.post('/convert/pdf-to-powerpoint', uploadSingleFile, rejectUnknownOptions(), convertPdfToPowerPointController);
router.post('/convert/powerpoint-to-pdf', uploadSingleFile, requiresExtension(['.pptx', '.ppt']), rejectUnknownOptions(), convertPowerPointToPdfController);
router.post('/convert/extract-pdf-pages', uploadSingleFile, rejectUnknownOptions(['pagesRange']), extractPdfPagesController);
router.post('/convert/delete-pdf-pages', uploadSingleFile, rejectUnknownOptions(['pagesToDelete']), deletePdfPagesController);
router.post('/convert/reorder-pdf-pages', uploadSingleFile, rejectUnknownOptions(['newOrder']), reorderPdfPagesController);
router.post('/convert/watermark-pdf', uploadSingleFile, rejectUnknownOptions(['watermarkText', 'opacity']), watermarkPdfController);
router.post('/convert/add-page-numbers', uploadSingleFile, rejectUnknownOptions(), addPageNumbersController);
router.post('/convert/protect-pdf', uploadSingleFile, rejectUnknownOptions(['password']), protectPdfController);

router.post('/convert/ocr-pdf', uploadSingleFile, rejectUnknownOptions(), ocrPdfController);
router.post('/convert/repair-pdf', uploadSingleFile, rejectUnknownOptions(), repairPdfController);
router.post('/convert/unlock-pdf', uploadSingleFile, rejectUnknownOptions(['password']), unlockPdfController);
router.post('/convert/sign-pdf', uploadSingleFile, rejectUnknownOptions(['signerName']), signPdfController);
router.post('/convert/redact-pdf', uploadSingleFile, rejectUnknownOptions(['redactText']), redactPdfController);
router.post('/convert/crop-pdf', uploadSingleFile, rejectUnknownOptions(['cropMargin']), cropPdfController);
router.post('/convert/edit-pdf', uploadSingleFile, rejectUnknownOptions(['annotationText']), editPdfController);
router.post('/convert/compare-pdf', uploadMultipleFiles, requireFileCount(2), rejectUnknownOptions(), comparePdfController);
router.post('/convert/pdf-to-text', uploadSingleFile, rejectUnknownOptions(), convertPdfToTextController);
router.post('/convert/pdf-to-markdown', uploadSingleFile, rejectUnknownOptions(), convertPdfToMarkdownController);

module.exports = router;
