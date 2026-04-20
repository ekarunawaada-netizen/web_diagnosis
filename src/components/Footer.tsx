import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-8 mt-auto bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-opacity duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center pl-8 pr-20 md:pr-24 gap-4 max-w-[1440px] mx-auto">
        <div className="font-label text-xs uppercase tracking-widest text-slate-400 text-center md:text-left">
          © 2024 MediScan Diagnosis Platform. Hak Cipta Dilindungi.
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <Link className="font-label text-xs uppercase tracking-widest text-slate-500 hover:text-blue-500 hover:underline underline-offset-4" href="#">Kebijakan Privasi</Link>
          <Link className="font-label text-xs uppercase tracking-widest text-slate-500 hover:text-blue-500 hover:underline underline-offset-4" href="#">Syarat & Ketentuan</Link>
          <Link className="font-label text-xs uppercase tracking-widest text-slate-500 hover:text-blue-500 hover:underline underline-offset-4" href="#">Bantuan</Link>
          <Link className="font-label text-xs uppercase tracking-widest text-slate-500 hover:text-blue-500 hover:underline underline-offset-4" href="#">Karir</Link>
        </div>
      </div>
    </footer>
  );
}
