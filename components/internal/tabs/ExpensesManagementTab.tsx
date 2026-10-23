'use client';

import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface ExpensesManagementTabProps {
  expensesList: any[];
  addExpense: (title: string, amount: number, category: string, date: string) => void;
  deleteExpense: (id: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ExpensesManagementTab({
  expensesList,
  addExpense,
  deleteExpense,
  showToast,
}: ExpensesManagementTabProps) {
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState(0);
  const [newExpenseCategory, setNewExpenseCategory] = useState<'marketing' | 'operations' | 'equipment' | 'other'>('marketing');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpenseTitle && newExpenseAmount > 0) {
      addExpense(newExpenseTitle, newExpenseAmount, newExpenseCategory, new Date().toISOString().split('T')[0]);
      setNewExpenseTitle('');
      setNewExpenseAmount(0);
      showToast('✓ Đã ghi nhận chi phí vận hành mới!', 'success');
    }
  };

  return (
    <div>
      <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Ghi nhận & Quản lý chi phí vận hành</h3>
      <p className="text-xs text-neutral-400 mb-8">Khai báo các khoản chi tiêu thực tế của chuỗi cửa hàng, quản lý dòng tiền chi ra và đối soát hoá đơn vận hành.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* EXPENSES RECORDING SECTION */}
        <div className="lg:col-span-1 bg-neutral-50 p-6 rounded-3xl border border-neutral-100 shadow-sm">
          <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-neutral-750" />
            Ghi nhận chi phí vận hành mới
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] font-bold text-neutral-455 block mb-1">Nội dung khoản chi</label>
              <input
                type="text"
                placeholder="Ví dụ: Phí quảng cáo Facebook BST mới"
                required
                value={newExpenseTitle}
                onChange={(e) => setNewExpenseTitle(e.target.value)}
                className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:outline-none font-semibold text-neutral-805"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-neutral-455 block mb-1">Số tiền (VND)</label>
              <input
                type="number"
                required
                placeholder="Ví dụ: 15000000"
                value={newExpenseAmount || ''}
                onChange={(e) => setNewExpenseAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-neutral-455 block mb-1">Phân loại chi phí</label>
              <select
                value={newExpenseCategory}
                onChange={(e) => setNewExpenseCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border bg-white focus:outline-none text-xs font-bold text-neutral-800"
              >
                <option value="marketing">Marketing (Quảng cáo)</option>
                <option value="operations">Vận hành chi nhánh (Operations)</option>
                <option value="equipment">Trang thiết bị (Equipment)</option>
                <option value="other">Khoản chi khác</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-850 active:scale-95 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Xác nhận ghi chi phí
            </button>
          </form>
        </div>

        {/* EXPENSES HISTORIC LEDGER */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
          <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide mb-4">Các khoản chi phí phát sinh luỹ kế</h4>
          <div className="overflow-x-auto max-h-[350px] pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-3">Khoản chi</th>
                  <th className="p-3">Danh mục</th>
                  <th className="p-3">Ngày chi</th>
                  <th className="p-3 text-right">Số tiền</th>
                  <th className="p-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                {expensesList.map((exp: any) => (
                  <tr key={exp.id} className="hover:bg-neutral-50/20 transition-colors">
                    <td className="p-3 font-bold text-neutral-900">{exp.title}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider text-white ${
                        exp.category === 'marketing' ? 'bg-indigo-500' :
                        exp.category === 'equipment' ? 'bg-amber-500' :
                        exp.category === 'operations' ? 'bg-sky-500' : 'bg-neutral-500'
                      }`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-500 font-mono">{exp.date}</td>
                    <td className="p-3 text-right font-black text-neutral-900 font-mono">{formatPrice(exp.amount)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="px-2 py-0.5 rounded text-[8px] font-bold text-rose-650 bg-rose-50 border border-rose-100 hover:bg-rose-100 cursor-pointer"
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
                {expensesList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-neutral-400 italic">Chưa có khoản chi phí nào được ghi nhận.</td>
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
