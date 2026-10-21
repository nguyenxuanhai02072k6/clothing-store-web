'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Search,
  Trash2,
  Check,
  UserCheck,
  Clock,
  PlusCircle,
  CheckCircle2,
  X,
  QrCode,
  MapPin,
  AlertTriangle,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Smartphone,
  AlertCircle,
  FileText,
  DollarSign,
  Box,
  Plus,
  Printer,
  Zap,
  CreditCard,
  Percent,
  Receipt,
  User,
  History,
  Send,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../../../lib/utils';
import { updateCRMClientLoyaltyAction } from '../../../lib/actions/erpActions';
import { VoucherQrScannerModal } from '../../common/VoucherQrScannerModal';
import { extractVoucherCodeFromQR } from '../../../lib/voucherQr';

export interface CartItem {
  id: string;
  product: any;
  size: string;
  color: string;
  quantity: number;
  price: number;
  sku: string;
}

export interface CartTab {
  id: string;
  name: string;
  items: CartItem[];
  customerPhone: string;
  selectedCustomer: any | null;
  paymentMethod: 'cash' | 'transfer' | 'wallet';
  promoCode: string;
  cashTendered: number;
  createdAt: number;
}

export interface MultiCartPOSProps {
  currentUser: any;
  productsList: any[];
  branchStock: Record<string, Record<string, number>>;
  crmClients?: any[];
  setCrmClients?: any;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onSwitchToTransferTab?: () => void;
  restockBranchProduct?: (productId: string, branchName: string, quantity: number) => void;
  posHistory: any[];
  setPosHistory?: any;
}

const CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'Tops', name: 'Áo' },
  { id: 'Bottoms', name: 'Quần' },
  { id: 'Dresses', name: 'Đầm' },
  { id: 'Outerwear', name: 'Áo khoác' }
];

const categoryLabel: Record<string, string> = {
  Tops: 'Áo thiết kế',
  Bottoms: 'Quần & Chân váy',
  Dresses: 'Đầm thanh lịch',
  Outerwear: 'Áo khoác blazer'
};

const CROSS_SELL_ITEMS = [
  { id: 'cross-socks', name: 'Vớ Cotton Khử Mùi', price: 49000, sku: 'ACC-SOCK-01' },
  { id: 'cross-spray', name: 'Xịt Thơm Vải Novyn', price: 129000, sku: 'CARE-SPR-01' },
  { id: 'cross-scarf', name: 'Khăn Lụa Vuông Tơ', price: 189000, sku: 'ACC-SCRF-01' }
];

export default function MultiCartPOS({
  currentUser,
  productsList,
  branchStock,
  crmClients = [],
  setCrmClients,
  showToast,
  onSwitchToTransferTab,
  restockBranchProduct,
  posHistory,
  setPosHistory
}: MultiCartPOSProps) {
  // --- MULTI-CART STATE (Up to 5 concurrent tabs) ---
  const [cartTabs, setCartTabs] = useState<CartTab[]>([
    {
      id: 'tab-1',
      name: 'Đơn 1',
      items: [],
      customerPhone: '',
      selectedCustomer: null,
      paymentMethod: 'cash',
      promoCode: '',
      cashTendered: 0,
      createdAt: Date.now()
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // Input Refs for Hotkeys
  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const customerInputRef = useRef<HTMLInputElement>(null);
  const promoInputRef = useRef<HTMLInputElement>(null);
  const cashInputRef = useRef<HTMLInputElement>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeScan, setBarcodeScan] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals
  const [showProformaModal, setShowProformaModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showVoucherScanner, setShowVoucherScanner] = useState(false);
  const [printedReceipt, setPrintedReceipt] = useState<any | null>(null);
  const [receiptMail, setReceiptMail] = useState('');
  const [showHotkeysGuide, setShowHotkeysGuide] = useState(false);

  // Active Cart Tab Helper
  const activeTab = cartTabs.find(t => t.id === activeTabId) || cartTabs[0];

  // Helper to update active cart tab properties
  const updateActiveTab = useCallback((updater: Partial<CartTab> | ((prev: CartTab) => CartTab)) => {
    setCartTabs(prevTabs =>
      prevTabs.map(t => {
        if (t.id !== activeTabId) return t;
        if (typeof updater === 'function') {
          return updater(t);
        }
        return { ...t, ...updater };
      })
    );
  }, [activeTabId]);

  // Tab calculations
  const subtotal = activeTab.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const vipDiscountPercent = activeTab.selectedCustomer
    ? activeTab.selectedCustomer.tier === 'VVIP' ? 0.20
    : activeTab.selectedCustomer.tier === 'Platinum' ? 0.15
    : activeTab.selectedCustomer.tier === 'Gold' ? 0.10
    : 0.05
    : 0;

  const vipDiscountAmt = Math.round(subtotal * vipDiscountPercent);

  // Dynamic Voucher / Coupon Discount Calculation
  const getPromoDiscount = (code: string, subtotalAfterVip: number): { discount: number; desc: string; isValid: boolean } => {
    if (!code) return { discount: 0, desc: '', isValid: false };
    const clean = code.trim().toUpperCase();

    // Check dynamic promos from localStorage
    let dynamicMap: Record<string, any> = {};
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('novyn_dynamic_promos');
        if (raw) dynamicMap = JSON.parse(raw);
      } catch {}
    }

    if (dynamicMap[clean]) {
      const p = dynamicMap[clean];
      const discount = p.type === 'percent'
        ? Math.round((subtotalAfterVip * p.value) / 100)
        : Math.min(p.value, subtotalAfterVip);
      return { discount, desc: p.description || '', isValid: true };
    }

    // Predefined voucher catalog
    const KNOWN_PROMOS: Record<string, { type: 'percent' | 'fixed'; value: number; minOrder?: number; desc: string }> = {
      SALE10: { type: 'percent', value: 10, desc: 'Giảm 10% tổng đơn' },
      SALE12: { type: 'percent', value: 12, desc: 'Giảm 12% tổng đơn' },
      SALE15: { type: 'percent', value: 15, desc: 'Giảm 15% tổng đơn' },
      SALE20: { type: 'percent', value: 20, desc: 'Jackpot Giảm 20%' },
      FREESHIP: { type: 'fixed', value: 30000, desc: 'Trừ 30.000 ₫' },
      LUCKYSHIP: { type: 'fixed', value: 30000, desc: 'Trừ 30.000 ₫' },
      LUCKYSHIP2: { type: 'fixed', value: 30000, desc: 'Trừ 30.000 ₫' },
      NOVYN50K: { type: 'fixed', value: 50000, desc: 'Giảm trực tiếp 50.000 ₫' },
      VIP50K: { type: 'fixed', value: 50000, desc: 'Giảm trực tiếp 50.000 ₫' },
      NOVYNVIP50: { type: 'fixed', value: 50000, desc: 'Voucher VIP 50.000 ₫' },
      NOVYNVIP100: { type: 'fixed', value: 100000, desc: 'Voucher VIP 100.000 ₫' },
      NOVYNVIP200: { type: 'fixed', value: 200000, desc: 'Voucher VIP 200.000 ₫' },
      XUAN2026: { type: 'fixed', value: 50000, minOrder: 500000, desc: 'Giảm 50.000 ₫ cho đơn từ 500.000 ₫' },
    };

    if (KNOWN_PROMOS[clean]) {
      const p = KNOWN_PROMOS[clean];
      if (p.minOrder && subtotalAfterVip < p.minOrder) {
        return { discount: 0, desc: `Đơn tối thiểu ${p.minOrder.toLocaleString('vi-VN')} ₫`, isValid: false };
      }
      const discount = p.type === 'percent'
        ? Math.round((subtotalAfterVip * p.value) / 100)
        : Math.min(p.value, subtotalAfterVip);
      return { discount, desc: p.desc, isValid: true };
    }

    return { discount: 0, desc: 'Mã không tồn tại', isValid: false };
  };

  const promoCheck = getPromoDiscount(activeTab.promoCode, subtotal - vipDiscountAmt);
  const promoDiscountAmt = promoCheck.discount;

  const finalTotal = Math.max(0, subtotal - vipDiscountAmt - promoDiscountAmt);

  // Cash change calculation
  const cashTendered = activeTab.cashTendered || 0;
  const changeDue = Math.max(0, cashTendered - finalTotal);

  // Add new tab (max 5)
  const handleAddNewTab = () => {
    if (cartTabs.length >= 5) {
      showToast('Đã đạt giới hạn tối đa 5 đơn tạm thời cùng lúc!', 'info');
      return;
    }
    const nextNumber = cartTabs.length + 1;
    const newId = `tab-${Date.now()}`;
    const newTab: CartTab = {
      id: newId,
      name: `Đơn ${nextNumber}`,
      items: [],
      customerPhone: '',
      selectedCustomer: null,
      paymentMethod: 'cash',
      promoCode: '',
      cashTendered: 0,
      createdAt: Date.now()
    };
    setCartTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    showToast(`✓ Đã tạo đơn mới [Đơn ${nextNumber}]`, 'info');
  };

  // Close tab
  const handleCloseTab = (tabIdToClose: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (cartTabs.length === 1) {
      // Clear instead of close
      updateActiveTab({
        items: [],
        customerPhone: '',
        selectedCustomer: null,
        promoCode: '',
        cashTendered: 0
      });
      showToast('Đã xóa trắng giỏ hàng hiện tại', 'info');
      return;
    }
    const tabToClose = cartTabs.find(t => t.id === tabIdToClose);
    if (tabToClose && tabToClose.items.length > 0) {
      if (!confirm(`Đơn "${tabToClose.name}" đang có ${tabToClose.items.length} món. Bạn có chắc muốn hủy đơn này?`)) {
        return;
      }
    }
    const remaining = cartTabs.filter(t => t.id !== tabIdToClose);
    setCartTabs(remaining);
    if (activeTabId === tabIdToClose) {
      setActiveTabId(remaining[0].id);
    }
  };

  // Add item to active cart
  const handleAddToCart = (product: any, size: string, color: string) => {
    const branchName = currentUser?.branch || 'Chi nhánh Quận 1';
    const availableStock = branchStock?.[product.id]?.[branchName] ?? 10;
    
    if (availableStock <= 0) {
      showToast(`Sản phẩm "${product.name}" đã hết hàng tại ${branchName}!`, 'error');
      return;
    }

    const sku = `${product.id.slice(0, 4).toUpperCase()}-${size}-${color.slice(0, 3).toUpperCase()}`;
    const existingIndex = activeTab.items.findIndex(
      i => i.product.id === product.id && i.size === size && i.color === color
    );

    if (existingIndex > -1) {
      const currentQty = activeTab.items[existingIndex].quantity;
      if (currentQty + 1 > availableStock) {
        showToast(`Không đủ số lượng trong kho quầy (${availableStock} chiếc)!`, 'error');
        return;
      }
      const newItems = [...activeTab.items];
      newItems[existingIndex].quantity += 1;
      updateActiveTab({ items: newItems });
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${size}-${color}-${Date.now()}`,
        product,
        size,
        color,
        quantity: 1,
        price: product.price,
        sku
      };
      updateActiveTab({ items: [...activeTab.items, newItem] });
    }
    showToast(`✓ Đã thêm ${product.name} (${size}) vào ${activeTab.name}`, 'success');
  };

  // Change quantity
  const handleUpdateQuantity = (itemId: string, delta: number) => {
    const branchName = currentUser?.branch || 'Chi nhánh Quận 1';
    const newItems = activeTab.items
      .map(item => {
        if (item.id === itemId) {
          const maxStock = branchStock?.[item.product.id]?.[branchName] ?? 99;
          const nextQty = item.quantity + delta;
          if (nextQty > maxStock) {
            showToast(`Vượt quá tồn kho quầy (${maxStock} chiếc)!`, 'error');
            return item;
          }
          return { ...item, quantity: nextQty };
        }
        return item;
      })
      .filter(item => item.quantity > 0);

    updateActiveTab({ items: newItems });
  };

  // Barcode & QR Code Scan Handler (Supports both Product Barcodes and Voucher QR codes)
  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeScan.trim()) return;

    // 1. Check if the scanned string is a Voucher QR code
    const voucherCandidate = extractVoucherCodeFromQR(barcodeScan);
    const promoCandidateCheck = getPromoDiscount(voucherCandidate, subtotal - vipDiscountAmt);
    if (
      promoCandidateCheck.isValid ||
      voucherCandidate.startsWith('SALE') ||
      voucherCandidate.startsWith('NOVYN') ||
      voucherCandidate.startsWith('VOUCHER') ||
      barcodeScan.includes('voucher=') ||
      barcodeScan.includes('promo=')
    ) {
      updateActiveTab({ promoCode: voucherCandidate });
      if (promoCandidateCheck.isValid) {
        showToast(`✓ Đã quét mã QR Voucher: ${voucherCandidate} (${promoCandidateCheck.desc})`, 'success');
      } else {
        showToast(`Đã nhận mã Voucher: ${voucherCandidate}`, 'info');
      }
      setBarcodeScan('');
      return;
    }

    const cleanScan = barcodeScan.trim().toLowerCase();

    // 2. Check SKU or name match for products
    const foundProduct = productsList.find(p =>
      p.id.toLowerCase().includes(cleanScan) ||
      p.name.toLowerCase().includes(cleanScan) ||
      cleanScan.includes(p.id.toLowerCase().slice(0, 4))
    );

    if (foundProduct) {
      handleAddToCart(foundProduct, 'M', foundProduct.colors?.[0]?.name || foundProduct.colors?.[0] || 'Beige');
      setBarcodeScan('');
    } else {
      showToast(`Không tìm thấy mã vạch / SKU: "${barcodeScan}"`, 'error');
    }
  };

  // Customer Lookup
  const handleCustomerLookup = () => {
    if (!activeTab.customerPhone.trim()) {
      showToast('Vui lòng nhập SĐT hoặc tên khách hàng!', 'info');
      return;
    }
    const query = activeTab.customerPhone.trim().toLowerCase();
    const found = crmClients.find(
      c => c.phone?.toLowerCase().includes(query) || c.name?.toLowerCase().includes(query)
    );

    if (found) {
      updateActiveTab({ selectedCustomer: found });
      showToast(`✓ Tìm thấy khách hàng VIP: ${found.name} (${found.tier})`, 'success');
    } else {
      // Mock new customer
      const newClient = {
        id: `CRM-${Date.now().toString().slice(-4)}`,
        name: `Khách ${activeTab.customerPhone.slice(-4)}`,
        phone: activeTab.customerPhone,
        tier: 'Member',
        totalSpent: 0,
        points: 0,
        ordersCount: 0
      };
      updateActiveTab({ selectedCustomer: newClient });
      showToast(`✓ Tạo mới khách lẻ: ${newClient.phone}`, 'info');
    }
  };

  // Fast Cash Tender Suggestions
  const getCashSuggestions = (total: number) => {
    if (total <= 0) return [];
    const suggestions: number[] = [total]; // Exact
    const round10k = Math.ceil(total / 10000) * 10000;
    const round50k = Math.ceil(total / 50000) * 50000;
    const round100k = Math.ceil(total / 100000) * 100000;
    const round500k = Math.ceil(total / 500000) * 500000;

    [round10k, round50k, round100k, round500k].forEach(val => {
      if (val > total && !suggestions.includes(val)) {
        suggestions.push(val);
      }
    });

    return suggestions.slice(0, 4);
  };

  // Checkout Handler
  const handleCheckout = () => {
    if (activeTab.items.length === 0) {
      showToast('Giỏ hàng POS đang trống!', 'error');
      return;
    }

    const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
    const transactionDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const branchName = currentUser?.branch || 'Chi nhánh Quận 1';

    const newInvoice = {
      id: invoiceId,
      cashierName: currentUser?.name || 'Thu ngân POS',
      cashierEmail: currentUser?.email || 'cashier@novyn.vn',
      items: activeTab.items.map(i => ({
        productName: i.product.name,
        sku: i.sku,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        price: i.price
      })),
      subtotal,
      vipDiscount: vipDiscountAmt,
      promoDiscount: promoDiscountAmt,
      total: finalTotal,
      cashTendered: activeTab.paymentMethod === 'cash' ? cashTendered : finalTotal,
      changeDue: activeTab.paymentMethod === 'cash' ? changeDue : 0,
      paymentMethod: activeTab.paymentMethod,
      customerName: activeTab.selectedCustomer?.name || 'Khách vãng lai',
      customerPhone: activeTab.selectedCustomer?.phone || activeTab.customerPhone || 'N/A',
      customerTier: activeTab.selectedCustomer?.tier || 'Member',
      date: transactionDate,
      branch: branchName
    };

    // Save POS History
    const updatedHistory = [newInvoice, ...posHistory];
    setPosHistory(updatedHistory);
    try {
      localStorage.setItem('novyn_pos_history', JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn('Storage quota warning:', e);
    }

    // VIP Loyalty update
    if (activeTab.selectedCustomer && setCrmClients) {
      setCrmClients((prev: any[]) => {
        const updated = (prev || []).map((c: any) => {
          if (c.id === activeTab.selectedCustomer.id) {
            const newSpent = (c.totalSpent || 0) + finalTotal;
            const newPoints = Math.floor(newSpent / 100000);
            let newTier = c.tier;
            if (newSpent >= 50000000) newTier = 'VVIP';
            else if (newSpent >= 30000000) newTier = 'Platinum';
            else if (newSpent >= 10000000) newTier = 'Gold';
            return { ...c, totalSpent: newSpent, points: newPoints, tier: newTier, ordersCount: (c.ordersCount || 0) + 1 };
          }
          return c;
        });
        localStorage.setItem('novyn_crm_clients', JSON.stringify(updated));
        return updated;
      });

      updateCRMClientLoyaltyAction(activeTab.selectedCustomer.id, finalTotal).catch(err => {
        console.error('Error persisting CRM loyalty:', err);
      });
    }

    // Show thermal receipt
    setPrintedReceipt(newInvoice);
    showToast(`✓ Chốt đơn ${invoiceId} thành công! [F10 để in lại]`, 'success');

    // Reset current tab or close it if multiple
    if (cartTabs.length > 1) {
      const remaining = cartTabs.filter(t => t.id !== activeTabId);
      setCartTabs(remaining);
      setActiveTabId(remaining[0].id);
    } else {
      updateActiveTab({
        items: [],
        customerPhone: '',
        selectedCustomer: null,
        promoCode: '',
        cashTendered: 0
      });
    }
  };

  // Hotkeys Listener (F1 - F10, Ctrl+1..5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in general text inputs, except function keys
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Function keys
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
        showToast('🔍 [F1] Tìm sản phẩm / Quét mã', 'info');
      } else if (e.key === 'F2') {
        e.preventDefault();
        customerInputRef.current?.focus();
        showToast('👤 [F2] Tìm khách hàng thân thiết', 'info');
      } else if (e.key === 'F3') {
        e.preventDefault();
        promoInputRef.current?.focus();
        showToast('🏷️ [F3] Nhập mã giảm giá / Voucher', 'info');
      } else if (e.key === 'F9') {
        e.preventDefault();
        if (activeTab.items.length > 0) {
          handleCheckout();
        } else {
          showToast('Giỏ hàng đang trống, không thể thanh toán!', 'error');
        }
      } else if (e.key === 'F10') {
        e.preventDefault();
        if (posHistory.length > 0) {
          setPrintedReceipt(posHistory[0]);
          showToast('🖨️ [F10] Mở lại hóa đơn gần nhất', 'info');
        } else {
          showToast('Chưa có lịch sử hóa đơn nào!', 'info');
        }
      }

      // Ctrl + 1..5 switch tab
      if ((e.ctrlKey || e.metaKey) && ['1', '2', '3', '4', '5'].includes(e.key)) {
        const tabIndex = parseInt(e.key, 10) - 1;
        if (cartTabs[tabIndex]) {
          e.preventDefault();
          setActiveTabId(cartTabs[tabIndex].id);
          showToast(`⚡ Chuyển sang ${cartTabs[tabIndex].name}`, 'info');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, cartTabs, posHistory, finalTotal]);

  return (
    <div className="space-y-4">
      {/* Top Banner: Shift Info, Hotkey Summary & Multi-Cart Tabs */}
      <div className="bg-white border rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-neutral-900 tracking-tight uppercase">
                  Quầy Thu Ngân Bán Lẻ POS 2.0
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Online
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Thu ngân: <span className="font-bold text-neutral-800">{currentUser?.name || 'Nhân viên'}</span> • Chi nhánh:{' '}
                <span className="font-bold text-neutral-800">{currentUser?.branch || 'Chi nhánh Quận 1'}</span>
              </p>
            </div>
          </div>

          {/* Hotkey Helper Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setShowHotkeysGuide(true)}
              className="px-2.5 py-1 text-[10px] font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Phím tắt</span>
            </button>
            <span className="px-2 py-1 text-[9px] font-mono font-bold bg-neutral-50 text-neutral-500 rounded border border-neutral-200">
              <kbd className="font-sans font-black text-neutral-800">F1</kbd> Tìm SP
            </span>
            <span className="px-2 py-1 text-[9px] font-mono font-bold bg-neutral-50 text-neutral-500 rounded border border-neutral-200">
              <kbd className="font-sans font-black text-neutral-800">F2</kbd> Khách
            </span>
            <span className="px-2 py-1 text-[9px] font-mono font-bold bg-neutral-50 text-neutral-500 rounded border border-neutral-200">
              <kbd className="font-sans font-black text-neutral-800">F3</kbd> Voucher
            </span>
            <span className="px-2 py-1 text-[9px] font-mono font-bold bg-rose-50 text-rose-700 rounded border border-rose-200">
              <kbd className="font-sans font-black text-rose-900">F9</kbd> Thanh toán
            </span>
            <span className="px-2 py-1 text-[9px] font-mono font-bold bg-neutral-50 text-neutral-500 rounded border border-neutral-200">
              <kbd className="font-sans font-black text-neutral-800">F10</kbd> In lại bill
            </span>
          </div>
        </div>

        {/* MULTI-CART HOLD TABS */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-150 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            {cartTabs.map((tab, idx) => {
              const isActive = tab.id === activeTabId;
              const itemCount = tab.items.reduce((sum, i) => sum + i.quantity, 0);

              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none border ${
                    isActive
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200'
                  }`}
                >
                  <span className="font-mono text-[10px] text-neutral-400 group-hover:text-neutral-500">
                    Ctrl+{idx + 1}
                  </span>
                  <span>{tab.name}</span>
                  {itemCount > 0 && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-rose-500 text-white' : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {itemCount}
                    </span>
                  )}
                  {/* Close Tab Button */}
                  <button
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className={`p-0.5 rounded-md hover:bg-white/20 transition-colors ${
                      isActive ? 'text-white/70 hover:text-white' : 'text-neutral-400 hover:text-neutral-700'
                    }`}
                    title="Đóng đơn"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* New Tab Button */}
          {cartTabs.length < 5 && (
            <button
              onClick={handleAddNewTab}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-neutral-50 text-neutral-700 border border-dashed border-neutral-300 hover:border-neutral-400 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              title="Mở thêm đơn tạm mới"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-500" />
              <span>Thêm đơn ({cartTabs.length}/5)</span>
            </button>
          )}

          {/* Re-print last bill quick action */}
          {posHistory.length > 0 && (
            <button
              onClick={() => setPrintedReceipt(posHistory[0])}
              className="ml-auto px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              title="In lại hóa đơn gần nhất [F10]"
            >
              <History className="w-3.5 h-3.5 text-neutral-500" />
              <span>Bill gần nhất ({posHistory[0]?.id})</span>
            </button>
          )}
        </div>
      </div>

      {/* MAIN SPLIT-SCREEN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: PRODUCT CATALOG & BARCODE SCANNER (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search bar & Barcode Scanner Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            {/* Search Input [F1] */}
            <div className="sm:col-span-7 relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm sản phẩm theo tên, SKU... [F1]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-xs bg-white focus:outline-none focus:border-rose-500 text-neutral-800 shadow-xs placeholder-neutral-400"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Barcode Scanner */}
            <form onSubmit={handleBarcodeScan} className="sm:col-span-5 flex gap-1.5">
              <div className="relative flex-1">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Quét mã Barcode..."
                  value={barcodeScan}
                  onChange={(e) => setBarcodeScan(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-xl text-xs bg-white text-neutral-800 font-mono tracking-wider focus:outline-none focus:border-rose-500 shadow-xs placeholder-neutral-400"
                />
              </div>
              <button
                type="submit"
                className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                Quét
              </button>
            </form>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar select-none pb-0.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wide uppercase transition-all border cursor-pointer active:scale-95 whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
            {productsList
              .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
              .map(prod => {
                const branchName = currentUser?.branch || 'Chi nhánh Quận 1';
                const stock = branchStock?.[prod.id]?.[branchName] ?? 10;

                return (
                  <div
                    key={prod.id}
                    className="bg-white border border-neutral-200 rounded-2xl p-3 flex gap-3 shadow-xs hover:border-neutral-400 transition-all hover:shadow-sm group"
                  >
                    <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-150">
                      <Image
                        src={prod.images[0]}
                        alt={prod.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs font-bold text-neutral-900 truncate flex-1" title={prod.name}>
                            {prod.name}
                          </h4>
                          {stock === 0 ? (
                            <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0">
                              Hết hàng
                            </span>
                          ) : stock < 5 ? (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0">
                              Còn {stock}
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-bold px-1.5 py-0.5 rounded-md shrink-0">
                              Kho: {stock}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          {categoryLabel[prod.category] || prod.category}
                        </span>
                        <span className="text-xs font-black text-rose-600 font-mono block mt-1">
                          {formatPrice(prod.price)}
                        </span>
                      </div>

                      {/* Quick Variant Size Buttons */}
                      <div className="flex gap-1 flex-wrap pt-1.5">
                        {['S', 'M', 'L', 'XL'].map(sz => (
                          <button
                            key={sz}
                            disabled={stock === 0}
                            onClick={() =>
                              handleAddToCart(
                                prod,
                                sz,
                                prod.colors?.[0]?.name || prod.colors?.[0] || 'Standard'
                              )
                            }
                            className="px-2 py-1 rounded-lg border border-neutral-200 text-[9px] font-black hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-neutral-400"
                          >
                            + {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CART & CHECKOUT TENDER (5 cols) */}
        <div className="lg:col-span-5 bg-white border rounded-2xl p-4 shadow-xs space-y-4 sticky top-4">
          {/* Header Cart Info */}
          <div className="flex justify-between items-center border-b pb-3">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-rose-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                {activeTab.name} • Giỏ hàng
              </h4>
              <span className="text-rose-600 font-mono text-[10px] font-bold">
                ({activeTab.items.reduce((sum, i) => sum + i.quantity, 0)} sp)
              </span>
            </div>

            {/* Clear Cart Button */}
            {activeTab.items.length > 0 && (
              <button
                onClick={() => updateActiveTab({ items: [] })}
                className="text-[10px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa trắng</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 border-b pb-3">
            {activeTab.items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2 stroke-1" />
                <p className="text-xs text-neutral-400 italic">Chưa có sản phẩm nào trong {activeTab.name}.</p>
                <p className="text-[10px] text-neutral-400 mt-1">Bấm nút kích cỡ bên trái hoặc quét mã barcode [F1]</p>
              </div>
            ) : (
              activeTab.items.map(item => (
                <div
                  key={item.id}
                  className="flex justify-between items-center gap-2 text-xs py-1.5 border-b border-neutral-100 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-neutral-900 block truncate">{item.product.name}</span>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className="text-[9px] bg-neutral-100 text-neutral-600 px-1 py-0.2 rounded font-mono font-bold">
                        {item.size}
                      </span>
                      <span className="text-[8.5px] text-neutral-400 font-mono">SKU: {item.sku}</span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="w-5 h-5 rounded bg-neutral-100 font-bold hover:bg-neutral-200 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-4 text-center font-bold font-mono">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="w-5 h-5 rounded bg-neutral-100 font-bold hover:bg-neutral-200 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-bold font-mono text-neutral-900 shrink-0 w-20 text-right">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Quick Cross-sell Add-on Bar */}
          <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                Gợi ý bán kèm tại quầy (Upsell)
              </span>
              <span className="text-[8px] font-bold text-neutral-500">+ AOV</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {CROSS_SELL_ITEMS.map(crossItem => (
                <button
                  key={crossItem.id}
                  type="button"
                  onClick={() => {
                    const existing = activeTab.items.find(i => i.product.id === crossItem.id);
                    if (existing) {
                      handleUpdateQuantity(existing.id, 1);
                    } else {
                      const newItem: CartItem = {
                        id: `${crossItem.id}-${Date.now()}`,
                        product: { id: crossItem.id, name: crossItem.name, price: crossItem.price, images: ['/brand/logo.png'] },
                        size: 'F',
                        color: 'Standard',
                        quantity: 1,
                        price: crossItem.price,
                        sku: crossItem.sku
                      };
                      updateActiveTab({ items: [...activeTab.items, newItem] });
                    }
                    showToast(`✓ Đã thêm ${crossItem.name} vào ${activeTab.name}`, 'success');
                  }}
                  className="p-1.5 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-left transition-all cursor-pointer shadow-xs"
                >
                  <span className="text-[9px] font-bold block truncate text-neutral-900">{crossItem.name}</span>
                  <span className="text-[8.5px] font-mono font-bold text-amber-800 block mt-0.5">
                    {formatPrice(crossItem.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Customer Loyalty Search [F2] */}
          <div className="space-y-1.5 border-b pb-3">
            <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block">
              Khách hàng thân thiết [F2]
            </label>
            <div className="flex gap-2">
              <input
                ref={customerInputRef}
                type="text"
                placeholder="Nhập SĐT hoặc tên khách..."
                value={activeTab.customerPhone}
                onChange={(e) => updateActiveTab({ customerPhone: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomerLookup()}
                className="flex-1 px-3 py-1.5 border rounded-lg text-xs bg-white text-neutral-800 focus:outline-none focus:border-rose-500 font-mono"
              />
              <button
                type="button"
                onClick={handleCustomerLookup}
                className="bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
              >
                Đồng bộ
              </button>
            </div>
            {activeTab.selectedCustomer && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-900">
                <div>
                  <span className="font-bold">💎 {activeTab.selectedCustomer.name}</span>
                  <span className="text-[9px] text-amber-700 block mt-0.5">
                    Hạng: <strong className="uppercase">{activeTab.selectedCustomer.tier}</strong> • Điểm:{' '}
                    <strong>{activeTab.selectedCustomer.points || 0}</strong>
                  </span>
                </div>
                <span className="font-mono font-black text-xs text-amber-800">
                  -{vipDiscountPercent * 100}%
                </span>
              </div>
            )}
          </div>

          {/* Promo Code Input [F3] with QR Scanner */}
          <div className="flex gap-2 border-b pb-3 items-center">
            <input
              ref={promoInputRef}
              type="text"
              placeholder="Mã voucher (SALE10, FREESHIP)... [F3]"
              value={activeTab.promoCode}
              onChange={(e) => updateActiveTab({ promoCode: e.target.value })}
              className="flex-1 px-3 py-1.5 border rounded-lg text-xs bg-white text-neutral-800 uppercase font-bold focus:outline-none focus:border-rose-500"
            />
            <button
              type="button"
              onClick={() => setShowVoucherScanner(true)}
              className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95 shadow-xs"
              title="Mở camera hoặc tải ảnh quét mã QR voucher"
            >
              <QrCode className="w-3.5 h-3.5 text-rose-400" />
              <span>Quét QR</span>
            </button>
            {activeTab.promoCode && (
              <span className={`text-[9px] font-black uppercase tracking-wide px-2 py-1.5 rounded-lg flex items-center shrink-0 border ${
                promoDiscountAmt > 0
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-neutral-100 text-neutral-500 border-neutral-200'
              }`}>
                {promoDiscountAmt > 0 ? `-${formatPrice(promoDiscountAmt)}` : 'Không hợp lệ'}
              </span>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Tổng tiền hàng</span>
              <span className="font-mono">{formatPrice(subtotal)}</span>
            </div>
            {vipDiscountAmt > 0 && (
              <div className="flex justify-between text-amber-700 font-semibold">
                <span>Ưu đãi VIP ({activeTab.selectedCustomer?.tier})</span>
                <span className="font-mono">-{formatPrice(vipDiscountAmt)}</span>
              </div>
            )}
            {promoDiscountAmt > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Voucher giảm giá</span>
                <span className="font-mono">-{formatPrice(promoDiscountAmt)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-neutral-900 border-t pt-2 mt-1 text-base">
              <span>Phải thanh toán:</span>
              <span className="font-mono text-rose-600">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block">
              Phương thức thanh toán
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'cash', label: '💵 Tiền mặt' },
                { key: 'transfer', label: '🏦 VietQR' },
                { key: 'wallet', label: '📱 Ví điện tử' }
              ].map(m => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => updateActiveTab({ paymentMethod: m.key as any })}
                  className={`py-2 rounded-xl text-[10px] font-bold transition-all border cursor-pointer ${
                    activeTab.paymentMethod === m.key
                      ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                      : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* CASH TENDER SECTION: QUICK DENOMINATION BUTTONS & CHANGE CALCULATION */}
          {activeTab.paymentMethod === 'cash' && finalTotal > 0 && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-neutral-700">Tiền khách đưa:</span>
                <div className="relative w-36">
                  <input
                    ref={cashInputRef}
                    type="number"
                    value={activeTab.cashTendered || ''}
                    onChange={(e) =>
                      updateActiveTab({ cashTendered: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Nhập số tiền..."
                    className="w-full px-2.5 py-1 text-right font-mono font-bold text-xs border rounded-lg bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              {/* Fast Denomination Buttons */}
              <div className="flex gap-1.5 flex-wrap">
                {getCashSuggestions(finalTotal).map((amt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateActiveTab({ cashTendered: amt })}
                    className="px-2 py-1 rounded-md text-[9px] font-bold font-mono bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 cursor-pointer active:scale-95 transition-all"
                  >
                    {idx === 0 ? 'Đúng tiền' : formatPrice(amt)}
                  </button>
                ))}
              </div>

              {/* Change due result */}
              <div className="flex justify-between items-center pt-1 border-t border-dashed border-neutral-200">
                <span className="text-xs font-bold text-neutral-700">Tiền thừa trả khách:</span>
                <span
                  className={`text-sm font-black font-mono px-2 py-0.5 rounded-lg ${
                    changeDue > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : cashTendered > 0 && cashTendered < finalTotal
                      ? 'bg-rose-100 text-rose-800'
                      : 'text-neutral-500'
                  }`}
                >
                  {cashTendered > 0 && cashTendered < finalTotal
                    ? `Thiếu ${formatPrice(finalTotal - cashTendered)}`
                    : formatPrice(changeDue)}
                </span>
              </div>
            </div>
          )}

          {/* DYNAMIC VIETQR PREVIEW IF BANK TRANSFER */}
          {activeTab.paymentMethod === 'transfer' && finalTotal > 0 && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
              <div className="relative w-32 h-32 border-2 border-dashed border-rose-300 rounded-xl overflow-hidden bg-white p-1 shadow-inner">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://qr.vietqr.co/NOVYN-STUDIO-RECONCILIATION-AMOUNT-${finalTotal}`}
                  alt="VietQR Chuyển khoản"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="text-center">
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">
                  VietQR động hiển thị màn hình phụ
                </span>
                <span className="text-xs font-bold text-rose-600 font-mono">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          )}

          {/* Action CTAs: Pro-forma & Final Checkout [F9] */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => setShowProformaModal(true)}
              disabled={activeTab.items.length === 0}
              className="w-full py-2 rounded-xl border border-neutral-300 hover:border-neutral-900 text-neutral-700 font-bold uppercase text-[10px] tracking-wider transition-all disabled:opacity-40 hover:bg-neutral-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-600" />
              In Phiếu Tạm Tính
            </button>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={activeTab.items.length === 0}
              className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase text-xs tracking-wider transition-all disabled:opacity-40 shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Chốt đơn & In hóa đơn lẻ [F9]</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRO-FORMA BILL MODAL */}
      <AnimatePresence>
        {showProformaModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border shadow-xl p-6 w-full max-w-sm text-neutral-800"
            >
              <div className="border-b-2 border-dashed pb-3 text-center space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                  Phiếu Tạm Tính (Chưa thanh toán)
                </span>
                <h2 className="text-base font-black tracking-widest text-neutral-900 uppercase mt-1">
                  NOVYN WEAR
                </h2>
                <p className="text-[10px] text-neutral-500">Đối chiếu hàng hóa tại quầy</p>
                <p className="text-[9px] font-mono text-neutral-400">
                  {currentUser?.branch || 'Chi nhánh Quận 1'} • {new Date().toLocaleString('vi-VN')}
                </p>
              </div>

              <div className="py-3 border-b-2 border-dashed space-y-2 text-xs max-h-56 overflow-y-auto">
                {activeTab.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-neutral-900 block truncate">{item.product.name}</span>
                      <span className="text-[9px] text-neutral-400 font-mono">
                        Size {item.size} • SKU: {item.sku}
                      </span>
                    </div>
                    <span className="font-mono text-neutral-500 shrink-0">{item.quantity} x</span>
                    <span className="font-bold font-mono text-neutral-900 shrink-0 text-right w-20">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="py-3 border-b-2 border-dashed space-y-1 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Cộng tiền hàng</span>
                  <span className="font-mono">{formatPrice(subtotal)}</span>
                </div>
                {vipDiscountAmt > 0 && (
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>Chiết khấu VIP</span>
                    <span className="font-mono">-{formatPrice(vipDiscountAmt)}</span>
                  </div>
                )}
                {promoDiscountAmt > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Voucher ({activeTab.promoCode})</span>
                    <span className="font-mono">-{formatPrice(promoDiscountAmt)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-neutral-900 text-sm pt-1">
                  <span>TỔNG TẠM TÍNH</span>
                  <span className="font-mono text-rose-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    showToast('✓ Đã gửi lệnh in phiếu tạm tính ra máy in nhiệt K80!', 'success');
                    setShowProformaModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In phiếu
                </button>
                <button
                  type="button"
                  onClick={() => setShowProformaModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs font-bold transition-all cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FINAL THERMAL RECEIPT PRINT MODAL (K80 / K58 Styled) */}
      <AnimatePresence>
        {printedReceipt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border shadow-2xl p-6 w-full max-w-sm overflow-hidden text-neutral-800"
            >
              {/* K80 Thermal Receipt Body */}
              <div className="border-b-2 border-dashed pb-3 text-center space-y-1">
                <h2 className="text-lg font-black tracking-widest text-neutral-900 uppercase">
                  NOVYN WEAR
                </h2>
                <p className="text-[10px] text-neutral-500 font-medium">Quiet Luxury Minimalist Apparel</p>
                <p className="text-[9px] font-mono text-neutral-400 mt-1">{printedReceipt.branch}</p>
                <p className="text-[8px] text-neutral-400 font-mono">
                  HĐ: {printedReceipt.id} • {printedReceipt.date}
                </p>
              </div>

              <div className="py-3 border-b-2 border-dashed space-y-2 text-xs max-h-52 overflow-y-auto">
                {printedReceipt.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start font-medium">
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-neutral-900 block truncate">{item.productName}</span>
                      <span className="text-[9px] text-neutral-400 font-mono">
                        Size {item.size} • SKU: {item.sku}
                      </span>
                    </div>
                    <span className="font-mono text-neutral-500 shrink-0">{item.quantity} x</span>
                    <span className="font-bold font-mono text-neutral-900 shrink-0 text-right w-20">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="py-3 border-b-2 border-dashed space-y-1 text-xs">
                <div className="flex justify-between font-medium text-neutral-600">
                  <span>Cộng tiền hàng</span>
                  <span className="font-mono">{formatPrice(printedReceipt.subtotal)}</span>
                </div>
                {printedReceipt.vipDiscount > 0 && (
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>Chiết khấu VIP</span>
                    <span className="font-mono">-{formatPrice(printedReceipt.vipDiscount)}</span>
                  </div>
                )}
                {printedReceipt.promoDiscount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Giảm giá Voucher</span>
                    <span className="font-mono">-{formatPrice(printedReceipt.promoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-neutral-900 text-sm pt-1.5 border-t">
                  <span>TỔNG THANH TOÁN</span>
                  <span className="font-mono text-rose-600">{formatPrice(printedReceipt.total)}</span>
                </div>
                {printedReceipt.paymentMethod === 'cash' && (
                  <div className="pt-1 text-[11px] space-y-0.5 text-neutral-500">
                    <div className="flex justify-between">
                      <span>Tiền khách đưa:</span>
                      <span className="font-mono font-bold">{formatPrice(printedReceipt.cashTendered)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-700">
                      <span>Tiền thừa trả:</span>
                      <span className="font-mono">{formatPrice(printedReceipt.changeDue)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="py-3 text-center text-[10px] text-neutral-500 font-medium space-y-0.5">
                <p>
                  Hình thức: <span className="font-bold uppercase text-neutral-800">{printedReceipt.paymentMethod}</span>
                </p>
                <p>
                  Khách hàng: <span className="font-bold text-neutral-800">{printedReceipt.customerName}</span> (
                  {printedReceipt.customerPhone})
                </p>
                <p>
                  Thu ngân: <span className="font-bold text-neutral-800">{printedReceipt.cashierName}</span>
                </p>
                <p className="mt-2 text-[8.5px] italic text-neutral-400">
                  * Đổi hàng trong 7 ngày kèm hóa đơn còn nguyên mác *
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      window.print();
                      showToast('✓ Đang in hóa đơn nhiệt K80...', 'success');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    In hóa đơn
                  </button>
                  <button
                    onClick={() => {
                      showToast('✓ Đã tải file PDF hóa đơn điện tử!', 'success');
                    }}
                    className="px-3 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    title="Tải PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Email E-Bill */}
                <div className="flex gap-1.5">
                  <input
                    type="email"
                    placeholder="Nhập email khách để gửi E-Bill..."
                    value={receiptMail}
                    onChange={(e) => setReceiptMail(e.target.value)}
                    className="flex-1 px-3 py-1.5 border rounded-xl text-xs bg-white text-neutral-800 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (!receiptMail.trim()) return;
                      showToast(`✓ Đã gửi hóa đơn điện tử tới ${receiptMail}!`, 'success');
                      setReceiptMail('');
                    }}
                    className="bg-neutral-950 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl hover:bg-neutral-800 cursor-pointer"
                  >
                    Gửi
                  </button>
                </div>

                <button
                  onClick={() => setPrintedReceipt(null)}
                  className="w-full py-2 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer mt-1"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HOTKEYS CHEATSHEET MODAL */}
      <AnimatePresence>
        {showHotkeysGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border shadow-xl p-6 w-full max-w-md text-neutral-800 space-y-4"
            >
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-rose-500" />
                  Bảng Phím Tắt Quầy POS (KiotViet / Sapo Standard)
                </h3>
                <button
                  onClick={() => setShowHotkeysGuide(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { key: 'F1', desc: 'Đưa con trỏ vào ô Tìm kiếm sản phẩm hoặc ô Barcode' },
                  { key: 'F2', desc: 'Đưa con trỏ vào ô Tìm kiếm Khách hàng VIP Loyalty' },
                  { key: 'F3', desc: 'Đưa con trỏ vào ô Nhập mã giảm giá / Voucher' },
                  { key: 'F9', desc: 'Thực hiện Chốt đơn và in hóa đơn thanh toán tức thì' },
                  { key: 'F10', desc: 'Mở lại và in hóa đơn khách hàng gần nhất' },
                  { key: 'Ctrl + 1..5', desc: 'Chuyển đổi tức thì giữa tối đa 5 đơn hàng tạm thời (Cart Hold)' },
                  { key: 'Esc', desc: 'Đóng hộp thoại / Hủy cửa sổ in bill' }
                ].map(hk => (
                  <div key={hk.key} className="flex items-center justify-between py-1 border-b border-neutral-100">
                    <kbd className="px-2.5 py-1 rounded-md bg-neutral-900 text-white font-mono font-bold text-[10px]">
                      {hk.key}
                    </kbd>
                    <span className="text-neutral-600 text-right">{hk.desc}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowHotkeysGuide(false)}
                className="w-full py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 cursor-pointer"
              >
                Đã hiểu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POS Voucher QR Scanner Modal */}
      <VoucherQrScannerModal
        isOpen={showVoucherScanner}
        onClose={() => setShowVoucherScanner(false)}
        onScanSuccess={(code) => {
          updateActiveTab({ promoCode: code });
          const chk = getPromoDiscount(code, subtotal - vipDiscountAmt);
          if (chk.isValid) {
            showToast(`✓ Đã quét & áp dụng mã QR Voucher: ${code} (-${formatPrice(chk.discount)})`, 'success');
          } else {
            showToast(`Đã nhận mã QR: ${code}`, 'info');
          }
        }}
        title="Quét mã QR Voucher tại quầy POS"
        subtitle="Quét mã voucher trên điện thoại khách hàng, tin nhắn hoặc voucher giấy"
      />
    </div>
  );
}
