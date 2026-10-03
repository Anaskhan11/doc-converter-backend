import { DocumentConverter } from '../components/DocumentConverter';
import { convertExcelToPdf } from '../services/conversionApi';
import { validateFileSize } from '../utils/fileValidation';

export const ExcelToPdf = () => {

  const validateFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(ext)) {
      return { isValid: false, error: 'Please select a valid Excel spreadsheet (.xlsx or .xls).' };
    }
    return validateFileSize(file, 25);
  };

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls']
      }}
      apiFn={convertExcelToPdf}
      validateFn={validateFile}
      convertButtonText="Convert to PDF"
    />
  );
};
