'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../../../lib/utils';

interface PendingActionsPanelProps {
  currentBranch: string;
  kpiPercentage: number;
  totalRevenue: number;
  kpiTarget: number;
  pendingOrders: any[];
  lowStockCount: number;
  pendingLeaves: any[];
  pendingTransfers: any[];
  currentUserRole: string;
  setActiveTab: (tab: string) => void;
  setStaffScheduleSubTab?: (tab: string) => void;
}

export default function PendingActionsPanel({
  currentBranch,
  kpiPercentage,
  totalRevenue,
  kpiTarget,
  pendingOrders,
  lowStockCount,
  pendingLeaves,
  pendingTransfers,
  currentUserRole,
  setActiveTab,
  setStaffScheduleSubTab
}: PendingActionsPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* KPI Progress bar */}
      <div className="lg:col-span-8 bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-3 text-xs font-bold">
          <span className="uppercase tracking-wider">Tiến trình doanh số tháng</span>
          <span>
            {kpiPercentage.toFixed(1)}% ({formatPrice(totalRevenue)} / {formatPrice(kpiTarget)})
          </span>
        </div>
        <div className="w-full bg-brand-bg h-3 rounded-full border border-brand-border overflow-hidden">
          <div
            className="bg-brand-success h-full transition-all duration-500"
            style={{ width: `${kpiPercentage}%` }}
          />
        </div>
        <p className="text-[10px] text-brand-muted mt-2 font-medium">
          Mục tiêu tháng của {currentBranch === 'all' ? 'hệ thống' : currentBranch} là {formatPrice(kpiTarget)}. Hãy đẩy mạnh bán hàng và các chiến dịch khuyến mãi!
        </p>
      </div>

      {/* Area: "Cần xử lý" (Pending Panel) */}
      <div className="lg:col-span-4 bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-black text-brand-accent uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-brand-warning shrink-0" />
          Công việc cần xử lý
        </h3>
        <div className="space-y-3">
          {/* 1. Đơn hàng chờ xử lý */}
          {pendingOrders.length > 0 && (
            <div className="flex items-center justify-between text-xs border-b border-brand-bg pb-2 last:border-0 last:pb-0">
              <div>
                <span className="font-bold text-brand-accent">Đơn hàng chờ xử lý</span>
                <span className="block text-[10px] text-brand-muted">{pendingOrders.length} đơn cần xác nhận</span>
              </div>
              <button
                onClick={() => {
                  setActiveTab('sales-orders-list');
                }}
                className="px-2.5 py-1.5 bg-brand-bg hover:bg-brand-border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Xử lý ngay
              </button>
            </div>
          )}

          {/* 2. Sản phẩm sắp hết hàng */}
          {lowStockCount > 0 && (
            <div className="flex items-center justify-between text-xs border-b border-brand-bg pb-2 last:border-0 last:pb-0">
              <div>
                <span className="font-bold text-brand-accent">Hàng sắp hết trong kho</span>
                <span className="block text-[10px] text-brand-muted">{lowStockCount} mã tồn thấp (&lt; 5 chiếc)</span>
              </div>
              <button
                onClick={() => {
                  setActiveTab('restock');
                }}
                className="px-2.5 py-1.5 bg-brand-bg hover:bg-brand-border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Nhập hàng
              </button>
            </div>
          )}

          {/* 3. Đơn xin nghỉ phép cần duyệt */}
          {currentUserRole !== 'accountant' && pendingLeaves.length > 0 && (
            <div className="flex items-center justify-between text-xs border-b border-brand-bg pb-2 last:border-0 last:pb-0">
              <div>
                <span className="font-bold text-brand-accent">Đơn xin nghỉ phép</span>
                <span className="block text-[10px] text-brand-muted">{pendingLeaves.length} nhân sự xin nghỉ ca</span>
              </div>
              <button
                onClick={() => {
                  setActiveTab('shifts');
                  if (setStaffScheduleSubTab) setStaffScheduleSubTab('approval');
                }}
                className="px-2.5 py-1.5 bg-brand-bg hover:bg-brand-border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Phê duyệt
              </button>
            </div>
          )}

          {/* 4. Yêu cầu chuyển hàng */}
          {pendingTransfers.length > 0 && (
            <div className="flex items-center justify-between text-xs border-b border-brand-bg pb-2 last:border-0 last:pb-0">
              <div>
                <span className="font-bold text-brand-accent">Yêu cầu điều chuyển</span>
                <span className="block text-[10px] text-brand-muted">{pendingTransfers.length} phiếu đang vận chuyển</span>
              </div>
              <button
                onClick={() => {
                  setActiveTab('stocker-transfer');
                }}
                className="px-2.5 py-1.5 bg-brand-bg hover:bg-brand-border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Nhận hàng
              </button>
            </div>
          )}

          {pendingOrders.length === 0 &&
            lowStockCount === 0 &&
            pendingLeaves.length === 0 &&
            pendingTransfers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center select-none">
                <CheckCircle2 className="w-8 h-8 text-brand-success/50 mb-2" />
                <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">Hệ thống an toàn</p>
                <p className="text-[9px] text-brand-muted mt-0.5">Không có công việc nào khẩn cấp.</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
