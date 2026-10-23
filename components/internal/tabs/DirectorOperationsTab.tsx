'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Edit2, RefreshCw } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface DirectorOperationsTabProps {
  currentUser: any;
  subTab?: 'pricing' | 'audit' | 'payroll';
  productsList: any[];
  auditLogs: any[];
  fetchAuditLogs: () => Promise<void>;
  updateGlobalProductPrice: (productId: string, price: number) => void;
  updateGlobalProductDetails?: (productId: string, name: string, desc: string, cat: string) => void;
  deleteGlobalProduct: (productId: string) => void;
  salaryRequests?: any[];
  approveSalaryRequest?: (id: string, status: 'approved' | 'rejected', reviewNote?: string) => void;
  usersList?: any[];
  payrollRecords?: any[];
}

export default function DirectorOperationsTab({
  currentUser,
  subTab = 'pricing',
  productsList,
  auditLogs,
  fetchAuditLogs,
  updateGlobalProductPrice,
  updateGlobalProductDetails,
  deleteGlobalProduct,
  salaryRequests = [],
  approveSalaryRequest,
  usersList = [],
  payrollRecords = [],
}: DirectorOperationsTabProps) {
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCat, setEditCat] = useState('');

  if (subTab === 'audit') {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-neutral-900 tracking-tight uppercase">Nhật ký hoạt động hệ thống</h3>
            <p className="text-xs text-neutral-400 mt-1">Lịch sử ghi chép tất cả các hành động nhạy cảm hoặc thao tác dữ liệu cốt lõi trên ERP Novyn.Wear.</p>
          </div>
          <button
            onClick={fetchAuditLogs}
            className="px-4 py-2 bg-neutral-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-850 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tải lại nhật ký
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                  <th className="p-3">Mã Log</th>
                  <th className="p-3">Thời gian</th>
                  <th className="p-3">Người thực hiện</th>
                  <th className="p-3">Hành động</th>
                  <th className="p-3">Chi tiết nội dung</th>
                </tr>
              </thead>
              <tbody className="divide-y text-neutral-700 font-medium">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-neutral-400">
                      Không tìm thấy lịch sử hoạt động nào trong hệ thống.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-neutral-50/10">
                      <td className="p-3 font-mono font-bold text-neutral-900">{log.id}</td>
                      <td className="p-3 font-mono text-[10px] text-neutral-500">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-neutral-900 block">{log.performedByName || log.performedById || 'Hệ thống'}</span>
                        <span className="text-[9px] text-neutral-455 font-mono block uppercase">{log.performedById ? 'Nhân viên' : 'Hệ thống'}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          log.action === 'SALARY_ADJUST' || log.action === 'PAY_SALARY' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          log.action === 'PRICE_EDIT' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          log.action === 'PRODUCT_DELETE' || log.action === 'USER_DELETE' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          'bg-neutral-100 text-neutral-600 border border-neutral-200'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-neutral-600 font-sans max-w-md break-words">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (subTab === 'payroll') {
    return (
      <div>
        <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Quản lý Nhân sự & Bảng lương toàn công ty</h3>
        <p className="text-xs text-neutral-400 mb-8">Tra cứu danh sách nhân sự cấp cao, duyệt đề xuất tăng lương khẩn cấp và xem lịch sử giải ngân chi lương.</p>

        {/* DUYỆT TĂNG LƯƠNG */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm mb-8">
          <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-4">Các đề xuất tăng lương từ nhân viên chờ phê duyệt</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-3">Nhân viên</th>
                  <th className="p-3">Mức lương cũ</th>
                  <th className="p-3 font-mono">Đề xuất mới</th>
                  <th className="p-3">Lý do trình bày</th>
                  <th className="p-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                {salaryRequests
                  .filter((req: any) => req.status === 'pending')
                  .map((req: any) => (
                    <tr key={req.id} className="hover:bg-neutral-50/20 transition-colors">
                      <td className="p-3">
                        <span className="font-bold text-neutral-900 block">{req.name}</span>
                        <span className="text-[8px] text-neutral-405 uppercase font-mono">{req.branch}</span>
                      </td>
                      <td className="p-3 font-mono">{formatPrice(req.currentSalary)}</td>
                      <td className="p-3 font-mono font-black text-emerald-600">{formatPrice(req.proposedSalary)}</td>
                      <td className="p-3 text-neutral-600 italic font-medium">{req.reason}</td>
                      <td className="p-3 text-right flex justify-end gap-2 pt-4">
                        {approveSalaryRequest && (
                          <>
                            <button
                              onClick={() => approveSalaryRequest(req.id, 'approved', 'Ban giám đốc đồng ý phê duyệt tăng lương')}
                              className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              Duyệt nâng lương
                            </button>
                            <button
                              onClick={() => approveSalaryRequest(req.id, 'rejected', 'Không đồng ý đề xuất nâng lương lúc này')}
                              className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[9px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              Bác bỏ
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                {salaryRequests.filter((req: any) => req.status === 'pending').length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-neutral-400 italic">Hiện tại không có đề xuất tăng lương nào chờ duyệt.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
            <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-4">Danh sách nhân sự hệ thống</h4>
            <div className="overflow-x-auto max-h-[350px] pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                    <th className="p-3">Họ tên</th>
                    <th className="p-3">Lương gross</th>
                    <th className="p-3 text-right">Chi nhánh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                  {usersList
                    .filter((u: any) => u.role !== 'customer')
                    .map((u: any) => (
                      <tr key={u.id} className="hover:bg-neutral-50/20 transition-colors">
                        <td className="p-3">
                          <span className="font-bold text-neutral-900 block">{u.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[7px] font-black tracking-widest uppercase text-white shadow-sm ${
                            u.role === 'director' ? 'bg-rose-500' :
                            u.role === 'manager' ? 'bg-amber-500' :
                            u.role === 'accountant' ? 'bg-emerald-500' : 'bg-sky-500'
                          }`}>
                            {u.role === 'director' ? 'Giám đốc' :
                             u.role === 'manager' ? 'Quản lý' :
                             u.role === 'accountant' ? 'Kế toán' : 'Nhân viên'}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-neutral-850">{u.salary ? formatPrice(u.salary) : 'Thoả thuận'}</td>
                        <td className="p-3 text-right text-neutral-500 font-bold">{u.branch || 'Văn phòng chính'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
            <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-4">Lịch sử giải ngân lương tháng trước (Read-Only)</h4>
            <div className="overflow-x-auto max-h-[350px] pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                    <th className="p-3">Tháng lương</th>
                    <th className="p-3">Nhân sự</th>
                    <th className="p-3 font-mono">Thực nhận</th>
                    <th className="p-3 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                  {payrollRecords.map((pay: any) => (
                    <tr key={pay.id} className="hover:bg-neutral-50/20 transition-colors">
                      <td className="p-3 font-mono font-bold">{pay.month}</td>
                      <td className="p-3">{pay.name}</td>
                      <td className="p-3 font-mono font-black text-neutral-900">{formatPrice(pay.salary)}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                          pay.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 animate-pulse'
                        }`}>
                          {pay.status === 'paid' ? 'Đã chi trả' : 'Chờ giải quỹ'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {payrollRecords.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-neutral-400 italic">Chưa phát sinh giải ngân lương.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: pricing
  return (
    <div>
      <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Vận hành giá bán toàn cầu</h3>
      <p className="text-xs text-neutral-400 mb-8">Điều hành giá bán sản phẩm và sửa đổi thông tin chi tiết các mặt hàng trong hệ thống.</p>

      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
        <h4 className="text-xs font-black text-neutral-950 tracking-wide mb-4">Danh sách sản phẩm & Sửa giá bán</h4>
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
          {productsList.map((prod: any) => (
            <div key={prod.id} className="border border-neutral-150 p-4 rounded-2xl bg-neutral-50/40 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative w-12 aspect-[4/5] rounded-xl bg-neutral-100 border overflow-hidden shrink-0">
                  <Image
                    src={prod.images[0]}
                    alt={prod.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-black text-neutral-900 truncate">{prod.name}</h5>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 block mt-0.5">{prod.category}</span>
                  <span className="text-xs font-black text-neutral-900 mt-1 block">{formatPrice(prod.price)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {editingProductId === prod.id ? (
                  <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border shadow-sm">
                    <div>
                      <label className="text-[8px] font-bold text-neutral-400 uppercase">Tên sản phẩm</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 border text-xs font-bold rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-neutral-400 uppercase">Giá bán (₫)</label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="w-full px-2 py-1 border text-xs font-bold rounded"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          updateGlobalProductPrice(prod.id, editPrice);
                          if (updateGlobalProductDetails) {
                            updateGlobalProductDetails(prod.id, editName, editDesc, editCat);
                          }
                          setEditingProductId(null);
                        }}
                        className="bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded hover:bg-emerald-600 transition-colors"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditingProductId(null)}
                        className="bg-neutral-200 text-neutral-700 text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded hover:bg-neutral-300 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProductId(prod.id);
                        setEditPrice(prod.price);
                        setEditName(prod.name);
                        setEditDesc(prod.description);
                        setEditCat(prod.category);
                      }}
                      className="bg-neutral-950 text-white text-[9px] font-bold uppercase tracking-widest px-3.5 py-2 rounded-xl hover:bg-neutral-850 transition-colors flex items-center gap-1 active:scale-95 cursor-pointer shadow-sm shadow-neutral-950/10"
                    >
                      <Edit2 className="w-3 h-3" />
                      Sửa giá
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${prod.name} không?`)) {
                          deleteGlobalProduct(prod.id);
                        }
                      }}
                      className="bg-rose-50 text-rose-605 text-[9px] font-bold uppercase tracking-widest px-3.5 py-2 rounded-xl hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer active:scale-95"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
