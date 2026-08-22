const path = require('path');
require('dotenv').config();

const env = {
  port: process.env.PORT || 5000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10),
  uploadDir: path.resolve(process.env.UPLOAD_DIR || './uploads'),
  convertedDir: path.resolve(process.env.CONVERTED_DIR || './converted'),
  libreofficePath: process.env.LIBREOFFICE_PATH || 'soffice',
  pdfToWordApiUrl: process.env.PDF_TO_WORD_API_URL || '',
  pdfToWordApiKey: process.env.PDF_TO_WORD_API_KEY || ''
};

module.exports = env;
