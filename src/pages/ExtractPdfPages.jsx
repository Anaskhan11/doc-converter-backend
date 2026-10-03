import { useState } from 'react';
import { DocumentConverter } from '../components/DocumentConverter';
import { extractPdfPages } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const ExtractPdfPages = () => {
  const [pagesRange, setPagesRange] = useState('');

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  const renderExtraControls = () => (
    <div className="space-y-2 text-left">
      <label htmlFor="extract-pages" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        Pages to Extract
      </label>
      <input
        id="extract-pages"
        type="text"
        placeholder="e.g. 1-3, 5, 8"
        value={pagesRange}
        onChange={(e) => setPagesRange(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#090d16]"
      />
      <p className="text-xs text-slate-600">Specify page numbers or ranges like "1-3, 5" to extract into a new PDF.</p>
    </div>
  );

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={extractPdfPages}
      validateFn={validateFile}
      renderExtraControls={renderExtraControls}
      extraArg={pagesRange}
      extraArgRequired="Enter the pages to extract, for example 2-5 or 1, 3."
    />
  );
};
