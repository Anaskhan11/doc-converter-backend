import axios from 'axios';

/* Relative by default so Vite's /api proxy (and any host's equivalent routing)
   participates; VITE_API_URL overrides it for a separately hosted API. */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api'
});

const STATUS_MESSAGES = {
  400: 'The server could not process that file. Check the file and the options, then try again.',
  404: 'That conversion endpoint is not available on this server.',
  413: 'That file is larger than this tool accepts.',
  429: 'Too many requests right now. Please wait a moment and try again.',
  500: 'The conversion service failed while processing this file. Please try again.',
  502: 'The conversion service is not responding. Please try again shortly.',
  503: 'The conversion service is unavailable right now. Please try again shortly.',
  504: 'The conversion service timed out. Please try again.'
};

/* Every conversion request sets responseType: 'blob', so even a JSON or HTML error
   body arrives as a Blob. Only a real backend `message` is ever shown; an HTML body
   (Express 404/500, proxy errors) parses to nothing and falls through to the
   status classification instead of surfacing raw library text. */
const readBackendMessage = async (data) => {
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      return typeof parsed?.message === 'string' && parsed.message.trim() ? parsed.message.trim() : null;
    } catch {
      return null;
    }
  }
  return typeof data?.message === 'string' && data.message.trim() ? data.message.trim() : null;
};

const handleApiError = async (error) => {
  const backendMessage = await readBackendMessage(error.response?.data);
  if (backendMessage) throw new Error(backendMessage);

  if (!error.response) {
    throw new Error('Cannot reach the conversion service. Check your connection and try again.');
  }

  const status = error.response.status;
  throw new Error(STATUS_MESSAGES[status] ?? `Conversion failed (HTTP ${status}). Please try again.`);
};

const postFormData = async (url, formData) => {
  try {
    return await api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob'
    });
  } catch (error) {
    return await handleApiError(error);
  }
};

export const convertPdfToWord = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await postFormData('/convert/pdf-to-word', formData);
};

export const convertWordToPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await postFormData('/convert/word-to-pdf', formData);
};

export const convertPdfToJpg = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await postFormData('/convert/pdf-to-jpg', formData);
};

export const convertPdfToPng = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await postFormData('/convert/pdf-to-png', formData);
};

export const convertJpgToPdf = async (files) => {
  const formData = new FormData();
  const fileArray = Array.isArray(files) ? files : [files];
  fileArray.forEach((file) => formData.append('files', file));
  return await postFormData('/convert/jpg-to-pdf', formData);
};

export const convertPngToPdf = async (files) => {
  const formData = new FormData();
  const fileArray = Array.isArray(files) ? files : [files];
  fileArray.forEach((file) => formData.append('files', file));
  return await postFormData('/convert/png-to-pdf', formData);
};

export const mergePdf = async (files) => {
  const formData = new FormData();
  const fileArray = Array.isArray(files) ? files : [files];
  fileArray.forEach((file) => formData.append('files', file));
  return await postFormData('/convert/merge-pdf', formData);
};

export const splitPdf = async (file, pagesRange = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pagesRange', pagesRange);
  return await postFormData('/convert/split-pdf', formData);
};

export const compressPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await postFormData('/convert/compress-pdf', formData);
};

export const rotatePdf = async (file, angle = 90) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('angle', angle);
  return await postFormData('/convert/rotate-pdf', formData);
};

export const convertPdfToExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await postFormData('/convert/pdf-to-excel', formData);
};

export const convertExcelToPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await postFormData('/convert/excel-to-pdf', formData);
};

export const convertPdfToPowerPoint = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await postFormData('/convert/pdf-to-powerpoint', formData);
};

export const convertPowerPointToPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await postFormData('/convert/powerpoint-to-pdf', formData);
};

export const extractPdfPages = async (file, pagesRange = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pagesRange', pagesRange);
  return await postFormData('/convert/extract-pdf-pages', formData);
};

export const deletePdfPages = async (file, pagesToDelete = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pagesToDelete', pagesToDelete);
  return await postFormData('/convert/delete-pdf-pages', formData);
};

export const reorderPdfPages = async (file, newOrder = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('newOrder', newOrder);
  return await postFormData('/convert/reorder-pdf-pages', formData);
};

export const watermarkPdf = async (file, watermarkOptions = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('watermarkText', watermarkOptions.text || 'CONFIDENTIAL');
  formData.append('opacity', watermarkOptions.opacity ?? 0.25);
  return await postFormData('/convert/watermark-pdf', formData);
};

export const addPageNumbers = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await postFormData('/convert/add-page-numbers', formData);
};

export const protectPdf = async (file, password = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);
  return await postFormData('/convert/protect-pdf', formData);
};

export const ocrPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await postFormData('/convert/ocr-pdf', formData);
};

export const repairPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await postFormData('/convert/repair-pdf', formData);
};

export const unlockPdf = async (file, password = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);
  return await postFormData('/convert/unlock-pdf', formData);
};

export const signPdf = async (file, signerName = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('signerName', signerName);
  return await postFormData('/convert/sign-pdf', formData);
};

export const redactPdf = async (file, redactText = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('redactText', redactText);
  return await postFormData('/convert/redact-pdf', formData);
};

export const cropPdf = async (file, cropMargin = 20) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('cropMargin', cropMargin);
  return await postFormData('/convert/crop-pdf', formData);
};

export const editPdf = async (file, annotationText = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('annotationText', annotationText);
  return await postFormData('/convert/edit-pdf', formData);
};

export const comparePdf = async (files) => {
  const formData = new FormData();
  const fileArray = Array.isArray(files) ? files : [files];
  fileArray.forEach((file) => formData.append('files', file));
  return await postFormData('/convert/compare-pdf', formData);
};

export const convertPdfToText = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await postFormData('/convert/pdf-to-text', formData);
};

export const convertPdfToMarkdown = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await postFormData('/convert/pdf-to-markdown', formData);
};
