"use client";

import { useRef, useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';
import diseasesData from '@/data/diseases.json';

interface Symptom {
  id: string;
  name: string;
  intensity: number;
  duration: number;
}

export default function ResultPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [data, setData] = useState<{ symptoms: Symptom[], timestamp: string } | null>(null);

  useEffect(() => {
    const lastDiagnosis = localStorage.getItem('mediscan_last_diagnosis');
    if (lastDiagnosis) {
      const parsedData = JSON.parse(lastDiagnosis);
      setData(parsedData);
    }
  }, []);

  const results = useMemo(() => {
    if (!data) return [];

    const userSymptomNames = data.symptoms.map(s => s.name.toLowerCase());
    
    const matches = diseasesData.map(disease => {
      let score = 0;
      let matchedCount = 0;
      
      disease.symptoms.forEach(s => {
        if (userSymptomNames.includes(s.toLowerCase())) {
          score += 1;
          matchedCount += 1;
        }
      });

      // Boost score if match is more specific
      const probability = disease.symptoms.length > 0 ? Math.round((matchedCount / data.symptoms.length) * 100) : 0;
      
      return {
        ...disease,
        probability: Math.min(probability, 99), // Cap at 99%
        matchedCount
      };
    });

    return matches
      .filter(m => m.matchedCount > 0)
      .sort((a, b) => b.probability - a.probability || b.matchedCount - a.matchedCount)
      .slice(0, 3);
  }, [data]);

  const topMatch = results[0] || {
    name: 'Kondisi Tidak Teridentifikasi',
    cause: 'Data gejala tidak cukup spesifik untuk diagnosa otomatis.',
    treatment: 'Konsultasikan dengan tenaga medis profesional.',
    prevention: 'Jaga gaya hidup sehat dan pola makan teratur.',
    probability: 15
  };

  useEffect(() => {
    if (data && results.length > 0) {
      // Save top result to permanent history if not already there
      const history = JSON.parse(localStorage.getItem('diagnosis_history') || '[]');
      // Compare with h.date because the property saved is 'date'
      const exists = history.some((h: any) => h.date === data.timestamp || h.timestamp === data.timestamp);
      if (!exists) {
        const newEntry = {
          id: Math.random().toString(36).substr(2, 9),
          date: data.timestamp,
          timestamp: data.timestamp,
          symptoms: data.symptoms.map((s: Symptom) => s.name),
          diagnosis: topMatch.name,
          probability: topMatch.probability
        };
        localStorage.setItem('diagnosis_history', JSON.stringify([...history, newEntry]));
      }
    }
  }, [data, results, topMatch]);

  const handleDownloadPDF = async () => {
    const element = contentRef.current;
    if (!element) return;
    
    try {
      setIsDownloading(true);
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      // Create a temporary container for the PDF content to ensure all fields are included
      const pdfContainer = document.createElement('div');
      pdfContainer.style.padding = '40px';
      pdfContainer.style.background = 'white';
      pdfContainer.style.width = '800px';
      pdfContainer.innerHTML = `
        <div style="font-family: sans-serif; color: #1e293b;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px;">Laporan Diagnosis MediScan</h1>
          <p style="font-size: 14px; color: #64748b;">Tanggal: ${new Date(data?.timestamp || Date.now()).toLocaleString('id-ID')}</p>
          
          <div style="margin-top: 30px;">
            <h2 style="font-size: 18px; color: #0f172a;">Ringkasan Gejala:</h2>
            <ul style="list-style: none; padding: 0;">
              ${data?.symptoms.map(s => `
                <li style="background: #f8fafc; margin-bottom: 10px; padding: 15px; border-radius: 12px; border-left: 4px solid #3b82f6;">
                  <strong>${s.name}</strong> - Intensitas: ${s.intensity}/3, Durasi: ${s.duration} Hari
                </li>
              `).join('')}
            </ul>
          </div>

          <div style="margin-top: 30px; background: #eff6ff; padding: 25px; border-radius: 20px;">
            <h2 style="font-size: 18px; color: #1e40af; margin-top: 0;">Hasil Diagnosis:</h2>
            <p style="font-size: 20px; font-weight: bold; margin: 10px 0;">${topMatch.name}</p>
            <p style="font-size: 14px; color: #1e40af; margin-bottom: 5px;">Penyebab: ${topMatch.cause}</p>
            <p style="font-size: 16px; color: #1e40af; font-weight: bold;">Tingkat Kepercayaan: ${topMatch.probability}%</p>
          </div>

          <div style="margin-top: 20px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h3 style="font-size: 16px; color: #0f172a; margin-top: 0;">Penanganan:</h3>
            <p style="font-size: 14px; color: #475569;">${topMatch.treatment}</p>
          </div>

          <div style="margin-top: 20px;">
            <h2 style="font-size: 18px; color: #0f172a;">Saran Dokter Spesialis:</h2>
            <p style="font-size: 16px; background: #f0fdf4; padding: 15px; border-radius: 12px; color: #166534; font-weight: bold;">
              Segera konsultasikan hasil ini dengan Dokter Umum atau Spesialis terkait.
            </p>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center;">
            <p>Laporan ini dihasilkan secara otomatis oleh MediScan. Bukan merupakan pengganti saran medis profesional.</p>
          </div>
        </div>
      `;
      document.body.appendChild(pdfContainer);

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
      });

      document.body.removeChild(pdfContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MediScan_Report_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal mengunduh PDF.');
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
          <Link className="flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-200/50 rounded-xl mx-2 hover:translate-x-1 transition-transform" href="#">
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
          <Link className="flex items-center gap-3 p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 mx-2 active:scale-[0.98] duration-150" href="/diagnosis/result">
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
                    <span className="block text-5xl md:text-7xl font-black">{topMatch.probability}<span className="text-2xl">%</span></span>
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
                  <div className="flex items-center gap-2 bg-error-container text-on-error-container px-3 py-1 rounded-full text-xs font-bold">
                    <span className="material-symbols-outlined text-sm">priority_high</span> Perlu Perhatian
                  </div>
                </div>
                <div className="bg-surface-container-low p-6 rounded-2xl mb-6">
                  <h3 className="text-xl font-bold text-primary mb-2 font-headline">{topMatch.name}</h3>
                  <p className="text-on-surface-variant leading-relaxed"><span className="font-bold">Penyebab:</span> {topMatch.cause}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-secondary-container/20 border border-secondary-container/30">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Durasi Gejala</span>
                    <span className="text-lg font-semibold">
                      {data?.symptoms.find(s => s.duration > 0)?.duration || 3}-7 Hari
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-tertiary-fixed/20 border border-tertiary-fixed/30">
                    <span className="text-xs font-bold text-tertiary uppercase tracking-wider block mb-1">Tingkat Keparahan</span>
                    <div className="flex gap-1 mt-1">
                      <div className="h-2 w-8 rounded-full bg-tertiary"></div>
                      <div className={`h-2 w-8 rounded-full ${data?.symptoms.some(s => s.intensity >= 2) ? 'bg-tertiary' : 'bg-surface-container-highest'}`}></div>
                      <div className={`h-2 w-8 rounded-full ${data?.symptoms.some(s => s.intensity >= 3) ? 'bg-tertiary' : 'bg-surface-container-highest'}`}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Symptoms Summary */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10">
                <h2 className="text-2xl font-bold text-on-surface mb-6 font-headline">Detail Gejala Anda</h2>
                <div className="flex flex-wrap gap-3">
                  {data?.symptoms.map((s) => (
                    <div key={s.id} className="px-5 py-3 bg-white border border-outline-variant/20 rounded-2xl shadow-sm flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${s.intensity === 3 ? 'bg-error' : s.intensity === 2 ? 'bg-tertiary' : 'bg-primary'}`}></div>
                      <div>
                        <p className="font-bold text-sm text-on-surface">{s.name}</p>
                        <p className="text-[10px] text-outline font-bold uppercase">{s.duration} Hari • {s.intensity === 3 ? 'Parah' : s.intensity === 2 ? 'Sedang' : 'Ringan'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Advice */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10">
                <h2 className="text-2xl font-bold text-on-surface mb-6 font-headline">Saran Penanganan</h2>
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">medication</span>
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Tindakan Mandiri</h4>
                      <p className="text-sm text-on-surface-variant">{topMatch.treatment}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-2xl bg-tertiary/5 border border-tertiary/10 group">
                    <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">shield</span>
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Langkah Pencegahan</h4>
                      <p className="text-sm text-on-surface-variant">{topMatch.prevention}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Confidence Indicators */}
              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/10">
                <h3 className="font-bold mb-4 font-headline">Kemungkinan Lain</h3>
                <div className="space-y-4">
                  {results.slice(1).map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>{item.name}</span>
                        <span>{item.probability}%</span>
                      </div>
                      <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: `${item.probability}%` }}></div>
                      </div>
                    </div>
                  ))}
                  {results.length <= 1 && (
                    <p className="text-xs text-slate-400 italic">Tidak ada kemungkinan lain yang signifikan.</p>
                  )}
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
                  <Link href="/clinic" className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20 active:scale-95">
                    <span className="material-symbols-outlined">location_on</span> Cari Klinik Terdekat
                  </Link>
                </div>
              </div>

              {/* Map Preview */}
              <div className="relative h-48 rounded-3xl overflow-hidden bg-slate-200 group">
                <img alt="Map showing medical centers" loading="lazy" className="w-full h-full object-cover grayscale opacity-80 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBjazzDWWdEt0z6qBSKWT_GDLs8hRZDZP0XD80Nb4sON5CGv0Mx2iFxfTRDZAYNw6elSayUvlOzeCBjW7Hhf2e6VlW0cELU8BYR1qUg1ohvVdlMiHCp4s8mfjesJCxoG7-TAMuUC8OSeKuShWIkdwovl1IUWmc9hW7pT0qard1NuDCn_k9ZvDWiWieOhLEwjDcrxzhedSzmxeAoxijGVXeAcT6a9KywBg0nQdqKI2BhJHj7PaOtt4Cik6Ozqqq5dKYIcXir41GjVsh" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80">Terdekat</p>
                    <p className="font-bold">RS Medika Pratama (1.2km)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Urgent Banner */}
          <div className="bg-tertiary-container/10 border-l-4 border-tertiary-container p-6 rounded-2xl flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <div>
              <h4 className="font-bold text-on-tertiary-container font-headline">Kapan harus ke UGD?</h4>
              <p className="text-sm text-on-tertiary-container/80">Jika Anda mengalami kesulitan bernapas, nyeri dada yang hebat, atau demam di atas 40°C, segera kunjungi layanan darurat terdekat.</p>
            </div>
          </div>
          
          <MedicalDisclaimer />
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
