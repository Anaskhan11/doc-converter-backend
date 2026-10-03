import { DocumentConverter } from '../components/DocumentConverter';
import { convertPdfToPng } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const PdfToPng = () => {

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  return (
    <DocumentConverter
      outputType="png"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={convertPdfToPng}
      validateFn={validateFile}
      convertButtonText="Convert to PNG"
    />
  );
};
