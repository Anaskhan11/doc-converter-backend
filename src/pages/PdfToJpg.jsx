import { DocumentConverter } from '../components/DocumentConverter';
import { convertPdfToJpg } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const PdfToJpg = () => {

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  return (
    <DocumentConverter
      outputType="jpg"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={convertPdfToJpg}
      validateFn={validateFile}
      convertButtonText="Convert to JPG"
    />
  );
};
