import { FileText, FileCode, FileImage, Trash2, ArrowRight } from 'lucide-react';
import { formatFileSize } from '../utils/fileValidation';
import { ConvertButton } from './ConvertButton';

export const FilePreview = ({
  file,
  files = [],
  onRemove,
  onConvert,
  convertButtonText,
  isConverting,
  extraControls
}) => {
  const fileList = files && files.length > 0 ? files : file ? [file] : [];
  if (fileList.length === 0) return null;

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FileText className="w-5 h-5 text-rose-600" />;
    if (ext === 'docx') return <FileCode className="w-5 h-5 text-blue-600" />;
    if (['jpg', 'jpeg', 'png'].includes(ext)) return <FileImage className="w-5 h-5 text-emerald-600" />;
    return <FileText className="w-5 h-5 text-slate-600" />;
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Selected File{fileList.length > 1 ? `s (${fileList.length})` : ''}
        </h2>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {fileList.map((f, index) => (
            <div key={index} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-2 rounded-lg bg-white shadow-2xs flex-shrink-0">
                  {getFileIcon(f.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 break-words" title={f.name}>
                    {f.name}
                  </p>
                  <p className="text-xs text-slate-600">{formatFileSize(f.size)}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={isConverting}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-40"
                title="Remove file"
                aria-label={`Remove ${f.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {extraControls && <div className="pt-2 border-t border-slate-100">{extraControls}</div>}

      <div className="flex justify-end pt-2">
        <ConvertButton onClick={onConvert} loading={isConverting} disabled={isConverting}>
          <span>{convertButtonText}</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </ConvertButton>
      </div>
    </div>
  );
};
