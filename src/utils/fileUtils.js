const fs = require('fs');
const path = require('path');

const ensureDirectoriesExist = (...dirs) => {
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

const deleteFileSilently = async (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    console.error(`Failed to delete temporary file ${filePath}:`, err.message);
  }
};

// Files still being written keep a fresh mtime, so age alone is a safe
// signal that nothing owns them any more.
const sweepStaleFiles = async (dir, maxAgeMs = 30 * 60 * 1000) => {
  let entries;
  try {
    entries = await fs.promises.readdir(dir);
  } catch (err) {
    return 0;
  }

  const cutoff = Date.now() - maxAgeMs;
  let removed = 0;

  await Promise.all(
    entries.map(async (name) => {
      const fullPath = path.join(dir, name);
      try {
        const stats = await fs.promises.stat(fullPath);
        if (stats.isFile() && stats.mtimeMs < cutoff) {
          await fs.promises.unlink(fullPath);
          removed += 1;
        }
      } catch (err) {
        // vanished or locked; the next sweep can try again
      }
    })
  );

  return removed;
};

// What a upload claims to be is decided from its extension first and its
// declared MIME type second -- the same two signals multer's fileFilter looks
// at, kept in one place so the filter and the content check cannot disagree.
const EXT_KINDS = {
  '.pdf': 'pdf',
  '.docx': 'office',
  '.xlsx': 'office',
  '.pptx': 'office',
  '.xls': 'office',
  '.ppt': 'office',
  '.png': 'png',
  '.jpg': 'jpeg',
  '.jpeg': 'jpeg'
};

const KIND_LABELS = {
  pdf: 'PDF',
  office: 'Word, Excel or PowerPoint',
  png: 'PNG image',
  jpeg: 'JPEG image'
};

const mimeKind = (mime = '') => {
  if (mime === 'application/pdf') return 'pdf';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/jpeg') return 'jpeg';
  if (
    mime.includes('wordprocessingml') ||
    mime.includes('spreadsheetml') ||
    mime.includes('presentationml') ||
    mime.includes('excel') ||
    mime.includes('powerpoint') ||
    mime.includes('zip')
  ) return 'office';
  return null;
};

const declaredKindOf = (file) => {
  const byExt = EXT_KINDS[path.extname(file.originalname || '').toLowerCase()];
  return byExt || mimeKind(file.mimetype);
};

// A file only has to *look* like a PDF to clear the filter: 50 bytes of text
// named spoof.pdf passed it and came back as a converted artifact. The first
// bytes have to agree with the claim. PDF is searched for in the first kilobyte
// because real-world PDFs sometimes carry a short junk preamble; the other
// formats have no legitimate prefix.
const HEAD_BYTES = 1024;

const MAGIC_CHECKS = {
  pdf: (head) => head.subarray(0, Math.min(HEAD_BYTES, head.length)).toString('latin1').includes('%PDF'),
  office: (head) =>
    (head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04) ||
    (head[0] === 0xd0 && head[1] === 0xcf && head[2] === 0x11 && head[3] === 0xe0),
  png: (head) => head.subarray(0, 8).toString('hex') === '89504e470d0a1a0a',
  jpeg: (head) => head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff
};

const verifyFileMagicBytes = async (filePath, expectedType) => {
  const check = MAGIC_CHECKS[expectedType];
  if (!check) return false;

  let fd;
  try {
    const buffer = Buffer.alloc(HEAD_BYTES);
    fd = await fs.promises.open(filePath, 'r');
    const { bytesRead } = await fd.read(buffer, 0, HEAD_BYTES, 0);
    return check(buffer.subarray(0, bytesRead));
  } catch (err) {
    return false;
  } finally {
    if (fd) await fd.close().catch(() => {});
  }
};

// Services used to build document titles and ZIP entry names from the path
// multer saved the upload to, so every artifact carried the internal store name
// ("file-1790496237598-43a5cafad6ee") instead of the name the user's file had.
// Controllers now hand over `originalname`, but that string is user-controlled
// and is written into PDF text, Markdown, SVG and archive entries, so directory
// parts and filename-reserved characters have to be removed before it is used.
const MAX_TITLE_CHARS = 100;

const sanitizeTitle = (value) => {
  const onlyName = path.basename(String(value || '').replace(/\\/g, '/'));
  return onlyName
    .replace(/[\x00-\x1f\x7f<>:"'/\\|?*]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\.[^.]*$/, '')
    .trim()
    .slice(0, MAX_TITLE_CHARS)
    .trim();
};

// A name that sanitizes to nothing ("..pdf", "///", '<>:"/\\|?*.pdf') must not
// produce an empty title, and it must not fall back to the store basename either:
// that basename is multer's internal upload name, so it would reappear inside the
// ZIP entry names and the Markdown title - the exact leak this helper exists to
// prevent. Every controller passes originalname, so the only way to reach the
// fallback is a user name that carries no readable characters, and "document" is
// the honest answer for that. The store path is deliberately not an argument.
const displayTitleOf = (originalName) => sanitizeTitle(originalName) || 'document';

module.exports = {
  ensureDirectoriesExist,
  deleteFileSilently,
  sweepStaleFiles,
  verifyFileMagicBytes,
  declaredKindOf,
  displayTitleOf,
  KIND_LABELS
};
