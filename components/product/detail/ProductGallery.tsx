'use client';

import React from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Product } from '../../../types';

const ProductViewer3D = dynamic(() => import('../../3d/ProductViewer3D'), { ssr: false });

interface ProductGalleryProps {
  product: Product;
  displayedImages: string[];
  activeImageIdx: number;
  setActiveImageIdx: (idx: number) => void;
  view3D: boolean;
  setView3D: (v: boolean) => void;
  modelSize: 'S' | 'XL';
  setModelSize: (s: 'S' | 'XL') => void;
  selectedColorHex: string;
}

export default function ProductGallery({
  product,
  displayedImages,
  activeImageIdx,
  setActiveImageIdx,
  view3D,
  setView3D,
  modelSize,
  setModelSize,
  selectedColorHex
}: ProductGalleryProps) {
  return (
    <div className="lg:col-span-7 grid grid-cols-12 gap-4">
      {/* Thumbnails list (Desktop sidebar) */}
      <div className="col-span-12 md:col-span-2 order-2 md:order-1 flex md:flex-col gap-3 justify-center md:justify-start">
        {displayedImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImageIdx(idx)}
            className={`relative aspect-square w-16 md:w-full rounded-xl overflow-hidden border bg-neutral-50 transition-all ${
              activeImageIdx === idx ? 'border-neutral-950 shadow-sm' : 'border-neutral-200 hover:border-neutral-400'
            }`}
          >
            <Image
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              fill
              className="object-cover"
              unoptimized
            />
          </button>
        ))}
      </div>

      {/* Large display image / 3D Canvas Viewer */}
      <div className="col-span-12 md:col-span-10 order-1 md:order-2 aspect-[3/4] relative bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200/60 shadow-sm">
        {view3D && product.has3D ? (
          <div className="w-full h-full relative bg-neutral-900/5 backdrop-blur-md">
            <ProductViewer3D modelType={product.modelType} colorHex={selectedColorHex} />
          </div>
        ) : (
          <Image
            src={displayedImages[activeImageIdx] || product.images[0]}
            alt={product.name}
            fill
            priority
            className="object-cover"
            unoptimized
          />
        )}

        {/* Premium 3D View Toggle Button */}
        {product.has3D && (
          <button
            onClick={() => setView3D(!view3D)}
            className="absolute top-4 right-4 z-20 px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white/70 hover:bg-white/90 text-neutral-900 border border-neutral-200/50 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            {view3D ? (
              <>
                <span>Xem ảnh</span>
                <span>🖼️</span>
              </>
            ) : (
              <>
                <span>Xem 3D</span>
                <span className="animate-spin" style={{ animationDuration: '6s' }}>🔄</span>
              </>
            )}
          </button>
        )}

        {/* SKIMS style Floating "View on Model" Toggle */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center bg-white/90 backdrop-blur-sm rounded-xl p-1 border border-neutral-200/60 shadow-sm">
          <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 px-2.5">
            Mẫu mặc:
          </span>
          <button
            onClick={() => {
              setModelSize('S');
              setActiveImageIdx(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
              modelSize === 'S'
                ? 'bg-neutral-950 text-white shadow-none'
                : 'text-neutral-500 hover:text-neutral-855'
            }`}
          >
            Size S
          </button>
          <button
            onClick={() => {
              setModelSize('XL');
              setActiveImageIdx(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
              modelSize === 'XL'
                ? 'bg-neutral-950 text-white shadow-none'
                : 'text-neutral-500 hover:text-neutral-855'
            }`}
          >
            Size XL
          </button>
        </div>
      </div>
    </div>
  );
}
