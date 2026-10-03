import { useState } from 'react';
import { DocumentConverter } from '../components/DocumentConverter';
import { deletePdfPages } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const DeletePdfPages = () => {
  const [pagesToDelete, setPagesToDelete] = useState('');

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  const renderExtraControls = () => (
    <div className="space-y-2 text-left">
      <label htmlFor="delete-pages" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        Pages to Delete
      </label>
      <input
        id="delete-pages"
        type="text"
        placeholder="e.g. 2, 4-6"
        value={pagesToDelete}
        onChange={(e) => setPagesToDelete(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#090d16]"
      />
      <p className="text-xs text-slate-600">Specify page numbers or ranges to remove from the PDF document.</p>
    </div>
  );

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={deletePdfPages}
      validateFn={validateFile}
      renderExtraControls={renderExtraControls}
      extraArg={pagesToDelete}
      extraArgRequired="Enter the pages to delete, for example 2-5 or 1, 3."
    />
  );
};
