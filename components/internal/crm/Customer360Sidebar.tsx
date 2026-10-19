'use client';

import React, { useState } from 'react';
import {
  User,
  Crown,
  Phone,
  Mail,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  Send,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { formatPrice } from '../../../lib/utils';

export interface Customer360Props {
  selectedCustomer: any | null;
  customerOrders?: any[];
  customerTickets?: any[];
  onInsertCannedReply?: (text: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CANNED_RESPONSES = [
  {
    code: '/freeship',
    label: 'Chính sách Freeship',
    text: 'Dạ, NOVYN hỗ trợ freeship toàn quốc cho mọi đơn hàng từ 500.000đ hoặc khách hàng hạng Gold/Diamond trở lên ạ! 🌸'
  },
  {
    code: '/sizechart',
    label: 'Tư vấn bảng size',
    text: 'Dạ, bảng size chuẩn của Novyn: Size S (45-52kg), M (53-58kg), L (59-65kg), XL (66-72kg). Bạn có thể cho em xin chiều cao cân nặng để tư vấn chuẩn nhất nha! ✨'
  },
  {
    code: '/doitra',
    label: 'Quy trình đổi trả',
    text: 'Dạ, NOVYN hỗ trợ đổi size/mẫu trong vòng 7 ngày tận nhà. Shipper sẽ mang mẫu mới đến đổi và thu hồi mẫu cũ đồng thời, hoàn toàn không phát sinh chi phí ạ! 🛍️'
  },
  {
    code: '/diachi',
    label: 'Địa chỉ Showroom',
    text: 'Dạ, showroom NOVYN mở cửa từ 9h00 - 22h00 hàng ngày tại:\n• Chi nhánh 1: 128 Lê Lợi, P. Bến Thành, Quận 1, TP.HCM\n• Chi nhánh 2: 45 Xuân Thủy, P. Thảo Điền, TP. Thủ Đức, TP.HCM.\nKính mời bạn ghé trải nghiệm trực tiếp ạ! 🏛️'
  }
];

export default function Customer360Sidebar({
  selectedCustomer,
  customerOrders = [],
  customerTickets = [],
  onInsertCannedReply,
  showToast
}: Customer360Props) {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'tickets' | 'canned'>('profile');

  if (!selectedCustomer) {
    return (
      <div className="bg-white border rounded-2xl p-6 shadow-xs text-center space-y-3">
        <User className="w-10 h-10 text-neutral-300 mx-auto stroke-1" />
        <h4 className="text-xs font-black uppercase tracking-wider text-neutral-700">
          Khách Hàng 360 (Customer 360)
        </h4>
        <p className="text-xs text-neutral-450 max-w-xs mx-auto">
          Chọn một cuộc hội thoại chat hoặc khách hàng trong danh sách để xem hồ sơ tích lũy chi tiêu, 3 đơn hàng gần nhất và lịch sử khiếu nại.
        </p>

        {/* Still show Quick Canned Responses */}
        <div className="pt-4 border-t text-left space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
            Mẫu câu trả lời nhanh (Canned Replies):
          </span>
          <div className="space-y-1.5">
            {CANNED_RESPONSES.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  if (onInsertCannedReply) onInsertCannedReply(c.text);
                  navigator.clipboard.writeText(c.text);
                  showToast(`✓ Đã sao chép câu trả lời [${c.code}]`, 'success');
                }}
                className="w-full text-left p-2 rounded-xl border border-neutral-150 hover:bg-neutral-50 transition-colors text-xs flex justify-between items-center group cursor-pointer"
              >
                <div>
                  <span className="font-mono font-bold text-indigo-600 block text-[11px]">{c.code}</span>
                  <span className="text-[10px] text-neutral-500">{c.label}</span>
                </div>
                <Copy className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Tier color styling
  const tierColor =
    selectedCustomer.tier === 'VVIP' || selectedCustomer.tier === 'Diamond'
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : selectedCustomer.tier === 'Platinum'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : selectedCustomer.tier === 'Gold'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-neutral-100 text-neutral-700 border-neutral-200';

  // Last 3 orders
  const recentOrders = customerOrders.slice(0, 3);

  return (
    <div className="bg-white border rounded-2xl shadow-xs overflow-hidden text-neutral-800 space-y-4">
      {/* Header Profile Badge */}
      <div className="p-4 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-sm">
              {selectedCustomer.name?.charAt(0) || 'K'}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{selectedCustomer.name}</h4>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border mt-0.5 ${tierColor}`}>
                {selectedCustomer.tier || 'Member'}
              </span>
            </div>
          </div>
          <Crown className="w-5 h-5 text-amber-400 fill-amber-400/20" />
        </div>

        {/* Quick Stats: Spent & Points */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
          <div>
            <span className="text-[9px] text-neutral-400 uppercase tracking-wider block">Tổng chi tiêu</span>
            <span className="font-mono font-bold text-emerald-400">
              {formatPrice(selectedCustomer.totalSpent || 0)}
            </span>
          </div>
          <div>
            <span className="text-[9px] text-neutral-400 uppercase tracking-wider block">Điểm thưởng</span>
            <span className="font-mono font-bold text-amber-300">
              {selectedCustomer.points || 0} pts
            </span>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="px-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-neutral-600">
          <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="font-mono">{selectedCustomer.phone || 'Chưa cập nhật SĐT'}</span>
        </div>
        {selectedCustomer.email && (
          <div className="flex items-center gap-2 text-neutral-600">
            <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="truncate">{selectedCustomer.email}</span>
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-t px-2 bg-neutral-50/50">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          3 Đơn gần nhất
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`py-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1 ${
            activeTab === 'tickets'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <span>Đổi trả / Khiếu nại</span>
          {customerTickets.length > 0 && (
            <span className="bg-rose-500 text-white font-mono text-[9px] px-1 rounded-full">
              {customerTickets.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('canned')}
          className={`py-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'canned'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Mẫu trả lời (/)
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="px-4 pb-4">
        {/* RECENT 3 ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-2.5">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-neutral-400 italic py-4 text-center">
                Khách chưa có đơn hàng nào gần đây.
              </p>
            ) : (
              recentOrders.map(order => (
                <div
                  key={order.id}
                  className="p-2.5 rounded-xl border border-neutral-150 hover:border-neutral-300 transition-all text-xs space-y-1.5 bg-neutral-50/30"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-neutral-900">{order.id}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'shipping'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status === 'delivered'
                        ? 'Đã giao'
                        : order.status === 'shipping'
                        ? 'Đang giao'
                        : 'Chờ xử lý'}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}</span>
                    <span className="font-mono font-bold text-neutral-800">{formatPrice(order.totalAmount || order.total || 0)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TICKETS & RETURNS */}
        {activeTab === 'tickets' && (
          <div className="space-y-2.5">
            {customerTickets.length === 0 ? (
              <p className="text-xs text-emerald-600 italic py-4 text-center flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Không có vé khiếu nại nào đang mở
              </p>
            ) : (
              customerTickets.map(t => (
                <div key={t.id} className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/40 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-rose-900">{t.title || 'Khiếu nại đổi size'}</span>
                    <span className="text-[9px] font-bold text-rose-700 font-mono">{t.status}</span>
                  </div>
                  <p className="text-[11px] text-neutral-600">{t.description || t.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* QUICK CANNED RESPONSES (/) */}
        {activeTab === 'canned' && (
          <div className="space-y-2">
            <p className="text-[10px] text-neutral-400">
              Bấm vào mẫu trả lời để sao chép hoặc chèn ngay vào ô chat CSKH:
            </p>
            {CANNED_RESPONSES.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  if (onInsertCannedReply) onInsertCannedReply(c.text);
                  navigator.clipboard.writeText(c.text);
                  showToast(`✓ Đã áp dụng câu trả lời: ${c.code}`, 'success');
                }}
                className="w-full text-left p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors text-xs space-y-0.5 group cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-indigo-600 text-xs">{c.code}</span>
                  <span className="text-[10px] font-bold text-neutral-500">{c.label}</span>
                </div>
                <p className="text-[10.5px] text-neutral-600 line-clamp-2 leading-relaxed">
                  {c.text}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
