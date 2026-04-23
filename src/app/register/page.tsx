"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/axios";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !phone || !password) {
      setError("Semua field harus diisi.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    try {
      setLoading(true);
      await apiClient.post("/api/auth/register", {
        username,
        email,
        phone,
        password,
      });
      // Registration successful — redirect to login
      router.push("/login?registered=1");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Pendaftaran gagal. Silakan coba lagi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-xl shadow-sm bg-surface-container-lowest">
          
          {/* Left Side: Visual/Editorial Branding */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0061a4] to-[#2196f3] relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-5">
                <div className="h-12 w-12 bg-white rounded-xl shadow-md p-1.5 flex items-center justify-center">
                  <img src="/logo.png" alt="Petit Klinik Logo" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-white">Petit Klinik</h1>
              </div>
              <p className="text-on-primary/90 text-lg max-w-sm leading-relaxed">Diagnosis akurat untuk kesehatan masa depan. Simpan riwayat medis Anda dengan aman dan pantau perkembangan secara langsung.</p>
            </div>

            <div className="relative z-10 space-y-8">
              <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl max-w-xs border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  <span className="font-headline font-bold text-on-primary-container">Standar Keamanan Medis</span>
                </div>
                <p className="text-on-surface-variant text-sm">Data medis Anda sepenuhnya dienkripsi dengan sistem keamanan tingkat perusahaan.</p>
              </div>


            </div>

            {/* Abstract Decorative Elements */}
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Right Side: Registration Form */}
          <div className="p-8 md:p-12 flex flex-col justify-center bg-surface-container-lowest">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Buat Akun Baru</h2>
              <p className="text-on-surface-variant">Mulai perjalanan kesehatan Anda hari ini.</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100 mb-6 animate-in fade-in zoom-in-95">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Username */}
              <div className="space-y-2">
                <label className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase">Username</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary">badge</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-on-surface-variant/50"
                    placeholder="Pilih username unik Anda"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase">Email</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary">mail</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-on-surface-variant/50"
                    placeholder="contoh@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase">Nomor Telepon</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary">phone</span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-on-surface-variant/50"
                    placeholder="08xxxxxxxxxx"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase">Kata Sandi</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary">lock</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-on-surface-variant/50"
                    placeholder="Min. 8 karakter"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-br from-[#0061a4] to-[#2196f3] text-on-primary font-headline font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all active:scale-95 disabled:opacity-75 disabled:cursor-wait"
              >
                {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-on-surface-variant text-sm">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-primary font-bold hover:underline">Masuk</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 max-w-7xl mx-auto">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <span className="font-manrope font-bold text-slate-900 dark:text-slate-100 text-lg block mb-2">Petit Klinik</span>
            <p className="font-inter text-xs text-slate-500 dark:text-slate-400 max-w-xs">© 2026 Petit Klinik. Hak Cipta Dilindungi.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link href="#" className="font-inter text-xs text-slate-500 hover:text-blue-600 transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="font-inter text-xs text-slate-500 hover:text-blue-600 transition-colors">Syarat Ketentuan</Link>
            <Link href="#" className="font-inter text-xs text-slate-500 hover:text-blue-600 transition-colors">Keamanan Data</Link>
            <Link href="#" className="font-inter text-xs text-slate-500 hover:text-blue-600 transition-colors">Bantuan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
