'use client';

import React, { useState } from 'react';
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
  Sliders,
  DollarSign,
  Box,
  FileSpreadsheet,
  Loader2,
  Tag,
  Settings,
  Edit2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../context/CartContext';

interface ERPSubsystemsProps {
  activeTab: string;
  currentUser: any;
  usersList: any[];
  productsList: any[];
  branchStock: any;
  restockBranchProduct: any;
  allOrders: any[];
  createOrder: any;
  payrollRecords: any[];
  paySalary: any;
  expensesList: any[];
  addExpense: any;
  deleteExpense: any;
  addPayrollRecord: any;
  restockRecords: any[];
  attendanceLogs: any[];
  shiftRequests: any[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  
  // POS States & Setters
  posSearchQuery: string;
  setPosSearchQuery: (v: string) => void;
  posBarcodeScan: string;
  setPosBarcodeScan: (v: string) => void;
  posCart: any[];
  setPosCart: (v: any[]) => void;
  posCustomerPhone: string;
  setPosCustomerPhone: (v: string) => void;
  posSelectedCustomer: any | null;
  setPosSelectedCustomer: (v: any) => void;
  posPaymentMethod: 'cash' | 'transfer' | 'wallet';
  setPosPaymentMethod: (v: 'cash' | 'transfer' | 'wallet') => void;
  posPromoCode: string;
  setPosPromoCode: (v: string) => void;
  posPromoDiscount: number;
  setPosPromoDiscount: (v: number) => void;
  posPrintedReceipt: any | null;
  setPosPrintedReceipt: (v: any) => void;
  posReceiptMail: string;
  setPosReceiptMail: (v: string) => void;
  posHistory: any[];
  setPosHistory: (v: any[]) => void;

  // Inventory & Transfer States & Setters
  transfers: any[];
  setTransfers: (v: any[]) => void;
  newTransferProductId: string;
  setNewTransferProductId: (v: string) => void;
  newTransferSize: string;
  setNewTransferSize: (v: string) => void;
  newTransferColor: string;
  setNewTransferColor: (v: string) => void;
  newTransferQty: number;
  setNewTransferQty: (v: number) => void;
  newTransferFrom: string;
  setNewTransferFrom: (v: string) => void;
  newTransferTo: string;
  setNewTransferTo: (v: string) => void;

  damagedGoods: any[];
  setDamagedGoods: (v: any[]) => void;
  newDamageProductId: string;
  setNewDamageProductId: (v: string) => void;
  newDamageSize: string;
  setNewDamageSize: (v: string) => void;
  newDamageColor: string;
  setNewDamageColor: (v: string) => void;
  newDamageQty: number;
  setNewDamageQty: (v: number) => void;
  newDamageIssue: string;
  setNewDamageIssue: (v: string) => void;

  // CRM & Tickets States & Setters
  crmClients: any[];
  setCrmClients: (v: any[]) => void;
  cskhTickets: any[];
  setCskhTickets: (v: any[]) => void;
  newTicketCustomerName: string;
  setNewTicketCustomerName: (v: string) => void;
  newTicketCategory: 'Đổi size' | 'Trả hàng lỗi' | 'Khiếu nại dịch vụ';
  setNewTicketCategory: (v: 'Đổi size' | 'Trả hàng lỗi' | 'Khiếu nại dịch vụ') => void;
  newTicketDesc: string;
  setNewTicketDesc: (v: string) => void;

  // Cash Reconciliation
  cashReconciliations: any[];
  setCashReconciliations: (v: any[]) => void;
  posReconciliationExpected: number;
  setPosReconciliationExpected: (v: number) => void;
  posReconciliationActual: number;
  setPosReconciliationActual: (v: number) => void;
  posReconciliationNotes: string;
  setPosReconciliationNotes: (v: string) => void;

  // AI states
  aiSEOProductAttributes: any;
  setAiSEOProductAttributes: (v: any) => void;
  aiGeneratedSEODesc: string;
  setAiGeneratedSEODesc: (v: string) => void;
  aiGeneratedCaption: string;
  setAiGeneratedCaption: (v: string) => void;
  aiSelectedChannel: 'facebook' | 'tiktok' | 'instagram';
  setAiSelectedChannel: (v: 'facebook' | 'tiktok' | 'instagram') => void;
  aiSelectedTone: 'trendy' | 'elegant' | 'minimalist';
  setAiSelectedTone: (v: 'trendy' | 'elegant' | 'minimalist') => void;
  aiCannedReplyOutput: string;
  setAiCannedReplyOutput: (v: string) => void;
  aiGenerating: boolean;
  setAiGenerating: (v: boolean) => void;
  updateGlobalProductDetails?: (
    productId: string,
    name: string,
    description: string,
    category: string,
    price: number,
    colors?: { name: string; hex: string }[],
    sizes?: string[],
    images?: string[],
    isActive?: boolean
  ) => void;
  addGlobalProduct?: (
    name: string,
    category: string,
    price: number,
    description: string,
    images: string[],
    colors: { name: string; hex: string }[],
    sizes: string[],
    initialStock?: number
  ) => void;
  deleteGlobalProduct?: (productId: string) => void;
}

export const ERPSubsystems: React.FC<ERPSubsystemsProps> = ({
  activeTab,
  currentUser,
  usersList,
  productsList,
  branchStock,
  restockBranchProduct,
  allOrders,
  createOrder,
  payrollRecords,
  paySalary,
  expensesList,
  addExpense,
  deleteExpense,
  addPayrollRecord,
  restockRecords,
  attendanceLogs,
  shiftRequests,
  showToast,

  // POS
  posSearchQuery,
  setPosSearchQuery,
  posBarcodeScan,
  setPosBarcodeScan,
  posCart,
  setPosCart,
  posCustomerPhone,
  setPosCustomerPhone,
  posSelectedCustomer,
  setPosSelectedCustomer,
  posPaymentMethod,
  setPosPaymentMethod,
  posPromoCode,
  setPosPromoCode,
  posPromoDiscount,
  setPosPromoDiscount,
  posPrintedReceipt,
  setPosPrintedReceipt,
  posReceiptMail,
  setPosReceiptMail,
  posHistory,
  setPosHistory,

  // Inventory & transfers
  transfers,
  setTransfers,
  newTransferProductId,
  setNewTransferProductId,
  newTransferSize,
  setNewTransferSize,
  newTransferColor,
  setNewTransferColor,
  newTransferQty,
  setNewTransferQty,
  newTransferFrom,
  setNewTransferFrom,
  newTransferTo,
  setNewTransferTo,

  damagedGoods,
  setDamagedGoods,
  newDamageProductId,
  setNewDamageProductId,
  newDamageSize,
  setNewDamageSize,
  newDamageColor,
  setNewDamageColor,
  newDamageQty,
  setNewDamageQty,
  newDamageIssue,
  setNewDamageIssue,

  // CRM
  crmClients,
  setCrmClients,
  cskhTickets,
  setCskhTickets,
  newTicketCustomerName,
  setNewTicketCustomerName,
  newTicketCategory,
  setNewTicketCategory,
  newTicketDesc,
  setNewTicketDesc,

  // Cash Recon
  cashReconciliations,
  setCashReconciliations,
  posReconciliationExpected,
  setPosReconciliationExpected,
  posReconciliationActual,
  setPosReconciliationActual,
  posReconciliationNotes,
  setPosReconciliationNotes,

  // AI
  aiSEOProductAttributes,
  setAiSEOProductAttributes,
  aiGeneratedSEODesc,
  setAiGeneratedSEODesc,
  aiGeneratedCaption,
  setAiGeneratedCaption,
  aiSelectedChannel,
  setAiSelectedChannel,
  aiSelectedTone,
  setAiSelectedTone,
  aiCannedReplyOutput,
  setAiCannedReplyOutput,
  aiGenerating,
  setAiGenerating,
  updateGlobalProductDetails,
  addGlobalProduct,
  deleteGlobalProduct
}) => {
  // Category mapping
  const categoryLabel: Record<string, string> = {
    Tops: 'Áo',
    Bottoms: 'Quần',
    Dresses: 'Đầm',
    Outerwear: 'Áo khoác'
  };

  // Category commission mapping
  const [salesCommissions, setSalesCommissions] = useState<Record<string, number>>({
    Tops: 0.03,
    Bottoms: 0.03,
    Dresses: 0.04,
    Outerwear: 0.05
  });

  // KPI target
  const kpiTarget = 30000000; // 30M VND target

  // Call useCart to manage dynamic coupons
  const { dynamicPromos, addDynamicPromoCode, deleteDynamicPromoCode } = useCart() as any;

  // New local state hooks for P&L Sheet: Monthly/Quarterly filters
  const [plPeriodType, setPlPeriodType] = useState<'monthly' | 'quarterly'>('monthly');
  const [plSelectedPeriod, setPlSelectedPeriod] = useState('2026-06'); // E.g., '2026-06' or 'Q2 2026'

  // Local state for held POS orders (đơn tạm thời) và bộ lọc danh mục
  const [posSelectedCategory, setPosSelectedCategory] = useState<string>('all');
  const [heldCarts, setHeldCarts] = useState<{
    id: string;
    customerName: string;
    time: string;
    cart: any[];
    customerPhone: string;
    selectedCustomer: any;
    paymentMethod: 'cash' | 'transfer' | 'wallet';
    promoCode: string;
    promoDiscount: number;
  }[]>([]);
  const [showHeldDropdown, setShowHeldDropdown] = useState(false);

  // Local states for Products Database search & filters & row menu
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [dbCategoryFilter, setDbCategoryFilter] = useState('all');
  const [activeRowDropdown, setActiveRowDropdown] = useState<string | null>(null);

  const handleHoldCart = () => {
    if (posCart.length === 0) return;
    const holdId = `HOLD-${Date.now().toString().slice(-4)}`;
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const name = posSelectedCustomer?.name || posCustomerPhone || `Đơn tạm ${holdId}`;
    
    const newHold = {
      id: holdId,
      customerName: name,
      time: timeStr,
      cart: posCart,
      customerPhone: posCustomerPhone,
      selectedCustomer: posSelectedCustomer,
      paymentMethod: posPaymentMethod,
      promoCode: posPromoCode,
      promoDiscount: posPromoDiscount
    };
    
    setHeldCarts(prev => [newHold, ...prev]);
    
    // Reset current POS states
    setPosCart([]);
    setPosCustomerPhone('');
    setPosSelectedCustomer(null);
    setPosPromoCode('');
    setPosPromoDiscount(0);
    setPosPaymentMethod('cash');
    
    showToast(`Đã lưu đơn tạm thời (${holdId})!`, 'success');
  };

  const handleRecallCart = (holdId: string) => {
    const held = heldCarts.find(h => h.id === holdId);
    if (!held) return;
    
    setPosCart(held.cart);
    setPosCustomerPhone(held.customerPhone);
    setPosSelectedCustomer(held.selectedCustomer);
    setPosPromoCode(held.promoCode);
    setPosPromoDiscount(held.promoDiscount);
    setPosPaymentMethod(held.paymentMethod);
    
    setHeldCarts(prev => prev.filter(h => h.id !== holdId));
    setShowHeldDropdown(false);
    showToast(`Đã phục hồi đơn tạm thời (${holdId})!`, 'success');
  };

  const handleCancelHeldCart = (holdId: string) => {
    setHeldCarts(prev => prev.filter(h => h.id !== holdId));
    showToast(`Đã hủy đơn tạm thời (${holdId})!`, 'info');
  };

  // New local state hooks for Product Database Modals
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [dbModalMode, setDbModalMode] = useState<'create' | 'edit'>('create');
  const [dbSelectedProductId, setDbSelectedProductId] = useState('');
  const [dbProductName, setDbProductName] = useState('');
  const [dbProductCategory, setDbProductCategory] = useState('Tops');
  const [dbProductPrice, setDbProductPrice] = useState(0);
  const [dbProductDescription, setDbProductDescription] = useState('');
  const [dbProductImages, setDbProductImages] = useState('');
  const [dbProductColors, setDbProductColors] = useState('');
  const [dbProductSizes, setDbProductSizes] = useState<string[]>([]);
  const [dbProductInitialStock, setDbProductInitialStock] = useState(20);
  const [dbProductIsActive, setDbProductIsActive] = useState(true);

  // New local state hooks for Coupon Management Form
  const [cpCode, setCpCode] = useState('');
  const [cpType, setCpType] = useState<'percent' | 'fixed'>('percent');
  const [cpValue, setCpValue] = useState(0);
  const [cpDesc, setCpDesc] = useState('');

  // Expanded AI Copilot Generator fields
  const [aiGeneratedTitleTags, setAiGeneratedTitleTags] = useState('');
  const [aiGeneratedMeta, setAiGeneratedMeta] = useState('');
  const [aiGeneratedBlog, setAiGeneratedBlog] = useState('');
  const [aiGeneratedBrief, setAiGeneratedBrief] = useState('');

  // Expanded AI Copilot Handlers
  const handleGenerateTitleTags = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const title = `Áo Sơ Mi ${aiSEOProductAttributes.material} ${aiSEOProductAttributes.fit} NOVYN WEAR`;
      const tags = `#NovynWear #LinenShirt #QuietLuxury #ClassicMinimalism #UnisexStyle #SummerCollection #${aiSEOProductAttributes.color.replace(/\s+/g, '')}`;
      setAiGeneratedTitleTags(`🏷️ TIÊU ĐỀ ĐỀ XUẤT:\n${title}\n\n🏷️ HASHTAGS:\n${tags}`);
      setAiGenerating(false);
      showToast('✓ AI đã viết tiêu đề và tạo thẻ tags!', 'success');
    }, 1000);
  };

  const handleGenerateMeta = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const metaTitle = `${aiSEOProductAttributes.material} ${aiSEOProductAttributes.fit} Cực Sang | NOVYN.WEAR`;
      const metaDesc = `Mua sắm ngay dòng sản phẩm thiết kế từ chất liệu ${aiSEOProductAttributes.material} tự nhiên. Thiết kế tối giản ${aiSEOProductAttributes.fit} màu ${aiSEOProductAttributes.color} phù hợp cho BST ${aiSEOProductAttributes.season}. Giao hàng 2h toàn quốc, đổi trả 7 ngày.`;
      setAiGeneratedMeta(`🔍 SEO META TITLE:\n${metaTitle}\n\n🔍 SEO META DESCRIPTION:\n${metaDesc}`);
      setAiGenerating(false);
      showToast('✓ AI đã tạo thẻ Meta SEO thành công!', 'success');
    }, 1000);
  };

  const handleGenerateBlog = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const blogContent = `🌿 BẢN THUYẾT MINH VỀ SỰ THANH LỊCH CỦA CHẤT LIỆU ${aiSEOProductAttributes.material.toUpperCase()}\n\nTrong kỷ nguyên của lối sống "Less is more", dòng trang phục dệt từ sợi ${aiSEOProductAttributes.material.toLowerCase()} nổi lên như một tuyên ngôn phong cách vượt thời gian. Không hào nhoáng cầu kỳ, chính sự mộc mạc nguyên bản của chất vải dệt đã tạo nên một sức hút sang trọng thầm lặng (Quiet Luxury) đầy mê hoặc.\n\nThiết kế phom dáng ${aiSEOProductAttributes.fit.toLowerCase()} kết hợp tông màu ${aiSEOProductAttributes.color.toLowerCase()} dịu mát đặc trưng mang lại một cảm giác giải phóng cơ thể tối đa. Khi khoác lên mình mẫu trang phục này của NOVYN, bạn không chỉ mặc một chiếc áo sơ mi đơn thuần, mà đang tận hưởng triết lý thiết kế hướng về sự tự do của chuyển động và sự bền vững của tự nhiên.\n\nKết hợp tinh tế mẫu áo này cùng quần tây be sáng hoặc short linen đồng điệu để tạo nên diện mạo phóng khoáng cho mùa hè ${aiSEOProductAttributes.season} đầy cảm hứng.`;
      setAiGeneratedBlog(blogContent);
      setAiGenerating(false);
      showToast('✓ AI đã viết bài blog thời trang!', 'success');
    }, 1500);
  };

  const handleGenerateBrief = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const briefContent = `📋 BẢN TÓM TẮT CHIẾN DỊCH (CAMPAIGN BRIEF): NOVYN "WEIGHTLESS ${aiSEOProductAttributes.season.toUpperCase()}"\n\n1. THÔNG ĐIỆP CHỦ ĐẠO: "Nhẹ nhàng chạm vào xúc giác - Tự do trong từng chuyển động"\n2. KÊNH ĐỒNG BỘ: Instagram lookbook reels, TikTok UGC review, và email marketing gửi khách VIP.\n3. CONCEPT CHỤP ẢNH: Editorial Fashion ngoài trời với ánh sáng tự nhiên ngả vàng, nền cát biển hoặc kiến trúc tối giản be kem.\n4. MỤC TIÊU: Tiếp cận 50,000 khách hàng mục tiêu yêu thích thời trang quiet luxury, thúc đẩy 1,500 lượt add-to-cart cho mẫu thiết kế ${aiSEOProductAttributes.material} màu ${aiSEOProductAttributes.color}.\n5. KEYWORDS: #NovynWear #${aiSEOProductAttributes.material.replace(/\s+/g, '')} #QuietLuxury #Minimalism`;
      setAiGeneratedBrief(briefContent);
      setAiGenerating(false);
      showToast('✓ AI đã lập tóm tắt chiến dịch thành công!', 'success');
    }, 1200);
  };

  // POS Add Item handler
  const handleAddPosCart = (product: any, size: string, color: string) => {
    const colorName = color.includes('|') ? color.split('|')[0].trim() : color;
    const sku = `NOVYN-${product.category.toUpperCase()}-${colorName.toUpperCase()}-${size}`;
    const existingIndex = posCart.findIndex(item => item.sku === sku);
    
    if (existingIndex > -1) {
      const updated = [...posCart];
      updated[existingIndex].quantity += 1;
      setPosCart(updated);
    } else {
      setPosCart([...posCart, {
        id: `${product.id}-${size}-${colorName}-${Date.now()}`,
        product,
        sku,
        size,
        color: colorName,
        quantity: 1,
        price: product.price
      }]);
    }
    showToast(`Đã thêm ${product.name} (${size} / ${colorName}) vào POS`, 'success');
  };

  // Simulated scan SKU
  const handleScanBarcode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!posBarcodeScan.trim()) return;
    const targetSku = posBarcodeScan.trim().toUpperCase();
    
    // Check direct matching product name or ID
    const matchedProduct = productsList.find((p: any) => 
      p.slug.toUpperCase().includes(targetSku) ||
      p.name.toUpperCase().includes(targetSku) ||
      targetSku === p.id.toUpperCase()
    );

    if (matchedProduct) {
      const defaultColor = matchedProduct.colors[0]?.name || matchedProduct.colors[0] || 'Oatmeal';
      handleAddPosCart(matchedProduct, 'M', defaultColor);
      setPosBarcodeScan('');
      return;
    }

    // Try format NOVYN-CATEGORY-COLOR-SIZE
    const parts = targetSku.split('-');
    if (parts[0] === 'NOVYN' && parts.length >= 4) {
      const cat = parts[1];
      const color = parts[2];
      const size = parts[3];
      const matchedCat = productsList.find((p: any) => p.category.toUpperCase() === cat);
      if (matchedCat) {
        handleAddPosCart(matchedCat, size, color);
        setPosBarcodeScan('');
        return;
      }
    }

    showToast('Không tìm thấy sản phẩm khớp với mã đã quét!', 'error');
  };

  const handleLookUpCustomer = () => {
    const phone = posCustomerPhone.trim();
    if (!phone) return;
    const found = crmClients.find(c => c.phone === phone || c.email.includes(phone) || c.name.includes(phone));
    if (found) {
      setPosSelectedCustomer(found);
      showToast(`Đã nhận diện thành viên: ${found.name} (${found.tier})`, 'success');
    } else {
      showToast('Không tìm thấy thông tin thành viên!', 'info');
      setPosSelectedCustomer(null);
    }
  };

  // POS Calculations
  const posSubtotal = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let vipDiscountPercent = 0;
  if (posSelectedCustomer) {
    if (posSelectedCustomer.tier === 'Gold') vipDiscountPercent = 0.05;
    else if (posSelectedCustomer.tier === 'Platinum') vipDiscountPercent = 0.10;
    else if (posSelectedCustomer.tier === 'VVIP') vipDiscountPercent = 0.15;
  }
  const vipDiscountAmt = posSubtotal * vipDiscountPercent;

  let promoDiscountAmt = 0;
  if (posPromoCode.toUpperCase() === 'SALE10') {
    promoDiscountAmt = (posSubtotal - vipDiscountAmt) * 0.10;
  } else if (posPromoCode.toUpperCase() === 'FREESHIP') {
    promoDiscountAmt = Math.min(30000, posSubtotal - vipDiscountAmt);
  }
  const posTotal = Math.max(0, posSubtotal - vipDiscountAmt - promoDiscountAmt);

  const handleCheckoutPOS = () => {
    if (posCart.length === 0) {
      showToast('Giỏ hàng POS đang trống!', 'error');
      return;
    }

    const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
    const transactionDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const branchName = currentUser.branch || 'Chi nhánh Quận 1';

    const newInvoice = {
      id: invoiceId,
      cashierName: currentUser.name,
      cashierEmail: currentUser.email,
      items: posCart.map(i => ({
        productName: i.product.name,
        sku: i.sku,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        price: i.price
      })),
      subtotal: posSubtotal,
      vipDiscount: vipDiscountAmt,
      promoDiscount: promoDiscountAmt,
      total: posTotal,
      paymentMethod: posPaymentMethod,
      customerName: posSelectedCustomer?.name || 'Khách lẻ',
      customerPhone: posSelectedCustomer?.phone || 'N/A',
      date: transactionDate,
      branch: branchName
    };

    // Save POS History
    const updatedHistory = [newInvoice, ...posHistory];
    setPosHistory(updatedHistory);
    localStorage.setItem('novyn_pos_history', JSON.stringify(updatedHistory));

    // VIP Loyalty accumulation
    if (posSelectedCustomer) {
      const updatedCrm = crmClients.map(c => {
        if (c.id === posSelectedCustomer.id) {
          const newSpent = c.totalSpent + posTotal;
          const newPoints = Math.floor(newSpent / 100000);
          let newTier = c.tier;
          if (newSpent >= 50000000) newTier = 'VVIP';
          else if (newSpent >= 30000000) newTier = 'Platinum';
          else if (newSpent >= 10000000) newTier = 'Gold';
          
          return { ...c, totalSpent: newSpent, points: newPoints, tier: newTier };
        }
        return c;
      });
      setCrmClients(updatedCrm);
      localStorage.setItem('novyn_crm_clients', JSON.stringify(updatedCrm));
    }

    // Deduct stock
    posCart.forEach(item => {
      restockBranchProduct(item.product.id, -item.quantity, item.size, branchName);
    });

    // Save Order into Context
    createOrder(
      {
        name: posSelectedCustomer?.name || 'Khách lẻ POS',
        email: posSelectedCustomer?.email || 'khachle@pos.novynwear.com',
        phone: posSelectedCustomer?.phone || '0900000000',
        address: `Tại quầy - ${branchName}`,
        city: 'Hồ Chí Minh',
        note: 'Giao dịch POS tại quầy thu ngân'
      },
      posCart.map(c => ({
        id: c.product.id,
        name: c.product.name,
        price: c.price,
        quantity: c.quantity,
        size: c.size,
        color: c.color,
        image: c.product.images[0]
      })),
      posSubtotal,
      vipDiscountAmt + promoDiscountAmt,
      0, // shipping
      posTotal,
      posPaymentMethod === 'transfer' ? 'transfer' : 'cod',
      branchName,
      'completed'
    );

    setPosPrintedReceipt(newInvoice);
    setPosCart([]);
    setPosSelectedCustomer(null);
    setPosCustomerPhone('');
    setPosPromoCode('');
    showToast('✓ Giao dịch POS thành công! Đã trừ kho và in hóa đơn.', 'success');
  };

  // Branch transfers
  const handleCreateTransfer = () => {
    if (!newTransferProductId || !newTransferColor) {
      showToast('Vui lòng chọn sản phẩm và màu sắc!', 'error');
      return;
    }
    if (newTransferFrom === newTransferTo) {
      showToast('Chi nhánh nguồn và đích không được trùng nhau!', 'error');
      return;
    }

    const matched = productsList.find(p => p.id === newTransferProductId);
    if (!matched) return;

    const sourceStock = branchStock[newTransferProductId]?.[newTransferFrom] || 0;
    if (sourceStock < newTransferQty) {
      showToast(`Số lượng tồn khả dụng tại nguồn chỉ còn ${sourceStock} sản phẩm, không đủ chuyển!`, 'info');
      return;
    }

    const newTr = {
      id: `TR-${Date.now().toString().slice(-5)}`,
      productId: newTransferProductId,
      productName: matched.name,
      size: newTransferSize,
      color: newTransferColor,
      fromBranch: newTransferFrom,
      toBranch: newTransferTo,
      quantity: newTransferQty,
      status: 'shipping' as const,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    // Subtract from source
    restockBranchProduct(newTransferProductId, -newTransferQty, newTransferSize, newTransferFrom);

    const updated = [newTr, ...transfers];
    setTransfers(updated);
    localStorage.setItem('novyn_stock_transfers', JSON.stringify(updated));
    showToast('Đã tạo phiếu chuyển kho và đang vận chuyển!', 'success');
  };

  const handleReceiveTransfer = (id: string) => {
    const tr = transfers.find(t => t.id === id);
    if (!tr) return;

    // Add to target
    restockBranchProduct(tr.productId, tr.quantity, tr.size, tr.toBranch);

    const updated = transfers.map(t => t.id === id ? { ...t, status: 'received' as const } : t);
    setTransfers(updated);
    localStorage.setItem('novyn_stock_transfers', JSON.stringify(updated));
    showToast('✓ Đã xác nhận nhận hàng chuyển kho và cộng tồn kho!', 'success');
  };

  // Damaged goods
  const handleLogDamage = () => {
    if (!newDamageProductId || !newDamageColor) {
      showToast('Vui lòng chọn đầy đủ sản phẩm và màu sắc!', 'error');
      return;
    }

    const matched = productsList.find(p => p.id === newDamageProductId);
    if (!matched) return;

    const branchName = currentUser.branch || 'Chi nhánh Quận 1';
    const currentStock = branchStock[newDamageProductId]?.[branchName] || 0;
    if (currentStock < newDamageQty) {
      showToast(`Tồn kho của chi nhánh (${currentStock}) nhỏ hơn số hàng lỗi cần ghi nhận!`, 'info');
      return;
    }

    const newDm = {
      id: `DM-${Date.now().toString().slice(-5)}`,
      productId: newDamageProductId,
      productName: matched.name,
      size: newDamageSize,
      color: newDamageColor,
      branch: branchName,
      quantity: newDamageQty,
      issue: newDamageIssue,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    // Subtract stock
    restockBranchProduct(newDamageProductId, -newDamageQty, newDamageSize, branchName);

    const updated = [newDm, ...damagedGoods];
    setDamagedGoods(updated);
    localStorage.setItem('novyn_damaged_goods', JSON.stringify(updated));
    showToast('✓ Đã ghi nhận hàng lỗi và khấu trừ kho khả dụng thành công!', 'success');
  };

  // CSKH Tickets
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketCustomerName.trim() || !newTicketDesc.trim()) {
      showToast('Vui lòng điền đầy đủ tên khách hàng và mô tả!', 'error');
      return;
    }

    const newTk = {
      id: `TK-${Date.now().toString().slice(-4)}`,
      customerName: newTicketCustomerName,
      category: newTicketCategory,
      description: newTicketDesc,
      status: 'pending' as const,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updated = [newTk, ...cskhTickets];
    setCskhTickets(updated);
    localStorage.setItem('novyn_cskh_tickets', JSON.stringify(updated));
    
    setNewTicketCustomerName('');
    setNewTicketDesc('');
    showToast('✓ Đã khởi tạo phiếu khiếu nại CSKH mới!', 'success');
  };

  const handleResolveTicket = (id: string) => {
    const updated = cskhTickets.map(t => t.id === id ? { ...t, status: 'resolved' as const } : t);
    setCskhTickets(updated);
    localStorage.setItem('novyn_cskh_tickets', JSON.stringify(updated));
    showToast('✓ Đã cập nhật trạng thái phiếu: Đã giải quyết!', 'success');
  };

  // Cash reconciliations
  const handleSaveReconciliation = () => {
    const branchName = currentUser.branch || 'Chi nhánh Quận 1';
    const discrepancy = posReconciliationActual - posReconciliationExpected;
    
    const newRecon = {
      id: `RC-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      branch: branchName,
      cashierName: currentUser.name,
      expectedCash: posReconciliationExpected,
      actualCash: posReconciliationActual,
      discrepancy,
      notes: posReconciliationNotes || 'Đã đối soát két',
      status: 'approved' as const,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updated = [newRecon, ...cashReconciliations];
    setCashReconciliations(updated);
    localStorage.setItem('novyn_cash_reconciliation', JSON.stringify(updated));
    showToast('✓ Khóa sổ két và lưu phiếu đối soát két thành công!', 'success');
    setPosReconciliationNotes('');
  };

  // Export Financial CSV
  const handleExportFinancialCSV = () => {
    const headers = ['Kỳ đối soát', 'Doanh thu gộp', 'Giá vốn (COGS)', 'Chi phí lương nhân sự', 'Chi phí nhập hàng', 'Chi phí vận hành khác', 'Lợi nhuận gộp', 'Thuế ước tính', 'Lợi nhuận ròng'];
    
    let totalRev = 0;
    let totalCogs = 0;
    allOrders.forEach(o => {
      if (o.status === 'completed') {
        totalRev += o.total;
        totalCogs += o.total * 0.4;
      }
    });

    let salaries = usersList.reduce((sum, u) => sum + (u.salary || 0), 0);
    let expenses = expensesList.reduce((sum, e) => sum + e.amount, 0);
    let restock = restockRecords.reduce((sum, r) => sum + (r.cost || 0), 0);
    const ebt = totalRev - totalCogs - salaries - expenses - restock;
    const tax = ebt > 0 ? ebt * 0.2 : 0;
    const net = ebt - tax;

    const row = [
      'Tháng 06/2026',
      totalRev,
      totalCogs,
      salaries,
      restock,
      expenses,
      ebt,
      tax,
      net
    ];

    const csvContent = "\uFEFF" + [headers.join(','), row.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NOVYN_Financial_Reconciliation_Report_2026-06.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Đã xuất file CSV báo cáo tài chính đối soát!', 'success');
  };

  // AI Content Generator
  const handleGenerateSEODesc = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const generated = `✦ CHI TIẾT SẢN PHẨM PHONG CÁCH QUIET LUXURY ✦\n\nMẫu thiết kế thời thượng chế tác từ sợi **${aiSEOProductAttributes.material}** tuyển chọn mộc mạc thoáng mát tuyệt đối. Phom dáng **${aiSEOProductAttributes.fit}** phóng khoáng rủ nhẹ nâng niu cơ thể trong sắc màu **${aiSEOProductAttributes.color}** trung tính cực sang. Phù hợp hoàn hảo cho bộ sưu tập **${aiSEOProductAttributes.season}** thời thượng.\n\n✔️ Đứng dáng, đường may giấu chỉ cao cấp\n✔️ Thoáng khí tự nhiên, thấm hút mồ hôi siêu tốt\n✔️ Thích hợp cho cả dạo phố nắng hay office công sở trang nhã.\n\n*Từ khóa SEO: thời trang quiet luxury, ${aiSEOProductAttributes.material.toLowerCase()}, thiết kế tối giản, NOVYN WEAR*`;
      setAiGeneratedSEODesc(generated);
      setAiGenerating(false);
      showToast('✓ AI đã tạo mô tả sản phẩm chuẩn SEO thời trang!', 'success');
    }, 1500);
  };

  const handleGenerateCaption = () => {
    setAiGenerating(true);
    setTimeout(() => {
      let cap = '';
      if (aiSelectedTone === 'trendy') {
        cap = `🔥 NEW ARRIVALS ON TOP 🔥\n\nNắng lên rồi, lên đồ "Quiet Luxury" thanh lịch cùng NOVYN WEAR thôi cả nhà ơi! Chất liệu ${aiSEOProductAttributes.material} siêu mát lạnh xịn mịn phom dáng ${aiSEOProductAttributes.fit} che khuyết điểm 10/10. \n\n👉 Chốt ngay một em màu ${aiSEOProductAttributes.color} cực hot hit tại link bio nha! Số lượng giới hạn chốt lẹ tay! 🛍️`;
      } else if (aiSelectedTone === 'elegant') {
        cap = `✦ NOVYN Elegant Collection • Thiết lập bản phối tối giản tinh tế.\n\nSự sang trọng thầm lặng thể hiện qua chất liệu ${aiSEOProductAttributes.material} tự nhiên kết hợp cùng phối màu ${aiSEOProductAttributes.fit} tối giản. Sắc màu ${aiSEOProductAttributes.color} trầm ấm nâng tầm phong cách quý cô công sở hiện đại.\n\n🌿 Trải nghiệm bộ sưu tập mới nhất tại chi nhánh showroom của chúng tôi.`;
      } else {
        cap = `🌿 TỐI GIẢN • NHẸ TÊNH • Novyn Muse\n\n- Chất liệu: ${aiSEOProductAttributes.material}\n- Kiểu dáng: ${aiSEOProductAttributes.fit}\n- Tông màu: ${aiSEOProductAttributes.color}\n\nTinh giản mọi chi tiết dư thừa để tìm lại sự bình yên mộc mạc trong từng sợi lanh dệt. Sẵn sàng cho mùa ${aiSEOProductAttributes.season}.`;
      }
      setAiGeneratedCaption(cap);
      setAiGenerating(false);
      showToast(`✓ AI đã viết bài đăng kênh ${aiSelectedChannel} phong cách ${aiSelectedTone}!`, 'success');
    }, 1200);
  };

  const handleAICannedReply = (type: string) => {
    if (type === 'size') {
      setAiCannedReplyOutput(`🤖 Novyn Muse khuyên dùng size S / M:\n\nDạ, dựa trên chiều cao cân nặng của mình, phom dáng ${aiSEOProductAttributes.fit} sẽ cực kỳ tôn dáng và vừa vặn ở size M nếu muốn mặc rộng rũ lãng mạn, hoặc size S nếu muốn ôm vừa vặn đứng vai ạ. Bạn có muốn NOVYN chốt giữ size cho mình tại showroom không ạ? 🥰`);
    } else {
      setAiCannedReplyOutput(`🤖 NOVYN WEAR xin chân thành lỗi vì sự cố hàng lỗi:\n\nDạ, NOVYN vô cùng xin lỗi anh/chị vì trải nghiệm sản phẩm không trọn vẹn lần này ạ! NOVYN xin gửi shipper mang sản phẩm mới 100% nguyên mác qua đổi tận nhà và thu hồi sản phẩm bị lỗi đồng thời, hoàn toàn không thu thêm bất kỳ chi phí nào. Tặng kèm mã giảm giá SALE10 cho đơn hàng tiếp theo coi như lời tạ lỗi chân thành của chúng em ạ! 🌸`);
    }
    showToast('✓ AI đã soạn thảo câu trả lời khách hàng!', 'info');
  };

  return (
    <div className="space-y-8">
      
      {/* 1. POS SALES TAB */}
      {activeTab === 'pos-sales' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
            <div>
              <h3 className="text-lg font-black text-neutral-950 uppercase tracking-tight flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-500" />
                Bán hàng POS tại quầy
              </h3>
              <p className="text-xs text-neutral-450 mt-1">Thu ngân: <span className="font-bold text-neutral-850">{currentUser.name}</span> • Cửa hàng: <span className="font-bold text-neutral-850">{currentUser.branch || 'Chi nhánh Quận 1'}</span></p>
            </div>
            
            {/* Simulated Barcode Scan input */}
            <form onSubmit={handleScanBarcode} className="flex gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Quét mã vạch/nhập SKU..."
                value={posBarcodeScan}
                onChange={(e) => setPosBarcodeScan(e.target.value)}
                className="px-3.5 py-2 border rounded-xl text-xs bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-rose-400 font-mono tracking-wider w-full md:w-56"
              />
              <button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0">
                Quét
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side: Products catalog selector */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Tìm sản phẩm theo tên..."
                    value={posSearchQuery}
                    onChange={(e) => setPosSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:border-rose-450 text-neutral-800"
                  />
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                {/* Category Filter tabs */}
                <div className="flex gap-1.5 overflow-x-auto select-none no-scrollbar shrink-0 max-w-full">
                  {[
                    { id: 'all', name: 'Tất cả' },
                    { id: 'Tops', name: 'Áo' },
                    { id: 'Bottoms', name: 'Quần' },
                    { id: 'Dresses', name: 'Đầm' },
                    { id: 'Outerwear', name: 'Áo khoác' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setPosSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wide uppercase transition-all border cursor-pointer active:scale-95 ${
                        posSelectedCategory === cat.id
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                          : 'bg-white hover:bg-neutral-50 text-neutral-550 border-neutral-200 hover:text-neutral-800'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* POS product list grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {productsList
                  .filter(p => p.name.toLowerCase().includes(posSearchQuery.toLowerCase()))
                  .filter(p => posSelectedCategory === 'all' || p.category === posSelectedCategory)
                  .map(prod => {
                    const branchName = currentUser.branch || 'Chi nhánh Quận 1';
                    const stock = branchStock[prod.id]?.[branchName] || 0;

                    return (
                      <div key={prod.id} className="bg-white border border-brand-border rounded-2xl p-3 flex gap-3 shadow-sm hover:border-neutral-800/40 transition-all hover:shadow-md duration-200">
                        <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-neutral-50 shrink-0 border border-neutral-100">
                          <Image src={prod.images[0]} alt={prod.name} fill className="object-cover" unoptimized />
                        </div>
                        <div className="flex-grow flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="text-xs font-bold text-neutral-900 truncate flex-grow">{prod.name}</h4>
                              {stock === 0 ? (
                                <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md shrink-0">Hết hàng</span>
                              ) : stock <= 5 ? (
                                <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md shrink-0">Còn {stock} sp</span>
                              ) : (
                                <span className="bg-neutral-50 text-neutral-550 border border-neutral-200/60 text-[8px] font-bold px-1.5 py-0.5 rounded-md shrink-0">Kho: {stock}</span>
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-400 block mt-0.5">{categoryLabel[prod.category] || prod.category}</span>
                            <span className="text-xs font-black text-neutral-900 block mt-1.5">{formatPrice(prod.price)}</span>
                          </div>
                          {/* Quick variants options */}
                          <div className="flex gap-1.5 flex-wrap">
                            {['S', 'M', 'L'].map(sz => (
                              <button
                                key={sz}
                                disabled={stock === 0}
                                onClick={() => handleAddPosCart(prod, sz, prod.colors[0]?.name || prod.colors[0] || 'Oatmeal')}
                                className="px-2.5 py-1 rounded-lg border border-neutral-200 text-[9px] font-black hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-neutral-400 disabled:hover:border-neutral-200"
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

            {/* Right side: POS Cart and Billing Checkout */}
            <div className="lg:col-span-5 bg-white border rounded-3xl p-5 shadow-sm space-y-4 relative">
              <div className="flex justify-between items-center border-b pb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-brand-accent-secondary" />
                  <span>Giỏ hàng</span>
                  <span className="text-brand-accent font-mono text-[10px]">({posCart.reduce((sum, i) => sum + i.quantity, 0)} chiếc)</span>
                </h4>
                
                {/* Hold/Recall Buttons */}
                <div className="flex gap-1.5">
                  <button
                    onClick={handleHoldCart}
                    disabled={posCart.length === 0}
                    className="px-2.5 py-1 text-[10px] font-bold border border-brand-border rounded-lg hover:bg-brand-bg disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Lưu đơn tạm thời"
                  >
                    Lưu tạm
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowHeldDropdown(!showHeldDropdown)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-neutral-900 text-white rounded-lg hover:bg-neutral-850 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Đơn tạm ({heldCarts.length})
                    </button>
                    
                    {showHeldDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-brand-border rounded-2xl shadow-xl z-50 p-3 space-y-2 text-xs">
                        <div className="font-bold text-[10px] text-brand-muted uppercase tracking-wider pb-1 border-b">
                          Danh sách đơn tạm thời
                        </div>
                        {heldCarts.length === 0 ? (
                          <div className="text-[10px] text-brand-muted italic text-center py-4">
                            Không có đơn tạm thời nào
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {heldCarts.map((hc) => (
                              <div key={hc.id} className="flex flex-col p-2 bg-brand-bg rounded-xl gap-1.5 border border-brand-border/40">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-bold text-neutral-900 block">{hc.customerName}</span>
                                    <span className="text-[9px] text-brand-muted font-semibold block">{hc.time}</span>
                                  </div>
                                  <span className="text-[9px] font-bold font-mono text-brand-accent">
                                    {hc.cart.reduce((sum, i) => sum + i.quantity, 0)} sp
                                  </span>
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => handleRecallCart(hc.id)}
                                    className="px-2 py-0.5 text-[9px] font-bold bg-neutral-950 text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                                  >
                                    Phục hồi
                                  </button>
                                  <button
                                    onClick={() => handleCancelHeldCart(hc.id)}
                                    className="px-2 py-0.5 text-[9px] font-bold bg-rose-50 text-rose-600 rounded hover:bg-rose-100 transition-colors cursor-pointer"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cart List */}
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 border-b pb-3">
                {posCart.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic text-center py-10">POS giỏ hàng đang trống.</p>
                ) : (
                  posCart.map(item => (
                    <div key={item.id} className="flex justify-between items-center gap-2 text-xs">
                      <div className="min-w-0 flex-grow">
                        <span className="font-bold text-neutral-900 block truncate">{item.product.name}</span>
                        <span className="text-[9px] text-neutral-450 font-mono">SKU: {item.sku}</span>
                      </div>
                      
                      {/* Quantity change buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button 
                          onClick={() => {
                            const updated = [...posCart];
                            const idx = updated.findIndex(i => i.id === item.id);
                            if (updated[idx].quantity > 1) {
                              updated[idx].quantity -= 1;
                              setPosCart(updated);
                            } else {
                              setPosCart(posCart.filter(i => i.id !== item.id));
                            }
                          }}
                          className="w-5 h-5 rounded bg-neutral-100 font-bold hover:bg-neutral-200 flex items-center justify-center text-[10px]"
                        >
                          -
                        </button>
                        <span className="w-4 text-center font-bold font-mono">{item.quantity}</span>
                        <button 
                          onClick={() => {
                            const updated = [...posCart];
                            const idx = updated.findIndex(i => i.id === item.id);
                            updated[idx].quantity += 1;
                            setPosCart(updated);
                          }}
                          className="w-5 h-5 rounded bg-neutral-100 font-bold hover:bg-neutral-200 flex items-center justify-center text-[10px]"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold font-mono text-neutral-800 shrink-0 w-20 text-right">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))
                )}
              </div>

              {/* VIP Customer Membership syncing */}
              <div className="space-y-2 border-b pb-3">
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block">Thành viên VIP Loyalty</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="SĐT hoặc Tên khách..."
                    value={posCustomerPhone}
                    onChange={(e) => setPosCustomerPhone(e.target.value)}
                    className="flex-grow px-3 py-1.5 border rounded-lg text-xs bg-white text-neutral-800 focus:outline-none"
                  />
                  <button onClick={handleLookUpCustomer} className="bg-neutral-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-neutral-800 shrink-0">
                    Đồng bộ
                  </button>
                </div>
                {posSelectedCustomer && (
                  <div className="bg-amber-550/10 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-xs font-semibold text-amber-800 animate-pulse">
                    <div>
                      <span>💎 {posSelectedCustomer.name}</span>
                      <span className="text-[9px] text-neutral-500 block">Hạng: {posSelectedCustomer.tier} • Điểm: {posSelectedCustomer.points}</span>
                    </div>
                    <span className="font-bold">Chiết khấu -{vipDiscountPercent * 100}%</span>
                  </div>
                )}
              </div>

              {/* Promo Code selector */}
              <div className="flex gap-2 border-b pb-3">
                <input
                  type="text"
                  placeholder="Mã giảm giá (SALE10)..."
                  value={posPromoCode}
                  onChange={(e) => setPosPromoCode(e.target.value)}
                  className="flex-grow px-3 py-1.5 border rounded-lg text-xs bg-white text-neutral-800 focus:outline-none uppercase font-bold"
                />
                {posPromoCode && (
                  <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[9px] font-black uppercase tracking-wide px-2 rounded-lg flex items-center">
                    {posPromoCode.toUpperCase() === 'SALE10' ? 'Đã áp 10%' : posPromoCode.toUpperCase() === 'FREESHIP' ? 'Giảm 30k' : 'Không lệ'}
                  </span>
                )}
              </div>

              {/* Invoice Summary */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-neutral-650">
                  <span>Tổng tiền hàng</span>
                  <span className="font-mono">{formatPrice(posSubtotal)}</span>
                </div>
                {vipDiscountAmt > 0 && (
                  <div className="flex justify-between text-amber-700 font-semibold">
                    <span>Ưu đãi VIP ({posSelectedCustomer?.tier})</span>
                    <span className="font-mono">-{formatPrice(vipDiscountAmt)}</span>
                  </div>
                )}
                {promoDiscountAmt > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Mã giảm giá áp dụng</span>
                    <span className="font-mono">-{formatPrice(promoDiscountAmt)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-neutral-900 border-t pt-2 mt-2 text-sm">
                  <span>Khách phải thanh toán</span>
                  <span className="font-mono text-rose-650">{formatPrice(posTotal)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block">Phương thức thanh toán</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'cash', label: '💵 Tiền mặt' },
                    { key: 'transfer', label: '🏦 Chuyển khoản' },
                    { key: 'wallet', label: '📱 Ví điện tử' }
                  ].map(m => (
                    <button
                      key={m.key}
                      onClick={() => setPosPaymentMethod(m.key as any)}
                      className={`py-2 rounded-xl text-[10px] font-bold transition-all border cursor-pointer ${
                        posPaymentMethod === m.key
                          ? 'bg-neutral-950 text-white border-neutral-950'
                          : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* VietQR Dynamic Code Showcase if Bank Transfer */}
              {posPaymentMethod === 'transfer' && posTotal > 0 && (
                <div className="bg-neutral-50 border rounded-2xl p-4 flex flex-col items-center justify-center gap-3">
                  <div className="relative w-36 h-36 border-2 border-dashed border-rose-300 rounded-xl overflow-hidden bg-white flex items-center justify-center p-2 shadow-inner">
                    <Image
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://qr.vietqr.co/NOVYN-STUDIO-RECONCILIATION-AMOUNT-${posTotal}`}
                      alt="VietQR Chuyển khoản"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-black text-neutral-450 uppercase tracking-widest block">Mã VietQR động chứa số tiền</span>
                    <span className="text-[11px] font-bold text-rose-650 font-mono mt-0.5">{formatPrice(posTotal)}</span>
                  </div>
                </div>
              )}

              {/* Checkout CTA */}
              <button
                onClick={handleCheckoutPOS}
                disabled={posCart.length === 0}
                className="w-full py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase text-xs tracking-wider transition-all disabled:opacity-40 shadow-md shadow-rose-500/10 active:scale-95 cursor-pointer mt-2"
              >
                ✓ Chốt đơn & In hóa đơn lẻ
              </button>
            </div>
          </div>

          {/* POS Receipt roll Modal */}
          <AnimatePresence>
            {posPrintedReceipt && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-3xl border shadow-2xl p-6 w-full max-w-sm overflow-hidden text-neutral-800"
                >
                  {/* Styled 80mm thermal receipt header */}
                  <div className="border-b-2 border-dashed pb-4 text-center space-y-1">
                    <h2 className="text-lg font-black tracking-widest text-neutral-900 uppercase">NOVYN WEAR</h2>
                    <p className="text-[10px] text-neutral-500 font-medium">Quiet Luxury Minimalist Apparel showroom</p>
                    <p className="text-[9px] font-mono text-neutral-450 mt-1">{posPrintedReceipt.branch}</p>
                    <p className="text-[8px] text-neutral-450 font-mono">Invoice: {posPrintedReceipt.id} • {posPrintedReceipt.date}</p>
                  </div>

                  {/* Receipt items list */}
                  <div className="py-4 border-b-2 border-dashed space-y-2 text-xs">
                    {posPrintedReceipt.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-start font-medium leading-relaxed">
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-neutral-900 block truncate">{item.productName}</span>
                          <span className="text-[9px] text-neutral-450 font-mono">SKU: {item.sku}</span>
                        </div>
                        <span className="font-mono text-neutral-450 shrink-0">{item.quantity} x</span>
                        <span className="font-bold font-mono text-neutral-900 shrink-0 text-right w-20">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Receipt totals */}
                  <div className="py-4 border-b-2 border-dashed space-y-1 text-xs">
                    <div className="flex justify-between font-medium text-neutral-600">
                      <span>Cộng tiền hàng</span>
                      <span className="font-mono">{formatPrice(posPrintedReceipt.subtotal)}</span>
                    </div>
                    {posPrintedReceipt.vipDiscount > 0 && (
                      <div className="flex justify-between text-amber-700 font-bold">
                        <span>Chiết khấu VIP</span>
                        <span className="font-mono">-{formatPrice(posPrintedReceipt.vipDiscount)}</span>
                      </div>
                    )}
                    {posPrintedReceipt.promoDiscount > 0 && (
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>Giảm giá Promo</span>
                        <span className="font-mono">-{formatPrice(posPrintedReceipt.promoDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-neutral-900 text-sm pt-2">
                      <span>TỔNG THANH TOÁN</span>
                      <span className="font-mono text-rose-650">{formatPrice(posPrintedReceipt.total)}</span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="py-4 text-center text-[10px] text-neutral-500 font-medium space-y-1">
                    <p>Thanh toán bằng: <span className="font-bold uppercase text-neutral-800">{posPrintedReceipt.paymentMethod}</span></p>
                    <p>Khách hàng: <span className="font-bold text-neutral-800">{posPrintedReceipt.customerName}</span></p>
                    <p>Thu ngân phục vụ: <span className="font-bold text-neutral-800">{posPrintedReceipt.cashierName}</span></p>
                    <p className="mt-4 italic tracking-wide uppercase font-bold text-neutral-400">✦ Cảm ơn quý khách đã chọn NOVYN! ✦</p>
                  </div>

                  {/* PDF Download mockup & Email receipt */}
                  <div className="space-y-2 mt-4">
                    <button 
                      onClick={() => {
                        showToast('✓ Đã tải xuống file hóa đơn PDF bán lẻ!', 'success');
                      }}
                      className="w-full py-2.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Tải hoá đơn PDF (Mô phỏng)
                    </button>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Nhập email gửi e-bill..."
                        value={posReceiptMail}
                        onChange={(e) => setPosReceiptMail(e.target.value)}
                        className="flex-grow px-3 py-2 border rounded-xl text-xs bg-white text-neutral-800 focus:outline-none"
                      />
                      <button 
                        onClick={() => {
                          if (!posReceiptMail.trim()) return;
                          showToast(`✓ Đã gửi E-Bill điện tử tới ${posReceiptMail}!`, 'success');
                          setPosReceiptMail('');
                        }}
                        className="bg-neutral-950 text-white text-[10px] font-bold px-4 py-2 rounded-xl hover:bg-neutral-800 cursor-pointer"
                      >
                        Gửi
                      </button>
                    </div>
                    <button
                      onClick={() => setPosPrintedReceipt(null)}
                      className="w-full py-2.5 bg-neutral-900 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer mt-4"
                    >
                      Đóng
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 2. STOCKER INVENTORY WARNING ALERTS TAB */}
      {activeTab === 'stocker-inventory' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-black text-neutral-950 uppercase tracking-tight flex items-center gap-2">
              <Box className="w-5 h-5 text-blue-500" />
              Quản lý kho & Cảnh báo tồn thấp
            </h3>
            <p className="text-xs text-neutral-450 mt-1">Stocker: <span className="font-bold text-neutral-850">{currentUser.name}</span> • Chi nhánh: <span className="font-bold text-neutral-850">{currentUser.branch || 'Chi nhánh Quận 1'}</span></p>
          </div>

          {/* Low stock alerts dashboard */}
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase text-rose-800 tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
              Cảnh báo tồn kho thấp (Low-Stock Alerts)
            </h4>
            <p className="text-[10px] text-rose-700 font-semibold">• Hệ thống tự động đánh dấu đỏ các biến thể có số lượng tồn dưới 3 sản phẩm tại {currentUser.branch}.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productsList.map(prod => {
                const branchName = currentUser.branch || 'Chi nhánh Quận 1';
                const totalStock = branchStock[prod.id]?.[branchName] || 0;
                
                // Variants simulation
                const isLow = totalStock < 8; // Simulate variant alert if total stock is low
                if (!isLow) return null;

                return (
                  <div key={prod.id} className="bg-white border-2 border-rose-200 rounded-2xl p-4 flex gap-3 shadow-inner">
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-rose-100">
                      <Image src={prod.images[0]} alt={prod.name} fill className="object-cover" unoptimized />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-neutral-900 truncate">{prod.name}</h5>
                      <span className="text-[9px] text-rose-600 font-black block mt-0.5 uppercase tracking-wide">Tồn thấp: {totalStock} chiếc!</span>
                      <span className="text-[9px] text-neutral-400 block mt-1 font-mono">SKU: NOVYN-{prod.category.toUpperCase()}</span>
                    </div>
                  </div>
                );
              })}
              {productsList.every(prod => (branchStock[prod.id]?.[currentUser.branch || 'Chi nhánh Quận 1'] || 0) >= 8) && (
                <p className="text-xs text-emerald-700 italic font-semibold">Tất cả sản phẩm tại chi nhánh đang ở mức tồn an toàn (&gt;= 8 cái).</p>
              )}
            </div>
          </div>

          {/* Standard stock tracking table */}
          <div className="bg-white border rounded-3xl p-5 shadow-sm">
            <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider mb-4">Danh sách tồn kho chi tiết sản phẩm</h4>
            <div className="overflow-x-auto max-h-[350px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                    <th className="p-3">Sản phẩm</th>
                    <th className="p-3">Danh mục</th>
                    <th className="p-3 text-center">Tồn kho hiện có</th>
                    <th className="p-3 text-center">Trạng thái kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-neutral-700 font-medium">
                  {productsList.map(prod => {
                    const branchName = currentUser.branch || 'Chi nhánh Quận 1';
                    const stock = branchStock[prod.id]?.[branchName] || 0;
                    const status = stock < 3 ? 'low' : stock < 10 ? 'medium' : 'safe';
                    return (
                      <tr key={prod.id} className="hover:bg-neutral-50/20">
                        <td className="p-3 flex items-center gap-2">
                          <div className="relative w-8 h-10 rounded overflow-hidden bg-neutral-100 shrink-0">
                            <Image src={prod.images[0]} alt={prod.name} fill className="object-cover" unoptimized />
                          </div>
                          <span className="font-bold text-neutral-900">{prod.name}</span>
                        </td>
                        <td className="p-3">{categoryLabel[prod.category] || prod.category}</td>
                        <td className="p-3 text-center font-bold font-mono">{stock} chiếc</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            status === 'low' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                            status === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                            'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          }`}>
                            {status === 'low' ? 'Cần nhập gấp' : status === 'medium' ? 'Tồn vừa phải' : 'An toàn'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. STOCKER TRANSFER & DAMAGED GOODS TAB */}
      {activeTab === 'stocker-transfer' && (
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-black text-neutral-950 uppercase tracking-tight flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-500" />
              Phiếu chuyển kho liên chi nhánh & Hàng lỗi
            </h3>
            <p className="text-xs text-neutral-450 mt-1">Quyền hạn: <span className="font-bold text-neutral-850">Stocker & Manager</span></p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Chuyển kho Panel */}
            <div className="lg:col-span-6 bg-white border rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850 flex items-center gap-1">
                <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" style={{ animationDuration: '3s' }} />
                Yêu cầu chuyển kho liên chi nhánh (Inventory Transfer)
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Chọn sản phẩm cần chuyển</label>
                  <select
                    value={newTransferProductId}
                    onChange={(e) => {
                      setNewTransferProductId(e.target.value);
                      const p = productsList.find(item => item.id === e.target.value);
                      if (p && p.colors) {
                        setNewTransferColor(p.colors[0]?.name || p.colors[0] || 'Oatmeal');
                      }
                    }}
                    className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {productsList.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Size</label>
                    <select
                      value={newTransferSize}
                      onChange={(e) => setNewTransferSize(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                    >
                      {['S', 'M', 'L', 'XL'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Màu sắc</label>
                    <select
                      value={newTransferColor}
                      onChange={(e) => setNewTransferColor(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                    >
                      <option value="">-- Chọn màu --</option>
                      {productsList.find(p => p.id === newTransferProductId)?.colors?.map((c: any) => {
                        const name = c.name || c;
                        return <option key={name} value={name}>{name}</option>;
                      })}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Số lượng chuyển</label>
                    <input
                      type="number"
                      min={1}
                      value={newTransferQty}
                      onChange={(e) => setNewTransferQty(parseInt(e.target.value) || 1)}
                      className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Từ chi nhánh</label>
                    <select
                      value={newTransferFrom}
                      onChange={(e) => setNewTransferFrom(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                    >
                      <option value="Chi nhánh Quận 1">Chi nhánh Quận 1</option>
                      <option value="Chi nhánh Thảo Điền">Chi nhánh Thảo Điền</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Đến chi nhánh</label>
                  <select
                    value={newTransferTo}
                    onChange={(e) => setNewTransferTo(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                  >
                    <option value="Chi nhánh Thảo Điền">Chi nhánh Thảo Điền</option>
                    <option value="Chi nhánh Quận 1">Chi nhánh Quận 1</option>
                  </select>
                </div>

                <button
                  onClick={handleCreateTransfer}
                  className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider transition-colors active:scale-95 cursor-pointer mt-2"
                >
                  Tạo phiếu chuyển kho ngay
                </button>
              </div>
            </div>

            {/* Quản lý hàng lỗi Panel */}
            <div className="lg:col-span-6 bg-white border rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                Khai báo ghi nhận sản phẩm lỗi (Damaged Goods)
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Chọn sản phẩm lỗi</label>
                  <select
                    value={newDamageProductId}
                    onChange={(e) => {
                      setNewDamageProductId(e.target.value);
                      const p = productsList.find(item => item.id === e.target.value);
                      if (p && p.colors) {
                        setNewDamageColor(p.colors[0]?.name || p.colors[0] || 'Oatmeal');
                      }
                    }}
                    className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {productsList.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Size</label>
                    <select
                      value={newDamageSize}
                      onChange={(e) => setNewDamageSize(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                    >
                      {['S', 'M', 'L', 'XL'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Màu</label>
                    <select
                      value={newDamageColor}
                      onChange={(e) => setNewDamageColor(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                    >
                      <option value="">-- Chọn màu --</option>
                      {productsList.find(p => p.id === newDamageProductId)?.colors?.map((c: any) => {
                        const name = c.name || c;
                        return <option key={name} value={name}>{name}</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Số lượng lỗi</label>
                    <input
                      type="number"
                      min={1}
                      value={newDamageQty}
                      onChange={(e) => setNewDamageQty(parseInt(e.target.value) || 1)}
                      className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Tình trạng lỗi chi tiết</label>
                  <select
                    value={newDamageIssue}
                    onChange={(e) => setNewDamageIssue(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                  >
                    <option value="Rách vải / sứt chỉ">Rách vải / sứt chỉ</option>
                    <option value="Bẩn vải / ố màu">Bẩn vải / ố màu</option>
                    <option value="Mất tem mác tag">Mất tem mác tag</option>
                    <option value="Lỗi khóa kéo button">Lỗi khóa kéo button</option>
                  </select>
                </div>

                <button
                  onClick={handleLogDamage}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider transition-colors active:scale-95 cursor-pointer mt-2"
                >
                  ✓ Ghi nhận & tự động trừ kho khả dụng
                </button>
              </div>
            </div>
          </div>

          {/* Transfers and Damage history tables */}
          <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-6">
            <div>
              <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider mb-3">Nhật ký chuyển kho liên chi nhánh</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                      <th className="p-3">Sản phẩm</th>
                      <th className="p-3">Biến thể</th>
                      <th className="p-3">Từ</th>
                      <th className="p-3">Đến</th>
                      <th className="p-3 text-center">Số lượng</th>
                      <th className="p-3">Trạng thái</th>
                      <th className="p-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-neutral-700">
                    {transfers.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-6 text-neutral-400 italic">Chưa phát sinh phiếu chuyển kho.</td></tr>
                    ) : (
                      transfers.map(t => {
                        const isDestination = t.toBranch === currentUser.branch;
                        const isPending = t.status === 'shipping';
                        return (
                          <tr key={t.id} className="hover:bg-neutral-50/20">
                            <td className="p-3 font-bold text-neutral-900">{t.productName}</td>
                            <td className="p-3">{t.size} / {t.color}</td>
                            <td className="p-3 font-semibold text-neutral-600">{t.fromBranch.replace('Chi nhánh ', '')}</td>
                            <td className="p-3 font-semibold text-neutral-600">{t.toBranch.replace('Chi nhánh ', '')}</td>
                            <td className="p-3 text-center font-bold font-mono">{t.quantity} chiếc</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                isPending ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              }`}>
                                {isPending ? 'Đang giao' : 'Đã nhận'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {isPending && isDestination ? (
                                <button
                                  onClick={() => handleReceiveTransfer(t.id)}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                  Nhận hàng
                                </button>
                              ) : (
                                <span className="text-[10px] text-neutral-400 font-bold">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider mb-3">Danh sách hàng lỗi đã tiêu hủy / trừ kho</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                      <th className="p-3">Sản phẩm</th>
                      <th className="p-3">Biến thể</th>
                      <th className="p-3">Cửa hàng</th>
                      <th className="p-3">Tình trạng lỗi</th>
                      <th className="p-3 text-center">Số lượng</th>
                      <th className="p-3 text-right">Ngày ghi nhận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-neutral-700">
                    {damagedGoods.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-6 text-neutral-400 italic">Chưa ghi nhận hàng lỗi rách bẩn.</td></tr>
                    ) : (
                      damagedGoods.map(d => (
                        <tr key={d.id} className="hover:bg-neutral-50/20 text-neutral-600">
                          <td className="p-3 font-bold text-neutral-900">{d.productName}</td>
                          <td className="p-3">{d.size} / {d.color}</td>
                          <td className="p-3">{d.branch.replace('Chi nhánh ', '')}</td>
                          <td className="p-3 text-rose-700 font-bold">{d.issue}</td>
                          <td className="p-3 text-center font-bold font-mono">{d.quantity} chiếc</td>
                          <td className="p-3 text-right font-mono text-[10px] text-neutral-400">{d.createdAt}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. KPI & AUTOMATED PAYROLL TAB */}
      {activeTab === 'accountant-kpi-payroll' && (
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-black text-neutral-950 uppercase tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-500" />
              Báo cáo hiệu năng KPI & Bảng lương nhân viên tự động
            </h3>
            <p className="text-xs text-neutral-450 mt-1">Đồng bộ tự động từ dữ liệu chấm công GPS, doanh số POS, và phụ cấp ca trực tháng này.</p>
          </div>

          {/* Commission slider config */}
          <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-500" />
              Cấu hình tỷ lệ % hoa hồng doanh số bán hàng (Commission rates)
            </h4>
            <p className="text-[10px] text-neutral-450">• Kéo thanh trượt để điều chỉnh phần trăm hoa hồng trích thưởng doanh số POS cho nhân sự.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
              {Object.keys(salesCommissions).map(cat => (
                <div key={cat} className="space-y-1.5 p-3.5 bg-neutral-50 rounded-2xl border">
                  <span className="font-bold text-neutral-800">{categoryLabel[cat] || cat}</span>
                  <input
                    type="range"
                    min={0.01}
                    max={0.10}
                    step={0.005}
                    value={salesCommissions[cat]}
                    onChange={(e) => setSalesCommissions({ ...salesCommissions, [cat]: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between font-mono text-[10px] font-bold text-emerald-700">
                    <span>Rate:</span>
                    <span>{(salesCommissions[cat] * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payroll Automated table */}
          <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider">Bảng tổng hợp thu nhập nhân sự tự động tháng 06/2026</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                    <th className="p-3">Nhân sự</th>
                    <th className="p-3 text-center">Lương cứng</th>
                    <th className="p-3 text-center">Doanh số POS</th>
                    <th className="p-3 text-center">Hoa hồng %</th>
                    <th className="p-3 text-center">Phụ cấp ca</th>
                    <th className="p-3 text-center">Phạt đi muộn</th>
                    <th className="p-3 text-right">Lương thực lĩnh</th>
                    <th className="p-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-neutral-700 font-medium">
                  {usersList
                    .filter(u => ['employee', 'cashier', 'stocker'].includes(u.role))
                    .map(emp => {
                      // POS sales by this employee
                      const mySalesTotal = posHistory
                        .filter(h => h.cashierEmail === emp.email)
                        .reduce((sum, h) => sum + h.total, 0);

                      // Commission calculation based on categories
                      const commission = mySalesTotal * 0.03; // flat 3% commission for simplicty

                      // Shifts and lates
                      const completedShiftsCount = shiftRequests.filter(s => s.userId === emp.id && s.status === 'approved').length;
                      const allowance = completedShiftsCount * 50000;

                      const lateCheckinsCount = attendanceLogs.filter(a => a.userId === emp.id && a.timeIn > '08:00').length;
                      const fines = lateCheckinsCount * 100000;

                      const netSalary = (emp.salary || 8000000) + commission + allowance - fines;

                      // KPI progress
                      const progressPercent = Math.min(100, (mySalesTotal / kpiTarget) * 100);

                      return (
                        <tr key={emp.id} className="hover:bg-neutral-50/10">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                                {emp.name.split(' ').pop()?.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-neutral-900 block truncate w-32">{emp.name}</span>
                                <span className="text-[9px] text-neutral-400 font-mono block">{emp.id} • {emp.role}</span>
                              </div>
                            </div>
                            
                            {/* KPI progress bar */}
                            {emp.role === 'cashier' && (
                              <div className="mt-2 w-32">
                                <div className="flex justify-between text-[8px] text-neutral-400 font-bold mb-0.5 uppercase tracking-wide">
                                  <span>KPI POS:</span>
                                  <span>{progressPercent.toFixed(0)}%</span>
                                </div>
                                <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    className="h-full bg-emerald-500 rounded-full" 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                  />
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono">{formatPrice(emp.salary || 8000000)}</td>
                          <td className="p-3 text-center font-mono font-bold text-rose-650">{formatPrice(mySalesTotal)}</td>
                          <td className="p-3 text-center font-mono text-emerald-700 font-bold">+{formatPrice(commission)}</td>
                          <td className="p-3 text-center font-mono font-semibold">+{formatPrice(allowance)}</td>
                          <td className="p-3 text-center font-mono text-rose-600 font-bold">-{formatPrice(fines)}</td>
                          <td className="p-3 text-right font-mono font-black text-rose-650 text-xs">{formatPrice(netSalary)}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                showToast(`✓ Đã thanh toán lương ${formatPrice(netSalary)} cho ${emp.name}!`, 'success');
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider cursor-pointer transition-colors active:scale-95"
                            >
                              Chi trả
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. CRM VIP CLIENTS & CSKH TICKET TABS */}
      {(activeTab === 'cskh-customers' || activeTab === 'cskh-customers-vip' || activeTab === 'cskh-customers-tickets') && (
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-black text-neutral-950 uppercase tracking-tight flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-500" />
              {activeTab === 'cskh-customers-tickets' ? 'Đổi trả & Khiếu nại (CSKH Tickets)' : 'Khách hàng & Hệ thống khiếu nại CRM'}
            </h3>
            <p className="text-xs text-neutral-450 mt-1">
              {activeTab === 'cskh-customers-tickets' ? 'Ghi nhận sự vụ đổi trả hàng lỗi, chật size hoặc khiếu nại dịch vụ.' : 'Đồng bộ hoá tích luỹ chi tiêu, tự động tính điểm loyalty và xếp hạng VIP.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* VIP Loyalty list */}
            {(activeTab === 'cskh-customers' || activeTab === 'cskh-customers-vip') && (
              <div className={`${activeTab === 'cskh-customers-vip' ? 'lg:col-span-12' : 'lg:col-span-7'} bg-white border rounded-3xl p-5 shadow-sm space-y-4`}>
              <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider">Hồ sơ khách hàng thành viên VIP</h4>
              
              <div className="overflow-x-auto max-h-[350px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                      <th className="p-3">Họ Tên</th>
                      <th className="p-3">Hạng VIP</th>
                      <th className="p-3 text-center">Tích luỹ chi tiêu</th>
                      <th className="p-3 text-center">Điểm</th>
                      <th className="p-3 text-center">Chiết khấu đặc quyền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-neutral-700">
                    {crmClients.map(client => (
                      <tr key={client.id} className="hover:bg-neutral-50/20">
                        <td className="p-3 font-bold text-neutral-900">
                          {client.name}
                          <span className="text-[9px] text-neutral-400 font-mono block">{client.phone}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            client.tier === 'VVIP' ? 'bg-indigo-900 text-white' :
                            client.tier === 'Platinum' ? 'bg-purple-100 text-purple-700' :
                            client.tier === 'Gold' ? 'bg-amber-100 text-amber-700' :
                            'bg-neutral-100 text-neutral-600'
                          }`}>
                            {client.tier}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold">{formatPrice(client.totalSpent)}</td>
                        <td className="p-3 text-center font-mono text-emerald-700 font-bold">{client.points} pts</td>
                        <td className="p-3 text-center font-bold text-rose-650">
                          {client.tier === 'VVIP' ? '-15%' : client.tier === 'Platinum' ? '-10%' : client.tier === 'Gold' ? '-5%' : 'Freeship'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {/* Ticket center */}
            {(activeTab === 'cskh-customers' || activeTab === 'cskh-customers-tickets') && (
              <div className={`${activeTab === 'cskh-customers-tickets' ? 'lg:col-span-12' : 'lg:col-span-5'} bg-white border rounded-3xl p-5 shadow-sm space-y-4`}>
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850">Ghi nhận phiếu đổi trả / khiếu nại mới</h4>
              
              <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Tên khách hàng khiếu nại</label>
                  <input
                    type="text"
                    placeholder="Tên khách..."
                    value={newTicketCustomerName}
                    onChange={(e) => setNewTicketCustomerName(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Loại khiếu nại / dịch vụ</label>
                  <select
                    value={newTicketCategory}
                    onChange={(e) => setNewTicketCategory(e.target.value as any)}
                    className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                  >
                    <option value="Đổi size">Đổi size</option>
                    <option value="Trả hàng lỗi">Trả hàng lỗi</option>
                    <option value="Khiếu nại dịch vụ">Khiếu nại dịch vụ</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Chi tiết mô tả sự vụ</label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả sự việc rách bẩn hoặc chật eo..."
                    value={newTicketDesc}
                    onChange={(e) => setNewTicketDesc(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer mt-2"
                >
                  Khởi tạo phiếu hỗ trợ ngay
                </button>
              </form>
            </div>
            )}
          </div>

          {/* Tickets lists history */}
          {(activeTab === 'cskh-customers' || activeTab === 'cskh-customers-tickets') && (
            <div className="bg-white border rounded-3xl p-5 shadow-sm">
            <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider mb-4">Hộp thư phiếu xử lý khiếu nại (Customer Tickets Center)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                    <th className="p-3">Khách hàng</th>
                    <th className="p-3">Phân loại</th>
                    <th className="p-3">Mô tả chi tiết</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-neutral-700">
                  {cskhTickets.map(t => {
                    const isPending = t.status === 'pending';
                    return (
                      <tr key={t.id} className="hover:bg-neutral-50/15">
                        <td className="p-3 font-bold text-neutral-900">{t.customerName}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            t.category === 'Trả hàng lỗi' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            t.category === 'Đổi size' ? 'bg-sky-50 text-sky-600 border border-sky-100' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {t.category}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs truncate">{t.description}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            isPending ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse' : 'bg-emerald-50 text-emerald-600 border border-emerald-150'
                          }`}>
                            {isPending ? 'Đang xử lý' : 'Đã giải quyết'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {isPending ? (
                            <button
                              onClick={() => handleResolveTicket(t.id)}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Giải quyết xong
                            </button>
                          ) : (
                            <span className="text-[10px] text-neutral-450 font-bold">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      )}

      {/* 6. ACCOUNTANT FINANCE RECON & LEDGER AUDIT */}
      {activeTab === 'accountant-finance-recon' && (
        <div className="space-y-6">
          <div className="border-b pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-black text-neutral-950 uppercase tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                Đối soát két tiền mặt cuối ca & Báo cáo kết quả kinh doanh P&L
              </h3>
              <p className="text-xs text-neutral-450 mt-1">Đối chiếu tiền mặt kỳ vọng trên POS vs Thực tế kiểm đếm của thu ngân.</p>
            </div>
            
            <div className="flex gap-2">
              <button onClick={handleExportFinancialCSV} className="px-3.5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-850 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                <Download className="w-4 h-4" /> Xuất P&L doanh nghiệp CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Reconciliation panel */}
            <div className="lg:col-span-5 bg-white border rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850">Đối soát kiểm đếm két tiền mặt cửa hàng</h4>
              
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Cửa hàng đối soát</label>
                  <select
                    className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                    disabled
                  >
                    <option value="Chi nhánh Quận 1">Chi nhánh Quận 1</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Tiền mặt POS kỳ vọng</label>
                    <input
                      type="number"
                      disabled
                      value={posReconciliationExpected}
                      className="w-full p-2.5 border rounded-xl bg-neutral-50 font-bold font-mono text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Tiền mặt kiểm thực tế *</label>
                    <input
                      type="number"
                      required
                      placeholder="Nhập số tiền thực tế..."
                      value={posReconciliationActual || ''}
                      onChange={(e) => setPosReconciliationActual(parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 border rounded-xl bg-white focus:outline-none focus:border-neutral-400 font-bold font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Ghi chú đối soát</label>
                  <textarea
                    rows={2}
                    placeholder="Lý do chênh lệch hoặc ghi chú két..."
                    value={posReconciliationNotes}
                    onChange={(e) => setPosReconciliationNotes(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white focus:outline-none focus:border-neutral-400 text-xs font-medium resize-none"
                  />
                </div>

                <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border text-neutral-700">
                  <div className="flex justify-between items-center font-bold text-neutral-800 mb-2">
                    <span>Chênh lệch đối soát:</span>
                    <span className={posReconciliationActual - posReconciliationExpected === 0 ? 'text-emerald-600' : 'text-rose-500'}>
                      {posReconciliationActual - posReconciliationExpected > 0 ? '+' : ''}{formatPrice(posReconciliationActual - posReconciliationExpected)}
                    </span>
                  </div>
                  <p className="text-[10px] leading-normal text-neutral-450">
                    * Thủ quỹ hoặc thu ngân chịu trách nhiệm giải trình nếu có sai lệch lớn giữa tiền mặt thực tế và POS.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveReconciliation}
                  className="w-full py-3 rounded-xl bg-neutral-950 text-white font-bold uppercase tracking-wider text-xs hover:bg-neutral-850 active:scale-95 cursor-pointer shadow-sm transition-all"
                >
                  Xác nhận chốt két & đối soát
                </button>
              </div>
            </div>

            {/* P&L Interactive Ledger */}
            <div className="lg:col-span-7 bg-white border rounded-3xl p-5 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850">Sổ cái tài chính P&L Doanh nghiệp</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-450 font-bold uppercase">Kỳ báo cáo:</span>
                  <select
                    value={plPeriodType}
                    onChange={(e) => {
                      const newType = e.target.value as 'monthly' | 'quarterly';
                      setPlPeriodType(newType);
                      setPlSelectedPeriod(newType === 'monthly' ? '2026-06' : 'Q2 2026');
                    }}
                    className="p-1.5 border rounded-lg text-xs font-bold text-neutral-800 bg-[#FAF7F2] focus:outline-none"
                  >
                    <option value="monthly">Tháng</option>
                    <option value="quarterly">Quý</option>
                  </select>

                  {plPeriodType === 'monthly' ? (
                    <select
                      value={plSelectedPeriod}
                      onChange={(e) => setPlSelectedPeriod(e.target.value)}
                      className="p-1.5 border rounded-lg text-xs font-bold text-neutral-800 bg-[#FAF7F2] focus:outline-none"
                    >
                      <option value="2026-06">Tháng 6, 2026</option>
                      <option value="2026-05">Tháng 5, 2026</option>
                      <option value="2026-04">Tháng 4, 2026</option>
                    </select>
                  ) : (
                    <select
                      value={plSelectedPeriod}
                      onChange={(e) => setPlSelectedPeriod(e.target.value)}
                      className="p-1.5 border rounded-lg text-xs font-bold text-neutral-800 bg-[#FAF7F2] focus:outline-none"
                    >
                      <option value="Q2 2026">Quý II, 2026</option>
                      <option value="Q1 2026">Quý I, 2026</option>
                    </select>
                  )}
                </div>
              </div>
              
              {(() => {
                const plFilterByPeriod = (itemDateStr: string) => {
                  if (!itemDateStr) return false;
                  const dateOnly = itemDateStr.split(' ')[0]; // YYYY-MM-DD
                  if (plPeriodType === 'monthly') {
                    return dateOnly.startsWith(plSelectedPeriod);
                  } else {
                    const parts = plSelectedPeriod.split(' ');
                    const q = parts[0];
                    const y = parts[1];
                    if (!dateOnly.startsWith(y)) return false;
                    const m = parseInt(dateOnly.split('-')[1], 10);
                    if (q === 'Q1') return m >= 1 && m <= 3;
                    if (q === 'Q2') return m >= 4 && m <= 6;
                    if (q === 'Q3') return m >= 7 && m <= 9;
                    if (q === 'Q4') return m >= 10 && m <= 12;
                    return false;
                  }
                };

                const getFilteredDailyFinances = () => {
                  const dailyData: Record<string, {
                    date: string;
                    revenue: number;
                    cogs: number;
                    expenses: number;
                    restockCost: number;
                    salaryPaid: number;
                    profit: number;
                    orderCount: number;
                  }> = {};

                  allOrders.forEach((o: any) => {
                    if (o.status !== 'completed') return;
                    const date = o.createdAt.split(' ')[0];
                    if (!plFilterByPeriod(o.createdAt)) return;
                    if (!dailyData[date]) {
                      dailyData[date] = { date, revenue: 0, cogs: 0, expenses: 0, restockCost: 0, salaryPaid: 0, profit: 0, orderCount: 0 };
                    }
                    dailyData[date].revenue += o.total;
                    dailyData[date].cogs += o.total * 0.4;
                    dailyData[date].orderCount += 1;
                  });

                  expensesList.forEach((e: any) => {
                    if (!plFilterByPeriod(e.date)) return;
                    const date = e.date;
                    if (!dailyData[date]) {
                      dailyData[date] = { date, revenue: 0, cogs: 0, expenses: 0, restockCost: 0, salaryPaid: 0, profit: 0, orderCount: 0 };
                    }
                    dailyData[date].expenses += e.amount;
                  });

                  restockRecords.forEach((r: any) => {
                    if (r.status && r.status !== 'approved') return;
                    const date = r.createdAt.split(' ')[0];
                    if (!plFilterByPeriod(r.createdAt)) return;
                    if (!dailyData[date]) {
                      dailyData[date] = { date, revenue: 0, cogs: 0, expenses: 0, restockCost: 0, salaryPaid: 0, profit: 0, orderCount: 0 };
                    }
                    dailyData[date].restockCost += r.cost;
                  });

                  payrollRecords.forEach((p: any) => {
                    if (p.status !== 'paid' || !p.paymentDate) return;
                    const date = p.paymentDate.split(' ')[0];
                    if (!plFilterByPeriod(p.paymentDate)) return;
                    if (!dailyData[date]) {
                      dailyData[date] = { date, revenue: 0, cogs: 0, expenses: 0, restockCost: 0, salaryPaid: 0, profit: 0, orderCount: 0 };
                    }
                    dailyData[date].salaryPaid += p.salary;
                  });

                  const dates = Object.keys(dailyData).sort((a, b) => b.localeCompare(a));
                  return dates.map((date) => {
                    const day = dailyData[date];
                    day.profit = day.revenue - day.cogs - day.expenses - day.restockCost - day.salaryPaid;
                    return day;
                  });
                };

                const filteredDailyList = getFilteredDailyFinances();
                const totalRev = filteredDailyList.reduce((sum, d) => sum + d.revenue, 0);
                const totalCogs = filteredDailyList.reduce((sum, d) => sum + d.cogs, 0);
                const salaries = filteredDailyList.reduce((sum, d) => sum + d.salaryPaid, 0);
                const restock = filteredDailyList.reduce((sum, d) => sum + d.restockCost, 0);
                const expenses = filteredDailyList.reduce((sum, d) => sum + d.expenses, 0);

                const grossProfit = totalRev - totalCogs;
                const ebt = grossProfit - salaries - expenses - restock;
                const tax = ebt > 0 ? ebt * 0.2 : 0;
                const net = ebt - tax;
                const isNegative = net < 0;

                return (
                  <div className="space-y-4 text-xs font-medium text-neutral-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <span className="text-[9px] text-neutral-450 uppercase tracking-wide block font-black mb-1">Doanh thu gộp POS</span>
                        <span className="text-base font-black text-emerald-800 font-mono block">+{formatPrice(totalRev)}</span>
                        <span className="text-[8px] text-emerald-600 block mt-1 font-bold">100% Thu nhập kỳ này</span>
                      </div>
                      <div className={`p-4 rounded-2xl border ${isNegative ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'}`}>
                        <span className="text-[9px] text-neutral-450 uppercase tracking-wide block font-black mb-1">Lợi nhuận ròng sau thuế</span>
                        <span className={`text-base font-black font-mono block ${isNegative ? 'text-rose-650' : 'text-neutral-900'}`}>
                          {net >= 0 ? '+' : ''}{formatPrice(net)}
                        </span>
                        <span className="text-[8px] text-neutral-500 block mt-1 font-bold">
                          Biên ròng: {totalRev > 0 ? ((net / totalRev) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>

                    {isNegative && (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-black uppercase tracking-wider text-[10px]">Cảnh báo thâm hụt tài chính!</p>
                          <p className="font-semibold text-rose-700 text-[11px] leading-relaxed mt-0.5">
                            Lợi nhuận ròng của kỳ này đang bị âm. Tổng chi phí vận hành, lương thưởng, và giá vốn nhập hàng vượt quá doanh số thu về. Hãy tiến hành tối ưu hóa cơ cấu chi phí.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* AI Expense Recommendation */}
                    <div className="p-4 bg-amber-50/20 border border-amber-250/70 rounded-2xl space-y-2">
                      <span className="text-[9px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        AI Gợi ý tối ưu chi phí (Auto Recommendation)
                      </span>
                      <p className="text-[11px] text-neutral-700 font-semibold leading-relaxed">
                        {(() => {
                          const expRatio = totalRev > 0 ? (expenses / totalRev) * 100 : 0;
                          const salRatio = totalRev > 0 ? (salaries / totalRev) * 100 : 0;
                          if (isNegative || expRatio > 25 || salRatio > 25) {
                            return `💡 **Đề xuất của AI Muse**: Chi phí lương nhân sự (${salRatio.toFixed(1)}%) và chi phí vận hành (${expRatio.toFixed(1)}%) chiếm tỷ trọng cao. Khuyên dùng: 1) Cắt giảm chi phí quảng cáo Meta Ads kém hiệu quả (-15%), 2) Thương lượng lại 5% phí thuê mặt bằng chi nhánh Thảo Điền, 3) Sử dụng tính năng Shift Swap tự động để tối ưu hóa nhân sự giờ cao điểm.`;
                          }
                          return `💡 **Đề xuất của AI Muse**: Sức khỏe tài chính tốt, biên lợi nhuận ròng ổn định. Khuyên dùng: Tích lũy thặng dư và tái đầu tư 10% ngân sách vào chiến dịch tiếp thị KOLs/KOCs TikTok để bứt phá doanh số cho BST Summer Weightless 2026.`;
                        })()}
                      </p>
                    </div>

                    {/* Breakdown progress bars with Framer Motion glows */}
                    <div className="space-y-3.5 border-t pt-4">
                      {[
                        { label: 'Doanh thu (+)', val: totalRev, color: 'bg-emerald-500', max: totalRev },
                        { label: 'Giá vốn hàng bán COGS (-)', val: totalCogs, color: 'bg-rose-500', max: totalRev },
                        { label: 'Chi phí lương nhân sự (-)', val: salaries, color: 'bg-neutral-600', max: totalRev },
                        { label: 'Chi phí nhập kho restock (-)', val: restock, color: 'bg-amber-500', max: totalRev },
                        { label: 'Chi phí vận hành khác (-)', val: expenses, color: 'bg-neutral-400', max: totalRev }
                      ].map((item, idx) => {
                        const pct = totalRev > 0 ? (item.val / totalRev) * 100 : 0;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between font-bold text-neutral-750">
                              <span>{item.label}</span>
                              <span className="font-mono">{formatPrice(item.val)} ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                              <motion.div 
                                className={`h-full ${item.color}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1.2, delay: idx * 0.1, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Interactive Daily Ledger Table with Sticky Left Column */}
                    <div className="border-t pt-5">
                      <h5 className="text-[10px] font-black text-neutral-850 uppercase tracking-widest mb-3">Nhật ký tài chính chi tiết từng ngày</h5>
                      <div className="overflow-x-auto max-h-[300px] border border-neutral-100 rounded-2xl relative">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                              {/* Sticky left head */}
                              <th className="p-3 sticky left-0 bg-neutral-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Ngày</th>
                              <th className="p-3 text-center">Số đơn</th>
                              <th className="p-3 text-right">Doanh thu (+)</th>
                              <th className="p-3 text-right">COGS (-)</th>
                              <th className="p-3 text-right">Lương (-)</th>
                              <th className="p-3 text-right">Vốn nhập (-)</th>
                              <th className="p-3 text-right font-black text-neutral-900">Lợi nhuận (=)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                            {filteredDailyList.map((day) => (
                              <tr key={day.date} className="hover:bg-neutral-50/20 transition-colors">
                                {/* Sticky left column */}
                                <td className="p-3 font-mono font-bold text-neutral-900 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                  {day.date}
                                </td>
                                <td className="p-3 text-center font-mono text-neutral-555">{day.orderCount} đơn</td>
                                <td className="p-3 text-right font-mono font-bold text-emerald-600">+{formatPrice(day.revenue)}</td>
                                <td className="p-3 text-right font-mono text-neutral-400">-{formatPrice(day.cogs)}</td>
                                <td className="p-3 text-right font-mono text-neutral-400">
                                  {day.salaryPaid > 0 ? `-${formatPrice(day.salaryPaid)}` : '0 ₫'}
                                </td>
                                <td className="p-3 text-right font-mono text-neutral-400">
                                  {day.restockCost > 0 ? `-${formatPrice(day.restockCost)}` : '0 ₫'}
                                </td>
                                <td className={`p-3 text-right font-mono font-black ${day.profit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                  {day.profit >= 0 ? '+' : ''}{formatPrice(day.profit)}
                                </td>
                              </tr>
                            ))}
                            {filteredDailyList.length === 0 && (
                              <tr>
                                <td colSpan={7} className="text-center py-8 text-neutral-450 italic">
                                  Không có phát sinh tài chính trong kỳ được chọn.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 7. AI ASSISTANT & MARKETING TABS */}
      {activeTab === 'ai-copilot' && (
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              Novyn Muse AI Copilot & Content Hub
            </h3>
            <p className="text-xs text-neutral-450 mt-1">Trí tuệ nhân tạo hỗ trợ dự báo tồn kho, tối ưu hóa nhập hàng và tự động tạo caption tiếp thị.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* AI inventory optimizer */}
            <div className="lg:col-span-5 bg-white border rounded-3xl p-5 shadow-sm space-y-5">
              <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                AI Inventory Optimizer & Anomaly Detector
              </h4>

              <div className="space-y-4 text-xs font-medium text-neutral-700">
                
                {/* AI Replenishment alert */}
                <div className="bg-amber-550/10 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <span className="text-[9px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
                    AI Đề xuất nhập kho (AI Replenishment)
                  </span>
                  <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                    💡 **Tốc độ bán hàng tăng 15%**: Đề xuất nhập thêm **20 chiếc** sản phẩm **Áo Sơ Mi Linen Màu Cát (Size M)** tại showroom Quận 1 để tránh đứt hàng trong 14 ngày tới.
                  </p>
                </div>

                {/* AI Stock optimizer alert */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
                  <span className="text-[9px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                    AI Xử lý tồn kho chậm (AI Stock Optimizer)
                  </span>
                  <p className="text-[11px] text-blue-800 font-semibold leading-relaxed">
                    ⚠️ **Hàng tồn đọng &gt; 60 ngày**: Mẫu **Áo Thun Supima màu Trắng (Size S)** hiện đang có tỷ lệ tồn kho cao. Khuyên dùng: Chạy flash-sale giảm **30%** hoặc tặng quà kèm đơn hàng để tối ưu dòng tiền.
                  </p>
                </div>

                {/* AI Anomaly Alert */}
                <div className="bg-rose-50 border border-rose-250 rounded-2xl p-4 space-y-2">
                  <span className="text-[9px] font-black text-rose-900 uppercase tracking-widest flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
                    AI Phát hiện bất thường (AI Anomaly Detector)
                  </span>
                  <p className="text-[11px] text-rose-800 font-semibold leading-relaxed">
                    🔔 **Chỉ số bất thường két**: Số lượng hóa đơn bị hủy bởi thu ngân tại chi nhánh Thảo Điền tăng **4%** trong 3 ngày qua. Giám đốc nên tiến hành đối soát camera.
                  </p>
                </div>
              </div>
            </div>

            {/* AI SEO & Content Creator */}
            <div className="lg:col-span-7 bg-white border rounded-3xl p-5 shadow-sm space-y-5">
              <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                AI Content Marketing & SEO Creator
              </h4>

              <div className="space-y-4 text-xs">
                
                {/* SEO Product parameters */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Chất liệu vải</label>
                    <input
                      type="text"
                      value={aiSEOProductAttributes.material}
                      onChange={(e) => setAiSEOProductAttributes({ ...aiSEOProductAttributes, material: e.target.value })}
                      className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Phom dáng</label>
                    <input
                      type="text"
                      value={aiSEOProductAttributes.fit}
                      onChange={(e) => setAiSEOProductAttributes({ ...aiSEOProductAttributes, fit: e.target.value })}
                      className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Phối màu</label>
                    <input
                      type="text"
                      value={aiSEOProductAttributes.color}
                      onChange={(e) => setAiSEOProductAttributes({ ...aiSEOProductAttributes, color: e.target.value })}
                      className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Bộ sưu tập</label>
                    <input
                      type="text"
                      value={aiSEOProductAttributes.season}
                      onChange={(e) => setAiSEOProductAttributes({ ...aiSEOProductAttributes, season: e.target.value })}
                      className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button
                    onClick={handleGenerateSEODesc}
                    className="py-2.5 bg-neutral-900 text-white rounded-xl text-[11px] font-bold hover:bg-neutral-805 transition-colors cursor-pointer"
                  >
                    Viết mô tả SEO AI
                  </button>
                  <button
                    onClick={handleGenerateCaption}
                    className="py-2.5 bg-rose-500 text-white rounded-xl text-[11px] font-bold hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    Tạo Caption Đa Kênh
                  </button>
                  <button
                    onClick={handleGenerateTitleTags}
                    className="py-2.5 bg-amber-600 text-white rounded-xl text-[11px] font-bold hover:bg-amber-700 transition-colors cursor-pointer"
                  >
                    Tạo Tiêu đề & Tag
                  </button>
                  <button
                    onClick={handleGenerateMeta}
                    className="py-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Tạo Meta SEO
                  </button>
                  <button
                    onClick={handleGenerateBlog}
                    className="py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Viết Blog Thời trang
                  </button>
                  <button
                    onClick={handleGenerateBrief}
                    className="py-2.5 bg-emerald-600 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    Tóm tắt Chiến dịch
                  </button>
                </div>

                {/* AI Generative Output layout */}
                {aiGenerating ? (
                  <div className="bg-neutral-50 rounded-2xl p-6 border flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                    <span className="font-bold text-neutral-450 uppercase tracking-wide text-[10px]">Novyn Muse AI đang suy nghĩ...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiGeneratedSEODesc && (
                      <div className="p-4 bg-amber-50/20 border border-amber-250/70 rounded-2xl space-y-1">
                        <span className="text-[9px] font-black text-amber-900 uppercase tracking-widest block mb-1.5">Mô tả SEO sản phẩm AI</span>
                        <p className="text-[11px] text-neutral-700 whitespace-pre-line leading-relaxed font-semibold">{aiGeneratedSEODesc}</p>
                      </div>
                    )}

                    {aiGeneratedTitleTags && (
                      <div className="p-4 bg-amber-550/10 border border-amber-200 rounded-2xl space-y-1">
                        <span className="text-[9px] font-black text-amber-950 uppercase tracking-widest block mb-1.5">Tiêu đề & Thẻ Tags AI</span>
                        <p className="text-[11px] text-neutral-700 whitespace-pre-line leading-relaxed font-semibold">{aiGeneratedTitleTags}</p>
                      </div>
                    )}

                    {aiGeneratedMeta && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                        <span className="text-[9px] font-black text-blue-900 uppercase tracking-widest block mb-1.5">Thẻ SEO Meta AI</span>
                        <p className="text-[11px] text-neutral-700 whitespace-pre-line leading-relaxed font-semibold">{aiGeneratedMeta}</p>
                      </div>
                    )}

                    {aiGeneratedBlog && (
                      <div className="p-4 bg-neutral-50 border border-neutral-250 rounded-2xl space-y-1">
                        <span className="text-[9px] font-black text-neutral-900 uppercase tracking-widest block mb-1.5">Bài viết Blog thời trang AI</span>
                        <p className="text-[11px] text-neutral-700 whitespace-pre-line leading-relaxed font-semibold">{aiGeneratedBlog}</p>
                      </div>
                    )}

                    {aiGeneratedBrief && (
                      <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-2xl space-y-1">
                        <span className="text-[9px] font-black text-emerald-900 uppercase tracking-widest block mb-1.5">Bản tóm tắt Chiến dịch AI</span>
                        <p className="text-[11px] text-neutral-700 whitespace-pre-line leading-relaxed font-semibold">{aiGeneratedBrief}</p>
                      </div>
                    )}
                    
                    {aiGeneratedCaption && (
                      <div className="p-4 bg-rose-50/20 border border-rose-250/70 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-rose-900 uppercase tracking-widest">Caption tiếp thị đa kênh AI</span>
                          
                          <div className="flex gap-1.5">
                            {['facebook', 'tiktok', 'instagram'].map(ch => (
                              <button
                                key={ch}
                                onClick={() => setAiSelectedChannel(ch as any)}
                                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                  aiSelectedChannel === ch ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'
                                }`}
                              >
                                {ch}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-1.5 border-b pb-2">
                          {['trendy', 'elegant', 'minimalist'].map(tn => (
                            <button
                              key={tn}
                              onClick={() => setAiSelectedTone(tn as any)}
                              className={`px-2.5 py-0.5 rounded border text-[8px] font-semibold ${
                                aiSelectedTone === tn ? 'border-rose-450 bg-rose-50 text-rose-700' : 'border-neutral-200 text-neutral-500'
                              }`}
                            >
                              {tn}
                            </button>
                          ))}
                        </div>

                        <p className="text-[11px] text-neutral-700 whitespace-pre-line leading-relaxed font-semibold">{aiGeneratedCaption}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI customer reply dialog block */}
          <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider">AI Trợ lý kịch bản hội thoại tư vấn CSKH</h4>
            <p className="text-[10px] text-neutral-450">• Nhấp chọn tình huống khách hàng chat để AI Muse tự động đề xuất phương án trả lời tinh tế.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                {[
                  { id: 'size', title: '💬 Khách: "68kg cao 1m72 mặc size gì vừa em?"' },
                  { id: 'refund', title: '💬 Khách: "Vải đầm nhận bị bung cúc chỉ rồi em ơi..."' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleAICannedReply(item.id)}
                    className="w-full text-left p-3.5 rounded-2xl border bg-neutral-50 hover:bg-neutral-100 transition-colors text-xs font-bold text-neutral-700 cursor-pointer block"
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              {aiCannedReplyOutput && (
                <div className="bg-amber-50/20 border border-amber-250/70 p-4 rounded-2xl animate-pulse space-y-1.5">
                  <span className="text-[9px] font-black text-amber-900 uppercase tracking-widest block mb-1">Novyn Muse AI đề xuất phản hồi:</span>
                  <p className="text-xs text-neutral-700 leading-relaxed font-semibold whitespace-pre-line bg-white p-3 rounded-xl border">
                    {aiCannedReplyOutput}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. OMNICHANNEL HUB TAB */}
      {activeTab === 'omnichannel' && (
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-505" />
              Đồng bộ hóa đơn hàng & Doanh thu đa kênh (Omnichannel Hub)
            </h3>
            <p className="text-xs text-neutral-450 mt-1">Giám sát luồng đơn hàng thời gian thực đồng bộ từ Web, Shopee, TikTok Shop, Lazada và Chat inbox.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Realtime stream */}
            <div className="lg:col-span-8 bg-white border rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider">Luồng đơn hàng đa kênh đồng bộ thời gian thực</h4>
              
              <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                {[
                  { id: 'SHP-12903', channel: 'Shopee', name: 'Nguyễn Thị Thanh', total: 680000, date: '2026-06-02 09:15', status: 'shipping' },
                  { id: 'TTS-88127', channel: 'TikTok Shop', name: 'Trần Minh Đức', total: 1250000, date: '2026-06-02 09:30', status: 'completed' },
                  { id: 'LAZ-44912', channel: 'Lazada', name: 'Đoàn Hùng Anh', total: 390000, date: '2026-06-02 09:40', status: 'pending' },
                  { id: 'WEB-99120', channel: 'Website', name: 'Lâm Khánh Vy', total: 2200000, date: '2026-06-02 09:50', status: 'completed' },
                  { id: 'FB-33921', channel: 'Facebook Inbox', name: 'Phạm Thu Hằng', total: 950000, date: '2026-06-02 10:05', status: 'pending' }
                ].map(ord => (
                  <div key={ord.id} className="bg-neutral-50 rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs font-semibold text-neutral-800 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-white ${
                          ord.channel === 'Shopee' ? 'bg-orange-500' :
                          ord.channel === 'TikTok Shop' ? 'bg-neutral-900' :
                          ord.channel === 'Lazada' ? 'bg-blue-600' :
                          ord.channel === 'Website' ? 'bg-rose-500' :
                          'bg-sky-500'
                        }`}>
                          {ord.channel}
                        </span>
                        <span className="text-neutral-900 font-bold">{ord.id}</span>
                      </div>
                      <span className="text-[11px] text-neutral-600 block">Khách hàng: {ord.name} • lúc {ord.date}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold shrink-0 justify-between sm:justify-end">
                      <span className="font-mono text-rose-650 font-black">{formatPrice(ord.total)}</span>
                      
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                        ord.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        ord.status === 'shipping' ? 'bg-blue-50 text-blue-600 border border-blue-100 animate-pulse' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {ord.status === 'completed' ? 'Đã giao' : ord.status === 'shipping' ? 'Đang ship' : 'Chờ duyệt'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales share metrics */}
            <div className="lg:col-span-4 bg-white border rounded-3xl p-5 shadow-sm space-y-5">
              <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider">Tỷ trọng doanh thu giữa các kênh bán hàng</h4>
              
              <div className="space-y-4 text-xs font-medium text-neutral-700">
                {[
                  { channel: 'Website chính thức', pct: 40, amt: 12500000, color: 'bg-rose-500' },
                  { channel: 'Shopee Mall', pct: 25, amt: 7800000, color: 'bg-orange-500' },
                  { channel: 'TikTok Shop', pct: 20, amt: 6200000, color: 'bg-neutral-900' },
                  { channel: 'Lazada Mall', pct: 10, amt: 3100000, color: 'bg-blue-600' },
                  { channel: 'Facebook Inbox', pct: 5, amt: 1560000, color: 'bg-sky-500' }
                ].map((ch, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-bold text-neutral-750">
                      <span>{ch.channel}</span>
                      <span className="font-mono">{ch.pct}% ({formatPrice(ch.amt)})</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${ch.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${ch.pct}%` }}
                        transition={{ duration: 1.2, delay: idx * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. PRODUCTS DATABASE TAB */}
      {activeTab === 'products-database' && ['director', 'accountant', 'manager', 'employee', 'cashier', 'stocker', 'cskh'].includes(currentUser.role) && (
        <div className="space-y-6">
          <div className="border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight flex items-center gap-2">
                <Box className="w-5 h-5 text-neutral-805" />
                Cơ sở dữ liệu sản phẩm NOVYN.WEAR
              </h3>
              <p className="text-xs text-neutral-450 mt-1">
                Xem danh sách sản phẩm hệ thống, điều chỉnh thông tin, ẩn/hiện, sửa hoặc xóa sản phẩm.
              </p>
            </div>
            
            {currentUser.role === 'director' && (
              <button
                onClick={() => {
                  setDbModalMode('create');
                  setDbProductName('');
                  setDbProductCategory('Tops');
                  setDbProductPrice(0);
                  setDbProductDescription('');
                  setDbProductImages('');
                  setDbProductColors('');
                  setDbProductSizes(['S', 'M', 'L']);
                  setDbProductInitialStock(20);
                  setDbProductIsActive(true);
                  setDbModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" /> Thêm sản phẩm mới
              </button>
            )}
          </div>

          {/* Table Toolbar Search and Filter */}
          <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên hoặc mã SKU..."
                value={dbSearchQuery}
                onChange={(e) => setDbSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:border-neutral-900 text-neutral-800"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Category filter tabs */}
            <div className="flex gap-1.5 overflow-x-auto select-none no-scrollbar">
              {[
                { id: 'all', name: 'Tất cả danh mục' },
                { id: 'Tops', name: 'Áo' },
                { id: 'Bottoms', name: 'Quần' },
                { id: 'Dresses', name: 'Đầm' },
                { id: 'Outerwear', name: 'Áo khoác' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setDbCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all border cursor-pointer active:scale-95 ${
                    dbCategoryFilter === cat.id
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                      : 'bg-white hover:bg-neutral-50 text-neutral-500 border-neutral-200 hover:text-neutral-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm overflow-visible">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                    <th className="p-3">Ảnh</th>
                    <th className="p-3">Tên sản phẩm / SKU</th>
                    <th className="p-3">Danh mục</th>
                    <th className="p-3 text-right">Giá bán</th>
                    <th className="p-3 text-center">Tồn kho</th>
                    <th className="p-3">Màu sắc</th>
                    <th className="p-3">Kích cỡ</th>
                    <th className="p-3 text-center">Trạng thái</th>
                    {currentUser.role === 'director' && <th className="p-3 text-center">Thao tác</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                  {(() => {
                    const filtered = productsList
                      .filter(prod => prod.name.toLowerCase().includes(dbSearchQuery.toLowerCase()) || prod.id.toLowerCase().includes(dbSearchQuery.toLowerCase()))
                      .filter(prod => dbCategoryFilter === 'all' || prod.category === dbCategoryFilter);

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={currentUser.role === 'director' ? 9 : 8} className="p-8 text-center text-neutral-400 italic font-normal bg-neutral-50/10">
                            Không tìm thấy sản phẩm nào khớp với điều kiện lọc.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((prod) => (
                      <tr key={prod.id} className="hover:bg-neutral-50/20 transition-colors">
                        <td className="p-3">
                          <div className="relative w-10 h-12 rounded-lg overflow-hidden border">
                            <img
                              src={prod.images && prod.images[0] ? prod.images[0] : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100'}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-neutral-900 block">{prod.name}</span>
                          <span className="text-[9px] text-neutral-455 font-mono font-bold">{prod.id}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[9px] bg-neutral-100 font-bold text-neutral-600">
                            {categoryLabel[prod.category] || prod.category}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-neutral-900">
                          {formatPrice(prod.price)}
                        </td>
                        <td className="p-3 text-center font-mono">
                          <span className={`font-bold ${prod.stock < 5 ? 'text-rose-600 animate-pulse' : 'text-neutral-500'}`}>
                            {prod.stock} chiếc
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1.5">
                            {prod.colors?.map((col: any, ci: number) => (
                              <span
                                key={ci}
                                className="w-3 h-3 rounded-full border border-neutral-300 inline-block shadow-sm"
                                style={{ backgroundColor: col.hex }}
                                title={col.name}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1 flex-wrap">
                            {prod.sizes?.map((sz: string, si: number) => (
                              <span key={si} className="text-[8px] font-black border px-1 rounded text-neutral-500">
                                {sz}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            prod.isActive !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-neutral-100 text-neutral-400 border'
                          }`}>
                            {prod.isActive !== false ? 'Đang bán' : 'Ngừng bán'}
                          </span>
                        </td>
                        {currentUser.role === 'director' && (
                          <td className="p-3 text-center relative">
                            {/* 3-dots actions menu */}
                            <div className="inline-block text-left">
                              <button
                                onClick={() => setActiveRowDropdown(activeRowDropdown === prod.id ? null : prod.id)}
                                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer active:scale-95"
                              >
                                <span className="font-bold text-sm leading-none block px-1">•••</span>
                              </button>

                              {activeRowDropdown === prod.id && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setActiveRowDropdown(null)} />
                                  <div className="absolute right-0 mt-1 w-40 bg-white border border-brand-border rounded-xl shadow-lg z-50 p-1.5 text-xs text-left">
                                    <button
                                      onClick={() => {
                                        setActiveRowDropdown(null);
                                        setDbSelectedProductId(prod.id);
                                        setDbProductName(prod.name);
                                        setDbProductCategory(prod.category);
                                        setDbProductPrice(prod.price);
                                        setDbProductDescription(prod.description || '');
                                        setDbProductImages(prod.images ? prod.images.join(', ') : '');
                                        setDbProductColors(prod.colors ? prod.colors.map((c: any) => `${c.name}|${c.hex}`).join(', ') : '');
                                        setDbProductSizes(prod.sizes || []);
                                        setDbProductIsActive(prod.isActive !== false);
                                        setDbModalMode('edit');
                                        setDbModalOpen(true);
                                      }}
                                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 text-neutral-800 font-semibold flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Edit2 className="w-3.5 h-3.5 text-neutral-500" /> Sửa thông tin
                                    </button>

                                    <button
                                      onClick={() => {
                                        setActiveRowDropdown(null);
                                        if (updateGlobalProductDetails) {
                                          const newActive = prod.isActive === false;
                                          updateGlobalProductDetails(
                                            prod.id,
                                            prod.name,
                                            prod.description || '',
                                            prod.category,
                                            prod.price,
                                            prod.colors,
                                            prod.sizes,
                                            prod.images,
                                            newActive
                                          );
                                        }
                                      }}
                                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 text-neutral-800 font-semibold flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-500" /> {prod.isActive !== false ? 'Ngừng bán' : 'Cho phép bán'}
                                    </button>

                                    <button
                                      onClick={() => {
                                        setActiveRowDropdown(null);
                                        if (addGlobalProduct) {
                                          addGlobalProduct(
                                            `${prod.name} (Bản sao)`,
                                            prod.category,
                                            prod.price,
                                            prod.description || '',
                                            prod.images || [],
                                            prod.colors || [],
                                            prod.sizes || [],
                                            20
                                          );
                                        }
                                      }}
                                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 text-neutral-800 font-semibold flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <PlusCircle className="w-3.5 h-3.5 text-neutral-500" /> Nhân bản
                                    </button>

                                    <div className="border-t border-brand-border/60 my-1" />

                                    <button
                                      onClick={() => {
                                        setActiveRowDropdown(null);
                                        if (deleteGlobalProduct) {
                                          if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm "${prod.name}" khỏi hệ thống?`)) {
                                            deleteGlobalProduct(prod.id);
                                          }
                                        }
                                      }}
                                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 font-semibold flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Xóa vĩnh viễn
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* ADD / EDIT PRODUCT MODAL */}
          {dbModalOpen && (
            <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border max-w-lg w-full rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setDbModalOpen(false)}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center cursor-pointer font-bold text-neutral-600"
                >
                  ×
                </button>
                
                <h3 className="text-sm font-black text-neutral-950 tracking-widest uppercase mb-4">
                  {dbModalMode === 'create' ? 'Thêm sản phẩm mới' : 'Cập nhật sản phẩm'}
                </h3>
                
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const colorArray = dbProductColors.split(',').map(c => {
                      const parts = c.trim().split('|');
                      return {
                        name: parts[0] || 'Default',
                        hex: parts[1] || '#999999'
                      };
                    }).filter(c => c.name);

                    const imageArray = dbProductImages.split(',').map(img => img.trim()).filter(Boolean);
                    if (imageArray.length === 0) {
                      imageArray.push('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400');
                    }

                    if (dbModalMode === 'create') {
                      if (addGlobalProduct) {
                        addGlobalProduct(
                          dbProductName,
                          dbProductCategory,
                          dbProductPrice,
                          dbProductDescription,
                          imageArray,
                          colorArray,
                          dbProductSizes,
                          dbProductInitialStock
                        );
                      }
                    } else {
                      if (updateGlobalProductDetails) {
                        updateGlobalProductDetails(
                          dbSelectedProductId,
                          dbProductName,
                          dbProductDescription,
                          dbProductCategory,
                          dbProductPrice,
                          colorArray,
                          dbProductSizes,
                          imageArray,
                          dbProductIsActive
                        );
                      }
                    }
                    setDbModalOpen(false);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="text-[9px] font-bold text-neutral-450 block mb-1">Tên sản phẩm *</label>
                    <input
                      type="text"
                      required
                      value={dbProductName}
                      onChange={(e) => setDbProductName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white focus:outline-none font-semibold text-neutral-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold text-neutral-450 block mb-1">Danh mục *</label>
                      <select
                        value={dbProductCategory}
                        onChange={(e) => setDbProductCategory(e.target.value)}
                        className="w-full px-3 py-2 border bg-white rounded-xl font-bold text-neutral-800 focus:outline-none"
                      >
                        <option value="Tops">Tops (Áo)</option>
                        <option value="Bottoms">Bottoms (Quần)</option>
                        <option value="Dresses">Dresses (Đầm)</option>
                        <option value="Outerwear">Outerwear (Áo khoác)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-neutral-450 block mb-1">Giá bán lẻ (₫) *</label>
                      <input
                        type="number"
                        required
                        value={dbProductPrice || ''}
                        onChange={(e) => setDbProductPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-xl bg-white focus:outline-none font-bold text-neutral-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-neutral-450 block mb-1">Ảnh (Link Unsplash cách nhau bởi dấu phẩy) *</label>
                    <input
                      type="text"
                      required
                      placeholder="URL 1, URL 2..."
                      value={dbProductImages}
                      onChange={(e) => setDbProductImages(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white focus:outline-none font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold text-neutral-450 block mb-1">Màu sắc (Tên|Hex, Tên|Hex) *</label>
                      <input
                        type="text"
                        required
                        placeholder="Trắng|#FFFFFF, Đen|#111827"
                        value={dbProductColors}
                        onChange={(e) => setDbProductColors(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-white focus:outline-none font-semibold text-neutral-700"
                      />
                    </div>
                    {dbModalMode === 'create' ? (
                      <div>
                        <label className="text-[9px] font-bold text-neutral-450 block mb-1">Tồn kho ban đầu *</label>
                        <input
                          type="number"
                          required
                          value={dbProductInitialStock}
                          onChange={(e) => setDbProductInitialStock(Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-xl bg-white focus:outline-none font-bold text-neutral-800"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col justify-end pb-2">
                        <label className="flex items-center gap-2 font-bold text-neutral-850 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dbProductIsActive}
                            onChange={(e) => setDbProductIsActive(e.target.checked)}
                            className="rounded"
                          />
                          Sản phẩm đang mở bán
                        </label>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-neutral-450 block mb-2">Các kích cỡ hỗ trợ (Sizes) *</label>
                    <div className="flex gap-4">
                      {['S', 'M', 'L', 'XL', 'F'].map(size => (
                        <label key={size} className="flex items-center gap-1.5 text-xs font-black text-neutral-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dbProductSizes.includes(size)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDbProductSizes(prev => [...prev, size]);
                              } else {
                                setDbProductSizes(prev => prev.filter(s => s !== size));
                              }
                            }}
                            className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                          />
                          {size}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-neutral-450 block mb-1">Mô tả sản phẩm *</label>
                    <textarea
                      required
                      value={dbProductDescription}
                      onChange={(e) => setDbProductDescription(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white focus:outline-none font-semibold text-neutral-800"
                      rows={3}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-850 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    {dbModalMode === 'create' ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 10. COUPONS MANAGEMENT TAB */}
      {activeTab === 'coupons-management' && ['director', 'accountant', 'manager', 'cskh', 'employee', 'cashier'].includes(currentUser.role) && (
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-neutral-805" />
              Quản lý mã giảm giá (Coupons)
            </h3>
            <p className="text-xs text-neutral-450 mt-1">
              Phát hành mã giảm giá động cho các chiến dịch tiếp thị và quản lý mã coupon hiện hành.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Coupon Create Form */}
            {currentUser.role === 'director' && (
              <div className="lg:col-span-4 bg-white border rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850">Tạo mã giảm giá mới</h4>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!cpCode) return;
                  if (addDynamicPromoCode) {
                    addDynamicPromoCode(cpCode.toUpperCase(), cpType, cpValue, cpDesc);
                    showToast(`✓ Đã tạo thành công mã giảm giá ${cpCode.toUpperCase()}`, 'success');
                    setCpCode('');
                    setCpValue(0);
                    setCpDesc('');
                  }
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="text-[9px] font-bold text-neutral-450 block mb-1">Mã Coupon (Viết liền không dấu) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: LUKY2026, NOVYN10"
                    value={cpCode}
                    onChange={(e) => setCpCode(e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-xl bg-white focus:outline-none font-bold uppercase text-neutral-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-neutral-450 block mb-1">Loại giảm giá</label>
                    <select
                      value={cpType}
                      onChange={(e) => setCpType(e.target.value as any)}
                      className="w-full px-3 py-2.5 border bg-white rounded-xl focus:outline-none font-bold text-neutral-850"
                    >
                      <option value="percent">Giảm (%)</option>
                      <option value="fixed">Giảm tiền (₫)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-neutral-450 block mb-1">Giá trị giảm *</label>
                    <input
                      type="number"
                      required
                      value={cpValue || ''}
                      onChange={(e) => setCpValue(Number(e.target.value))}
                      className="w-full px-3 py-2.5 border rounded-xl bg-white focus:outline-none font-bold text-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-neutral-450 block mb-1">Mô tả / Điều kiện áp dụng *</label>
                  <input
                    type="text"
                    required
                    placeholder="Giảm 10% tổng giá trị đơn hàng..."
                    value={cpDesc}
                    onChange={(e) => setCpDesc(e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-xl bg-white focus:outline-none font-semibold text-neutral-750"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-850 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 mt-2"
                >
                  Tạo mã khuyến mãi
                </button>
              </form>
            </div>
            )}

            {/* Coupons List */}
            <div className={`${currentUser.role === 'director' ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white border rounded-3xl p-5 shadow-sm space-y-4`}>
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850">Danh sách mã giảm giá hiện có trên hệ thống</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(dynamicPromos || {}).map((promo: any) => (
                  <div key={promo.code} className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/50 flex flex-col justify-between gap-3 relative overflow-hidden group">
                    <Tag className="w-16 h-16 text-neutral-100 absolute -right-3 -bottom-3 rotate-12 shrink-0 pointer-events-none group-hover:text-neutral-200/40 transition-colors" />

                    <div className="relative z-10 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-neutral-900 text-white font-mono font-black text-xs uppercase tracking-wide">
                          {promo.code}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-rose-50 text-rose-650 border border-rose-100">
                          {promo.type === 'percent' ? `Giảm ${promo.value}%` : `Giảm ${formatPrice(promo.value)}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 font-semibold pt-1 leading-snug">{promo.description}</p>
                    </div>

                    <div className="relative z-10 flex justify-between items-center border-t border-neutral-200/40 pt-2.5 mt-1">
                      <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">
                        Trạng thái: Active
                      </span>

                      {currentUser.role === 'director' && deleteDynamicPromoCode && promo.code !== 'FREESHIP' && (
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${promo.code}"?`)) {
                              deleteDynamicPromoCode(promo.code);
                              showToast(`✓ Đã xóa mã giảm giá ${promo.code}`, 'info');
                            }
                          }}
                          className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg bg-rose-50 text-rose-650 border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer active:scale-95"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {Object.keys(dynamicPromos || {}).length === 0 && (
                  <p className="col-span-2 text-center py-12 text-neutral-450 italic text-xs">
                    Chưa có mã giảm giá động nào được phát hành.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. SETTINGS TAB */}
      {activeTab === 'settings-tab' && ['director', 'accountant', 'manager'].includes(currentUser.role) && (
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Settings className="w-5 h-5 text-neutral-805" />
              Cấu hình & Cài đặt hệ thống ERP
            </h3>
            <p className="text-xs text-neutral-450 mt-1">
              Thiết lập chính sách đồng bộ đa kênh, bảo mật phân quyền nhân viên và thông số cửa hàng NOVYN WEAR.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850 border-b pb-2">Phân quyền chi nhánh</h4>
              <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed">
                Thiết lập định vị GPS chấm công của nhân viên, giới hạn bán kính check-in tại quầy và quy định lịch ca xoay tự động.
              </p>
              <div className="pt-2 text-[10px] space-y-1.5 text-neutral-600 font-bold">
                <div>• Bán kính check-in: <span className="text-neutral-900 font-mono">100m</span></div>
                <div>• GPS Chi nhánh Q1: <span className="text-neutral-900 font-mono">10.7769, 106.7009</span></div>
                <div>• GPS Thảo Điền: <span className="text-neutral-900 font-mono">10.8016, 106.7381</span></div>
              </div>
            </div>

            <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850 border-b pb-2">Đồng bộ API Omnichannel</h4>
              <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed">
                Kết nối khóa token đồng bộ tồn kho thời gian thực với Shopee Open API, TikTok Shop, Lazada, và Webhooks Facebook Messenger.
              </p>
              <div className="pt-2 text-[10px] space-y-1.5 text-neutral-600 font-bold">
                <div>• Shopee API Sync: <span className="text-emerald-600 font-extrabold">Đang kết nối</span></div>
                <div>• TikTok Shop Sync: <span className="text-emerald-600 font-extrabold">Đang kết nối</span></div>
                <div>• Auto-refresh stock: <span className="text-neutral-900 font-mono">5 phút/lần</span></div>
              </div>
            </div>

            <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850 border-b pb-2">Bảo mật hệ thống ERP</h4>
              <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed">
                Giám sát nhật ký hoạt động hệ thống (System Audit logs), quản lý các phiên đăng nhập, cấu hình khóa sổ thuế và mã PIN của két tiền mặt.
              </p>
              <div className="pt-2 text-[10px] space-y-1.5 text-neutral-600 font-bold">
                <div>• Khóa sổ tài chính ngày: <span className="text-neutral-900 font-mono">22:30</span></div>
                <div>• Phiên làm việc max: <span className="text-neutral-900 font-mono">8 tiếng</span></div>
                <div>• Yêu cầu 2FA: <span className="text-rose-600 font-extrabold">Chưa kích hoạt</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
