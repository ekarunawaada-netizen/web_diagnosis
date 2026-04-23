"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
  };

  const NavLinks = () => (
    <>
      <Link onClick={closeMenus} className="font-headline font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors" href="/">Beranda</Link>
      <Link onClick={closeMenus} className="font-headline font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors" href="/diagnosis">Diagnosis</Link>
      <Link onClick={closeMenus} className="font-headline font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors" href="/history">Riwayat</Link>
      <Link onClick={closeMenus} className="font-headline font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors" href="/clinic">Cari Klinik</Link>
    </>
  );

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm dark:shadow-none">
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 max-w-[1440px] mx-auto">
        <Link href="/" onClick={closeMenus} className="text-2xl font-bold font-headline shrink-0 flex items-center gap-3">
          <Image src="/logo.png" alt="Petit Klinik Logo" width={48} height={48} className="object-contain mix-blend-multiply dark:mix-blend-lighten" />
          <span className="bg-gradient-to-br from-blue-700 to-blue-500 bg-clip-text text-transparent">Petit Klinik</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          <NavLinks />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">


          {/* User Auth Buttons */}
          {user ? (
            <div className="flex items-center gap-1 sm:gap-3">
              <Link href="/settings" onClick={closeMenus} className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg font-semibold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition">
                <span className="material-symbols-outlined text-[20px]">account_circle</span>
                <span className="hidden sm:inline">{user.username}</span>
              </Link>
              <button
                onClick={() => { logout(); closeMenus(); }}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-95 duration-200"
                title="Keluar"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href="/login" onClick={closeMenus} className="px-3 sm:px-4 py-2 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition text-sm">Masuk</Link>
              <Link href="/register" onClick={closeMenus} className="px-3 sm:px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm shadow-sm hidden sm:block">Daftar</Link>
            </div>
          )}

          {/* Hamburger Button (Mobile) */}
          <button onClick={toggleMobileMenu} className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none ml-1">
            <span className="material-symbols-outlined transition-transform duration-200">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 shadow-xl border-b border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 border-b' : 'max-h-0 border-b-0'}`}>
        <div className="flex flex-col p-4 gap-2">
          <Link onClick={closeMenus} className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800/50 hover:text-blue-600 rounded-xl transition-colors flex items-center gap-3" href="/">
            <span className="material-symbols-outlined text-[20px]">home</span> Beranda
          </Link>
          <Link onClick={closeMenus} className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800/50 hover:text-blue-600 rounded-xl transition-colors flex items-center gap-3" href="/diagnosis">
            <span className="material-symbols-outlined text-[20px]">health_metrics</span> Diagnosis
          </Link>
          <Link onClick={closeMenus} className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800/50 hover:text-blue-600 rounded-xl transition-colors flex items-center gap-3" href="/history">
            <span className="material-symbols-outlined text-[20px]">history</span> Riwayat
          </Link>
          <Link onClick={closeMenus} className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800/50 hover:text-blue-600 rounded-xl transition-colors flex items-center gap-3" href="/clinic">
            <span className="material-symbols-outlined text-[20px]">local_hospital</span> Cari Klinik
          </Link>
          {!user && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <Link onClick={closeMenus} href="/register" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm">
                Daftar Sekarang
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
