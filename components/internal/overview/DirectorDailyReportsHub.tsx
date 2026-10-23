'use client';

import React from 'react';
import { FileText, PlusCircle, Clock } from 'lucide-react';

interface DirectorDailyReportsHubProps {
  currentUser: any;
  dailyReports: any[];
  viewingReportId: string | null;
  setViewingReportId: (id: string | null) => void;
  markReportAsRead: (id: string) => void;
  submitDailyReport: (title: string, content: string) => void;
}

export default function DirectorDailyReportsHub({
  currentUser,
  dailyReports,
  viewingReportId,
  setViewingReportId,
  markReportAsRead,
  submitDailyReport
}: DirectorDailyReportsHubProps) {
  const isDirector = currentUser?.role === 'director';
  const isReporter = ['manager', 'accountant', 'cskh'].includes(currentUser?.role);

  if (!isDirector && !isReporter) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Daily reports submit and read section for owners/director */}
      {isDirector && (
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
          <h3 className="text-xs font-black text-brand-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-brand-accent-secondary" />
            Báo cáo vận hành tổng hợp toàn công ty
          </h3>
          <p className="text-[10px] text-brand-muted mb-4">
            Các báo cáo cuối ca từ Quản lý chi nhánh và Kế toán trưởng.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unread */}
            <div className="space-y-3">
              <span className="text-[9px] font-black text-brand-warning uppercase tracking-widest block">
                Chưa đọc ({dailyReports.filter((r) => r.status === 'unread').length})
              </span>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {dailyReports
                  .filter((r) => r.status === 'unread')
                  .map((rep) => {
                    const isExpanded = viewingReportId === rep.id;
                    return (
                      <div key={rep.id} className="bg-brand-bg border border-brand-border rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] bg-brand-accent text-white px-2 py-0.5 rounded font-black tracking-wider uppercase">
                              {rep.branch}
                            </span>
                            <h4 className="text-xs font-bold text-brand-accent mt-1.5">{rep.title}</h4>
                          </div>
                          <button
                            onClick={() => {
                              if (isExpanded) setViewingReportId(null);
                              else {
                                setViewingReportId(rep.id);
                                markReportAsRead(rep.id);
                              }
                            }}
                            className="px-2.5 py-1 bg-brand-accent text-white text-[9px] font-black uppercase tracking-wider rounded-lg cursor-pointer"
                          >
                            {isExpanded ? 'Đóng' : 'Đọc'}
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-brand-border/60 text-xs text-brand-text whitespace-pre-line leading-relaxed font-medium">
                            {rep.content}
                          </div>
                        )}
                      </div>
                    );
                  })}
                {dailyReports.filter((r) => r.status === 'unread').length === 0 && (
                  <p className="text-xs text-brand-muted italic py-6 text-center">Đã xem hết báo cáo!</p>
                )}
              </div>
            </div>

            {/* Read */}
            <div className="space-y-3">
              <span className="text-[9px] font-black text-brand-success uppercase tracking-widest block">
                Đã đọc ({dailyReports.filter((r) => r.status === 'read').length})
              </span>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {dailyReports
                  .filter((r) => r.status === 'read')
                  .map((rep) => {
                    const isExpanded = viewingReportId === rep.id;
                    return (
                      <div key={rep.id} className="bg-brand-bg/40 border border-brand-border/60 rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] bg-brand-muted text-white px-2 py-0.5 rounded font-black tracking-wider uppercase">
                              {rep.branch}
                            </span>
                            <h4 className="text-xs font-bold text-brand-muted mt-1.5">{rep.title}</h4>
                          </div>
                          <button
                            onClick={() => setViewingReportId(isExpanded ? null : rep.id)}
                            className="px-2.5 py-1 bg-brand-bg text-brand-muted text-[9px] font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                          >
                            {isExpanded ? 'Đóng' : 'Xem'}
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-brand-border/60 text-xs text-brand-text whitespace-pre-line leading-relaxed font-medium">
                            {rep.content}
                            <p className="text-[8px] text-brand-success font-black mt-2">Đã xem lúc: {rep.readAt}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff View: Submit reports to Boss */}
      {isReporter && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
            <h3 className="text-xs font-black text-brand-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-brand-accent-secondary" />
              Gửi báo cáo vận hành cuối ca
            </h3>
            <p className="text-[10px] text-brand-muted mb-4">Soạn báo cáo tổng hợp công việc để sếp Bảo kiểm duyệt.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const title = (form.elements.namedItem('reportTitle') as HTMLInputElement).value;
                const content = (form.elements.namedItem('reportContent') as HTMLTextAreaElement).value;
                if (title && content) {
                  submitDailyReport(title, content);
                  form.reset();
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[9px] font-black uppercase text-brand-muted block mb-1">Tiêu đề báo cáo</label>
                <input
                  name="reportTitle"
                  required
                  placeholder="Ví dụ: Báo cáo tài chính hoặc tình hình kho Quận 1..."
                  className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-brand-accent bg-brand-bg font-bold text-brand-text focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-brand-muted block mb-1">Nội dung báo cáo chi tiết</label>
                <textarea
                  name="reportContent"
                  required
                  rows={4}
                  placeholder="Điền chi tiết các sự vụ phát sinh, số liệu quyết toán két, đề xuất điều chuyển..."
                  className="w-full px-3 py-2.5 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-brand-accent bg-brand-bg text-brand-text focus:bg-white resize-none font-medium transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md"
              >
                Gửi báo cáo lên Giám đốc
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm flex flex-col">
            <h3 className="text-xs font-black text-brand-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-success" />
              Lịch sử báo cáo đã nộp
            </h3>
            <p className="text-[10px] text-brand-muted mb-4">Các báo cáo đã gửi từ tài khoản của bạn.</p>
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 flex-grow">
              {dailyReports
                .filter((r) => r.userId === currentUser.id)
                .map((rep) => (
                  <div key={rep.id} className="p-3 bg-brand-bg border border-brand-border rounded-xl text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-brand-accent">{rep.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          rep.status === 'unread'
                            ? 'bg-brand-warning/10 text-brand-warning'
                            : 'bg-brand-success/10 text-brand-success'
                        }`}
                      >
                        {rep.status === 'unread' ? 'Chưa đọc' : 'Đã xem'}
                      </span>
                    </div>
                    <p className="text-[9px] text-brand-muted mt-1">Ngày gửi: {rep.createdAt}</p>
                    {rep.readAt && (
                      <p className="text-[9px] text-brand-success font-bold mt-1">Đã xem lúc: {rep.readAt}</p>
                    )}
                  </div>
                ))}
              {dailyReports.filter((r) => r.userId === currentUser.id).length === 0 && (
                <p className="text-xs text-brand-muted italic py-12 text-center">Bạn chưa nộp báo cáo nào.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
