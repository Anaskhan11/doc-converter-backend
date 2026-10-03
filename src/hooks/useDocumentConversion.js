import { useState } from 'react';
import { downloadBlob } from '../utils/fileValidation';
import { useToast } from '../context/ToastContext';

export const CONVERSION_STATES = {
  IDLE: 'IDLE',
  FILE_SELECTED: 'FILE_SELECTED',
  CONVERTING: 'CONVERTING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR'
};

export const useDocumentConversion = () => {
  const { addToast } = useToast();
  const [status, setStatus] = useState(CONVERSION_STATES.IDLE);
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [resultBlob, setResultBlob] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState('');

  const selectFile = (selectedFile, validationFn) => {
    setError(null);
    if (validationFn) {
      const validation = validationFn(selectedFile);
      if (!validation.isValid) {
        setError(validation.error);
        setStatus(CONVERSION_STATES.ERROR);
        return false;
      }
    }
    setFile(selectedFile);
    setFiles([selectedFile]);
    setStatus(CONVERSION_STATES.FILE_SELECTED);
    return true;
  };

  const selectFiles = (selectedFiles, validationFn) => {
    setError(null);
    let accepted = Array.from(selectedFiles);
    if (validationFn) {
      const rejected = [];
      accepted = accepted.filter((f) => {
        const validation = validationFn(f);
        if (validation.isValid) return true;
        rejected.push(`${f.name}: ${validation.error}`);
        return false;
      });
      // Offenders are named individually so a batch doesn't have to be bisected,
      // and the files that did pass are still selected.
      if (rejected.length > 0) setError(rejected.join(' '));
    }
    if (accepted.length === 0) {
      setStatus(CONVERSION_STATES.ERROR);
      return false;
    }
    setFiles(accepted);
    setFile(accepted[0] || null);
    setStatus(CONVERSION_STATES.FILE_SELECTED);
    return true;
  };

  const removeFile = (index = 0) => {
    if (files.length <= 1) {
      reset();
    } else {
      const updated = files.filter((_, i) => i !== index);
      setFiles(updated);
      setFile(updated[0] || null);
    }
  };

  const startConversion = async (apiFn, outputExtension, extraArg, multiFile) => {
    if ((!file && files.length === 0) || status === CONVERSION_STATES.CONVERTING) return;

    setStatus(CONVERSION_STATES.CONVERTING);
    setError(null);

    try {
      const payload = multiFile ? files : file;
      const response = await apiFn(payload, extraArg);

      let filename = `converted.${outputExtension}`;
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        const matches = /filename="?([^"]+)"?/.exec(disposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      } else if (file) {
        const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        filename = `${base}.${outputExtension}`;
      }

      setResultBlob(response.data);
      setDownloadFileName(filename);
      setStatus(CONVERSION_STATES.SUCCESS);
    } catch (err) {
      const message = err.message || 'Something went wrong while processing your document.';
      setError(message);
      setStatus(CONVERSION_STATES.ERROR);
      addToast(message, 'error');
    }
  };

  const dismissError = () => {
    setError(null);
    setStatus(file || files.length > 0 ? CONVERSION_STATES.FILE_SELECTED : CONVERSION_STATES.IDLE);
  };

  const handleDownload = () => {
    if (resultBlob && downloadFileName) {
      downloadBlob(resultBlob, downloadFileName);
    }
  };

  const reset = () => {
    setFile(null);
    setFiles([]);
    setError(null);
    setResultBlob(null);
    setDownloadFileName('');
    setStatus(CONVERSION_STATES.IDLE);
  };

  return {
    status,
    file,
    files,
    error,
    downloadFileName,
    resultBlob,
    selectFile,
    selectFiles,
    removeFile,
    startConversion,
    handleDownload,
    dismissError,
    reset,
    hasSelection: !!file || files.length > 0,
    isIdle: status === CONVERSION_STATES.IDLE,
    isFileSelected: status === CONVERSION_STATES.FILE_SELECTED,
    isConverting: status === CONVERSION_STATES.CONVERTING,
    isSuccess: status === CONVERSION_STATES.SUCCESS,
    isError: status === CONVERSION_STATES.ERROR
  };
};
