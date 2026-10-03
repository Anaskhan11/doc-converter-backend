import { DocumentConverter } from '../components/DocumentConverter';
import { repairPdf } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const RepairPdf = () => {

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={repairPdf}
      validateFn={validateFile}
      convertButtonText="Repair PDF"
    />
  );
};
