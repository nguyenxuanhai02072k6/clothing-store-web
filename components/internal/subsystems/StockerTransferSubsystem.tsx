'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, Truck, Clock, CheckCircle2, XCircle, Plus, Search } from 'lucide-react';
import {
  createInventoryTransferAction,
  updateInventoryTransferStatusAction,
} from '@/backend/actions/erpActions';

export interface StockerTransferSubsystemProps {
  currentUser: any;
  productsList: any[];
  branchStock: any;
  transfers: any[];
  setTransfers: (v: any[]) => void;
  restockBranchProduct: any;
  refreshInventoryStocks?: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const StockerTransferSubsystem: React.FC<StockerTransferSubsystemProps> = ({
  currentUser,
  productsList,
  branchStock,
  transfers,
  setTransfers,
  restockBranchProduct,
  refreshInventoryStocks,
  showToast,
}) => {
  const [newTransferProductId, setNewTransferProductId] = useState('');
  const [newTransferSize, setNewTransferSize] = useState('M');
  const [newTransferColor, setNewTransferColor] = useState('');
  const [newTransferQty, setNewTransferQty] = useState(1);
  const [newTransferFrom, setNewTransferFrom] = useState(currentUser?.branch || 'Chi nhánh Quận 1');
  const [newTransferTo, setNewTransferTo] = useState(
    currentUser?.branch === 'Chi nhánh Thảo Điền' ? 'Chi nhánh Quận 1' : 'Chi nhánh Thảo Điền'
  );
  const [transferSearchQuery, setTransferSearchQuery] = useState('');
  const [transferStatusFilter, setTransferStatusFilter] = useState<'all' | 'shipping' | 'received' | 'cancelled'>('all');

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

    const matched = productsList.find((p) => p.id === newTransferProductId);
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
        quantity: newTransferQty,
      });

      if (!res.success || !res.data) {
        showToast(res.error || 'Lỗi khi tạo phiếu điều chuyển!', 'error');
        return;
      }

      const updated = [res.data, ...transfers.filter((t) => t.id !== res.data.id)];
      setTransfers(updated);
      localStorage.setItem('novyn_stock_transfers', JSON.stringify(updated));

      // Immediately deduct source stock
      restockBranchProduct(newTransferProductId, -newTransferQty, newTransferSize, newTransferFrom);
      if (refreshInventoryStocks) {
        await refreshInventoryStocks();
      }

      setNewTransferQty(1);
      showToast(`✓ Đã tạo phiếu chuyển kho #${res.data.id} (Trừ kho ${newTransferFrom})!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tạo phiếu điều chuyển!', 'error');
    }
  };

  const handleReceiveTransfer = async (transferId: string) => {
    const t = transfers.find((item) => item.id === transferId);
    if (!t) return;

    try {
      const res = await updateInventoryTransferStatusAction(transferId, 'received');
      if (!res.success || !res.data) {
        showToast(res.error || 'Lỗi khi nhận hàng chuyển kho!', 'error');
        return;
      }

      const updated = transfers.map((item) => (item.id === transferId ? res.data : item));
      setTransfers(updated);
      localStorage.setItem('novyn_stock_transfers', JSON.stringify(updated));

      // Add to destination branch stock
      restockBranchProduct(t.productId, t.quantity, t.size, t.toBranch);
      if (refreshInventoryStocks) {
        await refreshInventoryStocks();
      }

      showToast(`✓ Đã nhận hàng thành công #${transferId} vào ${t.toBranch}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi nhận hàng!', 'error');
    }
  };

  const handleCancelTransfer = async (transferId: string) => {
    const t = transfers.find((item) => item.id === transferId);
    if (!t) return;

    try {
      const res = await updateInventoryTransferStatusAction(transferId, 'cancelled');
      if (!res.success || !res.data) {
        showToast(res.error || 'Lỗi khi hủy phiếu chuyển!', 'error');
        return;
      }

      const updated = transfers.map((item) => (item.id === transferId ? res.data : item));
      setTransfers(updated);
      localStorage.setItem('novyn_stock_transfers', JSON.stringify(updated));

      // Rollback stock to source branch
      restockBranchProduct(t.productId, t.quantity, t.size, t.fromBranch);
      if (refreshInventoryStocks) {
        await refreshInventoryStocks();
      }

      showToast(`✓ Đã hủy phiếu #${transferId} và hoàn lại tồn cho ${t.fromBranch}!`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi hủy phiếu!', 'error');
    }
  };

  const shippingCount = transfers.filter((t) => t.status === 'shipping').length;
  const receivedCount = transfers.filter((t) => t.status === 'received').length;
  const cancelledCount = transfers.filter((t) => t.status === 'cancelled').length;

  const filteredTransfers = transfers.filter((t) => {
    const matchStatus = transferStatusFilter === 'all' || t.status === transferStatusFilter;
    const query = transferSearchQuery.toLowerCase();
    const matchQuery =
      !query ||
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
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Tổng phiếu chuyển
          </span>
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
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Tự động trừ tồn nguồn ngay khi xuất và cộng kho đích khi nhận.
            </p>
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
                  const p = productsList.find((item) => item.id === prodId);
                  if (p && Array.isArray(p.colors) && p.colors.length > 0) {
                    setNewTransferColor(p.colors[0]?.name || p.colors[0] || 'Oatmeal');
                  }
                }}
                className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="">-- Chọn sản phẩm --</option>
                {productsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>

            {newTransferProductId && (
              <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Tồn kho khả dụng tại <strong className="text-neutral-900">{newTransferFrom}</strong>:
                </span>
                <span
                  className={`font-mono font-black ${
                    (branchStock?.[newTransferProductId]?.[newTransferFrom] || 0) > 0
                      ? 'text-emerald-700'
                      : 'text-rose-600'
                  }`}
                >
                  {branchStock?.[newTransferProductId]?.[newTransferFrom] || 0} sp
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                  Kích cỡ (Size)
                </label>
                <select
                  value={newTransferSize}
                  onChange={(e) => setNewTransferSize(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:border-blue-500"
                >
                  {['S', 'M', 'L', 'XL'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                  Màu sắc
                </label>
                <select
                  value={newTransferColor}
                  onChange={(e) => setNewTransferColor(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Chọn màu --</option>
                  {(() => {
                    const prod = productsList.find((p) => p.id === newTransferProductId);
                    const colors = Array.isArray(prod?.colors) ? prod.colors : [];
                    return colors.map((c: any) => {
                      const name = c?.name || c;
                      return (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      );
                    });
                  })()}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                  Chi nhánh xuất (Nguồn)
                </label>
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
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                  Chi nhánh nhập (Đích)
                </label>
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
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                Số lượng chuyển
              </label>
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
              {(['all', 'shipping', 'received', 'cancelled'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setTransferStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg transition-all capitalize ${
                    transferStatusFilter === st
                      ? 'bg-white text-neutral-900 shadow-xs font-black'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {st === 'all'
                    ? 'Tất cả'
                    : st === 'shipping'
                    ? 'Đang giao'
                    : st === 'received'
                    ? 'Đã nhận'
                    : 'Đã hủy'}
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
                  filteredTransfers.map((t) => {
                    const isDestination = t.toBranch === currentUser?.branch;
                    const isPending = t.status === 'shipping';
                    const isReceived = t.status === 'received';
                    const isCancelled = t.status === 'cancelled';
                    const canReceive =
                      isPending &&
                      (currentUser?.role === 'director' ||
                        currentUser?.role === 'manager' ||
                        currentUser?.role === 'accountant' ||
                        isDestination);
                    const canCancel =
                      isPending &&
                      (currentUser?.role === 'director' ||
                        currentUser?.role === 'manager' ||
                        t.fromBranch === currentUser?.branch);

                    return (
                      <tr key={t.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="p-3 font-bold text-neutral-900">
                          <div className="line-clamp-1">{t.productName}</div>
                          <div className="text-[10px] text-neutral-400 font-mono font-normal">#{t.id}</div>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-semibold text-neutral-700">{t.size}</span> /{' '}
                          <span className="text-neutral-500">{t.color}</span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-600">
                            <span>{(t.fromBranch || '').replace('Chi nhánh ', '')}</span>
                            <span className="text-neutral-400">➔</span>
                            <span className="text-blue-700 font-bold">
                              {(t.toBranch || '').replace('Chi nhánh ', '')}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center font-black font-mono whitespace-nowrap">{t.quantity} sp</td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              isPending
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                                : isReceived
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                            }`}
                          >
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
};
