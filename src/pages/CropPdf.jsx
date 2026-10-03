import { useState } from 'react';
import { DocumentConverter } from '../components/DocumentConverter';
import { cropPdf } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const CropPdf = () => {
  const [cropMargin, setCropMargin] = useState(20);

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  const renderExtraControls = () => (
    <div className="space-y-2 text-left">
      <label htmlFor="crop-margin" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        Crop Margin Trim (Points)
      </label>
      <input
        id="crop-margin"
        type="number"
        min="0"
        max="100"
        value={cropMargin}
        onChange={(e) => setCropMargin(Number(e.target.value))}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#090d16]"
      />
    </div>
  );

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={cropPdf}
      validateFn={validateFile}
      convertButtonText="Crop PDF"
      renderExtraControls={renderExtraControls}
      extraArg={cropMargin}
    />
  );
};
