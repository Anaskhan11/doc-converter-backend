import { useState } from 'react';
import { DocumentConverter } from '../components/DocumentConverter';
import { redactPdf } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const RedactPdf = () => {
  const [redactText, setRedactText] = useState('CONFIDENTIAL');

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  const renderExtraControls = () => (
    <div className="space-y-2 text-left">
      <label htmlFor="redact-label" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        Redaction Section Label
      </label>
      <input
        id="redact-label"
        type="text"
        placeholder="e.g. CONFIDENTIAL, RESTRICTED"
        value={redactText}
        onChange={(e) => setRedactText(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#090d16]"
      />
    </div>
  );

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={redactPdf}
      validateFn={validateFile}
      convertButtonText="Redact PDF"
      renderExtraControls={renderExtraControls}
      extraArg={redactText}
    />
  );
};
