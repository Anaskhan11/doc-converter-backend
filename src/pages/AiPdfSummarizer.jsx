import { useState } from 'react';
import { Sparkles, FileText, CheckCircle2, ListChecks, FileSearch, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { toolByPath } from '../data/toolCatalogue';

export const AiPdfSummarizer = () => {
  const { addToast } = useToast();
  const [analyzed, setAnalyzed] = useState(true);
  const tool = toolByPath('/ai-pdf-summarizer');

  const handleReanalyze = () => {
    addToast('Re-analyzing document...', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0bff03]/20 border border-[#0bff03]/40 text-slate-950 dark:text-[#0bff03] text-xs font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Document Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {tool.name}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          {tool.desc}
        </p>
      </div>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-[#0bff03]/20 text-slate-950 font-bold">
              <FileText className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Q3-Financial-Report-2026.pdf</h3>
              <p className="text-xs text-slate-400">18 Pages - Analyzed with AI Engine v2.4</p>
            </div>
          </div>

          <button
            onClick={handleReanalyze}
            className="px-4 py-2.5 bg-[#0bff03] text-slate-950 rounded-xl font-bold text-xs hover:bg-[#09e602] transition-colors"
          >
            Re-analyze document
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
              <FileSearch className="w-4 h-4" />
              <span>Executive Overview</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The Q3 Financial Report demonstrates strong 32% year-over-year revenue expansion, driven by cloud conversion services and enterprise document security tools.
            </p>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-[#0bff03] font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Key Findings</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Gross margins expanded to 78.4%.</li>
              <li>Customer retention reached 99.1%.</li>
              <li>Operational expenses reduced by 14%.</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <ListChecks className="w-4 h-4" />
              <span>Action Items</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Approve Q4 infrastructure budget.</li>
              <li>Expand APAC server region.</li>
              <li>Finalize enterprise API SLA terms.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
