import { PayrollRecord, ExpenseItem, User } from '../../types';
import {
  getPayrollRecordsAction,
  paySalaryAction,
  addPayrollRecordAction,
  getExpensesListAction,
  addExpenseAction,
  deleteExpenseAction
} from '../actions/financeActions';

export const financeService = {
  getPayrollRecords: async (): Promise<PayrollRecord[]> => {
    return await getPayrollRecordsAction();
  },

  paySalary: async (recordId: string, performedById?: string, performedByName?: string): Promise<void> => {
    await paySalaryAction(recordId, performedById, performedByName);
  },

  addPayrollRecord: async (staff: User, month: string, salary: number, performedById?: string, performedByName?: string): Promise<boolean> => {
    return await addPayrollRecordAction(
      staff.id,
      staff.name,
      staff.role,
      staff.branch,
      month,
      salary,
      performedById,
      performedByName
    );
  },

  getExpensesList: async (): Promise<ExpenseItem[]> => {
    return await getExpensesListAction();
  },

  addExpense: async (
    title: string,
    amount: number,
    category: 'marketing' | 'operations' | 'equipment' | 'other',
    date: string,
    performedById?: string,
    performedByName?: string
  ): Promise<ExpenseItem> => {
    return await addExpenseAction(title, amount, category, date, performedById, performedByName);
  },

  deleteExpense: async (id: string, performedById?: string, performedByName?: string): Promise<boolean> => {
    return await deleteExpenseAction(id, performedById, performedByName);
  }
};
