import { DocumentConverter } from '../components/DocumentConverter';
import { convertJpgToPdf } from '../services/conversionApi';
import { validateFileSize, MAX_FILES_PER_BATCH } from '../utils/fileValidation';

export const JpgToPdf = () => {

  const validateFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg'].includes(ext)) {
      return { isValid: false, error: 'Please select a valid JPG/JPEG image (.jpg, .jpeg).' };
    }
    return validateFileSize(file, 25);
  };

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'image/jpeg': ['.jpg', '.jpeg'] }}
      multiple={true}
      maxFiles={MAX_FILES_PER_BATCH}
      apiFn={convertJpgToPdf}
      validateFn={validateFile}
      convertButtonText="Convert to PDF"
    />
  );
};
