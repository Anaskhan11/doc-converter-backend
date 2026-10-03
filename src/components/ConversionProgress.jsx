import { Loader2 } from 'lucide-react';

export const ConversionProgress = () => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center shadow-sm space-y-6" role="status" aria-live="polite">
      <div className="inline-flex p-4 rounded-full bg-[#0bff03]/20 text-slate-950">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-900">Converting your document...</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Please wait while we process your file. Large files may take a few moments.
        </p>
      </div>

      {/* Indeterminate on purpose: nothing measures the request, so there is no
          honest aria-valuenow to publish. */}
      <div
        className="w-full max-w-md mx-auto bg-slate-900 rounded-full h-2.5 overflow-hidden relative border border-slate-800"
        role="progressbar"
        aria-label="Converting your document"
        aria-busy="true"
      >
        <div className="bg-[#0bff03] h-full rounded-full w-1/3 animate-indeterminate"></div>
      </div>
    </div>
  );
};
