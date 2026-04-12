"use client";

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { AVAILABLE_MODELS, ModelType } from '@/utils/ai';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  usedModel?: string;
  wasFallback?: boolean;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>('LLAMA3_8B');
  const [showModelPicker, setShowModelPicker] = useState(false);
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
        body: JSON.stringify({ 
          message: input, 
          history: messages,
          model: selectedModel 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim pesan");
      }

      const responseText = data.response;
      const returnedModel = data.usedModel;
      const isFallback = data.wasFallback;
      
      // Siapkan pesan kosong untuk model beserta meta datanya
      setMessages((prev) => [...prev, { 
        role: 'model', 
        parts: [{ text: '' }],
        usedModel: returnedModel,
        wasFallback: isFallback
      }]);
      setLoading(false); // Matikan titik-titik loading

      // Simulasi efek ngetik yang sangat presisi dan stabil
      let i = 0;
      const typeSpeed = Math.max(1, Math.floor(responseText.length / 50)); // Dinamis, jika panjang maka lebih cepat
      
      const timer = setInterval(() => {
        i += typeSpeed;
        if (i > responseText.length) i = responseText.length;
        
        const currentText = responseText.substring(0, i);
        
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex].role === 'model') {
            updated[lastIndex] = { ...updated[lastIndex], parts: [{ text: currentText }] };
          }
          return updated;
        });

        if (i >= responseText.length) {
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
    if (confirm("Apakah Anda yakin ingin menghapus semua riwayat percakapan?")) {
      setMessages([]);
    }
  };

  return (
    <div className="fixed bottom-6 right-4 md:right-6 z-[60] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-2rem)] sm:w-[350px] md:w-[400px] h-[550px] max-h-[80vh] bg-surface/80 backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-white/40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-primary via-primary to-primary-container text-white shrink-0 shadow-md relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                  <span className="material-symbols-outlined text-white">smart_toy</span>
                </div>
                <div>
                  <h3 className="font-bold font-headline leading-tight text-white shadow-sm">MediScan Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5 relative">
                    <button 
                      onClick={() => setShowModelPicker(!showModelPicker)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/20 group"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                      <p className="text-[9px] uppercase font-black tracking-widest text-white/90">
                        {selectedModel === 'LLAMA3_8B' ? 'Llama 3 8B' : selectedModel === 'LLAMA3_70B' ? 'Llama 3 70B' : selectedModel === 'MIXTRAL' ? 'Mixtral' : 'Gemma 7B'}
                      </p>
                      <span className="material-symbols-outlined text-[12px] text-white/70 group-hover:text-white transition-transform duration-300">expand_more</span>
                    </button>

                    {/* Model Picker Tooltip/Dropdown */}
                    {showModelPicker && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200 py-1">
                        {(Object.keys(AVAILABLE_MODELS) as ModelType[]).map((key) => (
                          <button
                            key={key}
                            onClick={() => {
                              setSelectedModel(key);
                              setShowModelPicker(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-between ${
                              selectedModel === key 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {key === 'LLAMA3_8B' ? 'Llama 8B (Cepat)' : key === 'LLAMA3_70B' ? 'Llama 70B (Pintar)' : key === 'MIXTRAL' ? 'Mixtral 8x7B' : 'Gemma 7B (Ringan)'}
                            {selectedModel === key && <span className="material-symbols-outlined text-[14px]">check</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                {messages.length > 0 && (
                  <button onClick={handleClearHistory} className="w-8 h-8 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center text-white/90" title="Hapus Riwayat">
                    <span className="material-symbols-outlined text-lg">delete_sweep</span>
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 bg-surface-container-lowest/50 relative overflow-hidden flex flex-col">
            {/* Medical Disclaimer Alert */}
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex gap-2 items-start shrink-0 backdrop-blur-sm">
              <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <p className="text-[11px] text-amber-800 leading-tight font-medium">Asisten ini menggunakan AI. Saran yang diberikan <strong className="font-bold">bukan pengganti nasihat dokter profesional</strong>. Untuk kondisi darurat, hubungi 112.</p>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4 opacity-70">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-inner border border-primary/10">
                     <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface mb-1">Halo! Saya Siap Membantu</h4>
                    <p className="text-xs font-medium text-on-surface-variant max-w-[200px] mx-auto">Tanyakan seputar gejala, tips kesehatan, atau cara pakai aplikasi ini.</p>
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                  {m.role === 'model' && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 border border-primary/20 mt-1">
                      <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    {/* Fallback Warning Box */}
                    {m.wasFallback && (
                      <div className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-md mb-1 w-max border border-amber-200">
                        ⚠️ Server Penuh, Dialihkan Otomatis
                      </div>
                    )}
                    
                    <div className={`px-4 py-3 rounded-2xl text-[13.5px] shadow-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-tr-none self-end' 
                        : 'bg-white text-on-surface rounded-tl-none border border-outline-variant/20 prose prose-sm prose-p:my-1 prose-ul:my-1 prose-strong:text-primary max-w-none break-words prose-headings:text-on-surface prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-3 prose-li:my-0.5'
                    }`}>
                      {m.role === 'user' ? (
                        m.parts[0].text
                      ) : (
                        <ReactMarkdown>{m.parts[0].text}</ReactMarkdown>
                      )}
                    </div>
                    
                    {/* Model Badge */}
                    {m.role === 'model' && m.usedModel && (
                      <div className="text-[9px] font-semibold text-slate-400 mt-0.5 ml-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">bolt</span> 
                        {m.usedModel === 'LLAMA3_8B' ? 'Groq Llama-3-8B' : m.usedModel === 'LLAMA3_70B' ? 'Groq Llama-3-70B' : m.usedModel === 'MIXTRAL' ? 'Groq Mixtral' : 'Groq Gemma'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-in fade-in duration-300 items-end">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 border border-primary/20">
                    <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                  </div>
                  <div className="bg-white text-on-surface px-4 py-3 rounded-2xl rounded-tl-none border border-outline-variant/20 flex gap-1.5 items-center shadow-sm h-10">
                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-primary/90 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/80 backdrop-blur-md border-t border-outline-variant/20 shrink-0">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tanya sesuatu..."
                className="w-full pl-5 pr-14 py-3.5 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-outline-variant/70 text-sm font-medium shadow-inner"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute right-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 shadow-md shadow-primary/20"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all duration-500 transform active:scale-90 ${
          isOpen ? 'bg-error text-white rotate-90 scale-90' : 'bg-gradient-to-br from-primary to-primary-container text-white hover:scale-110 hover:shadow-primary/40'
        }`}
      >
        <span className="material-symbols-outlined text-3xl transition-transform duration-300" style={{ fontVariationSettings: "'FILL' 1" }}>
          {isOpen ? 'close' : 'chat_bubble'}
        </span>
        {!isOpen && (
          <span className="absolute 0 top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>
    </div>
  );
}

