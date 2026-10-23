'use client';

import React, { useState } from 'react';
import {
  Megaphone,
  DollarSign,
  CheckCircle2,
  BarChart2,
  TrendingUp,
  ShoppingBag,
  Box,
  Clock,
  TrendingDown,
  FileText,
  PlusCircle,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface UserProfileOverviewTabProps {
  currentUser: any;
  announcements: any[];
  allOrders: any[];
  expensesList: any[];
  productsList: any[];
  dailyReports: any[];
  viewingReportId: string | null;
  setViewingReportId: (id: string | null) => void;
  markReportAsRead: (id: string) => void;
  submitDailyReport: (title: string, content: string) => void;
  totalRevenue: number;
  completedOrdersCount: number;
  conversionRate: string;
  netProfit: number;
  bestSellerName: string;
  lowStockCount: number;
  pendingOrdersCount: number;
  returnRate: string;
}

export default function UserProfileOverviewTab({
  currentUser,
  announcements,
  dailyReports,
  viewingReportId,
  setViewingReportId,
  markReportAsRead,
  submitDailyReport,
  totalRevenue,
  completedOrdersCount,
  conversionRate,
  netProfit,
  bestSellerName,
  lowStockCount,
  pendingOrdersCount,
  returnRate,
}: UserProfileOverviewTabProps) {
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');

  const filteredAnnouncements = announcements.filter((ann: any) => {
    if (ann.recipientType === 'all') return true;
    if (ann.recipientType === 'accountant' && currentUser.role === 'accountant') return true;
    if (ann.recipientType === 'branch_q1' && currentUser.branch === 'Chi nhánh Quận 1') return true;
    if (ann.recipientType === 'branch_td' && currentUser.branch === 'Chi nhánh Thảo Điền') return true;
    return false;
  });

  return (
    <div>
      <h3 className="text-lg font-black text-neutral-950 tracking-tight mb-2 uppercase">Thông báo từ ban giám đốc</h3>
      <p className="text-xs text-neutral-450 mb-8">Nơi cập nhật kịp thời các văn bản, thông tri chỉ đạo và kế hoạch triển khai của NOVYN WEAR.</p>

      <div className="space-y-6 mb-10">
        {filteredAnnouncements.map((ann: any) => (
          <div key={ann.id} className="bg-gradient-to-br from-amber-50/60 to-amber-100/30 p-5 rounded-3xl border border-amber-250/70 shadow-sm flex items-start gap-4 animate-pulse">
            <Megaphone className="w-5 h-5 text-amber-550 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-neutral-900 mb-1">{ann.title}</h4>
              <p className="text-xs font-medium text-neutral-700 leading-relaxed whitespace-pre-line mb-3">{ann.content}</p>
              <span className="text-[9px] text-neutral-450 font-bold">Người gửi: {ann.senderName} • lúc {ann.createdAt}</span>
            </div>
          </div>
        ))}
        {filteredAnnouncements.length === 0 && (
          <p className="text-xs text-neutral-450 italic text-center py-12 bg-neutral-50 rounded-2xl border">Hôm nay hệ thống không có thông tri mới.</p>
        )}
      </div>

      {/* --- BENTO GRID OF 8 KPI CARDS --- */}
      <h3 className="text-sm font-black text-neutral-900 tracking-tight mb-4 uppercase">Chỉ số vận hành hệ thống (KPIs)</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* 1. Doanh thu gộp */}
        <div className="bg-[#FFFBF7] p-5 rounded-2xl border border-neutral-100/70 hover:shadow-md transition-all flex flex-col justify-between col-span-2 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Doanh thu gộp</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-sm md:text-base font-black text-neutral-900 block font-mono">{formatPrice(totalRevenue)}</span>
            <span className="text-[8px] text-emerald-600 font-bold mt-1 block">Hoàn tất thanh toán</span>
          </div>
        </div>

        {/* 2. Đơn hàng hoàn thành */}
        <div className="bg-[#FFFBF7] p-5 rounded-2xl border border-neutral-100/70 hover:shadow-md transition-all flex flex-col justify-between col-span-1 md:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Đơn thành công</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-sm md:text-base font-black text-neutral-900 block font-mono">{completedOrdersCount} đơn</span>
            <span className="text-[8px] text-indigo-600 font-bold mt-1 block">Đã đối soát kho</span>
          </div>
        </div>

        {/* 3. Tỷ lệ chuyển đổi */}
        <div className="bg-[#FFFBF7] p-5 rounded-2xl border border-neutral-100/70 hover:shadow-md transition-all flex flex-col justify-between col-span-1 md:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Tỷ lệ chuyển đổi</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <BarChart2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-sm md:text-base font-black text-neutral-900 block font-mono">{conversionRate}</span>
            <span className="text-[8px] text-amber-600 font-bold mt-1 block">Trung bình hệ thống</span>
          </div>
        </div>

        {/* 4. Lợi nhuận ròng */}
        <div className="bg-[#FFFBF7] p-5 rounded-2xl border border-neutral-100/70 hover:shadow-md transition-all flex flex-col justify-between col-span-2 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Lợi nhuận ròng</span>
            <div className={`p-1.5 rounded-lg ${netProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className={`text-sm md:text-base font-black font-mono block ${netProfit >= 0 ? 'text-neutral-900' : 'text-rose-600'}`}>
              {netProfit >= 0 ? '+' : ''}{formatPrice(netProfit)}
            </span>
            <span className={`text-[8px] font-bold mt-1 block ${netProfit >= 0 ? 'text-emerald-650' : 'text-rose-655'}`}>
              {netProfit >= 0 ? 'Khấu trừ thuế & lương' : 'Cần tối ưu chi phí'}
            </span>
          </div>
        </div>

        {/* 5. Sản phẩm bán chạy */}
        <div className="bg-[#FFFBF7] p-5 rounded-2xl border border-neutral-100/70 hover:shadow-md transition-all flex flex-col justify-between col-span-2 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Sản phẩm bán chạy</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-sm font-black text-neutral-900 block truncate">{bestSellerName}</span>
            <span className="text-[8px] text-rose-600 font-bold mt-1 block">Xếp hạng theo sản lượng bán ra</span>
          </div>
        </div>

        {/* 6. Tồn kho thấp */}
        <div className="bg-[#FFFBF7] p-5 rounded-2xl border border-neutral-100/70 hover:shadow-md transition-all flex flex-col justify-between col-span-1 md:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Tồn kho thấp</span>
            <div className={`p-1.5 rounded-lg ${lowStockCount > 0 ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-neutral-50 text-neutral-450'}`}>
              <Box className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-sm md:text-base font-black text-neutral-900 block font-mono">{lowStockCount} mặt hàng</span>
            <span className={`text-[8px] font-bold mt-1 block ${lowStockCount > 0 ? 'text-amber-600' : 'text-neutral-450'}`}>
              {lowStockCount > 0 ? 'Cần lập kế hoạch restock' : 'Tồn kho ổn định'}
            </span>
          </div>
        </div>

        {/* 7. Đơn chờ xử lý */}
        <div className="bg-[#FFFBF7] p-5 rounded-2xl border border-neutral-100/70 hover:shadow-md transition-all flex flex-col justify-between col-span-1 md:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Đơn chờ xử lý</span>
            <div className={`p-1.5 rounded-lg ${pendingOrdersCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-neutral-50 text-neutral-400'}`}>
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-sm md:text-base font-black text-neutral-900 block font-mono">{pendingOrdersCount} đơn</span>
            <span className="text-[8px] text-neutral-400 font-bold mt-1 block">Đang chờ xác nhận POS</span>
          </div>
        </div>

        {/* 8. Tỷ lệ hoàn hàng */}
        <div className="bg-[#FFFBF7] p-5 rounded-2xl border border-neutral-100/70 hover:shadow-md transition-all flex flex-col justify-between col-span-2 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Tỷ lệ hoàn hàng</span>
            <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-500">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-sm md:text-base font-black text-neutral-900 block font-mono">{returnRate}</span>
            <span className="text-[8px] text-neutral-400 font-bold mt-1 block">Mục tiêu kiểm soát &lt; 2.0%</span>
          </div>
        </div>
      </div>

      {/* personal overview widgets */}
      <h3 className="text-sm font-black text-neutral-950 tracking-tight mb-4 uppercase">Thông tin cá nhân & Nhân sự</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100">
          <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Mức lương cơ bản</span>
          <span className="text-base font-black text-neutral-900">{currentUser.salary ? formatPrice(currentUser.salary) : 'Mức lương thoả thuận'}</span>
        </div>
        <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100">
          <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Mã định danh nhân viên</span>
          <span className="text-base font-black text-neutral-900 font-mono">{currentUser.id}</span>
        </div>
      </div>

      {/* --- CENTRALIZED DAILY OPERATIONS REPORT SYSTEM --- */}
      {(currentUser.role === 'director' || currentUser.role === 'manager' || currentUser.role === 'accountant' || currentUser.role === 'cskh') && (
        <div className="mt-8 border-t border-neutral-100 pt-8">
          {currentUser.role === 'director' ? (
            /* Director View: Read all reports split visually into two sections */
            <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
              <h4 className="text-xs font-black text-neutral-900 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-rose-500" />
                Báo cáo vận hành tổng hợp toàn công ty
              </h4>
              <p className="text-[10px] text-neutral-450 mb-6">Tập hợp các báo cáo cuối ca từ quản lý các chi nhánh, bộ phận CSKH, và kế toán trưởng.</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cột trái: Báo cáo chưa đọc */}
                <div className="flex flex-col bg-amber-50/10 rounded-2xl border border-amber-200/30 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="text-[10px] font-black text-amber-900 tracking-wider uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                      Chưa đọc ({dailyReports.filter((r: any) => r.status === 'unread').length})
                    </h5>
                  </div>
                  
                  <div className="space-y-3 overflow-y-auto max-h-[450px] pr-1 flex-grow">
                    {(() => {
                      const unreadReports = dailyReports.filter((r: any) => r.status === 'unread');
                      if (unreadReports.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                            <CheckCircle2 className="w-8 h-8 text-amber-500/50 mb-2" />
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide">Tuyệt vời! Đã xem hết báo cáo</p>
                            <p className="text-[9px] text-neutral-400 mt-1">Không có báo cáo nào chưa đọc.</p>
                          </div>
                        );
                      }
                      return unreadReports.map((rep: any) => {
                        const isExpanded = viewingReportId === rep.id;
                        return (
                          <div
                            key={rep.id}
                            className="bg-white border border-amber-250/65 rounded-xl p-4 transition-all duration-300 shadow-sm hover:shadow-md hover:border-amber-350/80 ring-1 ring-amber-50/50"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0 flex-grow">
                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider text-white ${
                                    rep.branch.includes('Quận 1') 
                                      ? 'bg-rose-500' 
                                      : rep.branch.includes('Thảo Điền') 
                                      ? 'bg-amber-500'
                                      : rep.role === 'cskh'
                                      ? 'bg-purple-500'
                                      : 'bg-indigo-500'
                                  }`}>
                                    {rep.branch}
                                  </span>
                                  <span className="text-[9px] text-neutral-450 font-bold">{rep.name}</span>
                                </div>
                                <h6 className="text-[11px] font-black text-neutral-900 leading-snug">{rep.title}</h6>
                              </div>
                              
                              <button
                                onClick={() => {
                                  if (isExpanded) {
                                    setViewingReportId(null);
                                  } else {
                                    setViewingReportId(rep.id);
                                    markReportAsRead(rep.id);
                                  }
                                }}
                                className="bg-neutral-950 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg hover:bg-neutral-850 transition-colors shrink-0 cursor-pointer active:scale-95 shadow-sm"
                              >
                                {isExpanded ? 'Đóng' : 'Xem & Đọc'}
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-dashed border-neutral-200">
                                <p className="text-[9px] text-neutral-400 font-bold uppercase mb-1">Nội dung chi tiết:</p>
                                <div className="bg-neutral-50/50 p-3 rounded-lg border text-[11px] text-neutral-700 leading-relaxed whitespace-pre-line font-medium">
                                  {rep.content}
                                </div>
                                <div className="flex justify-between items-center mt-2.5 text-[8px] text-neutral-450 font-semibold">
                                  <span>Gửi lúc: {rep.createdAt}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Cột phải: Báo cáo đã đọc */}
                <div className="flex flex-col bg-neutral-50/50 rounded-2xl border border-neutral-200/40 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="text-[10px] font-black text-neutral-600 tracking-wider uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Đã đọc ({dailyReports.filter((r: any) => r.status === 'read').length})
                    </h5>
                  </div>
                  
                  <div className="space-y-3 overflow-y-auto max-h-[450px] pr-1 flex-grow">
                    {(() => {
                      const readReports = dailyReports.filter((r: any) => r.status === 'read');
                      if (readReports.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                            <FileText className="w-8 h-8 text-neutral-300 mb-2" />
                            <p className="text-[10px] text-neutral-455 font-bold uppercase tracking-wide">Chưa đọc báo cáo nào</p>
                            <p className="text-[9px] text-neutral-400 mt-1">Các báo cáo sau khi đọc sẽ chuyển vào đây.</p>
                          </div>
                        );
                      }
                      return readReports.map((rep: any) => {
                        const isExpanded = viewingReportId === rep.id;
                        return (
                          <div
                            key={rep.id}
                            className="bg-white border border-neutral-200/50 rounded-xl p-4 transition-all duration-300 hover:border-neutral-300 hover:shadow-sm"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0 flex-grow">
                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider text-white opacity-75 ${
                                    rep.branch.includes('Quận 1') 
                                      ? 'bg-rose-500' 
                                      : rep.branch.includes('Thảo Điền') 
                                      ? 'bg-amber-500'
                                      : rep.role === 'cskh'
                                      ? 'bg-purple-500'
                                      : 'bg-indigo-500'
                                  }`}>
                                    {rep.branch}
                                  </span>
                                  <span className="text-[9px] text-neutral-450 font-bold">{rep.name}</span>
                                </div>
                                <h6 className="text-[11px] font-bold text-neutral-700 leading-snug line-clamp-1">{rep.title}</h6>
                              </div>
                              
                              <button
                                onClick={() => {
                                  setViewingReportId(isExpanded ? null : rep.id);
                                }}
                                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer active:scale-95"
                              >
                                {isExpanded ? 'Đóng' : 'Xem'}
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-dashed border-neutral-200">
                                <p className="text-[9px] text-neutral-400 font-bold uppercase mb-1">Nội dung chi tiết:</p>
                                <div className="bg-neutral-50/50 p-3 rounded-lg border text-[11px] text-neutral-700 leading-relaxed whitespace-pre-line font-medium">
                                  {rep.content}
                                </div>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2.5 gap-1.5 text-[8px] text-neutral-450 font-semibold border-t border-neutral-100 pt-2.5">
                                  <span>Gửi lúc: {rep.createdAt}</span>
                                  {rep.readAt && (
                                    <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Đã xem lúc: {rep.readAt}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Staff Views: Manager, Accountant, CSKH */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel: Submit Form */}
              <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                <h4 className="text-xs font-black text-neutral-900 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-neutral-800 animate-pulse" />
                  Soạn báo cáo gửi Giám đốc
                </h4>
                <p className="text-[10px] text-neutral-450 mb-6">Gửi thông số vận hành, sự vụ hoặc tổng hợp công việc trong ngày lên sếp Bảo.</p>
                
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
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Tiêu đề báo cáo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Báo cáo CSKH cuối ngày hoặc doanh số chi nhánh..."
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400 bg-white font-semibold text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Nội dung chi tiết</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Nội dung cụ thể công việc đã xử lý, phát sinh, đề xuất ý kiến..."
                      value={reportContent}
                      onChange={(e) => setReportContent(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400 bg-white resize-none font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-neutral-950 text-white hover:bg-neutral-850 active:scale-95 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    Gửi báo cáo vận hành lên sếp Bảo
                  </button>
                </form>
              </div>

              {/* Right Panel: History Logs */}
              <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm flex flex-col">
                <h4 className="text-xs font-black text-neutral-900 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  Lịch sử báo cáo đã nộp
                </h4>
                <p className="text-[10px] text-neutral-450 mb-6">Theo dõi tiến độ xem báo cáo từ Giám đốc Bảo.</p>

                <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1 flex-grow">
                  {dailyReports
                    .filter((rep: any) => rep.userId === currentUser.id)
                    .map((rep: any) => {
                      const isUnread = rep.status === 'unread';
                      return (
                        <div key={rep.id} className="p-3 bg-neutral-50/50 border border-neutral-200/40 rounded-xl text-xs leading-normal">
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-bold text-neutral-800 tracking-wide truncate max-w-[150px]">{rep.title}</h5>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide shrink-0 ${
                              isUnread
                                ? 'bg-amber-50 text-amber-500 border border-amber-100 animate-pulse'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}>
                              {isUnread ? 'Chưa đọc' : 'Sếp đã đọc'}
                            </span>
                          </div>
                          <p className="text-[9px] text-neutral-400">Ngày gửi: {rep.createdAt}</p>
                          {rep.readAt && (
                            <p className="text-[9px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              Đã xem: {rep.readAt}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  {dailyReports.filter((rep: any) => rep.userId === currentUser.id).length === 0 && (
                    <p className="text-xs text-neutral-400 italic text-center py-12 select-none">Bạn chưa gửi báo cáo nào.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
