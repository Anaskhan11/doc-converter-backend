import { Link } from 'react-router-dom';
import { toolCategories, toolsInCategory, TOOL_COUNT } from '../data/toolCatalogue';

/* The panel is a preview: each column shows the first few tools of its category and
   the column header links to /tools/<slug>, which lists all of them. */
const PREVIEW_ITEMS_PER_CATEGORY = 4;

export const MegaMenu = ({ onClose }) => {
  const categories = toolCategories.map((cat) => ({
    ...cat,
    path: `/tools/${cat.slug}`,
    items: toolsInCategory(cat.slug)
      .slice(0, PREVIEW_ITEMS_PER_CATEGORY)
      .map((t) => ({ name: t.name, path: t.path }))
  }));

  /* Anchored to the header box, not to the trigger: the trigger sits ~200px inside an
     850px panel, so any width cap that ignores that offset still overflows.
     backdrop-blur-xl on <header> makes it the containing block, so `fixed` here
     resolves against the full-width bar (top 0 while the sticky header is stuck). */
  return (
    <div
      id="tools-menu"
      className="fixed left-1/2 -translate-x-1/2 top-[84px] w-[850px] max-w-[calc(100vw-2rem)] bg-[#090d16] border border-slate-800 rounded-3xl shadow-2xl p-8 z-50 animate-fade-in border-t-4 border-t-[#0bff03]"
    >
      <div className="grid grid-cols-4 gap-7">
        {categories.map((cat, idx) => {
          const IconComp = cat.icon;
          return (
            <div key={idx} className="space-y-3">
              <Link
                to={cat.path}
                onClick={onClose}
                className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-100 hover:text-[#0bff03] transition-colors pb-2 border-b border-slate-800"
              >
                <IconComp className={`w-4 h-4 ${cat.slug === 'ai' ? 'text-[#0bff03]' : 'text-slate-400'}`} />
                <span>{cat.name}</span>
              </Link>
              <ul className="space-y-2">
                {cat.items.map((item, i) => (
                  <li key={i}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className="text-xs font-bold text-slate-300 hover:text-[#0bff03] hover:translate-x-1 transition-all block py-0.5"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-7 pt-5 border-t border-slate-800 flex items-center justify-between text-xs font-bold">
        <span className="text-slate-400">{TOOL_COUNT} Instant SaaS Document &amp; AI Tools</span>
        <Link
          to="/tools"
          onClick={onClose}
          className="inline-flex items-center text-[#0bff03] font-black hover:underline"
        >
          <span>All {TOOL_COUNT} Tools Directory →</span>
        </Link>
      </div>
    </div>
  );
};
