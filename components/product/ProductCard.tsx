'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { Star, Heart, ShoppingBag, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showMobileSizes, setShowMobileSizes] = useState(false);
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const isLoved = isInWishlist(product.id);

  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Max 8 degrees tilt rotation for sleek elegance
    const rX = -(mouseY / (height / 2)) * 8;
    const rY = (mouseX / (width / 2)) * 8;
    
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeaveCard = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const activeColor = product.colors[activeColorIdx] || product.colors[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        rotateX: rotateX,
        rotateY: rotateY,
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 280, 
        damping: 25,
        opacity: { duration: 0.3 },
        y: { duration: 0.3 }
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeaveCard}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      className="group flex flex-col h-full bg-white rounded-3xl border border-neutral-100 overflow-hidden hover:border-neutral-300 transition-all duration-300 cursor-pointer relative"
    >
      
      {/* Product Image Gallery with aspect ratio 3/4 */}
      <div
        style={{
          transformStyle: 'preserve-3d',
        }}
        className="relative block w-full aspect-[3/4] bg-neutral-50 overflow-hidden"
      >
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          {/* Primary image */}
          <div 
            className="w-full h-full relative" 
            style={{ transform: 'translateZ(10px)' }}
          >
            <Image
              src={product.images[activeColorIdx] || product.images[0]}
              alt={`${product.name} - ${activeColor.name}`}
              fill
              sizes="(max-w-7xl) 25vw, (max-w-md) 50vw, 100vw"
              priority={false}
              className={`object-cover w-full h-full transition-all duration-700 ease-in-out ${
                isHovered && product.images.length > 1 ? 'opacity-0 scale-[1.02]' : 'opacity-100 scale-100'
              }`}
              unoptimized
            />
            
            {/* Hover Swap Image */}
            {product.images.length > 1 && (
              <Image
                src={product.images[(activeColorIdx + 1) % product.images.length] || product.images[1]}
                alt={`${product.name} - Alternating view`}
                fill
                sizes="(max-w-7xl) 25vw, (max-w-md) 50vw, 100vw"
                priority={false}
                className={`object-cover w-full h-full absolute inset-0 transition-all duration-700 ease-in-out ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                unoptimized
              />
            )}
          </div>
        </Link>

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none" style={{ transform: 'translateZ(25px)' }}>
          {product.badges?.map((badge) => {
            let badgeStyle = 'bg-neutral-950 text-neutral-50 border-neutral-955';
            if (badge === 'Sale') {
              badgeStyle = 'bg-rose-50 text-rose-700 border-rose-150';
            } else if (badge === 'New') {
              badgeStyle = 'bg-neutral-50 text-neutral-600 border-neutral-200';
            } else if (badge === 'Best Seller') {
              badgeStyle = 'bg-neutral-100 text-neutral-800 border-neutral-200';
            }
            return (
              <span
                key={badge}
                className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${badgeStyle}`}
              >
                {badge}
              </span>
            );
          })}
        </div>

        {/* Floating Wishlist Heart */}
        <button
          onClick={handleWishlistClick}
          style={{ transform: 'translateZ(30px)' }}
          className={`absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition-all duration-300 active:scale-90 cursor-pointer ${
            isLoved 
              ? 'bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100 scale-105' 
              : 'bg-white/80 border-neutral-200/40 text-neutral-600 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label="Thêm vào danh sách yêu thích"
        >
          <Heart className={`w-4 h-4 ${isLoved ? 'fill-current' : ''}`} />
        </button>

        {/* Floating Discount Tag */}
        {discountPercent > 0 && (
          <div className="absolute bottom-3 left-3 z-10 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-rose-700" style={{ transform: 'translateZ(25px)' }}>
            -{discountPercent}%
          </div>
        )}

        {/* Quick Add Size Trigger Button for Mobile */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMobileSizes(true);
          }}
          style={{ transform: 'translateZ(25px)' }}
          className="absolute bottom-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200 shadow-sm text-neutral-800 md:hidden hover:bg-neutral-900 hover:text-white transition-all duration-300"
          aria-label="Thêm nhanh kích cỡ"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Premium Size Selector Overlay (Slides in on hover/touch) */}
        <AnimatePresence>
          {(isHovered || showMobileSizes) && (
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="absolute bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200/60 p-3.5 flex flex-col items-center"
              style={{ transform: 'translateZ(40px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {showMobileSizes && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMobileSizes(false);
                  }}
                  className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-neutral-900 md:hidden"
                  aria-label="Đóng bảng chọn size"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {product.stock === 0 ? (
                <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 py-1">
                  Hết hàng
                </span>
              ) : (
                <>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3" />
                    Thêm nhanh kích cỡ
                  </span>
                  <div className="flex flex-wrap justify-center gap-1.5 w-full">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart(product, 1, activeColor, size);
                          setShowMobileSizes(false);
                        }}
                        className="px-3 py-1.5 text-[10px] font-bold rounded-xl border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 active:scale-95 transition-all cursor-pointer"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col justify-between flex-grow bg-white">
        <div>
          {/* Category */}
          <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mb-1">
            {product.category}
          </span>

          {/* Product Name */}
          <h3 className="text-xs sm:text-sm font-medium text-neutral-900 group-hover:text-neutral-700 transition-colors line-clamp-2 min-h-[32px] sm:min-h-[40px] mb-1">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>

          {/* Color Swatches */}
          <div className="flex flex-wrap gap-1.5 my-2">
            {product.colors.map((color, idx) => (
              <button
                key={color.name}
                onMouseEnter={() => setActiveColorIdx(idx)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveColorIdx(idx);
                }}
                style={{ backgroundColor: color.hex }}
                className={`w-3.5 h-3.5 rounded-full border border-neutral-200 shadow-sm relative transition-all duration-300 cursor-pointer ${
                  activeColorIdx === idx 
                    ? 'ring-1 ring-neutral-950 ring-offset-1 scale-110 shadow' 
                    : 'hover:scale-110'
                }`}
                title={color.name}
                aria-label={`Chọn màu ${color.name}`}
              />
            ))}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center text-[#A89582]">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-[10px] font-bold text-neutral-700">{product.rating}</span>
            <span className="text-[9px] text-neutral-400">({product.reviews})</span>
          </div>
        </div>

        {/* Price Tag */}
        <div className="flex items-baseline gap-2 pt-2 border-t border-neutral-100">
          <span className="text-xs sm:text-sm font-bold text-neutral-900">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-[10px] text-neutral-450 line-through font-medium">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
  
};
