'use client';

import React from 'react';
import { Product } from '../../../types';
import { ProductCard } from '../ProductCard';

interface ProductRelatedSectionProps {
  relatedProducts: Product[];
  recentlyViewed: Product[];
}

export default function ProductRelatedSection({
  relatedProducts,
  recentlyViewed
}: ProductRelatedSectionProps) {
  return (
    <>
      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-brand-border pt-16">
          <h2 className="text-xl md:text-2xl font-bold text-brand-text uppercase tracking-tight mb-8">
            Sản phẩm liên quan
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Products Grid */}
      {recentlyViewed.length > 0 && (
        <section className="border-t border-brand-border pt-16 mt-16">
          <h2 className="text-xl md:text-2xl font-bold text-brand-text uppercase tracking-tight mb-8">
            Sản phẩm đã xem gần đây
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {recentlyViewed.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
