import { DocumentConverter } from '../components/DocumentConverter';
import { convertWordToPdf } from '../services/conversionApi';
import { validateDocx, validateFileSize } from '../utils/fileValidation';

export const WordToPdf = () => {

  const validateFile = (file) => {
    const docxVal = validateDocx(file);
    if (!docxVal.isValid) return docxVal;
    return validateFileSize(file, 25);
  };

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
      }}
      apiFn={convertWordToPdf}
      validateFn={validateFile}
      convertButtonText="Convert to PDF"
    />
  );
};
