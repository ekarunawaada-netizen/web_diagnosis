'use client';

export default function MedicalDisclaimer() {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-2xl my-8">
      <div className="flex gap-4">
        <div className="shrink-0 text-amber-500">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
        </div>
        <div>
          <h4 className="font-bold text-amber-900 font-headline mb-1">Sangkalan Medis (Medical Disclaimer)</h4>
          <p className="text-sm text-amber-800 leading-relaxed">
            Aplikasi ini bukan pengganti saran medis profesional, diagnosis, atau perawatan. 
            Selalu cari saran dari dokter Anda atau penyedia kesehatan yang memenuhi syarat lainnya dengan pertanyaan apa pun yang mungkin Anda miliki mengenai kondisi medis. 
            Jangan pernah mengabaikan saran medis profesional atau menunda mencarinya karena sesuatu yang telah Anda baca di aplikasi ini.
          </p>
        </div>
      </div>
    </div>
  );
}
