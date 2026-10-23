'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import FinancialSVGCharts from '../FinancialSVGCharts';

export interface DirectorPLViewTabProps {
  currentUser: any;
  allOrders: any[];
  restockRecords: any[];
  expensesList: any[];
  usersList: any[];
  productsList: any[];
  taxRecords: any[];
  getDailyFinances: () => any[];
  calculatePIT: (gross: number) => number;
  exportTaxRecordsToCSV: (records: any[]) => void;
  exportDailyPLToCSV: (dailyList: any[]) => void;
  exportPLToCSV: (ledger: any[]) => void;
}

export default function DirectorPLViewTab({
  currentUser,
  allOrders,
  restockRecords,
  expensesList,
  usersList,
  productsList,
  taxRecords,
  getDailyFinances,
  calculatePIT,
  exportTaxRecordsToCSV,
  exportDailyPLToCSV,
  exportPLToCSV,
}: DirectorPLViewTabProps) {
  const totalRevenue = allOrders
    .filter((o: any) => o.status === 'completed')
    .reduce((sum: number, o: any) => sum + o.total, 0);

  const q1Revenue = allOrders
    .filter((o: any) => o.status === 'completed' && o.branch.includes('Quận 1'))
    .reduce((sum: number, o: any) => sum + o.total, 0);

  const tdRevenue = allOrders
    .filter((o: any) => o.status === 'completed' && o.branch.includes('Thảo Điền'))
    .reduce((sum: number, o: any) => sum + o.total, 0);

  const dailyFinances = getDailyFinances();
  const totalProfit = dailyFinances.reduce((sum: number, day: any) => sum + day.profit, 0);

  const ledger = productsList.map((product: any) => {
    const soldQty = allOrders
      .filter((o: any) => o.status === 'completed')
      .reduce((total: number, order: any) => {
        const item = order.items.find((i: any) => i.product.id === product.id);
        return total + (item ? item.quantity : 0);
      }, 0);

    const stockedQty = restockRecords
      .filter((r: any) => r.productId === product.id && (!r.status || r.status === 'approved'))
      .reduce((total: number, r: any) => total + r.amount, 0);

    const revenue = soldQty * product.price;
    const importCost = stockedQty * (product.price * 0.4);
    const netProfit = revenue - importCost;

    return {
      product,
      soldQty,
      revenue,
      stockedQty,
      importCost,
      netProfit,
    };
  });

  const sortedLedger = [...ledger].sort((a, b) => b.revenue - a.revenue);

  return (
    <div>
      <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Quyết toán tài chính toàn cầu</h3>
      <p className="text-xs text-neutral-400 mb-8">Kiểm toán doanh số liên chi nhánh, doanh số thị phần, quyết toán thuế CIT và hạch toán P&L sản phẩm.</p>
      
      <div className="mb-10">
        <FinancialSVGCharts
          allOrders={allOrders}
          restockRecords={restockRecords}
          expensesList={expensesList}
          usersList={usersList}
          currentUser={currentUser}
        />
      </div>

      {/* METRICS WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="p-5 rounded-3xl bg-neutral-950 text-white shadow-md border border-neutral-800 flex flex-col justify-between min-h-[120px]">
          <div>
            <span className="text-[8px] uppercase tracking-widest font-black opacity-55 block mb-1">TỔNG DOANH THU TOÀN HỆ THỐNG</span>
            <h4 className="text-base font-black tracking-tight">{formatPrice(totalRevenue)}</h4>
          </div>
          <span className="text-[8px] text-emerald-400 font-bold block mt-2">Tăng trưởng 15% so với tháng trước</span>
        </div>
        
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950 to-teal-950 text-white shadow-md border border-emerald-800 flex flex-col justify-between min-h-[120px]">
          <div>
            <span className="text-[8px] uppercase tracking-widest font-black opacity-75 block mb-1">TỔNG LỢI NHUẬN RÒNG TOÀN CÔNG TY</span>
            <h4 className="text-base font-black tracking-tight">{formatPrice(totalProfit)}</h4>
          </div>
          <span className={`text-[8px] font-bold block mt-2 ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalProfit >= 0 ? '✓ Doanh nghiệp đang hoạt động có lãi' : '⚠ Doanh nghiệp đang thâm hụt dòng tiền'}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-neutral-100 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div>
            <span className="text-[8px] uppercase tracking-widest font-black text-neutral-400 block mb-1">DOANH THU CHI NHÁNH QUẬN 1</span>
            <h4 className="text-base font-black tracking-tight text-neutral-900">{formatPrice(q1Revenue)}</h4>
          </div>
          <div className="w-full bg-neutral-100 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(q1Revenue / (totalRevenue || 1)) * 100}%` }}></div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-neutral-100 shadow-sm flex flex-col justify-between min-h-[120px]">
          <div>
            <span className="text-[8px] uppercase tracking-widest font-black text-neutral-400 block mb-1">DOANH THU THẢO ĐIỀN</span>
            <h4 className="text-base font-black tracking-tight text-neutral-900">{formatPrice(tdRevenue)}</h4>
          </div>
          <div className="w-full bg-neutral-100 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(tdRevenue / (totalRevenue || 1)) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* TAXES WIDGET */}
      <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 mb-8">
        <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4">Dự phóng thuế CIT & PIT toàn bộ nhân viên</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <span className="text-[8px] text-neutral-400 font-bold block uppercase mb-1">Dự phòng thuế thu nhập doanh nghiệp CIT (20%)</span>
            <span className="text-base font-black text-rose-600">{formatPrice(totalRevenue * 0.2)}</span>
            <span className="text-[9px] text-neutral-450 block mt-1 font-semibold">Tạm nộp định kỳ theo năm tài chính 2026.</span>
          </div>
          <div>
            <span className="text-[8px] text-neutral-400 font-bold block uppercase mb-1">Ước tính PIT thuế thu nhập cá nhân nhân sự</span>
            <div className="space-y-1 mt-2">
              {usersList
                .filter((u: any) => u.salary && u.salary > 11000000)
                .map((u: any) => (
                  <div key={u.id} className="flex justify-between items-center text-[10px] text-neutral-700 font-medium">
                    <span>{u.name} (Gross: {formatPrice(u.salary)})</span>
                    <span className="font-mono font-bold text-rose-500">-{formatPrice(calculatePIT(u.salary))} PIT</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* HISTORICAL TAX SETTLED LOGS */}
      {taxRecords.length > 0 && (
        <div className="bg-white border border-neutral-100 p-6 rounded-3xl mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">Tờ khai quyết toán thuế chính thức (Do Kế toán trưởng chốt sổ)</h4>
              <p className="text-[10px] text-neutral-400 mt-1">Các báo cáo quyết toán thuế CIT & PIT đã được khóa sổ chính thức bởi ban kế toán.</p>
            </div>
            <button
              onClick={() => exportTaxRecordsToCSV(taxRecords)}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1 font-bold text-neutral-700 bg-white"
            >
              <Download className="w-3.5 h-3.5 text-neutral-600" />
              Tải file sổ thuế
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                  <th className="p-3">Kỳ thuế</th>
                  <th className="p-3 text-right">Doanh thu gộp</th>
                  <th className="p-3 text-right">LNTT (EBT)</th>
                  <th className="p-3 text-center">Thuế CIT</th>
                  <th className="p-3 text-right">Thuế PIT</th>
                  <th className="p-3 text-right font-black text-neutral-900">Lợi nhuận sau thuế</th>
                  <th className="p-3">Ngày khóa sổ</th>
                  <th className="p-3">Kế toán quyết toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                {taxRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-neutral-50/20 transition-colors text-[10px]">
                    <td className="p-3 font-mono font-bold text-neutral-900">{rec.period}</td>
                    <td className="p-3 text-right font-mono">{formatPrice(rec.revenue)}</td>
                    <td className="p-3 text-right font-mono">{formatPrice(rec.ebt)}</td>
                    <td className="p-3 text-center font-mono text-rose-550 font-semibold">
                      {formatPrice(rec.citAmount)} <span className="text-[8px] text-neutral-400">({rec.citRate}%)</span>
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-650 font-semibold">+{formatPrice(rec.pitAmount)}</td>
                    <td className="p-3 text-right font-mono font-black text-emerald-700">{formatPrice(rec.netProfit)}</td>
                    <td className="p-3 text-neutral-455 font-mono">{rec.settledAt}</td>
                    <td className="p-3 text-neutral-600 font-bold">{rec.accountantName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DAILY FINANCIAL REPORT */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide">Nhật ký doanh thu & Lợi nhuận ròng theo ngày thực tế</h4>
            <p className="text-[10px] text-neutral-400 mt-1">• Doanh thu thực tế từ đơn hoàn thành &nbsp;• Chi phí vận hành phát sinh &nbsp;• Giá vốn hàng bán &nbsp;• Chi phí nhập hàng/Lương chi trả</p>
          </div>
          <button
            onClick={() => exportDailyPLToCSV(dailyFinances)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1 font-bold"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất CSV ngày
          </button>
        </div>
        <div className="overflow-x-auto max-h-[350px] pr-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                <th className="p-3">Ngày</th>
                <th className="p-3 text-center">Số đơn</th>
                <th className="p-3 text-right">Doanh thu (+)</th>
                <th className="p-3 text-right">Giá vốn COGS (-)</th>
                <th className="p-3 text-right">Chi phí vận hành (-)</th>
                <th className="p-3 text-right">Vốn nhập kho (-)</th>
                <th className="p-3 text-right">Lương đã trả (-)</th>
                <th className="p-3 text-right font-black text-neutral-950">Lợi nhuận ròng (=)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
              {dailyFinances.map((day) => (
                <tr key={day.date} className="hover:bg-neutral-50/20 transition-colors">
                  <td className="p-3 font-mono font-bold text-neutral-900">{day.date}</td>
                  <td className="p-3 text-center font-mono text-neutral-500">{day.orderCount} đơn</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-600">+{formatPrice(day.revenue)}</td>
                  <td className="p-3 text-right font-mono text-neutral-400">-{formatPrice(day.cogs)}</td>
                  <td className="p-3 text-right font-mono text-rose-500">
                    {day.expenses > 0 ? `-${formatPrice(day.expenses)}` : '0 ₫'}
                  </td>
                  <td className="p-3 text-right font-mono text-rose-500">
                    {day.restockCost > 0 ? `-${formatPrice(day.restockCost)}` : '0 ₫'}
                  </td>
                  <td className="p-3 text-right font-mono text-rose-500">
                    {day.salaryPaid > 0 ? `-${formatPrice(day.salaryPaid)}` : '0 ₫'}
                  </td>
                  <td className={`p-3 text-right font-mono font-black ${day.profit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {day.profit >= 0 ? '+' : ''}{formatPrice(day.profit)}
                  </td>
                </tr>
              ))}
              {dailyFinances.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-neutral-450 italic">Chưa phát sinh bất kỳ hoạt động tài chính nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRODUCT P&L FULL LEDGER */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide">Sổ hạch toán kết quả kinh doanh chi tiết theo sản phẩm</h4>
          <button
            onClick={() => exportPLToCSV(sortedLedger)}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-850 text-white text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                <th className="p-3">Tên sản phẩm</th>
                <th className="p-3 text-center">Đã bán</th>
                <th className="p-3 text-right">Thu (Doanh thu)</th>
                <th className="p-3 text-center">Đã nhập</th>
                <th className="p-3 text-right">Chi (Vốn nhập)</th>
                <th className="p-3 text-right font-black text-neutral-950">Lợi nhuận ròng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
              {sortedLedger.map((item) => (
                <tr key={item.product.id} className="hover:bg-neutral-50/20 transition-colors">
                  <td className="p-3">
                    <span className="font-bold text-neutral-900 block">{item.product.name}</span>
                    <span className="text-[9px] text-neutral-455 uppercase font-bold tracking-wider">{item.product.category}</span>
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-neutral-600">{item.soldQty} chiếc</td>
                  <td className="p-3 text-right font-mono font-black text-emerald-600">+{formatPrice(item.revenue)}</td>
                  <td className="p-3 text-center font-mono text-neutral-450">{item.stockedQty} chiếc</td>
                  <td className="p-3 text-right font-mono font-bold text-rose-500">-{formatPrice(item.importCost)}</td>
                  <td className={`p-3 text-right font-mono font-black ${item.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {item.netProfit >= 0 ? '+' : ''}{formatPrice(item.netProfit)}
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
