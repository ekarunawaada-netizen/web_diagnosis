"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ChatWindow from './ChatWindow';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isHiddenByFooter, setIsHiddenByFooter] = useState(false);

  useEffect(() => {
    const footer = document.getElementById('main-footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHiddenByFooter(entry.isIntersecting);
      },
      { threshold: 0.1 } // Sembunyikan jika 10% footer terlihat
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // Jangan tampilkan tombol floating jika di halaman chat fullscreen atau halaman legal/bantuan
  const hiddenPaths = ['/chat', '/privacy', '/terms', '/help'];
  if (hiddenPaths.includes(pathname)) return null;

  const handleFullscreen = () => {
    setIsOpen(false);
    router.push('/chat');
  };

  return (
    <div className={`fixed bottom-6 right-4 md:right-6 z-[60] flex flex-col items-end transition-all duration-500 ease-in-out ${
      isHiddenByFooter ? 'opacity-0 translate-y-20 pointer-events-none' : 'opacity-100 translate-y-0'
    }`}>
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-2rem)] sm:w-[350px] md:w-[400px] h-[min(550px,75vh)] rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-300">
          <ChatWindow 
            mode="floating" 
            onClose={() => setIsOpen(false)} 
            onFullscreen={handleFullscreen}
          />
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

