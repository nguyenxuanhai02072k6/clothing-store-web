'use client';

import React, { useState } from 'react';
import { Calendar, DollarSign } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface EmployeeRequestsTabProps {
  currentUser: any;
  leaveRequests: any[];
  salaryRequests: any[];
  submitLeaveRequest: (reason: string, startDate: string, endDate: string) => void;
  submitSalaryRequest: (proposedSalary: number, reason: string) => void;
}

export default function EmployeeRequestsTab({
  currentUser,
  leaveRequests,
  salaryRequests,
  submitLeaveRequest,
  submitSalaryRequest,
}: EmployeeRequestsTabProps) {
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');

  return (
    <div>
      <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Đơn từ & Đề xuất hành chính</h3>
      <p className="text-xs text-neutral-400 mb-8">Soạn đơn xin nghỉ phép gửi Quản lý chi nhánh duyệt hoặc gửi đề xuất xin tăng lương lên Ban giám đốc.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Leave proposal form */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex flex-col justify-between gap-5">
          <div>
            <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-neutral-600" />
              Soạn đơn xin nghỉ phép
            </h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (leaveReason && leaveStart && leaveEnd) {
                  submitLeaveRequest(leaveReason, leaveStart, leaveEnd);
                  setLeaveReason('');
                  setLeaveStart('');
                  setLeaveEnd('');
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Từ ngày</label>
                  <input
                    type="date"
                    required
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Đến ngày</label>
                  <input
                    type="date"
                    required
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Lý do xin nghỉ</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ghi rõ lý do chi tiết..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white resize-none focus:outline-none font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-850 active:scale-95 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                Gửi đơn xin nghỉ phép
              </button>
            </form>
          </div>
        </div>

        {/* Salary Proposal form */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex flex-col justify-between gap-5">
          <div>
            <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-neutral-600" />
              Đề xuất nguyện vọng tăng lương
            </h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const propSal = (e.currentTarget.elements as any).proposedSal.value;
                const reason = (e.currentTarget.elements as any).reason.value;
                if (propSal > 0 && reason) {
                  submitSalaryRequest(Number(propSal), reason);
                  e.currentTarget.reset();
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Mức lương mong muốn (VND)</label>
                <input
                  type="number"
                  name="proposedSal"
                  required
                  placeholder="Ví dụ: 10000000"
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Lý do & căn cứ đề xuất</label>
                <textarea
                  name="reason"
                  required
                  rows={3}
                  placeholder="Liệt kê thành tích làm việc xuất sắc..."
                  className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white resize-none focus:outline-none font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-850 active:scale-95 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                Gửi đề xuất tăng lương
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Historic personal HR requests list */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
        <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide mb-4">Lịch sử đơn từ & Đề xuất lương của cá nhân</h4>
        <div className="overflow-x-auto max-h-[300px] pr-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                <th className="p-3">Loại đơn</th>
                <th className="p-3">Nội dung đề xuất</th>
                <th className="p-3">Ngày gửi</th>
                <th className="p-3 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
              {/* Leaves */}
              {leaveRequests
                .filter((req: any) => req.userId === currentUser.id)
                .map((req: any) => (
                  <tr key={req.id} className="hover:bg-neutral-50/20 transition-colors">
                    <td className="p-3 font-bold text-neutral-900">Xin nghỉ phép</td>
                    <td className="p-3">
                      <span className="font-bold text-neutral-800">Từ {req.startDate} đến {req.endDate}</span>
                      <span className="text-[10px] text-neutral-455 block italic mt-0.5">{req.reason}</span>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-neutral-400">{req.createdAt}</td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                        req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {req.status === 'approved' ? 'Đã duyệt' : req.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                      </span>
                    </td>
                  </tr>
                ))}
              {/* Salaries */}
              {salaryRequests
                .filter((req: any) => req.userId === currentUser.id)
                .map((req: any) => (
                  <tr key={req.id} className="hover:bg-neutral-50/20 transition-colors">
                    <td className="p-3 font-bold text-neutral-900">Đề xuất tăng lương</td>
                    <td className="p-3">
                      <span className="font-bold text-emerald-600">Đề xuất: {formatPrice(req.proposedSalary)}</span>
                      <span className="text-[10px] text-neutral-455 block italic mt-0.5">{req.reason}</span>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-neutral-400">{req.createdAt}</td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                        req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {req.status === 'approved' ? 'Đã duyệt' : req.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
