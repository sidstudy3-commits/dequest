import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../context/AIContext';
import { 
  Bot, 
  X, 
  Send, 
  Loader2, 
  ChevronRight, 
  Sparkles, 
  Trash2 
} from 'lucide-react';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, loading, sendMessage, clearChat } = useAI();
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const text = input;
    setInput('');
    await sendMessage(text);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-neonPurple to-neonIndigo text-white p-4 rounded-full shadow-neon hover:shadow-2xl transition-all hover:scale-110 active:scale-95 group"
        >
          <Bot className="w-6 h-6 animate-pulse group-hover:scale-110" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500"></span>
          </span>
        </button>
      )}

      {/* Slide-out Chat Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-96 bg-white/95 dark:bg-darkBg/95 border-l border-slate-200 dark:border-glassBorder/60 shadow-2xl transition-transform duration-300 ease-out z-50 flex flex-col justify-between backdrop-blur-xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-glassBorder/50 flex items-center justify-between bg-slate-50/50 dark:bg-glassBg/40">
          <div className="flex items-center gap-2">
            <div className="bg-neonPurple/20 p-2 rounded-lg text-neonPurple">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                DevQuest AI Mentor
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-current" />
              </h3>
              <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Powered by Gemini</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              title="Clear Chat"
              className="p-2 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-glassBg/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-glassBg/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col max-w-[85%] ${
                msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              {/* Message Bubble */}
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-neonPurple text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-glassBg border border-slate-200/80 dark:border-glassBorder text-slate-800 dark:text-gray-200 rounded-tl-none'
                }`}
              >
                {/* Basic Markdown styling support for bold and line breaks */}
                <p className="whitespace-pre-wrap">
                  {msg.content.split('\n').map((line, lIdx) => {
                    // Simple regex replacement for **bold** text
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                      <span key={lIdx} className="block min-h-[0.5rem]">
                        {parts.map((part, pIdx) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={pIdx} className="text-slate-950 dark:text-white font-bold">{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </span>
                    );
                  })}
                </p>
              </div>
              <span className="text-[9px] text-slate-400 dark:text-gray-500 mt-1 uppercase tracking-wider">
                {msg.role === 'user' ? 'You' : 'Gemini AI'}
              </span>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-glassBg border border-slate-200/80 dark:border-glassBorder text-slate-500 dark:text-gray-400 px-4 py-2.5 rounded-2xl max-w-[85%] rounded-tl-none">
              <Loader2 className="w-4 h-4 animate-spin text-neonPurple" />
              <span className="text-xs">Thinking...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Form Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-200/80 dark:border-glassBorder/50 bg-slate-50/50 dark:bg-glassBg/20 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask AI for study roadmaps, coding help..."
            className="flex-1 glass-input text-xs"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-neonPurple hover:bg-neonPurple/90 text-white p-2.5 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
};

export default AIAssistant;
