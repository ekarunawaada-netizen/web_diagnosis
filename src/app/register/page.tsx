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
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Petit Hospital Logo" className="h-10 w-10 object-contain invert brightness-0" style={{ filter: "brightness(0) invert(1)" }} />
                <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-on-primary">Petit Hospital</h1>
              </div>
              <p className="text-on-primary/90 text-lg max-w-sm leading-relaxed">Precision diagnostics for a healthier tomorrow. Create your sanctuary for medical history and real-time monitoring.</p>
            </div>

            <div className="relative z-10 space-y-8">
              <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl max-w-xs border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  <span className="font-headline font-bold text-on-primary-container">HIPAA Compliant</span>
                </div>
                <p className="text-on-surface-variant text-sm">Your medical data is encrypted with enterprise-grade security standards.</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
                    <img loading="lazy" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjUHGtiWoqG5F3GwqH2gZUWlYIdGxPWe0pXc4pV9V7M5g-C4OYMJuwn8zWQkwkV_qTt1FvzKBNL-C_KP9jiXFuPfNSTUZvdCxl5Ja0tJOpSIgK6ppE4A19Qxd8ZyVJzemk8cuELvOjihnsPdsDlHEb5eZ0-lIv7piDUC4vNy91qiJ9KD89ZrdpgRZ-9WI2dW3xKK-Q8eGbtqS0OrgEqNlpB4mJ-dvPZyAnMH3wP96Kz9tM1tM8DvgnJb-B0XP4HrzvxkiJ6zqVk4sV" alt="professional female doctor" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
                    <img loading="lazy" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVQqwCofQ6YiioGo6TxyvdotLamaBykjwk6zWrQPcL1Vp-q28-P5yX-6t2fbshBAP1Ccym4Y55URSuRpJXMwcGxIQoXPYaQZmsodTYb38ceJxp_7C9Fcbt4mHCNUCILrEwZiNEr0ZOWhf_AZ7txNQH6PMVcwVjWlvuJ5yGI34jPvn0XCrkBnf6-n3PYMNJs4VM24nD1yASa3JomvnqwyisZT1D60OXmI2wj0izkzTQvxvtRV8ytSA6bpQ4lJk4X0-FSWCwTgE5aXRU" alt="confident male doctor" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
                    <img loading="lazy" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDK9IsYTRfk2z_GDbULxeEXZBTNW_6o5_y6cbgxoG7ADoF0eo7FOUp90MSlw52xfax-r9YrixCQ-V-WNL9qcbBE15zz_9-gbcBin0eJjNv2xL3ysFFXQHAm1rQ-Innw74cscmG1vvzLS7N9bYMveX5VBGufYI6V05MF0VO2WInEAmwGP8Ktho2xWCXc2Hk7zYTrm-LsXTMqgREbFQkuAMw446HYZzsKIcGd3FyDI_cv3kHe1X4WTkzToTDmfz3a06s2Iyp-n1OeH6Pi" alt="female medical professional" className="w-full h-full object-cover" />
                  </div>
                </div>
                <p className="text-on-primary text-sm font-medium">Join 50k+ patients &amp; clinicians</p>
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
            <span className="font-manrope font-bold text-slate-900 dark:text-slate-100 text-lg block mb-2">Petit Hospital</span>
            <p className="font-inter text-xs text-slate-500 dark:text-slate-400 max-w-xs">© 2024 Petit Hospital Diagnostics. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link href="#" className="font-inter text-xs text-slate-500 hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link href="#" className="font-inter text-xs text-slate-500 hover:text-blue-600 transition-colors">Terms of Service</Link>
            <Link href="#" className="font-inter text-xs text-slate-500 hover:text-blue-600 transition-colors">HIPAA Compliance</Link>
            <Link href="#" className="font-inter text-xs text-slate-500 hover:text-blue-600 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
