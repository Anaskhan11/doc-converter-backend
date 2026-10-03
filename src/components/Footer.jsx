import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { toolByPath, TOOL_COUNT } from '../data/toolCatalogue';

/* Which tools each column features is this footer's own curation; the labels and the
   directory count come from the shared catalogue so they cannot drift from the routes. */
const featuredColumns = [
  {
    heading: 'Document Converters',
    paths: ['/pdf-to-word', '/word-to-pdf', '/pdf-to-excel', '/excel-to-pdf', '/pdf-to-powerpoint', '/powerpoint-to-pdf']
  },
  {
    heading: 'Image & AI Tools',
    paths: ['/pdf-to-jpg', '/jpg-to-pdf', '/ocr-pdf', '/chat-with-pdf', '/ai-pdf-summarizer']
  },
  {
    heading: 'PDF Utilities',
    paths: ['/merge-pdf', '/split-pdf', '/compress-pdf', '/rotate-pdf', '/watermark-pdf', '/protect-pdf']
  }
];

export const Footer = () => {
  return (
    <footer className="bg-[#090d16] text-slate-400 border-t border-slate-800 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          <div className="md:col-span-2 space-y-5">
            <Link to="/" className="flex items-center space-x-3 text-white font-extrabold text-2xl group">
              <img src={logo} alt="DocConvert Logo" width={2172} height={724} className="h-12 sm:h-14 w-auto object-contain transition-transform group-hover:scale-105" />
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed font-medium">
              Simple, fast, and secure document conversion suite. Convert, merge, split, compress, watermark, OCR, and protect your files effortlessly in your browser.
            </p>
          </div>

          {featuredColumns.map((column, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-5">{column.heading}</h3>
              <ul className="space-y-2.5 text-sm font-semibold">
                {column.paths.map((path) => (
                  <li key={path}>
                    <Link to={path} className="hover:text-[#0bff03] transition-colors">{toolByPath(path).name}</Link>
                  </li>
                ))}
                {idx === 1 && (
                  <li>
                    <Link to="/tools" className="text-[#0bff03] font-bold hover:underline">All {TOOL_COUNT} Tools →</Link>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 font-medium">
          <p>© {new Date().getFullYear()} DocConvert. All rights reserved.</p>
          <p>Files are automatically deleted after conversion for maximum security.</p>
        </div>
      </div>
    </footer>
  );
};