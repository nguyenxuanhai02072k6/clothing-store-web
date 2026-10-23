'use client';

import React from 'react';
import { formatPrice } from '../../lib/utils';

interface AccountOrderHistoryTabProps {
  customerOrders: any[];
  trackingOrderId: string | null;
  setTrackingOrderId: (id: string | null) => void;
}

export default function AccountOrderHistoryTab({
  customerOrders,
  trackingOrderId,
  setTrackingOrderId
}: AccountOrderHistoryTabProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Đang xử lý';
      case 'shipping': return 'Đang giao hàng';
      case 'completed': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getTimelineSteps = (order: any) => {
    if (!order) return [];
    const status = order.status;
    const time = order.createdAt;

    if (status === 'cancelled') {
      return [
        { title: 'Đặt hàng thành công', desc: 'Đơn hàng đã được ghi nhận trên hệ thống Novyn Wear.', time, status: 'completed' },
        { title: 'Yêu cầu hủy đơn hàng', desc: 'Khách hàng hoặc quản trị viên đã gửi yêu cầu hủy đơn.', time: 'Vừa xong', status: 'completed' },
        { title: 'Hủy đơn hoàn tất', desc: 'Hệ thống đã hoàn trả tồn kho sản phẩm và giao dịch bị hủy.', time: 'Vừa xong', status: 'active' }
      ];
    }

    return [
      { title: 'Đặt hàng thành công', desc: 'Đơn hàng đã được ghi nhận trên hệ thống Novyn Wear.', time, status: 'completed' },
      { title: 'Xác nhận & Chuẩn bị hàng', desc: 'Nhân viên cửa hàng đã xác nhận và đang đóng gói sản phẩm.', time: status !== 'pending' ? 'Đã xác nhận' : 'Đang xử lý', status: status !== 'pending' ? 'completed' : 'active' },
      { title: 'Đã giao cho GHN', desc: 'Đơn hàng đã được bàn giao cho đối tác vận chuyển Giao Hàng Nhanh.', time: status !== 'pending' ? 'Đã bàn giao' : '--/--/----', status: status !== 'pending' ? 'completed' : 'pending' },
      { title: 'Đang vận chuyển liên tỉnh', desc: 'Hàng đang trung chuyển tại bưu cục TP. Hồ Chí Minh.', time: status === 'completed' ? 'Đã trung chuyển' : status === 'shipping' ? 'Đang vận chuyển' : '--/--/----', status: status === 'completed' ? 'completed' : status === 'shipping' ? 'active' : 'pending' },
      { title: 'Shipper đang giao hàng', desc: 'Đơn hàng đang được shipper đi giao tới địa chỉ của bạn.', time: status === 'completed' ? 'Đã giao' : status === 'shipping' ? 'Đang giao' : '--/--/----', status: status === 'completed' ? 'completed' : status === 'shipping' ? 'active' : 'pending' },
      { title: 'Giao hàng thành công', desc: 'Đã nhận hàng và ký tên xác nhận.', time: status === 'completed' ? 'Hoàn tất' : '--/--/----', status: status === 'completed' ? 'completed' : 'pending' },
    ];
  };

  if (trackingOrderId) {
    const matchedOrder = customerOrders.find(o => o.id === trackingOrderId);

    return (
      <div>
        {/* Tracking Detail Panel */}
        <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-6 text-left">
          <div>
            <button
              type="button"
              onClick={() => setTrackingOrderId(null)}
              className="text-[9px] font-bold uppercase tracking-widest text-brand-muted hover:text-brand-text transition-colors flex items-center gap-1 cursor-pointer"
            >
              ← Quay lại danh sách
            </button>
            <h4 className="text-lg font-bold text-brand-text uppercase tracking-tight mt-1.5 font-mono">
              Theo dõi vận đơn: {trackingOrderId}
            </h4>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-neutral-100 text-brand-text border border-brand-border px-3 py-1.5 rounded-full font-mono shrink-0">
            Mã vận đơn: GHN-{trackingOrderId.split('-')[1] || '58190'}
          </span>
        </div>

        {/* Timeline steps */}
        <div className="bg-neutral-50/40 border border-brand-border p-6 rounded-2xl relative overflow-hidden flex flex-col gap-8 max-w-xl mx-auto">
          {!matchedOrder ? (
            <p className="text-xs text-brand-muted text-center">Không tìm thấy thông tin đơn hàng này.</p>
          ) : (
            getTimelineSteps(matchedOrder).map((step, idx, arr) => {
              const isLast = idx === arr.length - 1;
              return (
                <div key={idx} className="flex gap-4 relative text-left">
                  {/* Left line segment connecting nodes */}
                  {!isLast && (
                    <div
                      className={`absolute left-2.5 top-5 bottom-[-24px] w-[1.5px] ${
                        step.status === 'completed' ? 'bg-brand-text' : 'bg-neutral-200'
                      }`}
                    />
                  )}

                  {/* Node dot */}
                  <div
                    className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center shrink-0 z-10 ${
                      step.status === 'completed'
                        ? 'bg-brand-text border-brand-text text-white'
                        : step.status === 'active'
                        ? 'bg-amber-500 border-amber-500 text-white animate-pulse'
                        : 'bg-white border-neutral-300 text-neutral-400'
                    }`}
                  >
                    <span className="text-[9px] font-bold">✓</span>
                  </div>

                  {/* Content description */}
                  <div className="text-left py-0.5">
                    <h5
                      className={`text-xs font-bold uppercase tracking-wider ${
                        step.status === 'completed'
                          ? 'text-brand-text'
                          : step.status === 'active'
                          ? 'text-amber-600'
                          : 'text-neutral-400'
                      }`}
                    >
                      {step.title}
                    </h5>
                    <p className="text-xs text-brand-muted font-light mt-1">{step.desc}</p>
                    <span className="text-[9px] text-brand-muted block mt-1 font-mono">{step.time}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-normal text-brand-text tracking-widest mb-6 uppercase pb-3 border-b border-brand-border">
        Lịch sử mua hàng
      </h3>

      <div className="space-y-4">
        {customerOrders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-brand-border rounded-xl">
            <p className="text-xs text-brand-muted font-normal">Bạn chưa có đơn hàng nào.</p>
          </div>
        ) : (
          customerOrders.map((ord: any) => {
            const itemsSummary = ord.items
              .map((it: any) => `${it.productName} (Màu: ${it.selectedColor.name} | Size: ${it.selectedSize}) x ${it.quantity}`)
              .join(', ');
            return (
              <div
                key={ord.id}
                className="bg-neutral-50/40 hover:bg-white border border-brand-border p-5 rounded-xl transition-all shadow-sm text-left"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-brand-border mb-3 gap-2">
                  <div>
                    <span className="text-[8px] font-bold text-brand-muted block tracking-widest">MÃ ĐƠN HÀNG</span>
                    <h4 className="text-xs font-bold text-brand-text font-mono uppercase">{ord.id}</h4>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[8px] font-bold text-brand-muted block tracking-widest">NGÀY MUA</span>
                    <p className="text-xs text-brand-text font-bold">{ord.createdAt}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[8px] font-bold text-brand-muted block tracking-widest mb-0.5">TRẠNG THÁI</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                        ord.status === 'pending' || ord.status === 'shipping'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : ord.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {getStatusLabel(ord.status)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-brand-muted font-light mb-3">Sản phẩm: {itemsSummary}</p>
                <div className="flex justify-between items-center pt-3 border-t border-brand-border">
                  <button
                    type="button"
                    onClick={() => setTrackingOrderId(ord.id)}
                    className="text-[9px] font-bold text-brand-accent uppercase tracking-widest hover:underline cursor-pointer"
                  >
                    📍 Theo dõi vận đơn
                  </button>
                  <span className="text-xs font-bold text-brand-text">{formatPrice(ord.total)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
