"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm dark:shadow-none">
      <div className="flex justify-between items-center px-6 py-4 max-w-[1440px] mx-auto">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-br from-blue-700 to-blue-500 bg-clip-text text-transparent font-headline">
          MediScan
        </Link>
        <div className="hidden md:flex gap-8 items-center">
          <Link className="font-headline font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors" href="/">Beranda</Link>
          <Link className="font-headline font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors" href="/diagnosis">Diagnosis</Link>
          <Link className="font-headline font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors" href="/clinic">Cari Klinik</Link>
          <Link className="font-headline font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors" href="/appointments">Janji Temu</Link>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all active:scale-95 duration-200">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">notifications</span>
          </button>
          
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/settings" className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold text-sm hover:bg-blue-100 transition">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">account_circle</span>
                <span className="hidden sm:inline">{user.name}</span>
              </Link>
              <button 
                onClick={logout}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-95 duration-200"
                title="Keluar"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition text-sm">Masuk</Link>
              <Link href="/register" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm shadow-sm">Daftar</Link>
            </div>
          )}

          <button className="md:hidden p-2">
            <span className="material-symbols-outlined text-slate-600">menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
