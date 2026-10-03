import { useParams, Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { toolCategories, toolsInCategory, TOOL_CTA } from '../data/toolCatalogue';
import { NotFound } from './NotFound';

export const CategoryPage = () => {
  const { categoryId } = useParams();

  const categoryMap = toolCategories.reduce((acc, cat) => {
    acc[cat.slug] = { ...cat, tools: toolsInCategory(cat.slug) };
    return acc;
  }, {});

  // Rendering `categoryMap[categoryId] || categoryMap.convert` meant /tools/bogus
  // answered with the Document Converters grid, so the URL, the title and the
  // heading all disagreed with what was on screen.
  const activeCategory = categoryMap[categoryId];

  if (!activeCategory) return <NotFound requestedPath={`/tools/${categoryId}`} />;

  const IconComponent = activeCategory.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/tools" className="hover:text-slate-900 dark:hover:text-white">Tools</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white font-bold">{activeCategory.title}</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 rounded-2xl ${activeCategory.color} flex items-center justify-center`}>
            <IconComponent className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeCategory.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              {activeCategory.desc}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCategory.tools.map((t, idx) => (
          <Link
            key={idx}
            to={t.path}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-[#0bff03] dark:hover:border-[#0bff03] transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-[#0bff03] transition-colors">
                {t.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.desc}</p>
            </div>
            <div className="flex items-center text-xs font-bold text-slate-900 dark:text-white pt-2">
              <span>{TOOL_CTA}</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform text-slate-600 dark:text-[#08cb02]" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
