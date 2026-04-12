"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ClinicMap = dynamic(() => import('@/components/ClinicMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 font-headline">Memuat Radar Klinik...</div>
});

// Haversine formula to calculate real distance between two GPS points
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Determine tags based on OSM amenity type and other tags
function getClinicTags(tags: Record<string, string>): string[] {
  const result: string[] = [];
  const amenity = tags.amenity || '';

  if (amenity === 'hospital') result.push('Rumah Sakit');
  else if (amenity === 'clinic') result.push('Klinik');
  else if (amenity === 'doctors') result.push('Dokter Praktek');
  else if (amenity === 'dentist') result.push('Dokter Gigi');
  else if (amenity === 'pharmacy') result.push('Apotek');
  else result.push('Fasilitas Kesehatan');

  if (tags.emergency === 'yes') result.push('UGD 24 Jam');
  if (tags.healthcare === 'laboratory') result.push('Laboratorium');
  if (tags['healthcare:speciality']) {
    const spec = tags['healthcare:speciality'].split(';')[0];
    result.push(spec.charAt(0).toUpperCase() + spec.slice(1));
  }

  return result.slice(0, 3);
}

// Fetch REAL clinics from OpenStreetMap Overpass API
async function fetchNearbyClinics(lat: number, lng: number, radiusMeters: number = 5000) {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      node["amenity"="doctors"](around:${radiusMeters},${lat},${lng});
      node["amenity"="dentist"](around:${radiusMeters},${lat},${lng});
      way["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      way["amenity"="doctors"](around:${radiusMeters},${lat},${lng});
    );
    out center body;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!response.ok) throw new Error('Overpass API gagal');

  const data = await response.json();

  const clinics = data.elements
    .map((el: any, idx: number) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      if (!elLat || !elLng) return null;

      const name = el.tags?.name || el.tags?.['name:id'] || el.tags?.['name:en'] || 'Fasilitas Kesehatan';
      const street = el.tags?.['addr:street'] || '';
      const houseNumber = el.tags?.['addr:housenumber'] || '';
      const city = el.tags?.['addr:city'] || el.tags?.['addr:subdistrict'] || '';
      const addressParts = [street, houseNumber, city].filter(Boolean);
      const address = addressParts.length > 0 ? addressParts.join(', ') : 'Alamat tidak tersedia di peta';

      const dist = haversineDistance(lat, lng, elLat, elLng);
      const tags = getClinicTags(el.tags || {});
      const amenity = el.tags?.amenity || '';

      let badge = '';
      let badgeStyle = '';
      if (idx === 0) {
        badge = 'TERDEKAT';
        badgeStyle = 'bg-secondary-container text-on-secondary-container';
      } else if (amenity === 'hospital') {
        badge = 'RUMAH SAKIT';
        badgeStyle = 'bg-tertiary-container text-tertiary';
      }

      const isOpen = el.tags?.opening_hours?.includes('24/7') || el.tags?.emergency === 'yes';

      return {
        id: `osm_${el.id}`,
        name,
        address,
        rating: '-',
        distance: dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`,
        distanceRaw: dist,
        lat: elLat,
        lng: elLng,
        tags,
        badge: isOpen ? 'Buka 24 Jam' : badge,
        badgeStyle: isOpen ? '' : badgeStyle,
        isOpen,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.distanceRaw - b.distanceRaw);

  // Mark the first one as closest recommendation
  if (clinics.length > 0 && !clinics[0].isOpen) {
    clinics[0].badge = 'TERDEKAT';
    clinics[0].badgeStyle = 'bg-secondary-container text-on-secondary-container';
  }

  return clinics;
}

export default function ClinicPage() {
  const [clinicList, setClinicList] = useState<any[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Geolocation States
  const [isTracking, setIsTracking] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  // Filter list based on search
  const filteredClinics = clinicList.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      alert("Maaf, API Geolokasi tidak didukung oleh browser ini.");
      return;
    }

    setIsTracking(true);
    setFetchError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newUserLoc = { lat: latitude, lng: longitude };
        setUserLocation(newUserLoc);

        // Set map center to user position immediately
        setSelectedClinic({
          id: 'geo_live',
          name: 'Posisi Anda Saat Ini',
          address: `Koordinat [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`,
          lat: latitude,
          lng: longitude,
          rating: '-',
          distance: '0 m',
          tags: ['Live Tracking', 'Titik Pusat'],
          isGeoTarget: true
        });

        try {
          // Fetch REAL nearby clinics from OpenStreetMap
          const realClinics = await fetchNearbyClinics(latitude, longitude, 5000);

          if (realClinics.length === 0) {
            // Try wider radius if none found
            const widerClinics = await fetchNearbyClinics(latitude, longitude, 15000);
            setClinicList(widerClinics);
            if (widerClinics.length > 0) {
              setSelectedClinic(widerClinics[0]);
            }
          } else {
            setClinicList(realClinics);
            setSelectedClinic(realClinics[0]);
          }
          setHasSearched(true);
        } catch (err) {
          console.error('Error fetching clinics:', err);
          setFetchError('Gagal mengambil data fasilitas kesehatan. Coba lagi dalam beberapa saat.');
        }

        setIsTracking(false);
      },
      (error) => {
        setIsTracking(false);
        alert("Akses lokasi ditolak atau gagal dilacak. Pastikan Anda menekan tombol 'Allow/Izinkan'.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
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
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight font-headline">Cari Rumah sakit terdekat</h1>
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
            <div className="flex gap-2 pb-2">
              <button
                onClick={handleFindNearby}
                disabled={isTracking}
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${isTracking
                  ? 'bg-outline-variant text-white cursor-wait'
                  : userLocation
                    ? 'bg-tertiary text-on-tertiary shadow-md'
                    : 'bg-primary text-on-primary hover:bg-on-primary-container'
                  }`}
              >
                {isTracking ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]" style={userLocation ? { fontVariationSettings: "'FILL' 1" } : undefined}>near_me</span>
                )}
                {isTracking ? 'Mencari klinik nyata...' : userLocation ? 'Perbarui Lokasi' : 'Cari Klinik Terdekat'}
              </button>
            </div>
          </div>

          {/* Clinic Cards */}
          <div className="flex-1 p-6 space-y-4">

            {/* Initial State - No search yet */}
            {!hasSearched && !isTracking && clinicList.length === 0 && (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_searching</span>
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface mb-3">Temukan Fasilitas Kesehatan</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6 max-w-xs mx-auto">
                  Tekan tombol <strong>&quot;Cari Klinik Terdekat&quot;</strong> untuk mendeteksi klinik dan rumah sakit <strong>nyata</strong> di sekitar lokasi Anda menggunakan data OpenStreetMap.
                </p>
                <button
                  onClick={handleFindNearby}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 mx-auto"
                >
                  <span className="material-symbols-outlined text-lg">my_location</span>
                  Aktifkan Lokasi GPS
                </button>
              </div>
            )}

            {/* Loading indicator */}
            {isTracking && (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 bg-tertiary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <span className="material-symbols-outlined text-4xl text-tertiary animate-spin">radar</span>
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface mb-2">Memindai Area Anda...</h3>
                <p className="text-on-surface-variant text-sm">Mengambil data fasilitas kesehatan dari OpenStreetMap</p>
              </div>
            )}

            {/* Error message */}
            {fetchError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl mb-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
                  <div>
                    <h4 className="font-bold text-red-800">Kesalahan</h4>
                    <p className="text-sm text-red-600 mt-1">{fetchError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box when geo tracking active */}
            {userLocation && hasSearched && (
              <div className="bg-tertiary/10 border-l-4 border-tertiary p-4 rounded-xl mb-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-tertiary mt-0.5">radar</span>
                  <div>
                    <h4 className="font-bold text-on-surface">Data Fasilitas Nyata</h4>
                    <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                      Menampilkan <strong>{clinicList.length}</strong> fasilitas kesehatan nyata di sekitar koordinat [{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}]. Data bersumber dari OpenStreetMap.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {hasSearched && !isTracking && filteredClinics.length === 0 && (
              <div className="text-center py-10 opacity-70">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
                <p className="font-medium">Tidak ada fasilitas kesehatan ditemukan di area ini.</p>
                <p className="text-sm text-on-surface-variant mt-2">Coba perbarui lokasi untuk memperluas pencarian.</p>
              </div>
            )}

            {filteredClinics.map((clinic) => (
              <div
                key={clinic.id}
                onClick={() => setSelectedClinic(clinic)}
                className={`group bg-surface-container-lowest rounded-xl p-5 cursor-pointer transition-all duration-300 ring-2 ${selectedClinic?.id === clinic.id ? 'ring-primary bg-primary/5 shadow-md scale-[1.02] z-10 relative' : 'ring-outline-variant/10 hover:ring-outline-variant/40 hover:bg-surface-container-low'}`}
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
                    <h3 className={`text-lg font-bold transition-colors ${selectedClinic?.id === clinic.id ? 'text-primary' : 'text-on-surface'}`}>{clinic.name}</h3>
                    <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[16px]">location_on</span> {clinic.address}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-outline font-medium bg-surface-container-highest px-2 py-1 rounded-full">{clinic.distance}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {clinic.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-surface-container-highest text-[11px] font-medium text-on-surface-variant rounded">{tag}</span>
                  ))}
                </div>
                {selectedClinic?.id === clinic.id && (
                  <div className="grid grid-cols-1 gap-3 pt-4 border-t border-outline-variant/20 animate-in fade-in duration-300 slide-in-from-top-1">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1${userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : ''}&destination=${clinic.lat},${clinic.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white border border-primary font-bold text-sm hover:shadow-lg hover:shadow-primary/30 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">directions</span> Buka Rute di Google Maps
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          <footer className="p-6 border-t border-outline-variant/10 bg-surface-container-lowest font-label text-xs text-on-surface-variant text-center">
            Data fasilitas kesehatan bersumber dari © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" className="underline">OpenStreetMap</a> contributors.
          </footer>
        </aside>

        {/* Map View - Interactive Leaflet Radar */}
        <section className="flex-1 relative bg-slate-100 hidden md:block z-10">
          <ClinicMap
            clinics={clinicList}
            userLocation={userLocation}
            selectedClinic={selectedClinic}
          />

          {/* Radar Status Indicator */}
          {isTracking && (
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-blue-100 flex items-center gap-2 z-30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Scanning Area...</span>
            </div>
          )}

          {/* Data source attribution on map */}
          {hasSearched && clinicList.length > 0 && (
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md z-30 text-[10px] font-medium text-slate-600">
              📍 {clinicList.length} fasilitas dari OpenStreetMap
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
        <Link href="/settings" className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      </div>
    </>
  );
}
