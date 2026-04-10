"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, login } = useAuth();
  const router = useRouter();
  
  // Profile Form States
  const [name, setName] = useState(user?.name || 'Pasien MediScan');
  const [email, setEmail] = useState(user?.email || 'pasien@mediscan.id');
  const [phone, setPhone] = useState('+62 812 3456 7890');
  
  // Security Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);

  // Notification Form States
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, name);
    alert('Profil Anda yang baru telah dipublikasikan secara mendunia lewat MediScan Network.');
    router.refresh();
  };

  const handleSecuritySave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Kunci sandi baru tidak sinkron dengan konfirmasi, periksa lagi!');
      return;
    }
    alert('Benteng keamanan akun Anda sukses diperketat.');
  };

  const handleNotificationSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Jalur notifikasi preferensi Anda telah direkam dan disimpan.');
  };

  const tabs = [
    { id: 'profile', label: 'Profil Saya', icon: 'person' },
    { id: 'notifications', label: 'Notifikasi', icon: 'notifications' },
    { id: 'security', label: 'Keamanan', icon: 'security' },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto min-h-screen relative overflow-hidden">
        {/* Background Ambient Ornaments */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[0%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[80px]"></div>
          <div className="absolute bottom-[0%] right-[10%] w-[600px] h-[600px] rounded-full bg-tertiary/10 blur-[100px]"></div>
        </div>

        {/* Header */}
        <div className="mb-12 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-on-surface to-outline mb-3 font-headline pb-1">
            Pengaturan Sistem
          </h1>
          <p className="text-on-surface-variant text-lg font-medium">Kalibrasi preferensi medis dan perisai akun Anda dengan antarmuka presisi tinggi.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-10 relative z-10">
          {/* Sidebar Tabs */}
          <aside className="md:w-72 lg:w-80 flex-shrink-0 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150 fill-mode-both">
            <div className="bg-surface/60 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-lg shadow-slate-200/50 p-4 sticky top-28 overflow-hidden group">
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
              <ul className="flex flex-row md:flex-col gap-3 relative z-10 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-5 py-4 rounded-xl font-bold flex items-center gap-4 transition-all duration-300 md:whitespace-normal whitespace-nowrap active:scale-95 border ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-primary to-primary-container text-white shadow-md shadow-primary/20 border-primary'
                          : 'text-on-surface-variant hover:bg-surface hover:text-primary hover:shadow-sm border-transparent hover:border-primary/20 hover:-translate-y-0.5'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl" style={activeTab === tab.id ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                        {tab.icon}
                      </span>
                      <span className="font-headline tracking-wide">{tab.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="hidden md:block mt-8 pt-8 border-t border-outline-variant/20 px-4 relative z-10">
                 <p className="text-xs font-bold text-outline-variant uppercase tracking-widest mb-4">Informasi Perangkat</p>
                 <div className="flex items-center gap-3 text-sm text-on-surface font-medium bg-surface-container/50 p-3 rounded-xl border border-outline-variant/10">
                    <span className="material-symbols-outlined text-outline">devices</span>
                    Session Active
                    <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse shadow-sm shadow-primary"></div>
                 </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-grow animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
            <div className="bg-surface/80 backdrop-blur-xl p-5 md:p-8 lg:p-12 rounded-[1.5rem] md:rounded-[2rem] border border-white/80 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
               {/* Decorative subtle gradient background for the panel */}
              <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-secondary-container/30 rounded-full blur-[80px] pointer-events-none"></div>

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 relative z-10">
                  <div className="flex gap-4 items-center mb-10 pb-6 border-b border-outline-variant/20">
                     <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
                         <span className="material-symbols-outlined text-3xl">badge</span>
                     </div>
                     <div>
                        <h2 className="text-2xl font-black font-headline text-on-surface">Data Demografi Diri</h2>
                        <p className="text-on-surface-variant font-medium mt-1">Data ini membantu tenaga medis menyapa Anda dengan tepat.</p>
                     </div>
                  </div>
                  
                  <form onSubmit={handleProfileSave} className="max-w-xl">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8 mb-10 bg-surface-container-lowest/50 p-6 rounded-[1.5rem] border border-outline-variant/10 shadow-sm text-center sm:text-left">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-500 cursor-pointer overflow-hidden border-2 border-white">
                          <Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200" alt="Avatar" width={96} height={96} className="w-full h-full object-cover" />
                        </div>
                        <button type="button" className="absolute bottom-0 right-0 bg-secondary text-white p-2 rounded-full shadow-md hover:bg-secondary/90 transition-colors active:scale-95 border-2 border-white">
                          <span className="material-symbols-outlined text-sm">photo_camera</span>
                        </button>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{name}</h3>
                        <p className="text-outline-variant text-sm font-medium">Terverifikasi Publik</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="group">
                        <label className="block text-xs font-bold font-label uppercase tracking-widest text-outline mb-2 group-focus-within:text-primary transition-colors">Nama Sesuai KTP</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-surface-container-lowest px-5 py-4 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-on-surface shadow-sm outline-none"
                          required
                        />
                      </div>
                      <div className="group">
                        <label className="block text-xs font-bold font-label uppercase tracking-widest text-outline mb-2 group-focus-within:text-primary transition-colors">Surat Elektronik (Email)</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-surface-container-lowest px-5 py-4 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-on-surface shadow-sm outline-none"
                          required
                        />
                      </div>
                      <div className="group">
                        <label className="block text-xs font-bold font-label uppercase tracking-widest text-outline mb-2 group-focus-within:text-primary transition-colors">Nomor Telepon Seluler</label>
                        <div className="flex gap-3">
                           <span className="bg-surface-container-lowest border border-outline-variant/30 px-5 py-4 rounded-xl font-bold text-outline-variant flex items-center justify-center shadow-sm">
                             <span className="material-symbols-outlined text-outline">language</span>
                           </span>
                           <input
                             type="tel"
                             value={phone}
                             onChange={(e) => setPhone(e.target.value)}
                             className="flex-grow bg-surface-container-lowest px-5 py-4 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-on-surface shadow-sm outline-none"
                           />
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="mt-10 px-8 py-4 bg-primary text-white rounded-xl font-black shadow-[0_10px_30px_rgba(0,100,255,0.25)] hover:shadow-[0_15px_40px_rgba(0,100,255,0.4)] hover:-translate-y-1 active:scale-95 transition-all w-full md:w-auto">
                      Simpan Perubahan
                    </button>
                  </form>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 relative z-10">
                  <div className="flex gap-4 items-center mb-10 pb-6 border-b border-outline-variant/20">
                     <div className="w-14 h-14 rounded-2xl bg-tertiary-container text-tertiary flex items-center justify-center border border-tertiary/20 shadow-sm shrink-0">
                         <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                     </div>
                     <div>
                        <h2 className="text-2xl font-black font-headline text-on-surface">Frekuensi Peringatan</h2>
                        <p className="text-on-surface-variant font-medium mt-1">Mengontrol bagaimana MediScan memanggil Anda saat ada darurat.</p>
                     </div>
                  </div>

                  <form onSubmit={handleNotificationSave} className="max-w-xl space-y-8">
                    <div className="flex justify-between items-center p-6 bg-surface-container-lowest/50 rounded-2xl border border-outline-variant/10 shadow-sm hover:border-outline-variant/30 transition-colors">
                      <div>
                        <h4 className="font-bold text-lg text-on-surface flex items-center gap-2">
                          Notifikasi Email <span className="material-symbols-outlined text-outline text-base">mail</span>
                        </h4>
                        <p className="text-sm text-on-surface-variant font-medium mt-1">Laporan Diagnosis & Pengingat Jadwal.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
                        <div className="w-14 h-8 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                      </label>
                    </div>

                    <div className="flex justify-between items-center p-6 bg-surface-container-lowest/50 rounded-2xl border border-outline-variant/10 shadow-sm hover:border-outline-variant/30 transition-colors">
                      <div>
                        <h4 className="font-bold text-lg text-on-surface flex items-center gap-2">
                          Notifikasi SMS / WhatsApp <span className="material-symbols-outlined text-outline text-base">chat</span>
                        </h4>
                        <p className="text-sm text-on-surface-variant font-medium mt-1">Kode OTP & Link Konsultasi Super Cepat.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={smsNotif} onChange={() => setSmsNotif(!smsNotif)} />
                        <div className="w-14 h-8 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                      </label>
                    </div>

                    <div className="flex justify-between items-center p-6 bg-surface-container-lowest/50 rounded-2xl border border-outline-variant/10 shadow-sm hover:border-outline-variant/30 transition-colors">
                      <div>
                        <h4 className="font-bold text-lg text-on-surface flex items-center gap-2">
                          Notifikasi Perangkat <i>(Push)</i> <span className="material-symbols-outlined text-outline text-base">notifications_active</span>
                        </h4>
                        <p className="text-sm text-on-surface-variant font-medium mt-1">Sembunyikan atau perlihatkan spanduk peringatan di layar gawai.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={pushNotif} onChange={() => setPushNotif(!pushNotif)} />
                        <div className="w-14 h-8 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-tertiary shadow-inner"></div>
                      </label>
                    </div>

                    <button type="submit" className="mt-6 px-8 py-4 bg-tertiary text-white rounded-xl font-black shadow-[0_10px_30px_rgba(255,100,100,0.25)] hover:shadow-[0_15px_40px_rgba(255,100,100,0.35)] hover:-translate-y-1 active:scale-95 transition-all w-full md:w-auto">
                      Simpan Jalur Komunikasi
                    </button>
                  </form>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 relative z-10">
                   <div className="flex gap-4 items-center mb-10 pb-6 border-b border-outline-variant/20">
                     <div className="w-14 h-14 rounded-2xl bg-error-container text-error flex items-center justify-center border border-error/20 shadow-sm shrink-0">
                         <span className="material-symbols-outlined text-3xl">lock</span>
                     </div>
                     <div>
                        <h2 className="text-2xl font-black font-headline text-on-surface">Benteng Kriptografi</h2>
                        <p className="text-on-surface-variant font-medium mt-1">Ubah pin dan gembok tambahan pencegah intervensi luar.</p>
                     </div>
                  </div>

                  <form onSubmit={handleSecuritySave} className="max-w-xl">
                    <div className="space-y-6">
                      <div className="group">
                        <label className="block text-xs font-bold font-label uppercase tracking-widest text-outline mb-2 group-focus-within:text-error transition-colors">Pin Sandi Lama</label>
                        <div className="relative">
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-surface-container-lowest px-5 py-4 rounded-xl border border-outline-variant/30 focus:border-error focus:ring-4 focus:ring-error/10 transition-all font-bold text-on-surface shadow-sm outline-none"
                          />
                          <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-outline-variant cursor-pointer hover:text-on-surface">visibility_off</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                          <label className="block text-xs font-bold font-label uppercase tracking-widest text-outline mb-2 group-focus-within:text-error transition-colors">Pin Sandi Baur</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-surface-container-lowest px-5 py-4 rounded-xl border border-outline-variant/30 focus:border-error focus:ring-4 focus:ring-error/10 transition-all font-bold text-on-surface shadow-sm outline-none"
                          />
                        </div>
                        <div className="group">
                          <label className="block text-xs font-bold font-label uppercase tracking-widest text-outline mb-2 group-focus-within:text-error transition-colors">Tulis Ulang Sandi Baur</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-surface-container-lowest px-5 py-4 rounded-xl border border-outline-variant/30 focus:border-error focus:ring-4 focus:ring-error/10 transition-all font-bold text-on-surface shadow-sm outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-outline-variant/20">
                      <div className="flex justify-between items-center p-6 bg-error/5 rounded-2xl border border-error/20 shadow-sm group hover:bg-error/10 transition-colors">
                        <div>
                          <h4 className="font-black text-lg text-error flex items-center gap-2">
                            Akses Ganda <span className="material-symbols-outlined text-base">verified_user</span>
                          </h4>
                          <p className="text-sm text-on-surface-variant font-medium mt-1">Setiap kali login butuh sidik jari atau PIN tambahan.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
                          <div className="w-14 h-8 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-error shadow-inner"></div>
                        </label>
                      </div>
                    </div>

                    <button type="submit" className="mt-10 px-8 py-4 bg-error text-white rounded-xl font-black shadow-[0_10px_30px_rgba(255,50,50,0.25)] hover:shadow-[0_15px_40px_rgba(255,50,50,0.4)] hover:-translate-y-1 active:scale-95 transition-all w-full md:w-auto flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined">enhanced_encryption</span> Kunci Perubahan
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
