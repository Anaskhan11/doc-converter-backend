import { DocumentConverter } from '../components/DocumentConverter';
import { convertPdfToMarkdown } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const PdfToMarkdown = () => {

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  return (
    <DocumentConverter
      outputType="md"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={convertPdfToMarkdown}
      validateFn={validateFile}
      convertButtonText="Convert to Markdown"
    />
  );
};
