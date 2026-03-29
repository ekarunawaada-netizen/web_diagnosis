"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return; // Simple validation
    // Simply redirect to login upon successful "dummy" registration
    router.push("/login");
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-xl shadow-sm bg-surface-container-lowest">
          
          {/* Left Side: Visual/Editorial Branding */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0061a4] to-[#2196f3] relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-on-primary mb-4">MediScan</h1>
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
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjUHGtiWoqG5F3GwqH2gZUWlYIdGxPWe0pXc4pV9V7M5g-C4OYMJuwn8zWQkwkV_qTt1FvzKBNL-C_KP9jiXFuPfNSTUZvdCxl5Ja0tJOpSIgK6ppE4A19Qxd8ZyVJzemk8cuELvOjihnsPdsDlHEb5eZ0-lIv7piDUC4vNy91qiJ9KD89ZrdpgRZ-9WI2dW3xKK-Q8eGbtqS0OrgEqNlpB4mJ-dvPZyAnMH3wP96Kz9tM1tM8DvgnJb-B0XP4HrzvxkiJ6zqVk4sV" alt="professional female doctor" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVQqwCofQ6YiioGo6TxyvdotLamaBykjwk6zWrQPcL1Vp-q28-P5yX-6t2fbshBAP1Ccym4Y55URSuRpJXMwcGxIQoXPYaQZmsodTYb38ceJxp_7C9Fcbt4mHCNUCILrEwZiNEr0ZOWhf_AZ7txNQH6PMVcwVjWlvuJ5yGI34jPvn0XCrkBnf6-n3PYMNJs4VM24nD1yASa3JomvnqwyisZT1D60OXmI2wj0izkzTQvxvtRV8ytSA6bpQ4lJk4X0-FSWCwTgE5aXRU" alt="confident male doctor" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDK9IsYTRfk2z_GDbULxeEXZBTNW_6o5_y6cbgxoG7ADoF0eo7FOUp90MSlw52xfax-r9YrixCQ-V-WNL9qcbBE15zz_9-gbcBin0eJjNv2xL3ysFFXQHAm1rQ-Innw74cscmG1vvzLS7N9bYMveX5VBGufYI6V05MF0VO2WInEAmwGP8Ktho2xWCXc2Hk7zYTrm-LsXTMqgREbFQkuAMw446HYZzsKIcGd3FyDI_cv3kHe1X4WTkzToTDmfz3a06s2Iyp-n1OeH6Pi" alt="female medical professional" className="w-full h-full object-cover" />
                  </div>
                </div>
                <p className="text-on-primary text-sm font-medium">Join 50k+ patients & clinicians</p>
              </div>
            </div>

            {/* Abstract Decorative Elements */}
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20 pointer-events-none">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe9LAxIV6ntx8JnulfW47L9Hmgyj45AIe_Dqwh4v-oqyJUBN7LJeGCeaqRtW80w3QvHRhxxvadOUoxO3MHnRYFELYobRbLq8gy4PMJuPZZblylqOoL0COMSd8eYD1m81GGYJamqOeIfvQxNwX_n1aXjqTTaiXhOqWRW2JNxM0eeIBnwdC5Dz8saAsFI6GYIU5JWAm9t_eFf6XVAOeVs3fNYfAo6ocJiV8v4CmJmt2Ms18bw-0MF5Q0bND1HRixUXWZkR7oacYnho1D" alt="abstract blue digital medical data visualization" className="w-full h-full object-cover mix-blend-overlay" />
            </div>
          </div>

          {/* Right Side: Registration Form */}
          <div className="p-8 md:p-12 flex flex-col justify-center bg-surface-container-lowest">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Buat Akun Baru</h2>
              <p className="text-on-surface-variant">Mulai perjalanan kesehatan Anda hari ini.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase">Nama Lengkap</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary">person</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-on-surface-variant/50"
                    placeholder="Masukkan nama lengkap Anda"
                  />
                </div>
              </div>

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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase">Kata Sandi</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary">lock</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-on-surface-variant/50"
                    placeholder="Min. 8 karakter"
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-br from-[#0061a4] to-[#2196f3] text-on-primary font-headline font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all active:scale-95"
              >
                Daftar Sekarang
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-container-high"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-surface-container-lowest px-4 text-on-surface-variant font-medium">Atau daftar dengan</span></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button className="flex items-center justify-center p-3 border border-outline-variant/20 rounded-xl hover:bg-surface-container-low transition-colors">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUXIlOmViYT_Ia62Hsc8qAk9FTiTqV5Oeoss08FH5sW4YnkRFc9mqOzTaUsIfI1DmlR5kGRhX_4iqLXFVZdENFsMcpjhfQNZzIVEAH5Kv2QbUoRQIFeMeQy0VlOkK6MDVpqeAPBqFcqkFEYPty-1lIv9qraYDBL3Prp-7KcuDovbJMwVqJhikcOrGyu3QHpXXNndaYVJUNCW420vXZ4j_9_gvP7kNHwOCHyDnDtx2AF0d4mcLaqsSCc_S-Y97fSkkK0P-TI2EMCvEG" alt="Google" className="w-5 h-5" />
              </button>
              <button className="flex items-center justify-center p-3 border border-outline-variant/20 rounded-xl hover:bg-surface-container-low transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-on-surface" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
              </button>
              <button className="flex items-center justify-center p-3 border border-outline-variant/20 rounded-xl hover:bg-surface-container-low transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#1877F2]" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
              </button>
            </div>

            <div className="mt-10 text-center">
              <p className="text-on-surface-variant text-sm">
                Sudah punya akun? <Link href="/login" className="text-primary font-bold hover:underline">Masuk</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 max-w-7xl mx-auto">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <span className="font-manrope font-bold text-slate-900 dark:text-slate-100 text-lg block mb-2">MediScan</span>
            <p className="font-inter text-xs text-slate-500 dark:text-slate-400 max-w-xs">© 2024 MediScan Diagnostics. All rights reserved.</p>
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
