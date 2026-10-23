'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle2 } from 'lucide-react';

export interface StaffShiftOverviewTabProps {
  currentUser: any;
  usersList: any[];
  shiftRequests: any[];
  leaveRequests: any[];
  addShiftDirectly: (employeeId: string, date: string, shiftType: 'morning' | 'afternoon' | 'evening', comment?: string) => void;
  deleteShiftRequest: (id: string) => void;
}

export default function StaffShiftOverviewTab({
  currentUser,
  usersList,
  shiftRequests,
  leaveRequests,
  addShiftDirectly,
  deleteShiftRequest,
}: StaffShiftOverviewTabProps) {
  const [schedWeekOffset, setSchedWeekOffset] = useState(0);
  const [shiftModal, setShiftModal] = useState<{
    date: string;
    shiftType: 'morning' | 'afternoon' | 'evening';
    employeeId: string;
    comment: string;
  } | null>(null);

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

  const shiftTypes = ['morning', 'afternoon', 'evening'] as const;
  const shiftColors: Record<string, string> = {
    morning: 'bg-sky-50 border-sky-200 text-sky-700',
    afternoon: 'bg-amber-50 border-amber-200 text-amber-700',
    evening: 'bg-indigo-900 border-indigo-700 text-indigo-100',
  };
  const shiftEmoji: Record<string, string> = { morning: '🌅', afternoon: '☀️', evening: '🌙' };
  const shiftLabel: Record<string, string> = { morning: 'Sáng', afternoon: 'Chiều', evening: 'Tối' };
  const shiftTime: Record<string, string> = { morning: '08–13h', afternoon: '13–18h', evening: '18–23h' };
  const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const branchEmployees = usersList.filter((u: any) => u.role === 'employee' && u.branch === currentUser.branch);
  const approvedShifts = shiftRequests.filter((s: any) => s.branch === currentUser.branch && s.status === 'approved');

  const getShiftsForSlot = (date: Date, type: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return approvedShifts.filter((s: any) => s.date === dateStr && s.shiftType === type);
  };

  const openModal = (date: Date, type: 'morning' | 'afternoon' | 'evening') => {
    setShiftModal({
      date: date.toISOString().split('T')[0],
      shiftType: type,
      employeeId: branchEmployees[0]?.id || '',
      comment: '',
    });
  };

  const handleSubmitShift = () => {
    if (!shiftModal || !shiftModal.employeeId) return;
    addShiftDirectly(shiftModal.employeeId, shiftModal.date, shiftModal.shiftType, shiftModal.comment);
    setShiftModal(null);
  };

  const weekAssigned = approvedShifts.filter((s: any) => weekDays.some(d => d.toISOString().split('T')[0] === s.date)).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-black text-neutral-950 tracking-tight uppercase">Tổng quan lịch ca tuần</h3>
          <p className="text-xs text-neutral-400 mt-1">Chi nhánh: <span className="font-bold text-neutral-700">{currentUser.branch}</span> • Click ô trống để xếp ca ngay</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSchedWeekOffset(w => w - 1)} className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-bold hover:bg-neutral-50 transition-all cursor-pointer">← Trước</button>
          <button onClick={() => setSchedWeekOffset(0)} className="px-3 py-1.5 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition-all cursor-pointer">Tuần này</button>
          <button onClick={() => setSchedWeekOffset(w => w + 1)} className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-bold hover:bg-neutral-50 transition-all cursor-pointer">Sau →</button>
        </div>
      </div>

      {/* Summary widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Ca đã xếp tuần này', value: weekAssigned, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Nhân viên chi nhánh', value: branchEmployees.length, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Ca còn trống', value: Math.max(0, 7 * 3 - weekAssigned), color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Đơn nghỉ chờ duyệt', value: leaveRequests.filter((r: any) => r.branch === currentUser.branch && r.status === 'pending').length, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((w) => (
          <div key={w.label} className={`${w.bg} rounded-2xl p-4 border border-white`}>
            <span className={`text-2xl font-black ${w.color}`}>{w.value}</span>
            <span className="block text-[9px] font-bold text-neutral-500 mt-0.5 uppercase tracking-wide">{w.label}</span>
          </div>
        ))}
      </div>

      {/* ===== INLINE SHIFT MODAL ===== */}
      <AnimatePresence>
        {shiftModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShiftModal(null); }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="bg-white rounded-3xl shadow-2xl border border-neutral-100 w-full max-w-md overflow-hidden"
            >
              {/* Modal header */}
              <div className={`px-6 py-5 flex items-center justify-between ${
                shiftModal.shiftType === 'morning' ? 'bg-sky-50 border-b border-sky-100' :
                shiftModal.shiftType === 'afternoon' ? 'bg-amber-50 border-b border-amber-100' :
                'bg-indigo-950 border-b border-indigo-900'
              }`}>
                <div>
                  <h4 className={`text-sm font-black uppercase tracking-wide ${shiftModal.shiftType === 'evening' ? 'text-white' : 'text-neutral-900'}`}>
                    {shiftEmoji[shiftModal.shiftType]} Xếp Ca {shiftLabel[shiftModal.shiftType]}
                  </h4>
                  <p className={`text-[10px] mt-0.5 font-semibold ${shiftModal.shiftType === 'evening' ? 'text-indigo-300' : 'text-neutral-500'}`}>
                    {shiftModal.date} • {shiftTime[shiftModal.shiftType]}
                  </p>
                </div>
                <button
                  onClick={() => setShiftModal(null)}
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${shiftModal.shiftType === 'evening' ? 'text-indigo-300 hover:bg-indigo-800' : 'text-neutral-400 hover:bg-neutral-200'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-5 space-y-4">
                {branchEmployees.length === 0 ? (
                  <p className="text-sm text-neutral-400 text-center py-4">Chưa có nhân viên nào thuộc chi nhánh này.</p>
                ) : (
                  <>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">Chọn nhân viên trực</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {branchEmployees.map((emp: any) => (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => setShiftModal(prev => prev ? { ...prev, employeeId: emp.id } : null)}
                            className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                              shiftModal.employeeId === emp.id
                                ? 'border-neutral-900 bg-neutral-50 shadow-sm'
                                : 'border-neutral-100 hover:border-neutral-300 bg-white'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                              {emp.name.split(' ').pop()?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-neutral-900 block truncate">{emp.name}</span>
                              <span className="text-[9px] text-neutral-400 font-mono">{emp.id}</span>
                            </div>
                            {shiftModal.employeeId === emp.id && (
                              <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0 ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">Ghi chú (tuỳ chọn)</label>
                      <input
                        type="text"
                        placeholder="Nhắc nhở nhân viên về ca này..."
                        value={shiftModal.comment}
                        onChange={(e) => setShiftModal(prev => prev ? { ...prev, comment: e.target.value } : null)}
                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-500 bg-neutral-50 focus:bg-white transition-all"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Modal footer */}
              <div className="px-6 pb-5 flex gap-2">
                <button
                  onClick={() => setShiftModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitShift}
                  disabled={!shiftModal.employeeId}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                >
                  ✓ Chốt ca ngay
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== WEEKLY GRID ===== */}
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="p-3 text-left text-[9px] font-black text-neutral-400 uppercase tracking-wider w-[110px]">Ca / Ngày</th>
                {weekDays.map((d, i) => {
                  const isToday = d.toDateString() === new Date().toDateString();
                  return (
                    <th key={i} className={`p-3 text-center text-[9px] font-black uppercase tracking-wider ${isToday ? 'bg-amber-50 text-amber-700' : 'text-neutral-400'}`}>
                      <span className="block">{dayNames[i]}</span>
                      <span className={`text-sm font-black block mt-0.5 ${isToday ? 'text-amber-600' : 'text-neutral-700'}`}>{d.getDate()}/{d.getMonth() + 1}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {shiftTypes.map((type) => (
                <tr key={type} className="border-b border-neutral-50 last:border-0">
                  {/* Row label */}
                  <td className="p-2 border-r border-neutral-50 align-middle">
                    <div className={`inline-flex flex-col items-center px-2 py-1.5 rounded-xl border text-center w-full ${shiftColors[type]}`}>
                      <span className="text-sm leading-none">{shiftEmoji[type]}</span>
                      <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">{shiftLabel[type]}</span>
                      <span className="text-[7px] opacity-70 font-mono">{shiftTime[type]}</span>
                    </div>
                  </td>

                  {/* Day cells */}
                  {weekDays.map((d, di) => {
                    const shifts = getShiftsForSlot(d, type);
                    const isEmpty = shifts.length === 0;
                    return (
                      <td key={di} className="p-1.5 align-top">
                        {isEmpty ? (
                          <button
                            type="button"
                            onClick={() => openModal(d, type)}
                            className="w-full h-full min-h-[60px] rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/40 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-rose-50 hover:border-rose-400 active:scale-95 transition-all group"
                            title={`Xếp ca ${shiftLabel[type]} ngày ${d.getDate()}/${d.getMonth() + 1}`}
                          >
                            <Plus className="w-3.5 h-3.5 text-rose-300 group-hover:text-rose-500 transition-colors" />
                            <span className="text-[7px] text-rose-300 group-hover:text-rose-500 font-bold">Trống</span>
                          </button>
                        ) : (
                          <div className="min-h-[60px] space-y-1">
                            {shifts.map((s: any) => (
                              <div key={s.id} className={`relative group rounded-xl border px-2 py-1.5 ${shiftColors[type]}`}>
                                <span className="text-[8px] font-bold block truncate">{s.name.split(' ').pop()}</span>
                                <span className="text-[7px] opacity-70 block truncate">{s.name.split(' ').slice(0, -1).join(' ')}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Hủy ca ${shiftLabel[type]} ngày ${s.date} của ${s.name}?`)) {
                                      deleteShiftRequest(s.id);
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full rounded-xl bg-rose-600/90 text-white text-[8px] font-black items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex"
                                  title="Xóa ca này"
                                >
                                  <X className="w-3 h-3" /> Hủy ca
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => openModal(d, type)}
                              className="w-full mt-0.5 py-1 rounded-lg border border-dashed border-neutral-200 text-neutral-300 hover:border-neutral-400 hover:text-neutral-500 text-[7px] font-bold flex items-center justify-center gap-0.5 cursor-pointer transition-all"
                              title="Thêm nhân viên vào ca này"
                            >
                              <Plus className="w-2.5 h-2.5" /> thêm
                            </button>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-[9px] font-bold text-neutral-400">
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded border-2 border-dashed border-rose-300 bg-rose-50" /> Click ô trống → xếp ca</span>
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-sky-100 border border-sky-200" /> Ca sáng 08:00–13:00</span>
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-100 border border-amber-200" /> Ca chiều 13:00–18:00</span>
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-900" /> Ca tối 18:00–23:00</span>
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-500" /> Hover vào nhân viên → hủy ca</span>
      </div>
    </div>
  );
}
