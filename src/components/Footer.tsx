import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="main-footer" className="w-full py-8 mt-auto bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-opacity duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 lg:px-24 gap-8 max-w-[1440px] mx-auto">
        <div className="font-label text-[10px] md:text-xs uppercase tracking-widest text-slate-400 text-center md:text-left leading-relaxed">
          © 2026 Petit Hospital (ekarunawaada-netizen). <br className="md:hidden" /> Hak Cipta Dilindungi.
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
          <Link className="font-label text-[10px] md:text-xs uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors" href="/privacy">Kebijakan Privasi</Link>
          <Link className="font-label text-[10px] md:text-xs uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors" href="/terms">Syarat & Ketentuan</Link>
          <Link className="font-label text-[10px] md:text-xs uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors" href="/help">Bantuan</Link>
        </div>
      </div>
    </footer>
  );
}
