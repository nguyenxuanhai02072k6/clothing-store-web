'use client';

import React, { useState } from 'react';
import { UserPlus, UserCheck, PlusCircle, Search, Phone, MapPin } from 'lucide-react';

export interface StaffAccountDirectoryTabProps {
  currentUser: any;
  usersList: any[];
  selectedBranch?: string;
  register: (name: string, email: string, pass: string, role: string, branch?: string, phone?: string) => Promise<boolean>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function StaffAccountDirectoryTab({
  currentUser,
  usersList,
  selectedBranch = 'all',
  register,
  showToast,
}: StaffAccountDirectoryTabProps) {
  const isManager = currentUser.role === 'manager';
  const isDirector = currentUser.role === 'director';
  const managerBranch = currentUser.branch || 'Chi nhánh Quận 1';

  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [staffFilterRole, setStaffFilterRole] = useState('all');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'employee' | 'cashier' | 'stocker' | 'cskh' | 'manager' | 'accountant'>('employee');
  const [newStaffBranch, setNewStaffBranch] = useState('Chi nhánh Quận 1');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  // Filter branch employees
  const branchStaffList = usersList.filter((u: any) => {
    if (u.role === 'customer') return false;
    if (isManager) {
      return u.branch === managerBranch;
    }
    if (selectedBranch === 'all') return true;
    return u.branch === selectedBranch;
  });

  // Filter by search query and role filter pill
  const filteredStaff = branchStaffList.filter((u: any) => {
    const matchQuery = !staffSearchQuery || 
      u.name?.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
      u.phone?.includes(staffSearchQuery);
    const matchRole = staffFilterRole === 'all' || u.role === staffFilterRole;
    return matchQuery && matchRole;
  });

  const totalStaffCount = branchStaffList.length;
  const employeeCount = branchStaffList.filter((u: any) => u.role === 'employee').length;
  const cashierCount = branchStaffList.filter((u: any) => u.role === 'cashier').length;
  const stockerCount = branchStaffList.filter((u: any) => u.role === 'stocker').length;
  const cskhCount = branchStaffList.filter((u: any) => u.role === 'cskh').length;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'director':
        return <span className="px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase bg-rose-50 text-rose-700 border border-rose-200">Giám đốc</span>;
      case 'manager':
        return <span className="px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase bg-amber-50 text-amber-700 border border-amber-200">Quản lý</span>;
      case 'cashier':
        return <span className="px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase bg-teal-50 text-teal-700 border border-teal-200">Thu ngân POS</span>;
      case 'stocker':
        return <span className="px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase bg-purple-50 text-purple-700 border border-purple-200">Thủ kho</span>;
      case 'cskh':
        return <span className="px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase bg-sky-50 text-sky-700 border border-sky-200">CSKH Hub</span>;
      case 'accountant':
        return <span className="px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Kế toán</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase bg-neutral-100 text-neutral-700 border border-neutral-200">Nhân viên</span>;
    }
  };

  const handleCreateStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim() || !newStaffPassword.trim()) {
      showToast('Vui lòng điền đầy đủ họ tên, email và mật khẩu!', 'error');
      return;
    }

    const effectiveBranch = isManager ? managerBranch : newStaffBranch;
    const success = await register(
      newStaffName.trim(),
      newStaffEmail.trim(),
      newStaffPassword,
      newStaffRole,
      effectiveBranch,
      newStaffPhone.trim()
    );

    if (success) {
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPassword('');
      setNewStaffPhone('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-black text-neutral-950 uppercase tracking-tight flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            Quản lý Nhân sự & Tạo Tài khoản Nhân viên Chi nhánh
          </h3>
          <p className="text-xs text-neutral-450 mt-1">
            {isManager 
              ? `Quản lý ${managerBranch} có thẩm quyền trực tiếp tạo tài khoản cho nhân sự bán hàng, thu ngân quầy và kho vận chi nhánh.` 
              : 'Ban Giám Đốc quản trị toàn bộ danh sách nhân sự đa chi nhánh và cấp quyền truy cập hệ thống.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black flex items-center gap-1.5 shadow-2xs">
            <MapPin className="w-3.5 h-3.5" />
            {isManager ? managerBranch : (selectedBranch === 'all' ? 'Tất cả chi nhánh' : selectedBranch)}
          </span>
        </div>
      </div>

      {/* KPI Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-neutral-150 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-neutral-450 tracking-wider block">Tổng nhân sự chi nhánh</span>
          <span className="text-xl font-black text-neutral-900 mt-1 block">{totalStaffCount} người</span>
          <span className="text-[9px] text-emerald-600 font-bold mt-0.5 block">Đã xác thực danh tính</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-neutral-150 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-neutral-450 tracking-wider block">Nhân viên Bán hàng</span>
          <span className="text-xl font-black text-sky-700 mt-1 block">{employeeCount} nhân sự</span>
          <span className="text-[9px] text-neutral-400 font-medium mt-0.5 block">Stylist & Bán lẻ</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-neutral-150 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-neutral-450 tracking-wider block">Thu ngân & Thủ kho</span>
          <span className="text-xl font-black text-teal-700 mt-1 block">{cashierCount + stockerCount} nhân sự</span>
          <span className="text-[9px] text-neutral-400 font-medium mt-0.5 block">{cashierCount} POS / {stockerCount} Kho</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-neutral-150 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-neutral-450 tracking-wider block">CSKH & Hỗ trợ</span>
          <span className="text-xl font-black text-purple-700 mt-1 block">{cskhCount} nhân sự</span>
          <span className="text-[9px] text-neutral-400 font-medium mt-0.5 block">Hỗ trợ khách hàng</span>
        </div>
      </div>

      {/* 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Create Staff Account Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-neutral-150 p-6 shadow-sm space-y-4">
          <div className="border-b pb-3 flex items-center justify-between">
            <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              Đăng ký tài khoản nhân viên mới
            </h4>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 uppercase">
              {isManager ? 'Thẩm quyền Quản lý' : 'Quyền Giám đốc'}
            </span>
          </div>

          <form onSubmit={handleCreateStaffSubmit} className="space-y-3.5">
            <div>
              <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                Họ và tên nhân viên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Lê Thị Phương Mai"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-neutral-900 font-semibold text-neutral-900 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                  Email đăng nhập <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="mai.le@novynwear.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-neutral-900 font-semibold text-neutral-900 transition-colors"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="0901234567"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-neutral-900 font-semibold text-neutral-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                Mật khẩu khởi tạo <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Tối thiểu 6 ký tự (có chữ hoa, số, ký tự đặc biệt)"
                value={newStaffPassword}
                onChange={(e) => setNewStaffPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-neutral-900 font-semibold transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                  Vai trò & Vị trí làm việc <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as any)}
                  className="w-full px-3 py-2.5 border bg-white rounded-xl text-xs font-bold text-neutral-850 focus:outline-none focus:border-neutral-900"
                >
                  <option value="employee">🛍️ Nhân viên bán hàng</option>
                  <option value="cashier">💵 Thu ngân quầy POS</option>
                  <option value="stocker">📦 Nhân viên kho chi nhánh</option>
                  <option value="cskh">🎧 Chăm sóc khách hàng</option>
                  {isDirector && (
                    <>
                      <option value="manager">👔 Quản lý chi nhánh</option>
                      <option value="accountant">📊 Kế toán tài chính</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                  Chi nhánh trực thuộc <span className="text-rose-500">*</span>
                </label>
                {isManager ? (
                  <div className="px-3.5 py-2.5 border rounded-xl bg-neutral-100 text-xs font-bold text-neutral-700 flex items-center justify-between cursor-not-allowed">
                    <span>{managerBranch}</span>
                    <span className="text-[8px] uppercase tracking-wider font-mono text-neutral-400">Khóa chi nhánh</span>
                  </div>
                ) : (
                  <select
                    value={newStaffBranch}
                    onChange={(e) => setNewStaffBranch(e.target.value)}
                    className="w-full px-3 py-2.5 border bg-white rounded-xl text-xs font-bold text-neutral-850 focus:outline-none focus:border-neutral-900"
                  >
                    <option value="Chi nhánh Quận 1">Chi nhánh Quận 1</option>
                    <option value="Chi nhánh Thảo Điền">Chi nhánh Thảo Điền</option>
                  </select>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-neutral-950 hover:bg-neutral-850 active:scale-[0.99] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Tạo tài khoản nhân viên ngay
              </button>
            </div>
          </form>
        </div>

        {/* Right: Branch Staff Directory */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-150 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
            <div>
              <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider">
                Danh sách nhân viên — {isManager ? managerBranch : (selectedBranch === 'all' ? 'Toàn hệ thống' : selectedBranch)}
              </h4>
              <span className="text-[10px] text-neutral-450 font-medium">Hiển thị {filteredStaff.length} / {totalStaffCount} nhân sự</span>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm tên, email, sđt..."
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border rounded-lg text-xs bg-[#FAF7F2] focus:bg-white focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Filter Role Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'employee', label: 'Bán hàng' },
              { id: 'cashier', label: 'Thu ngân' },
              { id: 'stocker', label: 'Thủ kho' },
              { id: 'cskh', label: 'CSKH' },
              ...(isDirector ? [{ id: 'manager', label: 'Quản lý' }] : [])
            ].map(pill => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setStaffFilterRole(pill.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  staffFilterRole === pill.id
                    ? 'bg-neutral-950 text-white shadow-2xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Staff Table */}
          <div className="overflow-x-auto max-h-[460px] border border-neutral-100 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                  <th className="p-3">Họ tên & Email</th>
                  <th className="p-3 text-center">Vai trò</th>
                  <th className="p-3">Chi nhánh</th>
                  <th className="p-3">Số điện thoại</th>
                  <th className="p-3 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                {filteredStaff.map((u: any) => (
                  <tr key={u.id} className="hover:bg-neutral-50/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-neutral-200 flex items-center justify-center font-black text-neutral-800 text-[10px] shrink-0">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-neutral-950 block">{u.name}</span>
                          <span className="text-[10px] text-neutral-450 font-mono block">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="p-3 whitespace-nowrap text-[11px] text-neutral-600 font-medium">
                      {u.branch || 'Toàn hệ thống'}
                    </td>
                    <td className="p-3 whitespace-nowrap text-[11px] font-mono text-neutral-700">
                      {u.phone ? (
                        <a href={`tel:${u.phone}`} className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          {u.phone}
                        </a>
                      ) : (
                        <span className="text-neutral-350 italic">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Hoạt động
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-neutral-400 italic text-xs">
                      Không tìm thấy nhân sự phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
