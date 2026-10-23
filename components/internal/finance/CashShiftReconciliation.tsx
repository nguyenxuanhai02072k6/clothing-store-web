'use client';

import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  DollarSign,
  ClipboardCheck,
  Download,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Calendar,
  Building2,
  Clock,
  History,
  TrendingUp,
  CreditCard,
  QrCode,
  X,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../../../lib/utils';
import { createCashReconciliationAction } from '@/backend/actions/erpActions';

export interface CashShiftReconciliationProps {
  currentUser: any;
  allOrders: any[];
  posHistory?: any[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  reconciliations?: any[];
  setReconciliations?: any;
}

const DENOMINATIONS = [
  { value: 500000, label: '500,000 đ', color: 'text-teal-700 bg-teal-50 border-teal-200' },
  { value: 200000, label: '200,000 đ', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { value: 100000, label: '100,000 đ', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { value: 50000, label: '50,000 đ', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  { value: 20000, label: '20,000 đ', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { value: 10000, label: '10,000 đ', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  { value: 5000, label: '5,000 đ', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { value: 2000, label: '2,000 đ', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  { value: 1000, label: '1,000 đ', color: 'text-neutral-700 bg-neutral-100 border-neutral-300' }
];

export default function CashShiftReconciliation({
  currentUser,
  allOrders = [],
  posHistory = [],
  showToast,
  reconciliations = [],
  setReconciliations
}: CashShiftReconciliationProps) {
  // Cash denomination counts: { [denomValue]: count }
  const [counts, setCounts] = useState<Record<number, number>>({
    500000: 0,
    200000: 0,
    100000: 0,
    50000: 0,
    20000: 0,
    10000: 0,
    5000: 0,
    2000: 0,
    1000: 0
  });

  const [openingFloat, setOpeningFloat] = useState<number>(2000000); // Tiền đầu ca (mặc định 2 triệu)
  const [shiftNotes, setShiftNotes] = useState<string>('');
  const [cashierName, setCashierName] = useState<string>(currentUser?.name || 'Nguyễn Văn Thu Ngân');
  const [selectedBranch, setSelectedBranch] = useState<string>(currentUser?.branch || 'Chi nhánh Quận 1');
  const [shiftType, setShiftType] = useState<'morning' | 'evening'>('morning');

  // Handover Slip Modal
  const [handoverSlip, setHandoverSlip] = useState<any | null>(null);

  // Compute Software Expected Cash from POS orders
  const { expectedCash, expectedTransfer, expectedWallet, totalPOSRevenue } = useMemo(() => {
    let cash = 0;
    let transfer = 0;
    let wallet = 0;

    // From posHistory or allOrders
    const ordersToReconcile = posHistory.length > 0 ? posHistory : allOrders;

    ordersToReconcile.forEach(ord => {
      const amt = ord.total || 0;
      if (ord.paymentMethod === 'cash') cash += amt;
      else if (ord.paymentMethod === 'transfer') transfer += amt;
      else wallet += amt;
    });

    // If posHistory is empty, mock default POS sales of shift
    if (cash === 0 && ordersToReconcile.length === 0) {
      cash = 8450000;
      transfer = 12600000;
      wallet = 3200000;
    }

    return {
      expectedCash: cash,
      expectedTransfer: transfer,
      expectedWallet: wallet,
      totalPOSRevenue: cash + transfer + wallet
    };
  }, [posHistory, allOrders]);

  // Total counted cash from denomination breakdown
  const countedCash = useMemo(() => {
    return Object.entries(counts).reduce((total, [denom, count]) => {
      return total + Number(denom) * (Number(count) || 0);
    }, 0);
  }, [counts]);

  // Expected Total In Drawer = Opening Float + Cash Sales
  const expectedTotalDrawer = openingFloat + expectedCash;
  const discrepancy = countedCash - expectedTotalDrawer;

  const handleCountChange = (denom: number, count: number) => {
    setCounts(prev => ({
      ...prev,
      [denom]: Math.max(0, count)
    }));
  };

  const handleQuickAdd = (denom: number, add: number) => {
    setCounts(prev => ({
      ...prev,
      [denom]: Math.max(0, (prev[denom] || 0) + add)
    }));
  };

  const handleSaveReconciliation = async () => {
    if (countedCash === 0) {
      showToast('Vui lòng kiểm đếm ít nhất một mệnh giá tiền!', 'error');
      return;
    }

    if (discrepancy !== 0 && !shiftNotes.trim()) {
      showToast('Két tiền có chênh lệch, bắt buộc phải nhập giải trình lý do!', 'error');
      return;
    }

    const slip = {
      id: `RECON-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString('vi-VN'),
      branch: selectedBranch,
      cashier: cashierName,
      shift: shiftType === 'morning' ? 'Ca Sáng (8h30 - 15h00)' : 'Ca Chiều (14h30 - 22h00)',
      openingFloat,
      expectedCashSales: expectedCash,
      expectedTotalDrawer,
      countedCash,
      discrepancy,
      countsBreakdown: { ...counts },
      notes: shiftNotes || 'Khớp 100% không chênh lệch.',
      status: Math.abs(discrepancy) <= 10000 ? 'approved' : 'pending_review',
      managerApproved: currentUser?.role === 'manager' || currentUser?.role === 'director'
    };

    setHandoverSlip(slip);

    if (setReconciliations) {
      setReconciliations((prev: any[]) => [slip, ...(Array.isArray(prev) ? prev : [])]);
    }

    try {
      await createCashReconciliationAction({
        date: new Date().toISOString().split('T')[0],
        branch: selectedBranch,
        cashierName: cashierName,
        expectedCash: expectedTotalDrawer,
        actualCash: countedCash,
        discrepancy,
        notes: shiftNotes,
        status: discrepancy === 0 ? 'balanced' : discrepancy > 0 ? 'surplus' : 'shortage'
      });
    } catch (e) {
      console.warn('Persist reconciliation error:', e);
    }

    showToast('✓ Đã chốt két ca trực thành công & tạo biên bản bàn giao!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-black text-neutral-900 tracking-tight uppercase">
              Chốt Ca Kiểm Kê Két Tiền & Đối Soát 3 Chiều
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Đếm tiền theo từng mệnh giá, đối soát chênh lệch Thừa/Thiếu với phần mềm và xuất biên bản bàn giao ca.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold font-mono">
            {new Date().toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>

      {/* 3-WALLET REVENUE CARDS (Stripe Dashboard Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Wallet 1: Tiền mặt tại két */}
        <div className="bg-white border-2 border-emerald-200/80 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Tiền mặt tại két POS
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Cần kiểm đếm
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black font-mono text-emerald-700 block">
              {formatPrice(expectedCash)}
            </span>
            <span className="text-[10px] text-neutral-500 block">
              + Tiền đầu ca: <strong>{formatPrice(openingFloat)}</strong>
            </span>
          </div>
        </div>

        {/* Wallet 2: Chuyển khoản VietQR */}
        <div className="bg-white border rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              Chuyển khoản VietQR
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              Tài khoản Techcombank
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black font-mono text-blue-700 block">
              {formatPrice(expectedTransfer)}
            </span>
            <span className="text-[10px] text-neutral-500 block">Tự động khớp lệnh tức thì</span>
          </div>
        </div>

        {/* Wallet 3: Thẻ / Ví điện tử */}
        <div className="bg-white border rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
              Cổng thanh toán & Ví
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
              VNPay / ShopeePay
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black font-mono text-purple-700 block">
              {formatPrice(expectedWallet)}
            </span>
            <span className="text-[10px] text-neutral-500 block">Đối soát tự động cuối ngày</span>
          </div>
        </div>
      </div>

      {/* MAIN CASH COUNTING CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* DENOMINATION INPUT GRID (7 cols) */}
        <div className="lg:col-span-7 bg-white border rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Bảng Kiểm Đếm Tờ Tiền Từng Mệnh Giá (Cash Breakdown)
              </h4>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                Nhập số lượng tờ thực tế trong két tại thời điểm bàn giao ca.
              </p>
            </div>
            <button
              onClick={() => {
                setCounts({
                  500000: 0,
                  200000: 0,
                  100000: 0,
                  50000: 0,
                  20000: 0,
                  10000: 0,
                  5000: 0,
                  2000: 0,
                  1000: 0
                });
              }}
              className="text-[10px] text-neutral-500 hover:text-neutral-800 font-bold cursor-pointer"
            >
              Đặt lại 0
            </button>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {DENOMINATIONS.map(d => {
              const count = counts[d.value] || 0;
              const sub = d.value * count;

              return (
                <div
                  key={d.value}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 hover:border-neutral-300 transition-all bg-neutral-50/50"
                >
                  <div className="flex items-center gap-2.5 w-32">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-black font-mono border ${d.color}`}>
                      {d.label}
                    </span>
                  </div>

                  {/* Quantity Stepper & Direct Input */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickAdd(d.value, -1)}
                      className="w-6 h-6 rounded-md bg-white border text-neutral-600 hover:bg-neutral-100 font-bold text-xs flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={count || ''}
                      onChange={(e) => handleCountChange(d.value, parseInt(e.target.value, 10) || 0)}
                      placeholder="0"
                      className="w-16 px-2 py-1 text-center font-mono font-bold text-xs border rounded-md bg-white focus:outline-none focus:border-neutral-900"
                    />
                    <button
                      onClick={() => handleQuickAdd(d.value, 1)}
                      className="w-6 h-6 rounded-md bg-white border text-neutral-600 hover:bg-neutral-100 font-bold text-xs flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleQuickAdd(d.value, 5)}
                      className="px-1.5 py-1 rounded-md bg-white border text-neutral-500 hover:bg-neutral-100 font-bold text-[9px] cursor-pointer"
                      title="Cộng 5 tờ"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleQuickAdd(d.value, 10)}
                      className="px-1.5 py-1 rounded-md bg-white border text-neutral-500 hover:bg-neutral-100 font-bold text-[9px] cursor-pointer"
                      title="Cộng 10 tờ"
                    >
                      +10
                    </button>
                  </div>

                  {/* Subtotal of denomination */}
                  <span className="font-mono font-bold text-xs text-neutral-900 w-28 text-right">
                    {formatPrice(sub)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Total Counted Footnote */}
          <div className="flex justify-between items-center p-3 rounded-xl bg-neutral-900 text-white font-bold text-xs">
            <span>TỔNG TIỀN MẶT KIỂM ĐẾM THỰC TẾ:</span>
            <span className="font-mono text-base text-emerald-400">{formatPrice(countedCash)}</span>
          </div>
        </div>

        {/* SHIFT SUMMARY & RECONCILIATION RESULT (5 cols) */}
        <div className="lg:col-span-5 bg-white border rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">
              Thông Tin Bàn Giao Ca Trực
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Chi nhánh
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full p-2 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                >
                  <option value="Chi nhánh Quận 1">Chi nhánh Quận 1</option>
                  <option value="Chi nhánh Thảo Điền">Chi nhánh Thảo Điền</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Ca làm việc
                </label>
                <select
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value as any)}
                  className="w-full p-2 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                >
                  <option value="morning">Ca Sáng (8h30 - 15h00)</option>
                  <option value="evening">Ca Tối (14h30 - 22h00)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                Tiền lót két đầu ca (Opening Float):
              </label>
              <input
                type="number"
                value={openingFloat}
                onChange={(e) => setOpeningFloat(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded-xl bg-white font-mono font-bold text-neutral-800 focus:outline-none"
              />
            </div>

            {/* Reconciliation Comparison Card */}
            <div className="p-3.5 rounded-xl border space-y-2 bg-neutral-50">
              <div className="flex justify-between">
                <span className="text-neutral-500">Tiền lót đầu ngày:</span>
                <span className="font-mono font-bold">{formatPrice(openingFloat)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Doanh thu tiền mặt POS:</span>
                <span className="font-mono font-bold">{formatPrice(expectedCash)}</span>
              </div>
              <div className="flex justify-between border-t pt-1.5 font-bold text-neutral-800">
                <span>Kỳ vọng trong két:</span>
                <span className="font-mono">{formatPrice(expectedTotalDrawer)}</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-800">
                <span>Thực tế đếm được:</span>
                <span className="font-mono text-emerald-700">{formatPrice(countedCash)}</span>
              </div>

              {/* Discrepancy indicator */}
              <div className="flex justify-between items-center border-t border-dashed pt-2">
                <span className="font-black text-xs">CHÊNH LỆCH KÉT:</span>
                <span
                  className={`font-black font-mono text-sm px-2.5 py-0.5 rounded-lg ${
                    discrepancy === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : discrepancy > 0
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {discrepancy === 0
                    ? '0 đ (Khớp 100%)'
                    : discrepancy > 0
                    ? `Thừa +${formatPrice(discrepancy)}`
                    : `Thiếu -${formatPrice(Math.abs(discrepancy))}`}
                </span>
              </div>
            </div>

            {/* Explanation field */}
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                Ghi chú & Giải trình chênh lệch {discrepancy !== 0 && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                rows={2}
                value={shiftNotes}
                onChange={(e) => setShiftNotes(e.target.value)}
                placeholder={
                  discrepancy !== 0
                    ? 'Bắt buộc giải trình nguyên nhân thừa/thiếu tiền két...'
                    : 'Ghi chú bàn giao ca (nếu có)...'
                }
                className="w-full p-2.5 border rounded-xl bg-white text-xs text-neutral-800 focus:outline-none resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveReconciliation}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Xác nhận chốt ca & In biên bản</span>
            </button>
          </div>
        </div>
      </div>

      {/* SHIFT HANDOVER SLIP MODAL */}
      <AnimatePresence>
        {handoverSlip && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border shadow-xl p-6 w-full max-w-md text-neutral-800 space-y-4"
            >
              <div className="border-b-2 border-dashed pb-3 text-center space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Biên Bản Bàn Giao Két Tiền Mặt POS
                </span>
                <h2 className="text-base font-black tracking-widest text-neutral-900 uppercase mt-1">
                  NOVYN WEAR
                </h2>
                <p className="text-[10px] text-neutral-500 font-medium">
                  {handoverSlip.branch} • {handoverSlip.shift}
                </p>
                <p className="text-[8.5px] font-mono text-neutral-400">
                  Mã kiểm kê: {handoverSlip.id} • {handoverSlip.date}
                </p>
              </div>

              <div className="space-y-2 text-xs border-b-2 border-dashed pb-3">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Thu ngân giao ca:</span>
                  <span className="font-bold">{handoverSlip.cashier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tiền lót đầu ca:</span>
                  <span className="font-mono">{formatPrice(handoverSlip.openingFloat)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Doanh thu tiền mặt ghi nhận:</span>
                  <span className="font-mono">{formatPrice(handoverSlip.expectedCashSales)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>Két tiền kỳ vọng:</span>
                  <span className="font-mono">{formatPrice(handoverSlip.expectedTotalDrawer)}</span>
                </div>
                <div className="flex justify-between font-black text-emerald-700 text-sm">
                  <span>Thực tế kiểm đếm:</span>
                  <span className="font-mono">{formatPrice(handoverSlip.countedCash)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Chênh lệch:</span>
                  <span
                    className={`font-mono ${
                      handoverSlip.discrepancy === 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {handoverSlip.discrepancy > 0 ? '+' : ''}
                    {formatPrice(handoverSlip.discrepancy)}
                  </span>
                </div>
                {handoverSlip.notes && (
                  <p className="text-[10px] text-neutral-500 italic bg-neutral-50 p-2 rounded-lg">
                    Giải trình: {handoverSlip.notes}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-center text-[10px] text-neutral-500 pt-2">
                <div>
                  <p className="font-bold text-neutral-800">Người bàn giao</p>
                  <p className="italic text-[9px] mt-8">{handoverSlip.cashier}</p>
                </div>
                <div>
                  <p className="font-bold text-neutral-800">Cửa hàng trưởng duyệt</p>
                  <p className="italic text-[9px] mt-8">Đã ký điện tử</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    window.print();
                    showToast('✓ Đang in biên bản bàn giao két...', 'success');
                  }}
                  className="flex-1 py-2 rounded-xl bg-neutral-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In biên bản
                </button>
                <button
                  onClick={() => setHandoverSlip(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
