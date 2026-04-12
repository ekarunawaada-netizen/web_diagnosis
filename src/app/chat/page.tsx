"use client";

import ChatWindow from '@/components/ChatWindow';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function FullscreenChatPage() {
  return (
    <div className="h-screen w-full bg-surface-container-lowest flex flex-col overflow-hidden">
      {/* Main Content Area - True Fullscreen */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Chat Container fills exactly 100% */}
        <div className="flex-1 flex flex-col w-full h-full border-none">
             <ChatWindow mode="fullscreen" />
        </div>
      </main>
    </div>
  );
}
