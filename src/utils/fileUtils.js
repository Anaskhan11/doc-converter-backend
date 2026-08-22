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

const verifyFileMagicBytes = async (filePath, expectedType) => {
  let fd;
  try {
    const buffer = Buffer.alloc(8);
    fd = await fs.promises.open(filePath, 'r');
    await fd.read(buffer, 0, 8, 0);
    await fd.close();

    if (expectedType === 'pdf') {
      return buffer.toString('utf8', 0, 4) === '%PDF';
    }
    if (expectedType === 'docx') {
      return buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
    }
    return false;
  } catch (err) {
    if (fd) await fd.close().catch(() => {});
    return false;
  }
};

module.exports = {
  ensureDirectoriesExist,
  deleteFileSilently,
  verifyFileMagicBytes
};
