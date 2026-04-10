'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Fix for Leaflet icon issues in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const UserIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

interface Clinic {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export default function ClinicMap({ 
  clinics, 
  userLocation, 
  selectedClinic 
}: { 
  clinics: Clinic[], 
  userLocation: { lat: number, lng: number } | null, 
  selectedClinic: any 
}) {
  const [center, setCenter] = useState<[number, number]>([-6.2088, 106.8456]); // Default Jakarta

  useEffect(() => {
    if (selectedClinic?.lat && selectedClinic?.lng) {
      setCenter([selectedClinic.lat, selectedClinic.lng]);
    } else if (userLocation) {
      setCenter([userLocation.lat, userLocation.lng]);
    }
  }, [selectedClinic, userLocation]);

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={center} 
        zoom={15} 
        scrollWheelZoom={true} 
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {clinics.map((clinic) => (
          <Marker 
            key={clinic.id} 
            position={[clinic.lat, clinic.lng]}
            eventHandlers={{
              click: () => {
                // Potential callback to parent
              },
            }}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-bold text-blue-600">{clinic.name}</h4>
                <p className="text-xs text-slate-600">{clinic.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={UserIcon}>
              <Popup>Lokasi Anda</Popup>
            </Marker>
            <Circle 
              center={[userLocation.lat, userLocation.lng]} 
              radius={500} 
              pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.1, color: '#3b82f6', weight: 1, dashArray: '5, 5' }} 
            />
          </>
        )}

        <ChangeView center={center} zoom={15} />
      </MapContainer>

      {/* Radar Animation Overlay */}
      {userLocation && selectedClinic?.id === 'geo_live' && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          <div className="w-64 h-64 border-4 border-blue-400/20 rounded-full animate-ping"></div>
          <div className="absolute w-96 h-96 border-2 border-blue-400/10 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
}
