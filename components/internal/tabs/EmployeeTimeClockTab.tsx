'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  MapPin,
  AlertTriangle,
  Check,
  CheckCircle2,
  QrCode,
  Sliders,
  X,
} from 'lucide-react';

export interface EmployeeTimeClockTabProps {
  currentUser: any;
  selectedBranch: string;
  shiftRequests: any[];
  shiftSwapRequests: any[];
  attendanceLogs: any[];
  checkIn: () => void;
  checkOut: () => void;
  submitSwapRequest: (fromShiftId: string, toShiftId: string) => void;
  respondToSwapRequest: (swapId: string, status: 'approved' | 'rejected') => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  liveTime?: string;
}

export default function EmployeeTimeClockTab({
  currentUser,
  selectedBranch,
  shiftRequests,
  shiftSwapRequests,
  attendanceLogs,
  checkIn,
  checkOut,
  submitSwapRequest,
  respondToSwapRequest,
  showToast,
  liveTime,
}: EmployeeTimeClockTabProps) {
  const [schedWeekOffset, setSchedWeekOffset] = useState(0);
  const [swapModal, setSwapModal] = useState<{ fromShiftId: string } | null>(null);
  const [isGPSCorrect, setIsGPSCorrect] = useState(true);
  const [isQRScanned, setIsQRScanned] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [attendanceChecklist, setAttendanceChecklist] = useState({
    cleanShelves: false,
    alignProducts: false,
    checkDrawer: false,
  });
  const [attendanceClosingChecklist, setAttendanceClosingChecklist] = useState({
    cashAudit: false,
    cleanWorkspace: false,
    turnOffAppliances: false,
  });

  const today = new Date();
  today.setDate(today.getDate() + schedWeekOffset * 7);
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(today.getDate() + diffToMonday);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const shiftTypes = ['morning', 'afternoon', 'evening'] as const;
  const shiftEmoji: Record<string, string> = { morning: '🌅', afternoon: '☀️', evening: '🌙' };
  const shiftLabel: Record<string, string> = { morning: 'Sáng', afternoon: 'Chiều', evening: 'Tối' };
  const shiftTime: Record<string, string> = { morning: '08–13h', afternoon: '13–18h', evening: '18–23h' };

  const userBranch = currentUser.branch || (selectedBranch !== 'all' ? selectedBranch : 'Chi nhánh Quận 1');
  const approvedShifts = shiftRequests.filter(
    (s: any) => (s.branch === userBranch || (!currentUser.branch && selectedBranch === 'all')) && s.status === 'approved'
  );

  const getShiftsForSlot = (date: Date, type: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return approvedShifts.filter((s: any) => s.date === dateStr && s.shiftType === type);
  };

  const weekDatesStr = weekDays.map((d) => d.toISOString().split('T')[0]);
  const swapCandidates = approvedShifts.filter(
    (s: any) => s.userId !== currentUser.id && weekDatesStr.includes(s.date)
  );

  const SHIFT_START: Record<string, string> = {
    morning: '08:00',
    afternoon: '13:00',
    evening: '18:00',
  };

  const getStatus = (log: any) => {
    if (!log.timeIn || !log.timeOut) return 'invalid';
    const assignedShift = shiftRequests.find(
      (s: any) => s.userId === log.userId && s.date === log.date && s.status === 'approved'
    );
    if (!assignedShift) return 'no_shift';
    const startRequired = SHIFT_START[assignedShift.shiftType] || '08:00';
    return log.timeIn > startRequired ? 'late' : 'on_time';
  };

  const myLogs = attendanceLogs
    .filter((log: any) => log.userId === currentUser.id)
    .sort((a: any, b: any) => b.date.localeCompare(a.date));

  const statusBadge = (status: string) => {
    switch (status) {
      case 'late':
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wider">⏰ Đi muộn</span>;
      case 'invalid':
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider">✗ Không tính</span>;
      case 'no_shift':
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-neutral-100 text-neutral-500 border border-neutral-200 uppercase tracking-wider">— Chưa xếp ca</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wider">✓ Đúng giờ</span>;
    }
  };

  const isCheckInEnabled = isGPSCorrect && isQRScanned && Object.values(attendanceChecklist).every(Boolean);
  const isCheckOutEnabled = Object.values(attendanceClosingChecklist).every(Boolean);

  return (
    <div>
      <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Ca làm việc & Điểm danh</h3>
      <p className="text-xs text-neutral-400 mb-8">Theo dõi lịch làm việc chính thức do Quản lý phân công và thực hiện chấm công định kỳ.</p>

      {/* WEEKLY SHIFT GRID */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide">Tổng quan lịch làm toàn chi nhánh</h4>
            <p className="text-[10px] text-neutral-450 mt-1">Chi nhánh: <span className="font-bold text-neutral-700">{currentUser.branch || userBranch}</span> • Rà soát lịch làm đồng nghiệp & Gửi yêu cầu đổi ca trực tiếp</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSchedWeekOffset((w) => w - 1)} className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-white text-[10px] font-bold hover:bg-neutral-50 cursor-pointer">← Trước</button>
            <button onClick={() => setSchedWeekOffset(0)} className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white text-[10px] font-bold hover:bg-neutral-800 cursor-pointer">Tuần này</button>
            <button onClick={() => setSchedWeekOffset((w) => w + 1)} className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-white text-[10px] font-bold hover:bg-neutral-50 cursor-pointer">Sau →</button>
          </div>
        </div>

        <div className="overflow-x-auto border border-neutral-100 rounded-2xl mb-6">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-neutral-50 text-neutral-550 font-bold border-b border-neutral-150 uppercase tracking-wider text-[8px]">
                <th className="p-3 w-1/8 text-center bg-neutral-100/50">Ca làm</th>
                {weekDays.map((d, i) => (
                  <th key={i} className="p-3 text-center w-1/8 border-l border-neutral-100">
                    <span className="block text-[8px] text-neutral-450 font-black">{dayNames[i]}</span>
                    <span className="block text-[10px] font-mono mt-0.5 text-neutral-800">{d.toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' })}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {shiftTypes.map((type) => (
                <tr key={type} className="hover:bg-neutral-50/10">
                  <td className="p-3 text-center font-bold bg-neutral-50/30">
                    <span className="block text-[10px] font-black">{shiftEmoji[type]} {shiftLabel[type]}</span>
                    <span className="block text-[8px] text-neutral-400 font-mono mt-0.5">{shiftTime[type]}</span>
                  </td>
                  {weekDays.map((d, i) => {
                    const slots = getShiftsForSlot(d, type);
                    return (
                      <td key={i} className="p-2 border-l border-neutral-100 align-top min-h-[70px]">
                        <div className="space-y-1">
                          {slots.map((s: any) => {
                            const isMe = s.userId === currentUser.id;
                            return (
                              <div
                                key={s.id}
                                className={`group relative p-1.5 rounded-xl border text-[9px] font-bold text-center transition-all ${
                                  isMe ? 'bg-sky-500 border-sky-600 text-white shadow-sm' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                                }`}
                              >
                                <span className="block truncate">{s.name}</span>
                                {isMe && (
                                  <button
                                    type="button"
                                    onClick={() => setSwapModal({ fromShiftId: s.id })}
                                    className="absolute inset-0 w-full h-full rounded-xl bg-neutral-900/90 text-white text-[8px] font-black items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex"
                                    title="Yêu cầu đổi ca trực này"
                                  >
                                    🔄 Xin đổi ca
                                  </button>
                                )}
                              </div>
                            );
                          })}
                          {slots.length === 0 && (
                            <span className="block text-center text-[8px] text-neutral-350 italic py-2">Trống</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[9px] text-neutral-400 font-medium mb-6 leading-relaxed bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
          💡 **Mẹo đổi ca**: Hover và nhấp chọn nút **&quot;🔄 Xin đổi ca&quot;** ở ca trực của bạn trong lưới tuần. Chọn ca muốn đổi của đồng nghiệp khác, hệ thống sẽ gửi yêu cầu trực tiếp đến tài khoản của họ để duyệt tráo đổi ca trực tự động.
        </p>

        {/* SWAP MODAL */}
        <AnimatePresence>
          {swapModal && (() => {
            const myShift = shiftRequests.find((s: any) => s.id === swapModal.fromShiftId);
            if (!myShift) return null;

            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={(e) => { if (e.target === e.currentTarget) setSwapModal(null); }}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-3xl shadow-2xl border border-neutral-100 w-full max-w-md overflow-hidden"
                >
                  <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <div>
                      <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wide">Yêu cầu đổi ca trực</h4>
                      <p className="text-[10px] text-neutral-400">Ca hiện tại của bạn: Ca {shiftLabel[myShift.shiftType]} ({myShift.date})</p>
                    </div>
                    <button onClick={() => setSwapModal(null)} className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="text-[8px] font-bold text-neutral-450 uppercase block mb-2">Chọn ca trực của đồng nghiệp muốn đổi lấy</label>
                      <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2">
                        {swapCandidates.map((cand: any) => (
                          <button
                            key={cand.id}
                            type="button"
                            onClick={() => {
                              submitSwapRequest(myShift.id, cand.id);
                              setSwapModal(null);
                            }}
                            className="w-full p-3 rounded-2xl border border-neutral-100 hover:border-neutral-350 hover:bg-neutral-50/50 text-left transition-all text-xs font-medium block cursor-pointer"
                          >
                            <div className="flex justify-between font-bold text-neutral-900">
                              <span>{cand.name}</span>
                              <span className="text-[10px] font-mono text-neutral-500">{cand.date}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-neutral-500 mt-1">
                              <span>Ca {shiftLabel[cand.shiftType]} ({shiftTime[cand.shiftType]})</span>
                              <span className="text-[8px] px-2 py-0.5 rounded-full bg-neutral-100 font-bold uppercase tracking-wider">Chọn đổi ca →</span>
                            </div>
                          </button>
                        ))}
                        {swapCandidates.length === 0 && (
                          <p className="text-center py-6 text-neutral-450 italic text-[11px]">Không có ca trực nào của đồng nghiệp khác trong tuần này.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* SWAP REQUESTS FEEDBACK */}
        <div className="mt-8 border-t border-neutral-50 pt-6">
          <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-4">Danh sách các yêu cầu đổi ca</h4>
          <div className="space-y-3">
            {shiftSwapRequests
              .filter((s: any) => s.toUserId === currentUser.id && s.status === 'pending')
              .map((req: any) => (
                <div key={req.id} className="bg-gradient-to-br from-amber-50/50 to-amber-100/10 p-4 rounded-2xl border border-amber-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs font-medium text-neutral-700">
                    <span className="font-bold text-neutral-900">{req.fromUserName}</span> muốn đổi ca{' '}
                    <span className="font-black text-indigo-700 font-mono">Ca {shiftLabel[req.fromShiftType]} ({req.fromShiftDate})</span>{' '}
                    lấy ca{' '}
                    <span className="font-black text-sky-600 font-mono">Ca {shiftLabel[req.toShiftType]} ({req.toShiftDate})</span>{' '}
                    của bạn.
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => respondToSwapRequest(req.id, 'approved')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Đồng ý
                    </button>
                    <button
                      onClick={() => respondToSwapRequest(req.id, 'rejected')}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}

            {shiftSwapRequests
              .filter((s: any) => s.fromUserId === currentUser.id && s.status === 'pending')
              .map((req: any) => (
                <div key={req.id} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/50 flex items-center justify-between text-xs font-medium text-neutral-600">
                  <div>
                    Bạn đã đề xuất đổi ca{' '}
                    <span className="font-bold text-sky-600">Ca {shiftLabel[req.fromShiftType]} ({req.fromShiftDate})</span>{' '}
                    lấy ca{' '}
                    <span className="font-bold text-indigo-700">Ca {shiftLabel[req.toShiftType]} ({req.toShiftDate})</span>{' '}
                    của đồng nghiệp <span className="font-bold text-neutral-900">{req.toUserName}</span>.
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-250 uppercase font-black tracking-wider">⏳ Chờ phản hồi</span>
                </div>
              ))}

            {shiftSwapRequests
              .filter(
                (s: any) =>
                  (s.fromUserId === currentUser.id || s.toUserId === currentUser.id) &&
                  s.status !== 'pending'
              )
              .slice(0, 3)
              .map((req: any) => {
                const isApproved = req.status === 'approved';
                return (
                  <div key={req.id} className="bg-white p-3 rounded-xl border border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500 font-medium">
                    <div>
                      Yêu cầu đổi ca giữa bạn và <span className="font-bold text-neutral-900">{req.fromUserId === currentUser.id ? req.toUserName : req.fromUserName}</span> ({req.fromShiftDate} 🔄 {req.toShiftDate}).
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                      isApproved ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {isApproved ? '✓ Đã hoàn tất' : '✗ Bị từ chối'}
                    </span>
                  </div>
                );
              })}

            {shiftSwapRequests.filter((s: any) => s.fromUserId === currentUser.id || s.toUserId === currentUser.id).length === 0 && (
              <p className="text-center py-6 text-neutral-450 italic text-[11px]">Chưa phát sinh yêu cầu đổi ca trực nào.</p>
            )}
          </div>
        </div>
      </div>

      {/* INLINE CSS FOR SCANNER AND RADAR */}
      <style>{`
        @keyframes scanLaser {
          0%, 100% { top: 0%; opacity: 0.3; }
          50% { top: 100%; opacity: 1; }
        }
        @keyframes mapPulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 0.3; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        .animate-scan-laser {
          position: absolute;
          width: 100%;
          height: 4px;
          background: linear-gradient(to right, transparent, #10b981, transparent);
          box-shadow: 0 0 10px #10b981, 0 0 20px #10b981;
          animation: scanLaser 2.2s ease-in-out infinite;
        }
        .animate-map-pulse {
          animation: mapPulse 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
      `}</style>

      {/* BENTO GRID: GPS & SCANNER & CHECKLISTS + CLOCK WIDGET */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* BENTO BLOCK 1: GPS Range & Store QR Scanner & Checklists (Col Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
            <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-5 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-neutral-600" />
              Trung tâm kiểm soát chấm công thông minh (GPS & QR)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* GPS Validation Panel with pulsing radar mini-map */}
              <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-neutral-150/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Tọa độ GPS Showroom</span>
                    {isGPSCorrect ? (
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" /> TRONG PHẠM VI
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> NGOÀI PHẠM VI
                      </span>
                    )}
                  </div>

                  {/* Mini-map illustration using SVG */}
                  <div className="relative h-28 rounded-xl bg-neutral-900 overflow-hidden flex items-center justify-center border border-neutral-800 shadow-inner mb-3">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:14px_24px]" />
                    <div className="absolute w-24 h-24 rounded-full border border-neutral-850" />
                    <div className="absolute w-16 h-16 rounded-full border border-neutral-800" />
                    <div className="absolute w-8 h-8 rounded-full border border-neutral-750" />
                    
                    {isGPSCorrect && (
                      <div className="absolute w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 animate-map-pulse" />
                    )}
                    
                    <div className="absolute top-2 left-2 text-[8px] font-mono text-neutral-500">
                      LAT: {currentUser.branch === 'Chi nhánh Thảo Điền' ? '10.8015° N' : '10.7712° N'}<br />
                      LNG: {currentUser.branch === 'Chi nhánh Thảo Điền' ? '106.7288° E' : '106.6901° E'}
                    </div>
                    <div className="absolute bottom-2 right-2 text-[8px] font-bold text-neutral-450">
                      Chi nhánh: {currentUser.branch}
                    </div>

                    <div className="relative flex items-center justify-center">
                      {isGPSCorrect ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                          </div>
                          <span className="absolute -bottom-5 text-[8px] font-black text-emerald-450 uppercase whitespace-nowrap bg-neutral-950 px-1 py-0.5 rounded border border-neutral-800">NOVYN STORE (OK)</span>
                        </>
                      ) : (
                        <>
                          <div className="absolute w-2 h-2 rounded-full bg-emerald-500/50" />
                          <div className="translate-x-12 -translate-y-4 relative flex items-center justify-center">
                            <div className="w-3.5 h-3.5 rounded-full bg-rose-500/20 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" />
                            </div>
                            <span className="absolute -bottom-5 text-[8px] font-black text-rose-400 uppercase whitespace-nowrap bg-neutral-950 px-1 py-0.5 rounded border border-neutral-800">LỆCH TỌA ĐỘ (120m)</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsGPSCorrect(true);
                      showToast('Đã hiệu chỉnh & đồng bộ GPS trùng khớp tọa độ showroom!', 'success');
                    }}
                    className="flex-1 py-2 rounded-xl text-[10px] font-bold border border-neutral-250 hover:bg-neutral-50 bg-white text-neutral-800 transition-all cursor-pointer text-center"
                  >
                    🎯 Đồng bộ GPS
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsGPSCorrect(!isGPSCorrect);
                      showToast(isGPSCorrect ? 'Đã giả lập di chuyển ra xa showroom (Lệch tọa độ)' : 'Đã đưa thiết bị trở về vùng phủ sóng showroom', 'info');
                    }}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                      !isGPSCorrect ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                    }`}
                    title="Giả lập di chuyển ra ngoài showroom để test cảnh báo"
                  >
                    🚙 Giả lập
                  </button>
                </div>
              </div>

              {/* QR Code Scanner terminal simulator */}
              <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-neutral-150/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Quét QR tại Showroom</span>
                    {isQRScanned ? (
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> ĐÃ QUÉT
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
                        <QrCode className="w-2.5 h-2.5" /> CHƯA QUÉT
                      </span>
                    )}
                  </div>

                  <div className="h-28 rounded-xl bg-white border border-neutral-150 flex flex-col items-center justify-center p-3 text-center mb-3">
                    {isQRScanned ? (
                      <>
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 shadow-sm">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <p className="text-[9px] font-bold text-neutral-750">Mã QR Ca Trực Đã Được Xác Minh</p>
                        <p className="text-[7px] text-neutral-400 mt-0.5">Thời gian quét: {new Date().toLocaleTimeString('vi-VN')}</p>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-8 h-8 text-neutral-350 stroke-1 mb-1.5 animate-pulse" />
                        <p className="text-[9px] font-bold text-neutral-700">Yêu cầu quét QR tại quầy trưng bày</p>
                        <p className="text-[7px] text-neutral-400 mt-0.5">Xác nhận đúng ca làm & địa điểm vật lý</p>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isQRScanned) {
                      setIsQRScanned(false);
                      showToast('Đã xóa phiên quét QR cũ. Vui lòng quét lại!', 'info');
                    } else {
                      setShowQRScanner(true);
                    }
                  }}
                  className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                    isQRScanned 
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200' 
                      : 'bg-neutral-950 hover:bg-neutral-850 text-white shadow-sm'
                  }`}
                >
                  {isQRScanned ? 'Reset quét mã' : '📸 Quét mã QR ca làm'}
                </button>
              </div>

            </div>
          </div>

          {/* Interactive opening/closing checklists */}
          <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
            <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-neutral-600" />
              Checklist kiểm kê trước và sau ca làm
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Opening Checklist */}
              <div>
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block mb-3.5 pb-1.5 border-b border-neutral-100">
                  🌅 CHECKLIST ĐẦU CA (Yêu cầu trước Check-In)
                </span>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-100 hover:bg-neutral-50/50 transition-all text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attendanceChecklist.cleanShelves}
                      onChange={(e) => setAttendanceChecklist((prev) => ({ ...prev, cleanShelves: e.target.checked }))}
                      className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                    />
                    <div>
                      <span className="block font-bold text-neutral-800">Dọn dẹp quầy kệ & ma-nơ-canh</span>
                      <span className="block text-[9px] text-neutral-400 mt-0.5">Vệ sinh mặt bàn POS, lau chùi kính, phủi bụi tủ</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-100 hover:bg-neutral-50/50 transition-all text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attendanceChecklist.alignProducts}
                      onChange={(e) => setAttendanceChecklist((prev) => ({ ...prev, alignProducts: e.target.checked }))}
                      className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                    />
                    <div>
                      <span className="block font-bold text-neutral-800">Cân chỉnh móc áo & form sản phẩm</span>
                      <span className="block text-[9px] text-neutral-400 mt-0.5">Sắp xếp các size áo quần gọn gàng, ngay ngắn</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-100 hover:bg-neutral-50/50 transition-all text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attendanceChecklist.checkDrawer}
                      onChange={(e) => setAttendanceChecklist((prev) => ({ ...prev, checkDrawer: e.target.checked }))}
                      className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                    />
                    <div>
                      <span className="block font-bold text-neutral-800">Đếm tiền két & bàn giao tiền lẻ</span>
                      <span className="block text-[9px] text-neutral-400 mt-0.5">Đảm bảo két mặc định có 3,000,000đ tiền lẻ để trả khách</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Closing Checklist */}
              <div>
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block mb-3.5 pb-1.5 border-b border-neutral-100">
                  🌙 CHECKLIST CUỐI CA (Yêu cầu trước Check-Out)
                </span>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-100 hover:bg-neutral-50/50 transition-all text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attendanceClosingChecklist.cashAudit}
                      onChange={(e) => setAttendanceClosingChecklist((prev) => ({ ...prev, cashAudit: e.target.checked }))}
                      className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                    />
                    <div>
                      <span className="block font-bold text-neutral-800">Kiểm két đối soát tiền mặt cuối ca</span>
                      <span className="block text-[9px] text-neutral-400 mt-0.5">Đếm tiền mặt thực tế trùng khớp với doanh số báo trên hệ thống POS</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-100 hover:bg-neutral-50/50 transition-all text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attendanceClosingChecklist.cleanWorkspace}
                      onChange={(e) => setAttendanceClosingChecklist((prev) => ({ ...prev, cleanWorkspace: e.target.checked }))}
                      className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                    />
                    <div>
                      <span className="block font-bold text-neutral-800">Sắp xếp quầy & trả đồ thừa</span>
                      <span className="block text-[9px] text-neutral-400 mt-0.5">Thu gom đồ trả thử của khách móc lại vị trí cũ</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-100 hover:bg-neutral-50/50 transition-all text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attendanceClosingChecklist.turnOffAppliances}
                      onChange={(e) => setAttendanceClosingChecklist((prev) => ({ ...prev, turnOffAppliances: e.target.checked }))}
                      className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                    />
                    <div>
                      <span className="block font-bold text-neutral-800">Tắt máy POS, đèn & điều hòa showroom</span>
                      <span className="block text-[9px] text-neutral-400 mt-0.5">Đảm bảo an toàn phòng chống cháy nổ & tiết kiệm điện</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BENTO BLOCK 2: Clock Action Widget & Rules Checklist (Col Span 4) */}
        <div className="lg:col-span-4 bg-neutral-950 text-white p-6 rounded-3xl border border-neutral-800 shadow-md flex flex-col justify-between gap-6 min-h-[480px]">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-850">
              <div>
                <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest block mb-0.5">HỆ THỐNG ERP NOVYN</span>
                <h4 className="text-sm font-black uppercase tracking-wide">Trạm chấm công điện tử</h4>
              </div>
              <Clock className="w-5 h-5 text-sky-400 animate-spin" />
            </div>

            {/* Huge Digital Clock */}
            <div className="my-8 text-center bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-3xl font-black font-mono tracking-wider text-sky-400">
                {liveTime || new Date().toLocaleTimeString('vi-VN')}
              </span>
              <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-1">
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            {/* Clock-in validation criteria */}
            <div className="space-y-3.5">
              <span className="text-[8px] text-neutral-450 font-bold uppercase tracking-widest block">Điều kiện Check-In (Vào Ca)</span>
              
              <div className="flex items-center gap-2.5 text-xs font-medium">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  isGPSCorrect ? 'bg-emerald-500 text-neutral-950' : 'bg-rose-500 text-white'
                }`}>
                  {isGPSCorrect ? '✓' : '✗'}
                </span>
                <span className={isGPSCorrect ? 'text-neutral-200' : 'text-neutral-450 line-through'}>
                  Đồng bộ tọa độ GPS showroom
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs font-medium">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  isQRScanned ? 'bg-emerald-500 text-neutral-950' : 'bg-rose-500 text-white'
                }`}>
                  {isQRScanned ? '✓' : '✗'}
                </span>
                <span className={isQRScanned ? 'text-neutral-200' : 'text-neutral-450 line-through'}>
                  Quét xác nhận mã QR ca trực
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs font-medium">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  Object.values(attendanceChecklist).every(Boolean) ? 'bg-emerald-500 text-neutral-950' : 'bg-rose-500 text-white'
                }`}>
                  {Object.values(attendanceChecklist).every(Boolean) ? '✓' : '✗'}
                </span>
                <span className={Object.values(attendanceChecklist).every(Boolean) ? 'text-neutral-200' : 'text-neutral-450 line-through'}>
                  Hoàn thành checklist mở ca ({Object.values(attendanceChecklist).filter(Boolean).length}/3)
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-neutral-850 pt-5">
            {/* Check-In Button */}
            <div className="relative group">
              <button
                type="button"
                disabled={!isCheckInEnabled}
                onClick={checkIn}
                className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 text-center block ${
                  isCheckInEnabled 
                    ? 'bg-sky-500 text-white hover:bg-sky-600 shadow-md shadow-sky-500/10 cursor-pointer' 
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-750'
                }`}
              >
                Điểm danh VÀO (Check-In)
              </button>
              {!isCheckInEnabled && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-neutral-900 border border-neutral-800 p-2.5 rounded-lg text-[9px] font-bold text-neutral-400 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all text-center leading-normal">
                  ⚠️ Cần khớp GPS, quét QR cửa hàng & tích chọn đủ checklist để được chấm công vào.
                </div>
              )}
            </div>

            {/* Check-Out Button */}
            <div className="relative group">
              <button
                type="button"
                disabled={!isCheckOutEnabled}
                onClick={checkOut}
                className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 text-center block border ${
                  isCheckOutEnabled 
                    ? 'bg-neutral-900 border-neutral-700 text-white hover:bg-neutral-800 cursor-pointer' 
                    : 'bg-neutral-900 border-neutral-850 text-neutral-600 cursor-not-allowed'
                }`}
              >
                Điểm danh RA (Check-Out)
              </button>
              {!isCheckOutEnabled && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-neutral-900 border border-neutral-800 p-2.5 rounded-lg text-[9px] font-bold text-neutral-400 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all text-center leading-normal z-10">
                  ⚠️ Cần tích chọn hoàn thành Checklist cuối ca để chốt sổ ra về.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR SCANNER SIMULATOR MODAL */}
      <AnimatePresence>
        {showQRScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setShowQRScanner(false); }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="bg-neutral-950 text-white rounded-3xl shadow-2xl border border-neutral-850 w-full max-w-sm overflow-hidden p-6 text-center"
            >
              <div className="flex justify-between items-center pb-4 border-b border-neutral-850 mb-5">
                <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">NOVYN QR SCANNER v2.0</span>
                <button onClick={() => setShowQRScanner(false)} className="p-1 rounded-full hover:bg-neutral-900 text-neutral-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-neutral-400 mb-6">Di chuyển camera điện thoại hướng vào mã QR dán trên quầy cashier để nhận diện ca làm.</p>

              <div className="relative w-48 h-48 mx-auto bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden flex items-center justify-center mb-6">
                <div className="animate-scan-laser" />
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-emerald-500" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-emerald-500" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-500" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-emerald-500" />

                <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center shadow-md select-none opacity-80 hover:opacity-100 transition-opacity">
                  <Image 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NOVYN_WEAR_POS_CHECKIN_TOKEN" 
                    alt="Faux QR Token" 
                    width={120} 
                    height={120} 
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsQRScanned(true);
                    setShowQRScanner(false);
                    showToast('Đã quét mã QR và xác nhận ca trực thành công!', 'success');
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-neutral-950 text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  ✓ Xác nhận Quét Mã (Simulate)
                </button>
                <button
                  type="button"
                  onClick={() => setShowQRScanner(false)}
                  className="w-full py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ATTENDANCE LOG HISTORY */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide">Lịch sử chấm công chấm vân tay thực tế</h4>
          <div className="flex gap-2 text-[8px] font-bold">
            <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100">✓ Đúng giờ</span>
            <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-100">⏰ Muộn</span>
            <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded-lg border border-rose-100">✗ Không tính</span>
          </div>
        </div>
        <p className="text-[9px] text-neutral-400 mb-3 font-medium">• Đi sau giờ quy định → Đi muộn &nbsp;• Thiếu check-in hoặc check-out → Không tính công</p>
        <div className="overflow-x-auto max-h-[300px] pr-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                <th className="p-3">Ngày trực</th>
                <th className="p-3 text-center">Giờ Check-in</th>
                <th className="p-3 text-center">Giờ Check-out</th>
                <th className="p-3 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
              {myLogs.length === 0 && (
                <tr><td colSpan={4} className="text-center py-6 text-neutral-400 italic">Chưa phát sinh dữ liệu chấm công.</td></tr>
              )}
              {myLogs.map((log: any) => {
                const status = getStatus(log);
                const isInvalid = status === 'invalid';
                return (
                  <tr key={log.id} className={`hover:bg-neutral-50/20 transition-colors ${isInvalid ? 'opacity-50' : ''}`}>
                    <td className="p-3 font-bold text-neutral-900">{log.date}</td>
                    <td className="p-3 text-center">
                      {log.timeIn
                        ? <span className={`font-bold font-mono ${status === 'late' ? 'text-amber-600' : 'text-emerald-600'}`}>{log.timeIn}</span>
                        : <span className="text-rose-400 font-bold italic text-[9px]">Thiếu</span>
                      }
                    </td>
                    <td className="p-3 text-center">
                      {log.timeOut
                        ? <span className="font-bold font-mono text-neutral-600">{log.timeOut}</span>
                        : <span className="text-rose-400 font-bold italic text-[9px]">Thiếu</span>
                      }
                    </td>
                    <td className="p-3 text-right">{statusBadge(status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
