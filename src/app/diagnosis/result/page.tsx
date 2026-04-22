"use client";

import { useRef, useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';

// Symptom as stored by the new dynamic diagnosis page
interface StoredSymptom {
  symptomCode: string; // e.g. 'G001'
  cfValue: number;     // 0–1
  name: string;        // display name
}

// Shape of a single result item from POST /api/diagnose
interface DiagnoseResult {
  diseaseCode: string;
  diseaseName: string;
  description: string;
  solution: string;
  severity: string;
  cfValue: number; // 0–1
}

export default function ResultPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [data, setData] = useState<{ symptoms: StoredSymptom[], timestamp: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const lastDiagnosis = localStorage.getItem('mediscan_last_diagnosis');
    if (lastDiagnosis) {
      try {
        const parsedData = JSON.parse(lastDiagnosis);
        setData(parsedData);
      } catch (e) {
        setError('Data diagnosis tidak valid.');
        setLoading(false);
      }
    } else {
      setError('Tidak ada data diagnosis terbaru.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchDiagnosis = async () => {
      if (!data) return;

      /**
       * LOGIKA DIAGNOSIS AKURAT
       * ─────────────────────────────────────────────────────────────────────
       * 1. Kirim semua symptomCode + cfValue (Ya=1.0 / Mungkin=0.5)
       * 2. minCF=0.05 → backend mengembalikan semua penyakit yang relevan
       *    meski CF-nya kecil (tidak hanya yang >50%)
       * 3. onlyActiveRules=true → hanya aturan aktif di database
       * 4. Backend melakukan CF combination:
       *    CF_final = CF_pakar × CF_user
       *    CF_combined = CF_prev + CF_new × (1 - CF_prev)
       * ─────────────────────────────────────────────────────────────────────
       */
      const symptomsPayload = data.symptoms.map((s: StoredSymptom) => ({
        symptomCode: s.symptomCode,
        cfValue: s.cfValue,   // 1.0 = Ya, 0.5 = Mungkin
      }));

      if (symptomsPayload.length === 0) {
        setError('Tidak ada gejala yang dipilih. Silakan ulangi diagnosis.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const apiClient = (await import('@/lib/axios')).default;

        const response = await apiClient.post('/api/diagnose/start', {
          symptoms: symptomsPayload,
          options: {
            onlyActiveRules: true,
            minCF: 0.05,          // tampilkan hasil mulai dari CF 5% keatas
          },
        });

        // Response: { success, data: { timestamp, userSymptoms, results[] } }
        if (response.data?.success && Array.isArray(response.data.data?.results)) {
          // Urutkan: CF tertinggi di atas
          const sorted = [...response.data.data.results].sort(
            (a: DiagnoseResult, b: DiagnoseResult) => b.cfValue - a.cfValue
          );
          setResults(sorted);
        } else {
          setError('Format respons dari server tidak sesuai.');
        }
      } catch (err: any) {
        console.error('Diagnosis API Error:', err);
        if (err.response?.status === 401) {
          setError('Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.');
        } else {
          const msg = err.response?.data?.error || err.response?.data?.message || 'Gagal menghubungi server backend.';
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnosis();
  }, [data]);

  // Map the real API result shape to the display format used in the template
  const topMatch = useMemo(() => {
    if (results.length === 0) return {
      name: 'Kondisi Tidak Teridentifikasi',
      cause: 'Data gejala tidak cukup spesifik untuk diagnosa otomatis.',
      treatment: 'Konsultasikan dengan tenaga medis profesional.',
      prevention: 'Jaga gaya hidup sehat dan pola makan teratur.',
      probability: 0,
    };
    const r = results[0] as DiagnoseResult;
    return {
      name: r.diseaseName,
      cause: r.description,
      treatment: r.solution,
      prevention: 'Konsultasikan dengan dokter untuk langkah pencegahan.',
      probability: Math.round(r.cfValue * 100),
    };
  }, [results]);

  // Remaining results for the sidebar
  const otherResults = useMemo(() =>
    results.slice(1).map((r: DiagnoseResult) => ({
      name: r.diseaseName,
      probability: Math.round(r.cfValue * 100),
    }))
    , [results]);

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
          symptoms: data.symptoms.map((s: StoredSymptom) => s.name),
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
      const jspdfModule = await import('jspdf');
      const jsPDF = jspdfModule.jsPDF || jspdfModule.default;

      // Create a temporary container for the PDF content to ensure all fields are included
      const pdfContainer = document.createElement('div');
      pdfContainer.style.padding = '40px';
      pdfContainer.style.background = 'white';
      pdfContainer.style.width = '800px';
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '0px';
      
      pdfContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.5; box-sizing: border-box;">
          
          <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Laporan Diagnosis Petit Hospital</h1>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p style="font-size: 14px; color: #64748b; margin: 0;">Tanggal: ${new Date(data?.timestamp || Date.now()).toLocaleString('id-ID')}</p>
          </div>
          
          <div style="margin-bottom: 30px; display: block;">
            <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 15px 0; padding: 0;">Ringkasan Gejala:</h2>
            <div style="display: block;">
              ${(data?.symptoms || []).map(s => `
                <div style="background: #f8fafc; margin-bottom: 12px; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; display: block;">
                  <strong style="margin: 0; font-size: 15px; display: block;">${s.name}</strong>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="margin-bottom: 30px; background: #eff6ff; padding: 25px; border-radius: 12px; display: block;">
            <h2 style="font-size: 18px; color: #1e40af; margin: 0 0 15px 0;">Hasil Diagnosis:</h2>
            <div style="margin-bottom: 10px; display: block;">
              <span style="font-size: 24px; font-weight: bold; color: #1e293b; display: block;">${topMatch.name}</span>
            </div>
            <div style="margin-bottom: 10px; display: block;">
              <span style="font-size: 14px; color: #3b82f6; display: block;">Penyebab: ${topMatch.cause}</span>
            </div>
            <div style="display: block;">
              <span style="font-size: 16px; color: #1e40af; font-weight: bold; display: block;">Tingkat Kepercayaan: ${topMatch.probability}%</span>
            </div>
          </div>

          <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; display: block;">
            <h3 style="font-size: 18px; color: #0f172a; margin: 0 0 10px 0;">Penanganan:</h3>
            <p style="font-size: 14px; color: #475569; margin: 0; display: block;">${topMatch.treatment}</p>
          </div>

          <div style="margin-bottom: 30px; display: block;">
            <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 15px 0;">Saran Dokter Spesialis:</h2>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 12px; display: block;">
              <p style="font-size: 16px; color: #166534; font-weight: bold; margin: 0; display: block;">
                Segera konsultasikan hasil ini dengan Dokter Umum atau Spesialis terkait.
              </p>
            </div>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; display: block;">
            <p style="font-size: 11px; color: #94a3b8; margin: 0; display: block;">Laporan ini dihasilkan secara otomatis oleh Petit Hospital. Bukan merupakan pengganti saran medis profesional.</p>
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
      pdf.save(`PetitHospital_Report_${new Date().getTime()}.pdf`);
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
      {/* Main Content */}
      <main className="pt-24 pb-12 px-6 min-h-screen">
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

          {/* Loading or Error States */}
          {loading && (
            <div className="py-20 text-center animate-pulse">
              <span className="material-symbols-outlined text-5xl text-primary mb-4 animate-spin">sync</span>
              <p className="text-xl font-bold">Menganalisis Gejala Anda dari Server...</p>
            </div>
          )}
          {!loading && error && (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center border border-red-200">
              <span className="material-symbols-outlined text-4xl mb-2">error</span>
              <p className="font-bold">{error}</p>
            </div>
          )}

          {/* Diagnosis Bento Grid */}
          {!loading && !error && (
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
                      <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Gejala Dipilih</span>
                      <span className="text-lg font-semibold">
                        {data?.symptoms.length || 0} Gejala
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-tertiary-fixed/20 border border-tertiary-fixed/30">
                      <span className="text-xs font-bold text-tertiary uppercase tracking-wider block mb-1">Tingkat Keparahan</span>
                      <span className="text-sm font-semibold capitalize">
                        {(results[0] as DiagnoseResult)?.severity || 'moderate'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Symptoms Summary */}
                <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10">
                  <h2 className="text-2xl font-bold text-on-surface mb-6 font-headline">Detail Gejala Anda</h2>
                  <div className="flex flex-wrap gap-3">
                    {data?.symptoms.map((s) => {
                      const cfLabel = s.cfValue >= 0.9 ? 'Pasti' : s.cfValue >= 0.7 ? 'Kemungkinan Besar' : 'Mungkin';
                      const dotColor = s.cfValue >= 0.9 ? 'bg-error' : s.cfValue >= 0.7 ? 'bg-tertiary' : 'bg-primary';
                      return (
                        <div key={s.symptomCode} className="px-4 py-3 bg-white border border-outline-variant/20 rounded-2xl shadow-sm flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`}></div>
                          <div>
                            <p className="font-bold text-sm text-on-surface">{s.name}</p>
                            <p className="text-[10px] text-outline font-mono">{s.symptomCode} · {cfLabel}</p>
                          </div>
                        </div>
                      );
                    })}
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
                    {otherResults.map((item: { name: string; probability: number }) => (
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
                    {otherResults.length === 0 && (
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
          )}

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
