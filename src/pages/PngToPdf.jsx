import { DocumentConverter } from '../components/DocumentConverter';
import { convertPngToPdf } from '../services/conversionApi';
import { validateFileSize, MAX_FILES_PER_BATCH } from '../utils/fileValidation';

export const PngToPdf = () => {

  const validateFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'png') {
      return { isValid: false, error: 'Please select a valid PNG image (.png).' };
    }
    return validateFileSize(file, 25);
  };

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'image/png': ['.png'] }}
      multiple={true}
      maxFiles={MAX_FILES_PER_BATCH}
      apiFn={convertPngToPdf}
      validateFn={validateFile}
      convertButtonText="Convert to PDF"
    />
  );
};
