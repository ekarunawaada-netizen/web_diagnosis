"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/context/AuthContext';
import { getAccessToken } from '@/lib/axios';

/* ─── Types ───────────────────────────────────────────────────────────────── */
interface Message {
  role: 'user' | 'ai';
  text: string;
  streaming?: boolean; // true while AI is still typing
}

// Shape sent as history to the API
interface HistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  mode: 'floating' | 'fullscreen';
  onClose?: () => void;
  onFullscreen?: () => void;
}

/* ─── Constants ───────────────────────────────────────────────────────────── */
const STREAM_URL = 'https://db.hztapp.com/spakar/api/chat/stream';

/**
 * Kepribadian VITARA — dikirim sebagai "systemPrompt" ke backend.
 * Backend meletakkan ini sebagai pesan role "system" pertama
 * sebelum history percakapan.
 */
const VITARA_SYSTEM_PROMPT = `
PENTING: Nama Anda adalah VITARA (Virtual Health Assistant Petit Klinik).
Anda adalah sahabat kesehatan yang asyik, modern, cerdas, dan empatik.

GAYA PENULISAN (WAJIB):
1. JANGAN membuat paragraf panjang. Maksimal 2-3 kalimat per paragraf.
2. GUNAKAN elemen visual Markdown agar mudah dibaca:
   - **Bold** untuk poin penting atau istilah medis.
   - > Blockquotes untuk pesan peringatan atau tips khusus.
   - Bullet points (-) atau Numbering (1.) untuk daftar gejala/saran.
   - Horizontal Rules (---) untuk memisahkan topik jika jawaban panjang.
3. EMOJI: Gunakan emoji relevan di setiap poin (🩺 ✨ 💧 🥗).
4. STRUKTUR JAWABAN:
   - Sapaan hangat + Empati.
   - Poin utama (Analisis singkat).
   - Daftar saran praktis (gunakan list).
   - Penutup/Disclaimer singkat.
5. ATURAN RED FLAG (SANGAT PENTING): Jika ada gejala berbahaya
   (nyeri dada tembus punggung, sesak napas akut, pendarahan hebat),
   JANGAN pakai emoji santai. Ubah nada menjadi SANGAT SERIUS dan
   arahkan segera ke UGD atau hubungi 112.

Format keluaran adalah Markdown yang rapi.
`.trim();

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function ChatWindow({ mode, onClose, onFullscreen }: ChatWindowProps) {
  // Auth dari context global — menunggu session restore selesai sebelum cek
  const { user, isLoading: authLoading } = useAuth();
  const isAuthed = !authLoading && !!user;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [ratings, setRatings] = useState<Record<number, 'up' | 'down'>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isFullscreen = mode === 'fullscreen';

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  /* ── Build history array for API ────────────────────────────────────────── */
  const buildHistory = useCallback((msgs: Message[]): HistoryItem[] =>
    msgs
      .filter(m => !m.streaming)
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
    []
  );

  /* ── Send message + consume SSE stream ─────────────────────────────────── */
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    // Guard: tidak kirim jika belum login
    if (!isAuthed) return;
    const token = getAccessToken();
    if (!token) return;

    // Add user message
    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Add AI placeholder (streaming)
    const aiPlaceholder: Message = { role: 'ai', text: '', streaming: true };
    setMessages(prev => [...prev, aiPlaceholder]);
    setIsStreaming(true);

    // Build history BEFORE adding the new user message (exclude placeholder)
    const history = buildHistory([...messages, userMsg]);
    // Remove the last entry (the user message we just added) from history
    history.pop();

    try {
      abortRef.current = new AbortController();

      const response = await fetch(STREAM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text, history, systemPrompt: VITARA_SYSTEM_PROMPT }),
        signal: abortRef.current.signal,
      });

      if (response.status === 401) {
        // Token expired saat streaming — auth context akan handle refresh
        setIsStreaming(false);
        setMessages(prev => prev.slice(0, -1));
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error(`Server error: ${response.status}`);
      }

      /* ── Read SSE stream chunk by chunk ── */
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const payload = trimmed.slice(5).trim(); // remove "data: "
          if (payload === '[DONE]') break;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) {
              aiText += parsed.text;
              // Update the last message (AI streaming bubble) in real-time
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: 'ai', text: aiText, streaming: true };
                return copy;
              });
            }
          } catch {
            // ignore parse errors for partial chunks
          }
        }
      }

      // Mark streaming done
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: 'ai', text: aiText, streaming: false };
        return copy;
      });

    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User cancelled — keep whatever text was streamed
        setMessages(prev => {
          const copy = [...prev];
          if (copy[copy.length - 1]?.streaming) {
            copy[copy.length - 1] = { ...copy[copy.length - 1], streaming: false };
          }
          return copy;
        });
      } else {
        const errMsg: Message = {
          role: 'ai',
          text: '⚠️ Gagal terhubung ke server. Periksa koneksi internet kamu.',
          streaming: false,
        };
        setMessages(prev => [...prev.slice(0, -1), errMsg]);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming, messages, buildHistory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleClear = () => {
    if (confirm('Hapus semua percakapan?')) {
      setMessages([]);
    }
  };

  /* ═══════════════════════════════════ RENDER ═══════════════════════════════ */
  return (
    <div className={`flex flex-col overflow-hidden ${isFullscreen ? 'w-full h-full bg-surface' : 'w-full h-full bg-surface'}`}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className={`bg-gradient-to-r from-primary via-primary to-primary-container text-white shrink-0 shadow-md relative ${isFullscreen ? 'p-5 md:p-6 lg:px-12' : 'p-4'}`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            {isFullscreen && (
              <a href="/" className="mr-2 w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition-all bg-white/10 border border-white/20" title="Kembali">
                <span className="material-symbols-outlined text-white">arrow_back</span>
              </a>
            )}
            <div className={`rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner ${isFullscreen ? 'w-12 h-12' : 'w-10 h-10'}`}>
              <span className={`material-symbols-outlined text-white ${isFullscreen ? 'text-2xl' : ''}`}>smart_toy</span>
            </div>
            <div>
              <h3 className={`font-bold font-headline leading-tight text-white ${isFullscreen ? 'text-xl md:text-2xl' : ''}`}>
                Vitara AI
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-amber-400 animate-pulse' : 'bg-green-400 animate-pulse'}`} />
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/80">
                  {isStreaming ? 'Mengetik...' : 'Online & Ready'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-1 md:gap-2">
            {messages.length > 0 && (
              <button onClick={handleClear} className="w-9 h-9 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center" title="Hapus Riwayat">
                <span className="material-symbols-outlined text-xl text-white/90">delete_sweep</span>
              </button>
            )}
            {!isFullscreen && onFullscreen && (
              <button onClick={onFullscreen} className="w-9 h-9 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center" title="Layar Penuh">
                <span className="material-symbols-outlined text-xl text-white">open_in_full</span>
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center" title="Tutup">
                <span className="material-symbols-outlined text-xl text-white">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Auth Banner: muncul HANYA setelah context selesai loading & belum login ── */}
      {!authLoading && !isAuthed && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 text-lg">lock</span>
            <p className="text-sm text-red-700 font-semibold">Silakan login untuk menggunakan chat.</p>
          </div>
          <a href="/login" className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-600 transition shrink-0">
            Login →
          </a>
        </div>
      )}


      {/* ── Disclaimer ──────────────────────────────────────────────────────── */}
      <div className={`bg-amber-500/10 border-b border-amber-500/20 flex gap-2 items-start shrink-0 ${isFullscreen ? 'px-4 py-2.5 md:px-8 md:py-4' : 'px-3 py-2'}`}>
        <span className={`material-symbols-outlined text-amber-600 mt-0.5 shrink-0 ${isFullscreen ? 'text-[18px] md:text-xl' : 'text-[16px]'}`} style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
        <p className={`text-amber-800 leading-tight font-medium ${isFullscreen ? 'text-[11px] md:text-sm' : 'text-[10px]'}`}>
          Asisten ini menggunakan AI. Saran yang diberikan <strong className="font-bold">bukan pengganti nasihat dokter profesional</strong>.
        </p>
      </div>

      {/* ── Message Area ────────────────────────────────────────────────────── */}
      <div className="flex-1 relative flex flex-col overflow-hidden bg-[#f1f5f9]">
        {/* Background decoration */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px] animate-pulse delay-1000" />
        </div>

        <div
          ref={scrollRef}
          className={`flex-1 overflow-y-auto scroll-smooth relative z-10 ${isFullscreen ? 'p-5 md:p-8 max-w-4xl mx-auto w-full' : 'p-4'}`}
        >
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4 opacity-70 min-h-[200px]">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10">
                <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xl text-on-surface">Halo! Saya Vitara</h4>
                <p className="text-sm text-on-surface-variant max-w-[260px] mx-auto">
                  Asisten kesehatan AI Petit Klinik. Tanyakan gejala, tips sehat, atau apa pun!
                </p>
              </div>
              {/* Quick prompts */}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {['Apa itu demam berdarah?', 'Tips menjaga imun', 'Kapan harus ke dokter?'].map(q => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 group/msg`}
              >
                {/* AI avatar */}
                {m.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-3 border border-primary/20 mt-1">
                    <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                  </div>
                )}

                <div className={`flex flex-col gap-1 ${isFullscreen ? 'max-w-[85%]' : 'max-w-[80%]'}`}>
                  {/* Bubble */}
                  <div className={`px-4 py-3 rounded-2xl text-[14px] shadow-md leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-primary-container text-white rounded-tr-none'
                      : 'bg-white text-on-surface rounded-tl-none border border-outline-variant/20 prose prose-sm max-w-none break-words'
                  }`}>
                    {m.role === 'user' ? (
                      m.text
                    ) : (
                      <>
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                        {/* Streaming cursor */}
                        {m.streaming && (
                          <span className="inline-block w-2 h-4 bg-primary/70 ml-0.5 animate-pulse rounded-sm align-middle" />
                        )}
                      </>
                    )}
                  </div>

                  {/* Rating — only for finished AI messages */}
                  {m.role === 'ai' && !m.streaming && m.text.length > 0 && (
                    <div className={`flex items-center gap-1.5 mt-1 ml-1 transition-opacity duration-300 ${ratings[i] ? 'opacity-100' : 'opacity-0 group-hover/msg:opacity-100'}`}>
                      <button
                        onClick={() => setRatings(prev => ({ ...prev, [i]: prev[i] === 'up' ? undefined as any : 'up' }))}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${ratings[i] === 'up' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-primary hover:bg-primary/5'}`}
                      >
                        <span className="material-symbols-outlined text-[14px]" style={ratings[i] === 'up' ? { fontVariationSettings: "'FILL' 1" } : undefined}>thumb_up</span>
                        {ratings[i] === 'up' && <span>Membantu</span>}
                      </button>
                      <button
                        onClick={() => setRatings(prev => ({ ...prev, [i]: prev[i] === 'down' ? undefined as any : 'down' }))}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${ratings[i] === 'down' ? 'bg-error/10 text-error' : 'text-slate-400 hover:text-error hover:bg-error/5'}`}
                      >
                        <span className="material-symbols-outlined text-[14px]" style={ratings[i] === 'down' ? { fontVariationSettings: "'FILL' 1" } : undefined}>thumb_down</span>
                        {ratings[i] === 'down' && <span>Kurang</span>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Streaming skeleton (before text starts) */}
            {isStreaming && messages[messages.length - 1]?.role === 'ai' && messages[messages.length - 1]?.text === '' && (
              <div className="flex justify-start items-end animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-3 border border-primary/20">
                  <span className="material-symbols-outlined text-[16px] text-primary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none border border-outline-variant/20 shadow-md px-5 py-4 space-y-2 w-44">
                  <div className="h-2 bg-slate-100 rounded-full w-full animate-pulse" />
                  <div className="h-2 bg-slate-100 rounded-full w-5/6 animate-pulse delay-75" />
                  <div className="h-2 bg-slate-100 rounded-full w-4/6 animate-pulse delay-150" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Input Area ──────────────────────────────────────────────────────── */}
      <div className={`relative z-20 border-t border-outline-variant/10 shrink-0 bg-white/80 backdrop-blur-md ${isFullscreen ? 'p-4 md:p-6 flex justify-center' : 'p-3'}`}>
        <div className={`relative flex items-end gap-2 ${isFullscreen ? 'max-w-4xl w-full' : 'w-full'}`}>
          {/* Textarea for multi-line input */}
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={!isAuthed ? 'Login dulu untuk mulai chat...' : 'Ketik pesan... (Enter untuk kirim)'}
            disabled={!isAuthed}
            rows={1}
            className={`flex-1 bg-white border border-outline-variant/30 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none placeholder:text-outline-variant/70 font-medium shadow-sm overflow-hidden ${isFullscreen ? 'pl-5 pr-4 py-3.5 text-sm md:text-base' : 'pl-4 pr-4 py-3 text-sm'}`}
            style={{ maxHeight: 120 }}
            onInput={e => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 120) + 'px';
            }}
          />

          {/* Stop button when streaming */}
          {isStreaming ? (
            <button
              onClick={handleStop}
              className="w-11 h-11 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 active:scale-95 transition-all shadow-lg shrink-0"
              title="Hentikan"
            >
              <span className="material-symbols-outlined text-xl">stop</span>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() || !isAuthed}
              className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 shadow-lg shadow-primary/25 shrink-0"
              title="Kirim"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
