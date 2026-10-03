import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import {
  toolCategories,
  tools,
  categoryBySlug,
  matchesQuery,
  emptySearchMessage
} from '../data/toolCatalogue';

export const SearchModal = ({ isOpen, onClose, onOpen }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onOpen();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onOpen]);

  // The header advertises a Cmd-K badge, so the shortcut has to work from a closed
  // modal too; and while it is open, focus must not walk into the page behind the
  // veil, the veil must freeze the page, and the trigger has to get focus back.
  useEffect(() => {
    if (!isOpen) return undefined;

    setQuery('');
    setActiveCategory('All');
    openerRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (inputRef.current) inputRef.current.focus();

    const focusables = () =>
      Array.from(
        panelRef.current.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])')
      ).filter((el) => el.offsetParent !== null);

    const trapTab = (e) => {
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panelRef.current.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', trapTab, true);
    return () => {
      document.removeEventListener('keydown', trapTab, true);
      document.body.style.overflow = previousOverflow;
      const opener = openerRef.current;
      if (opener && typeof opener.focus === 'function' && document.contains(opener)) opener.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const categoryFilters = [
    { value: 'All', label: 'All' },
    ...toolCategories.map((cat) => ({ value: cat.slug, label: cat.name }))
  ];

  const filtered = tools.filter(
    (t) =>
      (activeCategory === 'All' || t.category === activeCategory) && matchesQuery(t, query)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search tools"
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              aria-label="Search tools by name"
              placeholder="Search PDF tools, converters, or AI features..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-white placeholder-slate-500 font-semibold focus:outline-none text-base sm:text-lg"
            />
          </div>
          <button
            onClick={onClose}
            aria-label="Close search"
            className="p-2 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          <div className="w-full sm:w-48 bg-slate-950/50 p-3 border-r border-slate-800 space-y-1 flex sm:flex-col overflow-x-auto sm:overflow-x-visible flex-shrink-0">
            {categoryFilters.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                aria-pressed={activeCategory === cat.value}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === cat.value ? 'bg-[#0bff03] text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {filtered.length === 0 ? (
              <div role="status" className="text-center py-12 text-slate-400 text-sm">{emptySearchMessage(query)}</div>
            ) : (
              filtered.map((t, idx) => {
                const IconComp = t.icon;
                return (
                  <Link
                    key={idx}
                    to={t.path}
                    onClick={onClose}
                    className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-slate-800 text-[#0bff03] group-hover:scale-105 transition-transform">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-[#0bff03] transition-colors">{t.name}</p>
                        <p className="text-xs text-slate-400">{categoryBySlug(t.category).name}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#0bff03] group-hover:translate-x-1 transition-all" />
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 flex justify-between items-center px-4">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Esc</kbd> to close</span>
          <span>All {tools.length} tools indexed</span>
        </div>
      </div>
    </div>
  );
};
