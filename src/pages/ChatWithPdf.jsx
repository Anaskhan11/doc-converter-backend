import { PdfChatAssistant } from '../components/workbenches/PdfChatAssistant';
import { toolByPath } from '../data/toolCatalogue';

export const ChatWithPdf = () => {
  const tool = toolByPath('/chat-with-pdf');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0bff03]/20 border border-[#0bff03]/40 text-slate-950 dark:text-[#0bff03] text-xs font-bold uppercase">
          <span>AI Document Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {tool.name}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          {tool.desc}
        </p>
      </div>

      <PdfChatAssistant fileName="annual-report-2026.pdf" />
    </div>
  );
};
