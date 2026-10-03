import { useState } from 'react';
import { DocumentConverter } from '../components/DocumentConverter';
import { editPdf } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const EditPdf = () => {
  const [annotationText, setAnnotationText] = useState('Reviewed & Approved');

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  const renderExtraControls = () => (
    <div className="space-y-2 text-left">
      <label htmlFor="edit-note-text" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        Annotation Note Text
      </label>
      <input
        id="edit-note-text"
        type="text"
        placeholder="e.g. Reviewed & Approved, Internal Memo"
        value={annotationText}
        onChange={(e) => setAnnotationText(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#090d16]"
      />
    </div>
  );

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={editPdf}
      validateFn={validateFile}
      convertButtonText="Edit PDF"
      renderExtraControls={renderExtraControls}
      extraArg={annotationText}
    />
  );
};
