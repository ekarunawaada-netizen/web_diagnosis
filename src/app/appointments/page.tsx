"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

// Initial Data
const initialUpcomingAppointments = [
  {
    id: 1,
    doctor: 'Dr. Adrian Wijaya, Sp.PD',
    location: 'Rumah Sakit Pusat Medika, Jakarta',
    specialty: 'Penyakit Dalam',
    room: 'Ruang 402',
    date: 'Senin, 07 Okt',
    time: '09:00 - 09:30 WIB',
    borderColor: 'border-primary',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_zFNvanfd4HLsZsFYAK27JWKSqpE4N90MD0pJXcHlGUmoMri-BzZOFK10uGi1mN20Avd9zaUJ3K1O0ApvvqzwQ3es3bBGt9MNL1GpqnIpFN9sqKBZiHDmEjLjwOrkRjd8Z9rcytE6O_-WTffzQmHvAscD7IRHW6gC6ORAle1TRkXea6z5T1wjUbHPoZRw2tJMcJU6HjHQsDDXBGxhAkLAXM3E4cfxMhQoeCpwWwDbD81a07oxOQM5r-84lIPSQ-DuHadUHTSuNKGI',
    pending: false,
    action: 'Lihat Detail',
  },
  {
    id: 2,
    doctor: 'Dr. Sarah Lestari, Sp.A',
    location: 'Klinik Sehat Utama, Tangerang',
    specialty: 'Pediatri (Anak)',
    room: null,
    date: 'Rabu, 09 Okt',
    time: '14:15 - 14:45 WIB',
    borderColor: 'border-tertiary-container',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-P3JG_ctu4bpqGEE8-2Lq8HAnIwe6gJO1DtqUQ6greK46NLKQxAu9xz4qiyRkS1zkSHkRuPpgRlSt2KRa8z437jw8P8QCxvDxKsuDSr-QNdnFDaP0nS4bNPjg_Mn7nC75nNrKsE_3Gfmmk5fI0g6TBAedwMe5EN7shpwNHu1_PUR-PkGMNW83b6uXvhhyZe449B8fXBBA7FU07fzQf9YiHLuZx-_tPSpWOO9sz3852GGv0MnvRtnA1z44YWuvax9YRPtqn_hXJWp-',
    pending: true,
    action: 'Reschedule',
  },
];

const pastAppointments = [
  { id: 1, name: 'Dr. Budi Santoso', desc: 'Check-up Tahunan • 20 Sep 2024', icon: 'person', status: 'HASIL TERSEDIA' },
  { id: 2, name: 'Poli Gigi & Mulut', desc: 'Pembersihan Karang • 05 Sep 2024', icon: 'medical_information', status: 'SELESAI' },
];

const doctorsList = [
  { name: 'Dr. Adrian Wijaya, Sp.PD', specialty: 'Penyakit Dalam', location: 'RS Pusat Medika, Jakarta', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_zFNvanfd4HLsZsFYAK27JWKSqpE4N90MD0pJXcHlGUmoMri-BzZOFK10uGi1mN20Avd9zaUJ3K1O0ApvvqzwQ3es3bBGt9MNL1GpqnIpFN9sqKBZiHDmEjLjwOrkRjd8Z9rcytE6O_-WTffzQmHvAscD7IRHW6gC6ORAle1TRkXea6z5T1wjUbHPoZRw2tJMcJU6HjHQsDDXBGxhAkLAXM3E4cfxMhQoeCpwWwDbD81a07oxOQM5r-84lIPSQ-DuHadUHTSuNKGI' },
  { name: 'Dr. Sarah Lestari, Sp.A', specialty: 'Pediatri (Anak)', location: 'Klinik Sehat Utama, Tangerang', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-P3JG_ctu4bpqGEE8-2Lq8HAnIwe6gJO1DtqUQ6greK46NLKQxAu9xz4qiyRkS1zkSHkRuPpgRlSt2KRa8z437jw8P8QCxvDxKsuDSr-QNdnFDaP0nS4bNPjg_Mn7nC75nNrKsE_3Gfmmk5fI0g6TBAedwMe5EN7shpwNHu1_PUR-PkGMNW83b6uXvhhyZe449B8fXBBA7FU07fzQf9YiHLuZx-_tPSpWOO9sz3852GGv0MnvRtnA1z44YWuvax9YRPtqn_hXJWp-' },
  { name: 'Dr. Hendi Prabowo, Sp.OT', specialty: 'Ortopedi (Tulang)', location: 'RS Kasih Kasih, Depok', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_zFNvanfd4HLsZsFYAK27JWKSqpE4N90MD0pJXcHlGUmoMri-BzZOFK10uGi1mN20Avd9zaUJ3K1O0ApvvqzwQ3es3bBGt9MNL1GpqnIpFN9sqKBZiHDmEjLjwOrkRjd8Z9rcytE6O_-WTffzQmHvAscD7IRHW6gC6ORAle1TRkXea6z5T1wjUbHPoZRw2tJMcJU6HjHQsDDXBGxhAkLAXM3E4cfxMhQoeCpwWwDbD81a07oxOQM5r-84lIPSQ-DuHadUHTSuNKGI' },
];

const calendarDays = [
  { day: 28, prev: true }, { day: 29, prev: true }, { day: 30, prev: true },
  { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 },
  { day: 5 }, { day: 6 }, { day: 7, today: true }, { day: 8 }, { day: 9 }, { day: 10 }, { day: 11 },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(initialUpcomingAppointments);
  const [selectedDay, setSelectedDay] = useState(7);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // States Modal
  const [formData, setFormData] = useState({
    doctorIndex: 0,
    date: '',
    time: ''
  });

  const handleDayClick = (day: number | undefined, prev: boolean | undefined) => {
    if (day && !prev) {
      setSelectedDay(day);
    }
  };

  const handleActionClick = (apt: any) => {
    if (apt.action === 'Reschedule') {
      alert(`Meminta penjadwalan ulang untuk konsultasi bersama ${apt.doctor}`);
    } else {
      alert(`Membuka panel detail konsultasi ${apt.doctor}`);
    }
  };

  const handleDownload = (name: string) => {
    alert(`Mengunduh laporan elektronik untuk: ${name}.pdf ...`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.time) {
      alert('Tolong pastikan Anda mendata jadwal tanggal beserta waktu temu!');
      return;
    }

    const doc = doctorsList[formData.doctorIndex];
    const dateObj = new Date(formData.date);
    
    // Fallback format (e.g. "Kamis, 15 Nov" using simple static mapping to avoid hydration date issues)
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    
    const dayName = days[dateObj.getDay()];
    const dd = dateObj.getDate();
    const mm = months[dateObj.getMonth()];
    const finalDateStr = `${dayName}, ${(dd < 10 ? '0' : '') + dd} ${mm}`;

    const newlyCreated = {
      id: Date.now(),
      doctor: doc.name,
      location: doc.location,
      specialty: doc.specialty,
      room: null, // belum tersedia ruang
      date: finalDateStr,
      time: `${formData.time} WIB`,
      borderColor: 'border-secondary',
      image: doc.img,
      pending: true,
      action: 'Batalkan',
    };

    setAppointments([newlyCreated, ...appointments]);
    setIsModalOpen(false);
    setFormData({ doctorIndex: 0, date: '', time: '' });
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto min-h-screen relative overflow-hidden">
        {/* Background Ambient Ornaments */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[5%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary-container/10 blur-[80px]"></div>
          <div className="absolute bottom-[20%] right-[-5%] w-[450px] h-[450px] rounded-full bg-primary/5 blur-[80px]"></div>
        </div>

        {/* Header */}
        <header className="mb-12 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-3 font-headline pb-1">
                Janji Temu Saya
              </h1>
              <p className="text-on-surface-variant text-lg max-w-2xl font-medium">Kelola seluruh jadwal rawat jalan dan bedah dalam satu kalender pintar interaktif.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(0,100,255,0.25)] hover:shadow-[0_15px_40px_rgba(0,100,255,0.4)] hover:-translate-y-1 transition-all flex items-center gap-3 active:scale-95 group border border-primary/20"
            >
              <span className="material-symbols-outlined transition-transform duration-500 group-hover:rotate-90">add_circle</span>
              Buat Janji Baru
            </button>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="flex flex-col lg:flex-row gap-8 relative z-10">
          {/* Main Content Area */}
          <div className="flex-grow order-2 lg:order-1 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
            <div className="bg-surface/80 backdrop-blur-xl p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white/60 relative overflow-hidden group">
              {/* Deco absolute gradient for depth */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="font-black text-xl text-on-surface font-headline">Oktober 2024</h3>
                <div className="flex gap-2">
                  <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors bg-surface-container/50 p-1.5 rounded-lg active:scale-95">chevron_left</span>
                  <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors bg-surface-container/50 p-1.5 rounded-lg active:scale-95">chevron_right</span>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-y-5 text-center text-sm mb-4 relative z-10">
                {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((d, i) => (
                  <span key={i} className="text-outline font-bold">{d}</span>
                ))}
                {calendarDays.map((d, i) => (
                  <span
                    key={i}
                    onClick={() => handleDayClick(d.day, d.prev)}
                    className={`py-2 rounded-full transition-all duration-300 flex items-center justify-center font-medium ${
                      d.prev 
                        ? 'text-outline-variant cursor-not-allowed' 
                        : selectedDay === d.day
                          ? 'bg-primary text-white font-black shadow-lg shadow-primary/30 cursor-pointer scale-110'
                          : 'hover:bg-primary/10 hover:text-primary hover:font-bold cursor-pointer text-on-surface'
                    }`}
                  >
                    {d.day}
                  </span>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-outline-variant/20 flex flex-wrap gap-4 items-center justify-between relative z-10">
                <div className="flex items-center gap-2 bg-primary-container/30 px-3 py-1.5 rounded-lg">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
                  <span className="font-black text-xs text-primary uppercase tracking-widest">Okt {selectedDay}</span>
                </div>
                <button
                  onClick={() => setSelectedDay(7)}
                  className="font-bold text-sm text-outline hover:text-primary transition-colors hover:underline"
                >
                  Kembali ke Hari Ini
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-primary via-[#0055ff] to-[#0033cc] text-on-primary p-8 rounded-[2rem] relative overflow-hidden shadow-2xl shadow-primary/30 group">
              <div className="absolute inset-0 bg-white/5 group-hover:bg-transparent transition-colors duration-500"></div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <span className="text-xs text-white/80 font-black uppercase tracking-widest flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div> KONSULTASI AKTIF
                </span>
                <div className="text-6xl font-black mt-3 font-headline leading-none">{10 + appointments.length}</div>
                <p className="text-sm mt-5 text-white/80 font-medium leading-relaxed">Total rekam konsultasi yang tercatat utuh pada ekosistem MediScan.</p>
              </div>
              <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-9xl text-white/5 transform group-hover:-rotate-12 transition-transform duration-700">medical_services</span>
            </div>
          </div>

          {/* Right: Appointments */}
          <div className="lg:col-span-8 flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
            {/* Upcoming */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black flex items-center gap-3 font-headline text-on-surface">
                  <div className="w-10 h-10 rounded-xl bg-tertiary-container text-tertiary flex items-center justify-center">
                    <span className="material-symbols-outlined">event_upcoming</span>
                  </div>
                  Agenda Mendatang
                </h2>
                <span className="px-3 py-1.5 bg-secondary-container/50 text-secondary rounded-lg text-xs font-black uppercase tracking-wider">{appointments.length} TOTAL</span>
              </div>
              
              <div className="space-y-5">
                {appointments.map((apt) => (
                  <div key={apt.id} className={`bg-surface/80 backdrop-blur-xl p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-white/60 group hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
                    <div className={`absolute top-0 bottom-0 left-0 w-2.5 ${apt.borderColor} bg-current`}></div>
                    
                    <div className="flex flex-col md:flex-row justify-between gap-6 pl-4">
                      <div className="flex gap-6 items-start">
                        <div className="w-20 h-20 rounded-2xl bg-surface-container-high overflow-hidden flex-shrink-0 border-2 border-white shadow-lg relative group-hover:scale-105 transition-transform duration-500">
                          <Image width={80} height={80} className="w-full h-full object-cover" alt={apt.doctor} src={apt.image} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black font-headline text-xl text-on-surface group-hover:text-primary transition-colors">{apt.doctor}</h4>
                            {apt.pending && <div className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse shadow-sm shadow-tertiary/50" title="Menunggu Konfirmasi"></div>}
                          </div>
                          <p className="text-on-surface-variant font-medium flex items-center gap-2 text-sm bg-surface-container/50 inline-flex px-3 py-1 rounded-lg">
                            <span className="material-symbols-outlined text-sm text-outline">location_on</span>
                            {apt.location}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            <span className="bg-surface border border-outline-variant/20 px-3 py-1 rounded-lg text-xs font-bold text-outline-variant shadow-sm">{apt.specialty}</span>
                            {apt.room ? (
                              <span className="bg-surface border border-outline-variant/20 px-3 py-1 rounded-lg text-xs font-bold text-outline-variant shadow-sm">{apt.room}</span>
                            ) : (
                               <span className="bg-surface border border-outline-variant/20 px-3 py-1 rounded-lg text-xs italic text-outline/70 shadow-sm">Ruang menyusul</span>
                            )}
                            {apt.pending && <span className="bg-tertiary text-white shadow-md shadow-tertiary/20 font-bold px-3 py-1 rounded-lg text-xs animate-in fade-in zoom-in">Menunggu Konfirmasi</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col justify-between items-end gap-3 shrink-0 border-t border-outline-variant/10 pt-5 mt-2 md:border-0 md:pt-0 md:mt-0">
                        <div className="text-right">
                          <div className={`${apt.pending ? 'text-on-surface' : 'text-primary'} font-black text-lg`}>{apt.date}</div>
                          <div className="text-on-surface-variant font-bold text-sm bg-surface-container-lowest px-3 py-1 rounded-lg inline-block mt-1">{apt.time}</div>
                        </div>
                        <button 
                          onClick={() => handleActionClick(apt)}
                          className={`font-black text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 border ${
                             apt.pending 
                             ? 'text-error bg-error/5 hover:bg-error hover:text-white border-error/20 hover:border-error' 
                             : 'text-primary bg-primary/5 hover:bg-primary hover:text-white border-primary/20 hover:border-primary'
                          }`}
                        >
                          {apt.action}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {appointments.length === 0 && (
                   <div className="text-center py-10 md:py-16 border-2 border-dashed border-outline-variant/30 rounded-[1.5rem] md:rounded-[2rem] bg-surface/50 backdrop-blur-sm relative group overflow-hidden">
                       <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                       <span className="material-symbols-outlined text-6xl text-outline mb-4 group-hover:scale-110 group-hover:text-primary/50 transition-all duration-500">calendar_month</span>
                       <p className="text-on-surface-variant font-bold text-lg">Anda tidak memiliki tabrakan jadwal.</p>
                       <p className="text-outline text-sm mt-1 mb-6">Mulai bernapas lega, atau tekan tombol di atas untuk reservasi medis baru.</p>
                   </div>
                )}
              </div>
            </section>

            {/* History */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black flex items-center gap-3 font-headline text-on-surface">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high text-outline flex items-center justify-center">
                    <span className="material-symbols-outlined">history</span>
                  </div>
                  Arsip Historis
                </h2>
              </div>
              <div className="bg-surface/60 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/60 shadow-lg shadow-slate-200/50">
                <div className="p-4 sm:p-6 space-y-2">
                  {pastAppointments.map((p) => (
                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl hover:bg-surface transition-colors duration-300 group gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm border border-primary/10">
                          <span className="material-symbols-outlined">{p.icon}</span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface font-headline">{p.name}</p>
                          <p className="text-xs text-on-surface-variant font-medium mt-0.5 max-w-[200px] truncate sm:max-w-none">{p.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-0 border-outline-variant/10 pt-3 sm:pt-0">
                        <span className="text-xs font-black text-secondary bg-secondary-container/30 px-3 py-1.5 rounded-lg border border-secondary/20 tracking-wider shadow-sm">{p.status}</span>
                        <button 
                          onClick={() => handleDownload(p.name)}
                          className="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-outline-variant/20 text-outline hover:text-primary hover:border-primary/50 hover:shadow-md transition-all active:scale-90"
                          title="Unduh Referensi PDF"
                        >
                          <span className="material-symbols-outlined text-xl">download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-5 bg-surface-container-lowest hover:bg-primary/5 hover:text-primary text-outline font-black text-sm uppercase tracking-widest transition-colors border-t border-outline-variant/20">
                  Perluas Indeks Riwayat
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* MODAL POPUP BUAT JANJI BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pt-10">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white p-8 rounded-3xl shadow-2xl z-10 w-full max-w-lg mx-4 flex flex-col border border-outline-variant/20 animate-in fade-in zoom-in-95 duration-200">
             <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-on-surface font-headline">Janji Temu Baru</h2>
                  <p className="text-sm text-on-surface-variant mt-1">Isi rincian untuk menjadwalkan konsultasi dokter.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-surface-container-low hover:bg-error-container hover:text-error rounded-full transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
             </div>

             <form onSubmit={handleFormSubmit} className="space-y-5">
                {/* Doctor Selection */}
                <div>
                   <label className="block text-sm font-bold text-on-surface mb-2">Dokter Spesialis</label>
                   <select 
                      value={formData.doctorIndex}
                      onChange={(e) => setFormData({...formData, doctorIndex: Number(e.target.value)})}
                      className="w-full bg-surface-container-low border-outline-variant/20 border text-on-surface rounded-xl p-3 focus:ring-primary focus:border-primary"
                   >
                     {doctorsList.map((doc, idx) => (
                       <option key={idx} value={idx}>{doc.name} - {doc.specialty}</option>
                     ))}
                   </select>
                </div>
                
                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="block text-sm font-bold text-on-surface mb-2">Pilih Tanggal</label>
                       <input 
                         type="date" 
                         required
                         value={formData.date}
                         onChange={(e) => setFormData({...formData, date: e.target.value})}
                         className="w-full bg-surface-container-low border-outline-variant/20 border text-on-surface rounded-xl p-3 focus:ring-primary focus:border-primary"
                       />
                   </div>
                   <div>
                       <label className="block text-sm font-bold text-on-surface mb-2">Pilih Waktu</label>
                       <input 
                         type="time" 
                         required
                         value={formData.time}
                         onChange={(e) => setFormData({...formData, time: e.target.value})}
                         className="w-full bg-surface-container-low border-outline-variant/20 border text-on-surface rounded-xl p-3 focus:ring-primary focus:border-primary"
                       />
                   </div>
                </div>

                {/* Info Box */}
                <div className="bg-secondary-container/20 border border-secondary/20 p-4 rounded-xl mt-4 flex gap-3 items-start">
                   <span className="material-symbols-outlined text-secondary">info</span>
                   <p className="text-xs text-on-secondary-container mt-0.5 leading-relaxed">
                     Layanan akan diselenggarakan secara luring sesuai alamat fasilitas dokter yang dikurasi oleh MediScan. Kehadiran wajib dikonfirmasi 15 menit sebelumnya.
                   </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-8 border-t border-outline-variant/20 pt-6">
                   <button 
                     type="button" 
                     onClick={() => setIsModalOpen(false)}
                     className="px-6 py-3 font-bold text-outline rounded-xl hover:bg-surface-container-highest transition-colors"
                   >
                     Batal
                   </button>
                   <button 
                     type="submit"
                     className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all flex gap-2 items-center"
                   >
                     <span className="material-symbols-outlined text-sm">save</span> Simpan Jadwal
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
