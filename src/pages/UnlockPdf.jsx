import { useState } from 'react';
import { DocumentConverter } from '../components/DocumentConverter';
import { unlockPdf } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const UnlockPdf = () => {
  const [password, setPassword] = useState('');

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  const renderExtraControls = () => (
    <div className="space-y-2 text-left">
      <label htmlFor="unlock-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        Password (If Required)
      </label>
      <input
        id="unlock-password"
        type="password"
        placeholder="Enter password if required to open file"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#090d16]"
      />
    </div>
  );

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={unlockPdf}
      validateFn={validateFile}
      convertButtonText="Unlock PDF"
      renderExtraControls={renderExtraControls}
      extraArg={password}
    />
  );
};
