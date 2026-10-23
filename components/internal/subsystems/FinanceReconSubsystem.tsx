'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Download, 
  AlertTriangle, 
  Sparkles 
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import CashShiftReconciliation from '../finance/CashShiftReconciliation';

export interface FinanceReconSubsystemProps {
  currentUser: any;
  allOrders: any[];
  posHistory: any[];
  expensesList: any[];
  restockRecords: any[];
  payrollRecords: any[];
  usersList?: any[];
  cashReconciliations: any[];
  setCashReconciliations: any;
  showToast: (msg: string, type?: any) => void;
}

export default function FinanceReconSubsystem({
  currentUser,
  allOrders,
  posHistory,
  expensesList,
  restockRecords,
  payrollRecords,
  usersList = [],
  cashReconciliations,
  setCashReconciliations,
  showToast,
}: FinanceReconSubsystemProps) {
  const [financeReconTab, setFinanceReconTab] = useState<'drawer' | 'pl'>('drawer');
  const [plPeriodType, setPlPeriodType] = useState<'monthly' | 'quarterly' | 'today' | '7days'>('monthly');
  const [plSelectedPeriod, setPlSelectedPeriod] = useState<string>('2026-06');

  const handleExportFinancialCSV = () => {
    const headers = [
      'Kỳ đối soát',
      'Doanh thu gộp',
      'Giá vốn (COGS)',
      'Chi phí lương nhân sự',
      'Chi phí nhập hàng',
      'Chi phí vận hành khác',
      'Lợi nhuận gộp',
      'Thuế ước tính',
      'Lợi nhuận ròng'
    ];
    
    let totalRev = 0;
    let totalCogs = 0;
    allOrders.forEach(o => {
      if (o.status === 'completed') {
        totalRev += o.total;
        totalCogs += o.total * 0.4;
      }
    });

    let salaries = usersList.reduce((sum, u) => sum + (u.salary || 0), 0);
    let expenses = expensesList.reduce((sum, e) => sum + (e.amount || 0), 0);
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
          <button 
            onClick={handleExportFinancialCSV} 
            className="px-3.5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-850 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
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

            {/* Breakdown progress bars with Framer Motion */}
            <div className="space-y-3.5 border-t pt-4">
              {[
                { label: 'Doanh thu (+)', val: totalRev, color: 'bg-emerald-500' },
                { label: 'Giá vốn hàng bán COGS (-)', val: totalCogs, color: 'bg-rose-500' },
                { label: 'Chi phí lương nhân sự (-)', val: salaries, color: 'bg-neutral-600' },
                { label: 'Chi phí nhập kho restock (-)', val: restock, color: 'bg-amber-500' },
                { label: 'Chi phí vận hành khác (-)', val: expenses, color: 'bg-neutral-400' }
              ].map((item, idx) => {
                const pct = totalRev > 0 ? Math.min((item.val / totalRev) * 100, 100) : 0;
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

            {/* Interactive Daily Ledger Table */}
            <div className="border-t pt-5">
              <h5 className="text-[10px] font-black text-neutral-850 uppercase tracking-widest mb-3">Nhật ký tài chính chi tiết từng ngày</h5>
              <div className="overflow-x-auto max-h-[300px] border border-neutral-100 rounded-2xl relative">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
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
        </div>
      )}
    </div>
  );
}
