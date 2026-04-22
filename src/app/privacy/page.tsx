"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 px-6 min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <h1 className="text-3xl md:text-4xl font-black font-headline text-slate-800 mb-2">Kebijakan Privasi</h1>
          <p className="text-slate-500 font-medium mb-8">Aplikasi Web Diagnosis — Terakhir diperbarui: 20 April 2026</p>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">
            <section>
              <p>Selamat datang di Web Diagnosis. Kami sangat menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan menjaga informasi Anda saat Anda menggunakan aplikasi kami.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black">1</span>
                Informasi yang Kami Kumpulkan
              </h2>
              <p>Aplikasi Web Diagnosis dirancang untuk melakukan analisis data. Dalam pengoperasiannya, kami mungkin mengumpulkan informasi berikut:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Data Input Pengguna:</strong> Informasi yang Anda masukkan secara manual ke dalam formulir diagnosis untuk diproses oleh sistem.</li>
                <li><strong>Data Teknis (Log):</strong> Informasi standar seperti alamat IP, jenis perangkat, dan tipe peramban yang digunakan untuk mengakses layanan kami.</li>
                <li><strong>Cookies:</strong> Kami mungkin menggunakan cookies dasar untuk menyimpan preferensi sesi Anda guna meningkatkan pengalaman navigasi.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black">2</span>
                Penggunaan Informasi
              </h2>
              <p>Informasi yang terkumpul digunakan semata-mata untuk:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Menjalankan fungsi utama aplikasi yaitu memberikan hasil diagnosis/analisis.</li>
                <li>Memantau performa aplikasi dan memperbaiki bug atau kendala teknis.</li>
                <li>Meningkatkan antarmuka dan pengalaman pengguna (UI/UX).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black">3</span>
                Keamanan Data
              </h2>
              <p>Kami mengambil langkah-langkah keamanan yang sesuai untuk melindungi data Anda dari akses yang tidak sah. Namun, harap dipahami bahwa transmisi data melalui internet tidak pernah sepenuhnya aman. Kami menyarankan Anda untuk tidak memasukkan informasi yang sangat sensitif atau rahasia ke dalam alat diagnosis publik.</p>
              <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-800 text-sm italic">
                Peringatan: Web Diagnosis adalah alat bantu analisis. Hasil yang ditampilkan oleh aplikasi ini tidak boleh digunakan sebagai satu-satunya dasar pengambilan keputusan profesional (medis, teknis, atau hukum). Gunakan dengan bijak.
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black">4</span>
                Penyimpanan Data
              </h2>
              <p>Kami hanya menyimpan data selama diperlukan untuk menyediakan layanan kepada Anda atau selama diwajibkan oleh hukum. Data sementara yang digunakan untuk proses diagnosa biasanya akan dihapus setelah sesi berakhir atau dalam jangka waktu tertentu sesuai kebijakan server.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black">5</span>
                Hak Pengguna
              </h2>
              <p>Anda memiliki hak untuk berhenti menggunakan layanan kami kapan saja. Karena aplikasi ini mungkin tidak mewajibkan pendaftaran akun, data Anda bersifat anonim kecuali Anda memberikan informasi identitas secara sadar dalam input diagnosa.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black">6</span>
                Perubahan Kebijakan
              </h2>
              <p>Kami dapat memperbarui kebijakan ini secara berkala. Perubahan akan diinformasikan melalui pembaruan tanggal "Terakhir diperbarui" di bagian atas dokumen ini.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
