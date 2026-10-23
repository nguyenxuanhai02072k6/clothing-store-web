'use client';

import React, { useState } from 'react';
import { Megaphone, Bell, Layers, MapPin, User as UserIcon, Tag, FileText, Send, Search, X, Filter, Calendar, Trash2 } from 'lucide-react';

export interface AnnouncementsTabProps {
  currentUser: any;
  announcements: any[];
  sendAnnouncement: (title: string, content: string, recipientType: 'all' | 'accountant' | 'branch_q1' | 'branch_td') => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AnnouncementsTab({
  currentUser,
  announcements = [],
  sendAnnouncement,
  deleteAnnouncement,
  showToast,
}: AnnouncementsTabProps) {
  const [annRecipient, setAnnRecipient] = useState<'all' | 'accountant' | 'branch_q1' | 'branch_td'>('all');
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annSearchQuery, setAnnSearchQuery] = useState('');
  const [annRecipientFilter, setAnnRecipientFilter] = useState('all');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo!', 'error');
      return;
    }
    await sendAnnouncement(annTitle.trim(), annContent.trim(), annRecipient);
    setAnnTitle('');
    setAnnContent('');
  };

  const filtered = announcements.filter((ann: any) => {
    if (annRecipientFilter === 'system_all' && ann.recipientType !== 'all') return false;
    if (annRecipientFilter === 'branch_q1' && ann.recipientType !== 'branch_q1') return false;
    if (annRecipientFilter === 'branch_td' && ann.recipientType !== 'branch_td') return false;
    if (annRecipientFilter === 'accountant' && ann.recipientType !== 'accountant') return false;

    if (annSearchQuery.trim()) {
      const q = annSearchQuery.toLowerCase();
      const matchTitle = (ann.title || '').toLowerCase().includes(q);
      const matchContent = (ann.content || '').toLowerCase().includes(q);
      const matchSender = (ann.senderName || '').toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchSender) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60">
              {currentUser.role === 'director' ? 'Hội Đồng Quản Trị • CEO' : `Quản Lý • ${currentUser.branch || 'Showroom'}`}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400">
              <Megaphone className="w-3.5 h-3.5 text-amber-500" />
              Trung tâm điều hành
            </span>
          </div>
          <h3 className="text-xl font-black text-neutral-900 tracking-tight uppercase">
            Thông báo điều hành & Chỉ đạo hệ thống
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Phát hành chỉ thị, cập nhật chính sách nội bộ và truyền tải thông điệp nhanh chóng tới toàn thể nhân viên NOVYN WEAR.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>Tổng cộng: <strong className="text-neutral-900 font-black">{announcements.length}</strong> thông tri</span>
          </div>
        </div>
      </div>

      {/* 4 Bento KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Toàn bộ thông báo</span>
            <div className="p-1.5 rounded-lg bg-neutral-200/60 text-neutral-700">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 tracking-tight">
            {announcements.length}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium mt-1">Đã lưu trữ trên hệ thống</span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-700">Toàn hệ thống</span>
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-950 tracking-tight">
            {announcements.filter((a: any) => a.recipientType === 'all').length}
          </div>
          <span className="text-[10px] text-indigo-500 font-medium mt-1">Gửi tới tất cả nhân sự</span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-700">Chi nhánh Quận 1</span>
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-950 tracking-tight">
            {announcements.filter((a: any) => a.recipientType === 'branch_q1').length}
          </div>
          <span className="text-[10px] text-blue-500 font-medium mt-1">Chỉ đạo Showroom Q.1</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700">Chi nhánh Thảo Điền</span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-950 tracking-tight">
            {announcements.filter((a: any) => a.recipientType === 'branch_td').length}
          </div>
          <span className="text-[10px] text-amber-600 font-medium mt-1">Chỉ đạo Showroom Thảo Điền</span>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-5">
          <div className="bg-neutral-950 text-white p-6 rounded-3xl border border-neutral-800 shadow-xl sticky top-6">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-400" />
                Phát lệnh thông báo mới
              </h4>
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800">
                {currentUser.role === 'director' ? 'Giám Đốc' : 'Cửa Hàng Trưởng'}
              </span>
            </div>

            <p className="text-[11px] text-neutral-400 font-medium mb-5 leading-relaxed">
              {currentUser.role === 'director'
                ? 'Giám đốc soạn chỉ thị trực tiếp đến các phòng ban và chi nhánh. Nội dung sẽ hiển thị ngay lập tức tới nhân sự được chỉ định.'
                : `Quản lý soạn văn bản chỉ đạo tác nghiệp, phân công nhiệm vụ hoặc thông báo nội bộ cho nhân sự thuộc chi nhánh.`}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5 flex items-center gap-1.5">
                  <UserIcon className="w-3 h-3 text-amber-400" />
                  Phạm vi áp dụng (Đối tượng nhận)
                </label>
                <select
                  value={annRecipient}
                  onChange={(e) => setAnnRecipient(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400 font-bold transition-all"
                >
                  {currentUser.role === 'director' ? (
                    <>
                      <option value="all">Toàn bộ nhân sự hệ thống (All Staff)</option>
                      <option value="accountant">Phòng Kế toán & Tài chính</option>
                      <option value="branch_q1">Chi nhánh Quận 1 (Showroom Q.1)</option>
                      <option value="branch_td">Chi nhánh Thảo Điền (Showroom Thảo Điền)</option>
                    </>
                  ) : (
                    <>
                      <option value={currentUser.branch === 'Chi nhánh Thảo Điền' ? 'branch_td' : 'branch_q1'}>
                        Nội bộ {currentUser.branch || 'Chi nhánh hiện tại'}
                      </option>
                      <option value="accountant">Phòng Kế toán & Tài chính</option>
                      <option value="all">Báo cáo Ban Giám đốc & Toàn hệ thống</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-amber-400" />
                  Tiêu đề chỉ đạo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Chỉ tiêu doanh số cuối tuần / Lưu ý kiểm kê kho..."
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400 font-semibold placeholder:text-neutral-600 transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-amber-400" />
                  Nội dung chi tiết
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Nhập nội dung văn bản chỉ đạo cụ thể, lưu ý triển khai và thời hạn hoàn thành..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400 resize-none font-medium placeholder:text-neutral-600 transition-all leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-black uppercase tracking-widest transition-all active:scale-98 shadow-md cursor-pointer flex items-center justify-center gap-2 font-bold"
              >
                <Send className="w-3.5 h-3.5" />
                Phát lệnh chỉ đạo ngay
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: ANNOUNCEMENT FEED */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, nội dung, người gửi..."
                value={annSearchQuery}
                onChange={(e) => setAnnSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-neutral-400"
              />
              {annSearchQuery && (
                <button
                  onClick={() => setAnnSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0 hidden sm:block" />
              <select
                value={annRecipientFilter}
                onChange={(e) => setAnnRecipientFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 focus:outline-none"
              >
                <option value="all">Tất cả đối tượng ({announcements.length})</option>
                <option value="system_all">Toàn hệ thống</option>
                <option value="branch_q1">Chi nhánh Q.1</option>
                <option value="branch_td">Chi nhánh Thảo Điền</option>
                <option value="accountant">Phòng Kế toán</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-12 text-center shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-neutral-400">
                  <Megaphone className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-neutral-800 mb-1">
                  {annSearchQuery || annRecipientFilter !== 'all'
                    ? 'Không tìm thấy thông báo phù hợp'
                    : 'Chưa có thông báo điều hành nào'}
                </h4>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  {annSearchQuery || annRecipientFilter !== 'all'
                    ? 'Thử thay đổi từ khóa hoặc bộ lọc đối tượng để tìm kiếm lại.'
                    : 'Sử dụng biểu mẫu bên cạnh để ban hành thông báo hoặc chỉ đạo đầu tiên.'}
                </p>
              </div>
            ) : (
              filtered.map((ann: any) => {
                const recipientBadge =
                  ann.recipientType === 'all'
                    ? { text: 'Toàn hệ thống', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60' }
                    : ann.recipientType === 'branch_q1'
                    ? { text: 'Showroom Quận 1', bg: 'bg-blue-50 text-blue-700 border-blue-200/60' }
                    : ann.recipientType === 'branch_td'
                    ? { text: 'Showroom Thảo Điền', bg: 'bg-amber-50 text-amber-700 border-amber-200/60' }
                    : { text: 'Phòng Kế toán', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' };

                const canDelete = currentUser.role === 'director' || ann.senderName === currentUser.name;

                return (
                  <div
                    key={ann.id}
                    className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${recipientBadge.bg}`}>
                          {recipientBadge.text}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {(() => {
                            try {
                              const d = new Date(ann.createdAt);
                              return isNaN(d.getTime())
                                ? ann.createdAt
                                : d.toLocaleString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  });
                            } catch {
                              return ann.createdAt;
                            }
                          })()}
                        </span>
                      </div>

                      {canDelete && (
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa thông báo "${ann.title}" không?`)) {
                              deleteAnnouncement(ann.id);
                            }
                          }}
                          className="text-neutral-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Xóa thông báo này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-neutral-900 mb-2 leading-snug">
                      {ann.title}
                    </h4>

                    <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line mb-4 font-normal">
                      {ann.content}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-[11px] text-neutral-400">
                      <span className="flex items-center gap-1.5 font-semibold text-neutral-500">
                        <UserIcon className="w-3 h-3 text-neutral-400" />
                        Người ban hành: <strong className="text-neutral-800">{ann.senderName || 'Hệ thống'}</strong>
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400">
                        Mã ID: {ann.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
