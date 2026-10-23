'use client';

import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, MapPin, Search } from 'lucide-react';
import { createDamagedGoodAction } from '@/backend/actions/erpActions';

export interface DamagedGoodsSubsystemProps {
  currentUser: any;
  productsList: any[];
  damagedGoods: any[];
  setDamagedGoods: (v: any[]) => void;
  refreshInventoryStocks?: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DamagedGoodsSubsystem: React.FC<DamagedGoodsSubsystemProps> = ({
  currentUser,
  productsList,
  damagedGoods,
  setDamagedGoods,
  refreshInventoryStocks,
  showToast,
}) => {
  const [newDamageProductId, setNewDamageProductId] = useState('');
  const [newDamageSize, setNewDamageSize] = useState('M');
  const [newDamageColor, setNewDamageColor] = useState('');
  const [newDamageQty, setNewDamageQty] = useState(1);
  const [newDamageIssue, setNewDamageIssue] = useState('Rách vải / sứt chỉ may');
  const [damageSearchQuery, setDamageSearchQuery] = useState('');
  const [damageBranchFilter, setDamageBranchFilter] = useState('all');

  const currentBranchName = currentUser?.branch || 'Chi nhánh Quận 1';

  const handleLogDamage = async () => {
    if (!newDamageProductId || !newDamageColor) {
      showToast('Vui lòng chọn đầy đủ sản phẩm và màu sắc!', 'error');
      return;
    }

    const matched = productsList.find((p) => p.id === newDamageProductId);
    if (!matched) return;

    try {
      const res = await createDamagedGoodAction({
        productId: newDamageProductId,
        productName: matched.name,
        size: newDamageSize,
        color: newDamageColor,
        branch: currentBranchName,
        quantity: newDamageQty,
        issue: newDamageIssue,
      });

      if (!res.success || !res.data) {
        showToast(res.error || 'Lỗi khi ghi nhận hàng lỗi!', 'error');
        return;
      }

      const updated = [res.data, ...damagedGoods.filter((d) => d.id !== res.data.id)];
      setDamagedGoods(updated);
      localStorage.setItem('novyn_damaged_goods', JSON.stringify(updated));

      if (refreshInventoryStocks) {
        await refreshInventoryStocks();
      }

      setNewDamageQty(1);
      showToast(`✓ Đã ghi nhận biên bản hàng lỗi và khấu trừ ${newDamageQty} sp tại ${currentBranchName}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi ghi nhận hàng lỗi', 'error');
    }
  };

  const totalDamagedQty = damagedGoods.reduce((sum, d) => sum + (d.quantity || 0), 0);
  const currentBranchDamagedQty = damagedGoods
    .filter((d) => d.branch === currentBranchName)
    .reduce((sum, d) => sum + (d.quantity || 0), 0);

  const filteredDamagedGoods = damagedGoods.filter((d) => {
    const matchBranch = damageBranchFilter === 'all' || d.branch === damageBranchFilter;
    const query = damageSearchQuery.toLowerCase();
    const matchQuery =
      !query ||
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
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Tổng số biên bản lập
          </span>
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
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Hệ thống sẽ lập tức trừ tồn kho khả dụng tương ứng tại chi nhánh.
            </p>
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
                  const p = productsList.find((item) => item.id === e.target.value);
                  if (p && Array.isArray(p.colors) && p.colors.length > 0) {
                    setNewDamageColor(p.colors[0]?.name || p.colors[0] || 'Oatmeal');
                  }
                }}
                className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:border-rose-400 font-medium"
              >
                <option value="">-- Chọn sản phẩm --</option>
                {productsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                  Kích cỡ (Size)
                </label>
                <select
                  value={newDamageSize}
                  onChange={(e) => setNewDamageSize(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:border-rose-400"
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
                  value={newDamageColor}
                  onChange={(e) => setNewDamageColor(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:border-rose-400"
                >
                  <option value="">-- Chọn màu --</option>
                  {(() => {
                    const prod = productsList.find((p) => p.id === newDamageProductId);
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
                  Chi nhánh phát hiện
                </label>
                <input
                  type="text"
                  disabled
                  value={currentBranchName}
                  className="w-full p-2.5 border rounded-xl bg-neutral-100 text-neutral-600 font-medium cursor-not-allowed text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                  Số lượng lỗi
                </label>
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
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                Tình trạng lỗi chi tiết
              </label>
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
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Các mặt hàng đã được ghi nhận xuất hủy và trừ kho khả dụng.
              </p>
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
                  filteredDamagedGoods.map((d) => (
                    <tr key={d.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="p-3 font-bold text-neutral-900">
                        <div className="line-clamp-1">{d.productName}</div>
                        <div className="text-[10px] text-neutral-400 font-mono font-normal">#{d.id}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-semibold text-neutral-700">{d.size}</span> /{' '}
                        <span className="text-neutral-500">{d.color}</span>
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
                        {d.createdAt
                          ? typeof d.createdAt === 'object' && 'toISOString' in d.createdAt
                            ? (d.createdAt as Date).toLocaleDateString('vi-VN')
                            : String(d.createdAt).split('T')[0]
                          : '—'}
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
};
