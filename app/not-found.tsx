import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-brand-bg">
      <div className="max-w-md w-full text-center">
        {/* Subtle decorative badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs font-medium mb-6">
          <Compass className="w-3.5 h-3.5 text-brand-accent animate-spin-slow" />
          <span>Lỗi 404 &bull; Trang Không Tồn Tại</span>
        </div>

        {/* Serif brand heading */}
        <h1 className="text-6xl md:text-7xl font-serif text-neutral-900 font-light tracking-tight mb-4">
          404
        </h1>

        <p className="text-base text-neutral-600 font-normal leading-relaxed mb-8">
          Trang hoặc thiết kế bạn đang tìm kiếm hiện không có sẵn, đã được chuyển tới danh mục khác hoặc tạm ngừng phân phối.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-accent text-white px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-sm active:scale-95"
          >
            <span>Khám phá bộ sưu tập</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-neutral-800 border border-neutral-200 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
