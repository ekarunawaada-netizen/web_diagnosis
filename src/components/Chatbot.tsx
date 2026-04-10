"use client";

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages }),
      });

      if (!response.ok) throw new Error("Gagal mengirim pesan");

      const data = await response.json();
      const botMessage: Message = { role: 'model', parts: [{ text: data.response }] };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { role: 'model', parts: [{ text: "Maaf, sistem sedang sibuk. Coba lagi nanti ya!" }] };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-surface/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/60 flex flex-col overflow-hidden animate-in slide-in-from-bottom-12 fade-in duration-500 fill-mode-both">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-primary to-secondary text-white shrink-0 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <span className="material-symbols-outlined text-white">smart_toy</span>
              </div>
              <div>
                <h3 className="font-bold font-headline leading-tight">MediScan Assistant</h3>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-80">AI Customer Service</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-60">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                   <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                </div>
                <p className="text-sm font-medium text-on-surface-variant">Halo! Saya asisten MediScan. Ada yang bisa saya bantu hari ini?</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in zoom-in duration-300`}>
                <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm font-medium shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant/30'
                }`}>
                  {m.parts[0].text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="bg-surface-container-high text-on-surface px-5 py-3 rounded-2xl rounded-tl-none border border-outline-variant/30 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-surface border-t border-outline-variant/20 shrink-0">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ketik pesan Anda..."
                className="w-full pl-5 pr-14 py-3.5 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline-variant text-sm font-medium"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute right-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-50 disabled:grayscale"
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 transform active:scale-90 ${
          isOpen ? 'bg-error text-white rotate-90 scale-90' : 'bg-primary text-white hover:scale-110'
        }`}
      >
        <span className="material-symbols-outlined text-3xl">
          {isOpen ? 'close' : 'chat'}
        </span>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-tertiary rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>
    </div>
  );
}
