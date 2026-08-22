const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  const isPdf = ext === '.pdf' || mime === 'application/pdf';
  const isDocx = ext === '.docx' || mime.includes('wordprocessingml') || mime.includes('zip');
  const isJpg = ext === '.jpg' || ext === '.jpeg' || mime === 'image/jpeg';
  const isPng = ext === '.png' || mime === 'image/png';
  const isExcel = ext === '.xlsx' || ext === '.xls' || mime.includes('spreadsheetml') || mime.includes('excel');
  const isPpt = ext === '.pptx' || ext === '.ppt' || mime.includes('presentationml') || mime.includes('powerpoint');

  if (isPdf || isDocx || isJpg || isPng || isExcel || isPpt) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Supported formats: .pdf, .docx, .xlsx, .xls, .pptx, .ppt, .jpg, .jpeg, .png'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024
  },
  fileFilter
});

const uploadSingleFile = (req, res, next) => {
  const uploadHandler = upload.single('file');
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: `File size exceeds the maximum limit of ${env.maxFileSizeMb} MB.`
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please select a document.' });
    }

    next();
  });
};

const uploadMultipleFiles = (req, res, next) => {
  const uploadHandler = upload.array('files', 20);
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: `One or more files exceed the maximum size limit of ${env.maxFileSizeMb} MB.`
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded. Please select at least one file.' });
    }

    next();
  });
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles
};
