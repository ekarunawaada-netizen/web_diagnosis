# 📂 Dokumen Arsitektur & Struktur Proyek: Petit Klinik

> **Dokumen PRD (Product Requirements Document) Tambahan**
> Digunakan untuk keperluan pemaparan teknis (Presentasi) terkait pengorganisasian kode (Codebase Organization) pada proyek Next.js Petit Klinik.

Struktur repositori ini dirancang menggunakan standar *feature-driven architecture* yang disarankan oleh sistem modern **Next.js (App Router)**. Tujuannya adalah untuk memastikan skalabilitas kode, keamanan (*separation of concerns*), serta mempermudah kolaborasi antar tim *Frontend* dan *Backend*.

Berikut adalah penjelasan teknis untuk setiap direktori utama yang dapat Anda paparkan dalam presentasi:

---

## 1. Direktori Utama / Root (`/`)
Direktori yang mengelola konfigurasi "mesin" platform secara keseluruhan.

*   **`public/`**
    Digunakan untuk menyimpan aset-aset statis yang dapat diakses secara publik oleh *browser* tanpa harus melewati kompilasi Webpack. *(Contoh: logo.png, grafik SVG, file favicon).*
*   **`backend/`**
    *(Deprecated/Dev Use)* — Menyimpan sistem asli Express/Node.js lokal (*legacy*). Perannya kini dialihkan karena *frontend* web secara cerdas melakukan *Proxying* (Pintas) yang menembak langsung secara aman ke *database online/production* (`db.hztapp.com/spakar`).
*   **`scripts/`**
    Kumpulan *script* automasi (*tools* CLI kecil). Biasanya digunakan untuk pengujian koneksi cepat (*endpoint tracker*) atau automasi tanpa perlu menyalakan mesin UI halaman web.
*   **`next.config.ts` & `tailwind.config.ts`**
    Otak konfigurasi aplikasi:
    *   `next.config.ts` mengatur pengaturan *Next.js Server*, optimasi gambar otomatis, dan **Proxy (Rewrites)** yang mengalihkan jalur `/api` agar menipu pembatasan *CORS error* yang sering terjadi di API.
    *   `tailwind.config.ts` menampung semua standarisasi aturan UI dan Tema Design (Warna *brand*, margin pakem) khusus identitas Petit Klinik.

---

## 2. Jantung Aplikasi (`/src`)
Folder ini merupakan pusat tempat berputarnya seluruh logika bisnis antarmuka (*frontend system*).

### 🛣️ `src/app/` (Router & Halaman Layar)
Folder ini secara langsung mewakili *path* URL (rute) halaman yang dilihat oleh pengguna di perambannya.
*   **`app/(Beranda) (page.tsx)`**: Tampilan awal (*Landing Page*) Petit Klinik yang responsif dan dirancang untuk menangani *fetching* data Testimoni dinamis dari Backend API secara *real-time*.
*   **`app/diagnosis/`**: Rute utama untuk proses wawancara sistem pakar. Mengambil rentetan data gejala (*symptoms*) secara cerdas dengan memanggil *database* dan otomatis menyortir gejala teratas berdasarkan bobot nilai probabilitas kepastian (*Certainty Factor*).
*   **`app/chat/`**: Sistem antarmuka *chat* khusus (layar penuh) untuk **Vitara** (Asisten AI terintegrasi Gemini tingkat lanjut).
*   **`app/clinic/`**: Layar Rute untuk integrasi fitur pencarian fasilitas kesehatan atau Klinik.
*   **`app/login/` & `app/register/`**: Rute gerbang otentikasi pengamanan pasien beserta validasi sandinya.
*   **`app/settings/`**: Laman pusat pengaturan profil, pengolahan identitas (KTP/Nama), dan preferensi akun pesien.

### 🧱 `src/components/` (Elemen Visual Reusable)
Folder berisi komponen "balok lego" UI UI/UX. Daripada menulis kode menu berulang kali, komponen ditulis satu kali di sini dan dirakit di halaman *app* mana pun sesuai kebutuhan.
*   *Contoh Komponen Penggerak Utama:* `Navbar.tsx`, `Footer.tsx`, `Chatbot.tsx` (Animasi tombol AI *Floating*), `MedicalDisclaimer.tsx` (Pop-Up Penafian medis standar hukum).

### 🌐 `src/context/` (Manajemen Kondisi Global)
Tempat kendali pusat untuk memori layar yang sifatnya krusial dan dipakai di semua *page* (*Global State/Middleware*).
*   **`AuthContext.tsx`**: Sabuk pengaman yang menjaga rute halaman. Kode ini mengecek dan memverifikasi interspetor "Bearer Token" pengenal sesi. Jika token sesi pasien dicuri/kedaluwarsa, layar akan memblokir dan menendang pengguna ke layar *login*.

### 🔗 `src/lib/` (Manajemen Modul Inti Pihak Ketiga)
Pembungkus pustaka HTTP (Library Eksternal) agar API (*Application Programming Interface*) tidak mudah tertabrak interupsi koneksi.
*   **`axios.ts`**: Skrip standarisasi untuk menembak ke API backend. *Interceptors* yang dibuat di sini bertugas menempelkan Token Akses otomatis secara siluman (*under the hood*) tanpa intervensi pengguna pada setiap klik/pengiriman form mereka.

### 🛠️ `src/utils/` (Logic Helpers & AI Prompts)
Fungsi-fungsi matematika, peredam *error handler*, atau sistem pengatur logika statis di belakang layer.
*   **`ai.ts` & `ai-constants.ts`**: Ini adalah DNA otak instruksi untuk agen kecerdasan buatan (*System Persona Prompt*). Berisi parameter rahasia yang mengikat (memenjarakan) logika dan etika tata krama AI Gemini sehingga Vitara merespons secakap konsultan klinis ramah, tegas, serta menghindari analisis medis liar (halusinasi AI).

### 🎨 `src/app/globals.css` (Mesin Penata Gaya Inti)
Walaupun sebagian besar desain proyek diatur lewat kode sisipan `Tailwind CSS`, file `globals.css` ini memiliki 3 fungsi krusial yang mengatur nyawa visual animasi secara global:
1.  **Impor Inti Tailwind (`@tailwind`)**: Tiga baris teratas file ini adalah pemicu utama yang membangkitkan mesin *compiler* Tailwind CSS ke seluruh proyek.
2.  **Performa & Aksesibilitas (`scroll-behavior`, `prefers-reduced-motion`)**: Mengakali standar *browser* untuk membuat guliran halaman web (scroll) mulus layaknya air. File ini juga mendeteksi perangkat pengguna yang memiliki sensitivitas mata, dan secara otomatis mematikan animasi berat (`reduce-motion`).
3.  **Animasi Khusus & Hak Cipta Desain Web Murni**: Kelas-kelas yang terlalu rumit bagi Tailwind (*seperti bayangan kaca blur/Glassmorphism* dan animasi melayang tingkat lanjut *"Keyframes Float/Marquee"*) diketik manual di sini agar desain Petit Klinik benar-benar unik dan tidak serpas-pas sama dengan web *template* standar.

---

> 💡 **Poin Argumen Kuat Utama Untuk Anda di Presentasi Nanti:**
> *"Struktur platform web Petit Klinik kami secara ketat telah mengadopsi prinsip Modularitas standar industri terkemuka. Alih-alih mencampur aduk UI dan Logika, kami **memisahkan dengan jelas App Router** (untuk rendering antarmuka cepat) **dengan lapis Security Boundary Context dan Lib** (untuk otentikasi keamanan dan sambungan pertukaran data).*
> 
> *Dampaknya? Ketika di masa depan tim kami membutuhkan pembaruan rumus sistem pakar AI atau pemugaran koneksi database, para spesialis IT dapat berfokus mengubah rute di folder fungsionalitas murninya secara terisolasi tanpa risiko menyebabkan seluruh sistem interaktif Frontend web ini *down* ataupun malfungsi desain."*
