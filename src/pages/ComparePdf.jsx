import { DocumentConverter } from '../components/DocumentConverter';
import { comparePdf } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const ComparePdf = () => {

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'application/pdf': ['.pdf'] }}
      multiple={true}
      maxFiles={2}
      apiFn={comparePdf}
      validateFn={validateFile}
    />
  );
};
