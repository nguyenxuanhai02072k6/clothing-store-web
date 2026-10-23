'use client';

import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface AccountantPayrollTabProps {
  currentUser: any;
  usersList: any[];
  attendanceLogs: any[];
  shiftRequests: any[];
  payrollRecords: any[];
  register: (name: string, email: string, pass: string, role: string, branch: string, phone: string) => void;
  deleteUser: (id: string) => void;
  addPayrollRecord: (userId: string, month: string, salary: number) => void;
  paySalary: (id: string) => void;
}

export default function AccountantPayrollTab({
  currentUser,
  usersList,
  attendanceLogs,
  shiftRequests,
  payrollRecords,
  register,
  deleteUser,
  addPayrollRecord,
  paySalary,
}: AccountantPayrollTabProps) {
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'employee' | 'manager' | 'accountant' | 'cskh'>('employee');
  const [newStaffBranch, setNewStaffBranch] = useState('Chi nhánh Quận 1');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  const [selectedPayrollUser, setSelectedPayrollUser] = useState('');
  const [newPayrollMonth, setNewPayrollMonth] = useState('2026-05');
  const [newPayrollSalary, setNewPayrollSalary] = useState(0);

  return (
    <div>
      <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Nhân sự & Lương bổng toàn doanh nghiệp</h3>
      <p className="text-xs text-neutral-400 mb-8">Đăng ký tài khoản cho nhân sự mới, cho nhân sự nghỉ việc, tạo bảng lương hàng tháng và phê duyệt thanh toán.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Register new employee form */}
        <div className="lg:col-span-1 bg-neutral-50 p-6 rounded-3xl border border-neutral-100">
          <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider mb-4 flex items-center gap-1">
            <PlusCircle className="w-4 h-4 text-neutral-600" />
            Đăng ký tài khoản nhân viên mới
          </h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newStaffName && newStaffEmail && newStaffPassword) {
                register(newStaffName, newStaffEmail, newStaffPassword, newStaffRole, newStaffBranch, newStaffPhone);
                setNewStaffName('');
                setNewStaffEmail('');
                setNewStaffPassword('');
                setNewStaffPhone('');
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-[8px] font-bold text-neutral-450 block mb-1">Tên nhân viên</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Nguyễn Văn A"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl text-xs bg-white focus:outline-none font-semibold text-neutral-800"
              />
            </div>
            <div>
              <label className="text-[8px] font-bold text-neutral-455 block mb-1">Email đăng nhập</label>
              <input
                type="email"
                required
                placeholder="staff@novynwear.com"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl text-xs bg-white focus:outline-none font-semibold text-neutral-805"
              />
            </div>
            <div>
              <label className="text-[8px] font-bold text-neutral-455 block mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newStaffPassword}
                onChange={(e) => setNewStaffPassword(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl text-xs bg-white focus:outline-none font-semibold"
              />
            </div>
            <div>
              <label className="text-[8px] font-bold text-neutral-455 block mb-1">Vai trò</label>
              <select
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border bg-white rounded-xl text-xs font-bold text-neutral-800"
              >
                <option value="employee">Nhân viên (Employee)</option>
                <option value="manager">Quản lý (Manager)</option>
                <option value="accountant">Kế toán (Accountant)</option>
                <option value="cskh">Chăm sóc khách hàng (CSKH)</option>
              </select>
            </div>
            {(newStaffRole === 'employee' || newStaffRole === 'manager') && (
              <div>
                <label className="text-[8px] font-bold text-neutral-455 block mb-1">Chi nhánh</label>
                <select
                  value={newStaffBranch}
                  onChange={(e) => setNewStaffBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 border bg-white rounded-xl text-xs font-bold text-neutral-800"
                >
                  <option value="Chi nhánh Quận 1">Chi nhánh Quận 1</option>
                  <option value="Chi nhánh Thảo Điền">Chi nhánh Thảo Điền</option>
                </select>
              </div>
            )}
            <div>
              <label className="text-[8px] font-bold text-neutral-455 block mb-1">Số điện thoại</label>
              <input
                type="text"
                placeholder="Số điện thoại liên lạc..."
                value={newStaffPhone}
                onChange={(e) => setNewStaffPhone(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl text-xs bg-white focus:outline-none font-semibold"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-850 active:scale-95 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Tạo tài khoản nhân viên
            </button>
          </form>
        </div>

        {/* Staff List with delete button */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
          <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-4">Danh sách nhân sự toàn hệ thống NOVYN</h4>
          <div className="overflow-x-auto max-h-[450px] pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-3">Họ tên</th>
                  <th className="p-3 font-mono">Mức lương Gross</th>
                  <th className="p-3">Chi nhánh</th>
                  <th className="p-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                {usersList
                  .filter((u: any) => u.role !== 'customer')
                  .map((u: any) => (
                    <tr key={u.id} className="hover:bg-neutral-50/20 transition-colors">
                      <td className="p-3">
                        <span className="font-bold text-neutral-900 block">{u.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[7px] font-black tracking-widest uppercase text-white shadow-sm ${
                          u.role === 'director' ? 'bg-rose-500' :
                          u.role === 'manager' ? 'bg-amber-500' :
                          u.role === 'accountant' ? 'bg-emerald-500' : 'bg-sky-500'
                        }`}>
                          {u.role === 'director' ? 'Giám đốc' :
                           u.role === 'manager' ? 'Quản lý' :
                           u.role === 'accountant' ? 'Kế toán' :
                           u.role === 'cskh' ? 'CSKH' : 'Nhân viên'}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-black text-neutral-800">{u.salary ? formatPrice(u.salary) : 'Thoả thuận'}</td>
                      <td className="p-3 text-neutral-500">{u.branch || 'Văn phòng chính'}</td>
                      <td className="p-3 text-right">
                        {u.id !== currentUser.id && u.id !== 'usr-dir' ? (
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn cho nhân sự ${u.name} nghỉ việc và xóa tài khoản hoàn toàn không?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                          >
                            Cho nghỉ việc
                          </button>
                        ) : (
                          <span className="text-[10px] text-neutral-400 italic">Không thể tác động</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Monthly Payroll Generator & disbursement list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Build payroll form */}
        <div className="lg:col-span-1 bg-neutral-50 p-6 rounded-3xl border border-neutral-100">
          <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-1">
            <PlusCircle className="w-4 h-4 text-neutral-600" />
            Tạo bảng tính lương mới
          </h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedPayrollUser && newPayrollMonth && newPayrollSalary > 0) {
                addPayrollRecord(selectedPayrollUser, newPayrollMonth, newPayrollSalary);
                setSelectedPayrollUser('');
                setNewPayrollSalary(0);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-[8px] font-bold text-neutral-450 block mb-1">Chọn nhân sự nhận lương</label>
              <select
                required
                value={selectedPayrollUser}
                onChange={(e) => {
                  setSelectedPayrollUser(e.target.value);
                  const selectedObj = usersList.find((u: any) => u.id === e.target.value);
                  if (selectedObj && selectedObj.salary) {
                    setNewPayrollSalary(selectedObj.salary);
                  }
                }}
                className="w-full px-3.5 py-2.5 border bg-white rounded-xl text-xs font-bold text-neutral-800"
              >
                <option value="">-- Chọn nhân sự --</option>
                {usersList
                  .filter((u: any) => u.role !== 'customer')
                  .map((u: any) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
              </select>
            </div>
            
            {/* Real-time Attendance Statistics for Selected User */}
            {(() => {
              if (!selectedPayrollUser) return null;
              const SHIFT_START: Record<string, string> = {
                morning: '08:00',
                afternoon: '13:00',
                evening: '18:00',
              };

              const logs = attendanceLogs.filter(
                (l: any) => l.userId === selectedPayrollUser && l.date.startsWith(newPayrollMonth)
              );

              let onTime = 0;
              let late = 0;
              let invalid = 0;

              logs.forEach((log: any) => {
                if (!log.timeIn || !log.timeOut) {
                  invalid++;
                } else {
                  const assignedShift = shiftRequests.find(
                    (s: any) => s.userId === log.userId && s.date === log.date && s.status === 'approved'
                  );
                  if (!assignedShift) {
                    onTime++;
                  } else {
                    const startRequired = SHIFT_START[assignedShift.shiftType] || '08:00';
                    if (log.timeIn > startRequired) {
                      late++;
                    } else {
                      onTime++;
                    }
                  }
                }
              });

              return (
                <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm text-xs space-y-2 mt-2">
                  <div className="font-black text-neutral-900 uppercase tracking-wider text-[9px] mb-2 text-neutral-450">Thống kê chấm công {newPayrollMonth}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-neutral-50 p-2 rounded-xl text-center">
                      <span className="text-[10px] text-neutral-400 font-medium block">Tổng chấm công</span>
                      <span className="text-sm font-black text-neutral-900">{logs.length} ngày</span>
                    </div>
                    <div className="bg-emerald-50/50 p-2 rounded-xl text-center border border-emerald-100/50">
                      <span className="text-[10px] text-emerald-600 font-medium block">Hợp lệ (Tính công)</span>
                      <span className="text-sm font-black text-emerald-700">{onTime + late} ngày</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-neutral-50 space-y-1.5 font-medium text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">✓ Đúng giờ:</span>
                      <span className="font-bold text-emerald-600">{onTime} ngày</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">⏰ Đi muộn:</span>
                      <span className="font-bold text-amber-600">{late} ngày</span>
                    </div>
                    <div className="flex justify-between text-rose-600 bg-rose-50/50 p-1.5 rounded-lg border border-rose-100/30">
                      <span>✗ Thiếu check (Không tính):</span>
                      <span className="font-black">{invalid} ngày</span>
                    </div>
                  </div>
                  <p className="text-[8px] text-neutral-400 italic mt-1 leading-relaxed">* Dữ liệu được tính tự động từ lịch sử chấm vân tay thực tế của nhân sự trong tháng.</p>
                </div>
              );
            })()}

            <div>
              <label className="text-[8px] font-bold text-neutral-450 block mb-1">Tháng kết toán lương</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 2026-06"
                value={newPayrollMonth}
                onChange={(e) => setNewPayrollMonth(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[8px] font-bold text-neutral-450 block mb-1">Tổng lương Gross thực nhận (VND)</label>
              <input
                type="number"
                required
                value={newPayrollSalary || ''}
                onChange={(e) => setNewPayrollSalary(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-850 active:scale-95 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Xác nhận phát hành phiếu lương
            </button>
          </form>
        </div>

        {/* Payroll list table with disbursement button */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
          <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-4">Các khoản thanh toán lương & Giải quỹ giải ngân</h4>
          <div className="overflow-x-auto max-h-[300px] pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-3">Tháng lương</th>
                  <th className="p-3">Họ tên</th>
                  <th className="p-3 font-mono">Thực nhận</th>
                  <th className="p-3 text-right">Trạng thái / Giải ngân</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                {payrollRecords.map((pay: any) => (
                  <tr key={pay.id} className="hover:bg-neutral-50/20 transition-colors">
                    <td className="p-3 font-mono font-bold">{pay.month}</td>
                    <td className="p-3">{pay.name}</td>
                    <td className="p-3 font-mono font-black text-neutral-900">{formatPrice(pay.salary)}</td>
                    <td className="p-3 text-right">
                      {pay.status === 'paid' ? (
                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">Đã chi trả</span>
                      ) : (
                        <button
                          onClick={() => paySalary(pay.id)}
                          className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-250 text-[9px] font-black uppercase tracking-wider cursor-pointer"
                        >
                          Bấm chi lương
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
