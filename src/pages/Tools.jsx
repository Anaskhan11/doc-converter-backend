import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import {
  toolCategories,
  toolsInCategory,
  TOOL_COUNT,
  matchesQuery,
  emptySearchMessage,
  TOOL_CTA
} from '../data/toolCatalogue';

export const Tools = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const query = searchQuery.trim();

  const filteredCategories = toolCategories
    .map((cat) => {
      const filteredTools = toolsInCategory(cat.slug).filter((t) => matchesQuery(t, query));
      return { ...cat, tools: filteredTools };
    })
    .filter((cat) => cat.tools.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          All <span className="bg-[#0bff03] px-3 py-0.5 rounded-xl text-slate-950">{TOOL_COUNT} Tools</span> Directory
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          Comprehensive suite of {TOOL_COUNT} fast, secure, and free online document tools.
        </p>

        <div className="relative max-w-xl mx-auto pt-2">
          <div className="absolute inset-y-0 left-0 pl-4 pt-2 flex items-center pointer-events-none text-slate-600">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            aria-label={`Search all ${TOOL_COUNT} tools`}
            placeholder={`Search all ${TOOL_COUNT} tools (e.g. ocr, redact, repair, sign, markdown)...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-base font-semibold text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-[#090d16] shadow-xs"
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-3">
          <p className="text-lg font-bold text-slate-700">{emptySearchMessage(searchQuery)}</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-sm font-bold text-indigo-600 hover:underline"
          >
            Clear search filter
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {filteredCategories.map((cat, idx) => (
            <div key={idx} className="space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white border-b border-slate-200 pb-2">
                {cat.title} ({cat.tools.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.tools.map((t, i) => {
                  const IconComponent = t.icon;
                  return (
                    <Link
                      key={i}
                      to={t.path}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-[#0bff03] transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        <div className={`w-12 h-12 rounded-xl ${t.color} flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-slate-950 dark:group-hover:text-[#0bff03] transition-colors">
                          {t.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.desc}</p>
                      </div>

                      <div className="flex items-center text-xs font-bold text-slate-950 dark:text-white pt-2">
                        <span>{TOOL_CTA}</span>
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform text-slate-600 dark:text-[#08cb02]" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
