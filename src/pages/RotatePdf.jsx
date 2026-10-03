import { useState } from 'react';
import { DocumentConverter } from '../components/DocumentConverter';
import { rotatePdf } from '../services/conversionApi';
import { validatePdf, validateFileSize } from '../utils/fileValidation';

export const RotatePdf = () => {
  const [angle, setAngle] = useState(90);

  const validateFile = (file) => {
    const pdfVal = validatePdf(file);
    if (!pdfVal.isValid) return pdfVal;
    return validateFileSize(file, 25);
  };

  const renderExtraControls = () => (
    <div className="space-y-2 text-left">
      <label htmlFor="rotate-angle" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        Rotation Angle
      </label>
      <select
        id="rotate-angle"
        value={angle}
        onChange={(e) => setAngle(Number(e.target.value))}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#090d16]"
      >
        <option value={90}>90° Clockwise</option>
        <option value={180}>180°</option>
        <option value={270}>270° Counter-Clockwise</option>
      </select>
    </div>
  );

  return (
    <DocumentConverter
      outputType="pdf"
      accept={{ 'application/pdf': ['.pdf'] }}
      apiFn={rotatePdf}
      validateFn={validateFile}
      convertButtonText="Rotate PDF"
      renderExtraControls={renderExtraControls}
      extraArg={angle}
    />
  );
};
