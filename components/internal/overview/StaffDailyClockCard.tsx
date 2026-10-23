'use client';

import React from 'react';
import { Play, Megaphone, Clock, CheckCircle2 } from 'lucide-react';

interface StaffDailyClockCardProps {
  currentUser: any;
  personalShifts: any[];
  announcements: any[];
  liveTime: string;
  personalAttendance: any[];
  attendanceChecklist: Record<string, boolean>;
  setAttendanceChecklist: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  attendanceClosingChecklist: Record<string, boolean>;
  setAttendanceClosingChecklist: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  checkIn: (checklist: any, isGPSCorrect: boolean, isQRScanned: boolean) => void;
  checkOut: (checklist: any) => void;
  isGPSCorrect: boolean;
  isQRScanned: boolean;
  setActiveTab: (tab: string) => void;
}

export default function StaffDailyClockCard({
  currentUser,
  personalShifts,
  announcements,
  liveTime,
  personalAttendance,
  attendanceChecklist,
  setAttendanceChecklist,
  attendanceClosingChecklist,
  setAttendanceClosingChecklist,
  checkIn,
  checkOut,
  isGPSCorrect,
  isQRScanned,
  setActiveTab
}: StaffDailyClockCardProps) {
  const filteredAnnouncements = announcements.filter((ann: any) => {
    if (currentUser?.role === 'director') return true;
    if (ann.recipientType === 'all') return true;
    if (ann.recipientType === 'accountant' && (currentUser?.role === 'accountant' || currentUser?.role === 'director')) return true;
    if (ann.recipientType === 'branch_q1' && (currentUser?.branch === 'Chi nhánh Quận 1' || currentUser?.role === 'director')) return true;
    if (ann.recipientType === 'branch_td' && (currentUser?.branch === 'Chi nhánh Thảo Điền' || currentUser?.role === 'director')) return true;
    return false;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = personalAttendance.find((log) => log.date === todayStr);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Quick stats for sales employee */}
      <div className="lg:col-span-8 space-y-6">
        {/* Shortcut Pos buttons & Performance */}
        <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-black text-brand-accent uppercase tracking-wider mb-4">Lối tắt bán hàng POS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('pos-sales')}
              className="p-6 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl flex items-center justify-between group transition-all duration-300 shadow-md active:scale-[0.98] cursor-pointer"
            >
              <div className="text-left">
                <span className="text-sm font-black uppercase tracking-wider block">Mở quầy bán POS</span>
                <span className="text-[10px] text-brand-accent-secondary font-bold block mt-1">Lập hóa đơn và thanh toán nhanh</span>
              </div>
              <Play className="w-6 h-6 text-brand-accent-secondary group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="bg-brand-bg p-5 rounded-xl border border-brand-border flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black text-brand-muted uppercase tracking-wider block mb-1">Ca trực hôm nay</span>
                <span className="text-xs font-black text-brand-accent">
                  {personalShifts.length > 0
                    ? `${personalShifts[0].date} (Ca: ${personalShifts[0].shiftType})`
                    : 'Không có ca làm hôm nay'}
                </span>
              </div>
              <div className="border-t border-brand-border pt-2.5 mt-2.5 flex justify-between items-center text-[10px]">
                <span className="font-bold text-brand-muted">Mã nhân sự:</span>
                <span className="font-black font-mono text-brand-accent">{currentUser?.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Panel */}
        <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-black text-brand-accent uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Megaphone className="w-4 h-4 text-brand-warning shrink-0" />
            Thông báo từ ban quản lý
          </h3>
          <div className="space-y-4">
            {filteredAnnouncements.slice(0, 5).map((ann: any) => (
              <div key={ann.id} className="bg-brand-bg/50 border border-brand-border p-4 rounded-xl">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs font-bold text-brand-accent">{ann.title}</h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                    {ann.recipientType === 'all'
                      ? 'Toàn hệ thống'
                      : ann.recipientType === 'branch_q1'
                      ? 'Showroom Q.1'
                      : ann.recipientType === 'branch_td'
                      ? 'Showroom Thảo Điền'
                      : 'Phòng Kế toán'}
                  </span>
                </div>
                <p className="text-[11px] text-brand-muted leading-relaxed whitespace-pre-line">{ann.content}</p>
                <span className="text-[8px] text-brand-muted font-bold block mt-2">
                  Người gửi: {ann.senderName} • {ann.createdAt}
                </span>
              </div>
            ))}
            {filteredAnnouncements.length === 0 && (
              <p className="text-xs text-brand-muted italic text-center py-6">Hôm nay không có thông tri mới.</p>
            )}
          </div>
        </div>
      </div>

      {/* Clock In / Out Area */}
      <div className="lg:col-span-4 bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-black text-brand-accent uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-brand-accent-secondary" />
          Điểm danh & Chấm công
        </h3>

        <div className="text-center py-4 space-y-4">
          <span className="text-2xl font-black font-mono text-brand-accent tracking-widest block">{liveTime}</span>
          <p className="text-[10px] text-brand-muted font-bold uppercase">Thời gian thực tế hệ thống</p>

          {/* Active attendance log state */}
          {!todayLog ? (
            <div className="space-y-4">
              {/* Check-in Checklist */}
              <div className="text-left bg-brand-bg border border-brand-border p-3.5 rounded-xl text-xs space-y-2">
                <span className="text-[9px] font-black uppercase text-brand-muted block mb-1">Checklist đầu ca</span>
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attendanceChecklist.cleanShelves}
                    onChange={(e) => setAttendanceChecklist((prev) => ({ ...prev, cleanShelves: e.target.checked }))}
                    className="rounded text-brand-accent accent-brand-accent cursor-pointer"
                  />
                  <span>Vệ sinh quầy kệ và khu trưng bày</span>
                </label>
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attendanceChecklist.alignProducts}
                    onChange={(e) => setAttendanceChecklist((prev) => ({ ...prev, alignProducts: e.target.checked }))}
                    className="rounded text-brand-accent accent-brand-accent cursor-pointer"
                  />
                  <span>Chỉnh đốn phom sản phẩm treo móc</span>
                </label>
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attendanceChecklist.checkDrawer}
                    onChange={(e) => setAttendanceChecklist((prev) => ({ ...prev, checkDrawer: e.target.checked }))}
                    className="rounded text-brand-accent accent-brand-accent cursor-pointer"
                  />
                  <span>Kiểm đếm tiền lẻ két bàn thu ngân</span>
                </label>
              </div>

              <button
                onClick={() => checkIn(attendanceChecklist, isGPSCorrect, isQRScanned)}
                className="w-full py-3 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md shadow-brand-accent/10"
              >
                ✓ Chấm công VÀO ca
              </button>
            </div>
          ) : todayLog && !todayLog.checkOut ? (
            <div className="space-y-4">
              <div className="bg-brand-success/5 border border-brand-success/20 p-3.5 rounded-xl text-left text-xs">
                <span className="font-bold text-brand-success flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Đã CHẤM VÀO lúc: {todayLog.checkIn}
                </span>
                {todayLog.status === 'late' && (
                  <span className="text-[10px] text-brand-warning font-bold bg-brand-warning/10 px-2 py-0.5 rounded border border-brand-warning/20 inline-block mt-0.5">
                    ⏰ Đi trễ: Đối chiếu ca trực trễ giờ
                  </span>
                )}
              </div>

              {/* Check-out Checklist */}
              <div className="text-left bg-brand-bg border border-brand-border p-3.5 rounded-xl text-xs space-y-2">
                <span className="text-[9px] font-black uppercase text-brand-muted block mb-1">Checklist cuối ca</span>
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attendanceClosingChecklist.cashAudit}
                    onChange={(e) => setAttendanceClosingChecklist((prev) => ({ ...prev, cashAudit: e.target.checked }))}
                    className="rounded text-brand-accent accent-brand-accent cursor-pointer"
                  />
                  <span>Quyết toán tiền và đối soát két bán hàng</span>
                </label>
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attendanceClosingChecklist.cleanWorkspace}
                    onChange={(e) => setAttendanceClosingChecklist((prev) => ({ ...prev, cleanWorkspace: e.target.checked }))}
                    className="rounded text-brand-accent accent-brand-accent cursor-pointer"
                  />
                  <span>Dọn dẹp vệ sinh khu vực làm việc</span>
                </label>
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attendanceClosingChecklist.turnOffAppliances}
                    onChange={(e) => setAttendanceClosingChecklist((prev) => ({ ...prev, turnOffAppliances: e.target.checked }))}
                    className="rounded text-brand-accent accent-brand-accent cursor-pointer"
                  />
                  <span>Tắt đèn, máy lạnh và các thiết bị điện</span>
                </label>
              </div>

              <button
                onClick={() => checkOut(attendanceClosingChecklist)}
                className="w-full py-3 bg-brand-danger hover:bg-brand-danger/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md shadow-brand-danger/10"
              >
                ✗ Chấm công RA ca
              </button>
            </div>
          ) : (
            <div className="bg-brand-success/10 border border-brand-success/30 p-5 rounded-xl text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-brand-success mx-auto mb-1" />
              <span className="font-black text-brand-success block">ĐÃ HOÀN THÀNH CHẤM CÔNG HÔM NAY!</span>
              <p className="text-[10px] text-brand-muted leading-relaxed">
                Thời gian check-in: {todayLog.checkIn} <br />
                Thời gian check-out: {todayLog.checkOut}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
