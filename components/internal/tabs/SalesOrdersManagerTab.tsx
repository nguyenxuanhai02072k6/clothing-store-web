'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  ShoppingBag, 
  Search, 
  X, 
  Phone, 
  Copy, 
  Clock, 
  Box, 
  CheckCircle2, 
  AlertCircle, 
  User as UserIcon, 
  Mail, 
  Briefcase, 
  DollarSign, 
  Download 
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface SalesOrdersManagerTabProps {
  allOrders: any[];
  updateOrderStatus: (orderId: string, status: 'pending' | 'shipping' | 'completed' | 'cancelled') => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function SalesOrdersManagerTab({
  allOrders,
  updateOrderStatus,
  showToast,
}: SalesOrdersManagerTabProps) {
  const [orderSearch, setOrderSearch] = useState('');
  const [orderBranchFilter, setOrderBranchFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);

  const search = orderSearch.trim().toLowerCase();
  const searchDigits = search.replace(/\D/g, '');
  const isPhoneSearching = searchDigits.length >= 3;

  const filteredOrders = allOrders.filter((order: any) => {
    if (orderBranchFilter !== 'all' && order.branch !== orderBranchFilter) {
      return false;
    }

    if (orderStatusFilter !== 'all' && order.status !== orderStatusFilter) {
      return false;
    }

    if (!search) return true;

    // 1. Phone matching
    const rawPhone = String(order.customerInfo?.phone || order.phone || order.customerPhone || '');
    const orderDigits = rawPhone.replace(/\D/g, '');
    let matchPhone = false;

    if (searchDigits.length >= 3) {
      if (orderDigits.includes(searchDigits)) matchPhone = true;
      const searchNoZero = searchDigits.replace(/^0+/, '');
      const orderNoZero = orderDigits.replace(/^(84|0)+/, '');
      if (searchNoZero.length >= 3 && orderNoZero.includes(searchNoZero)) matchPhone = true;
    } else if (rawPhone.toLowerCase().includes(search)) {
      matchPhone = true;
    }

    // 2. Order ID match
    const matchId = String(order.id || '').toLowerCase().includes(search);

    // 3. Customer Full Name match
    const customerName = String(order.customerInfo?.fullName || order.customerName || '').toLowerCase();
    const matchName = customerName.includes(search);

    // 4. Transaction ID or payment reference match
    const transId = String(order.transactionId || order.paymentRef || order.paymentId || '').toLowerCase();
    const matchTransaction = transId.includes(search);

    // 5. Payment method, address, or email match
    const matchPayment = String(order.paymentMethod || '').toLowerCase().includes(search);
    const matchEmail = String(order.customerInfo?.email || '').toLowerCase().includes(search);
    const matchAddress = String(order.customerInfo?.address || '').toLowerCase().includes(search);

    return matchPhone || matchId || matchName || matchTransaction || matchPayment || matchEmail || matchAddress;
  });

  const selectedOrder = viewingOrderId ? allOrders.find((o: any) => o.id === viewingOrderId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-black text-neutral-950 tracking-tight uppercase flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            Quản lý Đơn hàng & Giao dịch
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Tra cứu siêu tốc theo Số điện thoại khách hàng (SĐT), mã đơn (#ORD-...) hoặc mã giao dịch toàn hệ thống.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-bold shadow-2xs">
            Tổng: <strong className="text-neutral-950">{allOrders.length}</strong> đơn
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold shadow-2xs">
            Kết quả: <strong className="text-indigo-950">{filteredOrders.length}</strong> đơn
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-3xl border border-neutral-150 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Input with Phone Focus */}
          <div className="md:col-span-6 relative">
            <input
              type="text"
              placeholder="Nhập SĐT khách hàng (090...), mã đơn (#ORD...), mã GD hoặc tên..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-indigo-500 bg-[#FAF7F2] focus:bg-white font-semibold text-neutral-900 transition-all"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {orderSearch && (
              <button
                type="button"
                onClick={() => setOrderSearch('')}
                className="w-6 h-6 rounded-full hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Branch Filter */}
          <div className="md:col-span-3">
            <select
              value={orderBranchFilter}
              onChange={(e) => setOrderBranchFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold bg-[#FAF7F2] focus:bg-white text-neutral-800 outline-none"
            >
              <option value="all">🏢 Tất cả chi nhánh</option>
              <option value="Chi nhánh Quận 1">📍 Chi nhánh Quận 1</option>
              <option value="Chi nhánh Thảo Điền">📍 Chi nhánh Thảo Điền</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold bg-[#FAF7F2] focus:bg-white text-neutral-800 outline-none"
            >
              <option value="all">⚡ Tất cả trạng thái</option>
              <option value="pending">⏳ Chờ xử lý</option>
              <option value="shipping">🚚 Đang giao hàng</option>
              <option value="completed">✅ Đã hoàn thành</option>
              <option value="cancelled">🛑 Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Phone Search Indicator Badge */}
        {isPhoneSearching && (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>
                Đang lọc giao dịch theo Số Điện Thoại: <strong className="font-mono text-emerald-950 underline">{orderSearch}</strong>
              </span>
            </div>
            <span className="text-[11px] font-mono font-black text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
              Khớp {filteredOrders.length} đơn
            </span>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                <th className="p-3">Mã đơn</th>
                <th className="p-3">Khách hàng & SĐT</th>
                <th className="p-3">Chi nhánh</th>
                <th className="p-3 font-mono">Tổng tiền</th>
                <th className="p-3">Thanh toán</th>
                <th className="p-3">Ngày đặt</th>
                <th className="p-3 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
              {filteredOrders.map((order: any) => {
                const customerPhone = order.customerInfo?.phone || order.phone || order.customerPhone || '';
                const customerName = order.customerInfo?.fullName || order.customerName || 'Khách vãng lai';

                return (
                  <tr key={order.id} className="hover:bg-neutral-50/40 transition-colors">
                    <td className="p-3">
                      <button
                        onClick={() => setViewingOrderId(order.id)}
                        className="text-indigo-650 hover:text-indigo-850 hover:underline font-mono font-black transition-all cursor-pointer text-xs"
                        title="Click để xem chi tiết đơn hàng"
                      >
                        {order.id}
                      </button>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-neutral-900 block">{customerName}</span>
                      {customerPhone ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <a
                            href={`tel:${customerPhone}`}
                            className="text-[10px] text-emerald-700 font-bold hover:underline flex items-center gap-1 font-mono"
                            title="Bấm để gọi điện"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {customerPhone}
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(customerPhone);
                              showToast(`✓ Đã sao chép SĐT: ${customerPhone}`, 'info');
                            }}
                            className="p-0.5 text-neutral-400 hover:text-neutral-700 rounded transition-colors cursor-pointer"
                            title="Sao chép số điện thoại"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] text-neutral-400 italic">Không có SĐT</span>
                      )}
                    </td>
                    <td className="p-3 text-[11px] text-neutral-600">{order.branch}</td>
                    <td className="p-3 font-mono font-black text-neutral-900">{formatPrice(order.total)}</td>
                    <td className="p-3">
                      <span className="capitalize font-bold text-neutral-700 block text-[11px]">{order.paymentMethod}</span>
                      {order.transactionId && (
                        <span className="text-[8px] font-mono text-neutral-400 block truncate max-w-[120px]" title={order.transactionId}>
                          TXN: {order.transactionId}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-[10px] text-neutral-450">{order.createdAt}</td>
                    <td className="p-3 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                        className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border outline-none bg-white cursor-pointer ${
                          order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          order.status === 'shipping' ? 'bg-sky-50 text-sky-600 border-sky-200' :
                          order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse' :
                          'bg-rose-50 text-rose-600 border-rose-200'
                        }`}
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="shipping">Đang giao</option>
                        <option value="completed">Đã hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-400 italic">
                    {orderSearch ? (
                      <div className="space-y-1">
                        <p className="font-bold text-neutral-700 text-xs">Không tìm thấy đơn hàng hoặc giao dịch nào phù hợp.</p>
                        <p className="text-[11px] text-neutral-400">Thử tìm kiếm với số điện thoại khác hoặc xóa bộ lọc.</p>
                      </div>
                    ) : (
                      "Chưa có giao dịch nào phát sinh."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ORDER DETAIL MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white/95 border border-neutral-100 max-w-4xl w-full rounded-[2rem] p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setViewingOrderId(null)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center cursor-pointer transition-all active:scale-90"
              title="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-indigo-100">Chi tiết đơn hàng</span>
                  <span className="text-[11px] text-neutral-400 font-semibold">{selectedOrder.createdAt}</span>
                </div>
                <h3 className="text-xl font-black text-neutral-900 tracking-tight font-mono">{selectedOrder.id}</h3>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-500 font-bold">Trạng thái:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border outline-none bg-white cursor-pointer transition-all ${
                    selectedOrder.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm shadow-emerald-50' :
                    selectedOrder.status === 'shipping' ? 'bg-sky-50 text-sky-600 border-sky-200 shadow-sm shadow-sky-50' :
                    selectedOrder.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-50 animate-pulse' :
                    'bg-rose-50 text-rose-600 border-rose-200 shadow-sm shadow-rose-50'
                  }`}
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="shipping">Đang giao</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>

            {/* Dynamic Timeline Tracker */}
            <div className="bg-neutral-50/50 border border-neutral-100 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
              {[
                { key: 'pending', label: 'Chờ xử lý', desc: 'Đơn hàng mới tạo', icon: Clock, color: 'text-amber-500 bg-amber-50 border-amber-200' },
                { key: 'shipping', label: 'Đang giao', desc: 'Đã bàn giao vận chuyển', icon: Box, color: 'text-sky-500 bg-sky-50 border-sky-200' },
                { key: 'completed', label: 'Hoàn thành', desc: 'Giao hàng thành công', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' }
              ].map((step, idx) => {
                const isCompleted = selectedOrder.status === 'completed';
                const isShipping = selectedOrder.status === 'shipping';
                const isPending = selectedOrder.status === 'pending';
                const isCancelled = selectedOrder.status === 'cancelled';
                
                let isActive = false;
                let isPassed = false;
                
                if (isCancelled) {
                  // Cancelled
                } else if (step.key === 'pending') {
                  isActive = isPending;
                  isPassed = isShipping || isCompleted;
                } else if (step.key === 'shipping') {
                  isActive = isShipping;
                  isPassed = isCompleted;
                } else if (step.key === 'completed') {
                  isActive = isCompleted;
                  isPassed = isCompleted;
                }

                const StepIcon = step.icon;

                return (
                  <React.Fragment key={step.key}>
                    {idx > 0 && (
                      <div className={`hidden md:block flex-1 h-0.5 rounded-full ${isPassed ? 'bg-indigo-500' : 'bg-neutral-200'}`} />
                    )}
                    <div className="flex items-center gap-3 flex-1 md:flex-none">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                        isCancelled ? 'bg-rose-50 text-rose-500 border-rose-200' :
                        isPassed || isActive ? step.color : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                      }`}>
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`text-xs font-black tracking-tight ${isCancelled ? 'text-rose-600' : isPassed || isActive ? 'text-neutral-900' : 'text-neutral-400'}`}>
                          {isCancelled && step.key === selectedOrder.status ? 'Đơn đã hủy' : step.label}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-semibold">{step.desc}</p>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              {selectedOrder.status === 'cancelled' && (
                <div className="flex items-center gap-3 bg-rose-50 text-rose-700 px-4 py-2.5 rounded-2xl border border-rose-100 w-full md:w-auto">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider">Đơn hàng đã hủy</p>
                    <p className="text-[10px] text-rose-600/80 font-bold">Giao dịch bị hoàn trả hoặc hủy bởi khách hàng/CSKH.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Main Columns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Customer & Transaction Info */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-neutral-50/30 border border-neutral-100 rounded-[2rem] p-6 flex flex-col gap-4">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2 mb-1">
                    <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                    Thông tin khách hàng
                  </h4>
                  <div className="space-y-3.5">
                    <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Họ & Tên</p>
                      <p className="text-xs font-extrabold text-neutral-900">{selectedOrder.customerInfo?.fullName || 'Khách vãng lai'}</p>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Số điện thoại</p>
                        {selectedOrder.customerInfo?.phone ? (
                          <a href={`tel:${selectedOrder.customerInfo.phone}`} className="text-xs font-bold text-indigo-650 hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {selectedOrder.customerInfo.phone}
                          </a>
                        ) : (
                          <span className="text-xs font-bold text-neutral-500">N/A</span>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Email</p>
                        {selectedOrder.customerInfo?.email ? (
                          <a href={`mailto:${selectedOrder.customerInfo.email}`} className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-neutral-400" />
                            {selectedOrder.customerInfo.email}
                          </a>
                        ) : (
                          <span className="text-xs font-bold text-neutral-500">N/A</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Địa chỉ giao hàng</p>
                      <p className="text-xs font-semibold text-neutral-700 leading-relaxed bg-white p-3 rounded-2xl border border-neutral-50">
                        {selectedOrder.customerInfo?.address || 'Mua tại quầy'}
                      </p>
                    </div>
                    {selectedOrder.customerInfo?.notes && (
                      <div>
                        <p className="text-[10px] text-rose-455 font-bold uppercase tracking-wider">Ghi chú từ khách hàng</p>
                        <p className="text-xs italic text-rose-600 bg-rose-50/30 p-3 rounded-2xl border border-rose-100/50 leading-relaxed font-semibold">
                          &ldquo;{selectedOrder.customerInfo.notes}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-neutral-50/30 border border-neutral-100 rounded-[2rem] p-6 flex flex-col gap-4">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2 mb-1">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                    Vận chuyển & Chi nhánh
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Chi nhánh xử lý</p>
                      <p className="text-xs font-bold text-neutral-800">{selectedOrder.branch}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Hình thức thanh toán</p>
                      <p className="text-xs font-black uppercase text-neutral-700 font-mono tracking-tight bg-white px-2.5 py-1 rounded-xl border border-neutral-100 inline-block mt-0.5">
                        {selectedOrder.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Ordered Items and Receipt Details */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="bg-neutral-50/30 border border-neutral-100 rounded-[2rem] p-6 flex flex-col gap-4">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2 mb-1">
                    <Box className="w-3.5 h-3.5 text-indigo-500" />
                    Danh sách sản phẩm ({(selectedOrder.items || []).reduce((acc: number, item: any) => acc + (item.quantity || 1), 0)} sản phẩm)
                  </h4>
                  
                  <div className="divide-y divide-neutral-100 max-h-[300px] overflow-y-auto pr-1">
                    {(selectedOrder.items || []).map((item: any, idx: number) => {
                      const productName = item.product?.name || 'Sản phẩm không xác định';
                      const productCategory = item.product?.category || 'Thời trang';
                      const productImage = item.product?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400';
                      const productPrice = item.product?.price || 0;
                      
                      const size = item.selectedSize || 'F';
                      const colorName = typeof item.selectedColor === 'string' 
                        ? item.selectedColor 
                        : (item.selectedColor?.name || 'Màu mặc định');
                      const colorHex = typeof item.selectedColor === 'string' 
                        ? '#999999' 
                        : (item.selectedColor?.hex || '#999999');
                        
                      return (
                        <div key={idx} className="py-3.5 flex gap-4 first:pt-0 last:pb-0 items-center justify-between">
                          <div className="flex gap-3 items-center">
                            <div className="relative w-12 h-16 rounded-xl overflow-hidden border border-neutral-100 shrink-0 bg-neutral-50">
                              <Image
                                src={productImage}
                                alt={productName}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div>
                              <p className="text-xs font-black text-neutral-900 line-clamp-1 leading-snug">{productName}</p>
                              <p className="text-[9px] text-neutral-400 font-semibold tracking-wider uppercase mb-1">{productCategory}</p>
                              
                              <div className="flex flex-wrap gap-2 items-center">
                                <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border border-neutral-200/50">
                                  Size: {size}
                                </span>
                                
                                <span className="flex items-center gap-1 bg-neutral-100 text-neutral-650 px-2 py-0.5 rounded-lg text-[9px] font-bold border border-neutral-200/50">
                                  Màu: 
                                  <span 
                                    className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0 shadow-sm" 
                                    style={{ backgroundColor: colorHex }} 
                                    title={colorName}
                                  />
                                  {colorName}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <p className="text-xs font-black text-neutral-900 font-mono">{formatPrice(productPrice * (item.quantity || 1))}</p>
                            <p className="text-[9px] text-neutral-400 font-bold font-mono">{formatPrice(productPrice)} x {item.quantity || 1}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-indigo-950 text-white rounded-[2rem] p-6 shadow-xl flex flex-col gap-4">
                  <h4 className="text-xs font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-300" />
                    Hóa đơn thanh toán
                  </h4>
                  
                  <div className="space-y-3 font-medium text-xs text-white/80 border-b border-white/10 pb-4">
                    <div className="flex justify-between">
                      <span>Tạm tính (hàng hóa)</span>
                      <span className="font-mono">{formatPrice(selectedOrder.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Khuyến mãi / Giảm giá</span>
                      <span className="font-mono text-emerald-300">-{formatPrice(selectedOrder.discount || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí vận chuyển</span>
                      <span className="font-mono">{formatPrice(selectedOrder.shipping || 0)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-white/50 font-black uppercase tracking-widest leading-none">Tổng thanh toán</p>
                      <p className="text-xs text-indigo-200/80 font-bold mt-1">Đã bao gồm thuế GTGT</p>
                    </div>
                    <span className="text-2xl font-black font-mono text-white tracking-tight">{formatPrice(selectedOrder.total || 0)}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center border-t border-neutral-100 pt-5 mt-2">
              <button
                onClick={() => {
                  alert(`Tính năng in hóa đơn đơn hàng ${selectedOrder.id} đang được kết nối với máy in nhiệt của chi nhánh...`);
                }}
                className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-black px-4 py-2.5 rounded-xl border border-neutral-200 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                In hóa đơn (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
