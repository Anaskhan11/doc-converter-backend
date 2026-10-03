import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Search, Sun, Moon } from 'lucide-react';
import { MegaMenu } from './MegaMenu';
import { toolCategories, TOOL_COUNT } from '../data/toolCatalogue';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.png';

// The same shortcut is bound to Ctrl as well as Cmd (see SearchModal.jsx), so
// the badge has to name the key the visitor's machine actually carries.
const isApplePlatform =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
const SEARCH_SHORTCUT_LABEL = isApplePlatform ? '⌘K' : 'Ctrl K';

export const Header = ({ onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const dropdownRef = useRef(null);
  const location = useLocation();

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/98 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl transition-colors">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          <div className="flex items-center space-x-10">
            <Link to="/" className="flex items-center flex-shrink-0 group py-1" onClick={closeMenu}>
              <img src={logo} alt="DocConvert Logo" width={2172} height={724} className="h-11 sm:h-13 w-auto object-contain transition-transform duration-200 group-hover:scale-105" />
            </Link>

            <nav className="hidden lg:flex items-center space-x-8" aria-label="Primary">
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                  aria-expanded={megaMenuOpen}
                  aria-haspopup="true"
                  aria-controls="tools-menu"
                  className={`inline-flex items-center text-sm font-extrabold transition-colors py-2 ${
                    megaMenuOpen || isActive('/tools') ? 'text-[#0bff03]' : 'text-slate-100 hover:text-[#0bff03]'
                  }`}
                >
                  <span>Tools ({TOOL_COUNT})</span>
                  <ChevronDown className={`w-4 h-4 ml-1.5 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180 text-[#0bff03]' : 'text-slate-400'}`} />
                </button>

                {megaMenuOpen && <MegaMenu onClose={closeMenu} />}
              </div>

              <Link
                to="/tools/ai"
                aria-current={isActive('/tools/ai') ? 'page' : undefined}
                className={`text-sm font-extrabold transition-colors flex items-center space-x-1.5 py-2 ${
                  isActive('/tools/ai') ? 'text-[#0bff03]' : 'text-slate-100 hover:text-[#0bff03]'
                }`}
              >
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#0bff03]/20 text-[#0bff03] font-black uppercase tracking-wider">New</span>
                <span>AI Tools</span>
              </Link>

              <Link
                to="/pricing"
                aria-current={isActive('/pricing') ? 'page' : undefined}
                className={`text-sm font-extrabold transition-colors py-2 ${
                  isActive('/pricing') ? 'text-[#0bff03]' : 'text-slate-100 hover:text-[#0bff03]'
                }`}
              >
                Pricing
              </Link>
            </nav>
          </div>

          <div className="flex-1 max-w-md ml-auto hidden md:block">
            <button
              type="button"
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-5 py-3 bg-[#131b2e] hover:bg-slate-900 text-slate-300 hover:text-white rounded-2xl text-xs sm:text-sm font-bold border border-slate-800 hover:border-[#0bff03] transition-all shadow-inner group"
            >
              <div className="flex items-center space-x-3 truncate">
                <Search className="w-4 h-4 text-[#0bff03] flex-shrink-0" />
                <span className="truncate text-slate-200 group-hover:text-white font-extrabold">{`Search all ${TOOL_COUNT} document tools...`}</span>
              </div>
              <kbd className="hidden lg:inline-block px-2.5 py-1 text-[10px] font-black rounded-lg bg-slate-800 text-[#0bff03] border border-slate-700">{SEARCH_SHORTCUT_LABEL}</kbd>
            </button>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-pressed={isDark}
            className="p-2.5 ml-auto md:ml-0 text-slate-200 hover:text-[#0bff03] rounded-lg shrink-0"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="flex items-center md:hidden">
            <button onClick={onOpenSearch} aria-label="Search all tools" className="p-2.5 text-slate-200 hover:text-[#0bff03] mr-2">
              <Search className="w-6 h-6" />
            </button>
            <button
              onClick={toggleMenu}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              className="p-2.5 text-slate-200 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-nav" className="lg:hidden border-b border-slate-800 bg-[#090d16] px-6 pt-4 pb-8 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
          <Link to="/tools" onClick={closeMenu} className="block px-4 py-3 text-xl font-black text-[#0bff03] border-b border-slate-800">
            All {TOOL_COUNT} Tools Directory →
          </Link>
          {toolCategories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/tools/${cat.slug}`}
              onClick={closeMenu}
              className="block px-4 py-2.5 text-base font-bold text-slate-100 hover:text-[#0bff03]"
            >
              {cat.title}
            </Link>
          ))}
          <Link to="/pricing" onClick={closeMenu} className="block px-4 py-2.5 text-base font-bold text-slate-100 hover:text-[#0bff03]">
            Pricing
          </Link>
        </div>
      )}
    </header>
  );
};
