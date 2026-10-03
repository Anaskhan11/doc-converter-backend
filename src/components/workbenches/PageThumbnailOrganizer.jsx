import { useState } from 'react';
import { RotateCw, Trash2, Copy, CheckSquare, Square } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const PageThumbnailOrganizer = () => {
  const { addToast } = useToast();
  const [pages, setPages] = useState([
    { id: 1, rotation: 0, selected: false },
    { id: 2, rotation: 0, selected: false },
    { id: 3, rotation: 0, selected: false },
    { id: 4, rotation: 0, selected: false }
  ]);

  const toggleSelect = (id) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)));
  };

  const handleRotateSelected = () => {
    setPages((prev) =>
      prev.map((p) => (p.selected || pages.every((x) => !x.selected) ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
    addToast('Rotated page layout', 'info');
  };

  const handleDeleteSelected = () => {
    const remaining = pages.filter((p) => !p.selected);
    if (remaining.length === 0) {
      addToast('Cannot delete all pages', 'error');
      return;
    }
    setPages(remaining);
    addToast('Deleted selected pages', 'success');
  };

  const handleDuplicateSelected = () => {
    const selected = pages.filter((p) => p.selected);
    if (selected.length === 0) {
      addToast('Please select a page to duplicate', 'info');
      return;
    }
    const newPages = [...pages];
    selected.forEach((p) => {
      newPages.push({ id: Date.now() + Math.random(), rotation: p.rotation, selected: false });
    });
    setPages(newPages);
    addToast('Duplicated selected pages', 'success');
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <h3 className="text-sm font-bold text-white">PDF Page Organizer ({pages.length} Pages)</h3>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRotateSelected}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 text-slate-200 rounded-xl text-xs font-bold hover:text-white hover:bg-slate-700 transition-colors"
          >
            <RotateCw className="w-4 h-4 text-[#0bff03]" />
            <span>Rotate</span>
          </button>

          <button
            onClick={handleDuplicateSelected}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 text-slate-200 rounded-xl text-xs font-bold hover:text-white hover:bg-slate-700 transition-colors"
          >
            <Copy className="w-4 h-4 text-blue-400" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={handleDeleteSelected}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-950 text-rose-300 rounded-xl text-xs font-bold hover:bg-rose-900 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {pages.map((p, idx) => (
          <div
            key={p.id}
            onClick={() => toggleSelect(p.id)}
            className={`relative bg-slate-950 rounded-2xl p-4 border cursor-pointer transition-all ${
              p.selected ? 'border-[#0bff03] shadow-lg scale-[1.02]' : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="absolute top-3 left-3 z-10 text-slate-400">
              {p.selected ? <CheckSquare className="w-5 h-5 text-[#0bff03]" /> : <Square className="w-5 h-5" />}
            </div>

            <div
              style={{ transform: `rotate(${p.rotation}deg)` }}
              className="w-full h-44 bg-white rounded-lg shadow-inner flex flex-col items-center justify-center p-4 transition-transform duration-300 space-y-2 text-slate-900"
            >
              <div className="w-12 h-1 bg-slate-200 rounded" />
              <div className="w-16 h-1 bg-slate-200 rounded" />
              <div className="w-10 h-1 bg-slate-200 rounded" />
              <p className="text-xs font-bold text-slate-400 pt-4">PAGE {idx + 1}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
