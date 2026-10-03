import { DocumentConverter } from '../components/DocumentConverter';
import { ocrPdf } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const OcrPdf = () => {

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={ocrPdf}
      validateFn={validateFile}
      convertButtonText="Perform OCR"
    />
  );
};
