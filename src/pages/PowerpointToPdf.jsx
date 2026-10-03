import { DocumentConverter } from '../components/DocumentConverter';
import { convertPowerPointToPdf } from '../services/conversionApi';
import { validateFileSize } from '../utils/fileValidation';

export const PowerpointToPdf = () => {

  const validateFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pptx', 'ppt'].includes(ext)) {
      return { isValid: false, error: 'Please select a valid PowerPoint presentation (.pptx or .ppt).' };
    }
    return validateFileSize(file, 25);
  };

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
        'application/vnd.ms-powerpoint': ['.ppt']
      }}
      apiFn={convertPowerPointToPdf}
      validateFn={validateFile}
      convertButtonText="Convert to PDF"
    />
  );
};
