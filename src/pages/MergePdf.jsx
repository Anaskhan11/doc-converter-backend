import { DocumentConverter } from '../components/DocumentConverter';
import { mergePdf } from '../services/conversionApi';
import { validatePdf, validateFileSize, MAX_FILES_PER_BATCH } from '../utils/fileValidation';

export const MergePdf = () => {

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
      maxFiles={MAX_FILES_PER_BATCH}
      apiFn={mergePdf}
      validateFn={validateFile}
    />
  );
};
