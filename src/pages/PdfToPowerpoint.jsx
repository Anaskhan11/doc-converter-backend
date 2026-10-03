import { DocumentConverter } from '../components/DocumentConverter';
import { convertPdfToPowerPoint } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const PdfToPowerpoint = () => {

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  return (
    <DocumentConverter
      outputType="pptx"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={convertPdfToPowerPoint}
      validateFn={validateFile}
      convertButtonText="Convert to PowerPoint"
    />
  );
};
