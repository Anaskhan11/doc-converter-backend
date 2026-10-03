const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');
const { declaredKindOf, verifyFileMagicBytes, KIND_LABELS } = require('../utils/fileUtils');
const { badRequest } = require('../utils/optionParser');

const MAX_FILES = 20;

// multer diskStorage has already written earlier parts of a request by the time
// it rejects a later one, and no controller runs on that path, so the rejected
// request's files would otherwise sit on disk forever.
const removeAcceptedFiles = (req) => {
  const files = req.files || (req.file ? [req.file] : []);
  files.forEach((file) => {
    if (file && file.path) {
      fs.promises.unlink(file.path).catch(() => {});
    }
  });
};

/* busboy (via multer 1.x) decodes the multipart filename as latin1, so a UTF-8 name
   typed by a real browser ("café.pdf") arrives here already mangled, and every
   message and download name built from it inherits the mojibake. Re-reading the same
   bytes as UTF-8 recovers it, but only when that round-trip is lossless - a name that
   is genuinely latin1, or already correct, must come back untouched. */
const decodeOriginalName = (name) => {
  if (typeof name !== 'string' || !name) return name;
  const asUtf8 = Buffer.from(name, 'latin1').toString('utf8');
  return asUtf8 !== name && !asUtf8.includes('�') ? asUtf8 : name;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.uploadDir);
  },
  filename: (req, file, cb) => {
    file.originalname = decodeOriginalName(file.originalname);
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// One list decides what this server accepts (fileUtils.declaredKindOf); the
// filter used to keep its own copy of those rules next to a content check that
// read a different list, and the two had already drifted.
const fileFilter = (req, file, cb) => {
  if (declaredKindOf(file)) {
    cb(null, true);
  } else {
    cb(badRequest('Invalid file type. Supported formats: .pdf, .docx, .xlsx, .xls, .pptx, .ppt, .jpg, .jpeg, .png'), false);
  }
};

// Extension/MIME guessing alone let 50 bytes of text named spoof.pdf through as
// a PDF, so the bytes that arrive have to agree with the name. declaredKindOf
// reuses the filter's own rules, so the two cannot drift apart.
const rejectMismatchedContent = async (req, res, next) => {
  const files = req.files || (req.file ? [req.file] : []);
  for (const file of files) {
    const kind = declaredKindOf(file);
    if (!kind) continue;
    const ok = await verifyFileMagicBytes(file.path, kind);
    if (!ok) {
      removeAcceptedFiles(req);
      return res.status(400).json({
        success: false,
        message: `"${file.originalname}" is not a ${KIND_LABELS[kind]} file - its name says one thing and its contents another. Please choose a real ${KIND_LABELS[kind]} document.`
      });
    }
  }
  next();
};

// multer's own error strings ("Unexpected field", "File too large") are written
// for developers. Only messages we authored are shown to a user.
const rejectUploadError = (res, err, { multi, expectedField }) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: multi
          ? `One or more files exceed the maximum size limit of ${env.maxFileSizeMb} MB.`
          : `File size exceeds the maximum limit of ${env.maxFileSizeMb} MB.`
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      // multer raises this one code for two unrelated mistakes: more files than the
      // route allows, and a file sent under the wrong field name. Telling a client
      // that posted one file under "file" to use fewer documents is not actionable.
      if (expectedField && err.field && err.field !== expectedField) {
        return res.status(400).json({
          success: false,
          message: `This tool reads the upload from a form field named "${expectedField}", but the request used "${err.field}". No file was uploaded.`
        });
      }
      return res.status(400).json({
        success: false,
        message: multi
          ? `This tool takes at most ${MAX_FILES} files. Please select fewer documents.`
          : 'This tool works on one file at a time. Please select a single document.'
      });
    }
  }
  if (err.statusCode === 400) {
    return res.status(400).json({ success: false, message: err.message });
  }
  return res.status(400).json({
    success: false,
    message: 'The file could not be uploaded. Please check it and try again.'
  });
};

const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024,
    // Busboy's defaults (1000 fields x 1 MB each) meant a multipart body could carry
    // ~1 GB of non-file text in RAM before any route looked at it. No route here reads
    // more than a handful of short fields, so both are now bounded well below that.
    fields: 20,
    fieldSize: 64 * 1024
  },
  fileFilter
});

const uploadSingleFile = (req, res, next) => {
  const uploadHandler = upload.single('file');
  uploadHandler(req, res, (err) => {
    if (err) {
      removeAcceptedFiles(req);
      return rejectUploadError(res, err, { multi: false, expectedField: 'file' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please select a document.' });
    }

    return rejectMismatchedContent(req, res, next);
  });
};

const uploadMultipleFiles = (req, res, next) => {
  const uploadHandler = upload.array('files', MAX_FILES);
  uploadHandler(req, res, (err) => {
    if (err) {
      removeAcceptedFiles(req);
      return rejectUploadError(res, err, { multi: true, expectedField: 'files' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded. Please select at least one file.' });
    }

    return rejectMismatchedContent(req, res, next);
  });
};

// /compare-pdf only ever diffs the first two uploads, so a third file used to be
// accepted, dropped on the floor, and reported as a successful comparison. The
// route now states the count it can honour and anything else is a 400.
const requireFileCount = (count) => {
  return (req, res, next) => {
    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === count) return next();

    removeAcceptedFiles(req);
    const sent = files.length === 0 ? 'no files' : `${files.length} file${files.length === 1 ? '' : 's'}`;
    next(badRequest(`This tool works on exactly ${count} documents at a time. You sent ${sent}.`));
  };
};

// The content gate above only proves a file agrees with its own name, so a real
// PDF posted to /excel-to-pdf passed it and came back 200 + a PDF containing that
// PDF's own raw bytes. Each Office-input route now states the extensions it can
// convert, which is the only rule that distinguishes .docx from .xlsx here:
// fileUtils EXT_KINDS folds every Office format into one 'office' kind.
const requiresExtension = (extensions) => {
  const allowed = new Set(extensions);
  return (req, res, next) => {
    const files = req.files || (req.file ? [req.file] : []);
    const rejected = files.filter((f) => !allowed.has(path.extname((f && f.originalname) || '').toLowerCase()));
    if (rejected.length === 0) return next();
    removeAcceptedFiles(req);
    return res.status(400).json({
      success: false,
      message: `This tool converts ${extensions.map((e) => e.slice(1)).join(', ')} files. "${rejected[0].originalname}" is not one of them.`
    });
  };
};

module.exports = {
  requiresExtension,
  uploadSingleFile,
  uploadMultipleFiles,
  requireFileCount,
  removeAcceptedFiles
};
