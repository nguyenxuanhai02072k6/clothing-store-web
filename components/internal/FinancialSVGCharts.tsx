'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, PieChart, Sliders, CheckCircle2, Download, AlertCircle } from 'lucide-react';
import { formatPrice } from '../../lib/utils';

interface FinancialSVGChartsProps {
  allOrders: any[];
  restockRecords: any[];
  expensesList: any[];
  usersList: any[];
  currentUser: any;
}

export default function FinancialSVGCharts({
  allOrders,
  restockRecords,
  expensesList,
  usersList,
  currentUser
}: FinancialSVGChartsProps) {
  const [citRate, setCitRate] = useState<number>(20);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  // 1. Calculate general numbers
  const completedOrders = allOrders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  
  const q1Revenue = completedOrders.filter(o => o.branch.includes('Quận 1')).reduce((sum, o) => sum + o.total, 0);
  const tdRevenue = completedOrders.filter(o => o.branch.includes('Thảo Điền')).reduce((sum, o) => sum + o.total, 0);

  const totalRestockCost = restockRecords
    .filter(r => !r.status || r.status === 'approved')
    .reduce((sum, r) => sum + r.cost, 0);

  const totalSalaries = usersList
    .filter(u => u.role !== 'customer')
    .reduce((sum, u) => sum + (u.salary || 0), 0);

  const totalMarketing = expensesList.filter(e => e.category === 'marketing').reduce((sum, e) => sum + e.amount, 0);
  const totalOperations = expensesList.filter(e => e.category === 'operations').reduce((sum, e) => sum + e.amount, 0);
  const totalEquipment = expensesList.filter(e => e.category === 'equipment').reduce((sum, e) => sum + e.amount, 0);
  const totalOtherExpenses = expensesList.filter(e => e.category === 'other').reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = totalMarketing + totalOperations + totalEquipment + totalOtherExpenses;
  const totalCosts = totalRestockCost + totalSalaries + totalExpenses;

  // Earnings Before Tax (EBT)
  const ebt = totalRevenue - totalCosts;
  const projectedCit = ebt > 0 ? ebt * (citRate / 100) : 0;
  const projectedNetProfit = ebt - projectedCit;

  // 2. Mock monthly points for the Line Chart (Revenue vs. Profit)
  const monthlyData = [
    { month: 'T1', revenue: totalRevenue * 0.75, costs: totalCosts * 0.8, profit: (totalRevenue * 0.75) - (totalCosts * 0.8) },
    { month: 'T2', revenue: totalRevenue * 0.85, costs: totalCosts * 0.82, profit: (totalRevenue * 0.85) - (totalCosts * 0.82) },
    { month: 'T3', revenue: totalRevenue * 0.9, costs: totalCosts * 0.85, profit: (totalRevenue * 0.9) - (totalCosts * 0.85) },
    { month: 'T4', revenue: totalRevenue * 0.95, costs: totalCosts * 0.92, profit: (totalRevenue * 0.95) - (totalCosts * 0.92) },
    { month: 'T5 (Hiện tại)', revenue: totalRevenue, costs: totalCosts, profit: ebt },
  ];

  // 3. SVG Line Chart drawing helpers
  const width = 500;
  const height = 180;
  const padding = 30;

  const maxVal = Math.max(...monthlyData.map(d => Math.max(d.revenue, d.costs)), 1000000);
  
  const getX = (index: number) => padding + (index * (width - 2 * padding) / (monthlyData.length - 1));
  const getY = (val: number) => height - padding - (val * (height - 2 * padding) / maxVal);

  const revenuePoints = monthlyData.map((d, i) => `${getX(i)},${getY(d.revenue)}`).join(' ');
  const costsPoints = monthlyData.map((d, i) => `${getX(i)},${getY(d.costs)}`).join(' ');
  const profitPoints = monthlyData.map((d, i) => `${getX(i)},${getY(d.profit)}`).join(' ');

  // 4. Expense Categories breakdown (for bar chart)
  const expenseCategories = [
    { name: 'Marketing', value: totalMarketing, color: '#D97706' }, // Amber
    { name: 'Nhập hàng', value: totalRestockCost, color: '#059669' }, // Emerald
    { name: 'Lương nhân sự', value: totalSalaries, color: '#4F46E5' }, // Indigo
    { name: 'Vận hành', value: totalOperations + totalEquipment + totalOtherExpenses, color: '#2563EB' }, // Blue
  ];
  const maxExpense = Math.max(...expenseCategories.map(e => e.value), 1000000);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Dynamic tax calculator banner */}
      <div className="bg-neutral-50 p-6 rounded-[28px] border border-neutral-150/40 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-neutral-900 text-white font-extrabold px-2.5 py-0.5 rounded-full tracking-wider uppercase">Dự phòng thuế CIT thông minh</span>
            <span className="text-xs font-bold text-neutral-500">Thuế CIT hiện hành: {citRate}%</span>
          </div>
          <h4 className="text-sm font-black text-neutral-950 uppercase tracking-wide">Quyết Toán Thuế & Dự Phỏng Lợi Nhuận Ròng</h4>
          <p className="text-xs text-neutral-450 leading-relaxed max-w-2xl">Kéo thanh trượt để giả lập mức thuế thu nhập doanh nghiệp (CIT) thực tế và tính toán nhanh khoản lợi nhuận ròng thặng dư sau thuế.</p>
          
          <div className="flex items-center gap-4 pt-2">
            <span className="text-[10px] text-neutral-450 font-bold uppercase tracking-wider">CIT Rate (10% - 30%)</span>
            <input
              type="range"
              min={10}
              max={30}
              value={citRate}
              onChange={(e) => setCitRate(Number(e.target.value))}
              className="flex-grow max-w-xs h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-950"
            />
            <span className="text-xs font-black text-rose-650 shrink-0">{citRate}%</span>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border flex flex-col justify-between shadow-sm min-h-[110px]">
          <div>
            <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Dự tính Thuế CIT phải nộp ({citRate}%)</span>
            <span className="text-base font-black text-rose-650">{formatPrice(projectedCit)}</span>
          </div>
          <div className="border-t pt-2.5 mt-2 flex justify-between items-center text-[10px]">
            <span className="font-bold text-neutral-400">LỢI NHUẬN RÒNG SAU THUẾ:</span>
            <span className={`font-black font-mono ${projectedNetProfit >= 0 ? 'text-emerald-600' : 'text-rose-650'}`}>
              {formatPrice(projectedNetProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SVG Line Chart: Revenue vs Profit */}
        <div className="bg-white border border-neutral-100 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-neutral-955 tracking-wide uppercase mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-neutral-700" />
              Xu Hướng Doanh Thu và Lợi Nhuận Luỹ Kế
            </h4>
            <p className="text-[10px] text-neutral-400 mb-6">Thống kê 5 tháng đầu năm 2026 dựa trên P&L kết quả kinh doanh.</p>
          </div>

          <div className="relative w-full overflow-hidden flex justify-center">
            {/* SVG line chart canvas */}
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[500px] h-auto overflow-visible select-none">
              {/* Grid Lines */}
              {Array.from({ length: 4 }).map((_, i) => {
                const y = padding + (i * (height - 2 * padding) / 3);
                return (
                  <line 
                    key={i} 
                    x1={padding} 
                    y1={y} 
                    x2={width - padding} 
                    y2={y} 
                    stroke="#F3F4F6" 
                    strokeWidth="1" 
                    strokeDasharray="4 4" 
                  />
                );
              })}

              {/* Monthly label ticks */}
              {monthlyData.map((d, i) => (
                <text
                  key={i}
                  x={getX(i)}
                  y={height - 10}
                  textAnchor="middle"
                  fill="#9CA3AF"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {d.month}
                </text>
              ))}

              {/* Curves */}
              <polyline
                fill="none"
                stroke="#171717" // Neutral-950 for revenue
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={revenuePoints}
                className="transition-all duration-500"
              />
              <polyline
                fill="none"
                stroke="#9CA3AF" // Costs
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={costsPoints}
                className="transition-all duration-500"
              />
              <polyline
                fill="none"
                stroke="#10B981" // Profit (Emerald)
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={profitPoints}
                className="transition-all duration-500"
              />

              {/* Interaction points */}
              {monthlyData.map((d, i) => (
                <g key={i}>
                  <circle
                    cx={getX(i)}
                    cy={getY(d.revenue)}
                    r="4.5"
                    fill="#171717"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="cursor-pointer hover:r-6 transition-all"
                    onMouseEnter={(e) => setHoveredPoint({ x: getX(i), y: getY(d.revenue) - 15, label: `Doanh thu ${d.month}`, value: d.revenue })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  <circle
                    cx={getX(i)}
                    cy={getY(d.profit)}
                    r="4.5"
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="cursor-pointer hover:r-6 transition-all"
                    onMouseEnter={(e) => setHoveredPoint({ x: getX(i), y: getY(d.profit) - 15, label: `Lợi nhuận ${d.month}`, value: d.profit })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Custom Tooltip */}
            <AnimatePresence>
              {hoveredPoint && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bg-neutral-900 text-white rounded-lg px-2.5 py-1.5 border text-[9px] font-black pointer-events-none shadow-md"
                  style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / height) * 100}%`, transform: 'translate(-50%, -100%)' }}
                >
                  <span className="block opacity-60 uppercase">{hoveredPoint.label}</span>
                  <span className="block text-[10px] font-mono mt-0.5">{formatPrice(hoveredPoint.value)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-4 mt-6 text-[8px] font-bold text-neutral-400 justify-center">
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-neutral-950" /> Doanh Thu (Hệ thống)</span>
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-neutral-400" /> Tổng định phí + Biến phí</span>
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-emerald-500" /> Lợi nhuận gộp EBT</span>
          </div>
        </div>

        {/* SVG Bar Chart: Expenses Breakdown */}
        <div className="bg-white border border-neutral-100 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-neutral-955 tracking-wide uppercase mb-1 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-neutral-700" />
              Cơ Cấu Các Chi Phí Vận Hành Lũy Kế
            </h4>
            <p className="text-[10px] text-neutral-400 mb-6">Đóng góp chi phí COGS nhập hàng, quỹ lương, tiếp thị và phí mặt bằng chi nhánh.</p>
          </div>

          <div className="space-y-4 flex-grow flex flex-col justify-center">
            {expenseCategories.map((exp) => {
              const percent = (exp.value / (totalCosts || 1)) * 100;
              return (
                <div key={exp.name} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-neutral-700">{exp.name}</span>
                    <span className="font-black text-neutral-900">{formatPrice(exp.value)} ({percent.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-neutral-50 h-2 rounded-full overflow-hidden border border-neutral-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: exp.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4 mt-6 flex justify-between items-center text-[10px] text-neutral-400 font-semibold leading-relaxed">
            <span>Chi nhánh đóng góp nhiều nhất:</span>
            <span className="text-rose-650 font-black uppercase">Quận 1 (Chi phí lương & mặt bằng chiếm 58%)</span>
          </div>
        </div>

      </div>

      {/* Market share doughnut preview & tax settlement locks */}
      <div className="bg-white border border-neutral-100 p-6 rounded-[28px] shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-2">
          <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">Phân bổ thị phần doanh số chi nhánh</h4>
          <p className="text-[10px] text-neutral-400">Tỷ trọng doanh số hoàn thành giữa các chi nhánh chính của Novyn Wear trong kỳ.</p>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded bg-rose-500 shrink-0" />
              <div>
                <span className="text-[10px] text-neutral-450 font-bold block uppercase">Chi nhánh Quận 1</span>
                <span className="text-xs font-black text-neutral-800">{formatPrice(q1Revenue)} ({((q1Revenue / (totalRevenue || 1)) * 100).toFixed(1)}%)</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded bg-amber-500 shrink-0" />
              <div>
                <span className="text-[10px] text-neutral-450 font-bold block uppercase">Chi nhánh Thảo Điền</span>
                <span className="text-xs font-black text-neutral-800">{formatPrice(tdRevenue)} ({((tdRevenue / (totalRevenue || 1)) * 100).toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Doughnut SVG Drawing */}
        <div className="md:col-span-4 flex justify-center">
          <svg viewBox="0 0 100 100" className="w-24 h-24 overflow-visible">
            {/* Base grey background circle */}
            <circle cx="50" cy="50" r="35" fill="transparent" stroke="#E5E7EB" strokeWidth="15" />
            
            {/* Q1 Circle slice (e.g. 60%) */}
            {totalRevenue > 0 && (
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="transparent"
                stroke="#F43F5E" // Rose-500
                strokeWidth="15"
                strokeDasharray={`${(q1Revenue / totalRevenue) * 220} 220`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
                className="transition-all duration-800"
              />
            )}
            
            {/* Thảo điền circle slice */}
            {totalRevenue > 0 && (
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="transparent"
                stroke="#F59E0B" // Amber-500
                strokeWidth="15"
                strokeDasharray={`${(tdRevenue / totalRevenue) * 220} 220`}
                strokeDashoffset={`-${(q1Revenue / totalRevenue) * 220}`}
                transform="rotate(-90 50 50)"
                className="transition-all duration-800"
              />
            )}

            {/* Central hole label */}
            <circle cx="50" cy="50" r="22" fill="#FFFFFF" />
            <text x="50" y="52" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#111827">NOVYN</text>
          </svg>
        </div>
      </div>
    </div>
  );
}
