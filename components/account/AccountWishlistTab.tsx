'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { Product } from '../../types';

interface AccountWishlistTabProps {
  wishlist: Product[];
}

export default function AccountWishlistTab({ wishlist }: AccountWishlistTabProps) {
  return (
    <div>
      <h3 className="text-xl font-normal text-brand-text tracking-widest mb-6 uppercase pb-3 border-b border-brand-border">
        Danh sách yêu thích ({wishlist.length})
      </h3>
      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-brand-border flex flex-col items-center">
          <Heart className="w-12 h-12 text-brand-border mb-3" />
          <p className="text-xs text-brand-muted font-bold mb-4">Bạn chưa lưu bất kỳ sản phẩm nào.</p>
          <Link
            href="/products"
            className="bg-brand-accent text-white text-[10px] font-bold uppercase tracking-widest px-5 py-3 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishlist.map((prod) => (
            <div
              key={prod.id}
              className="flex gap-4 p-4 border border-brand-border rounded-xl items-center bg-neutral-50/30 hover:bg-white transition-all shadow-sm"
            >
              <div className="relative w-16 aspect-[4/5] rounded-xl bg-brand-bg overflow-hidden border border-brand-border shrink-0">
                <Image
                  src={prod.images[0]}
                  alt={prod.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-grow">
                <h4 className="text-xs font-semibold uppercase text-brand-text">{prod.name}</h4>
                <span className="text-[8px] uppercase tracking-widest font-bold text-brand-muted block mt-0.5">
                  {prod.category}
                </span>
                <span className="text-xs font-bold text-brand-text block mt-1.5">{formatPrice(prod.price)}</span>
              </div>
              <Link
                href={`/products/${prod.slug}`}
                className="bg-brand-accent text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors"
              >
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
