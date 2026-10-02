'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception safely to client console or monitoring service
    console.error('Unhandled application exception:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-brand-bg">
      <div className="max-w-md w-full text-center">
        {/* Warning Icon Badge */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 mb-6">
          <AlertTriangle className="w-6 h-6 stroke-[1.5]" />
        </div>

        <h2 className="text-2xl md:text-3xl font-serif text-neutral-900 font-normal tracking-tight mb-3">
          Đã có sự cố xảy ra
        </h2>

        <p className="text-sm text-neutral-500 font-normal leading-relaxed mb-8">
          Hệ thống gặp trục trặc tạm thời khi hiển thị nội dung này. Xin quý khách vui lòng thử tải lại hoặc quay lại trang chủ.
        </p>

        {error.digest && (
          <p className="text-[10px] font-mono text-neutral-400 mb-6 bg-neutral-100 py-1.5 px-3 rounded-lg inline-block">
            Mã tham chiếu: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-accent text-white px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại ngay</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-neutral-800 border border-neutral-200 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
