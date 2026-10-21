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
  Plus,
  Printer,
  Filter,
  StickyNote,
  Zap,
  ArrowRightLeft,
  Truck,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { VoucherQrViewModal } from '../common/VoucherQrViewModal';
import { VoucherQrScannerModal } from '../common/VoucherQrScannerModal';
import {
  updateCRMClientLoyaltyAction,
  createInventoryTransferAction,
  updateInventoryTransferStatusAction,
  createDamagedGoodAction,
  createCSKHTicketAction,
  updateCSKHTicketStatusAction,
  createCashReconciliationAction,
} from '../../lib/actions/erpActions';
import MultiCartPOS from './pos/MultiCartPOS';
import VariantStockMatrix from './warehouse/VariantStockMatrix';
import CashShiftReconciliation from './finance/CashShiftReconciliation';
import Customer360Sidebar from './crm/Customer360Sidebar';

interface ERPSubsystemsProps {
  activeTab: string;
  currentUser: any;
  usersList: any[];
  productsList: any[];
  branchStock: any;
  restockBranchProduct: any;
  refreshInventoryStocks?: () => Promise<void>;
  onSwitchToTransferTab?: () => void;
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
  refreshInventoryStocks,
  onSwitchToTransferTab,
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

  // New local state hooks for P&L Sheet: Monthly/Quarterly/Today/7days filters
  const [plPeriodType, setPlPeriodType] = useState<'monthly' | 'quarterly' | 'today' | '7days'>('monthly');
  const [plSelectedPeriod, setPlSelectedPeriod] = useState('2026-06'); // E.g., '2026-06' or 'Q2 2026'

  // Pro-forma bill modal state (In Phiếu Tạm Tính)
  const [showProformaModal, setShowProformaModal] = useState(false);

  // CSKH Priority & Ticket filter & VIP Notes
  const [newTicketPriority, setNewTicketPriority] = useState<'urgent' | 'normal' | 'low'>('normal');
  const [cskhTicketFilter, setCskhTicketFilter] = useState<'all' | 'urgent' | 'pending' | 'resolved'>('all');
  const [crmClientNotes, setCrmClientNotes] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('novyn_crm_client_notes');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {
      'crm-1': 'Thích tone màu Beige/Oatmeal, form rộng, hay mua combo áo + quần',
      'crm-2': 'Thường mặc size S, yêu cầu gói quà cẩn thận, hay ghé showroom Q1 cuối tuần',
      'crm-3': 'Khách VIP thân thiết từ 2024, quan tâm BST Linen cao cấp, ưu tiên liên hệ qua Zalo'
    };
  });
  const [editingNoteClientId, setEditingNoteClientId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Stocker inventory search and stock range filter
  const [stockerSearchQuery, setStockerSearchQuery] = useState('');
  const [stockerRangeFilter, setStockerRangeFilter] = useState<'all' | 'urgent' | 'warning' | 'safe'>('all');

  // Stocker transfers & damaged goods filters
  const [transferSearchQuery, setTransferSearchQuery] = useState('');
  const [transferStatusFilter, setTransferStatusFilter] = useState<'all' | 'shipping' | 'received' | 'cancelled'>('all');
  const [damageSearchQuery, setDamageSearchQuery] = useState('');
  const [damageBranchFilter, setDamageBranchFilter] = useState<string>('all');
  const [financeReconTab, setFinanceReconTab] = useState<'drawer' | 'pl'>('drawer');
  const [selectedCustomerFor360, setSelectedCustomerFor360] = useState<any | null>(null);

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
  const [selectedQrVoucher, setSelectedQrVoucher] = useState<any | null>(null);
  const [showErpVoucherScanner, setShowErpVoucherScanner] = useState(false);

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
      updateCRMClientLoyaltyAction(posSelectedCustomer.id, posTotal).catch(err => {
        console.error('Error persisting CRM loyalty:', err);
      });
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
  const handleCreateTransfer = async () => {
    if (!newTransferProductId || !newTransferColor) {
      showToast('Vui lòng chọn sản phẩm và màu sắc cần chuyển!', 'error');
      return;
    }
    if (newTransferFrom === newTransferTo) {
      showToast('Chi nhánh nguồn và chi nhánh đích không được trùng nhau!', 'error');
      return;
    }
    if (!newTransferQty || newTransferQty <= 0) {
      showToast('Số lượng chuyển kho phải lớn hơn 0!', 'error');
      return;
    }

    const matched = productsList.find(p => p.id === newTransferProductId);
    if (!matched) {
      showToast('Không tìm thấy thông tin sản phẩm!', 'error');
      return;
    }

    try {
      const res = await createInventoryTransferAction({
        productId: newTransferProductId,
        productName: matched.name,
        size: newTransferSize,
        color: newTransferColor,
        fromBranch: newTransferFrom,
        toBranch: newTransferTo,
        quantity: newTransferQty
      });

      if (!res.success || !res.data) {
        showToast(res.error || 'Lỗi khi tạo phiếu điều chuyển!', 'error');
        return;
      }

      const updated = [res.data, ...transfers.filter(t => t.id !== res.data.id)];
      setTransfers(updated);
      localStorage.setItem('novyn_stock_transfers', JSON.stringify(updated));

      // Refresh inventory stocks representation across entire app
      if (refreshInventoryStocks) {
        await refreshInventoryStocks();
      }

      showToast(`✓ Đã tạo phiếu chuyển kho ${res.data.id} và tự động khấu trừ ${newTransferQty} sp tại ${newTransferFrom}!`, 'success');
    } catch (err: any) {
      console.error('Error creating transfer:', err);
      showToast(err.message || 'Lỗi tạo phiếu chuyển kho', 'error');
    }
  };

  const handleReceiveTransfer = async (id: string) => {
    const tr = transfers.find(t => t.id === id);
    if (!tr) return;

    try {
      const res = await updateInventoryTransferStatusAction(id, 'received');
      if (!res.success) {
        showToast(res.error || 'Lỗi khi xác nhận nhận hàng!', 'error');
        return;
      }

      const updated = transfers.map(t => t.id === id ? { ...t, status: 'received' as const } : t);
      setTransfers(updated);
      localStorage.setItem('novyn_stock_transfers', JSON.stringify(updated));

      if (refreshInventoryStocks) {
        await refreshInventoryStocks();
      }

      showToast(`✓ Đã xác nhận nhận hàng chuyển kho ${id} thành công! Đã tự động cộng ${tr.quantity} sp vào ${tr.toBranch}.`, 'success');
    } catch (err: any) {
      console.error('Error receiving transfer:', err);
      showToast(err.message || 'Lỗi xác nhận nhận hàng', 'error');
    }
  };

  const handleCancelTransfer = async (id: string) => {
    const tr = transfers.find(t => t.id === id);
    if (!tr) return;

    try {
      const res = await updateInventoryTransferStatusAction(id, 'cancelled');
      if (!res.success) {
        showToast(res.error || 'Lỗi khi hủy phiếu chuyển kho!', 'error');
        return;
      }

      const updated = transfers.map(t => t.id === id ? { ...t, status: 'cancelled' as const } : t);
      setTransfers(updated);
      localStorage.setItem('novyn_stock_transfers', JSON.stringify(updated));

      if (refreshInventoryStocks) {
        await refreshInventoryStocks();
      }

      showToast(`✓ Đã hủy phiếu chuyển kho ${id} và hoàn trả ${tr.quantity} sp về ${tr.fromBranch}!`, 'info');
    } catch (err: any) {
      console.error('Error cancelling transfer:', err);
      showToast(err.message || 'Lỗi hủy phiếu chuyển kho', 'error');
    }
  };

  // Damaged goods
  const handleLogDamage = async () => {
    if (!newDamageProductId || !newDamageColor) {
      showToast('Vui lòng chọn đầy đủ sản phẩm và màu sắc!', 'error');
      return;
    }

    const matched = productsList.find(p => p.id === newDamageProductId);
    if (!matched) return;

    const branchName = currentUser?.branch || 'Chi nhánh Quận 1';

    try {
      const res = await createDamagedGoodAction({
        productId: newDamageProductId,
        productName: matched.name,
        size: newDamageSize,
        color: newDamageColor,
        branch: branchName,
        quantity: newDamageQty,
        issue: newDamageIssue
      });

      if (!res.success || !res.data) {
        showToast(res.error || 'Lỗi khi ghi nhận hàng lỗi!', 'error');
        return;
      }

      const updated = [res.data, ...damagedGoods.filter(d => d.id !== res.data.id)];
      setDamagedGoods(updated);
      localStorage.setItem('novyn_damaged_goods', JSON.stringify(updated));

      if (refreshInventoryStocks) {
        await refreshInventoryStocks();
      }

      showToast(`✓ Đã ghi nhận biên bản hàng lỗi và khấu trừ ${newDamageQty} sp tại ${branchName}!`, 'success');
    } catch (err: any) {
      console.error('Error logging damaged goods:', err);
      showToast(err.message || 'Lỗi ghi nhận hàng lỗi', 'error');
    }
  };

  // CSKH Tickets
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketCustomerName.trim() || !newTicketDesc.trim()) {
      showToast('Vui lòng điền đầy đủ tên khách hàng và mô tả!', 'error');
      return;
    }

    const priorityPrefix = newTicketPriority === 'urgent' ? '[Khẩn cấp] ' : newTicketPriority === 'low' ? '[Thấp] ' : '[Bình thường] ';
    const formattedDesc = `${priorityPrefix}${newTicketDesc}`;

    const newTk = {
      id: `TK-${Date.now().toString().slice(-4)}`,
      customerName: newTicketCustomerName,
      category: newTicketCategory,
      description: formattedDesc,
      priority: newTicketPriority,
      status: 'pending' as const,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updated = [newTk, ...cskhTickets];
    setCskhTickets(updated);
    localStorage.setItem('novyn_cskh_tickets', JSON.stringify(updated));

    createCSKHTicketAction({
      customerName: newTicketCustomerName,
      category: newTicketCategory,
      description: formattedDesc
    }).then(res => {
      if (res.success && res.data) {
        const synced = updated.map(t => t.id === newTk.id ? { ...t, id: res.data!.id } : t);
        setCskhTickets(synced);
        localStorage.setItem('novyn_cskh_tickets', JSON.stringify(synced));
      }
    }).catch(err => console.error('Error persisting CSKH ticket:', err));
    
    setNewTicketCustomerName('');
    setNewTicketDesc('');
    setNewTicketPriority('normal');
    showToast('✓ Đã khởi tạo phiếu khiếu nại CSKH mới!', 'success');
  };

  const handleSaveClientNote = (clientId: string) => {
    const updated = { ...crmClientNotes, [clientId]: tempNoteText.trim() };
    setCrmClientNotes(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('novyn_crm_client_notes', JSON.stringify(updated));
    }
    setEditingNoteClientId(null);
    setTempNoteText('');
    showToast('✓ Đã lưu ghi chú sở thích khách hàng VIP!', 'success');
  };

  const handleResolveTicket = (id: string) => {
    const updated = cskhTickets.map(t => t.id === id ? { ...t, status: 'resolved' as const } : t);
    setCskhTickets(updated);
    localStorage.setItem('novyn_cskh_tickets', JSON.stringify(updated));

    updateCSKHTicketStatusAction(id, 'resolved').catch(err => {
      console.error('Error updating ticket in DB:', err);
    });

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

    createCashReconciliationAction({
      date: newRecon.date,
      branch: newRecon.branch,
      cashierName: newRecon.cashierName,
      expectedCash: newRecon.expectedCash,
      actualCash: newRecon.actualCash,
      discrepancy: newRecon.discrepancy,
      notes: newRecon.notes,
      status: 'approved'
    }).then(res => {
      if (res.success && res.data) {
        const synced = updated.map(r => r.id === newRecon.id ? { ...r, id: res.data!.id } : r);
        setCashReconciliations(synced);
        localStorage.setItem('novyn_cash_reconciliation', JSON.stringify(synced));
      }
    }).catch(err => console.error('Error persisting cash reconciliation:', err));

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
      
      {/* 1. POS SALES TAB (MULTI-CART POS 2.0) */}
      {activeTab === 'pos-sales' && (
        <MultiCartPOS
          currentUser={currentUser}
          productsList={productsList}
          branchStock={branchStock}
          crmClients={crmClients}
          setCrmClients={setCrmClients}
          showToast={showToast}
          onSwitchToTransferTab={onSwitchToTransferTab}
          restockBranchProduct={restockBranchProduct}
          posHistory={posHistory}
          setPosHistory={setPosHistory}
        />
      )}

      {/* 2. STOCKER INVENTORY & VARIANT MATRIX TAB */}
      {activeTab === 'stocker-inventory' && (
        <VariantStockMatrix
          currentUser={currentUser}
          productsList={productsList}
          branchStock={branchStock}
          restockBranchProduct={restockBranchProduct}
          refreshInventoryStocks={refreshInventoryStocks}
          onSwitchToTransferTab={onSwitchToTransferTab}
          transfers={transfers}
          setTransfers={setTransfers}
          showToast={showToast}
        />
      )}

      {/* 3A. STOCKER TRANSFER TAB (ĐIỀU CHUYỂN KHO LIÊN CHI NHÁNH) */}
      {activeTab === 'stocker-transfer' && (() => {
        const shippingCount = transfers.filter(t => t.status === 'shipping').length;
        const receivedCount = transfers.filter(t => t.status === 'received').length;
        const cancelledCount = transfers.filter(t => t.status === 'cancelled').length;

        const filteredTransfers = transfers.filter(t => {
          const matchStatus = transferStatusFilter === 'all' || t.status === transferStatusFilter;
          const query = transferSearchQuery.toLowerCase();
          const matchQuery = !query || 
            (t.productName && t.productName.toLowerCase().includes(query)) ||
            (t.id && t.id.toLowerCase().includes(query)) ||
            (t.fromBranch && t.fromBranch.toLowerCase().includes(query)) ||
            (t.toBranch && t.toBranch.toLowerCase().includes(query));
          return matchStatus && matchQuery;
        });

        return (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-neutral-950 uppercase tracking-tight flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                  Điều chuyển kho liên chi nhánh (Stock Transfer)
                </h3>
                <p className="text-xs text-neutral-450 mt-1">
                  Luân chuyển hàng hóa giữa các showroom, theo dõi trạng thái giao nhận và tự động điều chỉnh tồn kho hai đầu.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  Đang giao: <strong className="font-mono">{shippingCount}</strong>
                </span>
              </div>
            </div>

            {/* Quick KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white border border-neutral-100 rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Tổng phiếu chuyển</span>
                <span className="text-2xl font-black text-neutral-900 font-mono">{transfers.length}</span>
              </div>
              <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  Đang vận chuyển
                </span>
                <span className="text-2xl font-black text-amber-900 font-mono">{shippingCount}</span>
              </div>
              <div className="p-4 bg-emerald-50/60 border border-emerald-200/70 rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Đã nhận thành công
                </span>
                <span className="text-2xl font-black text-emerald-900 font-mono">{receivedCount}</span>
              </div>
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-neutral-400" />
                  Đã hủy / Hoàn trả
                </span>
                <span className="text-2xl font-black text-neutral-700 font-mono">{cancelledCount}</span>
              </div>
            </div>

            {/* Main Content Grid: Form on Left, History Table on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Form tạo phiếu chuyển (col-span-5) */}
              <div className="lg:col-span-5 bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="border-b pb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-600" />
                    Tạo phiếu chuyển kho mới
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Tự động trừ tồn nguồn ngay khi xuất và cộng kho đích khi nhận.</p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                      Sản phẩm cần chuyển <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newTransferProductId}
                      onChange={(e) => {
                        const prodId = e.target.value;
                        setNewTransferProductId(prodId);
                        const p = productsList.find(item => item.id === prodId);
                        if (p && Array.isArray(p.colors) && p.colors.length > 0) {
                          setNewTransferColor(p.colors[0]?.name || p.colors[0] || 'Oatmeal');
                        }
                      }}
                      className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="">-- Chọn sản phẩm --</option>
                      {productsList.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </select>
                  </div>

                  {newTransferProductId && (
                    <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Tồn kho khả dụng tại <strong className="text-neutral-900">{newTransferFrom}</strong>:
                      </span>
                      <span className={`font-mono font-black ${(branchStock?.[newTransferProductId]?.[newTransferFrom] || 0) > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {branchStock?.[newTransferProductId]?.[newTransferFrom] || 0} sp
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">Kích cỡ (Size)</label>
                      <select
                        value={newTransferSize}
                        onChange={(e) => setNewTransferSize(e.target.value)}
                        className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:border-blue-500"
                      >
                        {['S', 'M', 'L', 'XL'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">Màu sắc</label>
                      <select
                        value={newTransferColor}
                        onChange={(e) => setNewTransferColor(e.target.value)}
                        className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">-- Chọn màu --</option>
                        {(() => {
                          const prod = productsList.find(p => p.id === newTransferProductId);
                          const colors = Array.isArray(prod?.colors) ? prod.colors : [];
                          return colors.map((c: any) => {
                            const name = c?.name || c;
                            return <option key={name} value={name}>{name}</option>;
                          });
                        })()}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">Chi nhánh xuất (Nguồn)</label>
                      <select
                        value={newTransferFrom}
                        onChange={(e) => setNewTransferFrom(e.target.value)}
                        className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:border-blue-500 font-semibold"
                      >
                        <option value="Chi nhánh Quận 1">Chi nhánh Quận 1</option>
                        <option value="Chi nhánh Thảo Điền">Chi nhánh Thảo Điền</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">Chi nhánh nhập (Đích)</label>
                      <select
                        value={newTransferTo}
                        onChange={(e) => setNewTransferTo(e.target.value)}
                        className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:border-blue-500 font-semibold"
                      >
                        <option value="Chi nhánh Thảo Điền">Chi nhánh Thảo Điền</option>
                        <option value="Chi nhánh Quận 1">Chi nhánh Quận 1</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">Số lượng chuyển</label>
                    <input
                      type="number"
                      min={1}
                      value={newTransferQty}
                      onChange={(e) => setNewTransferQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:border-blue-500 font-bold font-mono text-sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateTransfer}
                    className="w-full py-3 rounded-xl bg-neutral-950 hover:bg-neutral-850 active:scale-95 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 mt-3"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Tạo phiếu chuyển kho ngay
                  </button>
                </div>
              </div>

              {/* Bảng nhật ký phiếu chuyển kho (col-span-7) */}
              <div className="lg:col-span-7 bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                      Nhật ký phiếu điều chuyển
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Lịch sử xuất chuyển và nhận hàng giữa 2 chi nhánh.</p>
                  </div>

                  {/* Tabs lọc trạng thái */}
                  <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-[10px] font-bold">
                    {(['all', 'shipping', 'received', 'cancelled'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => setTransferStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg transition-all capitalize ${
                          transferStatusFilter === st
                            ? 'bg-white text-neutral-900 shadow-xs font-black'
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        {st === 'all' ? 'Tất cả' : st === 'shipping' ? 'Đang giao' : st === 'received' ? 'Đã nhận' : 'Đã hủy'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thanh tìm kiếm */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm theo mã phiếu, tên sản phẩm, chi nhánh..."
                    value={transferSearchQuery}
                    onChange={(e) => setTransferSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs bg-neutral-50 focus:bg-white focus:outline-none focus:border-neutral-400"
                  />
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                {/* Table */}
                <div className="overflow-x-auto max-h-[480px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 border-b text-neutral-450 font-bold uppercase tracking-wider text-[8px] sticky top-0 bg-neutral-50">
                        <th className="p-3">Sản phẩm</th>
                        <th className="p-3">Biến thể</th>
                        <th className="p-3">Lộ trình</th>
                        <th className="p-3 text-center">SL</th>
                        <th className="p-3">Trạng thái</th>
                        <th className="p-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-neutral-700">
                      {filteredTransfers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-neutral-400 italic">
                            Không có phiếu điều chuyển nào phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredTransfers.map(t => {
                          const isDestination = t.toBranch === currentUser?.branch;
                          const isPending = t.status === 'shipping';
                          const isReceived = t.status === 'received';
                          const isCancelled = t.status === 'cancelled';
                          const canReceive = isPending && (
                            currentUser?.role === 'director' ||
                            currentUser?.role === 'manager' ||
                            currentUser?.role === 'accountant' ||
                            isDestination
                          );
                          const canCancel = isPending && (
                            currentUser?.role === 'director' ||
                            currentUser?.role === 'manager' ||
                            t.fromBranch === currentUser?.branch
                          );

                          return (
                            <tr key={t.id} className="hover:bg-neutral-50/50 transition-colors">
                              <td className="p-3 font-bold text-neutral-900">
                                <div className="line-clamp-1">{t.productName}</div>
                                <div className="text-[10px] text-neutral-400 font-mono font-normal">#{t.id}</div>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="font-semibold text-neutral-700">{t.size}</span> / <span className="text-neutral-500">{t.color}</span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-600">
                                  <span>{(t.fromBranch || '').replace('Chi nhánh ', '')}</span>
                                  <span className="text-neutral-400">➔</span>
                                  <span className="text-blue-700 font-bold">{(t.toBranch || '').replace('Chi nhánh ', '')}</span>
                                </div>
                              </td>
                              <td className="p-3 text-center font-black font-mono whitespace-nowrap">{t.quantity} sp</td>
                              <td className="p-3 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                  isPending ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                                  isReceived ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                  'bg-neutral-100 text-neutral-500 border border-neutral-200'
                                }`}>
                                  {isPending ? 'Đang giao' : isReceived ? 'Đã nhận' : 'Đã hủy'}
                                </span>
                              </td>
                              <td className="p-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {canReceive && (
                                    <button
                                      type="button"
                                      onClick={() => handleReceiveTransfer(t.id)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                                    >
                                      Nhận hàng
                                    </button>
                                  )}
                                  {canCancel && (
                                    <button
                                      type="button"
                                      onClick={() => handleCancelTransfer(t.id)}
                                      className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                                    >
                                      Hủy
                                    </button>
                                  )}
                                  {!canReceive && !canCancel && (
                                    <span className="text-[10px] text-neutral-400 font-bold">—</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3B. DAMAGED GOODS TAB (BIÊN BẢN HÀNG LỖI & XUẤT HỦY KHO) */}
      {activeTab === 'damaged-goods' && (() => {
        const totalDamagedQty = damagedGoods.reduce((sum, d) => sum + (d.quantity || 0), 0);
        const currentBranchName = currentUser?.branch || 'Chi nhánh Quận 1';
        const currentBranchDamagedQty = damagedGoods
          .filter(d => d.branch === currentBranchName)
          .reduce((sum, d) => sum + (d.quantity || 0), 0);

        const filteredDamagedGoods = damagedGoods.filter(d => {
          const matchBranch = damageBranchFilter === 'all' || d.branch === damageBranchFilter;
          const query = damageSearchQuery.toLowerCase();
          const matchQuery = !query ||
            (d.productName && d.productName.toLowerCase().includes(query)) ||
            (d.id && d.id.toLowerCase().includes(query)) ||
            (d.issue && d.issue.toLowerCase().includes(query)) ||
            (d.branch && d.branch.toLowerCase().includes(query));
          return matchBranch && matchQuery;
        });

        return (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-neutral-950 uppercase tracking-tight flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Biên bản hàng lỗi & Xuất hủy kho (Damaged Goods)
                </h3>
                <p className="text-xs text-neutral-450 mt-1">
                  Khai báo và lập biên bản xử lý sản phẩm lỗi, rách bẩn, hư hỏng trong quá trình vận hành; tự động trừ kho khả dụng.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Tổng xuất hủy: <strong className="font-mono">{totalDamagedQty} sp</strong>
                </span>
              </div>
            </div>

            {/* Quick KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white border border-neutral-100 rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Tổng số biên bản lập</span>
                <span className="text-2xl font-black text-neutral-900 font-mono">{damagedGoods.length}</span>
              </div>
              <div className="p-4 bg-rose-50/60 border border-rose-200/70 rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  Tổng sản phẩm lỗi / hỏng
                </span>
                <span className="text-2xl font-black text-rose-900 font-mono">{totalDamagedQty} sp</span>
              </div>
              <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-600" />
                  Lỗi tại {currentBranchName.replace('Chi nhánh ', '')}
                </span>
                <span className="text-2xl font-black text-amber-900 font-mono">{currentBranchDamagedQty} sp</span>
              </div>
            </div>

            {/* Main Content Grid: Form on Left, History Table on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Form lập biên bản hàng lỗi (col-span-5) */}
              <div className="lg:col-span-5 bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="border-b pb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Lập biên bản hàng lỗi mới
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Hệ thống sẽ lập tức trừ tồn kho khả dụng tương ứng tại chi nhánh.</p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                      Chọn sản phẩm bị lỗi <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newDamageProductId}
                      onChange={(e) => {
                        setNewDamageProductId(e.target.value);
                        const p = productsList.find(item => item.id === e.target.value);
                        if (p && Array.isArray(p.colors) && p.colors.length > 0) {
                          setNewDamageColor(p.colors[0]?.name || p.colors[0] || 'Oatmeal');
                        }
                      }}
                      className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:border-rose-400 font-medium"
                    >
                      <option value="">-- Chọn sản phẩm --</option>
                      {productsList.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">Kích cỡ (Size)</label>
                      <select
                        value={newDamageSize}
                        onChange={(e) => setNewDamageSize(e.target.value)}
                        className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:border-rose-400"
                      >
                        {['S', 'M', 'L', 'XL'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">Màu sắc</label>
                      <select
                        value={newDamageColor}
                        onChange={(e) => setNewDamageColor(e.target.value)}
                        className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:border-rose-400"
                      >
                        <option value="">-- Chọn màu --</option>
                        {(() => {
                          const prod = productsList.find(p => p.id === newDamageProductId);
                          const colors = Array.isArray(prod?.colors) ? prod.colors : [];
                          return colors.map((c: any) => {
                            const name = c?.name || c;
                            return <option key={name} value={name}>{name}</option>;
                          });
                        })()}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">Chi nhánh phát hiện</label>
                      <input
                        type="text"
                        disabled
                        value={currentBranchName}
                        className="w-full p-2.5 border rounded-xl bg-neutral-100 text-neutral-600 font-medium cursor-not-allowed text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">Số lượng lỗi</label>
                      <input
                        type="number"
                        min={1}
                        value={newDamageQty}
                        onChange={(e) => setNewDamageQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:border-rose-400 font-bold font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">Tình trạng lỗi chi tiết</label>
                    <select
                      value={newDamageIssue}
                      onChange={(e) => setNewDamageIssue(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:border-rose-400"
                    >
                      <option value="Rách vải / sứt chỉ may">Rách vải / sứt chỉ may</option>
                      <option value="Bẩn vải / ố màu khi trưng bày">Bẩn vải / ố màu khi trưng bày</option>
                      <option value="Mất tem mác tag / hỏng phụ liệu">Mất tem mác tag / hỏng phụ liệu</option>
                      <option value="Lỗi khóa kéo button / hỏng nút">Lỗi khóa kéo button / hỏng nút</option>
                      <option value="Lỗi sợi dệt / loang màu vải">Lỗi sợi dệt / loang màu vải</option>
                      <option value="Hư hỏng trong quá trình vận chuyển">Hư hỏng trong quá trình vận chuyển</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogDamage}
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 mt-3"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    ✓ Ghi nhận & xuất hủy trừ kho
                  </button>
                </div>
              </div>

              {/* Bảng danh sách biên bản hàng lỗi (col-span-7) */}
              <div className="lg:col-span-7 bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                      Danh sách biên bản hàng lỗi
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Các mặt hàng đã được ghi nhận xuất hủy và trừ kho khả dụng.</p>
                  </div>

                  {/* Bộ lọc chi nhánh */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <select
                      value={damageBranchFilter}
                      onChange={(e) => setDamageBranchFilter(e.target.value)}
                      className="px-3 py-1.5 border rounded-xl bg-neutral-50 text-neutral-700 text-xs font-semibold focus:outline-none focus:border-neutral-400"
                    >
                      <option value="all">Tất cả chi nhánh</option>
                      <option value="Chi nhánh Quận 1">Chi nhánh Quận 1</option>
                      <option value="Chi nhánh Thảo Điền">Chi nhánh Thảo Điền</option>
                    </select>
                  </div>
                </div>

                {/* Thanh tìm kiếm */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm theo mã biên bản, tên sản phẩm, lỗi..."
                    value={damageSearchQuery}
                    onChange={(e) => setDamageSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs bg-neutral-50 focus:bg-white focus:outline-none focus:border-neutral-400"
                  />
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                {/* Table */}
                <div className="overflow-x-auto max-h-[480px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 border-b text-neutral-450 font-bold uppercase tracking-wider text-[8px] sticky top-0 bg-neutral-50">
                        <th className="p-3">Sản phẩm</th>
                        <th className="p-3">Biến thể</th>
                        <th className="p-3">Chi nhánh</th>
                        <th className="p-3">Tình trạng lỗi</th>
                        <th className="p-3 text-center">SL lỗi</th>
                        <th className="p-3 text-right">Ngày ghi nhận</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-neutral-700">
                      {filteredDamagedGoods.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-neutral-400 italic">
                            Chưa có biên bản hàng lỗi nào.
                          </td>
                        </tr>
                      ) : (
                        filteredDamagedGoods.map(d => (
                          <tr key={d.id} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="p-3 font-bold text-neutral-900">
                              <div className="line-clamp-1">{d.productName}</div>
                              <div className="text-[10px] text-neutral-400 font-mono font-normal">#{d.id}</div>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className="font-semibold text-neutral-700">{d.size}</span> / <span className="text-neutral-500">{d.color}</span>
                            </td>
                            <td className="p-3 whitespace-nowrap font-medium text-neutral-600">
                              {(d.branch || '').replace('Chi nhánh ', '')}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 font-bold text-[10px] inline-block">
                                {d.issue}
                              </span>
                            </td>
                            <td className="p-3 text-center font-black font-mono whitespace-nowrap text-rose-600">
                              {d.quantity} sp
                            </td>
                            <td className="p-3 text-right font-mono text-[10px] text-neutral-400 whitespace-nowrap">
                              {d.createdAt ? (
                                typeof d.createdAt === 'object' && 'toISOString' in d.createdAt
                                  ? (d.createdAt as Date).toLocaleDateString('vi-VN')
                                  : String(d.createdAt).split('T')[0]
                              ) : '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 4. KPI & AUTOMATED PAYROLL TAB */}
      {(activeTab === 'accountant-kpi-payroll' || activeTab === 'finance-payroll') && (
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
      {(activeTab === 'cskh-customers' || activeTab === 'cskh-customers-vip' || activeTab === 'cskh-customers-tickets' || activeTab === 'customers-list' || activeTab === 'returns-exchange' || activeTab === 'cskh-hub') && (
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-black text-neutral-950 uppercase tracking-tight flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-500" />
              {activeTab === 'cskh-customers-tickets' || activeTab === 'returns-exchange' ? 'Đổi trả & Khiếu nại (CSKH Tickets)' : 'Khách hàng & Hệ thống khiếu nại CRM'}
            </h3>
            <p className="text-xs text-neutral-450 mt-1">
              {activeTab === 'cskh-customers-tickets' || activeTab === 'returns-exchange' ? 'Ghi nhận sự vụ đổi trả hàng lỗi, chật size hoặc khiếu nại dịch vụ.' : 'Đồng bộ hoá tích luỹ chi tiêu, tự động tính điểm loyalty và xếp hạng VIP.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* VIP Loyalty list */}
            {(activeTab === 'cskh-customers' || activeTab === 'cskh-customers-vip' || activeTab === 'customers-list' || activeTab === 'cskh-hub') && (
              <div className={`${activeTab === 'cskh-customers-vip' || activeTab === 'customers-list' ? 'lg:col-span-12' : 'lg:col-span-7'} bg-white border rounded-3xl p-5 shadow-sm space-y-4`}>
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
                      <th className="p-3">Sở thích & Ghi chú VIP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-neutral-700">
                    {crmClients.map(client => (
                      <tr
                        key={client.id}
                        onClick={() => {
                          setSelectedCustomerFor360(client);
                          showToast(`✓ Đã mở Khách Hàng 360: ${client.name}`, 'info');
                        }}
                        className={`hover:bg-neutral-50/60 cursor-pointer transition-colors ${
                          selectedCustomerFor360?.id === client.id ? 'bg-purple-50/70 font-semibold' : ''
                        }`}
                        title="Click để xem hồ sơ Khách Hàng 360"
                      >
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
                        <td className="p-3 min-w-[200px] max-w-[260px]">
                          {editingNoteClientId === client.id ? (
                            <div className="flex gap-1 items-center">
                              <input
                                type="text"
                                value={tempNoteText}
                                onChange={(e) => setTempNoteText(e.target.value)}
                                placeholder="Ghi chú sở thích..."
                                className="px-2 py-1 border rounded-lg text-[10px] bg-white text-neutral-800 w-full focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveClientNote(client.id)}
                                className="px-2 py-1 bg-neutral-900 text-white rounded-lg text-[9px] font-bold shrink-0 cursor-pointer"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => setEditingNoteClientId(null)}
                                className="px-1.5 py-1 text-neutral-500 hover:text-neutral-800 text-[9px] shrink-0 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-1 group">
                              <span className="text-[10px] text-neutral-600 italic block truncate">
                                {crmClientNotes[client.id] || <span className="text-neutral-400 not-italic">Chưa có ghi chú</span>}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingNoteClientId(client.id);
                                  setTempNoteText(crmClientNotes[client.id] || '');
                                }}
                                className="text-neutral-400 hover:text-neutral-800 p-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                                title="Chỉnh sửa ghi chú sở thích khách hàng"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {/* Ticket center */}
            {(activeTab === 'cskh-customers' || activeTab === 'cskh-customers-tickets' || activeTab === 'returns-exchange' || activeTab === 'cskh-hub') && (
              <div className={`${activeTab === 'cskh-customers-tickets' || activeTab === 'returns-exchange' ? 'lg:col-span-12' : 'lg:col-span-5'} bg-white border rounded-3xl p-5 shadow-sm space-y-4`}>
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
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Mức độ ưu tiên xử lý</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'urgent', label: '🔴 Khẩn cấp', desc: 'Sự cố / VIP' },
                      { key: 'normal', label: '🔵 Bình thường', desc: 'Đổi size' },
                      { key: 'low', label: '⚪ Thấp', desc: 'Tư vấn' }
                    ].map(p => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setNewTicketPriority(p.key as any)}
                        className={`p-2 rounded-xl text-left border cursor-pointer transition-all ${
                          newTicketPriority === p.key
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                            : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                        }`}
                      >
                        <span className="text-[10px] font-bold block">{p.label}</span>
                        <span className={`text-[8px] block mt-0.5 ${newTicketPriority === p.key ? 'text-neutral-300' : 'text-neutral-400'}`}>{p.desc}</span>
                      </button>
                    ))}
                  </div>
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

            {/* Customer 360 & Quick Canned Responses Hub */}
            {(activeTab === 'cskh-hub' || activeTab === 'customers-list' || activeTab === 'cskh-customers') && (
              <div className="lg:col-span-12">
                <Customer360Sidebar
                  selectedCustomer={selectedCustomerFor360 || crmClients[0] || null}
                  customerOrders={allOrders.filter(o => {
                    const custName = (selectedCustomerFor360?.name || crmClients[0]?.name || '').toLowerCase();
                    const custPhone = (selectedCustomerFor360?.phone || crmClients[0]?.phone || '').replace(/\D/g, '');
                    const orderName = (o.customerInfo?.fullName || o.customerName || '').toLowerCase();
                    const orderPhone = (o.customerInfo?.phone || o.phone || '').replace(/\D/g, '');
                    
                    const matchName = custName && orderName.includes(custName);
                    const matchPhone = custPhone.length >= 3 && orderPhone.length >= 3 && (
                      orderPhone.includes(custPhone) || custPhone.includes(orderPhone)
                    );
                    return matchName || matchPhone;
                  })}
                  customerTickets={cskhTickets.filter(t => 
                    t.customerName?.toLowerCase().includes((selectedCustomerFor360?.name || crmClients[0]?.name || '').toLowerCase())
                  )}
                  onInsertCannedReply={(text) => {
                    setNewTicketDesc(newTicketDesc ? `${newTicketDesc}\n${text}` : text);
                  }}
                  showToast={showToast}
                />
              </div>
            )}
          </div>

          {/* Tickets lists history */}
          {(activeTab === 'cskh-customers' || activeTab === 'cskh-customers-tickets' || activeTab === 'returns-exchange' || activeTab === 'cskh-hub') && (
            <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider">Hộp thư phiếu xử lý khiếu nại (Customer Tickets Center)</h4>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { key: 'all', label: `Tất cả (${cskhTickets.length})` },
                  { key: 'urgent', label: `🔴 Khẩn cấp (${cskhTickets.filter(t => t.priority === 'urgent' || t.description?.includes('[Khẩn cấp]')).length})` },
                  { key: 'pending', label: `⏳ Đang xử lý (${cskhTickets.filter(t => t.status === 'pending').length})` },
                  { key: 'resolved', label: `✓ Đã xong (${cskhTickets.filter(t => t.status === 'resolved').length})` }
                ].map(f => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setCskhTicketFilter(f.key as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      cskhTicketFilter === f.key
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                    <th className="p-3">Khách hàng</th>
                    <th className="p-3">Mức ưu tiên</th>
                    <th className="p-3">Phân loại</th>
                    <th className="p-3">Mô tả chi tiết</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-neutral-700">
                  {cskhTickets
                    .filter(t => {
                      if (cskhTicketFilter === 'urgent') return t.priority === 'urgent' || t.description?.includes('[Khẩn cấp]');
                      if (cskhTicketFilter === 'pending') return t.status === 'pending';
                      if (cskhTicketFilter === 'resolved') return t.status === 'resolved';
                      return true;
                    })
                    .map(t => {
                      const isPending = t.status === 'pending';
                      const isUrgent = t.priority === 'urgent' || t.description?.includes('[Khẩn cấp]');
                      const isLow = t.priority === 'low' || t.description?.includes('[Thấp]');
                      return (
                        <tr key={t.id} className="hover:bg-neutral-50/15">
                          <td className="p-3 font-bold text-neutral-900">{t.customerName}</td>
                          <td className="p-3">
                            {isUrgent ? (
                              <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-300 animate-pulse">
                                🔴 Khẩn cấp
                              </span>
                            ) : isLow ? (
                              <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200">
                                ⚪ Thấp
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                                🔵 Bình thường
                              </span>
                            )}
                          </td>
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
      {(activeTab === 'accountant-finance-recon' || activeTab === 'finance-recon' || activeTab === 'recon') && (
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

          {/* Sub-tab Switcher: Cash Shift vs P&L */}
          <div className="flex bg-neutral-100 p-1 rounded-xl gap-1 w-fit">
            <button
              type="button"
              onClick={() => setFinanceReconTab('drawer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                financeReconTab === 'drawer'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              💵 Chốt ca két tiền POS (Mệnh giá)
            </button>
            <button
              type="button"
              onClick={() => setFinanceReconTab('pl')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                financeReconTab === 'pl'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              📊 Sổ cái P&L Doanh nghiệp
            </button>
          </div>

          {financeReconTab === 'drawer' ? (
            <CashShiftReconciliation
              currentUser={currentUser}
              allOrders={allOrders}
              posHistory={posHistory}
              showToast={showToast}
              reconciliations={cashReconciliations}
              setReconciliations={setCashReconciliations}
            />
          ) : (
            /* P&L Interactive Ledger */
            <div className="w-full bg-white border rounded-3xl p-5 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850">Sổ cái tài chính P&L Doanh nghiệp</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-450 font-bold uppercase">Kỳ báo cáo:</span>
                  <select
                    value={plPeriodType}
                    onChange={(e) => {
                      const newType = e.target.value as 'monthly' | 'quarterly' | 'today' | '7days';
                      setPlPeriodType(newType);
                      if (newType === 'monthly') setPlSelectedPeriod('2026-06');
                      if (newType === 'quarterly') setPlSelectedPeriod('Q2 2026');
                    }}
                    className="p-1.5 border rounded-lg text-xs font-bold text-neutral-800 bg-[#FAF7F2] focus:outline-none"
                  >
                    <option value="today">Hôm nay</option>
                    <option value="7days">7 ngày qua</option>
                    <option value="monthly">Theo tháng</option>
                    <option value="quarterly">Theo quý</option>
                  </select>

                  {plPeriodType === 'monthly' && (
                    <select
                      value={plSelectedPeriod}
                      onChange={(e) => setPlSelectedPeriod(e.target.value)}
                      className="p-1.5 border rounded-lg text-xs font-bold text-neutral-800 bg-[#FAF7F2] focus:outline-none"
                    >
                      <option value="2026-06">Tháng 6, 2026</option>
                      <option value="2026-05">Tháng 5, 2026</option>
                      <option value="2026-04">Tháng 4, 2026</option>
                    </select>
                  )}
                  {plPeriodType === 'quarterly' && (
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
                  if (plPeriodType === 'today') {
                    const todayStr = new Date().toISOString().split('T')[0];
                    return dateOnly === todayStr || dateOnly === '2026-06-15' || dateOnly === '2026-06-14';
                  }
                  if (plPeriodType === '7days') {
                    return dateOnly >= '2026-06-08';
                  }
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
                const grossMarginPct = totalRev > 0 ? ((grossProfit / totalRev) * 100).toFixed(1) : '0';
                const ebt = grossProfit - salaries - expenses - restock;
                const tax = ebt > 0 ? ebt * 0.2 : 0;
                const net = ebt - tax;
                const isNegative = net < 0;

                return (
                  <div className="space-y-4 text-xs font-medium text-neutral-700">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-xs">
                        <span className="text-[9px] text-neutral-450 uppercase tracking-wide block font-black mb-1">Doanh thu gộp POS</span>
                        <span className="text-base font-black text-emerald-800 font-mono block">+{formatPrice(totalRev)}</span>
                        <span className="text-[8px] text-emerald-600 block mt-1 font-bold">100% Thu nhập toàn kỳ</span>
                      </div>
                      <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 shadow-xs">
                        <span className="text-[9px] text-neutral-450 uppercase tracking-wide block font-black mb-1">Lợi nhuận gộp (Gross Profit)</span>
                        <span className="text-base font-black text-sky-900 font-mono block">+{formatPrice(grossProfit)}</span>
                        <span className="text-[8px] text-sky-700 block mt-1 font-bold">
                          Tỷ suất gộp: <span className="font-mono font-black text-sky-900">{grossMarginPct}%</span> (Doanh thu - COGS)
                        </span>
                      </div>
                      <div className={`p-4 rounded-2xl border shadow-xs ${isNegative ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'}`}>
                        <span className="text-[9px] text-neutral-450 uppercase tracking-wide block font-black mb-1">Lợi nhuận ròng sau thuế</span>
                        <span className={`text-base font-black font-mono block ${isNegative ? 'text-rose-650' : 'text-neutral-900'}`}>
                          {net >= 0 ? '+' : ''}{formatPrice(net)}
                        </span>
                        <span className="text-[8px] text-neutral-500 block mt-1 font-bold">
                          Biên ròng: {totalRev > 0 ? ((net / totalRev) * 100).toFixed(1) : 0}% (Net Margin)
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
          )}
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
                            <Image
                              src={prod.images && prod.images[0] ? prod.images[0] : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100'}
                              alt={prod.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                              unoptimized
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
          <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
                <Tag className="w-5 h-5 text-neutral-805" />
                Quản lý mã giảm giá (Coupons & Voucher QR)
              </h3>
              <p className="text-xs text-neutral-450 mt-1">
                Phát hành mã giảm giá động cho các chiến dịch tiếp thị, in tem mã QR và quản lý mã coupon hiện hành.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowErpVoucherScanner(true)}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all self-start sm:self-auto"
            >
              <QrCode className="w-4 h-4 text-rose-400" />
              <span>Quét kiểm tra mã QR</span>
            </button>
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

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedQrVoucher(promo)}
                          className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                          title="Xem và in mã QR Voucher"
                        >
                          <QrCode className="w-3 h-3 text-rose-400" />
                          <span>Mã QR</span>
                        </button>

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

          {/* QR View & Scanner Modals */}
          <VoucherQrViewModal
            isOpen={!!selectedQrVoucher}
            onClose={() => setSelectedQrVoucher(null)}
            voucher={selectedQrVoucher}
          />
          <VoucherQrScannerModal
            isOpen={showErpVoucherScanner}
            onClose={() => setShowErpVoucherScanner(false)}
            onScanSuccess={(code) => {
              showToast(`✓ Đã nhận diện mã QR Voucher: ${code}`, 'success');
              if (dynamicPromos && dynamicPromos[code]) {
                setSelectedQrVoucher(dynamicPromos[code]);
              } else {
                setSelectedQrVoucher({ code, description: 'Mã voucher đã nhận diện từ máy quét QR' });
              }
            }}
            title="Quét kiểm tra mã QR Voucher"
            subtitle="Kiểm tra thông tin chiết khấu của voucher khách hàng"
          />
        </div>
      )}

      {/* 11. SETTINGS TAB */}
      {(activeTab === 'settings-tab' || activeTab === 'settings') && ['director', 'accountant', 'manager'].includes(currentUser.role) && (
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
