import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { LookbookItem } from './lookbookTypes';

interface LookbookGridSectionProps {
  lookbooks: LookbookItem[];
  activeProducts: Product[];
  onSelectLook: (look: LookbookItem, productId?: string) => void;
}

export function LookbookGridSection({
  lookbooks,
  activeProducts,
  onSelectLook,
}: LookbookGridSectionProps) {
  return (
    <div className="space-y-32 md:space-y-44">
      {lookbooks.map((lb, index) => {
        const isEven = index % 2 === 0;

        return (
          <div
            key={lb.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
          >
            {/* Lookbook Visual Card Column */}
            <div
              className={`lg:col-span-7 relative rounded-3xl overflow-hidden border border-brand-border bg-white aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] group shadow-sm ${
                isEven ? 'lg:order-1' : 'lg:order-2'
              }`}
            >
              <Image
                src={lb.image}
                alt={lb.title}
                fill
                priority={index === 0}
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
                unoptimized
              />

              {/* Gradient shadow overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 pointer-events-none" />

              {/* HOTSPOTS MAP */}
              {lb.hotspots.map((hs, subIndex) => {
                const linkedProduct = activeProducts.find((p) => p.id === hs.productId);
                if (!linkedProduct) return null;

                return (
                  <div
                    key={hs.id}
                    style={{ top: hs.top, left: hs.left }}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                  >
                    {/* Elegant Minimalist Hotspot Button */}
                    <button
                      onClick={() => onSelectLook(lb, hs.productId)}
                      className="w-8 h-8 rounded-full flex items-center justify-center relative cursor-pointer focus:outline-none transition-all duration-300 border border-brand-border bg-white/95 text-brand-text shadow-md hover:scale-110 active:scale-95 group/btn"
                      aria-label={`Shop product ${linkedProduct.name}`}
                    >
                      <span className="text-[10px] font-bold text-brand-text">
                        {String(subIndex + 1).padStart(2, '0')}
                      </span>

                      {/* Pulsing halo */}
                      <span className="w-12 h-12 border border-white/60 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping opacity-40 pointer-events-none" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Editorial Collection Info Column */}
            <div
              className={`lg:col-span-5 flex flex-col justify-center text-left ${
                isEven ? 'lg:order-2 lg:pl-10' : 'lg:order-1 lg:pr-10'
              }`}
            >
              <span className="text-[9px] uppercase font-bold tracking-[0.3em] text-brand-accent mb-3 block">
                {lb.subtitle}
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal text-brand-text uppercase tracking-widest mb-6">
                {lb.title}
              </h2>
              <div className="h-[1px] w-12 bg-brand-border mb-6" />
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-light tracking-wide mb-8">
                {lb.description}
              </p>
              
              {/* Shop the Look Button */}
              <button
                onClick={() => onSelectLook(lb)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-text hover:text-brand-muted transition-colors border-b border-brand-text hover:border-brand-muted pb-1.5 w-fit cursor-pointer"
              >
                <span>Khám phá set đồ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
