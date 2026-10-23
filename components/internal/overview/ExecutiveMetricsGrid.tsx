'use client';

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Box,
  HelpCircle
} from 'lucide-react';
import { formatPrice } from '../../../lib/utils';

interface ExecutiveMetricsGridProps {
  totalRevenue: number;
  netProfit: number;
  completedOrdersCount: number;
  aov: number;
  totalCosts: number;
  lowStockCount: number;
  hoveredTooltip: string | null;
  setHoveredTooltip: (tip: string | null) => void;
}

export default function ExecutiveMetricsGrid({
  totalRevenue,
  netProfit,
  completedOrdersCount,
  aov,
  totalCosts,
  lowStockCount,
  hoveredTooltip,
  setHoveredTooltip
}: ExecutiveMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      {/* 1. Doanh thu */}
      <div className="bg-white p-5 rounded-2xl border border-brand-border flex flex-col justify-between shadow-sm relative group hover:border-brand-accent transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black text-brand-muted uppercase tracking-wider">Doanh thu</span>
          <div className="p-1 rounded-lg bg-brand-success/10 text-brand-success">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <span className="text-sm font-black font-mono text-brand-accent block truncate">{formatPrice(totalRevenue)}</span>
          <span className="text-[9px] text-brand-success font-bold mt-0.5 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +12% vs kỳ trước
          </span>
        </div>
      </div>

      {/* 2. Lợi nhuận ước tính */}
      <div className="bg-white p-5 rounded-2xl border border-brand-border flex flex-col justify-between shadow-sm relative group hover:border-brand-accent transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black text-brand-muted uppercase tracking-wider flex items-center gap-1">
            Lợi nhuận
            <button
              onMouseEnter={() => setHoveredTooltip('profit')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className="cursor-help"
            >
              <HelpCircle className="w-3 h-3 text-brand-muted" />
            </button>
          </span>
          <div className={`p-1 rounded-lg ${netProfit >= 0 ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-danger/10 text-brand-danger'}`}>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <span className={`text-sm font-black font-mono block truncate ${netProfit >= 0 ? 'text-brand-accent' : 'text-brand-danger'}`}>
            {formatPrice(netProfit)}
          </span>
          <span className={`text-[9px] font-bold mt-0.5 block ${netProfit >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
            {netProfit >= 0 ? 'Lợi nhuận ròng thặng dư' : 'Cần tối ưu chi phí'}
          </span>
        </div>

        {/* Tooltip Popup */}
        {hoveredTooltip === 'profit' && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-brand-accent text-white text-[10px] p-2.5 rounded-xl shadow-xl leading-relaxed z-10">
            Lợi nhuận ước tính = Doanh thu - Giá vốn (40%) - Phí mặt bằng - Chi phí lương - Chi phí nhập kho.
          </div>
        )}
      </div>

      {/* 3. Tổng đơn hàng */}
      <div className="bg-white p-5 rounded-2xl border border-brand-border flex flex-col justify-between shadow-sm relative group hover:border-brand-accent transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black text-brand-muted uppercase tracking-wider">Tổng đơn hàng</span>
          <div className="p-1 rounded-lg bg-brand-info/10 text-brand-info">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <span className="text-sm font-black font-mono text-brand-accent block truncate">{completedOrdersCount} đơn</span>
          <span className="text-[9px] text-brand-muted font-bold mt-0.5 block">Đã giao thành công</span>
        </div>
      </div>

      {/* 4. Giá trị đơn trung bình */}
      <div className="bg-white p-5 rounded-2xl border border-brand-border flex flex-col justify-between shadow-sm relative group hover:border-brand-accent transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black text-brand-muted uppercase tracking-wider flex items-center gap-1">
            Giá trị TB (AOV)
          </span>
          <div className="p-1 rounded-lg bg-brand-accent-secondary/15 text-brand-accent-secondary">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <span className="text-sm font-black font-mono text-brand-accent block truncate">{formatPrice(aov)}</span>
          <span className="text-[9px] text-brand-muted font-bold mt-0.5 block">Bình quân / Giao dịch</span>
        </div>
      </div>

      {/* 5. Chi phí vận hành */}
      <div className="bg-white p-5 rounded-2xl border border-brand-border flex flex-col justify-between shadow-sm relative group hover:border-brand-accent transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black text-brand-muted uppercase tracking-wider flex items-center gap-1">
            Chi phí
            <button
              onMouseEnter={() => setHoveredTooltip('costs')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className="cursor-help"
            >
              <HelpCircle className="w-3 h-3 text-brand-muted" />
            </button>
          </span>
          <div className="p-1 rounded-lg bg-brand-warning/10 text-brand-warning">
            <TrendingDown className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <span className="text-sm font-black font-mono text-brand-accent block truncate">{formatPrice(totalCosts)}</span>
          <span className="text-[9px] text-brand-muted font-bold mt-0.5 block">Nhập hàng + Lương + Phí</span>
        </div>

        {hoveredTooltip === 'costs' && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-brand-accent text-white text-[10px] p-2.5 rounded-xl shadow-xl leading-relaxed z-10">
            Tổng chi phí bao gồm giá vốn hàng bán, chi phí tiếp thị, phí vận hành khác, quỹ lương nhân sự và tiền nhập hàng.
          </div>
        )}
      </div>

      {/* 6. Sản phẩm sắp hết */}
      <div className="bg-white p-5 rounded-2xl border border-brand-border flex flex-col justify-between shadow-sm relative group hover:border-brand-accent transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black text-brand-muted uppercase tracking-wider">Hàng sắp hết</span>
          <div className={`p-1 rounded-lg ${lowStockCount > 0 ? 'bg-brand-danger/10 text-brand-danger animate-pulse' : 'bg-brand-bg text-brand-muted'}`}>
            <Box className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <span className="text-sm font-black font-mono text-brand-accent block truncate">{lowStockCount} sản phẩm</span>
          <span className={`text-[9px] font-bold mt-0.5 block ${lowStockCount > 0 ? 'text-brand-danger' : 'text-brand-muted'}`}>
            {lowStockCount > 0 ? 'Cần bổ sung tồn kho' : 'Tồn kho ổn định'}
          </span>
        </div>
      </div>
    </div>
  );
}
