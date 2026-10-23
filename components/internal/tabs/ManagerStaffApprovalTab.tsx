'use client';

import React from 'react';

export interface ManagerStaffApprovalTabProps {
  currentUser: any;
  selectedBranch?: string;
  leaveRequests: any[];
  attendanceLogs: any[];
  shiftRequests: any[];
  approveLeaveRequest: (id: string, status: 'approved' | 'rejected', reviewNote?: string) => void;
}

export default function ManagerStaffApprovalTab({
  currentUser,
  selectedBranch = 'all',
  leaveRequests,
  attendanceLogs,
  shiftRequests,
  approveLeaveRequest,
}: ManagerStaffApprovalTabProps) {
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

  const branchLogs = attendanceLogs
    .filter((log: any) => {
      if (currentUser.role === 'director') {
        return selectedBranch === 'all' || log.branch === selectedBranch;
      }
      return log.branch === currentUser.branch;
    })
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

  const pendingLeaves = leaveRequests
    .filter((req: any) => {
      if (currentUser.role === 'director') {
        return selectedBranch === 'all' || req.branch === selectedBranch;
      }
      return req.branch === currentUser.branch;
    })
    .filter((req: any) => req.status === 'pending');

  return (
    <div>
      <h3 className="text-lg font-black text-neutral-950 tracking-tight mb-2 uppercase">Lập lịch Ca trực & Duyệt hành chính</h3>
      <p className="text-xs text-neutral-400 mb-8">Chủ động phân công ca làm chính thức cho nhân viên chi nhánh (chốt ngay) và xét duyệt đơn xin nghỉ phép.</p>

      {/* Manager Leave request approval */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm mb-8">
        <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-4">Đơn xin nghỉ phép của nhân sự chi nhánh chờ duyệt</h4>
        <div className="overflow-x-auto max-h-[300px] pr-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                <th className="p-3">Nhân sự</th>
                <th className="p-3">Ngày xin nghỉ</th>
                <th className="p-3">Lý do</th>
                <th className="p-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
              {pendingLeaves.map((req: any) => (
                <tr key={req.id} className="hover:bg-neutral-50/20 transition-colors">
                  <td className="p-3">
                    <span className="font-bold text-neutral-900 block">{req.name}</span>
                    <span className="text-[8px] text-neutral-400 uppercase font-mono">{req.role}</span>
                  </td>
                  <td className="p-3 font-mono">{req.startDate} đến {req.endDate}</td>
                  <td className="p-3 text-neutral-600 italic font-medium">{req.reason}</td>
                  <td className="p-3 text-right flex justify-end gap-2 pt-4">
                    <button
                      onClick={() => approveLeaveRequest(req.id, 'approved', 'Đồng ý đơn xin nghỉ')}
                      className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 text-[9px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      Phê duyệt
                    </button>
                    <button
                      onClick={() => approveLeaveRequest(req.id, 'rejected', 'Không phê duyệt')}
                      className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-250 text-[9px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      Bác bỏ
                    </button>
                  </td>
                </tr>
              ))}
              {pendingLeaves.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-neutral-400 italic">Không có đơn xin phép nào đang chờ duyệt.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance history log for branch */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide">
            Nhật ký chấm công — {currentUser.role === 'director' ? (selectedBranch === 'all' ? 'Tất cả chi nhánh' : `Chi nhánh ${selectedBranch}`) : `Chi nhánh ${currentUser.branch}`}
          </h4>
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
                <th className="p-3">Nhân sự</th>
                <th className="p-3">Ngày</th>
                <th className="p-3 text-center">Check-in</th>
                <th className="p-3 text-center">Check-out</th>
                <th className="p-3 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
              {branchLogs.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-neutral-400 italic">Chưa có dữ liệu chấm công.</td></tr>
              )}
              {branchLogs.map((log: any) => {
                const status = getStatus(log);
                const isInvalid = status === 'invalid';
                return (
                  <tr key={log.id} className={`hover:bg-neutral-50/20 transition-colors ${isInvalid ? 'opacity-50' : ''}`}>
                    <td className="p-3">
                      <span className="font-bold text-neutral-900 block">{log.name}</span>
                      <span className="text-[8px] text-neutral-400 uppercase font-mono">{log.role}</span>
                    </td>
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
