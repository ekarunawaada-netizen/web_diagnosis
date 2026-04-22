"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HelpPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 px-6 min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <h1 className="text-3xl md:text-4xl font-black font-headline text-slate-800 mb-2">Pusat Bantuan</h1>
          <p className="text-slate-500 font-medium mb-8">Selamat datang di halaman bantuan. Di sini kami merangkum beberapa hal yang paling sering ditanyakan oleh pengguna kami.</p>

          <div className="prose prose-slate max-w-none space-y-10 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                Apa itu Web Diagnosis?
              </h2>
              <p>Web Diagnosis adalah aplikasi berbasis web yang dirancang untuk membantu Anda melakukan analisis awal atau diagnosa mandiri berdasarkan data atau gejala yang Anda masukkan ke dalam sistem.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                Bagaimana cara menggunakan aplikasi ini?
              </h2>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">1</div>
                  <p><strong>Pilih Kategori:</strong> Pilih jenis diagnosa yang tersedia di halaman utama.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">2</div>
                  <p><strong>Isi Formulir:</strong> Masukkan data atau centang gejala yang Anda alami secara akurat.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">3</div>
                  <p><strong>Klik Diagnosis:</strong> Tekan tombol "Analisis" atau "Diagnosis Sekarang".</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">4</div>
                  <p><strong>Lihat Hasil:</strong> Sistem akan memproses input Anda dan menampilkan hasil analisis dalam beberapa detik.</p>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                Apakah hasil diagnosa ini akurat?
              </h2>
              <p>Aplikasi ini menggunakan algoritma berbasis data untuk memberikan kemungkinan diagnosa. Namun, hasil ini bersifat informatif dan tidak menggantikan konsultasi profesional. Jika Anda merasa ragu atau kondisi memburuk, segera hubungi ahlinya.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                Apakah data saya aman?
              </h2>
              <p>Kami sangat menjaga privasi Anda. Data yang Anda masukkan diproses secara anonim dan kami tidak menyimpan informasi pribadi tanpa seizin Anda. Untuk detail lengkap, silakan baca halaman Kebijakan Privasi kami.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                Website tidak berjalan atau error, apa yang harus saya lakukan?
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pastikan koneksi internet Anda stabil.</li>
                <li>Coba bersihkan cache browser Anda atau gunakan mode incognito/private window.</li>
                <li>Pastikan Anda mengisi semua kolom yang wajib diisi dalam formulir.</li>
              </ul>
            </section>

            <section className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Laporan Masalah & Saran (Bug)
              </h2>
              <p className="mb-6">Kami sangat menghargai masukan Anda untuk pengembangan aplikasi ini. Anda dapat menghubungi tim pengembang melalui Direct Message Instagram di:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['@KaaAtCloud', '@Mkzaata', '@raysikma1', '@pyoo_cocoteh', '@dya_jull', '@nilamprnta_', '@yuuex_23'].map(handle => (
                  <div key={handle} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all cursor-default">
                    {handle}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
