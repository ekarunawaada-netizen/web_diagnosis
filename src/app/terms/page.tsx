"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 px-6 min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <h1 className="text-3xl md:text-4xl font-black font-headline text-slate-800 mb-2">Syarat & Ketentuan</h1>
          <p className="text-slate-500 font-medium mb-8">Aplikasi Web Diagnosis — Terakhir Diperbarui: 20 April 2026</p>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">
            <section>
              <p>Selamat datang di Web Diagnosis. Dengan mengakses atau menggunakan aplikasi kami, Anda dianggap telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan ini.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black">1</span>
                Deskripsi Layanan
              </h2>
              <p>Web Diagnosis adalah platform berbasis web yang menyediakan alat bantu analisis atau diagnosis berdasarkan input yang diberikan pengguna. Layanan ini disediakan "apa adanya" (as-is) untuk tujuan informasi dan edukasi.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black">2</span>
                Batasan Tanggung Jawab (Disclaimer)
              </h2>
              <div className="space-y-4">
                <p><strong>Bukan Saran Profesional:</strong> Hasil diagnosa yang dihasilkan oleh aplikasi ini adalah hasil pemrosesan algoritma dan tidak boleh dianggap sebagai saran medis, teknis, atau profesional lainnya yang mutlak.</p>
                <p><strong>Risiko Pengguna:</strong> Penggunaan informasi yang diperoleh dari aplikasi ini sepenuhnya merupakan risiko pengguna. Kami tidak bertanggung jawab atas kerugian atau dampak yang timbul akibat keputusan yang diambil berdasarkan hasil analisis aplikasi ini.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black">3</span>
                Ketentuan Penggunaan
              </h2>
              <p>Pengguna setuju untuk:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Tidak menggunakan aplikasi ini untuk tujuan yang melanggar hukum atau merugikan pihak lain.</li>
                <li>Tidak melakukan tindakan yang dapat merusak, melumpuhkan, atau mengganggu server dan jaringan aplikasi kami.</li>
                <li>Tidak memasukkan data palsu yang bersifat ofensif, mengandung unsur kebencian, atau melanggar hak privasi orang lain.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black">4</span>
                Hak Kekayaan Intelektual
              </h2>
              <p>Seluruh kode sumber, desain, antarmuka, dan konten dalam Web Diagnosis adalah milik pengembang (ekarunawaada-netizen) kecuali dinyatakan lain. Anda dilarang menyalin atau mendistribusikan ulang bagian dari aplikasi ini tanpa izin tertulis atau sesuai dengan lisensi open-source yang berlaku.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black">5</span>
                Privasi Data
              </h2>
              <p>Penggunaan data Anda diatur dalam Kebijakan Privasi kami. Dengan menggunakan layanan ini, Anda juga menyetujui cara kami mengelola informasi tersebut.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black">6</span>
                Perubahan Layanan
              </h2>
              <p>Kami berhak untuk mengubah, menghentikan sementara, atau menutup akses ke aplikasi ini kapan saja tanpa pemberitahuan sebelumnya, termasuk untuk keperluan pemeliharaan atau pembaruan sistem.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
