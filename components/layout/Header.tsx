'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Search, Menu, X, ArrowRight, Heart, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../../lib/utils';
import { CartDrawer } from '../common/CartDrawer';
import { SearchSuggestions } from '../common/SearchSuggestions';

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, wishlist, wishlistCount, toggleWishlist } = useCart();
  const { currentUser } = useAuth();

  const prevCartCount = useRef(cartCount);

  // Automatically open Cart Drawer when items are added to cart
  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      setIsCartOpen(true);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  // Navigation Links
  const navLinks = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Sản phẩm', href: '/products' },
    { name: 'Lookbook', href: '/lookbook' },
    { name: 'Giới thiệu', href: '/about' },
    { name: 'Liên hệ', href: '/contact' },
  ];

  const mobileNavLinks = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Sản phẩm', href: '/products' },
    { name: 'Lookbook', href: '/lookbook' },
    { name: 'Giới thiệu', href: '/about' },
    { name: 'Liên hệ', href: '/contact' },
    { name: 'Tài khoản', href: '/account' },
    { name: 'Giỏ hàng', href: '/cart' },
  ];

  // Detect scroll to make header background blur/shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [pathname]);

  // Lock body scroll when any menu/drawer is open
  useEffect(() => {
    if (isOpen || isWishlistOpen || isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isWishlistOpen, isCartOpen]);

  if (pathname?.startsWith('/internal')) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FAF8F5]/90 backdrop-blur-md shadow-xs border-b border-brand-border/40 py-3'
            : 'bg-[#FAF8F5]/90 backdrop-blur-md shadow-xs border-b border-brand-border/40 py-3 md:bg-transparent md:backdrop-blur-none md:shadow-none md:border-b-0 md:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-neutral-200 bg-[#FFFBF8] flex items-center justify-center p-0.5 shadow-sm group-hover:border-neutral-400 transition-colors">
                <img
                  src="/logo.png"
                  alt="NOVYN WEAR Monogram"
                  className="w-full h-full object-contain scale-125 -translate-y-[1px]"
                />
              </div>
              <span className="text-xl md:text-2xl font-black tracking-wider text-neutral-900 font-sans group-hover:text-neutral-700 transition-colors">
                NOVYN<span className="text-neutral-500 font-light">.WEAR</span>
              </span>
            </Link>

            {/* Desktop Navigation Menu */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium tracking-wide uppercase transition-colors relative py-1 ${
                      isActive ? 'text-neutral-950 font-semibold' : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 w-full h-[1.5px] bg-neutral-950 rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Icons: Search & Cart & Mobile Menu Button */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              
              <div className="hidden lg:block relative w-60">
                <form onSubmit={handleSearchSubmit} className="flex items-center relative w-full">
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className="w-full pl-9 pr-4 py-1.5 rounded-full border border-brand-border bg-[#FAF7F2]/60 text-xs text-brand-text placeholder-brand-muted/70 focus:outline-none focus:border-brand-accent focus:bg-white focus:ring-2 focus:ring-brand-accent/5 transition-all font-medium"
                  />
                  <Search className="w-3.5 h-3.5 text-brand-muted absolute left-3 pointer-events-none" />
                </form>
                {isSearchFocused && (
                  <SearchSuggestions
                    query={searchQuery}
                    onSelectKeyword={(kw) => {
                      setSearchQuery(kw);
                      router.push(`/products?search=${encodeURIComponent(kw)}`);
                      setIsSearchFocused(false);
                    }}
                    onClose={() => setIsSearchFocused(false)}
                  />
                )}
              </div>

              {/* Search Icon - Mobile/Tablet (Direct to Products with focus) */}
              <button
                onClick={() => router.push('/products?focus=search')}
                className="lg:hidden p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors"
                aria-label="Tìm kiếm"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Heart Icon (Hidden on Mobile) */}
              <button
                onClick={() => setIsWishlistOpen(true)}
                className="hidden sm:inline-flex relative p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Danh sách yêu thích"
              >
                <Heart className="w-5 h-5 text-neutral-600" />
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Giỏ hàng"
              >
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-1.5 right-1.5 bg-neutral-950 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Account Profile Icon (Hidden on Mobile) */}
              <Link
                href="/account"
                className="hidden sm:flex relative p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Tài khoản"
              >
                {currentUser ? (
                  <div className="relative w-6 h-6 rounded-full overflow-hidden border border-neutral-350 shadow-inner">
                    <Image
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop'}
                      alt={currentUser.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${
                      currentUser.role === 'director' ? 'bg-rose-500' :
                      currentUser.role === 'manager' ? 'bg-amber-500' :
                      currentUser.role === 'employee' ? 'bg-sky-500' : 'bg-emerald-500'
                    }`} />
                  </div>
                ) : (
                  <UserIcon className="w-5 h-5 text-neutral-600" />
                )}
              </Link>

              {/* Hamburger Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors"
                aria-label="Menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-45 md:hidden"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl p-6 md:hidden flex flex-col justify-between"
            >
              <div>
                {/* Header inside Panel */}
                <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-neutral-200 bg-[#FFFBF8] flex items-center justify-center p-0.5 shadow-sm">
                      <img
                        src="/logo.png"
                        alt="NOVYN WEAR Monogram"
                        className="w-full h-full object-contain scale-125 -translate-y-[1px]"
                      />
                    </div>
                    <span className="text-base font-extrabold tracking-wider text-neutral-900">
                      NOVYN.WEAR
                    </span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100"
                    aria-label="Đóng menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Search Bar */}
                <div className="mt-6 relative">
                  <form onSubmit={handleSearchSubmit} className="relative w-full">
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsMobileSearchFocused(true)}
                      onBlur={() => setTimeout(() => setIsMobileSearchFocused(false), 200)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400"
                    />
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </form>
                  {isMobileSearchFocused && (
                    <SearchSuggestions
                      query={searchQuery}
                      onSelectKeyword={(kw) => {
                        setSearchQuery(kw);
                        router.push(`/products?search=${encodeURIComponent(kw)}`);
                        setIsOpen(false);
                        setIsMobileSearchFocused(false);
                      }}
                      onClose={() => setIsMobileSearchFocused(false)}
                    />
                  )}
                </div>

                 {/* Mobile Navigation Links */}
                <nav className="mt-8 flex flex-col gap-6">
                  {mobileNavLinks.map((link, idx) => {
                    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Link
                          href={link.href}
                          className={`text-base font-semibold tracking-wide uppercase flex items-center justify-between py-1 border-b border-transparent ${
                            isActive ? 'text-neutral-950 border-neutral-900' : 'text-neutral-500 hover:text-neutral-800'
                          }`}
                        >
                          {link.name}
                          <ArrowRight className="w-4 h-4 text-neutral-300" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Drawer Footer */}
              <div className="border-t border-neutral-100 pt-6">
                {currentUser ? (
                  <div className="flex items-center gap-3 mb-4 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-neutral-200">
                      <Image
                        src={currentUser.avatar || ''}
                        alt={currentUser.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-xs font-bold text-neutral-850 truncate">{currentUser.name}</h4>
                      <p className="text-[10px] text-neutral-400 capitalize truncate font-semibold">
                        {currentUser.role === 'director' ? 'Giám đốc' : 
                         currentUser.role === 'manager' ? `Quản lý: ${currentUser.branch}` : 
                         currentUser.role === 'employee' ? `Nhân viên: ${currentUser.branch}` : 
                         currentUser.role === 'accountant' ? 'Kế toán trưởng' :
                         currentUser.role === 'cskh' ? 'Chăm sóc khách hàng' : 'Khách hàng'}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setIsOpen(false)}
                      className="text-[10px] bg-neutral-950 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-neutral-800 shrink-0"
                    >
                      Vào quản lý
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/account"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 transition-all mb-4"
                  >
                    <UserIcon className="w-4 h-4" />
                    Đăng nhập / Đăng ký
                  </Link>
                )}
                <p className="text-xs text-neutral-400 text-center">
                  © 2026 Novyn Wear. All rights reserved.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16 md:h-20" />

      {/* 4. WISHLIST SIDE DRAWER PANEL OVERLAY */}
      <AnimatePresence>
        {isWishlistOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWishlistOpen(false)}
              className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-45"
            />

            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 sm:w-96 max-w-[90vw] bg-white/95 backdrop-blur-md z-50 shadow-2xl p-6 flex flex-col justify-between border-l border-neutral-100"
            >
              <div>
                {/* Header inside Panel */}
                <div className="flex items-center justify-between pb-5 border-b border-neutral-100 mb-6">
                  <span className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500 fill-current" />
                    Danh sách yêu thích ({wishlistCount})
                  </span>
                  <button
                    onClick={() => setIsWishlistOpen(false)}
                    className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors cursor-pointer"
                    aria-label="Đóng"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Loved Items scrollable list */}
                {wishlist.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center gap-3">
                    <Heart className="w-10 h-10 text-neutral-200" />
                    <p className="text-xs text-neutral-400 font-medium">Bạn chưa lưu sản phẩm yêu thích nào.</p>
                    <button
                      onClick={() => {
                        setIsWishlistOpen(false);
                        router.push('/products');
                      }}
                      className="mt-4 bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-neutral-850 transition-colors cursor-pointer"
                    >
                      Khám phá ngay
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 overflow-y-auto max-h-[68vh] pr-1 scrollbar-thin">
                    {wishlist.map((prod) => (
                      <div key={prod.id} className="flex gap-3 pb-4 border-b border-neutral-50 items-center justify-between">
                        <Link 
                          href={`/products/${prod.slug}`}
                          onClick={() => setIsWishlistOpen(false)}
                          className="flex gap-3 flex-grow group/item"
                        >
                          <div className="relative w-12 aspect-[4/5] bg-neutral-50 rounded-lg overflow-hidden border shrink-0">
                            <Image
                              src={prod.images[0]}
                              alt={prod.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-xs font-bold text-neutral-800 line-clamp-1 group-hover/item:text-neutral-500 transition-colors">{prod.name}</h4>
                            <span className="text-[10px] text-neutral-450 block uppercase font-medium mt-0.5">{prod.category}</span>
                            <span className="text-[11px] font-bold text-neutral-900 block mt-1">{formatPrice(prod.price)}</span>
                          </div>
                        </Link>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => toggleWishlist(prod)}
                            className="text-[10px] text-rose-500 hover:text-rose-700 font-bold p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar Drawer Footer */}
              {wishlist.length > 0 && (
                <div className="border-t border-neutral-100 pt-6">
                  <button
                    onClick={() => {
                      setIsWishlistOpen(false);
                      router.push('/products');
                    }}
                    className="w-full text-center bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider py-4 rounded-xl hover:bg-neutral-850 transition-all active:scale-95 cursor-pointer"
                  >
                    Xem tất cả sản phẩm
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart side drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
