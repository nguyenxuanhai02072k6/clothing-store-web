'use client';

import React, { useState } from 'react';
import { formatPrice } from '@/lib/utils';

export interface RestockOperationsTabProps {
  currentUser: any;
  productsList: any[];
  branchStock: any;
  branchSizeStock: any;
  restockRecords: any[];
  restockBranchProduct: (productId: string, amount: number, size: string, branch: string) => void;
  approveRestockRequest?: (id: string) => Promise<any>;
  rejectRestockRequest?: (id: string) => Promise<any>;
  submitDailyReport?: (title: string, content: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function RestockOperationsTab({
  currentUser,
  productsList,
  branchStock,
  branchSizeStock,
  restockRecords,
  restockBranchProduct,
  approveRestockRequest,
  rejectRestockRequest,
  submitDailyReport,
  showToast,
}: RestockOperationsTabProps) {
  const [selectedRestockBranch, setSelectedRestockBranch] = useState(currentUser.branch || 'Chi nhánh Quận 1');
  const [selectedRestockProduct, setSelectedRestockProduct] = useState('');
  const [selectedRestockSize, setSelectedRestockSize] = useState('S');
  const [restockAmount, setRestockAmount] = useState(10);
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');

  const isDirectorOrAccountant = ['director', 'accountant'].includes(currentUser.role);

  return (
    <div>
      <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Kiểm kho & Báo cáo vận hành</h3>
      <p className="text-xs text-neutral-400 mb-8">Điều phối kho hàng khẩn cấp chi tiết theo kích cỡ, duyệt yêu cầu restock từ các quản lý chi nhánh, và gửi báo cáo cuối ca.</p>

      {/* RESTOCK FORM */}
      <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 mb-8">
        <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4">Giải ngân nhập kho sản phẩm khẩn cấp</h4>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedRestockProduct && restockAmount > 0 && selectedRestockBranch) {
              restockBranchProduct(selectedRestockProduct, restockAmount, selectedRestockSize, selectedRestockBranch);
              setSelectedRestockProduct('');
              setRestockAmount(10);
              setSelectedRestockSize('S');
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end"
        >
          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Chọn chi nhánh</label>
            <select
              required
              value={selectedRestockBranch}
              onChange={(e) => setSelectedRestockBranch(e.target.value)}
              className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
            >
              <option value="">-- Chọn chi nhánh --</option>
              <option value="Chi nhánh Quận 1">Chi nhánh Quận 1</option>
              <option value="Chi nhánh Thảo Điền">Chi nhánh Thảo Điền</option>
            </select>
          </div>
          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Chọn sản phẩm</label>
            <select
              required
              value={selectedRestockProduct}
              onChange={(e) => {
                setSelectedRestockProduct(e.target.value);
                const prod = productsList.find((p: any) => p.id === e.target.value);
                if (prod && prod.sizes && prod.sizes.length > 0) {
                  setSelectedRestockSize(prod.sizes[0]);
                } else {
                  setSelectedRestockSize('S');
                }
              }}
              className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
            >
              <option value="">-- Chọn sản phẩm --</option>
              {productsList.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Chọn Size cụ thể</label>
            <select
              required
              value={selectedRestockSize}
              disabled={!selectedRestockProduct}
              onChange={(e) => setSelectedRestockSize(e.target.value)}
              className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold disabled:opacity-50"
            >
              {(() => {
                const prod = productsList.find((p: any) => p.id === selectedRestockProduct);
                const sizes = prod && prod.sizes && prod.sizes.length > 0 ? prod.sizes : ['S', 'M', 'L', 'XL'];
                return sizes.map((sz: string) => (
                  <option key={sz} value={sz}>Size {sz}</option>
                ));
              })()}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Số lượng giải ngân</label>
            <input
              type="number"
              min={1}
              required
              value={restockAmount}
              onChange={(e) => setRestockAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-850 active:scale-95 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            Gửi đề xuất nhập kho
          </button>
        </form>
      </div>

      {/* COMPARISON TABLE */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm mb-8 animate-fade-in">
        <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide mb-4">Chi tiết so sánh tồn kho các chi nhánh</h4>
        <div className="overflow-x-auto max-h-[450px] pr-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                <th className="p-3">Sản phẩm</th>
                <th className="p-3">Mã SKU</th>
                <th className="p-3 text-center">Tồn kho Q.1 (Size)</th>
                <th className="p-3 text-center">Tồn kho Thảo Điền (Size)</th>
                <th className="p-3 text-center">Tình trạng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
              {productsList.map((p: any) => {
                const q1Stock = branchStock?.[p.id]?.['Chi nhánh Quận 1'] || 0;
                const tdStock = branchStock?.[p.id]?.['Chi nhánh Thảo Điền'] || 0;
                const q1Sizes = branchSizeStock?.[p.id]?.['Chi nhánh Quận 1'] || {};
                const tdSizes = branchSizeStock?.[p.id]?.['Chi nhánh Thảo Điền'] || {};
                const sizes = p.sizes && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL'];
                const isLow = q1Stock < 5 || tdStock < 5;
                return (
                  <tr key={p.id} className="hover:bg-neutral-50/20 transition-colors">
                    <td className="p-3 font-bold text-neutral-900">{p.name}</td>
                    <td className="p-3 font-mono text-[10px] text-neutral-450">{p.id}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${q1Stock < 5 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-neutral-50 text-neutral-600'}`}>{q1Stock} chiếc</span>
                      <div className="flex gap-1 justify-center mt-1.5 flex-wrap max-w-[150px] mx-auto">
                        {sizes.map((sz: string) => {
                          const qty = q1Sizes[sz] || 0;
                          return (
                            <span key={sz} className={`px-1 py-0.5 rounded text-[8px] font-mono font-bold ${qty < 2 ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-neutral-100 text-neutral-600'}`}>
                              {sz}:{qty}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${tdStock < 5 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-neutral-50 text-neutral-600'}`}>{tdStock} chiếc</span>
                      <div className="flex gap-1 justify-center mt-1.5 flex-wrap max-w-[150px] mx-auto">
                        {sizes.map((sz: string) => {
                          const qty = tdSizes[sz] || 0;
                          return (
                            <span key={sz} className={`px-1 py-0.5 rounded text-[8px] font-mono font-bold ${qty < 2 ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-neutral-100 text-neutral-600'}`}>
                              {sz}:{qty}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        isLow ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-650'
                      }`}>
                        {isLow ? 'Nhập gấp' : 'Ổn định'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESTOCK RECORD HISTORY */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm mb-8">
        <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide mb-4">Lịch sử Yêu cầu Nhập kho</h4>
        <div className="overflow-x-auto max-h-[300px] pr-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                <th className="p-3">Chi nhánh</th>
                <th className="p-3">Sản phẩm</th>
                <th className="p-3 text-center">Số lượng</th>
                <th className="p-3 text-right">Chi phí</th>
                <th className="p-3 text-center">Ngày tạo</th>
                <th className="p-3 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
              {restockRecords.map((r: any) => (
                <tr key={r.id} className="hover:bg-neutral-50/20 transition-colors">
                  <td className="p-3 font-bold text-neutral-900">{r.branch}</td>
                  <td className="p-3 font-bold">{r.productName}</td>
                  <td className="p-3 text-center font-mono">{r.amount} chiếc</td>
                  <td className="p-3 text-right font-mono text-neutral-950">{formatPrice(r.cost)}</td>
                  <td className="p-3 text-center text-neutral-400 text-[10px] font-mono">{r.createdAt}</td>
                  <td className="p-3 text-right">
                    {r.status !== 'approved' && r.status !== 'rejected' && isDirectorOrAccountant && approveRestockRequest && rejectRestockRequest ? (
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={async () => {
                            try {
                              await approveRestockRequest(r.id);
                              showToast('✓ Đã phê duyệt yêu cầu nhập kho!', 'success');
                            } catch (err) {
                              showToast('Lỗi khi phê duyệt yêu cầu', 'error');
                            }
                          }}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await rejectRestockRequest(r.id);
                              showToast('✗ Đã từ chối yêu cầu nhập kho', 'info');
                            } catch (err) {
                              showToast('Lỗi khi từ chối yêu cầu', 'error');
                            }
                          }}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                        r.status === 'approved' ? 'bg-emerald-50 text-emerald-650 border-emerald-100' :
                        r.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                      }`}>
                        {r.status === 'approved' ? 'Đã duyệt' : r.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DAILY REPORT SENDER FOR ACCOUNTANT */}
      {submitDailyReport && (
        <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100">
          <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide mb-4">Gửi báo cáo thu chi / vận hành ngày hôm nay</h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (reportTitle && reportContent) {
                submitDailyReport(reportTitle, reportContent);
                setReportTitle('');
                setReportContent('');
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-450 block mb-1">Tiêu đề báo cáo</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Báo cáo dòng tiền mặt và giải ngân nhập hàng 29/05"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400 bg-white font-semibold"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-455 block mb-1">Nội dung báo cáo chi tiết</label>
              <textarea
                required
                placeholder="Liệt kê tình hình tài quỹ, đối chiếu công nợ chi nhánh..."
                rows={4}
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400 bg-white resize-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-850 active:scale-95 text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Gửi báo cáo tới Giám đốc
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
