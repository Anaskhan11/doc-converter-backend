import { useState } from 'react';
import { DocumentConverter } from '../components/DocumentConverter';
import { reorderPdfPages } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const ReorderPdfPages = () => {
  const [newOrder, setNewOrder] = useState('');

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  const renderExtraControls = () => (
    <div className="space-y-2 text-left">
      <label htmlFor="reorder-sequence" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        New Page Sequence Order
      </label>
      <input
        id="reorder-sequence"
        type="text"
        placeholder="e.g. 3, 1, 2, 4"
        value={newOrder}
        onChange={(e) => setNewOrder(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#090d16]"
      />
      <p className="text-xs text-slate-600">List every page of your document exactly once, separated by commas. Pages you leave out are removed from the result, so the conversion is rejected if the order is incomplete.</p>
    </div>
  );

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={reorderPdfPages}
      validateFn={validateFile}
      renderExtraControls={renderExtraControls}
      extraArg={newOrder}
    />
  );
};
