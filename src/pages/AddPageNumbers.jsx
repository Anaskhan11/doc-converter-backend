import { DocumentConverter } from '../components/DocumentConverter';
import { addPageNumbers } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const AddPageNumbers = () => {

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={addPageNumbers}
      validateFn={validateFile}
      convertButtonText="Add Page Numbers"
    />
  );
};
