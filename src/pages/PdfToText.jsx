import { DocumentConverter } from '../components/DocumentConverter';
import { convertPdfToText } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const PdfToText = () => {

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  return (
    <DocumentConverter
      outputType="txt"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={convertPdfToText}
      validateFn={validateFile}
      convertButtonText="Convert to Text"
    />
  );
};
