import { useState } from 'react';
import { DocumentConverter } from '../components/DocumentConverter';
import { protectPdf } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const ProtectPdf = () => {
  const [password, setPassword] = useState('');

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  const renderExtraControls = () => (
    <div className="space-y-2 text-left">
      <label htmlFor="protect-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        Document Password
      </label>
      <input
        id="protect-password"
        type="password"
        placeholder="Enter encryption password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#090d16]"
      />
      <p className="text-xs text-amber-700">Not available in this build: the server cannot encrypt PDFs, so it rejects the request instead of returning an unprotected file.</p>
    </div>
  );

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={protectPdf}
      validateFn={validateFile}
      convertButtonText="Protect PDF"
      renderExtraControls={renderExtraControls}
      extraArg={password}
      extraArgRequired="Enter the password to protect the document with."
    />
  );
};
