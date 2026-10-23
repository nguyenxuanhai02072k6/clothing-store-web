import { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';

interface FinanceHookProps {
  allOrders: any[];
  expensesList: any[];
  restockRecords: any[];
  payrollRecords: any[];
}

export function useInternalFinanceCalculations({
  allOrders,
  expensesList,
  restockRecords,
  payrollRecords,
}: FinanceHookProps) {
  const { showToast } = useToast();
  const [taxRecords, setTaxRecords] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTax = localStorage.getItem('novyn_tax_records');
      if (storedTax) {
        try {
          setTaxRecords(JSON.parse(storedTax));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const calculateDynamicPITForSalary = (
    gross: number,
    personalDeduct: number,
    depDeduct: number,
    dependents: number
  ): number => {
    const totalDeduction = personalDeduct + dependents * depDeduct;
    if (gross <= totalDeduction) return 0;
    const taxableIncome = gross - totalDeduction;

    if (taxableIncome <= 5000000) {
      return taxableIncome * 0.05;
    } else if (taxableIncome <= 10000000) {
      return 5000000 * 0.05 + (taxableIncome - 5000000) * 0.1;
    } else if (taxableIncome <= 18000000) {
      return 5000000 * 0.05 + 5000000 * 0.1 + (taxableIncome - 10000000) * 0.15;
    } else if (taxableIncome <= 32000000) {
      return 5000000 * 0.05 + 5000000 * 0.1 + 8000000 * 0.15 + (taxableIncome - 18000000) * 0.2;
    } else {
      return (
        5000000 * 0.05 +
        5000000 * 0.1 +
        8000000 * 0.15 +
        14000000 * 0.2 +
        (taxableIncome - 32000000) * 0.25
      );
    }
  };

  const getPeriodFinances = (period: string) => {
    let revenue = 0;
    let cogs = 0;
    let expenses = 0;
    let restockCost = 0;
    let salaries = 0;

    allOrders.forEach((o: any) => {
      if (o.status !== 'completed') return;
      const date = o.createdAt.split(' ')[0];
      if (date.startsWith(period)) {
        revenue += o.total;
        cogs += o.total * 0.4;
      }
    });

    expensesList.forEach((e: any) => {
      if (e.date.startsWith(period)) {
        expenses += e.amount;
      }
    });

    restockRecords.forEach((r: any) => {
      if (r.status !== 'approved') return;
      const date = r.createdAt.split(' ')[0];
      if (date.startsWith(period)) {
        restockCost += r.cost;
      }
    });

    payrollRecords.forEach((p: any) => {
      if (p.status !== 'paid') return;
      if (p.month === period) {
        salaries += p.salary;
      }
    });

    const ebt = revenue - cogs - expenses - restockCost - salaries;

    return {
      revenue,
      cogs,
      expenses,
      restockCost,
      salaries,
      ebt,
    };
  };

  const handleSaveTaxRecord = (record: any) => {
    const exists = taxRecords.some(r => r.period === record.period);
    if (exists) {
      if (
        !confirm(
          `Kỳ thuế ${record.period} đã có tờ khai quyết toán thuế trước đó. Bạn có muốn ghi đè lên bản ghi cũ không?`
        )
      ) {
        return;
      }
    }
    const filtered = taxRecords.filter(r => r.period !== record.period);
    const updated = [record, ...filtered];
    setTaxRecords(updated);
    localStorage.setItem('novyn_tax_records', JSON.stringify(updated));
    showToast(`Khóa sổ và lưu tờ khai quyết toán thuế kỳ ${record.period} thành công!`, 'success');
  };

  const handleDeleteTaxRecord = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa lịch sử khóa sổ thuế này?')) {
      const updated = taxRecords.filter(r => r.id !== id);
      setTaxRecords(updated);
      localStorage.setItem('novyn_tax_records', JSON.stringify(updated));
      showToast('Đã xóa bản ghi thuế.', 'info');
    }
  };

  const exportTaxRecordsToCSV = (records: any[]) => {
    const headers = [
      'Ky thue',
      'Doanh thu gop',
      'Gia von COGS',
      'Chi phi van hanh',
      'Chi phi luong',
      'Chi phi nhap hang',
      'LNTT (EBT)',
      'Thue suat CIT',
      'Thue CIT',
      'Thue PIT nhan su',
      'Loi nhuan sau thue',
      'Ngay khoa so',
      'Ke toan truong',
    ];
    const rows = records.map(r => [
      r.period,
      r.revenue,
      r.cogs,
      r.expenses,
      r.salaries,
      r.restockCost,
      r.ebt,
      r.citRate + '%',
      r.citAmount,
      r.pitAmount,
      r.netProfit,
      r.settledAt,
      r.accountantName,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'NOVYN_WEAR_Bao_Cao_Quyet_Toan_Thue.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPLToCSV = (ledger: any[]) => {
    const headers = [
      'Tên sản phẩm',
      'Danh mục',
      'Đã bán (chiếc)',
      'Doanh thu (VND)',
      'Đã nhập (chiếc)',
      'Vốn nhập (VND)',
      'Lợi nhuận ròng (VND)',
    ];
    const rows = ledger.map(item => [
      item.product.name,
      item.product.category,
      item.soldQty,
      item.revenue,
      item.stockedQty,
      item.importCost,
      item.netProfit,
    ]);

    let csvContent = '\uFEFF' + headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NOVYN_WEAR_Product_PL_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDailyFinances = () => {
    const dailyData: Record<
      string,
      {
        date: string;
        revenue: number;
        cogs: number;
        expenses: number;
        restockCost: number;
        salaryPaid: number;
        profit: number;
        orderCount: number;
      }
    > = {};

    allOrders.forEach((o: any) => {
      if (o.status !== 'completed') return;
      const date = o.createdAt.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, revenue: 0, cogs: 0, expenses: 0, restockCost: 0, salaryPaid: 0, profit: 0, orderCount: 0 };
      }
      dailyData[date].revenue += o.total;
      dailyData[date].cogs += o.total * 0.4;
      dailyData[date].orderCount += 1;
    });

    expensesList.forEach((e: any) => {
      const date = e.date;
      if (!dailyData[date]) {
        dailyData[date] = { date, revenue: 0, cogs: 0, expenses: 0, restockCost: 0, salaryPaid: 0, profit: 0, orderCount: 0 };
      }
      dailyData[date].expenses += e.amount;
    });

    restockRecords.forEach((r: any) => {
      if (r.status && r.status !== 'approved') return;
      const date = r.createdAt.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, revenue: 0, cogs: 0, expenses: 0, restockCost: 0, salaryPaid: 0, profit: 0, orderCount: 0 };
      }
      dailyData[date].restockCost += r.cost;
    });

    payrollRecords.forEach((p: any) => {
      if (p.status !== 'paid' || !p.paymentDate) return;
      const date = p.paymentDate.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, revenue: 0, cogs: 0, expenses: 0, restockCost: 0, salaryPaid: 0, profit: 0, orderCount: 0 };
      }
      dailyData[date].salaryPaid += p.salary;
    });

    const dates = Object.keys(dailyData).sort((a, b) => b.localeCompare(a));
    return dates.map(date => {
      const day = dailyData[date];
      day.profit = day.revenue - day.cogs - day.expenses - day.restockCost - day.salaryPaid;
      return day;
    });
  };

  const exportDailyPLToCSV = (dailyLedger: any[]) => {
    const headers = [
      'Ngày',
      'Số đơn hàng',
      'Doanh thu (+)',
      'Giá vốn COGS (-)',
      'Chi phí vận hành (-)',
      'Chi phí nhập kho (-)',
      'Lương đã trả (-)',
      'Lợi nhuận ròng (=)',
    ];
    const rows = dailyLedger.map(item => [
      item.date,
      item.orderCount,
      item.revenue,
      item.cogs,
      item.expenses,
      item.restockCost,
      item.salaryPaid,
      item.profit,
    ]);

    let csvContent = '\uFEFF' + headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NOVYN_WEAR_Daily_Profit_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    taxRecords,
    setTaxRecords,
    calculateDynamicPITForSalary,
    getPeriodFinances,
    handleSaveTaxRecord,
    handleDeleteTaxRecord,
    exportTaxRecordsToCSV,
    exportPLToCSV,
    getDailyFinances,
    exportDailyPLToCSV,
  };
}
