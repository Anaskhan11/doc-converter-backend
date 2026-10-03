import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  UserCheck,
  Lock,
  ChevronDown
} from 'lucide-react';
import {
  toolCategories,
  tools,
  TOOL_COUNT,
  categoryBySlug,
  matchesQuery,
  emptySearchMessage,
  TOOL_CTA
} from '../data/toolCatalogue';

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categoryFilters = [
    { value: 'All', label: 'All' },
    ...toolCategories.map((cat) => ({ value: cat.slug, label: cat.name }))
  ];

  const query = searchQuery.trim();

  const filteredTools = tools.filter(
    (t) =>
      (activeCategory === 'All' || t.category === activeCategory) && matchesQuery(t, query)
  );

  const scrollToTools = () => {
    const section = document.getElementById('tools-directory-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full space-y-16 pb-20">
      <section className="relative min-h-[calc(100svh-81px)] flex flex-col justify-between bg-gradient-to-b from-[#0bff03]/10 via-[#090d16] to-[#090d16] border-b border-slate-800/80 px-4 py-12 overflow-hidden">
        <div className="flex-1 flex flex-col justify-center items-center max-w-5xl mx-auto text-center space-y-8 relative z-10 my-auto">
          <div className="inline-flex items-center space-x-2 px-4.5 py-2 rounded-full bg-[#0bff03]/10 border border-[#0bff03]/40 text-[#0bff03] text-xs font-black uppercase tracking-wider shadow-md">
            <Zap className="w-4 h-4 text-[#0bff03]" />
            <span>{TOOL_COUNT} High-Speed Document & AI Tools</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight">
            All Your Document Tools.<br />
            <span className="text-[#0bff03]">
              In One Simple Place.
            </span>
          </h1>

          <p className="text-lg sm:text-2xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed">
            Convert, compress, edit, OCR, sign, watermark, and chat with your documents using fast, secure online tools.
          </p>

          <div className="w-full max-w-3xl mx-auto space-y-6 pt-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-[#0bff03]">
                <Search className="w-7 h-7" />
              </div>
              <input
                type="text"
                aria-label="Search for a tool"
                placeholder="Search for a tool (e.g. PDF to Word, Chat with PDF, Compress, Sign)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-[#131b2e] border-2 border-slate-800 focus:border-[#0bff03] rounded-3xl text-lg font-bold text-white placeholder-slate-500 focus:outline-none shadow-2xl transition-all"
              />
            </div>

            <div className="flex items-center justify-center flex-wrap gap-2.5 pt-2">
              {categoryFilters.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  aria-pressed={activeCategory === cat.value}
                  className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all ${
                    activeCategory === cat.value
                      ? 'bg-[#0bff03] text-slate-950 shadow-xl shadow-[#0bff03]/20 border-2 border-[#0bff03]'
                      : 'bg-[#131b2e] text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col items-center justify-center space-y-2 text-slate-400 z-10">
          <button
            onClick={scrollToTools}
            aria-label={`Scroll down to the ${TOOL_COUNT} tools`}
            className="flex items-center justify-center space-x-2 min-h-[44px] px-4 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-[#0bff03] transition-colors"
          >
            <span>Scroll Down to Explore {TOOL_COUNT} Tools</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-[#0bff03]" />
          </button>
        </div>
      </section>

      <section id="tools-directory-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <span>{query || activeCategory !== 'All' ? `Filtered Tools (${filteredTools.length})` : `Popular Document Tools (${TOOL_COUNT})`}</span>
          </h2>
          <Link to="/tools" className="text-sm font-extrabold text-slate-950 dark:text-[#0bff03] hover:underline flex items-center">
            <span>View All {TOOL_COUNT} Tools Directory</span>
            <ArrowRight className="w-4 h-4 ml-1 text-[#0bff03]" />
          </Link>
        </div>

        {filteredTools.length === 0 ? (
          <div className="text-center py-16 bg-[#131b2e] border border-slate-800 rounded-3xl p-8 space-y-3">
            <p className="text-lg font-bold text-slate-300">{emptySearchMessage(searchQuery)}</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="text-xs font-bold text-[#0bff03] hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((t, idx) => {
              const IconComponent = t.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#131b2e] rounded-3xl p-7 border border-slate-800 shadow-xl hover:border-[#0bff03] hover:shadow-[#0bff03]/10 transition-all flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-13 h-13 p-3 rounded-2xl bg-slate-900 text-[#0bff03] flex items-center justify-center border border-slate-800 group-hover:border-[#0bff03] transition-colors">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-[#0bff03]/10 text-[#0bff03] border border-[#0bff03]/20">
                        {categoryBySlug(t.category).name}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white group-hover:text-[#0bff03] transition-colors">{t.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">{t.desc}</p>
                  </div>

                  <Link
                    to={t.path}
                    className="inline-flex items-center justify-center w-full px-5 py-3.5 rounded-2xl font-black text-slate-950 bg-[#0bff03] hover:bg-[#09e602] transition-colors shadow-md text-xs sm:text-sm uppercase tracking-wider"
                  >
                    <span>{TOOL_CTA}</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-[#131b2e] dark:bg-[#131b2e]/60 border-y border-slate-800/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Simple. Secure. Built for Documents.</h2>
            <p className="text-slate-400 text-sm font-semibold">Enterprise document processing with absolute privacy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#090d16] p-7 rounded-3xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0bff03]/20 text-[#0bff03] flex items-center justify-center border border-[#0bff03]/30">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">Automatic File Deletion</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                All uploaded documents and converted files are automatically deleted from server memory immediately after processing.
              </p>
            </div>

            <div className="bg-[#090d16] p-7 rounded-3xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0bff03]/20 text-[#0bff03] flex items-center justify-center border border-[#0bff03]/30">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">No Signup Required</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Start converting your documents instantly without creating an account, entering an email address, or downloading software.
              </p>
            </div>

            <div className="bg-[#090d16] p-7 rounded-3xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0bff03]/20 text-[#0bff03] flex items-center justify-center border border-[#0bff03]/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">High Quality Engine</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Powered by robust conversion engines ensuring clear text formatting, page layouts, and document integrity.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
