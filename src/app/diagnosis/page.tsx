'use client';

import { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Footer from '@/components/Footer';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';
import { useRouter } from 'next/navigation';

/* ─── TYPES ───────────────────────────────────────────────────────────────── */
interface ApiSymptom {
  id: number;
  code: string;
  name: string;
  description: string;
  weight: string;
  category: string;
}

/* ─── 6 KATEGORI ─────────────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    id: 'demam',
    label: 'Demam & Infeksi',
    desc: 'Demam, menggigil, lemas, keringat malam',
    icon: '🌡️',
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
    apiCat: ['Umum'],
  },
  {
    id: 'napas',
    label: 'Napas & Jantung',
    desc: 'Sesak napas, batuk, nyeri dada, jantung berdebar',
    icon: '🫁',
    color: '#e11d48',
    bg: '#fff1f2',
    border: '#fecdd3',
    apiCat: ['Pernapasan', 'Kardiovaskular'],
  },
  {
    id: 'perut',
    label: 'Perut & Pencernaan',
    desc: 'Mual, muntah, diare, sakit perut',
    icon: '🤢',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    apiCat: ['Gastrointestinal'],
  },
  {
    id: 'otot',
    label: 'Otot & Sendi',
    desc: 'Nyeri sendi, pegal, kaku otot, bengkak',
    icon: '🦴',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    apiCat: ['Muskuloskeletal'],
  },
  {
    id: 'kepala',
    label: 'Kepala & Saraf',
    desc: 'Sakit kepala, pusing, gangguan tidur, cemas',
    icon: '🧠',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    apiCat: ['Neurologi', 'Psikiatri', 'Mata', 'THT'],
  },
  {
    id: 'kulit',
    label: 'Kulit & Lainnya',
    desc: 'Gatal, ruam, masalah kemih, gangguan hormon',
    icon: '🌿',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    apiCat: ['Dermatologi', 'Endokrin', 'Urologi', 'Ginekologi', 'Andrologi', 'Onkologi'],
  },
];

/* ─── TEMPLATE PERTANYAAN ────────────────────────────────────────────────── */
// Output: "Apakah Anda mengalami " + nama gejala + "?"
function buatPertanyaan(nama: string): string {
  const n = nama.trim();
  return 'Apakah Anda mengalami ' + n.charAt(0).toLowerCase() + n.slice(1) + '?';
}

/* ─── KOMPONEN UTAMA ─────────────────────────────────────────────────────── */
export default function DiagnosisPage() {
  const router = useRouter();

  // Data dari API
  const [allSymptoms, setAllSymptoms] = useState<ApiSymptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI State
  const [step, setStep] = useState<1 | 2>(1);
  const [activeCatId, setActiveCatId] = useState('');

  // Jawaban: code → 1.0 (Ya) | 0.7 (Sering) | 0.3 (Jarang) | null (tidak dipilih/Tidak ada)
  const [answers, setAnswers] = useState<Record<string, 1.0 | 0.7 | 0.3 | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch gejala dari API
  useEffect(() => {
    (async () => {
      try {
        const apiClient = (await import('@/lib/axios')).default;
        const res = await apiClient.get('/api/diagnose/symptoms');
        const data = res.data?.data ?? res.data;
        if (Array.isArray(data)) setAllSymptoms(data);
        else setError('Data gejala tidak valid dari server.');
      } catch (e: any) {
        setError(
          e.response?.status === 401
            ? 'Silakan login terlebih dahulu.'
            : 'Gagal memuat data. Periksa koneksi internet.'
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Kategori aktif
  const activeCat = CATEGORIES.find(c => c.id === activeCatId) ?? null;

  // Daftar gejala untuk kategori aktif — urutkan bobot tertinggi, maks 15
  const symptoms = useMemo(() => {
    if (!activeCat) return [];
    return allSymptoms
      .filter(s => activeCat.apiCat.includes(s.category))
      .sort((a, b) => parseFloat(b.weight ?? '0') - parseFloat(a.weight ?? '0'))
      .slice(0, 15);
  }, [allSymptoms, activeCat]);

  // Gejala yang dijawab Ya/Mungkin untuk dikirim
  const gejalaTerpilih = useMemo(() =>
    allSymptoms
      .filter(s => answers[s.code] != null)
      .map(s => ({ ...s, cfValue: answers[s.code] as number })),
    [allSymptoms, answers]
  );

  // Pilih jawaban — klik yang sama = toggle off
  function jawab(code: string, val: 1.0 | 0.7 | 0.3) {
    setAnswers(prev => ({
      ...prev,
      [code]: prev[code] === val ? null : val,
    }));
  }

  // Masuk ke Step 2
  function pilihKategori(catId: string) {
    setActiveCatId(catId);
    setStep(2);
  }

  // Kembali ke Step 1
  function kembali() {
    setStep(1);
    setActiveCatId('');
  }

  // Kirim diagnosis
  async function kirimDiagnosis() {
    if (gejalaTerpilih.length === 0) return;
    setIsSubmitting(true);
    const payload = {
      symptoms: gejalaTerpilih.map(s => ({
        symptomCode: s.code,
        cfValue: s.cfValue,
        name: s.name,
      })),
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('mediscan_last_diagnosis', JSON.stringify(payload));
    router.push('/diagnosis/result');
  }

  /* ═══════════════════════════════════════════════ RENDER ══════════════════ */
  return (
    <>
      <Navbar />
      <main className={`pt-16 min-h-screen flex flex-col bg-slate-50 ${step === 2 ? 'overflow-hidden' : 'overflow-auto'}`}>
        <div className={`max-w-[680px] w-full mx-auto flex flex-col overflow-hidden flex-1 ${step === 2 ? 'p-0' : 'py-6 px-4 md:py-10'}`}>

          {/* ── LOADING ── */}
          {loading && (
            <div style={{ textAlign: 'center', paddingTop: 80 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <p style={{ color: '#64748b', fontSize: 16 }}>Memuat data gejala...</p>
            </div>
          )}

          {/* ── ERROR ── */}
          {!loading && error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 16, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
              <p style={{ color: '#b91c1c', fontWeight: 600, marginBottom: 16 }}>{error}</p>
              {error.includes('login') && (
                <Link href="/login" style={{ background: '#ef4444', color: 'white', padding: '10px 24px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>
                  Login Sekarang
                </Link>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              STEP 1 — PILIH KATEGORI
          ════════════════════════════════════════════════════════════════════ */}
          {!loading && !error && step === 1 && (
            <div>
              <div className="text-center mb-10 px-4">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-4 py-1.5 text-[11px] md:text-sm font-bold mb-5 border border-blue-100 uppercase tracking-widest">
                  🩺 Pemeriksaan Gejala
                </div>
                <h1 className="text-2xl md:text-4xl font-black font-headline text-slate-800 mb-3 leading-tight tracking-tight">
                  Anda merasa tidak enak<br className="hidden sm:block" /> di bagian mana?
                </h1>
                <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto font-medium">
                  Pilih kelompok keluhan yang paling sesuai dengan kondisi Anda sekarang.
                </p>
              </div>

              {/* Banner jika sudah ada jawaban */}
              {gejalaTerpilih.length > 0 && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 16, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <p style={{ margin: 0, color: '#1d4ed8', fontWeight: 600, fontSize: 14 }}>
                    ✅ {gejalaTerpilih.length} gejala dipilih — siap dianalisis
                  </p>
                  <button
                    onClick={kirimDiagnosis}
                    disabled={isSubmitting}
                    style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 10, padding: '8px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                  >
                    {isSubmitting ? 'Memproses...' : 'Analisis Sekarang →'}
                  </button>
                </div>
              )}

              {/* Grid kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2 sm:px-0">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => pilihKategori(cat.id)}
                    style={{
                      background: cat.bg,
                      border: `2px solid ${cat.border}`,
                      borderRadius: 20,
                      padding: '20px 16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                  >
                    <span style={{ fontSize: 36 }}>{cat.icon}</span>
                    <div>
                      <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{cat.label}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{cat.desc}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ color: cat.color, fontSize: 20 }}>→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              STEP 2 — DAFTAR GEJALA (100vh layout)
          ════════════════════════════════════════════════════════════════════ */}
          {!loading && !error && step === 2 && activeCat && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

              {/* ── HEADER (sticky, tidak ikut scroll) ── */}
              <div style={{ padding: '16px 16px 0', flexShrink: 0 }}>
                {/* Tombol kembali */}
                <button
                  onClick={kembali}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontWeight: 600, fontSize: 14, marginBottom: 14, padding: 0 }}
                >
                  ← Kembali ke Kategori
                </button>

                {/* Judul kategori */}
                <div className="flex items-center gap-4 mb-5 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-4xl md:text-5xl">{activeCat.icon}</span>
                  <div>
                    <h2 className="font-black font-headline text-lg md:text-xl text-slate-800 leading-tight">{activeCat.label}</h2>
                    <p className="text-slate-500 text-[11px] md:text-xs font-medium">Pilih gejala yang Anda rasakan saat ini</p>
                  </div>
                </div>

                {/* Panduan jawaban */}
                <div className="bg-slate-100/80 backdrop-blur rounded-xl p-3 mb-4 border border-slate-200/50">
                  <div className="flex items-center justify-center gap-x-4 gap-y-2 flex-wrap">
                    <span className="text-[10px] md:text-xs font-bold text-slate-600"><span className="text-green-600">Ya</span></span>
                    <span className="text-[10px] md:text-xs font-bold text-slate-600"><span className="text-blue-600">Sering</span></span>
                    <span className="text-[10px] md:text-xs font-bold text-slate-600"><span className="text-amber-600">Jarang</span></span>
                    <span className="text-[10px] md:text-xs font-bold text-slate-600">Tidak</span>
                  </div>
                </div>
              </div>

              {/* ── SCROLLABLE SYMPTOM LIST ── */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '4px 16px 16px',
                WebkitOverflowScrolling: 'touch' as any,
              }}>

              {/* Daftar gejala */}
              {symptoms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
                  <p>Tidak ada gejala untuk kategori ini.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {symptoms.map((s, i) => {
                    const ans = answers[s.code];
                    const isYa     = ans === 1.0;
                    const isSering = ans === 0.7;
                    const isJarang = ans === 0.3;
                    const weight = parseFloat(s.weight ?? '0');
                    const penting = weight >= 0.9;

                    // Warna kartu berdasarkan jawaban
                    const cardBg     = isYa ? '#f0fdf4' : isSering ? '#eff6ff' : isJarang ? '#fffbeb' : 'white';
                    const cardBorder = isYa ? '#86efac' : isSering ? '#93c5fd'  : isJarang ? '#fde68a'  : '#e2e8f0';

                    return (
                      <div
                        key={s.code}
                        style={{
                          background: cardBg,
                          border: `2px solid ${cardBorder}`,
                          borderRadius: 16,
                          padding: '14px 16px',
                          transition: 'border-color 0.2s, background 0.2s',
                        }}
                      >
                        {/* Pertanyaan */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                          <span style={{
                            minWidth: 24, height: 24, borderRadius: '50%',
                            background: '#f1f5f9', color: '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, marginTop: 1, flexShrink: 0
                          }}>
                            {i + 1}
                          </span>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: '#0f172a', lineHeight: 1.4 }}>
                              {buatPertanyaan(s.name)}
                            </p>
                            {s.description && (
                              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>
                                {penting && <span style={{ color: '#ef4444' }}>⚠️ </span>}
                                {s.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* 4 tombol frekuensi */}
                        <div className="grid grid-cols-2 xs:grid-cols-4 gap-3">
                          {/* Ya */}
                          <button
                            onClick={() => jawab(s.code, 1.0)}
                            className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 font-bold text-xs transition-all active:scale-95 ${
                              isYa ? 'bg-green-600 border-green-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-green-200'
                            }`}
                          >
                            <span className="mb-0.5 text-base">✅</span>
                            Ya
                          </button>

                          {/* Sering */}
                          <button
                            onClick={() => jawab(s.code, 0.7)}
                            className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 font-bold text-xs transition-all active:scale-95 ${
                              isSering ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'
                            }`}
                          >
                            <span className="mb-0.5 text-base">🔁</span>
                            Sering
                          </button>

                          {/* Jarang */}
                          <button
                            onClick={() => jawab(s.code, 0.3)}
                            className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 font-bold text-xs transition-all active:scale-95 ${
                              isJarang ? 'bg-amber-500 border-amber-500 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-amber-200'
                            }`}
                          >
                            <span className="mb-0.5 text-base">⏱️</span>
                            Jarang
                          </button>

                          {/* Tidak */}
                          <button
                            onClick={() => setAnswers(prev => ({ ...prev, [s.code]: null }))}
                            className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 font-bold text-xs transition-all active:scale-95 ${
                              !ans ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white border-slate-100 text-slate-300 hover:border-slate-200'
                            }`}
                          >
                            <span className="mb-0.5 text-base">😐</span>
                            Tidak
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              </div>{/* end scroll wrapper */}

              {/* ── STICKY BOTTOM BUTTONS ── */}
              <div style={{
                flexShrink: 0,
                padding: '12px 16px',
                borderTop: '1px solid #e2e8f0',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                {gejalaTerpilih.length > 0 && (
                  <button
                    onClick={kirimDiagnosis}
                    disabled={isSubmitting}
                    style={{
                      width: '100%', padding: '15px', background: '#2563eb', color: 'white',
                      border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 16,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? '⏳ Memproses...' : `🔍 Analisis ${gejalaTerpilih.length} Gejala Sekarang`}
                  </button>
                )}
                <button
                  onClick={kembali}
                  style={{
                    width: '100%', padding: '12px', background: 'white', color: '#64748b',
                    border: '2px solid #e2e8f0', borderRadius: 14, fontWeight: 600, fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  ← Pilih Kategori Lain
                </button>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Floating bar — muncul kalau ada jawaban, di step 1 */}
      {!loading && step === 1 && gejalaTerpilih.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'white', borderTop: '1px solid #e2e8f0',
          padding: '14px 20px', zIndex: 50, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          gap: 12,
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
              {gejalaTerpilih.length} gejala dipilih
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Tambah kategori lain atau langsung analisis</p>
          </div>
          <button
            onClick={kirimDiagnosis}
            disabled={isSubmitting}
            style={{
              background: '#2563eb', color: 'white', border: 'none',
              borderRadius: 12, padding: '11px 22px', fontWeight: 800,
              fontSize: 14, cursor: 'pointer',
            }}
          >
            🔍 Analisis
          </button>
        </div>
      )}

      <MedicalDisclaimer />
      <Footer />
    </>
  );
}
