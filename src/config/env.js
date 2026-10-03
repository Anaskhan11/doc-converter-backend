const path = require('path');
require('dotenv').config();

const env = {
  port: process.env.PORT || 5000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || String(15 * 60 * 1000), 10),
  rateLimitPerToolMax: Math.max(1, parseInt(process.env.RATE_LIMIT_PER_TOOL_MAX || '100', 10)),
  rateLimitGlobalMax: Math.max(1, parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || '500', 10)),
  trustProxy: process.env.TRUST_PROXY || '',
  uploadDir: path.resolve(process.env.UPLOAD_DIR || './uploads'),
  convertedDir: path.resolve(process.env.CONVERTED_DIR || './converted'),
  libreofficePath: process.env.LIBREOFFICE_PATH || 'soffice',
  pdfToWordApiUrl: process.env.PDF_TO_WORD_API_URL || '',
  pdfToWordApiKey: process.env.PDF_TO_WORD_API_KEY || ''
};

module.exports = env;
