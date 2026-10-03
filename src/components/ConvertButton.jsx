import { Loader2 } from 'lucide-react';

export const ConvertButton = ({ onClick, disabled, loading, children, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 border border-transparent rounded-xl shadow-md text-base font-bold text-slate-950 bg-[#0bff03] hover:bg-[#09e602] active:bg-[#08cb02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#090d16] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin text-slate-950" />
          <span>Converting...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};