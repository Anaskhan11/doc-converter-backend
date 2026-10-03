import { DocumentConverter } from '../components/DocumentConverter';
import { convertPdfToExcel } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const PdfToExcel = () => {

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  return (
    <DocumentConverter
      outputType="xlsx"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={convertPdfToExcel}
      validateFn={validateFile}
      convertButtonText="Convert to Excel"
    />
  );
};
