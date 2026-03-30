'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface DiagnosisHistory {
  id: string;
  date: string;
  symptoms: string[];
  diagnosis: string;
  probability: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<DiagnosisHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedHistory = localStorage.getItem('diagnosis_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory).reverse());
    }
    setLoading(false);
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 min-h-screen px-4 md:px-8 relative bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-on-surface">
              Riwayat Diagnosis
            </h1>
            <p className="text-on-surface-variant font-medium text-lg max-w-xl">
              Lihat kembali hasil analisis kesehatan Anda sebelumnya untuk memantau perkembangan kondisi Anda.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : history.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <div key={item.id} className="bg-surface p-6 rounded-3xl border border-outline-variant/20 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-xs font-bold text-outline uppercase tracking-widest">
                      {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">
                      {item.probability}% MATCH
                    </div>
                  </div>
                  <h3 className="font-headline font-bold text-xl mb-2 text-on-surface group-hover:text-primary transition-colors">
                    {item.diagnosis}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {item.symptoms.map((s, idx) => (
                      <span key={idx} className="px-2 py-1 bg-surface-container-high text-[10px] font-bold text-on-surface-variant rounded-lg uppercase tracking-tighter">
                        {s}
                      </span>
                    ))}
                  </div>
                  <Link 
                    href={`/diagnosis/result?id=${item.id}`}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-surface-container-low text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all"
                  >
                    Lihat Detail <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-surface/50 rounded-[3rem] border-2 border-dashed border-outline-variant/30">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">history_toggle_off</span>
              <h3 className="text-2xl font-bold text-on-surface mb-2">Belum ada riwayat</h3>
              <p className="text-on-surface-variant mb-8 max-w-sm mx-auto">Anda belum melakukan diagnosis apapun. Mulai sekarang untuk melihat riwayat kesehatan Anda di sini.</p>
              <Link href="/diagnosis" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:-translate-y-1 active:scale-95 transition-all">
                Mulai Diagnosis Sekarang <span className="material-symbols-outlined">rocket_launch</span>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
