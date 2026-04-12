'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Footer from '@/components/Footer';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';
import diseasesData from '@/data/diseases.json';

/* ─── TYPES ─── */
interface SymptomAnswer {
  id: string;
  name: string;
  answer: 'ya' | 'tidak' | 'tidak_yakin';
  intensity: number;
  duration: number;
}

/* ─── QUESTION TREE ─── */
const questionTree = [
  // === ROOT QUESTIONS ===
  { id: 'demam', name: 'Demam', icon: 'thermostat', category: 'Gejala Vital', bodyArea: 'head',
    question: 'Apakah Anda merasa demam atau suhu tubuh meningkat?',
    tip: 'Gunakan termometer jika tersedia. Suhu di atas 37.5°C umumnya dianggap demam.',
    branches: { ya: ['berkeringat_malam', 'menggigil'], tidak: [] },
    isCritical: false },

  { id: 'berkeringat_malam', name: 'Berkeringat di Malam Hari', icon: 'nightlight', category: 'Gejala Infeksi',
    question: 'Apakah Anda sering berkeringat berlebihan di malam hari?',
    tip: 'Berkeringat malam yang tidak terkait suhu ruangan bisa menandakan infeksi sistemik.',
    branches: { ya: [], tidak: [] }, parentCondition: { id: 'demam', answer: 'ya' },
    isCritical: false },

  { id: 'menggigil', name: 'Menggigil', icon: 'ac_unit', category: 'Gejala Infeksi',
    question: 'Apakah Anda mengalami menggigil?',
    tip: 'Menggigil bersama demam bisa menunjukkan infeksi bakteri atau virus.',
    branches: { ya: [], tidak: [] }, parentCondition: { id: 'demam', answer: 'ya' },
    isCritical: false },

  { id: 'batuk', name: 'Batuk', icon: 'air', category: 'Sistem Pernapasan', bodyArea: 'chest',
    question: 'Apakah Anda mengalami batuk?',
    tip: 'Perhatikan jenis batuknya — kering atau berdahak, dan sudah berapa lama.',
    branches: { ya: ['sesak_napas'], tidak: [] },
    isCritical: false },

  { id: 'sesak_napas', name: 'Sesak Napas', icon: 'lungs', category: 'Sistem Pernapasan',
    question: 'Apakah Anda mengalami sesak napas atau kesulitan bernapas?',
    tip: '⚠️ Sesak napas parah memerlukan penanganan darurat.',
    branches: { ya: [], tidak: [] }, parentCondition: { id: 'batuk', answer: 'ya' },
    isCritical: true, criticalMessage: 'Sesak napas parah bisa mengindikasikan kondisi serius pada paru-paru atau jantung.' },

  { id: 'sakit_kepala', name: 'Sakit Kepala', icon: 'psychology', category: 'Nyeri', bodyArea: 'head',
    question: 'Apakah Anda mengalami sakit kepala?',
    tip: 'Perhatikan lokasi nyeri — depan, belakang, atau menyebar.',
    branches: { ya: [], tidak: [] },
    isCritical: false },

  { id: 'mual', name: 'Mual', icon: 'sick', category: 'Sistem Pencernaan', bodyArea: 'stomach',
    question: 'Apakah Anda merasa mual atau ingin muntah?',
    tip: 'Mual bisa berkaitan dengan masalah pencernaan, efek obat, atau gejala penyakit lain.',
    branches: { ya: ['muntah'], tidak: [] },
    isCritical: false },

  { id: 'muntah', name: 'Muntah', icon: 'sick', category: 'Sistem Pencernaan',
    question: 'Apakah Anda sudah muntah?',
    tip: 'Catat frekuensi muntah dan apakah disertai darah.',
    branches: { ya: [], tidak: [] }, parentCondition: { id: 'mual', answer: 'ya' },
    isCritical: false },

  { id: 'nyeri_dada', name: 'Nyeri Dada', icon: 'heart_broken', category: 'Gejala Kritis', bodyArea: 'chest',
    question: 'Apakah Anda mengalami nyeri di bagian dada?',
    tip: '⚠️ Nyeri dada hebat memerlukan perhatian medis segera.',
    branches: { ya: [], tidak: [] },
    isCritical: true, criticalMessage: 'Nyeri dada hebat bisa mengindikasikan serangan jantung atau kondisi paru-paru serius.' },

  { id: 'nyeri_otot', name: 'Nyeri Otot & Sendi', icon: 'fitness_center', category: 'Nyeri', bodyArea: 'body',
    question: 'Apakah Anda merasakan nyeri pada otot atau sendi?',
    tip: 'Nyeri otot bisa disebabkan aktivitas fisik atau gejala infeksi virus.',
    branches: { ya: [], tidak: [] },
    isCritical: false },

  { id: 'diare', name: 'Diare', icon: 'water_drop', category: 'Sistem Pencernaan', bodyArea: 'stomach',
    question: 'Apakah Anda mengalami diare (BAB encer berulang)?',
    tip: 'Hitung frekuensi BAB dalam 24 jam terakhir. Jaga hidrasi tubuh.',
    branches: { ya: [], tidak: [] },
    isCritical: false },

  { id: 'lemas', name: 'Lemas / Kelelahan', icon: 'battery_low', category: 'Gejala Umum', bodyArea: 'body',
    question: 'Apakah Anda merasa lemas atau sangat kelelahan?',
    tip: 'Lemas terus-menerus bisa menandakan infeksi, anemia, atau dehidrasi.',
    branches: { ya: [], tidak: [] },
    isCritical: false },

  { id: 'gatal', name: 'Gatal / Ruam Kulit', icon: 'dermatology', category: 'Kulit', bodyArea: 'body',
    question: 'Apakah Anda mengalami gatal-gatal atau ruam pada kulit?',
    tip: 'Perhatikan apakah gatal disertai ruam, bentol, atau perubahan warna kulit.',
    branches: { ya: [], tidak: [] },
    isCritical: false },

  { id: 'sakit_tenggorokan', name: 'Sakit Tenggorokan', icon: 'voice_over_off', category: 'Sistem Pernapasan', bodyArea: 'head',
    question: 'Apakah tenggorokan Anda terasa sakit atau nyeri saat menelan?',
    tip: 'Perhatikan apakah disertai kesulitan menelan, suara serak, atau pembengkakan.',
    branches: { ya: [], tidak: [] },
    isCritical: false },
];

// Root-level questions (no parent condition)
const rootQuestions = questionTree.filter(q => !q.parentCondition);

/* ─── BODY AREA MAP ─── */
const bodyAreas = [
  { id: 'head', label: 'Kepala', icon: 'face', y: '10%' },
  { id: 'chest', label: 'Dada', icon: 'monitor_heart', y: '35%' },
  { id: 'stomach', label: 'Perut', icon: 'gastroenterology', y: '55%' },
];

/* ─── PHASES ─── */
type Phase = 'welcome' | 'quiz' | 'emergency' | 'result';

export default function DiagnosisPage() {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [answers, setAnswers] = useState<SymptomAnswer[]>([]);
  const [questionQueue, setQuestionQueue] = useState<string[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [emergencyMsg, setEmergencyMsg] = useState('');
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // All unique symptom names from diseases data for autocomplete
  const allSymptomNames = useMemo(() => {
    const set = new Set<string>();
    diseasesData.forEach((d: any) => d.symptoms.forEach((s: string) => {
      const n = s.toLowerCase().replace(/^dan\s+/, '').replace(/^hingga\s+/, '').trim();
      if (n.length > 3 && !n.includes('bergantung')) set.add(n);
    }));
    return Array.from(set).sort().map(s => s.charAt(0).toUpperCase() + s.slice(1));
  }, []);

  const filteredSuggestions = useMemo(() =>
    search.length > 1 ? allSymptomNames.filter(s => s.toLowerCase().includes(search.toLowerCase())).slice(0, 8) : []
  , [search, allSymptomNames]);

  // Build question queue
  const startQuiz = useCallback((initialQueue?: string[]) => {
    const queue = initialQueue || rootQuestions.map(q => q.id);
    setQuestionQueue(queue);
    setCurrentQIdx(0);
    setAnswers([]);
    setSelectedOption(null);
    setPhase('quiz');
  }, []);

  const startFromBodyArea = useCallback((areaId: string) => {
    // prioritize questions relating to this body area
    const areaQuestions = rootQuestions.filter(q => q.bodyArea === areaId).map(q => q.id);
    const otherQuestions = rootQuestions.filter(q => q.bodyArea !== areaId).map(q => q.id);
    startQuiz([...areaQuestions, ...otherQuestions]);
  }, [startQuiz]);

  const startFromSearch = useCallback((symptomName: string) => {
    // Find matching question, put it first
    const matchQ = rootQuestions.find(q => q.name.toLowerCase().includes(symptomName.toLowerCase()));
    if (matchQ) {
      const others = rootQuestions.filter(q => q.id !== matchQ.id).map(q => q.id);
      startQuiz([matchQ.id, ...others]);
    } else {
      startQuiz();
    }
    setSearch('');
    setShowSuggestions(false);
  }, [startQuiz]);

  const currentQuestion = useMemo(() => {
    if (currentQIdx >= questionQueue.length) return null;
    return questionTree.find(q => q.id === questionQueue[currentQIdx]) || null;
  }, [currentQIdx, questionQueue]);

  const progress = questionQueue.length > 0 ? ((currentQIdx + 1) / questionQueue.length) * 100 : 0;

  const handleAnswer = useCallback((answer: 'ya' | 'tidak' | 'tidak_yakin') => {
    if (!currentQuestion) return;
    setSelectedOption(answer);

    setTimeout(() => {
      setIsTransitioning(true);

      const newAnswer: SymptomAnswer = {
        id: currentQuestion.id,
        name: currentQuestion.name,
        answer,
        intensity: answer === 'ya' ? 3 : answer === 'tidak_yakin' ? 2 : 0,
        duration: 3,
      };

      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);

      // RED FLAG check
      if (answer === 'ya' && currentQuestion.isCritical) {
        setEmergencyMsg(currentQuestion.criticalMessage || 'Gejala kritis terdeteksi!');
        setTimeout(() => {
          setPhase('emergency');
          setIsTransitioning(false);
        }, 300);
        return;
      }

      // Branch logic: if "Ya", inject follow-up questions
      let newQueue = [...questionQueue];
      if (answer === 'ya' && currentQuestion.branches?.ya?.length) {
        const insertIdx = currentQIdx + 1;
        const branchIds = currentQuestion.branches.ya.filter(
          (bId: string) => !newQueue.includes(bId) // prevent duplicates
        );
        newQueue.splice(insertIdx, 0, ...branchIds);
        setQuestionQueue(newQueue);
      }

      setTimeout(() => {
        const nextIdx = currentQIdx + 1;
        if (nextIdx >= newQueue.length) {
          // Quiz finished → show results
          // Save to localStorage for result page
          const selectedSymptoms = updatedAnswers
            .filter(a => a.answer === 'ya' || a.answer === 'tidak_yakin')
            .map(a => ({ id: a.id, name: a.name, intensity: a.intensity, duration: a.duration }));

          localStorage.setItem('mediscan_last_diagnosis', JSON.stringify({
            symptoms: selectedSymptoms,
            timestamp: new Date().toISOString()
          }));
          setPhase('result');
        } else {
          setCurrentQIdx(nextIdx);
          setSelectedOption(null);
        }
        setIsTransitioning(false);
      }, 300);
    }, 200);
  }, [currentQuestion, answers, questionQueue, currentQIdx]);

  const goBack = useCallback(() => {
    if (currentQIdx > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQIdx(prev => prev - 1);
        setSelectedOption(null);
        setAnswers(prev => prev.slice(0, -1));
        setIsTransitioning(false);
      }, 300);
    } else {
      setPhase('welcome');
    }
  }, [currentQIdx]);

  // Matched diseases for result
  const diagnosisResults = useMemo(() => {
    const userSymptoms = answers.filter(a => a.answer === 'ya' || a.answer === 'tidak_yakin').map(a => a.name.toLowerCase());
    if (userSymptoms.length === 0) return [];

    return diseasesData.map((disease: any) => {
      let matched = 0;
      disease.symptoms.forEach((s: string) => {
        if (userSymptoms.some(us => s.toLowerCase().includes(us) || us.includes(s.toLowerCase()))) matched++;
      });
      const probability = Math.min(Math.round((matched / Math.max(userSymptoms.length, disease.symptoms.length)) * 100), 95);
      return { ...disease, probability, matched };
    })
    .filter(d => d.matched > 0)
    .sort((a, b) => b.probability - a.probability || b.matched - a.matched)
    .slice(0, 3);
  }, [answers]);

  /* ═══════════════════════════════════════════════════════════════
   *  RENDER: WELCOME / SMART SEARCH SCREEN
   * ═══════════════════════════════════════════════════════════════ */
  if (phase === 'welcome') {
    const symptomCategories = [
      { icon: 'thermostat', label: 'Demam & Infeksi', desc: 'Suhu tinggi, menggigil', color: 'from-red-500/10 to-orange-500/5', iconColor: 'text-red-500', border: 'border-red-200/40' },
      { icon: 'lungs', label: 'Pernapasan', desc: 'Batuk, sesak napas', color: 'from-blue-500/10 to-cyan-500/5', iconColor: 'text-blue-500', border: 'border-blue-200/40' },
      { icon: 'gastroenterology', label: 'Pencernaan', desc: 'Mual, diare, muntah', color: 'from-green-500/10 to-emerald-500/5', iconColor: 'text-green-600', border: 'border-green-200/40' },
      { icon: 'psychology', label: 'Kepala & Saraf', desc: 'Sakit kepala, pusing', color: 'from-purple-500/10 to-violet-500/5', iconColor: 'text-purple-500', border: 'border-purple-200/40' },
      { icon: 'fitness_center', label: 'Otot & Sendi', desc: 'Nyeri, kaku, bengkak', color: 'from-amber-500/10 to-yellow-500/5', iconColor: 'text-amber-600', border: 'border-amber-200/40' },
      { icon: 'dermatology', label: 'Kulit & Alergi', desc: 'Gatal, ruam, bentol', color: 'from-pink-500/10 to-rose-500/5', iconColor: 'text-pink-500', border: 'border-pink-200/40' },
    ];

    return (
      <>
        <Navbar />
        <main className="pt-24 pb-12 min-h-screen px-4 md:px-8 overflow-hidden relative border-t border-outline-variant/10">
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary-container/20 blur-[80px]"></div>
            <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] rounded-full bg-tertiary-container/10 blur-[80px]"></div>
          </div>

          <div className="max-w-3xl mx-auto flex flex-col items-center relative z-10">
            {/* Hero Header */}
            <div className="w-full text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-primary/10">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stethoscope</span>
                Sistem Analisis Gejala
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-on-surface leading-tight">
                Apa yang Anda <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">rasakan?</span>
              </h1>
              <p className="text-on-surface-variant font-medium text-lg max-w-xl mx-auto leading-relaxed">
                Cari gejala atau langsung mulai diagnosis interaktif. Kami akan memandu Anda langkah demi langkah.
              </p>
            </div>

            {/* Smart Search */}
            <div className="relative w-full max-w-lg mb-12">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
                <input
                  ref={searchRef}
                  className="w-full pl-12 md:pl-14 pr-6 py-4 md:py-5 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary font-medium text-on-surface transition-all outline-none shadow-lg shadow-primary/5 placeholder:text-outline-variant text-sm md:text-base"
                  placeholder="Cari gejala utama Anda (contoh: Pusing, Demam, Mual)"
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-surface-container-lowest backdrop-blur-xl border border-outline-variant/30 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[320px] overflow-y-auto">
                  {filteredSuggestions.map((s) => (
                    <div key={s} onMouseDown={() => startFromSearch(s)} className="px-6 py-4 hover:bg-primary/5 cursor-pointer transition-colors flex items-center gap-3 border-b border-outline-variant/10 last:border-0">
                      <span className="material-symbols-outlined text-primary text-xl">medical_information</span>
                      <span className="font-medium text-on-surface">{s}</span>
                      <span className="ml-auto material-symbols-outlined text-outline-variant text-sm">arrow_forward</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Start CTA */}
            <button
              onClick={() => startQuiz()}
              className="w-full max-w-lg py-5 bg-gradient-to-r from-primary to-primary-container text-white rounded-2xl font-headline font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-12 group"
            >
              <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform duration-300">play_arrow</span>
              Mulai Diagnosis Interaktif
            </button>

            {/* Symptom Categories Grid */}
            <div className="w-full mb-12">
              <p className="text-center text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">Atau pilih kategori gejala</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {symptomCategories.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => {
                      const matchQ = rootQuestions.find(q => q.category.includes(cat.label.split(' ')[0]) || cat.label.includes(q.category.split(' ')[0]));
                      if (matchQ) startFromBodyArea(matchQ.bodyArea || 'body');
                      else startQuiz();
                    }}
                    className={`group relative p-5 rounded-2xl bg-gradient-to-br ${cat.color} border ${cat.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left active:scale-[0.97] overflow-hidden`}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-white flex items-center justify-center mb-3 shadow-sm ${cat.iconColor} group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                    </div>
                    <h3 className="font-headline font-bold text-on-surface text-sm mb-0.5">{cat.label}</h3>
                    <p className="text-xs text-on-surface-variant">{cat.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Cards */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Tips */}
              <div className="bg-gradient-to-br from-tertiary/8 to-transparent p-6 rounded-2xl flex gap-4 items-start border border-tertiary/15">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-tertiary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-on-surface mb-1">Panduan</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">Jawab jujur setiap pertanyaan. Sistem akan menyesuaikan pertanyaan lanjutan berdasarkan jawaban Anda.</p>
                </div>
              </div>

              {/* Emergency */}
              <div className="bg-gradient-to-br from-error/8 to-transparent p-6 rounded-2xl flex gap-4 items-start border border-error/15">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-error text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-on-surface mb-1">Darurat?</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">Nyeri dada hebat atau sesak napas? <a href="tel:112" className="text-error font-bold underline">Hubungi 112</a> segera.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
   *  RENDER: EMERGENCY RED FLAG SCREEN
   * ═══════════════════════════════════════════════════════════════ */
  if (phase === 'emergency') {
    return (
      <>
        <Navbar />
        <main className="fixed inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-900 z-[100] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 text-center shadow-2xl">
            <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <span className="material-symbols-outlined text-error text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>crisis_alert</span>
            </div>
            <h2 className="text-3xl font-black text-on-surface mb-2 font-headline">🚨 PERINGATAN DARURAT</h2>
            <p className="text-error font-bold text-lg mb-4">Gejala yang Anda alami memerlukan penanganan segera!</p>
            <p className="text-on-surface-variant font-medium mb-8 leading-relaxed">
              {emergencyMsg}
            </p>
            <p className="text-sm text-on-surface-variant mb-8 bg-error/5 p-4 rounded-xl border border-error/10">
              Mohon segera kunjungi <strong>IGD terdekat</strong> atau hubungi layanan darurat.
            </p>
            <div className="flex flex-col gap-4">
              <a href="tel:112" className="w-full py-5 bg-error text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-error/30 hover:scale-[1.02] active:scale-95 transition-all">
                <span className="material-symbols-outlined">emergency</span> HUBUNGI 112
              </a>
              <Link href="/clinic" className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                <span className="material-symbols-outlined">location_on</span> Cari IGD Terdekat
              </Link>
              <button
                onClick={() => {
                  // Continue anyway - skip to next question
                  setPhase('quiz');
                  setCurrentQIdx(prev => prev + 1);
                  setSelectedOption(null);
                  if (currentQIdx + 1 >= questionQueue.length) {
                    const selectedSymptoms = answers
                      .filter(a => a.answer === 'ya' || a.answer === 'tidak_yakin')
                      .map(a => ({ id: a.id, name: a.name, intensity: a.intensity, duration: a.duration }));
                    localStorage.setItem('mediscan_last_diagnosis', JSON.stringify({
                      symptoms: selectedSymptoms, timestamp: new Date().toISOString()
                    }));
                    setPhase('result');
                  }
                }}
                className="w-full py-4 text-outline font-bold hover:text-on-surface transition-colors"
              >
                Lanjutkan Diagnosis
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
   *  RENDER: RESULT SCREEN
   * ═══════════════════════════════════════════════════════════════ */
  if (phase === 'result') {
    const activeSymptoms = answers.filter(a => a.answer === 'ya' || a.answer === 'tidak_yakin');
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-12 min-h-screen px-4 md:px-8 relative border-t border-outline-variant/10">
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary-container/20 blur-[80px]"></div>
            <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] rounded-full bg-tertiary-container/10 blur-[80px]"></div>
          </div>

          <div className="max-w-3xl mx-auto relative z-10 space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-4">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                Hasil Analisis
              </div>
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">Analisis Selesai</h1>
              <p className="text-on-surface-variant font-medium text-lg">Berdasarkan {activeSymptoms.length} gejala yang dilaporkan</p>
            </div>

            {/* Probability Bars */}
            <div className="bg-surface-container-lowest p-8 md:p-10 rounded-3xl shadow-xl shadow-primary/5 border border-white/60 space-y-6">
              <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">bar_chart</span>
                </div>
                Kemungkinan Diagnosis
              </h2>

              {diagnosisResults.length === 0 ? (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-5xl text-outline mb-4">sentiment_dissatisfied</span>
                  <p className="text-on-surface-variant font-medium">Tidak cukup data untuk diagnosis. Coba jawab lebih banyak pertanyaan.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {diagnosisResults.map((result, idx) => (
                    <div key={result.name} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className={`text-xs font-black uppercase tracking-widest ${idx === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {idx === 0 ? '🏆 Paling Mungkin' : `#${idx + 1}`}
                          </span>
                          <h3 className={`font-headline font-bold text-lg ${idx === 0 ? 'text-on-surface' : 'text-on-surface/80'}`}>{result.name}</h3>
                        </div>
                        <span className={`text-2xl font-black font-headline ${idx === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>{result.probability}%</span>
                      </div>
                      <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            idx === 0 ? 'bg-gradient-to-r from-primary to-primary-container' :
                            idx === 1 ? 'bg-gradient-to-r from-secondary to-secondary-container' :
                            'bg-gradient-to-r from-tertiary to-tertiary-container'
                          }`}
                          style={{ width: `${result.probability}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-on-surface-variant"><span className="font-semibold">Penyebab:</span> {result.cause}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Symptoms Answered */}
            <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10">
              <h2 className="font-headline text-xl font-bold text-on-surface mb-4">Ringkasan Jawaban Anda</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {answers.map((a) => (
                  <div key={a.id} className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 ${
                    a.answer === 'ya' ? 'bg-primary/5 border-primary/20 text-primary' :
                    a.answer === 'tidak_yakin' ? 'bg-tertiary/5 border-tertiary/20 text-tertiary' :
                    'bg-surface-container-low border-outline-variant/20 text-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined text-base" style={a.answer === 'ya' ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                      {a.answer === 'ya' ? 'check_circle' : a.answer === 'tidak_yakin' ? 'help' : 'cancel'}
                    </span>
                    {a.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Treatment Advice */}
            {diagnosisResults.length > 0 && (
              <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10 space-y-4">
                <h2 className="font-headline text-xl font-bold text-on-surface">Saran Penanganan</h2>
                <div className="flex gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                    <span className="material-symbols-outlined">medication</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Tindakan Mandiri</h4>
                    <p className="text-sm text-on-surface-variant">{diagnosisResults[0].treatment}</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-2xl bg-tertiary/5 border border-tertiary/10 group">
                  <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform shrink-0">
                    <span className="material-symbols-outlined">shield</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Pencegahan</h4>
                    <p className="text-sm text-on-surface-variant">{diagnosisResults[0].prevention}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/diagnosis/result"
                onClick={() => {
                  const selectedSymptoms = answers
                    .filter(a => a.answer === 'ya' || a.answer === 'tidak_yakin')
                    .map(a => ({ id: a.id, name: a.name, intensity: a.intensity, duration: a.duration }));
                  localStorage.setItem('mediscan_last_diagnosis', JSON.stringify({
                    symptoms: selectedSymptoms, timestamp: new Date().toISOString()
                  }));
                }}
                className="flex-1 py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-2xl font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">description</span>
                Lihat Laporan Lengkap
              </Link>
              <button
                onClick={() => { setPhase('welcome'); setAnswers([]); setCurrentQIdx(0); }}
                className="flex-1 py-4 bg-surface-container-low text-on-surface border border-outline-variant/20 rounded-2xl font-headline font-bold hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">refresh</span>
                Ulangi Diagnosis
              </button>
            </div>

            {/* Disclaimer */}
            <div className="bg-surface-dim/60 border border-outline-variant/20 rounded-2xl p-6">
              <div className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-outline text-xl shrink-0 mt-0.5">info</span>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface">Perhatian:</strong> Hasil analisis ini berbasis komputasi awal dan <strong className="text-error">TIDAK</strong> menggantikan diagnosis resmi dari tenaga medis profesional. Segera konsultasikan dengan dokter untuk penanganan yang tepat.
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
   *  RENDER: QUIZ / QUESTION SCREEN (Typeform style)
   * ═══════════════════════════════════════════════════════════════ */
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-32 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary-container/20 blur-[80px]"></div>
          <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-tertiary-container/10 blur-[80px]"></div>
        </div>

        <div className={`w-full max-w-[640px] flex flex-col gap-6 md:gap-8 relative z-10 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'}`}>

          {/* Progress Tracker */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="font-headline text-on-surface-variant font-semibold tracking-tight text-sm uppercase">Pertanyaan Diagnosis</span>
              <span className="font-headline text-primary font-extrabold text-lg">
                {currentQIdx + 1}<span className="text-on-surface-variant/40 font-medium">/{questionQueue.length}</span>
              </span>
            </div>
            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          {currentQuestion && (
            <div className="bg-surface-container-lowest p-6 md:p-12 rounded-3xl shadow-[0_8px_32px_rgba(25,27,35,0.04)] border border-outline-variant/15">
              <div className="space-y-10">
                {/* Category & Question */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-secondary-container/20 text-on-secondary-container px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>vital_signs</span>
                    {currentQuestion.category}
                  </div>
                  <h1 className="text-2xl md:text-4xl font-headline font-extrabold text-on-surface leading-tight tracking-tight">
                    {currentQuestion.question}
                  </h1>
                  <p className="text-on-surface-variant text-base md:text-lg leading-relaxed">
                    Pilih jawaban yang paling sesuai dengan kondisi Anda saat ini.
                  </p>
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Ya */}
                  <button
                    onClick={() => handleAnswer('ya')}
                    className={`group flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 text-left active:scale-[0.98] ${
                      selectedOption === 'ya'
                        ? 'bg-primary/5 border-primary shadow-sm'
                        : 'bg-surface-container-low border-transparent hover:border-primary/30 hover:bg-surface-container-highest'
                    }`}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl shadow-sm transition-all duration-300 ${
                        selectedOption === 'ya' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white text-primary group-hover:bg-primary group-hover:text-white'
                      }`}>
                        <span className="material-symbols-outlined text-xl md:text-2xl" style={selectedOption === 'ya' ? { fontVariationSettings: "'FILL' 1" } : undefined}>check_circle</span>
                      </div>
                      <div>
                        <span className={`text-lg md:text-xl font-bold block ${selectedOption === 'ya' ? 'text-primary' : 'text-on-surface'}`}>Ya</span>
                        <span className="text-xs md:text-sm text-on-surface-variant">Saya mengalami gejala ini</span>
                      </div>
                    </div>
                  </button>

                  {/* Tidak */}
                  <button
                    onClick={() => handleAnswer('tidak')}
                    className={`group flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 text-left active:scale-[0.98] ${
                      selectedOption === 'tidak'
                        ? 'bg-primary/5 border-primary shadow-sm'
                        : 'bg-surface-container-low border-transparent hover:border-primary/30 hover:bg-surface-container-highest'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 flex items-center justify-center rounded-xl shadow-sm transition-all duration-300 ${
                        selectedOption === 'tidak' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white text-on-surface-variant group-hover:bg-primary group-hover:text-white'
                      }`}>
                        <span className="material-symbols-outlined text-2xl">cancel</span>
                      </div>
                      <div>
                        <span className={`text-xl font-bold block ${selectedOption === 'tidak' ? 'text-primary' : 'text-on-surface'}`}>Tidak</span>
                        <span className="text-sm text-on-surface-variant">Saya tidak mengalaminya</span>
                      </div>
                    </div>
                  </button>

                  {/* Tidak Yakin */}
                  <button
                    onClick={() => handleAnswer('tidak_yakin')}
                    className={`group flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 text-left active:scale-[0.98] ${
                      selectedOption === 'tidak_yakin'
                        ? 'bg-primary/5 border-primary shadow-sm'
                        : 'bg-surface-container-low border-transparent hover:border-primary/30 hover:bg-surface-container-highest'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 flex items-center justify-center rounded-xl shadow-sm transition-all duration-300 ${
                        selectedOption === 'tidak_yakin' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white text-tertiary group-hover:bg-primary group-hover:text-white'
                      }`}>
                        <span className="material-symbols-outlined text-2xl">help</span>
                      </div>
                      <div>
                        <span className={`text-xl font-bold block ${selectedOption === 'tidak_yakin' ? 'text-primary' : 'text-on-surface'}`}>Tidak Yakin</span>
                        <span className="text-sm text-on-surface-variant">Saya ragu tentang gejala ini</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-12 flex items-center justify-between">
                <button
                  onClick={goBack}
                  className="text-on-surface-variant font-headline font-bold flex items-center gap-2 hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Kembali
                </button>
                <span className="text-xs text-outline font-medium">
                  {answers.filter(a => a.answer === 'ya').length} gejala terdeteksi
                </span>
              </div>
            </div>
          )}

          {/* Tip Card */}
          {currentQuestion && (
            <div className="bg-tertiary-fixed/20 p-6 rounded-2xl flex gap-4 items-start border border-tertiary-fixed-dim/15">
              <span className="material-symbols-outlined text-tertiary flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                <span className="font-bold text-on-surface">Tips:</span> {currentQuestion.tip}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Status Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40 hidden md:block">
        <div className="bg-inverse-surface text-inverse-on-surface py-3 px-6 rounded-full shadow-2xl flex items-center justify-between opacity-90 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold tracking-wide uppercase">AI Diagnosis Engine Active</span>
          </div>
          <div className="h-4 w-px bg-white/20"></div>
          <span className="text-xs font-medium">Data dienkripsi</span>
        </div>
      </div>
    </>
  );
}
