'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Download,
  Layers,
  Sliders,
  Trash2,
  Plus,
  Edit2,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import FinancialSVGCharts from '../FinancialSVGCharts';

export interface AccountantFinancePLTabProps {
  currentUser: any;
  allOrders: any[];
  restockRecords: any[];
  expensesList: any[];
  usersList: any[];
  productsList: any[];
  taxRecords: any[];
  getDailyFinances: () => any[];
  getPeriodFinances: (period: string) => any;
  calculateDynamicPITForSalary: (gross: number, personalDeduction: number, dependentDeduction: number, dependents: number) => number;
  handleSaveTaxRecord: (record: any) => void;
  handleDeleteTaxRecord: (id: string) => void;
  exportTaxRecordsToCSV: (records: any[]) => void;
  exportDailyPLToCSV: (dailyList: any[]) => void;
  exportPLToCSV: (ledger: any[]) => void;
  updateGlobalProductPrice: (id: string, price: number) => void;
  updateGlobalProductDetails: (id: string, name: string, desc: string, cat: string) => void;
  deleteGlobalProduct: (id: string) => void;
  addGlobalProduct: (
    name: string,
    cat: string,
    price: number,
    desc: string,
    images: string[],
    colors: any[],
    sizes: string[],
    initialStock: number
  ) => void;
}

export default function AccountantFinancePLTab({
  currentUser,
  allOrders,
  restockRecords,
  expensesList,
  usersList,
  productsList,
  taxRecords,
  getDailyFinances,
  getPeriodFinances,
  calculateDynamicPITForSalary,
  handleSaveTaxRecord,
  handleDeleteTaxRecord,
  exportTaxRecordsToCSV,
  exportDailyPLToCSV,
  exportPLToCSV,
  updateGlobalProductPrice,
  updateGlobalProductDetails,
  deleteGlobalProduct,
  addGlobalProduct,
}: AccountantFinancePLTabProps) {
  const [taxPeriod, setTaxPeriod] = useState('2026-05');
  const [customCitRate, setCustomCitRate] = useState(20);
  const [personalDeduction, setPersonalDeduction] = useState(11000000);
  const [dependentDeduction, setDependentDeduction] = useState(4400000);
  const [employeeDependents, setEmployeeDependents] = useState<Record<string, number>>({});

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCat, setEditCat] = useState('');

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Tops');
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductImages, setNewProductImages] = useState('');
  const [newProductColors, setNewProductColors] = useState('');
  const [newProductSizes, setNewProductSizes] = useState<string[]>(['S', 'M', 'L']);
  const [newProductInitialStock, setNewProductInitialStock] = useState(20);

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
  const dailyFinances = getDailyFinances();

  return (
    <div>
      <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Tài chính & Thu chi sản phẩm</h3>
      <p className="text-xs text-neutral-400 mb-8">Quản lý chi phí vận hành phát sinh, theo dõi sổ hạch toán kết quả kinh doanh chi tiết theo sản phẩm, và thiết lập danh mục bán hàng.</p>
      
      <div className="mb-10">
        <FinancialSVGCharts
          allOrders={allOrders}
          restockRecords={restockRecords}
          expensesList={expensesList}
          usersList={usersList}
          currentUser={currentUser}
        />
      </div>

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

      {/* INTERACTIVE TAX SETTLEMENT WORKSPACE */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-neutral-50 pb-4">
          <div>
            <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-neutral-750" />
              Quyết toán Thuế Doanh nghiệp & Thu nhập cá nhân (CIT & PIT)
            </h4>
            <p className="text-[10px] text-neutral-400 mt-1">• Tính thuế thu nhập doanh nghiệp (CIT) &nbsp;• Tính thuế TNCN lũy tiến của nhân viên &nbsp;• Chốt sổ báo cáo thuế hàng tháng</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-[10px] font-bold text-neutral-450 uppercase">Kỳ quyết toán:</label>
            <select
              value={taxPeriod}
              onChange={(e) => setTaxPeriod(e.target.value)}
              className="px-3 py-1.5 rounded-xl border bg-white focus:outline-none text-xs font-black text-neutral-800"
            >
              <option value="2026-05">Tháng 05/2026 (Kỳ hiện tại)</option>
              <option value="2026-04">Tháng 04/2026</option>
              <option value="2026-03">Tháng 03/2026</option>
              <option value="2026-02">Tháng 02/2026</option>
              <option value="2026-01">Tháng 01/2026</option>
            </select>
          </div>
        </div>

        {/* MAIN INTERACTIVE AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PARAMETERS ADJUSTING PANEL */}
          <div className="lg:col-span-1 bg-neutral-50/50 p-5 rounded-2xl border border-neutral-100 space-y-6">
            <h5 className="text-[10px] font-black text-neutral-700 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-neutral-550" />
              Cấu hình tham số tính thuế
            </h5>
            
            {/* CIT RATE SLIDER */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-bold text-neutral-455 uppercase">Thuế suất TNDN (CIT):</span>
                <span className="text-xs font-black text-rose-650">{customCitRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={customCitRate}
                onChange={(e) => setCustomCitRate(Number(e.target.value))}
                className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[8px] text-neutral-400 font-medium mt-1">
                <span>0%</span>
                <span>Định mức chuẩn: 20%</span>
                <span>30%</span>
              </div>
            </div>

            {/* PERSONAL PIT DEDUCTION */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-bold text-neutral-455 uppercase">Giảm trừ bản thân:</span>
                <span className="text-xs font-black text-neutral-800">{formatPrice(personalDeduction)}</span>
              </div>
              <input
                type="range"
                min="9000000"
                max="15000000"
                step="500000"
                value={personalDeduction}
                onChange={(e) => setPersonalDeduction(Number(e.target.value))}
                className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              />
              <div className="flex justify-between text-[8px] text-neutral-400 font-medium mt-1">
                <span>9M ₫</span>
                <span>Mặc định: 11M ₫</span>
                <span>15M ₫</span>
              </div>
            </div>

            {/* DEPENDENT PIT DEDUCTION */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-bold text-neutral-455 uppercase">Giảm trừ người phụ thuộc:</span>
                <span className="text-xs font-black text-neutral-800">{formatPrice(dependentDeduction)}/người</span>
              </div>
              <input
                type="range"
                min="3000000"
                max="6000000"
                step="200000"
                value={dependentDeduction}
                onChange={(e) => setDependentDeduction(Number(e.target.value))}
                className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              />
              <div className="flex justify-between text-[8px] text-neutral-400 font-medium mt-1">
                <span>3M ₫</span>
                <span>Mặc định: 4.4M ₫</span>
                <span>6M ₫</span>
              </div>
            </div>

            {/* FINANCIAL OVERVIEW BRIEF IN CONTROLS */}
            <div className="pt-4 border-t border-neutral-200/60 space-y-2.5 text-[10px] text-neutral-600 font-medium">
              <div className="flex justify-between">
                <span>Doanh thu gộp:</span>
                <span className="font-mono font-bold text-neutral-900">{formatPrice(getPeriodFinances(taxPeriod).revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span>Giá vốn COGS (40%):</span>
                <span className="font-mono text-neutral-500">-{formatPrice(getPeriodFinances(taxPeriod).cogs)}</span>
              </div>
              <div className="flex justify-between">
                <span>Chi phí vận hành:</span>
                <span className="font-mono text-neutral-500">-{formatPrice(getPeriodFinances(taxPeriod).expenses)}</span>
              </div>
              <div className="flex justify-between">
                <span>Chi phí lương nhân sự:</span>
                <span className="font-mono text-neutral-500">-{formatPrice(getPeriodFinances(taxPeriod).salaries)}</span>
              </div>
              <div className="flex justify-between">
                <span>Vốn nhập kho duyệt:</span>
                <span className="font-mono text-neutral-500">-{formatPrice(getPeriodFinances(taxPeriod).restockCost)}</span>
              </div>
            </div>
          </div>

          {/* LIVE PREVIEW & ACTIONS CARD */}
          <div className="lg:col-span-2 space-y-6">
            {(() => {
              const finances = getPeriodFinances(taxPeriod);
              const activeStaff = usersList.filter((u: any) => u.role !== 'customer');
              
              const staffPITDetails = activeStaff.map((u: any) => {
                const gross = u.salary || 0;
                const dependents = employeeDependents[u.id] || 0;
                const pit = calculateDynamicPITForSalary(gross, personalDeduction, dependentDeduction, dependents);
                return { user: u, gross, dependents, pit };
              });
              
              const totalStaffPIT = staffPITDetails.reduce((sum: number, item: any) => sum + item.pit, 0);
              const citAmount = finances.ebt > 0 ? finances.ebt * (customCitRate / 100) : 0;
              const netProfit = finances.ebt - citAmount;

              return (
                <>
                  <div className="p-6 rounded-2xl bg-gradient-to-tr from-neutral-900 via-neutral-950 to-neutral-900 text-white border border-neutral-850 shadow-md flex flex-col md:flex-row justify-between gap-6 min-h-[160px]">
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <span className="text-[8px] uppercase tracking-widest font-black text-rose-400 block mb-1">
                          Báo cáo kết quả kinh doanh trước thuế (EBT)
                        </span>
                        <h4 className="text-xl font-black tracking-tight font-mono">
                          {formatPrice(finances.ebt)}
                        </h4>
                      </div>
                      <div className="mt-4 space-y-1.5 text-[9px] text-neutral-350">
                        <div className="flex justify-between max-w-[280px]">
                          <span>Dự tính thuế doanh nghiệp CIT ({customCitRate}%):</span>
                          <span className="font-mono font-bold text-rose-450">-{formatPrice(citAmount)}</span>
                        </div>
                        <div className="flex justify-between max-w-[280px]">
                          <span>Dự tính tổng thuế PIT khấu trừ nhân viên:</span>
                          <span className="font-mono font-bold text-emerald-400">+{formatPrice(totalStaffPIT)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-neutral-800 pt-4 md:pt-0 md:pl-6 shrink-0 min-w-[180px]">
                      <div className="text-right w-full">
                        <span className="text-[8px] uppercase tracking-widest font-black text-emerald-400 block mb-1">
                          Lợi nhuận ròng sau thuế CIT
                        </span>
                        <h4 className="text-base font-black tracking-tight font-mono text-emerald-450">
                          {formatPrice(netProfit)}
                        </h4>
                      </div>
                      <div className="flex gap-2 w-full mt-4 justify-end">
                        <button
                          onClick={() => handleSaveTaxRecord({
                            id: `tax-${Date.now()}`,
                            period: taxPeriod,
                            revenue: finances.revenue,
                            cogs: finances.cogs,
                            expenses: finances.expenses,
                            salaries: finances.salaries,
                            restockCost: finances.restockCost,
                            ebt: finances.ebt,
                            citRate: customCitRate,
                            citAmount,
                            pitAmount: totalStaffPIT,
                            netProfit,
                            settledAt: new Date().toLocaleString(),
                            accountantName: currentUser.name,
                          })}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm flex-1 text-center font-bold"
                        >
                          Khóa sổ thuế
                        </button>
                        <button
                          onClick={() => exportTaxRecordsToCSV([{
                            period: taxPeriod,
                            revenue: finances.revenue,
                            cogs: finances.cogs,
                            expenses: finances.expenses,
                            salaries: finances.salaries,
                            restockCost: finances.restockCost,
                            ebt: finances.ebt,
                            citRate: customCitRate,
                            citAmount,
                            pitAmount: totalStaffPIT,
                            netProfit,
                            settledAt: new Date().toLocaleString(),
                            accountantName: currentUser.name,
                          }])}
                          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-[9px] font-black transition-all active:scale-95 cursor-pointer flex justify-center items-center"
                          title="Xuất tờ khai CSV"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PERSONNEL PIT INTERACTIVE TABLE */}
                  <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
                    <h5 className="text-[10px] font-black text-neutral-850 uppercase tracking-wider mb-3">
                      Bảng kê thuế TNCN chi tiết từng nhân sự ({activeStaff.length} người)
                    </h5>
                    <div className="overflow-x-auto max-h-[220px]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                            <th className="p-2">Nhân sự</th>
                            <th className="p-2">Lương Gross</th>
                            <th className="p-2 text-center">Người phụ thuộc</th>
                            <th className="p-2 text-right">Giảm trừ gia cảnh</th>
                            <th className="p-2 text-right text-rose-600 font-bold">Thuế PIT khấu trừ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700 text-[10px]">
                          {staffPITDetails.map(({ user, gross, dependents, pit }: any) => {
                            const totalDeduction = personalDeduction + (dependents * dependentDeduction);
                            return (
                              <tr key={user.id} className="hover:bg-neutral-50/20 transition-colors">
                                <td className="p-2">
                                  <span className="font-bold text-neutral-900 block">{user.name}</span>
                                  <span className="text-[8px] text-neutral-400 font-semibold">{user.role} • {user.branch || 'Văn phòng'}</span>
                                </td>
                                <td className="p-2 font-mono font-bold">{formatPrice(gross)}</td>
                                <td className="p-2 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        const currentDep = employeeDependents[user.id] || 0;
                                        if (currentDep > 0) {
                                          setEmployeeDependents({
                                            ...employeeDependents,
                                            [user.id]: currentDep - 1,
                                          });
                                        }
                                      }}
                                      className="w-5 h-5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center font-bold text-neutral-600 active:scale-90 select-none cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <span className="font-mono font-bold w-4 text-center">{dependents}</span>
                                    <button
                                      onClick={() => {
                                        const currentDep = employeeDependents[user.id] || 0;
                                        setEmployeeDependents({
                                          ...employeeDependents,
                                          [user.id]: currentDep + 1,
                                        });
                                      }}
                                      className="w-5 h-5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center font-bold text-neutral-600 active:scale-90 select-none cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="p-2 text-right font-mono text-neutral-450">{formatPrice(totalDeduction)}</td>
                                <td className="p-2 text-right font-mono font-black text-rose-550">
                                  {pit > 0 ? `-${formatPrice(pit)}` : '0 ₫'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* HISTORICAL SETTLED LOGS */}
        <div className="mt-8 border-t border-neutral-100 pt-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h5 className="text-[10px] font-black text-neutral-900 uppercase tracking-wider">Lịch sử chốt sổ & tờ khai thuế lũy kế</h5>
              <p className="text-[9px] text-neutral-400 font-medium">Danh sách các kỳ quyết toán thuế đã chốt sổ và lưu trữ chính thức.</p>
            </div>
            {taxRecords.length > 0 && (
              <button
                onClick={() => exportTaxRecordsToCSV(taxRecords)}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1 font-bold text-neutral-700 bg-white"
              >
                <Download className="w-3.5 h-3.5 text-neutral-600" />
                Xuất toàn bộ sổ thuế
              </button>
            )}
          </div>

          {taxRecords.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 italic text-xs border border-dashed rounded-2xl bg-neutral-50/20">
              Chưa có tờ khai quyết toán thuế nào được lưu.
            </div>
          ) : (
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
                    <th className="p-3 text-center">Hành động</th>
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
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteTaxRecord(rec.id)}
                          className="p-1.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 cursor-pointer active:scale-95 font-bold text-[8px] flex items-center justify-center gap-1 mx-auto"
                          title="Xóa bản ghi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* PRODUCT CRUD MANAGER PANEL */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide">Danh sách 28 sản phẩm & Điều phối danh mục</h4>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-850 active:scale-95 text-white text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm sản phẩm mới
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
          {productsList.map((prod: any) => (
            <div key={prod.id} className="border border-neutral-150 p-4 rounded-2xl bg-neutral-50/40 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative w-12 aspect-[4/5] rounded-xl bg-neutral-100 border overflow-hidden shrink-0">
                  <Image
                    src={prod.images[0]}
                    alt={prod.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-black text-neutral-900 truncate">{prod.name}</h5>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 block mt-0.5">{prod.category}</span>
                  <span className="text-xs font-black text-neutral-900 mt-1 block">{formatPrice(prod.price)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {editingProductId === prod.id ? (
                  <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border shadow-sm">
                    <div>
                      <label className="text-[8px] font-bold text-neutral-400 uppercase">Tên sản phẩm</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 border text-xs font-bold rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-neutral-400 uppercase">Giá bán (₫)</label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="w-full px-2 py-1 border text-xs font-bold rounded"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          updateGlobalProductPrice(prod.id, editPrice);
                          updateGlobalProductDetails(prod.id, editName, editDesc, editCat);
                          setEditingProductId(null);
                        }}
                        className="bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded hover:bg-emerald-600 transition-colors"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditingProductId(null)}
                        className="bg-neutral-200 text-neutral-700 text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded hover:bg-neutral-300 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProductId(prod.id);
                        setEditPrice(prod.price);
                        setEditName(prod.name);
                        setEditDesc(prod.description);
                        setEditCat(prod.category);
                      }}
                      className="bg-neutral-950 text-white text-[9px] font-bold uppercase tracking-widest px-3.5 py-2 rounded-xl hover:bg-neutral-850 transition-colors flex items-center gap-1 active:scale-95 cursor-pointer shadow-sm shadow-neutral-950/10"
                    >
                      <Edit2 className="w-3 h-3" />
                      Sửa giá
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc chắn muốn ngừng bán sản phẩm ${prod.name} không?`)) {
                          deleteGlobalProduct(prod.id);
                        }
                      }}
                      className="bg-rose-50 text-rose-605 text-[9px] font-bold uppercase tracking-widest px-3.5 py-2 rounded-xl hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer active:scale-95"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL THÊM SẢN PHẨM MỚI (GLASSMORPHISM POPUP) */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 border border-neutral-100 max-w-lg w-full rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddProductModal(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center cursor-pointer font-bold text-neutral-600"
            >
              ×
            </button>
            
            <h3 className="text-sm font-black text-neutral-900 tracking-widest uppercase mb-4">Thêm sản phẩm mới cao cấp</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const parsedSizes = newProductSizes;
                const colorArray = newProductColors.split(',').map((c) => {
                  const parts = c.trim().split('|');
                  return {
                    name: parts[0] || 'Default Color',
                    hex: parts[1] || '#999999',
                  };
                });
                const imageArray = newProductImages.split(',').map((img) => img.trim()).filter(Boolean);
                if (imageArray.length === 0) {
                  imageArray.push('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400');
                }

                addGlobalProduct(
                  newProductName,
                  newProductCategory,
                  newProductPrice,
                  newProductDescription,
                  imageArray,
                  colorArray,
                  parsedSizes,
                  newProductInitialStock
                );

                setNewProductName('');
                setNewProductPrice(0);
                setNewProductDescription('');
                setNewProductImages('');
                setNewProductColors('');
                setNewProductSizes(['S', 'M', 'L']);
                setNewProductInitialStock(20);
                setShowAddProductModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[9px] font-bold text-neutral-450 block mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-semibold text-neutral-805"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-neutral-450 block mb-1">Danh mục *</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border bg-white rounded-xl text-xs font-bold text-neutral-850"
                  >
                    <option value="Tops">Tops (Áo)</option>
                    <option value="Bottoms">Bottoms (Quần)</option>
                    <option value="Dresses">Dresses (Đầm)</option>
                    <option value="Outerwear">Outerwear (Áo khoác)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-neutral-450 block mb-1">Giá bán lẻ đề xuất (₫) *</label>
                  <input
                    type="number"
                    required
                    value={newProductPrice || ''}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-neutral-450 block mb-1">Link ảnh minh họa Unsplash (Có thể nhập nhiều link cách nhau bởi dấu phẩy) *</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/photo-..., https://images.unsplash.com/photo-..."
                  value={newProductImages}
                  onChange={(e) => setNewProductImages(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-neutral-450 block mb-1">Màu sắc (Tên|Hex, Tên|Hex) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Trắng|#FFFFFF, Đen|#111827"
                    value={newProductColors}
                    onChange={(e) => setNewProductColors(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-semibold text-neutral-750"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-neutral-450 block mb-1">Tồn kho chi nhánh ban đầu *</label>
                  <input
                    type="number"
                    required
                    value={newProductInitialStock}
                    onChange={(e) => setNewProductInitialStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-neutral-450 block mb-2">Hỗ trợ các kích cỡ (Sizes) *</label>
                <div className="flex gap-4">
                  {['S', 'M', 'L', 'XL', 'F'].map((size) => (
                    <label key={size} className="flex items-center gap-1.5 text-xs font-black text-neutral-800">
                      <input
                        type="checkbox"
                        checked={newProductSizes.includes(size)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewProductSizes((prev) => [...prev, size]);
                          } else {
                            setNewProductSizes((prev) => prev.filter((s) => s !== size));
                          }
                        }}
                        className="rounded border-neutral-350"
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-neutral-450 block mb-1">Mô tả sản phẩm *</label>
                <textarea
                  required
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-semibold text-neutral-805"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Thêm sản phẩm
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
