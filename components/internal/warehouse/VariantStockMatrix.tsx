'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Layers,
  Box,
  AlertTriangle,
  ArrowRightLeft,
  Truck,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Clock,
  ArrowRight,
  TrendingDown,
  Building2,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../../../lib/utils';

export interface VariantStockMatrixProps {
  currentUser: any;
  productsList: any[];
  branchStock: Record<string, Record<string, number>>;
  restockBranchProduct?: (productId: string, branchName: string, quantity: number) => void;
  refreshInventoryStocks?: () => Promise<void>;
  onSwitchToTransferTab?: () => void;
  transfers?: any[];
  setTransfers?: any;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const SIZES = ['S', 'M', 'L', 'XL'];
const BRANCHES = ['Chi nhánh Quận 1', 'Chi nhánh Thảo Điền'];

export default function VariantStockMatrix({
  currentUser,
  productsList,
  branchStock,
  restockBranchProduct,
  refreshInventoryStocks,
  onSwitchToTransferTab,
  transfers = [],
  setTransfers,
  showToast
}: VariantStockMatrixProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'out' | 'low' | 'safe'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'alerts' | 'transfer_flow'>('matrix');

  // Quick Restock Modal State
  const [restockModal, setRestockModal] = useState<{
    isOpen: boolean;
    product: any | null;
    branch: string;
    size: string;
    quantity: number;
  }>({
    isOpen: false,
    product: null,
    branch: 'Chi nhánh Quận 1',
    size: 'M',
    quantity: 10
  });

  // Calculate stock metrics
  const totalProducts = productsList.length;
  let outOfStockCount = 0;
  let lowStockCount = 0;
  let safeStockCount = 0;

  productsList.forEach(prod => {
    BRANCHES.forEach(branch => {
      const stock = branchStock?.[prod.id]?.[branch] ?? 10;
      if (stock === 0) outOfStockCount++;
      else if (stock < 5) lowStockCount++;
      else safeStockCount++;
    });
  });

  // Filter products
  const filteredProducts = productsList.filter(prod => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || prod.category === categoryFilter;

    if (!matchesSearch || !matchesCat) return false;

    if (stockStatusFilter !== 'all') {
      const currentBranch = currentUser?.branch || 'Chi nhánh Quận 1';
      const stock = branchStock?.[prod.id]?.[currentBranch] ?? 10;
      if (stockStatusFilter === 'out' && stock !== 0) return false;
      if (stockStatusFilter === 'low' && (stock <= 0 || stock >= 5)) return false;
      if (stockStatusFilter === 'safe' && stock < 5) return false;
    }

    return true;
  });

  // Helper to get simulated variant stock for a size
  const getVariantStock = (productId: string, branch: string, size: string): number => {
    const totalBranchStock = branchStock?.[productId]?.[branch] ?? 12;
    if (totalBranchStock === 0) return 0;
    // Distribute among S, M, L, XL with deterministic weighting
    const hash = (productId.charCodeAt(productId.length - 1) + size.charCodeAt(0)) % 4;
    const baseShare = Math.floor(totalBranchStock / 4);
    if (size === 'M' || size === 'L') {
      return baseShare + (hash % 2 === 0 ? 1 : 0);
    }
    return Math.max(0, baseShare - (hash % 2 === 1 ? 1 : 0));
  };

  const handleExecuteRestock = () => {
    if (!restockModal.product) return;
    if (restockBranchProduct) {
      restockBranchProduct(restockModal.product.id, restockModal.branch, restockModal.quantity);
    }
    showToast(
      `✓ Đã nhập thêm ${restockModal.quantity} sp [${restockModal.product.name} - ${restockModal.size}] vào ${restockModal.branch}!`,
      'success'
    );
    setRestockModal({ isOpen: false, product: null, branch: 'Chi nhánh Quận 1', size: 'M', quantity: 10 });
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tab Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-black text-neutral-900 tracking-tight uppercase">
              Ma Trận Tồn Kho Biến Thể 2 Chi Nhánh (WMS)
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            So sánh tồn kho đa chi nhánh (Q1 vs Thảo Điền), cảnh báo ngưỡng an toàn và quy trình điều chuyển 3 bước.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-xl gap-1 shrink-0">
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'matrix'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Ma trận Size/Màu
          </button>
          <button
            onClick={() => setActiveSubTab('alerts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'alerts'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Cảnh báo ngưỡng</span>
            {lowStockCount + outOfStockCount > 0 && (
              <span className="bg-rose-500 text-white font-mono text-[9px] px-1.5 py-0.2 rounded-full">
                {lowStockCount + outOfStockCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('transfer_flow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'transfer_flow'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Luồng điều chuyển (3 bước)</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Tổng mã sản phẩm
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-neutral-900">{totalProducts}</span>
            <span className="text-xs text-neutral-500">mã mẫu</span>
          </div>
        </div>

        <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Hết hàng (0 sp)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-rose-700">{outOfStockCount}</span>
            <span className="text-xs text-rose-600 font-semibold">điểm bán</span>
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-amber-600" />
            Sắp hết (&lt; 5 sp)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-amber-800">{lowStockCount}</span>
            <span className="text-xs text-amber-700 font-semibold">cần nhập kho</span>
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Tồn an toàn (≥ 5 sp)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-800">{safeStockCount}</span>
            <span className="text-xs text-emerald-700 font-semibold">ổn định</span>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto flex-1 max-w-xl">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-white text-neutral-800 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border rounded-xl text-xs bg-white text-neutral-800 focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="Tops">Áo thiết kế</option>
            <option value="Bottoms">Quần & Chân váy</option>
            <option value="Dresses">Đầm</option>
            <option value="Outerwear">Áo khoác</option>
          </select>
        </div>

        {/* Stock Threshold Filter */}
        <div className="flex gap-1.5 overflow-x-auto select-none no-scrollbar">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'out', label: '🔴 Hết hàng' },
            { key: 'low', label: '🟡 Sắp hết (< 5)' },
            { key: 'safe', label: '🟢 An toàn (≥ 5)' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setStockStatusFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                stockStatusFilter === f.key
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                  : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-TAB 1: 2D VARIANT MATRIX VIEW */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map(prod => {
              const q1Total = branchStock?.[prod.id]?.['Chi nhánh Quận 1'] ?? 10;
              const tdTotal = branchStock?.[prod.id]?.['Chi nhánh Thảo Điền'] ?? 8;
              const globalTotal = q1Total + tdTotal;

              return (
                <div
                  key={prod.id}
                  className="bg-white border rounded-2xl p-5 shadow-xs hover:border-neutral-300 transition-all space-y-4"
                >
                  {/* Product Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-150">
                        <Image
                          src={prod.images[0]}
                          alt={prod.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-neutral-900">{prod.name}</h4>
                          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                            {prod.id}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {prod.category} • Giá bán:{' '}
                          <span className="font-bold font-mono text-neutral-800">{formatPrice(prod.price)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Total Stock Indicator */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500 font-medium">Tổng tồn 2 chi nhánh:</span>
                      <span
                        className={`text-sm font-black font-mono px-3 py-1 rounded-xl ${
                          globalTotal === 0
                            ? 'bg-rose-100 text-rose-800'
                            : globalTotal < 8
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {globalTotal} chiếc
                      </span>
                    </div>
                  </div>

                  {/* 2D Size x Color Matrix Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider text-[10px] border-b">
                          <th className="p-3 w-28">Kích thước</th>
                          <th className="p-3 text-center">
                            <span className="flex items-center justify-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-blue-600" />
                              Chi nhánh Quận 1 (Tổng: {q1Total})
                            </span>
                          </th>
                          <th className="p-3 text-center">
                            <span className="flex items-center justify-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                              Chi nhánh Thảo Điền (Tổng: {tdTotal})
                            </span>
                          </th>
                          <th className="p-3 text-right">Thao tác nhanh</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {SIZES.map(sz => {
                          const stockQ1 = getVariantStock(prod.id, 'Chi nhánh Quận 1', sz);
                          const stockTD = getVariantStock(prod.id, 'Chi nhánh Thảo Điền', sz);

                          return (
                            <tr key={sz} className="hover:bg-neutral-50/70 transition-colors">
                              <td className="p-3 font-mono font-black text-neutral-900">
                                <span className="px-2.5 py-1 bg-neutral-100 rounded-md border text-xs">
                                  Size {sz}
                                </span>
                              </td>

                              {/* Branch 1 Cell */}
                              <td className="p-3 text-center">
                                <div className="inline-flex items-center gap-2">
                                  <span
                                    className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                                      stockQ1 === 0
                                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                        : stockQ1 < 3
                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    }`}
                                  >
                                    {stockQ1 === 0 ? 'Hết hàng' : `${stockQ1} cái`}
                                  </span>
                                  {stockQ1 < 3 && (
                                    <button
                                      onClick={() =>
                                        setRestockModal({
                                          isOpen: true,
                                          product: prod,
                                          branch: 'Chi nhánh Quận 1',
                                          size: sz,
                                          quantity: 15
                                        })
                                      }
                                      className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                                    >
                                      + Nhập
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Branch 2 Cell */}
                              <td className="p-3 text-center">
                                <div className="inline-flex items-center gap-2">
                                  <span
                                    className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                                      stockTD === 0
                                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                        : stockTD < 3
                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    }`}
                                  >
                                    {stockTD === 0 ? 'Hết hàng' : `${stockTD} cái`}
                                  </span>
                                  {stockTD < 3 && (
                                    <button
                                      onClick={() =>
                                        setRestockModal({
                                          isOpen: true,
                                          product: prod,
                                          branch: 'Chi nhánh Thảo Điền',
                                          size: sz,
                                          quantity: 15
                                        })
                                      }
                                      className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                                    >
                                      + Nhập
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Fast Action */}
                              <td className="p-3 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      if (onSwitchToTransferTab) {
                                        onSwitchToTransferTab();
                                      } else {
                                        setActiveSubTab('transfer_flow');
                                      }
                                      showToast(`Đã mở điều chuyển cho mã ${prod.name} (Size ${sz})`, 'info');
                                    }}
                                    className="px-2.5 py-1 text-[10px] font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <ArrowRightLeft className="w-3 h-3 text-neutral-500" />
                                    <span>Điều chuyển</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LOW-STOCK ALERTS DASHBOARD */}
      {activeSubTab === 'alerts' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Quy tắc cảnh báo ngưỡng an toàn (Safety Stock Alerts)
            </h4>
            <p className="text-[11px] text-amber-800 mt-1">
              • Đỏ: <strong>0 sản phẩm</strong> (Đã hết sạch quầy, cần nhập gấp hoặc chuyển từ kho khác).
              <br />• Vàng: <strong>Dưới 5 sản phẩm</strong> (Dưới điểm đặt hàng lại - Reorder Point).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {productsList
              .filter(p => {
                const q1 = branchStock?.[p.id]?.['Chi nhánh Quận 1'] ?? 10;
                const td = branchStock?.[p.id]?.['Chi nhánh Thảo Điền'] ?? 8;
                return q1 < 5 || td < 5;
              })
              .map(prod => {
                const q1 = branchStock?.[prod.id]?.['Chi nhánh Quận 1'] ?? 10;
                const td = branchStock?.[prod.id]?.['Chi nhánh Thảo Điền'] ?? 8;

                return (
                  <div
                    key={prod.id}
                    className="bg-white border-2 border-amber-200/80 rounded-2xl p-4 shadow-xs space-y-3"
                  >
                    <div className="flex gap-3">
                      <div className="relative w-14 h-18 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border">
                        <Image
                          src={prod.images[0]}
                          alt={prod.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-neutral-900 truncate">{prod.name}</h5>
                        <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">{prod.id}</span>
                        <div className="mt-2 space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Q.1:</span>
                            <span
                              className={`font-mono font-bold ${
                                q1 === 0 ? 'text-rose-600' : q1 < 5 ? 'text-amber-700' : 'text-emerald-700'
                              }`}
                            >
                              {q1} chiếc
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Thảo Điền:</span>
                            <span
                              className={`font-mono font-bold ${
                                td === 0 ? 'text-rose-600' : td < 5 ? 'text-amber-700' : 'text-emerald-700'
                              }`}
                            >
                              {td} chiếc
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dashed">
                      <button
                        onClick={() =>
                          setRestockModal({
                            isOpen: true,
                            product: prod,
                            branch: q1 < td ? 'Chi nhánh Quận 1' : 'Chi nhánh Thảo Điền',
                            size: 'M',
                            quantity: 20
                          })
                        }
                        className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold text-center cursor-pointer transition-colors"
                      >
                        + Tạo phiếu nhập
                      </button>
                      <button
                        onClick={() => {
                          setActiveSubTab('transfer_flow');
                          showToast(`Mở luồng chuyển kho cho ${prod.name}`, 'info');
                        }}
                        className="py-1.5 px-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-[10px] font-bold text-center cursor-pointer transition-colors"
                      >
                        Chuyển liên kho
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: 3-STEP INTER-BRANCH TRANSFER TRACKER */}
      {activeSubTab === 'transfer_flow' && (
        <div className="space-y-5">
          {/* Transfer Step Visual Flow */}
          <div className="bg-white border rounded-2xl p-5 shadow-xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800 mb-4">
              Quy Trình Điều Chuyển Kho Chuẩn 3 Bước
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Tạo phiếu & Chờ duyệt</span>
                </div>
                <p className="text-[11px] text-blue-700">
                  Chi nhánh thiếu hàng lập phiếu yêu cầu. Kho nguồn kiểm tra và giữ hàng.
                </p>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Đóng gói & Vận chuyển</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  Kho xuất đóng gói, bấm xuất kho. Hàng chuyển sang trạng thái "Đang trên đường".
                </p>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>Kiểm đếm & Nhập kho</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Kho nhận kiểm tra thực tế, xác nhận. Tự động cộng tồn kho đích và trừ kho nguồn.
                </p>
              </div>
            </div>
          </div>

          {/* Transfers Table */}
          <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800">
                Lịch sử phiếu điều chuyển ({transfers.length})
              </h4>
            </div>

            {transfers.length === 0 ? (
              <div className="text-center py-10 text-neutral-400 text-xs italic">
                Chưa có phiếu điều chuyển nào trong hệ thống.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider text-[10px] border-b">
                      <th className="p-3">Mã phiếu</th>
                      <th className="p-3">Sản phẩm</th>
                      <th className="p-3">Tuyến chuyển</th>
                      <th className="p-3 text-center">Số lượng</th>
                      <th className="p-3 text-center">Trạng thái (3 bước)</th>
                      <th className="p-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {transfers.map(tr => (
                      <tr key={tr.id} className="hover:bg-neutral-50">
                        <td className="p-3 font-mono font-bold text-neutral-900">{tr.id}</td>
                        <td className="p-3 font-bold text-neutral-800">{tr.productName}</td>
                        <td className="p-3 text-neutral-600">
                          {tr.fromBranch} <ArrowRight className="inline w-3 h-3 text-neutral-400 mx-1" />{' '}
                          {tr.toBranch}
                        </td>
                        <td className="p-3 text-center font-mono font-black">{tr.quantity} sp</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              tr.status === 'received'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tr.status === 'shipping'
                                ? 'bg-amber-100 text-amber-800'
                                : tr.status === 'cancelled'
                                ? 'bg-neutral-100 text-neutral-600'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {tr.status === 'received'
                              ? '✓ Đã nhận kho'
                              : tr.status === 'shipping'
                              ? '🚚 Đang vận chuyển'
                              : tr.status === 'cancelled'
                              ? 'Đã hủy'
                              : 'Chờ xuất kho'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {tr.status === 'shipping' && setTransfers && (
                            <button
                              onClick={() => {
                                setTransfers((prev: any[]) =>
                                  (prev || []).map((t: any) => (t.id === tr.id ? { ...t, status: 'received' } : t))
                                );
                                showToast(`✓ Đã xác nhận nhập kho cho phiếu ${tr.id}!`, 'success');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                            >
                              Xác nhận đã nhận
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUICK RESTOCK MODAL */}
      <AnimatePresence>
        {restockModal.isOpen && restockModal.product && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border shadow-xl p-6 w-full max-w-md text-neutral-800 space-y-4"
            >
              <div className="border-b pb-3">
                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                  <Box className="w-4 h-4 text-indigo-600" />
                  Nhập Hàng Nhanh Vào Chi Nhánh
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Sản phẩm: <strong>{restockModal.product.name}</strong> (Size {restockModal.size})
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                    Chi nhánh nhận hàng:
                  </label>
                  <select
                    value={restockModal.branch}
                    onChange={(e) => setRestockModal({ ...restockModal, branch: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                  >
                    {BRANCHES.map(b => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                    Số lượng nhập thêm:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={restockModal.quantity}
                    onChange={(e) =>
                      setRestockModal({ ...restockModal, quantity: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full p-2.5 border rounded-xl bg-white font-mono font-bold text-neutral-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleExecuteRestock}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Xác nhận nhập kho
                </button>
                <button
                  type="button"
                  onClick={() => setRestockModal({ ...restockModal, isOpen: false })}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs font-bold transition-all cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
