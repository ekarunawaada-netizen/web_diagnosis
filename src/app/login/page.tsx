"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Load saved email on mount
  React.useEffect(() => {
    const savedEmail = localStorage.getItem("mediscan_remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return; // Simple validation
    
    try {
      setLoading(true);
      // Pass username/email, password, and rememberMe to the real backend
      await login(email, password, rememberMe);
      
      // Save email for convenience next time if rememberMe is checked
      if (rememberMe) {
        localStorage.setItem("mediscan_remembered_email", email);
      } else {
        localStorage.removeItem("mediscan_remembered_email");
      }
      
      router.push("/");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Gagal terhubung ke server. Periksa koneksi Anda.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-background font-body text-on-surface flex flex-col min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm dark:shadow-none">
        <div className="flex justify-between items-center px-6 py-4 max-w-[1440px] mx-auto">
          <Link href="/" className="text-2xl font-bold font-headline flex items-center gap-2">
            <img src="/logo.png" alt="Petit Klinik Logo" className="h-8 w-8 object-contain" />
            <span className="bg-gradient-to-br from-blue-700 to-blue-500 bg-clip-text text-transparent">Petit Klinik</span>
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
              <p className="text-on-surface-variant font-body">Masuk ke akun Anda</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100 mb-4 animate-in fade-in zoom-in-95">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="block font-label text-xs font-bold tracking-widest text-slate-500 uppercase px-1">NAMA PENGGUNA / EMAIL</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface placeholder:text-outline/60"
                    placeholder="Nama Pengguna/Email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-label text-xs font-bold tracking-widest text-slate-500 uppercase px-1">KATA SANDI</label>
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 bg-surface-container-highest rounded-md border border-outline/20 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[16px] scale-0 peer-checked:scale-100 transition-transform font-bold">check</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">Ingat Saya</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:translate-y-[-1px] active:scale-[0.98] transition-all disabled:opacity-75 disabled:cursor-wait"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>


            <div className="mt-8 text-center">
              <p className="text-sm text-on-surface-variant">Belum memiliki akun? <Link href="/register" className="font-bold text-primary hover:underline underline-offset-4">Daftar sekarang</Link></p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 gap-4 max-w-[1440px] mx-auto">
          <p className="font-['Inter'] text-xs uppercase tracking-widest text-slate-400">© 2026 Petit Klinik. Hak Cipta Dilindungi.</p>
          <div className="flex gap-6">
            <Link href="#" className="font-['Inter'] text-xs uppercase tracking-widest text-slate-500 hover:text-blue-500 hover:underline underline-offset-4 transition-opacity duration-300">Kebijakan Privasi</Link>
            <Link href="#" className="font-['Inter'] text-xs uppercase tracking-widest text-slate-500 hover:text-blue-500 hover:underline underline-offset-4 transition-opacity duration-300">Syarat Ketentuan</Link>
            <Link href="#" className="font-['Inter'] text-xs uppercase tracking-widest text-slate-500 hover:text-blue-500 hover:underline underline-offset-4 transition-opacity duration-300">Keamanan Data</Link>
            <Link href="#" className="font-['Inter'] text-xs uppercase tracking-widest text-slate-500 hover:text-blue-500 hover:underline underline-offset-4 transition-opacity duration-300">Bantuan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
