import { useState } from 'react';
import { Sparkles, Send, FileText, ChevronLeft, ChevronRight, User, Bot, ListChecks } from 'lucide-react';

export const PdfChatAssistant = ({ fileName = 'sample-document.pdf' }) => {
  const [activePage, setActivePage] = useState(1);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I've analyzed **${fileName}**. You can ask me questions, request summaries, or extract key action items.`
    }
  ]);

  const handleSendMessage = (textToSend) => {
    const msg = textToSend || inputMessage;
    if (!msg || !msg.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: msg }];
    setMessages(newMessages);
    if (!textToSend) setInputMessage('');

    setTimeout(() => {
      let aiResponse = `Based on page ${activePage} of **${fileName}**, here is what I found: The document outlines key operational strategies and performance benchmarks.`;
      if (msg.toLowerCase().includes('summary') || msg.toLowerCase().includes('summarize')) {
        aiResponse = `**Executive Summary of ${fileName}**:\n1. Primary goals focus on efficiency.\n2. Conversion throughput increased by 40%.\n3. Security protocols ensure 100% data compliance.`;
      } else if (msg.toLowerCase().includes('action') || msg.toLowerCase().includes('finding')) {
        aiResponse = `**Key Action Items**:\n- Review security credentials.\n- Update client deployment configuration.\n- Finalize Q3 document processing roadmap.`;
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: aiResponse }]);
    }, 600);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[750px]">
      <div className="w-full lg:w-1/2 bg-slate-950 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-[#0bff03]" />
            <span className="text-sm font-bold text-white truncate max-w-xs">{fileName}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
            <button
              onClick={() => setActivePage(Math.max(1, activePage - 1))}
              aria-label="Previous page"
              className="p-1 hover:bg-slate-800 rounded text-white disabled:opacity-30"
              disabled={activePage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {activePage} of 5</span>
            <button
              onClick={() => setActivePage(Math.min(5, activePage + 1))}
              aria-label="Next page"
              className="p-1 hover:bg-slate-800 rounded text-white disabled:opacity-30"
              disabled={activePage === 5}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 my-4 bg-slate-900 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center space-y-4 text-center overflow-y-auto">
          <div className="w-full max-w-md bg-slate-950 p-6 rounded-xl border border-slate-800 text-left space-y-3 font-mono text-xs text-slate-300">
            <p className="text-[#0bff03] font-bold">Sample page {activePage} - preview placeholder, not your file</p>
            <p className="leading-relaxed">
              1. Executive Overview: DocConvert platform achieves high performance through distributed serverless architecture.
            </p>
            <p className="leading-relaxed">
              2. Security Standards: All files encrypted with AES-256 in transit and memory deleted instantly upon download.
            </p>
            <p className="leading-relaxed">
              3. Conversion Metrics: Processing time average &lt; 1.2 seconds per page.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-slate-900 p-6 flex flex-col justify-between">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-800 text-white font-bold text-sm">
          <Sparkles className="w-5 h-5 text-[#0bff03]" />
          <span>AI Assistant Workbench</span>
        </div>

        <div className="flex-1 my-4 space-y-4 overflow-y-auto pr-2">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start space-x-3 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`p-2 rounded-xl text-slate-950 flex-shrink-0 ${m.sender === 'user' ? 'bg-[#0bff03]' : 'bg-slate-800 text-[#0bff03]'}`}>
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-xs sm:text-sm max-w-xs sm:max-w-md leading-relaxed ${m.sender === 'user' ? 'bg-[#0bff03] text-slate-950 font-bold' : 'bg-slate-800/80 text-slate-200 border border-slate-700/60'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => handleSendMessage('Summarize document')}
              className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 whitespace-nowrap transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 inline-block" aria-hidden="true" /> Summarize document
            </button>
            <button
              onClick={() => handleSendMessage('Key action items')}
              className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 whitespace-nowrap transition-colors"
            >
              <ListChecks className="w-3.5 h-3.5 mr-1.5 inline-block" aria-hidden="true" /> Key action items
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              aria-label="Ask a question about this PDF document"
              placeholder="Ask anything about this PDF document..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="w-full pl-4 pr-12 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0bff03]"
            />
            <button
              onClick={() => handleSendMessage()}
              aria-label="Send message"
              className="absolute right-2 top-2 p-2 bg-[#0bff03] text-slate-950 rounded-lg font-bold hover:bg-[#09e602] transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
