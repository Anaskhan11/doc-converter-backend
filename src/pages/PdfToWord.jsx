import { DocumentConverter } from '../components/DocumentConverter';
import { convertPdfToWord } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const PdfToWord = () => {

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  return (
    <DocumentConverter
      outputType="docx"
      accept={{
        'application/pdf': ['.pdf']
      }}
      apiFn={convertPdfToWord}
      validateFn={validateFile}
      convertButtonText="Convert to Word"
    />
  );
};
