/** Mirrors MAX_FILES in backend/src/middleware/uploadMiddleware.js; keep the two in step. */
export const MAX_FILES_PER_BATCH = 20;

export const validatePdf = (file) => {
  if (!file) return { isValid: false, error: 'Please select a file.' };
  const ext = file.name.split('.').pop().toLowerCase();
  const isPdf = ext === 'pdf' || file.type === 'application/pdf';
  if (!isPdf) {
    return { isValid: false, error: 'Please select a valid PDF file (.pdf).' };
  }
  return { isValid: true };
};

export const validateDocx = (file) => {
  if (!file) return { isValid: false, error: 'Please select a file.' };
  const ext = file.name.split('.').pop().toLowerCase();
  const isDocx = ext === 'docx';
  if (!isDocx) {
    return { isValid: false, error: 'Please select a valid Word document (.docx).' };
  }
  return { isValid: true };
};

export const validateFileSize = (file, maxMb = 25) => {
  if (!file) return { isValid: false, error: 'Please select a file.' };
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return { isValid: false, error: `File size must be less than ${maxMb} MB.` };
  }
  return { isValid: true };
};

export const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} ${bytes === 1 ? 'Byte' : 'Bytes'}`;
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};
