"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function Loader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // When the route actually changes, we stop the loader
    setIsLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (!anchor || !anchor.href) return;
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      const currentUrl = new URL(window.location.href);
      const targetUrl = new URL(anchor.href);
      
      const isInternal = targetUrl.origin === currentUrl.origin;
      const isSamePath = targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search;
      
      // If internal navigation to a different path/search-param, show loader
      // Hash links won't trigger the loader
      if (isInternal && !isSamePath) {
        setIsLoading(true);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-blue-50/50 min-w-[300px]">
        <div className="flex flex-col items-center gap-6">
          <div className="text-4xl font-bold bg-gradient-to-br from-blue-700 to-blue-500 bg-clip-text text-transparent font-headline tracking-tight">
            MediScan
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin shadow-sm"></div>
            <p className="text-slate-500 font-medium font-body animate-pulse">Memuat halaman...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PageLoader() {
  return (
    <Suspense fallback={null}>
      <Loader />
    </Suspense>
  );
}
