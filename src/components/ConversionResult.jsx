import { CheckCircle2, Download, RotateCcw, FileText, FileCheck } from 'lucide-react';
import { formatFileSize } from '../utils/fileValidation';

export const ConversionResult = ({
  originalFile,
  downloadFileName,
  onDownload,
  onReset,
  outputType,
  outputSize
}) => {
  const extension = downloadFileName && downloadFileName.includes('.')
    ? downloadFileName.split('.').pop().toUpperCase()
    : '';
  const downloadButtonText = `Download ${extension || (outputType || 'file').toUpperCase()} file`;
  const isArchive = extension === 'ZIP';

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm space-y-8 text-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="p-3 bg-[#0bff03]/20 text-slate-950 rounded-full border border-[#0bff03]/40">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Conversion Completed!</h2>
        <p className="text-sm text-slate-500">
          {isArchive ? 'Your archive is ready for download.' : 'Your file is ready for download.'}
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 text-left max-w-md mx-auto space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-200">
          <FileText className="w-5 h-5 text-slate-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-600 font-medium uppercase">Original File</p>
            <p className="text-sm font-semibold text-slate-700 break-words" title={originalFile?.name}>{originalFile?.name}</p>
            {originalFile?.size && (
              <p className="text-xs text-slate-600">{formatFileSize(originalFile.size)}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-1">
          <FileCheck className="w-5 h-5 text-slate-900 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-900 font-bold uppercase">Converted File</p>
            <p className="text-sm font-bold text-slate-950 break-words" title={downloadFileName}>{downloadFileName}</p>
            {!!outputSize && (
              <p className="text-xs text-slate-600">{formatFileSize(outputSize)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 max-w-md mx-auto">
        <button
          type="button"
          onClick={onDownload}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 border border-transparent rounded-xl shadow-md text-base font-bold text-slate-950 bg-[#0bff03] hover:bg-[#09e602] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#090d16] transition-all duration-200"
        >
          <Download className="w-5 h-5 mr-2" />
          <span>{downloadButtonText}</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3.5 border border-slate-300 rounded-xl text-base font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#090d16] transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          <span>Convert Another File</span>
        </button>
      </div>
    </div>
  );
};
