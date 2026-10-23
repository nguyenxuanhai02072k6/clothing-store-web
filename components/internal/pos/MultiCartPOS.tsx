'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { updateCRMClientLoyaltyAction } from '@/backend/actions/erpActions';
import { VoucherQrScannerModal } from '../../common/VoucherQrScannerModal';
import { extractVoucherCodeFromQR } from '../../../lib/voucherQr';
import { formatPrice } from '../../../lib/utils';
import { CartItem, CartTab, MultiCartPOSProps } from './posTypes';
import { getPromoDiscount } from './posPromoUtils';
import POSHeaderTabs from './components/POSHeaderTabs';
import POSProductCatalog from './components/POSProductCatalog';
import POSCartSidebar from './components/POSCartSidebar';
import POSProformaModal from './components/POSProformaModal';
import POSReceiptModal from './components/POSReceiptModal';
import POSHotkeysModal from './components/POSHotkeysModal';

export type { CartItem, CartTab, MultiCartPOSProps };

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
  const [showVoucherScanner, setShowVoucherScanner] = useState(false);
  const [printedReceipt, setPrintedReceipt] = useState<any | null>(null);
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

  // Barcode & QR Code Scan Handler
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
    const suggestions: number[] = [total];
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
    if (setPosHistory) setPosHistory(updatedHistory);
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
      <POSHeaderTabs
        currentUser={currentUser}
        cartTabs={cartTabs}
        activeTabId={activeTabId}
        setActiveTabId={setActiveTabId}
        handleAddNewTab={handleAddNewTab}
        handleCloseTab={handleCloseTab}
        setShowHotkeysGuide={setShowHotkeysGuide}
        posHistory={posHistory}
        setPrintedReceipt={setPrintedReceipt}
      />

      {/* MAIN SPLIT-SCREEN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: PRODUCT CATALOG & BARCODE SCANNER (7 cols) */}
        <POSProductCatalog
          productsList={productsList}
          branchStock={branchStock}
          currentUser={currentUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          barcodeScan={barcodeScan}
          setBarcodeScan={setBarcodeScan}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchInputRef={searchInputRef}
          barcodeInputRef={barcodeInputRef}
          handleBarcodeScan={handleBarcodeScan}
          handleAddToCart={handleAddToCart}
        />

        {/* RIGHT COLUMN: ACTIVE CART & CHECKOUT TENDER (5 cols) */}
        <POSCartSidebar
          activeTab={activeTab}
          updateActiveTab={updateActiveTab}
          subtotal={subtotal}
          vipDiscountPercent={vipDiscountPercent}
          vipDiscountAmt={vipDiscountAmt}
          promoDiscountAmt={promoDiscountAmt}
          finalTotal={finalTotal}
          cashTendered={cashTendered}
          changeDue={changeDue}
          getCashSuggestions={getCashSuggestions}
          handleUpdateQuantity={handleUpdateQuantity}
          handleCustomerLookup={handleCustomerLookup}
          handleCheckout={handleCheckout}
          setShowProformaModal={setShowProformaModal}
          setShowVoucherScanner={setShowVoucherScanner}
          showToast={showToast}
          customerInputRef={customerInputRef}
          promoInputRef={promoInputRef}
          cashInputRef={cashInputRef}
        />
      </div>

      {/* PRO-FORMA BILL MODAL */}
      <POSProformaModal
        showProformaModal={showProformaModal}
        setShowProformaModal={setShowProformaModal}
        activeTab={activeTab}
        currentUser={currentUser}
        subtotal={subtotal}
        vipDiscountAmt={vipDiscountAmt}
        promoDiscountAmt={promoDiscountAmt}
        finalTotal={finalTotal}
        showToast={showToast}
      />

      {/* FINAL THERMAL RECEIPT PRINT MODAL */}
      <POSReceiptModal
        printedReceipt={printedReceipt}
        setPrintedReceipt={setPrintedReceipt}
        showToast={showToast}
      />

      {/* HOTKEYS CHEATSHEET MODAL */}
      <POSHotkeysModal
        showHotkeysGuide={showHotkeysGuide}
        setShowHotkeysGuide={setShowHotkeysGuide}
      />

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
