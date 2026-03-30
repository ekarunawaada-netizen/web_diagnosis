"use client";

import { useRef, useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface DiagnosisResult {
  primaryCondition: {
    name: string;
    description: string;
    urgency: string;
    duration: string;
    severity: number;
  };
  medicalAdvice: { icon: string; title: string; desc: string }[];
  otherPossibilities: { name: string; pct: number; color: string }[];
  confidence: number;
}

export default function ResultPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiagnosis = async () => {
      const symptomsStr = searchParams.get('symptoms');
      if (!symptomsStr) {
        setError("Gejala tidak ditemukan. Silakan ulangi diagnosis.");
        setLoading(false);
        return;
      }

      try {
        const symptoms = JSON.parse(symptomsStr);
        const response = await fetch('/api/diagnosis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symptoms }),
        });

        if (!response.ok) throw new Error("Gagal mengambil diagnosis");

        const data = await response.json();
        setResult(data);
      } catch (err) {
        console.error(err);
        setError("Terjadi kesalahan saat memproses diagnosis. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnosis();
  }, [searchParams]);

  const handleDownloadPDF = async () => {
    const element = contentRef.current;
    if (!element) return;
    
    try {
      setIsDownloading(true);
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Hasil_Diagnosis_MediScan.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal mengunduh PDF. Silakan coba lagi.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Hasil Diagnosis MediScan',
      text: 'Berikut adalah hasil diagnosis awal saya dari MediScan.',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Tautan berhasil disalin ke clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-24 flex items-center justify-center min-h-[70vh]">
          <div className="text-center space-y-6 animate-pulse">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">clinical_notes</span>
            </div>
            <div>
              <h2 className="text-3xl font-black font-headline text-on-surface">Menganalisis Gejala...</h2>
              <p className="text-on-surface-variant mt-2">Mesin AI kami sedang meracik diagnosis untuk Anda.</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !result) {
    return (
      <>
        <Navbar />
        <main className="pt-24 flex items-center justify-center min-h-[70vh]">
          <div className="text-center max-w-md p-8 bg-surface-container rounded-[2rem] border border-outline-variant/30">
            <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
            <h2 className="text-2xl font-bold mb-4">{error || "Terjadi Kesalahan"}</h2>
            <Link href="/diagnosis" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold">
              <span className="material-symbols-outlined">restart_alt</span> Ulangi Diagnosis
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      {/* Side Navigation (Desktop) */}
      <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-slate-50 border-r border-slate-200/50 p-4 pt-24 gap-y-4 z-40">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">Dr. Aris Setiawan</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Spesialis Umum</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          <Link className="flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-200/50 rounded-xl mx-2 hover:translate-x-1 transition-transform" href="/">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm">Dashboard</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-200/50 rounded-xl mx-2 hover:translate-x-1 transition-transform" href="#">
            <span className="material-symbols-outlined">history</span>
            <span className="text-sm">Riwayat</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-200/50 rounded-xl mx-2 hover:translate-x-1 transition-transform" href="/diagnosis">
            <span className="material-symbols-outlined">stethoscope</span>
            <span className="text-sm">Gejala</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 mx-2 active:scale-[0.98] duration-150" href="#">
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-sm font-medium">Analisis</span>
          </Link>
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <Link className="flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-200/50 rounded-xl mx-2" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm">Settings</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-200/50 rounded-xl mx-2" href="#">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-24 pb-12 px-6 min-h-screen">
        <div ref={contentRef} className="max-w-6xl mx-auto space-y-8">
          {/* Hero Results */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-container p-8 md:p-12 text-white shadow-xl">
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-widest uppercase mb-4">Laporan Diagnosis Digital</span>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight font-headline">Analisis Selesai.</h1>
                <p className="text-lg text-blue-50/80 mb-8 max-w-md">Berdasarkan gejala yang Anda masukkan, kami telah mengidentifikasi beberapa kemungkinan kondisi kesehatan Anda.</p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={handleDownloadPDF} disabled={isDownloading} className="bg-white text-primary px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg active:scale-95 duration-200 disabled:opacity-75 disabled:cursor-wait">
                    <span className="material-symbols-outlined">download</span> {isDownloading ? 'Memproses...' : 'Unduh PDF'}
                  </button>
                  <button onClick={handleShare} className="bg-primary/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-colors active:scale-95 duration-200">
                    <span className="material-symbols-outlined">share</span> Bagikan Hasil
                  </button>
                </div>
              </div>
              <div className="flex justify-center md:justify-end">
                <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center bg-white/10 rounded-full backdrop-blur-xl border border-white/20">
                  <div className="text-center">
                    <span className="block text-5xl md:text-7xl font-black">{result.confidence}<span className="text-2xl">%</span></span>
                    <span className="text-sm uppercase tracking-widest font-bold opacity-80">Tingkat Kepercayaan</span>
                  </div>
                  <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-pulse"></div>
                  <div className="absolute -inset-4 border-2 border-white/10 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          </section>

          {/* Diagnosis Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Condition */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-on-surface mb-2 font-headline">Diagnosis Utama</h2>
                    <p className="text-slate-500">Kondisi yang paling mendekati profil gejala Anda.</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${result.primaryCondition.urgency === 'Perlu Perhatian' ? 'bg-error-container text-on-error-container' : 'bg-success-container text-on-success-container'}`}>
                    <span className="material-symbols-outlined text-sm">{result.primaryCondition.urgency === 'Perlu Perhatian' ? 'priority_high' : 'check'}</span> {result.primaryCondition.urgency}
                  </div>
                </div>
                <div className="bg-surface-container-low p-6 rounded-2xl mb-6">
                  <h3 className="text-xl font-bold text-primary mb-2 font-headline">{result.primaryCondition.name}</h3>
                  <p className="text-on-surface-variant leading-relaxed">{result.primaryCondition.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-secondary-container/20 border border-secondary-container/30">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Estimasi Durasi</span>
                    <span className="text-lg font-semibold">{result.primaryCondition.duration}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-tertiary-fixed/20 border border-tertiary-fixed/30">
                    <span className="text-xs font-bold text-tertiary uppercase tracking-wider block mb-1">Tingkat Keparahan</span>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={`h-2 w-8 rounded-full ${i < result.primaryCondition.severity ? 'bg-tertiary' : 'bg-surface-container-highest'}`}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Advice */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10">
                <h2 className="text-2xl font-bold text-on-surface mb-6 font-headline">Saran Tindakan Medis</h2>
                <div className="space-y-4">
                  {result.medicalAdvice.map((advice, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-surface-container-low transition-colors group">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined">{advice.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-bold mb-1">{advice.title}</h4>
                        <p className="text-sm text-on-surface-variant">{advice.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Confidence Indicators */}
              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/10">
                <h3 className="font-bold mb-4 font-headline">Kemungkinan Lain</h3>
                <div className="space-y-4">
                  {result.otherPossibilities.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>{item.name}</span>
                        <span>{item.pct}%</span>
                      </div>
                      <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                        <div className={`${item.color} h-full`} style={{ width: `${item.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Card */}
              <div className="bg-white p-6 rounded-3xl shadow-xl shadow-blue-100 border border-blue-50">
                <div className="w-16 h-16 rounded-2xl bg-primary-container/20 flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined text-3xl">medical_services</span>
                </div>
                <h3 className="text-xl font-bold mb-2 font-headline">Konsultasi Dokter</h3>
                <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">Jangan menunggu gejala bertambah parah. Hubungkan dengan dokter spesialis kami sekarang.</p>
                <div className="space-y-3">
                  <Link href="/appointments" className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">event</span> Buat Janji Temu
                  </Link>
                  <Link href="/clinic" className="w-full bg-surface-container-low text-primary py-4 rounded-xl font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">location_on</span> Cari Klinik Terdekat
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FAB */}
      <Link href="/diagnosis" className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 lg:right-8">
        <span className="material-symbols-outlined">add</span>
      </Link>

      <Footer />
    </>
  );
}
