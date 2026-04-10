'use client';

import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Footer from '@/components/Footer';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';
import diseasesData from '@/data/diseases.json';

interface Symptom {
  id: string;
  name: string;
  icon?: string;
}

// Icon mapping for common symptoms
const iconMap: Record<string, string> = {
  'demam': 'thermostat',
  'batuk': 'air',
  'pusing': 'psychology',
  'mual': 'sick',
  'lemas': 'moped',
  'sesak napas': 'lungs',
  'nyeri dada': 'heart_broken',
  'sakit tenggorokan': 'voice_over_off',
  'diare': 'water_drop',
  'gatal': 'pan_tool_alt',
};

export default function DiagnosisPage() {
  const [selected, setSelected] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Extract all unique symptoms from database
  const allSymptoms = useMemo(() => {
    const symptomsSet = new Set<string>();
    diseasesData.forEach((disease: any) => {
      disease.symptoms.forEach((s: string) => symptomsSet.add(s.toLowerCase()));
    });
    return Array.from(symptomsSet).sort().map(s => ({
      id: s.replace(/\s+/g, '_'),
      name: s.charAt(0).toUpperCase() + s.slice(1),
      icon: iconMap[s.toLowerCase()] || 'medical_information'
    }));
  }, []);

  // Featured symptoms for the grid
  const featuredSymptoms = useMemo(() => {
    const common = ['demam', 'batuk', 'pusing', 'mual', 'lemas', 'sesak napas', 'nyeri dada', 'sakit tenggorokan', 'diare', 'gatal'];
    return allSymptoms.filter(s => common.includes(s.name.toLowerCase()));
  }, [allSymptoms]);

  const toggleSymptom = (symptom: Symptom) => {
    if (selected.find(s => s.id === symptom.id)) {
      setSelected(selected.filter(s => s.id !== symptom.id));
    } else {
      setSelected([...selected, { ...symptom, intensity: 2, duration: 3 }]);
    }
  };

  const remove = (id: string) => {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  };

  const updateDetail = (id: string, field: 'intensity' | 'duration', value: number) => {
    setSelected((prev) => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const filteredSuggestions = allSymptoms.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) && search.length > 0);

  const dataStrength = selected.length >= 3 ? 'Kuat' : selected.length >= 1 ? 'Sedang' : 'Lemah';

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 min-h-screen px-4 md:px-8 overflow-hidden relative border-t border-outline-variant/10">
        {/* Background Ambient Ornaments */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary-container/20 blur-[80px]"></div>
          <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] rounded-full bg-tertiary-container/10 blur-[80px]"></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
          {/* Header & Progress */}
          <div className="w-full max-w-3xl mb-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary pb-1">
              Diagnosis Interaktif
            </h1>
            <p className="text-on-surface-variant font-medium text-lg mb-10 max-w-xl mx-auto">Sebutkan gejala yang Anda rasakan. Mesin logika Neural kami akan membantu menganalisis potensi kesehatan Anda secara instan.</p>
            {/* Progress Bar */}
            <div className="relative w-full h-3.5 bg-surface-container-highest rounded-full overflow-hidden mb-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] border border-outline-variant/20">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-tertiary w-2/3 rounded-full transition-all duration-1000 ease-out relative">
                 <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-xs font-bold font-label uppercase tracking-widest text-primary">Tahap 2 dari 3</span>
              <span className="text-xs font-bold font-label uppercase tracking-widest text-outline">Pemilihan Gejala</span>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 mt-8 md:mt-12 mb-12 md:mb-20 relative z-10">
            {/* Left: Input */}
            <div className="flex-1 w-full order-2 lg:order-1 animate-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
               <div className="bg-surface/60 backdrop-blur-xl p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl shadow-primary/5 border border-white/60">
                <h2 className="font-headline text-2xl font-bold mb-8 flex items-center gap-3 text-on-surface">
                  <div className="w-10 h-10 rounded-xl bg-primary-container text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">stethoscope</span>
                  </div>
                  Apa yang Anda rasakan saat ini?
                </h2>
                {/* Symptoms Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  {featuredSymptoms.map((s) => {
                    const isActive = selected.some((sel) => sel.id === s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => toggleSymptom(s)}
                        className={`group relative flex flex-col items-center p-6 rounded-2xl cursor-pointer transition-all duration-300 transform active:scale-95 border border-transparent ${
                          isActive
                            ? 'bg-gradient-to-br from-primary to-primary-container text-white shadow-[0_8px_20px_rgba(0,100,255,0.25)] border-primary hover:-translate-y-1'
                            : 'bg-surface-container-lowest hover:bg-surface hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 text-on-surface-variant'
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-4xl mb-4 transition-transform duration-500 ${isActive ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110'}`}
                          style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                          {s.icon}
                        </span>
                        <span className={`font-bold font-headline tracking-wide ${isActive ? 'text-white' : 'text-on-surface'}`}>{s.name}</span>
                        {isActive && (
                          <div className="absolute top-3 right-3 animate-in fade-in zoom-in spin-in-12 duration-300">
                            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Search */}
                <div className="mt-10 flex flex-col gap-3">
                  <label className="text-xs font-label font-bold uppercase tracking-widest text-outline">Atau telusuri gejala lainnya</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-xl">search</span>
                    <input
                      className="w-full pl-14 pr-6 py-5 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary font-medium text-on-surface transition-all outline-none shadow-sm placeholder:font-normal placeholder:text-outline-variant"
                      placeholder="Ketik gejala kustom (mis: Mata berkunang, lemas...)"
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    />
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-surface backdrop-blur-xl border border-outline-variant/30 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        {filteredSuggestions.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => {
                              if (!selected.some(sel => sel.id === s.id)) {
                                setSelected([...selected, { ...s, intensity: 2, duration: 3 }]);
                              }
                              setSearch('');
                              setShowSuggestions(false);
                            }}
                            className="px-6 py-4 hover:bg-primary/5 cursor-pointer transition-colors flex items-center gap-3 border-b border-outline-variant/10 last:border-0"
                          >
                            <span className="material-symbols-outlined text-primary text-xl">{s.icon}</span>
                            <span className="font-medium text-on-surface">{s.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-r from-tertiary/10 to-transparent p-6 md:p-8 rounded-[2rem] flex items-start sm:items-center gap-5 border border-tertiary/20 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-tertiary/20 group-hover:rotate-12 transition-transform duration-500">
                  <span className="material-symbols-outlined text-tertiary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                </div>
                <div>
                  <h4 className="font-headline font-black text-on-surface text-lg mb-1">Panduan Akurasi</h4>
                  <p className="text-on-surface-variant font-medium leading-relaxed">Pilih setidaknya <strong className="text-primary">2-3 gejala</strong> untuk hasil penelusuran algoritmik yang presisi. Durasi gejala menentukan kalkulasi.</p>
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="w-full lg:w-[420px] shrink-0 order-1 lg:order-2 animate-in slide-in-from-bottom-12 duration-1000 delay-500 fill-mode-both">
              {/* Selected Summary Card */}
              <div className="bg-surface/80 backdrop-blur-xl p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/80 shadow-2xl shadow-slate-200/50 flex flex-col gap-5 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
                
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <h3 className="font-headline font-black text-xl text-on-surface">Indikator Pasien</h3>
                  <span className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-black font-label shadow-sm animate-pulse shadow-primary/30">
                    {selected.length} AKTIF
                  </span>
                </div>
                <div className="flex flex-col gap-4 relative z-10 min-h-16">
                  {selected.map((sel) => {
                    const symptom = allSymptoms.find((s) => s.id === sel.id) || { name: sel.name || sel.id };
                    return (
                      <div key={sel.id} className="p-4 bg-on-surface/5 border border-outline-variant/20 rounded-2xl flex flex-col gap-3 transition-transform animate-in fade-in zoom-in">
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-2">
                             <span className="font-bold text-on-surface">{symptom.name}</span>
                             <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded uppercase">{sel.intensity === 1 ? 'Ringan' : sel.intensity === 2 ? 'Sedang' : 'Tinggi'}</span>
                           </div>
                           <button onClick={() => remove(sel.id)} className="material-symbols-outlined text-sm hover:text-error transition-colors bg-surface-container/20 rounded-full p-0.5">close</button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-outline uppercase tracking-widest flex justify-between">
                              Intensitas <span>{sel.intensity}/3</span>
                            </label>
                            <input 
                              type="range" min="1" max="3" step="1" 
                              value={sel.intensity} 
                              onChange={(e) => updateDetail(sel.id, 'intensity', parseInt(e.target.value))}
                              className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-outline uppercase tracking-widest flex justify-between">
                              Durasi <span>{sel.duration} Hari</span>
                            </label>
                            <input 
                              type="range" min="1" max="14" step="1" 
                              value={sel.duration} 
                              onChange={(e) => updateDetail(sel.id, 'duration', parseInt(e.target.value))}
                              className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {selected.length === 0 && (
                     <div className="w-full h-full border-2 border-dashed border-outline-variant/40 rounded-xl flex flex-col items-center justify-center p-6 text-outline">
                         <span className="material-symbols-outlined text-3xl mb-2">check_box_outline_blank</span>
                         <p className="text-sm font-medium">Belum ada blok terpilih</p>
                     </div>
                  )}
                </div>
                
                <div className="mt-4 pt-6 border-t border-outline-variant/20 relative z-10">
                  <div className="flex justify-between items-center text-sm font-bold text-outline uppercase tracking-wide mb-3">
                    <span>Proses Estimasi</span>
                    <span className="text-on-surface">~2 Menit</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-outline uppercase tracking-wide">
                    <span>Probabilitas Data</span>
                    <div className="flex gap-2 items-center bg-surface-container-high px-3 py-1.5 rounded-lg text-on-surface">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${dataStrength === 'Kuat' ? 'bg-primary' : dataStrength === 'Sedang' ? 'bg-tertiary' : 'bg-error'}`}></div>
                      <span>{dataStrength}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/diagnosis/result"
                  onClick={() => {
                    localStorage.setItem('mediscan_last_diagnosis', JSON.stringify({
                      symptoms: selected.map(s => {
                        const sym = allSymptoms.find(sym => sym.id === s.id);
                        return { id: s.id, name: sym ? sym.name : (s.name || s.id), intensity: s.intensity, duration: s.duration };
                      }),
                      timestamp: new Date().toISOString()
                    }));
                  }}
                  className={`relative overflow-hidden w-full mt-6 py-4 rounded-2xl font-headline font-black text-lg transition-all flex items-center justify-center gap-2 group/btn
                    ${selected.length === 0 
                      ? 'bg-surface-container-high text-outline pointer-events-none' 
                      : 'bg-primary text-white shadow-[0_10px_30px_rgba(0,100,255,0.3)] hover:shadow-[0_15px_40px_rgba(0,100,255,0.4)] hover:-translate-y-1 active:scale-95'}`}
                >
                  <span className="relative z-10 transition-transform group-hover/btn:-translate-x-1">Eksekusi Analisis</span>
                  <span className="material-symbols-outlined relative z-10 transition-transform group-hover/btn:translate-x-1">rocket_launch</span>
                  {selected.length > 0 && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>}
                </Link>
              </div>

              {/* Emergency Card */}
              <div className="bg-error-container/30 backdrop-blur-sm p-6 rounded-[1.5rem] border border-error/20 hover:bg-error-container/40 hover:border-error/40 transition-colors shadow-sm">
                <div className="flex items-center gap-3 text-error mb-3">
                  <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center animate-pulse">
                     <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  </div>
                  <span className="font-black text-sm uppercase tracking-widest">Respons Darurat?</span>
                </div>
                <p className="text-sm font-medium text-on-error-container mb-5 leading-relaxed">Bila muncul gejala kejang, asfiksia, atau nyeri dada menyengat, abaikan sistem ini dan hubungi ambulans.</p>
                <a className="w-full flex items-center justify-center gap-2 bg-error text-white font-black text-sm py-3 rounded-xl hover:bg-error/90 active:scale-95 shadow-md shadow-error/30 transition-all" href="tel:112">
                  <span className="material-symbols-outlined text-lg">emergency</span> Hubungi 112 Segera
                </a>
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Urgency Detection Overlay */}
        {(selected.some(s => s.id === 'sesak') && selected.some(s => s.id === 'nyeri' || s.id === 'Nyeri Dada Mendadak')) && (
          <div className="fixed inset-0 bg-error/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-white rounded-[3rem] p-10 text-center shadow-2xl animate-in zoom-in duration-500 delay-300">
              <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <span className="material-symbols-outlined text-error text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              </div>
              <h2 className="text-3xl font-black text-on-surface mb-4 font-headline">DETEKSI BAHAYA!</h2>
              <p className="text-on-surface-variant font-medium mb-10 leading-relaxed">
                Kombinasi <strong>Sesak Napas</strong> dan <strong>Nyeri Dada</strong> menunjukkan risiko kondisi jantung atau paru yang sangat serius.
              </p>
              <div className="flex flex-col gap-4">
                <a href="tel:112" className="w-full py-5 bg-error text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-error/30 hover:scale-[1.02] active:scale-95 transition-all">
                  <span className="material-symbols-outlined">emergency</span> HUBUNGI 112
                </a>
                <button 
                  onClick={() => remove('sesak')}
                  className="w-full py-4 text-outline font-bold hover:text-on-surface transition-colors"
                >
                  Lambaikan & Tutup Peringatan
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <MedicalDisclaimer />
      </div>
      <Footer />
    </>
  );
}
