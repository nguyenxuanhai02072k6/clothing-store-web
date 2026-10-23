'use client';

import React, { useState } from 'react';
import { Sliders } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';

export interface AccountantPayrollSubsystemProps {
  usersList: any[];
  posHistory: any[];
  shiftRequests: any[];
  attendanceLogs: any[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const categoryLabel: Record<string, string> = {
  Tops: 'Áo thiết kế',
  Bottoms: 'Quần & Chân váy',
  Dresses: 'Đầm thanh lịch',
  Outerwear: 'Áo khoác blazer',
};

export const AccountantPayrollSubsystem: React.FC<AccountantPayrollSubsystemProps> = ({
  usersList,
  posHistory,
  shiftRequests,
  attendanceLogs,
  showToast,
}) => {
  const [salesCommissions, setSalesCommissions] = useState<Record<string, number>>({
    Tops: 0.03,
    Bottoms: 0.03,
    Dresses: 0.05,
    Outerwear: 0.04,
  });

  const kpiTarget = 30000000; // 30M target for full KPI

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b pb-4">
        <h3 className="text-lg font-black text-neutral-950 uppercase tracking-tight flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-500" />
          Báo cáo hiệu năng KPI & Bảng lương nhân viên tự động
        </h3>
        <p className="text-xs text-neutral-450 mt-1">
          Đồng bộ tự động từ dữ liệu chấm công GPS, doanh số POS, và phụ cấp ca trực tháng này.
        </p>
      </div>

      {/* Commission slider config */}
      <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
        <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-emerald-500" />
          Cấu hình tỷ lệ % hoa hồng doanh số bán hàng (Commission rates)
        </h4>
        <p className="text-[10px] text-neutral-450">
          • Kéo thanh trượt để điều chỉnh phần trăm hoa hồng trích thưởng doanh số POS cho nhân sự.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          {Object.keys(salesCommissions).map((cat) => (
            <div key={cat} className="space-y-1.5 p-3.5 bg-neutral-50 rounded-2xl border">
              <span className="font-bold text-neutral-800">{categoryLabel[cat] || cat}</span>
              <input
                type="range"
                min={0.01}
                max={0.1}
                step={0.005}
                value={salesCommissions[cat]}
                onChange={(e) =>
                  setSalesCommissions({ ...salesCommissions, [cat]: parseFloat(e.target.value) })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[10px] font-bold text-emerald-700">
                <span>Rate:</span>
                <span>{(salesCommissions[cat] * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payroll Automated table */}
      <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
        <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider">
          Bảng tổng hợp thu nhập nhân sự tự động tháng 06/2026
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                <th className="p-3">Nhân sự</th>
                <th className="p-3 text-center">Lương cứng</th>
                <th className="p-3 text-center">Doanh số POS</th>
                <th className="p-3 text-center">Hoa hồng %</th>
                <th className="p-3 text-center">Phụ cấp ca</th>
                <th className="p-3 text-center">Phạt đi muộn</th>
                <th className="p-3 text-right">Lương thực lĩnh</th>
                <th className="p-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y text-neutral-700 font-medium">
              {usersList
                .filter((u) => ['employee', 'cashier', 'stocker'].includes(u.role))
                .map((emp) => {
                  const mySalesTotal = posHistory
                    .filter((h) => h.cashierEmail === emp.email)
                    .reduce((sum, h) => sum + h.total, 0);

                  const commission = mySalesTotal * 0.03;
                  const completedShiftsCount = shiftRequests.filter(
                    (s) => s.userId === emp.id && s.status === 'approved'
                  ).length;
                  const allowance = completedShiftsCount * 50000;

                  const lateCheckinsCount = attendanceLogs.filter(
                    (a) => a.userId === emp.id && a.timeIn > '08:00'
                  ).length;
                  const fines = lateCheckinsCount * 100000;

                  const netSalary = (emp.salary || 8000000) + commission + allowance - fines;
                  const progressPercent = Math.min(100, (mySalesTotal / kpiTarget) * 100);

                  return (
                    <tr key={emp.id} className="hover:bg-neutral-50/10">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                            {emp.name.split(' ').pop()?.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-neutral-900 block truncate w-32">{emp.name}</span>
                            <span className="text-[9px] text-neutral-400 font-mono block">
                              {emp.id} • {emp.role}
                            </span>
                          </div>
                        </div>

                        {emp.role === 'cashier' && (
                          <div className="mt-2 w-32">
                            <div className="flex justify-between text-[8px] text-neutral-400 font-bold mb-0.5 uppercase tracking-wide">
                              <span>KPI POS:</span>
                              <span>{progressPercent.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-emerald-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono">{formatPrice(emp.salary || 8000000)}</td>
                      <td className="p-3 text-center font-mono font-bold text-rose-650">
                        {formatPrice(mySalesTotal)}
                      </td>
                      <td className="p-3 text-center font-mono text-emerald-700 font-bold">
                        +{formatPrice(commission)}
                      </td>
                      <td className="p-3 text-center font-mono font-semibold">+{formatPrice(allowance)}</td>
                      <td className="p-3 text-center font-mono text-rose-600 font-bold">
                        -{formatPrice(fines)}
                      </td>
                      <td className="p-3 text-right font-mono font-black text-rose-650 text-xs">
                        {formatPrice(netSalary)}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            showToast(`✓ Đã thanh toán lương ${formatPrice(netSalary)} cho ${emp.name}!`, 'success');
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider cursor-pointer transition-colors active:scale-95"
                        >
                          Chi trả
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
