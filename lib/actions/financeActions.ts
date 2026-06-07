"use server"

import { prisma } from '../db';

export async function getPayrollRecordsAction() {
  try {
    const records = await prisma.payrollRecord.findMany({
      orderBy: { month: 'desc' }
    });
    
    return (records as any[]).map((r: any) => ({
      id: r.id,
      userId: r.userId,
      name: r.name,
      role: r.role as any,
      branch: r.branch || undefined,
      salary: r.salary,
      month: r.month,
      status: r.status as 'paid' | 'pending',
      paymentDate: r.paymentDate || undefined
    }));
  } catch (error) {
    console.error('getPayrollRecordsAction error:', error);
    return [];
  }
}

export async function paySalaryAction(recordId: string, performedById?: string, performedByName?: string) {
  try {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    const record = await prisma.payrollRecord.update({
      where: { id: recordId },
      data: {
        status: 'paid',
        paymentDate: nowStr
      }
    });

    // Log to Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'PAYROLL_PAY',
        details: `Đã chi lương tháng ${record.month} cho ${record.name} số tiền ${record.salary}đ`,
        performedById,
        performedByName
      }
    });

    return true;
  } catch (error) {
    console.error('paySalaryAction error:', error);
    return false;
  }
}

export async function addPayrollRecordAction(
  userId: string,
  name: string,
  role: string,
  branch: string | undefined,
  month: string,
  salary: number,
  performedById?: string,
  performedByName?: string
) {
  try {
    const exists = await prisma.payrollRecord.findFirst({
      where: {
        userId,
        month
      }
    });

    if (exists) return false;

    await prisma.payrollRecord.create({
      data: {
        id: `pay-${Date.now()}`,
        userId,
        name,
        role,
        branch: branch || null,
        salary,
        month,
        status: 'pending'
      }
    });

    // Log to Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'PAYROLL_CREATE',
        details: `Đã tạo phiếu lương tháng ${month} cho nhân viên ${name} mức lương ${salary}đ`,
        performedById,
        performedByName
      }
    });

    return true;
  } catch (error) {
    console.error('addPayrollRecordAction error:', error);
    return false;
  }
}

export async function getExpensesListAction() {
  try {
    const list = await prisma.expenseItem.findMany({
      orderBy: { date: 'desc' }
    });

    return (list as any[]).map((e: any) => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      category: e.category as 'marketing' | 'operations' | 'equipment' | 'other',
      date: e.date
    }));
  } catch (error) {
    console.error('getExpensesListAction error:', error);
    return [];
  }
}

export async function addExpenseAction(
  title: string,
  amount: number,
  category: 'marketing' | 'operations' | 'equipment' | 'other',
  date: string,
  performedById?: string,
  performedByName?: string
) {
  try {
    const id = `exp-${Date.now()}`;
    const newExpense = await prisma.expenseItem.create({
      data: {
        id,
        title,
        amount,
        category,
        date
      }
    });

    // Log to Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'EXPENSE_ADD',
        details: `Đã chi tiêu khoản mới: ${title} số tiền ${amount}đ (Danh mục: ${category})`,
        performedById,
        performedByName
      }
    });

    return {
      id: newExpense.id,
      title: newExpense.title,
      amount: newExpense.amount,
      category: newExpense.category as 'marketing' | 'operations' | 'equipment' | 'other',
      date: newExpense.date
    };
  } catch (error) {
    console.error('addExpenseAction error:', error);
    throw error;
  }
}

export async function deleteExpenseAction(id: string, performedById?: string, performedByName?: string) {
  try {
    const expense = await prisma.expenseItem.delete({
      where: { id }
    });

    // Log to Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'EXPENSE_DELETE',
        details: `Đã xóa khoản chi tiêu: ${expense.title} số tiền ${expense.amount}đ`,
        performedById,
        performedByName
      }
    });

    return true;
  } catch (error) {
    console.error('deleteExpenseAction error:', error);
    return false;
  }
}
