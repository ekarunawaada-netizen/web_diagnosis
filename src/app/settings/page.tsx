"use client";

import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Profile Form States
  const [name, setName] = useState(user?.username || 'Pasien Petit Klinik');
  const [phone, setPhone] = useState('+62 812 3456 7890');
  const [avatarUrl, setAvatarUrl] = useState('https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Note: Profile update API not yet connected — this is a UI-only save
    alert('Profil Anda telah disimpan secara lokal.');
    router.refresh();
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-6 min-h-screen relative overflow-hidden bg-slate-50">
        {/* Background Ambient Ornaments */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[0%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[80px]"></div>
          <div className="absolute bottom-[0%] right-[10%] w-[600px] h-[600px] rounded-full bg-tertiary/10 blur-[100px]"></div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          {/* Main Content Area - Centered Card */}
          <div className="bg-white/80 backdrop-blur-xl p-6 md:p-12 rounded-[2rem] border border-white shadow-2xl shadow-slate-200/50 relative overflow-hidden">
             {/* Decorative subtle gradient background for the panel */}
            <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-secondary-container/30 rounded-full blur-[80px] pointer-events-none"></div>

            {/* PROFILE CONTENT */}
            <div className="relative z-10">
              <div className="flex gap-4 items-center mb-10 pb-6 border-b border-slate-100">
                 <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
                     <span className="material-symbols-outlined text-3xl">badge</span>
                 </div>
                 <div>
                    <h2 className="text-2xl font-black font-headline text-slate-800">Profil Saya</h2>
                    <p className="text-slate-500 font-medium mt-1">Profil pribadi kamu.</p>
                 </div>
              </div>
              
              <form onSubmit={handleProfileSave} className="space-y-10">
                {/* Avatar Section - Centered */}
                <div className="flex flex-col items-center gap-4 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                  <div className="relative group">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div 
                      onClick={triggerFileInput}
                      className="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary/20 group-hover:scale-105 transition-transform duration-500 cursor-pointer overflow-hidden border-4 border-white"
                    >
                      <Image src={avatarUrl} alt="Avatar" width={128} height={128} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="font-black text-xl text-slate-800">{name}</h3>
                  </div>
                </div>

                <div className="space-y-6 max-w-xl mx-auto">
                  <div className="group">
                    <label className="block text-[11px] font-black font-label uppercase tracking-widest text-slate-400 mb-2 group-focus-within:text-primary transition-colors">Nama Sesuai KTP</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 pl-12 pr-5 py-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800 shadow-sm outline-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-[11px] font-black font-label uppercase tracking-widest text-slate-400 mb-2 group-focus-within:text-primary transition-colors">Nomor Telepon Seluler</label>
                    <div className="flex gap-3">
                       <span className="bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl font-bold text-slate-400 flex items-center justify-center shadow-sm">
                         <span className="material-symbols-outlined text-xl">call</span>
                       </span>
                       <input
                         type="tel"
                         value={phone}
                         onChange={(e) => setPhone(e.target.value)}
                         className="flex-grow bg-slate-50 px-5 py-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800 shadow-sm outline-none"
                       />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-center">
                  <button type="submit" className="px-12 py-4 bg-primary text-white rounded-2xl font-black shadow-[0_10px_30px_rgba(0,100,255,0.3)] hover:shadow-[0_15px_40px_rgba(0,100,255,0.45)] hover:-translate-y-1 active:scale-95 transition-all w-full sm:w-auto">
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
