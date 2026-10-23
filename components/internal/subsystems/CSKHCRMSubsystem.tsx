'use client';

import React, { useState } from 'react';
import { UserCheck, Edit2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Customer360Sidebar from '../crm/Customer360Sidebar';
import { createCSKHTicketAction, updateCSKHTicketStatusAction } from '@/backend/actions/erpActions';

export interface CSKHCRMSubsystemProps {
  activeTab: string;
  crmClients: any[];
  cskhTickets: any[];
  setCskhTickets: (v: any[]) => void;
  allOrders: any[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CSKHCRMSubsystem: React.FC<CSKHCRMSubsystemProps> = ({
  activeTab,
  crmClients,
  cskhTickets,
  setCskhTickets,
  allOrders,
  showToast,
}) => {
  const [selectedCustomerFor360, setSelectedCustomerFor360] = useState<any | null>(null);
  const [newTicketCustomerName, setNewTicketCustomerName] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<'Đổi size' | 'Trả hàng lỗi' | 'Khiếu nại dịch vụ'>('Đổi size');
  const [newTicketPriority, setNewTicketPriority] = useState<'urgent' | 'normal' | 'low'>('normal');
  const [newTicketDesc, setNewTicketDesc] = useState('');
  const [cskhTicketFilter, setCskhTicketFilter] = useState<'all' | 'urgent' | 'pending' | 'resolved'>('all');
  const [editingNoteClientId, setEditingNoteClientId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');
  const [crmClientNotes, setCrmClientNotes] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('novyn_crm_client_notes');
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketCustomerName.trim() || !newTicketDesc.trim()) {
      showToast('Vui lòng điền đầy đủ tên khách hàng và mô tả!', 'error');
      return;
    }

    const priorityPrefix =
      newTicketPriority === 'urgent'
        ? '[Khẩn cấp] '
        : newTicketPriority === 'low'
        ? '[Thấp] '
        : '[Bình thường] ';
    const formattedDesc = `${priorityPrefix}${newTicketDesc}`;

    const newTk = {
      id: `TK-${Date.now().toString().slice(-4)}`,
      customerName: newTicketCustomerName,
      category: newTicketCategory,
      description: formattedDesc,
      priority: newTicketPriority,
      status: 'pending' as const,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    const updated = [newTk, ...cskhTickets];
    setCskhTickets(updated);
    localStorage.setItem('novyn_cskh_tickets', JSON.stringify(updated));

    createCSKHTicketAction({
      customerName: newTicketCustomerName,
      category: newTicketCategory,
      description: formattedDesc,
    })
      .then((res) => {
        if (res.success && res.data) {
          const synced = updated.map((t) => (t.id === newTk.id ? { ...t, id: res.data!.id } : t));
          setCskhTickets(synced);
          localStorage.setItem('novyn_cskh_tickets', JSON.stringify(synced));
        }
      })
      .catch((err) => console.error('Error persisting CSKH ticket:', err));

    setNewTicketCustomerName('');
    setNewTicketDesc('');
    setNewTicketPriority('normal');
    showToast('✓ Đã khởi tạo phiếu khiếu nại CSKH mới!', 'success');
  };

  const handleSaveClientNote = (clientId: string) => {
    const updated = { ...crmClientNotes, [clientId]: tempNoteText.trim() };
    setCrmClientNotes(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('novyn_crm_client_notes', JSON.stringify(updated));
    }
    setEditingNoteClientId(null);
    setTempNoteText('');
    showToast('✓ Đã lưu ghi chú sở thích khách hàng VIP!', 'success');
  };

  const handleResolveTicket = (id: string) => {
    const updated = cskhTickets.map((t) => (t.id === id ? { ...t, status: 'resolved' as const } : t));
    setCskhTickets(updated);
    localStorage.setItem('novyn_cskh_tickets', JSON.stringify(updated));

    updateCSKHTicketStatusAction(id, 'resolved').catch((err) => {
      console.error('Error updating ticket in DB:', err);
    });
    showToast('✓ Đã đánh dấu hoàn tất xử lý phiếu khiếu nại!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b pb-4">
        <h3 className="text-lg font-black text-neutral-950 uppercase tracking-tight flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-purple-500" />
          {activeTab === 'cskh-customers-tickets' || activeTab === 'returns-exchange'
            ? 'Đổi trả & Khiếu nại (CSKH Tickets)'
            : 'Khách hàng & Hệ thống khiếu nại CRM'}
        </h3>
        <p className="text-xs text-neutral-450 mt-1">
          {activeTab === 'cskh-customers-tickets' || activeTab === 'returns-exchange'
            ? 'Ghi nhận sự vụ đổi trả hàng lỗi, chật size hoặc khiếu nại dịch vụ.'
            : 'Đồng bộ hoá tích luỹ chi tiêu, tự động tính điểm loyalty và xếp hạng VIP.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* VIP Loyalty list */}
        {(activeTab === 'cskh-customers' ||
          activeTab === 'cskh-customers-vip' ||
          activeTab === 'customers-list' ||
          activeTab === 'cskh-hub') && (
          <div
            className={`${
              activeTab === 'cskh-customers-vip' || activeTab === 'customers-list'
                ? 'lg:col-span-12'
                : 'lg:col-span-7'
            } bg-white border rounded-3xl p-5 shadow-sm space-y-4`}
          >
            <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider">
              Hồ sơ khách hàng thành viên VIP
            </h4>

            <div className="overflow-x-auto max-h-[350px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                    <th className="p-3">Họ Tên</th>
                    <th className="p-3">Hạng VIP</th>
                    <th className="p-3 text-center">Tích luỹ chi tiêu</th>
                    <th className="p-3 text-center">Điểm</th>
                    <th className="p-3 text-center">Chiết khấu đặc quyền</th>
                    <th className="p-3">Sở thích & Ghi chú VIP</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-neutral-700">
                  {crmClients.map((client) => (
                    <tr
                      key={client.id}
                      onClick={() => {
                        setSelectedCustomerFor360(client);
                        showToast(`✓ Đã mở Khách Hàng 360: ${client.name}`, 'info');
                      }}
                      className={`hover:bg-neutral-50/60 cursor-pointer transition-colors ${
                        selectedCustomerFor360?.id === client.id ? 'bg-purple-50/70 font-semibold' : ''
                      }`}
                      title="Click để xem hồ sơ Khách Hàng 360"
                    >
                      <td className="p-3 font-bold text-neutral-900">
                        {client.name}
                        <span className="text-[9px] text-neutral-400 font-mono block">{client.phone}</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            client.tier === 'VVIP'
                              ? 'bg-indigo-900 text-white'
                              : client.tier === 'Platinum'
                              ? 'bg-purple-100 text-purple-700'
                              : client.tier === 'Gold'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {client.tier}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold">{formatPrice(client.totalSpent)}</td>
                      <td className="p-3 text-center font-mono text-emerald-700 font-bold">
                        {client.points} pts
                      </td>
                      <td className="p-3 text-center font-bold text-rose-650">
                        {client.tier === 'VVIP'
                          ? '-15%'
                          : client.tier === 'Platinum'
                          ? '-10%'
                          : client.tier === 'Gold'
                          ? '-5%'
                          : 'Freeship'}
                      </td>
                      <td className="p-3 min-w-[200px] max-w-[260px]">
                        {editingNoteClientId === client.id ? (
                          <div className="flex gap-1 items-center">
                            <input
                              type="text"
                              value={tempNoteText}
                              onChange={(e) => setTempNoteText(e.target.value)}
                              placeholder="Ghi chú sở thích..."
                              className="px-2 py-1 border rounded-lg text-[10px] bg-white text-neutral-800 w-full focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveClientNote(client.id)}
                              className="px-2 py-1 bg-neutral-900 text-white rounded-lg text-[9px] font-bold shrink-0 cursor-pointer"
                            >
                              Lưu
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingNoteClientId(null)}
                              className="px-1.5 py-1 text-neutral-500 hover:text-neutral-800 text-[9px] shrink-0 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-1 group">
                            <span className="text-[10px] text-neutral-600 italic block truncate">
                              {crmClientNotes[client.id] || (
                                <span className="text-neutral-400 not-italic">Chưa có ghi chú</span>
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNoteClientId(client.id);
                                setTempNoteText(crmClientNotes[client.id] || '');
                              }}
                              className="text-neutral-400 hover:text-neutral-800 p-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                              title="Chỉnh sửa ghi chú sở thích khách hàng"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ticket form */}
        {(activeTab === 'cskh-customers' ||
          activeTab === 'cskh-customers-tickets' ||
          activeTab === 'returns-exchange' ||
          activeTab === 'cskh-hub') && (
          <div
            className={`${
              activeTab === 'cskh-customers-tickets' || activeTab === 'returns-exchange'
                ? 'lg:col-span-12'
                : 'lg:col-span-5'
            } bg-white border rounded-3xl p-5 shadow-sm space-y-4`}
          >
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850">
              Ghi nhận phiếu đổi trả / khiếu nại mới
            </h4>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">
                  Tên khách hàng khiếu nại
                </label>
                <input
                  type="text"
                  placeholder="Tên khách..."
                  value={newTicketCustomerName}
                  onChange={(e) => setNewTicketCustomerName(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">
                  Mức độ ưu tiên xử lý
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'urgent', label: '🔴 Khẩn cấp', desc: 'Sự cố / VIP' },
                    { key: 'normal', label: '🔵 Bình thường', desc: 'Đổi size' },
                    { key: 'low', label: '⚪ Thấp', desc: 'Tư vấn' },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setNewTicketPriority(p.key as any)}
                      className={`p-2 rounded-xl text-left border cursor-pointer transition-all ${
                        newTicketPriority === p.key
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                          : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      <span className="text-[10px] font-bold block">{p.label}</span>
                      <span
                        className={`text-[8px] block mt-0.5 ${
                          newTicketPriority === p.key ? 'text-neutral-300' : 'text-neutral-400'
                        }`}
                      >
                        {p.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">
                  Loại khiếu nại / dịch vụ
                </label>
                <select
                  value={newTicketCategory}
                  onChange={(e) => setNewTicketCategory(e.target.value as any)}
                  className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                >
                  <option value="Đổi size">Đổi size</option>
                  <option value="Trả hàng lỗi">Trả hàng lỗi</option>
                  <option value="Khiếu nại dịch vụ">Khiếu nại dịch vụ</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">
                  Chi tiết mô tả sự vụ
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả sự việc rách bẩn hoặc chật eo..."
                  value={newTicketDesc}
                  onChange={(e) => setNewTicketDesc(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer mt-2"
              >
                Khởi tạo phiếu hỗ trợ ngay
              </button>
            </form>
          </div>
        )}

        {/* Customer 360 & Quick Canned Responses Hub */}
        {(activeTab === 'cskh-hub' || activeTab === 'customers-list' || activeTab === 'cskh-customers') && (
          <div className="lg:col-span-12">
            <Customer360Sidebar
              selectedCustomer={selectedCustomerFor360 || crmClients[0] || null}
              customerOrders={allOrders.filter((o) => {
                const custName = (selectedCustomerFor360?.name || crmClients[0]?.name || '').toLowerCase();
                const custPhone = (selectedCustomerFor360?.phone || crmClients[0]?.phone || '').replace(
                  /\D/g,
                  ''
                );
                const orderName = (o.customerInfo?.fullName || o.customerName || '').toLowerCase();
                const orderPhone = (o.customerInfo?.phone || o.phone || '').replace(/\D/g, '');

                const matchName = custName && orderName.includes(custName);
                const matchPhone =
                  custPhone.length >= 3 &&
                  orderPhone.length >= 3 &&
                  (orderPhone.includes(custPhone) || custPhone.includes(orderPhone));
                return matchName || matchPhone;
              })}
              customerTickets={cskhTickets.filter((t) =>
                t.customerName
                  ?.toLowerCase()
                  .includes((selectedCustomerFor360?.name || crmClients[0]?.name || '').toLowerCase())
              )}
              onInsertCannedReply={(text) => {
                setNewTicketDesc(newTicketDesc ? `${newTicketDesc}\n${text}` : text);
              }}
              showToast={showToast}
            />
          </div>
        )}
      </div>

      {/* Tickets lists history */}
      {(activeTab === 'cskh-customers' ||
        activeTab === 'cskh-customers-tickets' ||
        activeTab === 'returns-exchange' ||
        activeTab === 'cskh-hub') && (
        <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider">
              Hộp thư phiếu xử lý khiếu nại (Customer Tickets Center)
            </h4>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { key: 'all', label: `Tất cả (${cskhTickets.length})` },
                {
                  key: 'urgent',
                  label: `🔴 Khẩn cấp (${
                    cskhTickets.filter((t) => t.priority === 'urgent' || t.description?.includes('[Khẩn cấp]'))
                      .length
                  })`,
                },
                {
                  key: 'pending',
                  label: `⏳ Đang xử lý (${cskhTickets.filter((t) => t.status === 'pending').length})`,
                },
                {
                  key: 'resolved',
                  label: `✓ Đã xong (${cskhTickets.filter((t) => t.status === 'resolved').length})`,
                },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setCskhTicketFilter(f.key as any)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    cskhTicketFilter === f.key
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                  <th className="p-3">Khách hàng</th>
                  <th className="p-3">Mức ưu tiên</th>
                  <th className="p-3">Phân loại</th>
                  <th className="p-3">Mô tả chi tiết</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y text-neutral-700">
                {cskhTickets
                  .filter((t) => {
                    if (cskhTicketFilter === 'urgent')
                      return t.priority === 'urgent' || t.description?.includes('[Khẩn cấp]');
                    if (cskhTicketFilter === 'pending') return t.status === 'pending';
                    if (cskhTicketFilter === 'resolved') return t.status === 'resolved';
                    return true;
                  })
                  .map((t) => {
                    const isPending = t.status === 'pending';
                    const isUrgent = t.priority === 'urgent' || t.description?.includes('[Khẩn cấp]');
                    const isLow = t.priority === 'low' || t.description?.includes('[Thấp]');
                    return (
                      <tr key={t.id} className="hover:bg-neutral-50/15">
                        <td className="p-3 font-bold text-neutral-900">{t.customerName}</td>
                        <td className="p-3">
                          {isUrgent ? (
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-300 animate-pulse">
                              🔴 Khẩn cấp
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200">
                              ⚪ Thấp
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                              🔵 Bình thường
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              t.category === 'Trả hàng lỗi'
                                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                : t.category === 'Đổi size'
                                ? 'bg-sky-50 text-sky-600 border border-sky-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}
                          >
                            {t.category}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs truncate">{t.description}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              isPending
                                ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-150'
                            }`}
                          >
                            {isPending ? 'Đang xử lý' : 'Đã giải quyết'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {isPending ? (
                            <button
                              type="button"
                              onClick={() => handleResolveTicket(t.id)}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Giải quyết xong
                            </button>
                          ) : (
                            <span className="text-[10px] text-neutral-450 font-bold">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
