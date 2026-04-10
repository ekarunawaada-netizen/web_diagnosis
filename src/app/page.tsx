"use client";

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const initialTestimonials = [
  {
    id: 1,
    name: "Reza Mahardika",
    role: "Wiraswasta, Jakarta",
    rating: 5,
    text: "\"Fitur radar rumah sakitnya mencengangkan. Begitu sakit gigi parah jam 4 pagi, tombol 'Terdekat' memberitahu klinik operasi rahang mana yang siaga 24 jam sejauh 1 kilometer. Gila!\"",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80",
    isPrimary: false
  },
  {
    id: 2,
    name: "Siti Aisyah",
    role: "Pegawai Negeri, Surabaya",
    rating: 5,
    text: "\"PDF laporannya sangat dihormati oleh spesialis lambung saya. Mereka langsung paham anatomi keluhan yang dirunut oleh AI MediScan. Tidak perlu tebak-tebakan dari nol lagi di meja praktek.\"",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
    isPrimary: false,
    transform: "md:-translate-y-6"
  },
  {
    id: 3,
    name: "Bagas Pratama",
    role: "UI/UX Designer, Bandung",
    rating: 5,
    text: "\"Antarmukanya sungguh kelas kakap. Segala animasi transisinya mengingatkan saya pada aplikasi sekelas Silicon Valley. Smooth, cepat, responsif, dan yang pasti akurasi diagnosisnya menakutkan (dalam konotasi positif)!\"",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    isPrimary: true
  }
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({ name: '', role: '', text: '', rating: 5 });

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('user_testimonials');
    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved);
        setTestimonials([...initialTestimonials, ...parsedSaved]);
      } catch (e) {
        console.error('Error parsing testimonials', e);
      }
    }
  }, []);

  const handleTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.name || !newTestimonial.text) return;

    const added = {
      id: Date.now(),
      name: newTestimonial.name,
      role: newTestimonial.role || "Pengguna Baru",
      rating: newTestimonial.rating,
      text: `"${newTestimonial.text}"`,
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(newTestimonial.name)}`,
      isPrimary: false
    };

    setTestimonials((prev) => [...prev, added]);
    
    const saved = JSON.parse(localStorage.getItem('user_testimonials') || '[]');
    localStorage.setItem('user_testimonials', JSON.stringify([...saved, added]));
    
    setIsFormOpen(false);
    setNewTestimonial({ name: '', role: '', text: '', rating: 5 });
  };

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 7s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-float-slow {
          animation: float 9s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>

      <Navbar />
      <main className="pt-16 bg-surface overflow-x-hidden">
        
        {/* HERO SECTION */}
        <section className="relative min-h-[95vh] flex items-center overflow-hidden">
          {/* Background Ambient Ornaments */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary-container/30 blur-[100px]"></div>
            <div className="absolute bottom-[0%] left-[-10%] w-[500px] h-[500px] rounded-full bg-tertiary-container/20 blur-[80px]"></div>
            <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] rounded-full bg-secondary-container/20 blur-[60px]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 py-20">
            
            {/* Left Box: Copywriting */}
            <div className={`space-y-8 transition-all duration-1000 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-surface-container shadow-sm border border-outline-variant/30 text-on-surface-variant text-sm font-bold tracking-wide animate-float-slow">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                Revolusi Deteksi Medis Berbasis Kecerdasan
              </div>
              
              <h1 className="text-5xl md:text-[5.5rem] font-black font-headline leading-[1.05] text-on-surface tracking-tighter">
                Kesehatan Anda,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary animate-gradient">
                  Prioritas Utama
                </span> Kami.
              </h1>
              
              <p className="text-xl text-on-surface-variant max-w-lg leading-relaxed font-medium">
                Dapatkan analisis kesehatan instan, akurat, dan komprehensif. MediScan membantu Anda merekonstruksi gejala menjadi wawasan medis konkret dalam detik.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 pt-6">
                <Link href="/diagnosis" className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-[0_8px_30px_rgba(0,100,255,0.25)] hover:shadow-[0_12px_40px_rgba(0,100,255,0.4)] hover:-translate-y-1 transition-all active:scale-95 text-lg text-center flex items-center justify-center gap-2 group">
                  Mulai Diagnosis
                  <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
                <Link href="/clinic" className="px-8 py-4 bg-white text-on-surface border border-outline-variant/50 font-bold rounded-2xl hover:bg-surface-container-low hover:border-primary/30 transition-all active:scale-95 text-lg text-center flex items-center justify-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
                  Cari Klinik
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-8 border-t border-outline-variant/20">
                <div className="flex -space-x-4">
                  <Image width={48} height={48} className="w-12 h-12 rounded-full border-[3px] border-surface object-cover shadow-sm z-30 transform hover:scale-110 transition-transform" alt="Pasien 1" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" />
                  <Image width={48} height={48} className="w-12 h-12 rounded-full border-[3px] border-surface object-cover shadow-sm z-20 transform hover:scale-110 transition-transform" alt="Pasien 2" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80" />
                  <Image width={48} height={48} className="w-12 h-12 rounded-full border-[3px] border-surface object-cover shadow-sm z-10 transform hover:scale-110 transition-transform" alt="Pasien 3" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" />
                  <div className="w-12 h-12 rounded-full border-[3px] border-surface bg-surface-container-high flex items-center justify-center text-xs font-bold z-0">+9k</div>
                </div>
                <div className="flex flex-col">
                  <div className="flex text-tertiary">
                    {[1,2,3,4,5].map(star => <span key={star} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>)}
                  </div>
                  <p className="text-sm font-semibold text-on-surface-variant mt-1">
                    Lebih dari <strong className="text-on-surface">10.000+</strong> diagnosis berhasil dirangkai.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Box: Floating Hero Image */}
            <div className={`relative hidden lg:block transition-all duration-1200 delay-300 ease-out transform ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'}`}>
              
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-tertiary/20 rounded-[3rem] blur-2xl transform rotate-6 scale-105"></div>
              
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-[8px] border-white/50 backdrop-blur-sm z-10 h-[650px] w-full">
                <Image fill className="object-cover scale-105 hover:scale-100 transition-transform duration-1000" alt="Platform interaktif medis" src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none"></div>
              </div>

              {/* Floating Element 1 - Top Left */}
              <div className="absolute left-2 text-xs md:text-base md:-left-12 top-6 md:top-20 bg-white/90 backdrop-blur-md p-3 md:p-4 rounded-2xl shadow-xl border border-white/50 animate-float z-20 flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-bold text-outline-variant uppercase tracking-wider mb-0.5">TERVERIFIKASI</p>
                  <p className="font-headline font-black text-on-surface text-sm md:text-base leading-none">12.5K+ Pasien</p>
                </div>
              </div>

              {/* Floating Element 2 - Bottom Right */}
              <div className="absolute right-2 md:-right-8 bottom-6 md:bottom-32 bg-surface/90 backdrop-blur-xl p-4 md:p-5 rounded-3xl shadow-2xl border border-white/60 animate-float-delayed z-20 w-48 md:w-64">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-lg">medical_services</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Akurasi Sistem</p>
                      <p className="text-xl font-black font-headline">98.4% Berhasil</p>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden shadow-inner flex">
                  <div className="bg-gradient-to-r from-primary to-tertiary h-full w-[98%] rounded-full relative">
                     <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* MARQUEE SECTION: Infinite Scrolling Partners */}
        <section className="py-12 bg-surface-container-lowest border-y border-outline-variant/10 overflow-hidden relative">
           <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-surface-container-lowest to-transparent z-10 pointer-events-none"></div>
           <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-surface-container-lowest to-transparent z-10 pointer-events-none"></div>
           
           <div className="max-w-[100vw] overflow-hidden">
             <div className="animate-marquee flex items-center gap-16 pr-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 cursor-default">
               {/* Memalsukan deretan panjang untuk ilusi loop */}
               {[1, 2].map((group) => (
                 <div key={group} className="flex gap-20 items-center justify-center shrink-0">
                    <div className="flex items-center gap-3 font-bold text-xl text-on-surface-variant font-headline"><span className="material-symbols-outlined text-3xl">local_hospital</span> RS Pusat Nasional</div>
                    <div className="flex items-center gap-3 font-bold text-xl text-on-surface-variant font-headline"><span className="material-symbols-outlined text-3xl text-primary">healing</span> Medistra Care</div>
                    <div className="flex items-center gap-3 font-bold text-xl text-on-surface-variant font-headline"><span className="material-symbols-outlined text-3xl">bloodtype</span> Laboratorium PMI</div>
                    <div className="flex items-center gap-3 font-bold text-xl text-on-surface-variant font-headline"><span className="material-symbols-outlined text-3xl text-tertiary">monitor_heart</span> Hermina Medika</div>
                    <div className="flex items-center gap-3 font-bold text-xl text-on-surface-variant font-headline"><span className="material-symbols-outlined text-3xl">emergency</span> Siloam CITO</div>
                 </div>
               ))}
             </div>
           </div>
        </section>

        {/* BENTO GRID FEATURES SECTION */}
        <section className="py-32 bg-surface relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20 space-y-5">
              <span className="text-primary font-bold tracking-widest uppercase text-sm">Keunggulan Arsitektur</span>
              <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface">Dirancang melampaui Aplikasi Biasa.</h2>
              <p className="text-on-surface-variant text-xl max-w-2xl mx-auto font-medium">Bukan sekadar buku catatan resep. Ini adalah terminal kesehatan pintar pribadi di telapak tangan Anda.</p>
            </div>
            
            {/* Bento Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto">
              
              {/* Box 1 (Span 2 Cols, 1 Row) - Diagnosis AI */}
              <div className="md:col-span-2 bg-surface-container-highest rounded-[2.5rem] p-8 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 overflow-hidden relative group flex flex-col justify-center">
                <div className="relative z-10 w-full md:w-2/3">
                  <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mb-6 shadow-lg shadow-primary/30 relative z-20">
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  </div>
                  <h3 className="text-3xl font-black font-headline mb-4 text-on-surface">Mesin Inferensi Kecerdasan Buatan</h3>
                  <p className="text-on-surface-variant text-lg leading-relaxed">Sistem Neural kami memetakan silang 15.000 jurnal medis dan gejala spesifik untuk mencetak persentase kemungkinan persis sebagaimana dokter bertindak.</p>
                </div>
                <div className="absolute -right-20 -bottom-20 opacity-[0.08] group-hover:opacity-20 transition-all duration-700 pointer-events-none group-hover:scale-110 group-hover:-rotate-12">
                  <span className="material-symbols-outlined text-[400px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
              </div>

              {/* Box 2 (Standard) - Security */}
              <div className="bg-gradient-to-br from-tertiary to-tertiary-container rounded-[2.5rem] p-10 text-on-tertiary-container shadow-md hover:shadow-[0_20px_40px_rgba(92,107,192,0.2)] hover:scale-[1.03] transition-all duration-500 flex flex-col justify-center items-start group relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center mb-6 shadow-lg relative z-20 group-hover:bg-white/30 transition-colors">
                  <span className="material-symbols-outlined text-4xl group-hover:animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>gpp_good</span>
                </div>
                <h3 className="text-2xl font-black font-headline mb-3 text-white relative z-20">Otoritas Privasi</h3>
                <p className="text-white/80 font-medium leading-relaxed relative z-20">Semua metadata dilumuri lapisan enkripsi AES Tingkat Paripurna. Rekam medis Anda adalah hak kekayaan intelektual absolut Anda seorang.</p>
                <div className="absolute -right-16 -bottom-16 opacity-10 group-hover:opacity-20 transition-all duration-700 pointer-events-none group-hover:scale-110 group-hover:rotate-12">
                  <span className="material-symbols-outlined text-[300px] leading-none text-white" style={{ fontVariationSettings: "'FILL' 1" }}>gpp_good</span>
                </div>
              </div>

              {/* Box 3 (Standard) - Tracking */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[2.5rem] p-10 hover:border-primary/50 hover:bg-surface-container-low hover:-translate-y-2 transition-all duration-500 group flex flex-col relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-6 shadow-sm">
                    <span className="material-symbols-outlined text-3xl">satellite_alt</span>
                  </div>
                  <h3 className="text-2xl font-black font-headline mb-3 text-on-surface">Radius Radar Navigasi</h3>
                  <p className="text-on-surface-variant font-medium leading-relaxed">Terhubung langsung dengan Satelit Google Maps API. Cari ratusan pintu rumah sakit tepat di radius tempat Anda berdiri saat ini.</p>
                  <Link href="/clinic" className="mt-6 text-primary font-bold hover:underline flex items-center gap-1 group-hover:translate-x-2 transition-transform w-max">
                    Buka Radar <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
                <div className="absolute -right-12 -bottom-12 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none group-hover:scale-110">
                  <span className="material-symbols-outlined text-[240px] leading-none text-primary">satellite_alt</span>
                </div>
              </div>

              {/* Box 4 (Span 2 Cols, 1 Row) - Report */}
              <div className="md:col-span-2 bg-on-surface text-surface rounded-[2.5rem] p-0 flex flex-col md:flex-row overflow-hidden shadow-2xl hover:-translate-y-2 transition-transform duration-500 relative">
                <div className="p-10 w-full md:w-1/2 flex flex-col justify-center z-10 relative">
                  <span className="text-primary-container font-bold tracking-widest text-xs uppercase mb-4">Eksportasi Universal</span>
                  <h3 className="text-3xl font-black font-headline mb-4">Cetak Laporan Medis PDF Klinis.</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">Tidak ada lagi argumen berbelit saat kunjungan dokter. Berikan lembaran PDF hasil diagnosa final kepada sang dokter spesialis dan ciptakan rujukan yang akurat.</p>
                </div>
                <div className="w-full md:w-1/2 relative bg-surface-container overflow-hidden hidden md:block group">
                  <div className="absolute inset-0 bg-primary/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <Image fill className="object-cover object-top origin-top group-hover:scale-110 transition-transform duration-1000" alt="Cetak Laporan Diagnosis PDF" src="https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?auto=format&fit=crop&w=800&q=80" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* TESTIMONIAL SECTION */}
        <section className="py-24 bg-surface-container-lowest">
           <div className="max-w-7xl mx-auto px-6">
               <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
                 <div className="text-center md:text-left space-y-4">
                    <h2 className="text-4xl font-black font-headline tracking-tighter text-on-surface">Apa Kata Mereka?</h2>
                    <p className="text-on-surface-variant font-medium text-lg">Suara jujur dari ratusan pencari kesembuhan via kapabilitas platform kami.</p>
                 </div>
                 <button onClick={() => setIsFormOpen(true)} className="px-6 py-3 bg-white border-2 border-primary text-primary font-bold rounded-2xl hover:bg-primary hover:text-white transition-all active:scale-95 flex items-center gap-2 shadow-sm">
                   <span className="material-symbols-outlined text-xl">edit_square</span>
                   Bagikan Pengalaman Anda
                 </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {testimonials.map((t, idx) => (
                   <div key={t.id} className={`rounded-3xl p-8 border hover:-translate-y-2 transition-all duration-300 ${t.transform || ''} ${
                     t.isPrimary 
                       ? 'bg-primary hero-gradient border-primary-container hover:shadow-xl text-white shadow-lg shadow-primary/20' 
                       : 'bg-surface border-outline-variant/20 hover:border-primary/30 hover:shadow-xl'
                   }`}>
                      <div className={`flex gap-1 mb-6 ${t.isPrimary ? 'text-primary-container' : 'text-tertiary'}`}>
                         {Array.from({ length: 5 }).map((_, i) => (
                           <span key={i} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: i < t.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                         ))}
                      </div>
                      <p className={`text-lg leading-relaxed font-medium italic mb-8 ${t.isPrimary ? 'text-white' : 'text-on-surface'}`}>
                         {t.text}
                      </p>
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 relative flex-shrink-0">
                           <Image fill src={t.avatar} alt="Avatar" className={`rounded-full object-cover ${t.isPrimary ? 'border-2 border-primary-container' : ''}`} />
                         </div>
                         <div>
                            <h4 className={`font-bold font-headline ${t.isPrimary ? 'text-white' : 'text-on-surface'}`}>{t.name}</h4>
                            <p className={`text-xs font-bold truncate max-w-[150px] ${t.isPrimary ? 'text-primary-container' : 'text-on-surface-variant'}`}>{t.role}</p>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>

               {/* Modal Form */}
               {isFormOpen && mounted && (
                 <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                   <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 relative">
                     <button onClick={() => setIsFormOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-error transition-colors">
                       <span className="material-symbols-outlined text-2xl">close</span>
                     </button>
                     <h3 className="font-headline text-2xl font-black text-on-surface mb-2">Tulis Pengalaman Anda</h3>
                     <p className="text-on-surface-variant mb-6 text-sm">Bagaimana MediScan membantu kesehatan Anda? Ceritakan di sini.</p>
                     
                     <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                       <div>
                         <label className="block text-xs font-bold text-outline uppercase tracking-wide mb-2">Nama Lengkap</label>
                         <input required value={newTestimonial.name} onChange={e => setNewTestimonial({...newTestimonial, name: e.target.value})} type="text" className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline-variant text-on-surface" placeholder="mis. Budi Santoso" />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-outline uppercase tracking-wide mb-2">Profesi & Lokasi (Opsional)</label>
                         <input value={newTestimonial.role} onChange={e => setNewTestimonial({...newTestimonial, role: e.target.value})} type="text" className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline-variant text-on-surface" placeholder="mis. Guru, Malang" />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-outline uppercase tracking-wide mb-2">Rating</label>
                         <div className="flex gap-2">
                           {[1,2,3,4,5].map(star => (
                             <button type="button" key={star} onClick={() => setNewTestimonial({...newTestimonial, rating: star})} className={`material-symbols-outlined text-3xl transition-transform hover:scale-110 ${newTestimonial.rating >= star ? 'text-tertiary' : 'text-slate-300'}`} style={{ fontVariationSettings: newTestimonial.rating >= star ? "'FILL' 1" : "'FILL' 0" }}>
                               star
                             </button>
                           ))}
                         </div>
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-outline uppercase tracking-wide mb-2">Ulasan</label>
                         <textarea required value={newTestimonial.text} onChange={e => setNewTestimonial({...newTestimonial, text: e.target.value})} rows={3} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline-variant text-on-surface resize-none" placeholder="MediScan sangat membantu saya dalam..."></textarea>
                       </div>
                       <button type="submit" className="w-full bg-primary text-white font-black py-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-all mt-4 shadow-lg shadow-primary/20">
                         Kirim Ulasan Anda
                       </button>
                     </form>
                   </div>
                 </div>
               )}
           </div>
        </section>

        {/* CTA SECTION (Revamped) */}
        <section className="py-24 bg-surface relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-800 py-24 px-8 text-center text-white shadow-2xl border border-white/10 group">
              {/* Animated BG blobs within CTA */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-30 group-hover:opacity-50 transition-opacity duration-1000 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary rounded-full blur-[120px] opacity-30 group-hover:opacity-50 transition-opacity duration-1000 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
              
              <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                <h2 className="text-4xl md:text-6xl font-black font-headline leading-tight tracking-tighter">
                  Satu Ketukan untuk Mengakhiri Keraguan Anda.
                </h2>
                <p className="text-xl text-slate-300 font-medium leading-relaxed">
                  Tidak perlu membuang waktu cemas karena mesin pencari biasa. Delegasikan gejalat Anda pada algoritma kami dan temukan panduan kesehatan absolut di sini.
                </p>
                <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
                  <Link href="/diagnosis" className="px-10 py-5 bg-white text-slate-900 font-black rounded-full text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_10px_40px_rgba(255,255,255,0.2)] flex justify-center items-center gap-3">
                    Buka Konsol Diagnosis
                    <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
