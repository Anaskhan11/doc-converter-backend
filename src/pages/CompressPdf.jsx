import { DocumentConverter } from '../components/DocumentConverter';
import { compressPdf } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const CompressPdf = () => {

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={compressPdf}
      validateFn={validateFile}
      convertButtonText="Compress PDF"
    />
  );
};
