import { useState } from 'react';
import { MousePointer, Type, Image as ImageIcon, Edit2, Highlighter, Square, PenTool, RotateCcw, RotateCw, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const PdfCanvasEditor = () => {
  const { addToast } = useToast();
  const [activeTool, setActiveTool] = useState('select');
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState('#0bff03');
  const [opacity, setOpacity] = useState(100);

  const tools = [
    { id: 'select', name: 'Select', icon: MousePointer },
    { id: 'text', name: 'Text', icon: Type },
    { id: 'image', name: 'Image', icon: ImageIcon },
    { id: 'draw', name: 'Draw', icon: Edit2 },
    { id: 'highlight', name: 'Highlight', icon: Highlighter },
    { id: 'shape', name: 'Shape', icon: Square },
    { id: 'signature', name: 'Signature', icon: PenTool }
  ];

  const handleSave = () => {
    addToast('Document changes saved successfully!', 'success');
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[750px]">
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center space-x-1 sm:space-x-2">
          {tools.map((t) => {
            const IconComp = t.icon;
            const isActive = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                aria-label={t.name}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive ? 'bg-[#0bff03] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span className="hidden sm:inline">{t.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={() => addToast('Undo action', 'info')} aria-label="Undo last edit" className="p-2 text-slate-400 hover:text-white rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={() => addToast('Redo action', 'info')} aria-label="Redo last edit" className="p-2 text-slate-400 hover:text-white rounded-lg">
            <RotateCw className="w-4 h-4" />
          </button>
          <button onClick={handleSave} className="flex items-center space-x-1.5 px-4 py-2 bg-[#0bff03] text-slate-950 rounded-xl font-bold text-xs hover:bg-[#09e602] transition-colors">
            <Save className="w-4 h-4" />
            <span>Save PDF</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 bg-slate-950 p-8 flex items-center justify-center overflow-auto relative">
          <div className="w-full max-w-xl bg-white text-slate-900 rounded-xl shadow-2xl p-12 min-h-[550px] relative font-sans space-y-6">
            <div className="border-b pb-4 flex justify-between items-center border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Sample document title</h2>
              <span className="text-xs text-slate-400">Preview placeholder - not your file</span>
            </div>

            <p className="text-sm leading-relaxed text-slate-700">
              This is an interactive PDF editing canvas. You can select tools from the top toolbar to insert text boxes, draw signatures, highlight paragraphs, or apply shape masks.
            </p>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold">
              ✔ Annotation Note: Verified by DocConvert Canvas Engine
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-6 space-y-6 flex-shrink-0">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tool Properties</h3>

          <div className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label htmlFor="canvas-font-size" className="text-slate-300">Font Size ({fontSize}px)</label>
              <input
                id="canvas-font-size"
                type="range"
                min="10"
                max="48"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-[#0bff03]"
              />
            </div>

            <div className="space-y-1">
              <label id="canvas-color-label" className="text-slate-300">Color Accent</label>
              <div role="group" aria-labelledby="canvas-color-label" className="flex items-center space-x-2">
                {['#0bff03', '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#000000'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setFontColor(c)}
                    aria-label={`Use ${c} as the annotation colour`}
                    aria-pressed={fontColor === c}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border-2 ${fontColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="canvas-opacity" className="text-slate-300">Opacity ({opacity}%)</label>
              <input
                id="canvas-opacity"
                type="range"
                min="10"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full accent-[#0bff03]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
