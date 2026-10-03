import { useState } from 'react';
import { DocumentConverter } from '../components/DocumentConverter';
import { watermarkPdf } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const WatermarkPdf = () => {
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.25);

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  const renderExtraControls = () => (
    <div className="space-y-4 text-left">
      <div className="space-y-1">
        <label htmlFor="watermark-text" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Watermark Text
        </label>
        <input
          id="watermark-text"
          type="text"
          placeholder="e.g. CONFIDENTIAL, DRAFT, DO NOT COPY"
          value={watermarkText}
          onChange={(e) => setWatermarkText(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#090d16]"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="watermark-opacity" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Watermark opacity ({Math.round(opacity * 100)}%)
        </label>
        <input
          id="watermark-opacity"
          type="range"
          min="0.1"
          max="0.8"
          step="0.05"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="w-full accent-[#0bff03]"
        />
      </div>
    </div>
  );

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={watermarkPdf}
      validateFn={validateFile}
      renderExtraControls={renderExtraControls}
      extraArg={{ text: watermarkText, opacity }}
    />
  );
};
