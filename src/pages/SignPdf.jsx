import { useState } from 'react';
import { DocumentConverter } from '../components/DocumentConverter';
import { signPdf } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const SignPdf = () => {
  const [signerName, setSignerName] = useState('');

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  const renderExtraControls = () => (
    <div className="space-y-2 text-left">
      <label htmlFor="signer-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        Signer Name
      </label>
      <input
        id="signer-name"
        type="text"
        placeholder="Enter your full name for signature stamp"
        value={signerName}
        onChange={(e) => setSignerName(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#090d16]"
      />
    </div>
  );

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={signPdf}
      validateFn={validateFile}
      convertButtonText="Sign PDF"
      renderExtraControls={renderExtraControls}
      extraArg={signerName}
      extraArgRequired="Enter the name to print on the signature."
    />
  );
};
