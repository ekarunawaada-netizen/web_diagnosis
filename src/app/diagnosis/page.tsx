'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Footer from '@/components/Footer';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';
import { useRouter } from 'next/navigation';

/* ─── TYPES ──────────────────────────────────────────────────────────────── */
interface ApiSymptom {
  id: number;
  code: string;
  name: string;
  description: string;
  weight: string;
  category: string;
}

interface SelectedSymptom extends ApiSymptom {
  cfValue: number; // 0.9 = pasti, 0.75 = kemungkinan besar, 0.5 = mungkin
}

/* ─── CF LEVEL OPTIONS ───────────────────────────────────────────────────── */
/* ─── CF CONFIDENCE LEVELS (matches backend USER_CONFIDENCE_LEVELS) ────── */
const CF_LEVELS = [
  {
    key: 'definitely_not',
    label: 'Tidak Sama Sekali',
    shortLabel: 'Tidak',
    value: 0,
    icon: 'do_not_disturb_on',
    color: 'text-slate-500',
    bg: 'bg-slate-100 border-slate-300',
  },
  {
    key: 'maybe_not',
    label: 'Mungkin Tidak',
    shortLabel: 'Mungkin Tidak',
    value: 0.25,
    icon: 'thumb_down',
    color: 'text-blue-500',
    bg: 'bg-blue-50 border-blue-200',
  },
  {
    key: 'unknown',
    label: 'Tidak Tahu',
    shortLabel: 'Tidak Tahu',
    value: 0.5,
    icon: 'help',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-200',
  },
  {
    key: 'maybe_yes',
    label: 'Mungkin Ya',
    shortLabel: 'Mungkin Ya',
    value: 0.75,
    icon: 'thumb_up',
    color: 'text-orange-500',
    bg: 'bg-orange-50 border-orange-200',
  },
  {
    key: 'definitely_yes',
    label: 'Pasti',
    shortLabel: 'Pasti',
    value: 1.0,
    icon: 'check_circle',
    color: 'text-red-500',
    bg: 'bg-red-50 border-red-200',
  },
];


/* ─── CATEGORY ICONS ────────────────────────────────────────────────────── */
const CATEGORY_ICON: Record<string, string> = {
  'Sistem Pernapasan': 'air',
  'Sistem Pencernaan': 'gastroenterology',
  'Psikiatri': 'psychology',
  'Nyeri': 'sentiment_very_dissatisfied',
  'Gejala Umum': 'monitor_heart',
  'Sistem Saraf': 'neurology',
  'Kulit': 'dermatology',
  'Kardiovaskular': 'cardiology',
  'Default': 'medical_information',
};

const getCategoryIcon = (category: string) =>
  CATEGORY_ICON[category] || CATEGORY_ICON['Default'];

/* ─── COMPONENT ─────────────────────────────────────────────────────────── */
export default function DiagnosisPage() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Data State ──────────────────────────────────────────────────────────
  const [allSymptoms, setAllSymptoms] = useState<ApiSymptom[]>([]);
  const [loadingSymptoms, setLoadingSymptoms] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // ── UI State ────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<'welcome' | 'select' | 'review'>('welcome');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [selectedSymptoms, setSelectedSymptoms] = useState<SelectedSymptom[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Fetch symptoms from API ──────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'select' && phase !== 'welcome') return;
    const fetchSymptoms = async () => {
      try {
        setLoadingSymptoms(true);
        const apiClient = (await import('@/lib/axios')).default;
        const res = await apiClient.get('/api/diagnose/symptoms');
        // Response: { success: true, data: [...] }
        const data = res.data?.data ?? res.data;
        if (Array.isArray(data)) {
          setAllSymptoms(data);
        } else {
          setFetchError('Format data gejala tidak valid dari server.');
        }
      } catch (err: any) {
        setFetchError(
          err.response?.status === 401
            ? 'Silakan login untuk mengakses fitur diagnosis.'
            : 'Gagal memuat daftar gejala. Periksa koneksi Anda.'
        );
      } finally {
        setLoadingSymptoms(false);
      }
    };
    fetchSymptoms();
  }, [phase]);

  // ── Derived data ────────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = new Set(allSymptoms.map(s => s.category));
    return ['Semua', ...Array.from(cats).sort()];
  }, [allSymptoms]);

  const filteredSymptoms = useMemo(() => {
    let list = allSymptoms;
    if (activeCategory !== 'Semua') {
      list = list.filter(s => s.category === activeCategory);
    }
    if (search.trim().length > 0) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allSymptoms, activeCategory, search]);

  const selectedCodes = useMemo(() => new Set(selectedSymptoms.map(s => s.code)), [selectedSymptoms]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const toggleSymptom = useCallback((symptom: ApiSymptom) => {
    setSelectedSymptoms(prev => {
      if (prev.some(s => s.code === symptom.code)) {
        return prev.filter(s => s.code !== symptom.code);
      }
      // Default: definitely_yes = 1.0
      return [...prev, { ...symptom, cfValue: 1.0 }];
    });
  }, []);

  const updateCF = useCallback((code: string, cfValue: number) => {
    setSelectedSymptoms(prev =>
      prev.map(s => s.code === code ? { ...s, cfValue } : s)
    );
  }, []);

  const removeSymptom = useCallback((code: string) => {
    setSelectedSymptoms(prev => prev.filter(s => s.code !== code));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (selectedSymptoms.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        // Exclude symptoms with CF=0 (definitely_not) — they add no information
        symptoms: selectedSymptoms
          .filter(s => s.cfValue > 0)
          .map(s => ({
            symptomCode: s.code,
            cfValue: s.cfValue,
            name: s.name,
          })),
        timestamp: new Date().toISOString(),
      };
      if (payload.symptoms.length === 0) {
        setIsSubmitting(false);
        return;
      }
      localStorage.setItem('mediscan_last_diagnosis', JSON.stringify(payload));
      localStorage.removeItem('mediscan_ongoing_diagnosis');
      router.push('/diagnosis/result');
    } catch {
      setIsSubmitting(false);
    }
  }, [selectedSymptoms, router]);

  /* ═════════════════════════════════════════════════════════════════════════
   *  PHASE: WELCOME
   * ═════════════════════════════════════════════════════════════════════════ */
  if (phase === 'welcome') {
    const highlights = [
      { icon: 'search', title: 'Cari Gejala', desc: 'Temukan gejala dari 200+ daftar klinis terstruktur' },
      { icon: 'tune', title: 'Atur Keyakinan', desc: 'Tentukan seberapa yakin Anda mengalami gejala ini' },
      { icon: 'analytics', title: 'Analisis CF', desc: 'Mesin inferensi Certainty Factor menghitung probabilitas penyakit' },
    ];

    return (
      <>
        <Navbar />
        <main className="pt-24 pb-16 min-h-screen px-4 md:px-8 relative overflow-hidden">
          {/* Background blobs */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary-container/20 blur-[80px]" />
            <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] rounded-full bg-tertiary-container/10 blur-[80px]" />
          </div>

          <div className="max-w-3xl mx-auto flex flex-col items-center relative z-10">
            {/* Hero */}
            <div className="w-full text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-primary/10">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stethoscope</span>
                Sistem Diagnosis Cerdas
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-on-surface leading-tight">
                Apa yang Anda <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">rasakan?</span>
              </h1>
              <p className="text-on-surface-variant font-medium text-lg max-w-xl mx-auto leading-relaxed">
                Pilih gejala dari database klinis kami, atur tingkat keyakinan, dan dapatkan analisis berbasis <strong>Certainty Factor</strong>.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-10">
              {highlights.map(h => (
                <div key={h.title} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/15 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary mb-4">
                    <span className="material-symbols-outlined text-2xl">{h.icon}</span>
                  </div>
                  <h3 className="font-headline font-bold text-on-surface mb-1">{h.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{h.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => setPhase('select')}
              className="w-full max-w-lg py-5 bg-gradient-to-r from-primary to-primary-container text-white rounded-2xl font-headline font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">play_arrow</span>
              Mulai Pilih Gejala
            </button>

            {/* Disclaimer preview */}
            <div className="mt-8 w-full bg-surface-dim/60 border border-outline-variant/20 rounded-2xl p-5">
              <div className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-outline text-xl shrink-0 mt-0.5">info</span>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface">Perhatian:</strong> Hasil analisis ini berbasis komputasi awal dan <strong className="text-error">TIDAK</strong> menggantikan diagnosis resmi dari tenaga medis profesional.
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ═════════════════════════════════════════════════════════════════════════
   *  PHASE: SELECT SYMPTOMS
   * ═════════════════════════════════════════════════════════════════════════ */
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-24 min-h-screen px-4 md:px-6 relative">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-primary-container/15 blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <button
                onClick={() => setPhase('welcome')}
                className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-2"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Kembali
              </button>
              <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface">
                Pilih Gejala Anda
              </h1>
              <p className="text-on-surface-variant text-sm mt-1">
                Cari dan pilih semua gejala yang Anda rasakan, lalu atur tingkat keyakinannya.
              </p>
            </div>

            {/* Submit button — always visible */}
            <button
              onClick={handleSubmit}
              disabled={selectedSymptoms.length === 0 || isSubmitting}
              className="shrink-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">analytics</span>
              {isSubmitting ? 'Memproses...' : `Analisis ${selectedSymptoms.length > 0 ? `(${selectedSymptoms.length})` : ''}`}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left: Symptom Picker ───────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">
              {/* Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cari gejala (contoh: demam, batuk, nyeri...)"
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface placeholder:text-outline-variant shadow-sm"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface">
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                )}
              </div>

              {/* Category filter */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeCategory === cat
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                        : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/30 hover:text-primary'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Symptom List */}
              {loadingSymptoms ? (
                <div className="py-20 text-center">
                  <span className="material-symbols-outlined text-primary text-5xl animate-spin mb-4">sync</span>
                  <p className="text-on-surface-variant font-medium">Memuat daftar gejala dari server...</p>
                </div>
              ) : fetchError ? (
                <div className="py-12 text-center bg-red-50 rounded-2xl border border-red-100 p-6">
                  <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
                  <p className="text-red-600 font-semibold mb-4">{fetchError}</p>
                  {fetchError.includes('login') && (
                    <Link href="/login" className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition">
                      Masuk Sekarang
                    </Link>
                  )}
                </div>
              ) : filteredSymptoms.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-outline text-5xl mb-3">search_off</span>
                  <p className="text-on-surface-variant font-medium">Tidak ada gejala yang cocok dengan pencarian.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredSymptoms.map(symptom => {
                    const isSelected = selectedCodes.has(symptom.code);
                    return (
                      <button
                        key={symptom.code}
                        onClick={() => toggleSymptom(symptom)}
                        className={`text-left p-4 rounded-2xl border transition-all duration-200 active:scale-[0.98] group ${isSelected
                            ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary/50'
                            : 'bg-surface-container-lowest border-outline-variant/20 hover:border-primary/50 hover:shadow-md'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary'
                            }`}>
                            {isSelected
                              ? <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              : <span className="material-symbols-outlined text-xl">{getCategoryIcon(symptom.category)}</span>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-bold text-sm leading-tight ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                                {symptom.name}
                              </span>
                              <span className="text-[10px] font-mono text-outline bg-surface-container px-1.5 py-0.5 rounded">
                                {symptom.code}
                              </span>
                            </div>
                            <span className="text-xs text-on-surface-variant mt-0.5 block">{symptom.category}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Count info */}
              {!loadingSymptoms && !fetchError && (
                <p className="text-xs text-outline text-center pt-2">
                  Menampilkan {filteredSymptoms.length} dari {allSymptoms.length} gejala
                </p>
              )}
            </div>

            {/* ── Right: Selected Symptoms Panel ────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-4">
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
                  {/* Panel header */}
                  <div className="p-5 border-b border-outline-variant/10 bg-surface-container-low/50">
                    <div className="flex items-center justify-between">
                      <h2 className="font-headline font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">checklist</span>
                        Gejala Dipilih
                      </h2>
                      {selectedSymptoms.length > 0 && (
                        <span className="px-2.5 py-1 bg-primary text-white text-xs font-black rounded-full">
                          {selectedSymptoms.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selected list */}
                  <div className="max-h-[500px] overflow-y-auto divide-y divide-outline-variant/10">
                    {selectedSymptoms.length === 0 ? (
                      <div className="py-12 px-6 text-center">
                        <span className="material-symbols-outlined text-outline text-4xl mb-3">add_circle</span>
                        <p className="text-sm text-on-surface-variant font-medium">
                          Belum ada gejala yang dipilih. Klik gejala di sebelah kiri untuk menambahkan.
                        </p>
                      </div>
                    ) : (
                      selectedSymptoms.map(s => (
                        <div key={s.code} className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-sm text-on-surface leading-tight">{s.name}</p>
                              <p className="text-xs text-outline font-mono">{s.code}</p>
                            </div>
                            <button
                              onClick={() => removeSymptom(s.code)}
                              className="text-outline hover:text-error transition-colors shrink-0 mt-0.5"
                            >
                              <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                          </div>
                          {/* CF Level Selector — Dropdown */}
                          <div className="mt-2">
                            <select
                              value={s.cfValue}
                              onChange={(e) => updateCF(s.code, parseFloat(e.target.value))}
                              className="w-full bg-surface-container-lowest border border-outline-variant/30 text-xs font-semibold rounded-lg px-2.5 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface transition-all cursor-pointer hover:border-primary/40 appearance-none"
                            >
                              {CF_LEVELS.map(level => (
                                <option key={level.key} value={level.value}>
                                  Keyakinan: {level.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer action */}
                  {selectedSymptoms.length > 0 && (
                    <div className="p-4 border-t border-outline-variant/10 bg-surface-container-low/30">
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                      >
                        {isSubmitting ? 'Memproses...' : 'Analisis Sekarang →'}
                      </button>
                      <button
                        onClick={() => setSelectedSymptoms([])}
                        className="w-full mt-2 py-2 text-xs text-on-surface-variant hover:text-error transition-colors font-semibold"
                      >
                        Reset Pilihan
                      </button>
                    </div>
                  )}
                </div>


              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Floating submit button on mobile */}
      {selectedSymptoms.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-outline-variant/10 lg:hidden z-40">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-lg rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-60"
          >
            {isSubmitting ? 'Memproses...' : `Analisis ${selectedSymptoms.length} Gejala →`}
          </button>
        </div>
      )}

      <MedicalDisclaimer />
      <Footer />
    </>
  );
}
