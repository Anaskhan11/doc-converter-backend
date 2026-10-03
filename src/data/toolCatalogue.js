import {
  FileText,
  FileCode,
  FileSpreadsheet,
  Presentation,
  FileCheck2,
  FileJson,
  Combine,
  Scissors,
  FileDigit,
  Trash2,
  Layers,
  Minimize2,
  Wrench,
  Edit3,
  Stamp,
  Hash,
  Crop,
  RotateCw,
  GitCompare,
  Lock,
  Unlock,
  PenTool,
  EyeOff,
  Image,
  FileImage,
  Eye,
  Sparkles
} from 'lucide-react';

/**
 * Single source of truth for every tool route declared in App.jsx: one entry per
 * route, one name, one category, one description, one icon. Nav surfaces must derive
 * their lists and counts from here instead of hand-copying them.
 */
const LIME_CHIP = 'bg-[#0bff03]/20 text-slate-950 dark:text-[#0bff03]';

export const toolCategories = [
  {
    slug: 'convert',
    name: 'Convert',
    title: 'Document Converters',
    desc: 'Turn files into the format you need. High-fidelity conversions for PDF, Word, Excel, PowerPoint, and images.',
    icon: FileText,
    color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
  },
  {
    slug: 'organize',
    name: 'Organize',
    title: 'PDF Page Organizer',
    desc: 'Merge, split, extract, delete, and reorder PDF pages with total control.',
    icon: Combine,
    color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
  },
  {
    slug: 'optimize',
    name: 'Optimize',
    title: 'PDF Optimization Tools',
    desc: 'Compress and repair PDF documents to shrink file size and fix broken structures.',
    icon: Minimize2,
    color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
  },
  {
    slug: 'edit',
    name: 'Edit',
    title: 'PDF Editor & Annotator',
    desc: 'Add text, crop margins, stamp watermarks, add page numbers, and edit PDF documents.',
    icon: Edit3,
    color: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-400'
  },
  {
    slug: 'security',
    name: 'Security',
    title: 'PDF Protection & Security',
    desc: 'Encrypt, unlock, sign, and redact confidential information on PDF documents.',
    icon: Lock,
    color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
  },
  {
    slug: 'images',
    name: 'Images',
    title: 'Image & PDF Tools',
    desc: 'Convert PDF files to high-resolution images or combine images into PDF files.',
    icon: Image,
    color: 'bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400'
  },
  {
    slug: 'ai',
    name: 'AI',
    title: 'AI Document Intelligence',
    desc: 'Chat with PDF documents, generate executive summaries, and analyze contracts with AI.',
    icon: Sparkles,
    color: 'bg-[#0bff03]/20 text-slate-950 dark:text-[#0bff03]'
  }
];


const EXTENSION_LABELS = {
  '.pdf': ['PDF', 'PDF files'],
  '.doc': ['Word document', 'Word documents'],
  '.docx': ['Word document', 'Word documents'],
  '.xls': ['Excel spreadsheet', 'Excel spreadsheets'],
  '.xlsx': ['Excel spreadsheet', 'Excel spreadsheets'],
  '.ppt': ['PowerPoint presentation', 'PowerPoint presentations'],
  '.pptx': ['PowerPoint presentation', 'PowerPoint presentations'],
  '.jpg': ['JPG image', 'JPG images'],
  '.jpeg': ['JPG image', 'JPG images'],
  '.png': ['PNG image', 'PNG images'],
  '.txt': ['text file', 'text files'],
  '.md': ['Markdown file', 'Markdown files']
};

/**
 * One drag-and-drop template for every tool page, keyed off the accept map the page
 * already declares, so uploader copy can't drift per page the way nine variants did.
 */
export const uploaderCopy = (accept, multiple = false) => {
  const extensions = Object.values(accept ?? {}).flat().map((ext) => ext.toLowerCase());
  const labels = EXTENSION_LABELS[extensions.find((ext) => EXTENSION_LABELS[ext])];
  const [singular, plural] = labels ?? ['file', 'files'];
  const label = multiple ? plural : singular;
  return { titleText: `Drag & drop your ${label} here`, buttonText: `Choose ${label}` };
};

export const tools = [
  { name: 'PDF to Word', path: '/pdf-to-word', category: 'convert', desc: 'Convert PDF files into editable Word documents.', icon: FileText, color: 'bg-rose-100 text-rose-600' },
  { name: 'Word to PDF', path: '/word-to-pdf', category: 'convert', desc: 'Convert Word documents into clean PDF files.', icon: FileCode, color: 'bg-blue-100 text-blue-600' },
  { name: 'PDF to Excel', path: '/pdf-to-excel', category: 'convert', desc: 'Extract PDF tables into editable Excel spreadsheets.', icon: FileSpreadsheet, color: 'bg-emerald-100 text-emerald-600' },
  { name: 'Excel to PDF', path: '/excel-to-pdf', category: 'convert', desc: 'Convert Excel spreadsheets into printable PDF tables.', icon: FileSpreadsheet, color: 'bg-emerald-100 text-emerald-600' },
  { name: 'PDF to PowerPoint', path: '/pdf-to-powerpoint', category: 'convert', desc: 'Convert PDF pages into editable PowerPoint slides.', icon: Presentation, color: 'bg-orange-100 text-orange-600' },
  { name: 'PowerPoint to PDF', path: '/powerpoint-to-pdf', category: 'convert', desc: 'Convert presentation slides into a clean PDF.', icon: Presentation, color: 'bg-amber-100 text-amber-700' },
  { name: 'PDF to Text', path: '/pdf-to-text', category: 'convert', desc: 'Extract clean plain text (.txt) from PDF files.', icon: FileCheck2, color: 'bg-indigo-100 text-indigo-600' },
  { name: 'PDF to Markdown', path: '/pdf-to-markdown', category: 'convert', desc: 'Convert PDF text into structured Markdown (.md).', icon: FileJson, color: 'bg-slate-200 text-slate-800' },

  { name: 'Merge PDF', path: '/merge-pdf', category: 'organize', desc: 'Combine multiple PDF files into one PDF document.', icon: Combine, color: 'bg-blue-100 text-blue-600' },
  { name: 'Split PDF', path: '/split-pdf', category: 'organize', desc: 'Separate page ranges or split all PDF pages.', icon: Scissors, color: 'bg-purple-100 text-purple-600' },
  { name: 'Extract PDF Pages', path: '/extract-pdf-pages', category: 'organize', desc: 'Extract selected pages into a new PDF document.', icon: FileDigit, color: 'bg-violet-100 text-violet-600' },
  { name: 'Delete PDF Pages', path: '/delete-pdf-pages', category: 'organize', desc: 'Remove unwanted pages from your PDF file.', icon: Trash2, color: 'bg-rose-100 text-rose-600' },
  { name: 'Reorder PDF Pages', path: '/reorder-pdf-pages', category: 'organize', desc: 'Rearrange PDF pages in custom order sequence.', icon: Layers, color: 'bg-blue-100 text-blue-600' },

  { name: 'Compress PDF', path: '/compress-pdf', category: 'optimize', desc: 'Reduce PDF file size while preserving layout.', icon: Minimize2, color: 'bg-slate-200 text-slate-800' },
  { name: 'Repair PDF', path: '/repair-pdf', category: 'optimize', desc: 'Fix corrupt and damaged PDF document structures.', icon: Wrench, color: 'bg-rose-100 text-rose-600' },

  { name: 'Edit PDF', path: '/edit-pdf', category: 'edit', desc: 'Add custom text notes and annotations to PDF.', icon: Edit3, color: 'bg-blue-100 text-blue-600' },
  { name: 'Watermark PDF', path: '/watermark-pdf', category: 'edit', desc: 'Stamp custom text watermarks onto PDF pages.', icon: Stamp, color: 'bg-fuchsia-100 text-fuchsia-600' },
  { name: 'Add Page Numbers', path: '/add-page-numbers', category: 'edit', desc: 'Number PDF document pages automatically.', icon: Hash, color: 'bg-lime-100 text-lime-700' },
  { name: 'Crop PDF', path: '/crop-pdf', category: 'edit', desc: 'Trim page margins and borders on PDF files.', icon: Crop, color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Rotate PDF', path: '/rotate-pdf', category: 'edit', desc: 'Rotate PDF pages clockwise or counter-clockwise.', icon: RotateCw, color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Compare PDF', path: '/compare-pdf', category: 'edit', desc: 'Compare text differences between two PDF documents.', icon: GitCompare, color: 'bg-teal-100 text-teal-600' },

  { name: 'Protect PDF', path: '/protect-pdf', category: 'security', desc: 'Encrypt PDF files with custom password security.', icon: Lock, color: 'bg-slate-900 text-[#0bff03]' },
  { name: 'Unlock PDF', path: '/unlock-pdf', category: 'security', desc: 'Remove password restrictions and locks from PDF.', icon: Unlock, color: 'bg-emerald-100 text-emerald-600' },
  { name: 'Sign PDF', path: '/sign-pdf', category: 'security', desc: 'Add digital signature verification stamps to PDF.', icon: PenTool, color: 'bg-indigo-100 text-indigo-600' },
  { name: 'Redact PDF', path: '/redact-pdf', category: 'security', desc: 'Black out sensitive text and confidential regions.', icon: EyeOff, color: 'bg-slate-800 text-white' },

  { name: 'PDF to JPG', path: '/pdf-to-jpg', category: 'images', desc: 'Extract PDF pages as high-resolution JPG images.', icon: Image, color: 'bg-teal-100 text-teal-600' },
  { name: 'JPG to PDF', path: '/jpg-to-pdf', category: 'images', desc: 'Convert JPG images into one PDF document.', icon: FileImage, color: 'bg-indigo-100 text-indigo-600' },
  { name: 'PDF to PNG', path: '/pdf-to-png', category: 'images', desc: 'Convert PDF pages into transparent PNG images.', icon: Image, color: 'bg-cyan-100 text-cyan-600' },
  { name: 'PNG to PDF', path: '/png-to-pdf', category: 'images', desc: 'Convert PNG images into one PDF document.', icon: FileImage, color: 'bg-sky-100 text-sky-600' },
  { name: 'OCR PDF', path: '/ocr-pdf', category: 'images', desc: 'Recognize text from scanned PDFs with OCR.', icon: Eye, color: LIME_CHIP },

  { name: 'Chat with PDF', path: '/chat-with-pdf', category: 'ai', desc: 'AI assistant for document Q&A & insights.', icon: Sparkles, color: LIME_CHIP },
  { name: 'AI PDF Summarizer', path: '/ai-pdf-summarizer', category: 'ai', desc: 'Generate executive summaries & key findings.', icon: Sparkles, color: LIME_CHIP }
];

export const TOOL_COUNT = tools.length;

export const toolByPath = (path) => tools.find((t) => t.path === path);

export const categoryBySlug = (slug) => toolCategories.find((c) => c.slug === slug);

export const toolsInCategory = (slug) => tools.filter((t) => t.category === slug);

export const toolsInCategories = (slugs) => tools.filter((t) => slugs.includes(t.category));

/**
 * One <title> template for the whole app. Every surface renders `{subject} - DocConvert`
 * except the home page, whose brand-first phrasing is deliberate.
 */
export const SITE_NAME = 'DocConvert';
export const pageTitle = (subject) => `${subject} - ${SITE_NAME}`;

/** Card call-to-action, shared by every tool grid so the three surfaces can't drift. */
export const TOOL_CTA = 'Open Tool';

/** Route -> document title, derived from the catalogue so page headings and titles can't drift. */
export const titleForPath = (pathname) => {
  if (pathname === '/') return 'DocConvert - All Your Document Tools. In One Simple Place.';

  const tool = toolByPath(pathname);
  if (tool) return pageTitle(tool.name);

  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'tools') {
    if (segments.length === 1) return pageTitle(`All ${TOOL_COUNT} Document Tools`);
    const category = categoryBySlug(segments[1]);
    // CategoryPage renders the same NotFound body for an unknown slug, so the
    // title has to agree with it.
    return category ? pageTitle(category.title) : pageTitle('Page not found');
  }
  if (pathname === '/pricing') return pageTitle('Pricing Plans');

  return pageTitle('Page not found');
};

/** One empty-result sentence for all three search surfaces. */
export const emptySearchMessage = (query = '') => {
  const trimmed = query.trim();
  return trimmed ? `No tools found matching "${trimmed}".` : 'No tools found matching your search.';
};

export const matchesQuery = (tool, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const category = categoryBySlug(tool.category);
  return (
    tool.name.toLowerCase().includes(q) ||
    tool.desc.toLowerCase().includes(q) ||
    (category ? category.name.toLowerCase().includes(q) : false)
  );
};
