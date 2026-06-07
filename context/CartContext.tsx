'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, Product, ColorOption } from '../types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { getCustomerTier, TIER_BENEFITS } from '../types';

interface PromoCode {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  description: string;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  memberDiscount: number;
  cartShipping: number;
  cartTotal: number;
  appliedPromo: PromoCode | null;
  addToCart: (product: Product, quantity: number, selectedColor: ColorOption, selectedSize: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  dynamicPromos: Record<string, PromoCode>;
  addDynamicPromoCode: (code: string, type: 'percent' | 'fixed', value: number, description: string) => void;
  deleteDynamicPromoCode: (code: string) => void;
  
  // Wishlist Extension (Step 10 Upgrades)
  wishlist: Product[];
  wishlistCount: number;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const PROMO_CODES: Record<string, PromoCode> = {
  SALE10: {
    code: 'SALE10',
    type: 'percent',
    value: 10,
    description: 'Giảm 10% cho toàn bộ đơn hàng',
  },
  FREESHIP: {
    code: 'FREESHIP',
    type: 'fixed',
    value: 30000,
    description: 'Miễn phí vận chuyển (giảm 30,000 ₫)',
  },
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [dynamicPromos, setDynamicPromos] = useState<Record<string, PromoCode>>({
    SALE10: { code: 'SALE10', type: 'percent', value: 10, description: 'Giảm 10% cho toàn bộ đơn hàng' },
    FREESHIP: { code: 'FREESHIP', type: 'fixed', value: 30000, description: 'Miễn phí vận chuyển (giảm 30,000 ₫)' },
  });
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { showToast } = useToast();
  const { currentUser } = useAuth();

  // Load cart & wishlist from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('novyn_cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
      const storedWishlist = localStorage.getItem('novyn_wishlist');
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
      const storedDynPromos = localStorage.getItem('novyn_dynamic_promos');
      let currentPromos: Record<string, PromoCode> = {
        SALE10: { code: 'SALE10', type: 'percent' as const, value: 10, description: 'Giảm 10% cho toàn bộ đơn hàng' },
        FREESHIP: { code: 'FREESHIP', type: 'fixed' as const, value: 30000, description: 'Miễn phí vận chuyển (giảm 30,000 ₫)' },
      };
      if (storedDynPromos) {
        try {
          const parsed = JSON.parse(storedDynPromos);
          currentPromos = { ...currentPromos, ...parsed };
          setDynamicPromos(currentPromos);
        } catch (e) {
          console.error(e);
        }
      }
      const storedPromo = localStorage.getItem('novyn_promo');
      if (storedPromo && currentPromos[storedPromo as keyof typeof currentPromos]) {
        setAppliedPromo(currentPromos[storedPromo as keyof typeof currentPromos]);
      }
    } catch (e) {
      console.error('Failed to load storage data:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('novyn_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart, isLoaded]);

  // Save wishlist to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('novyn_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  }, [wishlist, isLoaded]);

  // Save promo code to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (appliedPromo) {
        localStorage.setItem('novyn_promo', appliedPromo.code);
      } else {
        localStorage.removeItem('novyn_promo');
      }
    } catch (e) {
      console.error('Failed to save promo:', e);
    }
  }, [appliedPromo, isLoaded]);

  // Save dynamic promos to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('novyn_dynamic_promos', JSON.stringify(dynamicPromos));
    } catch (e) {
      console.error('Failed to save dynamic promos:', e);
    }
  }, [dynamicPromos, isLoaded]);

  const addToCart = (product: Product, quantity: number, selectedColor: ColorOption, selectedSize: string) => {
    const cartItemId = `${product.id}-${selectedColor.name}-${selectedSize}`;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.id === cartItemId);

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        const currentQty = updatedCart[existingItemIndex].quantity;
        const newQty = currentQty + quantity;

        if (newQty > product.stock) {
          showToast(`Chỉ còn ${product.stock} sản phẩm trong kho.`, 'error');
          return prevCart;
        }

        updatedCart[existingItemIndex].quantity = newQty;
        showToast(`Đã tăng số lượng ${product.name} trong giỏ hàng.`, 'success');
        return updatedCart;
      } else {
        if (quantity > product.stock) {
          showToast(`Chỉ còn ${product.stock} sản phẩm trong kho.`, 'error');
          return prevCart;
        }

        showToast(`Đã thêm ${product.name} vào giỏ hàng!`, 'success');
        return [
          ...prevCart,
          {
            id: cartItemId,
            product,
            quantity,
            selectedColor,
            selectedSize,
          },
        ];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.id === id);
      if (item) {
        showToast(`Đã xóa ${item.product.name} khỏi giỏ hàng.`, 'info');
      }
      return prevCart.filter((i) => i.id !== id);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prevCart) => {
      const item = prevCart.find((i) => i.id === id);
      if (item && quantity > item.product.stock) {
        showToast(`Chỉ còn ${item.product.stock} sản phẩm trong kho.`, 'error');
        return prevCart;
      }
      return prevCart.map((i) => (i.id === id ? { ...i, quantity } : i));
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
    localStorage.removeItem('novyn_cart');
    localStorage.removeItem('novyn_promo');
  };

  const applyPromoCode = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    if (dynamicPromos[cleanCode]) {
      setAppliedPromo(dynamicPromos[cleanCode]);
      showToast(`Áp dụng mã ${cleanCode} thành công!`, 'success');
      return true;
    } else {
      showToast('Mã giảm giá không hợp lệ!', 'error');
      return false;
    }
  };

  const removePromoCode = () => {
    if (appliedPromo) {
      showToast(`Đã hủy áp dụng mã ${appliedPromo.code}.`, 'info');
      setAppliedPromo(null);
    }
  };

  const addDynamicPromoCode = (code: string, type: 'percent' | 'fixed', value: number, description: string) => {
    const cleanCode = code.trim().toUpperCase();
    setDynamicPromos((prev) => {
      const updated = {
        ...prev,
        [cleanCode]: {
          code: cleanCode,
          type,
          value,
          description,
        },
      };
      return updated;
    });
  };

  const deleteDynamicPromoCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    setDynamicPromos((prev) => {
      const updated = { ...prev };
      delete updated[cleanCode];
      return updated;
    });
    showToast(`Đã xóa mã giảm giá ${cleanCode}.`, 'info');
  };

  // Wishlist Actions
  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        showToast(`Đã xóa "${product.name}" khỏi danh sách yêu thích.`, 'info');
        return prev.filter((p) => p.id !== product.id);
      } else {
        showToast(`Đã thêm "${product.name}" vào danh sách yêu thích!`, 'success');
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  // Calculations
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const wishlistCount = useMemo(() => {
    return wishlist.length;
  }, [wishlist]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartShipping = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    
    // Automatic Freeship for Gold, Platinum, Diamond
    if (currentUser && currentUser.role === 'customer') {
      const tier = getCustomerTier(currentUser.totalSpent || 0);
      if (tier === 'gold' || tier === 'platinum' || tier === 'diamond') {
        return 0;
      }
    }
    
    if (cartSubtotal >= 500000) return 0;
    if (appliedPromo?.code === 'FREESHIP') return 0;
    return 30000;
  }, [cartSubtotal, appliedPromo, currentUser]);

  const memberDiscount = useMemo(() => {
    if (currentUser && currentUser.role === 'customer') {
      const tier = getCustomerTier(currentUser.totalSpent || 0);
      const benefit = TIER_BENEFITS[tier];
      if (benefit.discountPercent > 0) {
        return Math.round((cartSubtotal * benefit.discountPercent) / 100);
      }
    }
    return 0;
  }, [cartSubtotal, currentUser]);

  const cartDiscount = useMemo(() => {
    let promoDiscount = 0;
    if (appliedPromo?.type === 'percent') {
      promoDiscount = Math.round((cartSubtotal * appliedPromo.value) / 100);
    } else if (appliedPromo?.code === 'FREESHIP') {
      promoDiscount = 30000;
    }
    
    return memberDiscount + promoDiscount;
  }, [cartSubtotal, appliedPromo, memberDiscount]);

  const cartTotal = useMemo(() => {
    const activeDiscount = appliedPromo?.code === 'FREESHIP' ? memberDiscount : cartDiscount;
    const total = cartSubtotal - activeDiscount + cartShipping;
    return Math.max(0, total);
  }, [cartSubtotal, cartDiscount, cartShipping, appliedPromo, memberDiscount]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        cartDiscount: appliedPromo?.code === 'FREESHIP' ? 30000 : cartDiscount,
        memberDiscount,
        cartShipping,
        cartTotal,
        appliedPromo,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyPromoCode,
        removePromoCode,
        dynamicPromos,
        addDynamicPromoCode,
        deleteDynamicPromoCode,
        
        // Wishlist Values
        wishlist,
        wishlistCount,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
