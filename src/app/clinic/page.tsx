"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ClinicMap = dynamic(() => import('@/components/ClinicMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 font-headline">Memuat Radar Klinik...</div>
});

const clinics = [
  {
    id: '1',
    name: 'Klinik Medika Pratama',
    address: 'Jl. Jend. Sudirman No. 45, Jakarta Pusat',
    rating: 4.8,
    distance: '1.2 km',
    lat: -6.2146,
    lng: 106.8166,
    tags: ['Umum', 'Laboratorium', 'Vaksinasi'],
    badge: 'REKOMENDASI',
    badgeStyle: 'bg-secondary-container text-on-secondary-container',
  },
  {
    id: '2',
    name: 'Pusat Kesehatan Sejahtera',
    address: 'Jl. MH Thamrin No. 12, Jakarta Pusat',
    rating: 4.5,
    distance: '2.4 km',
    lat: -6.1866,
    lng: 106.8228,
    tags: ['Gigi', 'Radiologi'],
    badge: 'Buka Sekarang',
    badgeStyle: '',
    isOpen: true,
  },
  {
    id: '3',
    name: 'Klinik RS Kasih Ibu',
    address: 'Mampang Prapatan, Jakarta Selatan',
    rating: 4.9,
    distance: '3.1 km',
    lat: -6.2442,
    lng: 106.8266,
    tags: ['Pediatri', 'Obstetri'],
  },
  {
    id: '4',
    name: 'Puskesmas Kebayoran Baru',
    address: 'Kebayoran Baru, Jakarta Selatan',
    rating: 4.4,
    distance: '4.5 km',
    lat: -6.2367,
    lng: 106.7931,
    tags: ['BPJS', 'Umum'],
    badge: 'Faskes Tingkat 1',
    badgeStyle: 'bg-tertiary-container text-tertiary',
  }
];

export default function ClinicPage() {
  const [selectedClinic, setSelectedClinic] = useState<any>(clinics[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Geolocation States
  const [isTracking, setIsTracking] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  // Filter list based on search
  const filteredClinics = clinics.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      alert("Maaf, API Geolokasi tidak didukung oleh browser ini.");
      return;
    }

    setIsTracking(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsTracking(false);
        const { latitude, longitude } = position.coords;
        const newUserLoc = { lat: latitude, lng: longitude };
        setUserLocation(newUserLoc);

        // Ubah mode peta menjadi "Eksplorasi Bebas" berdasar titik GPS aktual
        setSelectedClinic({
          id: 'geo_live',
          name: 'Pusat GPS Anda',
          address: `Koordinat [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`,
          lat: latitude,
          lng: longitude,
          rating: 'N/A',
          distance: '0 km',
          tags: ['Live Tracking', 'Radius Terdekat'],
          isGeoTarget: true
        });
      },
      (error) => {
        setIsTracking(false);
        alert("Akses lokasi ditolak atau gagal dilacak oleh satelit. Pastikan Anda menekan tombol 'Allow/Izinkan'.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <>
      <Navbar />
      <main className="pt-[72px] h-screen flex flex-col md:flex-row overflow-hidden bg-surface-container-lowest">
        {/* Sidebar: Clinic List */}
        <aside className="w-full md:w-[420px] lg:w-[480px] h-full overflow-y-auto bg-surface flex flex-col z-20 shadow-xl shadow-black/5">
          {/* Search & Filter */}
          <div className="p-6 space-y-4 bg-surface-container-lowest sticky top-0 z-30 shadow-sm border-b border-outline-variant/10">
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight font-headline">Cari Klinik Terdekat</h1>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">search</span>
              </div>
              <input
                className="w-full pl-12 pr-4 py-3 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline/70 font-medium transition-all outline-none"
                placeholder="Cari lokasi bangunan atau nama medis..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={handleFindNearby}
                disabled={isTracking}
                className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${isTracking
                    ? 'bg-outline-variant text-white cursor-wait'
                    : selectedClinic.id === 'geo_live'
                      ? 'bg-tertiary text-on-tertiary shadow-md ring-2 ring-tertiary/50'
                      : 'bg-primary text-on-primary hover:bg-on-primary-container'
                  }`}
              >
                {isTracking ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]" style={selectedClinic.id === 'geo_live' ? { fontVariationSettings: "'FILL' 1" } : undefined}>near_me</span>
                )}
                {isTracking ? 'Melacak...' : selectedClinic.id === 'geo_live' ? 'Mode Area Saya' : 'Klinik Terdekat'}
              </button>

              {['24 Jam', 'BPJS Kesehatan', 'Spesialis Anak'].map((f) => (
                <button key={f} className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface-variant text-sm font-medium whitespace-nowrap hover:bg-surface-dim transition-colors">
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Clinic Cards */}
          <div className="flex-1 p-6 space-y-4">

            {/* Info Box Khusus bila Mode Pelacakan Area Sedang Menyala */}
            {selectedClinic.id === 'geo_live' && (
              <div className="bg-tertiary/10 border-l-4 border-tertiary p-4 rounded-xl mb-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-tertiary mt-0.5">radar</span>
                  <div>
                    <h4 className="font-bold text-on-surface">Radar Fasilitas Aktif</h4>
                    <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">Peta satelit sedang membongkar seluruh fasilitas medis (Klinik & Rumah Sakit) yang secara harfiah merangkul radius {selectedClinic.address}.</p>
                  </div>
                </div>
              </div>
            )}

            {filteredClinics.length === 0 && (
              <div className="text-center py-10 opacity-70">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
                <p className="font-medium">Tidak ada klinik yang memuat data tersebut.</p>
              </div>
            )}

            {filteredClinics.map((clinic) => (
              <div
                key={clinic.id}
                onClick={() => setSelectedClinic(clinic)}
                className={`group bg-surface-container-lowest rounded-xl p-5 cursor-pointer transition-all duration-300 ring-2 ${selectedClinic.id === clinic.id ? 'ring-primary bg-primary/5 shadow-md scale-[1.02] z-10 relative' : 'ring-outline-variant/10 hover:ring-outline-variant/40 hover:bg-surface-container-low'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    {clinic.badge && !clinic.isOpen && (
                      <span className={`inline-block px-2 py-0.5 rounded-full ${clinic.badgeStyle} text-[10px] font-bold tracking-wider mb-2 uppercase`}>{clinic.badge}</span>
                    )}
                    {clinic.isOpen && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
                        <span className="text-[10px] font-bold text-tertiary-container uppercase tracking-wide">{clinic.badge}</span>
                      </div>
                    )}
                    <h3 className={`text-lg font-bold transition-colors ${selectedClinic.id === clinic.id ? 'text-primary' : 'text-on-surface'}`}>{clinic.name}</h3>
                    <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[16px]">location_on</span> {clinic.address}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end text-tertiary font-bold">
                      <span className="material-symbols-outlined text-[18px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> {clinic.rating}
                    </div>
                    <span className="text-xs text-outline font-medium">{clinic.distance}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {clinic.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-surface-container-highest text-[11px] font-medium text-on-surface-variant rounded">{tag}</span>
                  ))}
                </div>
                {selectedClinic.id === clinic.id && (
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-outline-variant/20 animate-in fade-in duration-300 slide-in-from-top-1">
                    <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white border border-outline-variant/30 text-primary font-bold text-sm hover:shadow-sm transition-all">
                      <span className="material-symbols-outlined text-[18px]">directions</span> Rute
                    </button>
                    <Link href="/appointments" className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95">
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span> Booking
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          <footer className="p-6 border-t border-outline-variant/10 bg-surface-container-lowest font-label text-xs text-on-surface-variant text-center">
            © 2024 MediScan Healthcare. All rights reserved.
          </footer>
        </aside>

        {/* Map View - Interactive Leaflet Radar */}
        <section className="flex-1 relative bg-slate-100 hidden md:block z-10">
          <ClinicMap 
            clinics={clinics} 
            userLocation={userLocation} 
            selectedClinic={selectedClinic} 
          />

          {/* Radar Status Indicator */}
          {selectedClinic.isGeoTarget && (
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-blue-100 flex items-center gap-2 z-30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Scanning Area...</span>
            </div>
          )}
        </section>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-md z-50 flex justify-around items-center py-3 border-t border-outline-variant/10">
        <Link href="/" className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">grid_view</span>
          <span className="text-[10px] font-medium">Dashboard</span>
        </Link>
        <Link href="/clinic" className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home_health</span>
          <span className="text-[10px] font-bold">Klinik</span>
        </Link>
        <Link href="/appointments" className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">event_note</span>
          <span className="text-[10px] font-medium">Janji</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      </div>
    </>
  );
}
