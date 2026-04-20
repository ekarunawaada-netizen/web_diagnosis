"use client";

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  usedModel?: string;
  wasFallback?: boolean;
}

interface ChatWindowProps {
  mode: 'floating' | 'fullscreen';
  onClose?: () => void;
  onFullscreen?: () => void;
}

export default function ChatWindow({ mode, onClose, onFullscreen }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState<Record<number, 'up' | 'down'>>({}); 
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Reset scroll to bottom when messages or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          history: messages,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim pesan");
      }

      const responseText = data.response;
      const returnedModel = data.usedModel;
      const isFallback = data.wasFallback;
      
      const modelPlaceholder: Message = { 
        role: 'model', 
        parts: [{ text: '' }],
        usedModel: returnedModel,
        wasFallback: isFallback
      };
      
      setMessages((prev) => [...prev, modelPlaceholder]);
      setLoading(false);

      let currentText = "";
      let charIndex = 0;
      const timer = setInterval(() => {
        const charStep = Math.max(1, Math.floor(responseText.length / 50));
        charIndex += charStep;
        
        if (charIndex > responseText.length) charIndex = responseText.length;
        currentText = responseText.substring(0, charIndex);

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIdx = newMessages.length - 1;
          if (lastIdx >= 0 && newMessages[lastIdx].role === 'model') {
            newMessages[lastIdx] = { 
              ...newMessages[lastIdx], 
              parts: [{ text: currentText }] 
            };
          }
          return newMessages;
        });

        if (charIndex >= responseText.length) {
          clearInterval(timer);
        }
      }, 30);
      
    } catch (error: any) {
      console.error(error);
      const errText = error.message.includes("Gagal") ? "Aduh, sistem lagi sibuk nih. Coba sapa aku lagi nanti ya!" : error.message;
      const errorMessage: Message = { role: 'model', parts: [{ text: errText }] };
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua pesan?")) {
      setMessages([]);
    }
  };

  const isFullscreen = mode === 'fullscreen';

  return (
    <div className={`flex flex-col overflow-hidden ${
      isFullscreen ? 'w-full h-full bg-surface' : 'w-full h-full bg-surface'
    }`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-primary via-primary to-primary-container text-white shrink-0 shadow-md relative ${isFullscreen ? 'p-5 md:p-6 lg:px-12' : 'p-4'}`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            {isFullscreen && (
              <a href="/" className="mr-4 w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition-all bg-white/10 border border-white/20" title="Kembali ke Beranda">
                <span className="material-symbols-outlined text-white">arrow_back</span>
              </a>
            )}
            <div className={`rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner ${isFullscreen ? 'w-12 h-12' : 'w-10 h-10'}`}>
              <span className={`material-symbols-outlined text-white ${isFullscreen ? 'text-2xl' : ''}`}>smart_toy</span>
            </div>
            <div>
              <h3 className={`font-bold font-headline leading-tight text-white shadow-sm ${isFullscreen ? 'text-xl md:text-2xl' : ''}`}>MediScan Assistant</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/80">Online & Ready</p>
              </div>
            </div>
          </div>
          <div className="flex gap-1 md:gap-2">
            {messages.length > 0 && (
              <button onClick={handleClearHistory} className="w-9 h-9 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center text-white/90" title="Hapus Riwayat">
                <span className="material-symbols-outlined text-xl">delete_sweep</span>
              </button>
            )}
            {!isFullscreen && onFullscreen && (
              <button onClick={onFullscreen} className="w-9 h-9 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center text-white" title="Buka Layar Penuh">
                <span className="material-symbols-outlined text-xl">open_in_full</span>
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center text-white" title="Tutup">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area (Messages + Input) */}
      <div className="flex-1 relative flex flex-col overflow-hidden bg-[#f1f5f9]">
        {/* Background Decorations - Global for content area */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', 
            backgroundSize: '32px 32px' 
          }}></div>
          
          {/* Mesh Gradients - Floating Orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[150px] animate-pulse delay-1000"></div>
        </div>

        {/* Messages Scrollable Area */}
        <div className="flex-1 relative z-10 flex flex-col overflow-hidden">
          {/* Medical Disclaimer Alert */}
          <div className={`bg-amber-500/10 border-b border-amber-500/20 flex gap-2 items-start shrink-0 backdrop-blur-sm ${isFullscreen ? 'px-4 py-2.5 md:px-8 md:py-4' : 'px-3 py-2'}`}>
            <span className={`material-symbols-outlined text-amber-600 mt-0.5 shrink-0 ${isFullscreen ? 'text-[18px] md:text-xl' : 'text-[16px]'}`} style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <p className={`text-amber-800 leading-tight font-medium ${isFullscreen ? 'text-[11px] md:text-sm' : 'text-[10px]'}`}>Asisten ini menggunakan AI. Saran yang diberikan <strong className="font-bold">bukan pengganti nasihat dokter profesional</strong>.</p>
          </div>

          <div ref={scrollRef} className={`flex-1 overflow-y-auto space-y-4 scroll-smooth ${isFullscreen ? 'p-5 md:p-8 max-w-4xl mx-auto w-full' : 'p-4 pb-12'}`}>
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-6 opacity-70">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-inner border border-primary/10">
                 <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-xl text-on-surface">Halo! Saya Vitara</h4>
                <p className="text-sm font-medium text-on-surface-variant max-w-[280px] mx-auto">Saya asisten cerdas MediScan. Tanyakan seputar gejala, tips kesehatan, atau cara pakai aplikasi ini.</p>
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 group/msg`}>
              {m.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-3 border border-primary/20 mt-1">
                  <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
              )}
              <div className={`flex flex-col gap-1 ${isFullscreen ? 'max-w-[85%]' : 'max-w-[80%]'}`}>
                {m.wasFallback && (
                  <div className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-md mb-1 w-max border border-amber-200">
                    ⚠️ Server Penuh, Dialihkan Otomatis
                  </div>
                )}
                
                <div className={`px-5 py-3.5 rounded-2xl text-[14.5px] shadow-md leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-gradient-to-br from-primary to-primary-container text-white rounded-tr-none self-end' 
                    : 'bg-white text-on-surface rounded-tl-none border border-outline-variant/20 prose prose-sm md:prose-base prose-p:my-1 prose-ul:my-1 prose-strong:text-primary max-w-none break-words prose-headings:text-on-surface prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-3 prose-li:my-0.5'
                }`}>
                  {m.role === 'user' ? (
                    m.parts[0].text
                  ) : (
                    <ReactMarkdown>{m.parts[0].text}</ReactMarkdown>
                  )}
                </div>

                {/* Inline Rating - Only for model messages with content */}
                {m.role === 'model' && m.parts[0].text.length > 0 && (
                  <div className={`flex items-center gap-1.5 mt-1 ml-1 transition-all duration-300 ${
                    ratings[i] ? 'opacity-100' : 'opacity-0 group-hover/msg:opacity-100'
                  }`}>
                    <button
                      onClick={() => setRatings(prev => ({ ...prev, [i]: prev[i] === 'up' ? undefined as any : 'up' }))}
                      className={`flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                        ratings[i] === 'up'
                          ? 'bg-primary/10 text-primary px-2 py-1 rounded-lg text-[10px] font-bold'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-primary p-1.5 rounded-full md:rounded-lg md:px-2 md:py-1 md:text-[10px] md:font-bold'
                      }`}
                      title="Jawaban membantu"
                    >
                      <span className="material-symbols-outlined text-[16px] md:text-[14px]" style={ratings[i] === 'up' ? { fontVariationSettings: "'FILL' 1" } : undefined}>thumb_up</span>
                      <span className={`${ratings[i] === 'up' ? '' : 'hidden'} md:inline`}>Membantu</span>
                    </button>
                    <button
                      onClick={() => setRatings(prev => ({ ...prev, [i]: prev[i] === 'down' ? undefined as any : 'down' }))}
                      className={`flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                        ratings[i] === 'down'
                          ? 'bg-error/10 text-error px-2 py-1 rounded-lg text-[10px] font-bold'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-error p-1.5 rounded-full md:rounded-lg md:px-2 md:py-1 md:text-[10px] md:font-bold'
                      }`}
                      title="Jawaban kurang membantu"
                    >
                      <span className="material-symbols-outlined text-[16px] md:text-[14px]" style={ratings[i] === 'down' ? { fontVariationSettings: "'FILL' 1" } : undefined}>thumb_down</span>
                      <span className={`${ratings[i] === 'down' ? '' : 'hidden'} md:inline`}>Kurang</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300 items-end">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-3 border border-primary/20 mt-1">
                <span className="material-symbols-outlined text-[16px] text-primary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                  smart_toy
                </span>
              </div>
              <div className="flex flex-col gap-1 w-[60%]">
                <div className="bg-white px-5 py-5 rounded-2xl rounded-tl-none border border-outline-variant/10 shadow-md space-y-2.5">
                  <div className="h-2 bg-slate-100 rounded-full w-full animate-pulse"></div>
                  <div className="h-2 bg-slate-100 rounded-full w-5/6 animate-pulse delay-75"></div>
                  <div className="h-2 bg-slate-100 rounded-full w-4/6 animate-pulse delay-150"></div>
                </div>
                <div className="text-[10px] font-semibold text-slate-400 mt-1 ml-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                  Vitara sedang berpikir...
                </div>
              </div>
            </div>
          )}
          </div>
      </div>

      {/* Input Area */}
      <div className={`relative z-20 border-t border-outline-variant/10 shrink-0 ${isFullscreen ? 'p-4 md:p-6 bg-white/10 backdrop-blur-xl flex justify-center' : 'p-3 bg-white/5 backdrop-blur-md'}`}>
        <div className={`relative flex items-center gap-2 ${isFullscreen ? 'max-w-4xl w-full md:gap-3' : 'w-full'}`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ketik pesan..."
            className={`w-full bg-white border border-outline-variant/30 rounded-[1.2rem] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline-variant/70 font-medium shadow-sm ${
              isFullscreen ? 'pl-6 pr-16 py-4 text-sm md:text-base' : 'pl-4 pr-12 py-3 text-xs'
            }`}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`absolute right-1.5 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 shadow-lg shadow-primary/20 ${
              isFullscreen ? 'w-11 h-11 right-2.5' : 'w-9 h-9'
            }`}
          >
            <span className={isFullscreen ? 'material-symbols-outlined text-2xl' : 'material-symbols-outlined text-xl'} style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
