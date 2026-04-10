"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return; // Simple validation
    login(email);
    router.push("/");
  };

  return (
    <div className="bg-background font-body text-on-surface flex flex-col min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm dark:shadow-none">
        <div className="flex justify-between items-center px-6 py-4 max-w-[1440px] mx-auto">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-br from-blue-700 to-blue-500 bg-clip-text text-transparent font-headline">
            MediScan
          </Link>
          <div className="hidden md:flex items-center gap-8 font-headline font-semibold tracking-tight">
            <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors" href="/">Beranda</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors" href="/diagnosis">Diagnosis</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors" href="/clinic">Cari Klinik</Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all active:scale-95 duration-200">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">notifications</span>
            </button>
            <Link href="/settings" className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all active:scale-95 duration-200">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">account_circle</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center px-6 py-24 relative overflow-hidden">
        {/* Decorative Elements for "Digital Sanctuary" feel */}
        <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[35rem] h-[35rem] rounded-full bg-secondary-container/20 blur-[100px]"></div>

        <div className="w-full max-w-[480px] z-10">
          {/* Login Card */}
          <div className="bg-white/80 backdrop-blur-md bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-[0_12px_32px_rgba(25,28,30,0.06)]">
            <div className="text-center mb-10">
              <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">Selamat Datang Kembali</h1>
              <p className="text-on-surface-variant font-body">Masuk ke akun MediScan Anda</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block font-label text-xs font-bold tracking-widest text-slate-500 uppercase px-1">USERNAME / EMAIL</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface placeholder:text-outline/60"
                    placeholder="Username/Email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-label text-xs font-bold tracking-widest text-slate-500 uppercase px-1">PASSWORD</label>
                  <a href="#" className="text-xs font-semibold text-primary hover:text-on-primary-fixed-variant transition-colors">Lupa Kata Sandi?</a>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface placeholder:text-outline/60"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:translate-y-[-1px] active:scale-[0.98] transition-all"
              >
                Masuk
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-10 flex items-center">
              <div className="flex-grow border-t border-outline-variant/30"></div>
              <span className="mx-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Atau masuk dengan</span>
              <div className="flex-grow border-t border-outline-variant/30"></div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-3 gap-4">
              <button className="flex items-center justify-center py-3 bg-surface-container-low hover:bg-surface-container-high rounded-xl transition-all active:scale-95 group">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAglGQHSMmmyi0ERa5sKUkBJeoKdEFoVYXiViC-hB9KJ1i5foT79HlecjqdbNJSUCSwPEmr5hP8QsAbVntev5LwyCyOEHW8cWjt2kX0Zc5HgPvlu2lPloRpghWd8OWLsfDaybkxolhWOskVhIhQnkA9XDYjRevCfFKQ8OBE31AfPIBDoxcEJriujzIfk1ZXaubQtlmSVSD--kqRy4FW3kUMs5XXvjGWwFX-J35L8PrBzHMCt__UazGasw20PeRdnq3dyZQP2nuW_FxK" alt="Google Logo" className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" />
              </button>
              <button className="flex items-center justify-center py-3 bg-surface-container-low hover:bg-surface-container-high rounded-xl transition-all active:scale-95 group">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-on-surface-variant group-hover:fill-black transition-all">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </button>
              <button className="flex items-center justify-center py-3 bg-surface-container-low hover:bg-surface-container-high rounded-xl transition-all active:scale-95 group">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-on-surface-variant group-hover:fill-[#1877F2] transition-all">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-on-surface-variant">Belum memiliki akun? <Link href="/register" className="font-bold text-primary hover:underline underline-offset-4">Daftar sekarang</Link></p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 gap-4 max-w-[1440px] mx-auto">
          <p className="font-['Inter'] text-xs uppercase tracking-widest text-slate-400">© 2024 MediScan Diagnosis Platform. Hak Cipta Dilindungi.</p>
          <div className="flex gap-6">
            <Link href="#" className="font-['Inter'] text-xs uppercase tracking-widest text-slate-500 hover:text-blue-500 hover:underline underline-offset-4 transition-opacity duration-300">Kebijakan Privasi</Link>
            <Link href="#" className="font-['Inter'] text-xs uppercase tracking-widest text-slate-500 hover:text-blue-500 hover:underline underline-offset-4 transition-opacity duration-300">Syarat & Ketentuan</Link>
            <Link href="#" className="font-['Inter'] text-xs uppercase tracking-widest text-slate-500 hover:text-blue-500 hover:underline underline-offset-4 transition-opacity duration-300">Bantuan</Link>
            <Link href="#" className="font-['Inter'] text-xs uppercase tracking-widest text-slate-500 hover:text-blue-500 hover:underline underline-offset-4 transition-opacity duration-300">Karir</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
