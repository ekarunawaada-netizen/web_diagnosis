"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ChatWindow from './ChatWindow';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Jangan tampilkan tombol floating jika sudah di halaman chat fullscreen
  if (pathname === '/chat') return null;

  const handleFullscreen = () => {
    setIsOpen(false);
    router.push('/chat');
  };

  return (
    <div className="fixed bottom-6 right-4 md:right-6 z-[60] flex flex-col items-end">
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

