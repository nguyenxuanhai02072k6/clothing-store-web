"use server";

import { prisma } from '@/database/db';
import { verifySession } from '@/backend/security/session';
import { FINANCIAL_ROLES, AUDIT_ROLES } from './erpRoles';

// ==========================================
// 5. CASH RECONCILIATION
// ==========================================

export async function getCashReconciliationsAction() {
  try {
    await verifySession(FINANCIAL_ROLES);

    let recons = await prisma.cashReconciliation.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (recons.length === 0) {
      const defaultRecon = {
        id: 'rc-1',
        date: '2026-05-30',
        branch: 'Chi nhánh Quận 1',
        cashierName: 'Nguyễn Thuỳ Lan',
        expectedCash: 5200000,
        actualCash: 5200000,
        discrepancy: 0,
        notes: 'Đối soát két chuẩn khớp',
        status: 'approved'
      };

      await prisma.cashReconciliation.upsert({
        where: { id: defaultRecon.id },
        update: {},
        create: defaultRecon
      });

      recons = await prisma.cashReconciliation.findMany({
        orderBy: { createdAt: 'desc' }
      });
    }

    return { success: true, data: recons };
  } catch (error: any) {
    console.error('getCashReconciliationsAction error:', error);
    return { success: false, error: error.message || 'Lỗi khi tải biên bản đối soát két' };
  }
}

export async function createCashReconciliationAction(data: {
  date: string;
  branch: string;
  cashierName: string;
  expectedCash: number;
  actualCash: number;
  discrepancy: number;
  notes?: string;
  status?: string;
}) {
  try {
    const session = await verifySession(FINANCIAL_ROLES);

    const record = await prisma.cashReconciliation.create({
      data: {
        date: data.date,
        branch: data.branch,
        cashierName: data.cashierName,
        expectedCash: data.expectedCash,
        actualCash: data.actualCash,
        discrepancy: data.discrepancy,
        notes: data.notes || null,
        status: data.status || 'approved'
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CASH_RECONCILIATION_LOGGED',
        details: `Đối soát két [${data.branch} - ${data.date}]: Dự kiến ${data.expectedCash.toLocaleString('vi-VN')}đ, Thực tế ${data.actualCash.toLocaleString('vi-VN')}đ, Lệch ${data.discrepancy.toLocaleString('vi-VN')}đ`,
        performedById: session.userId,
        performedByName: session.name
      }
    });

    return { success: true, data: record };
  } catch (error: any) {
    console.error('createCashReconciliationAction error:', error);
    return { success: false, error: error.message || 'Không thể ghi nhận đối soát két' };
  }
}

// ==========================================
// 6. TAX RECORDS
// ==========================================

export async function getTaxRecordsAction() {
  try {
    await verifySession(FINANCIAL_ROLES);

    const records = await prisma.taxRecord.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: records };
  } catch (error: any) {
    console.error('getTaxRecordsAction error:', error);
    return { success: false, error: error.message || 'Lỗi khi tải hồ sơ quyết toán thuế' };
  }
}

export async function settleTaxRecordAction(data: {
  period: string;
  revenue: number;
  cogs: number;
  expenses: number;
  salaries: number;
  restockCost: number;
  ebt: number;
  citRate: number;
  citAmount: number;
  pitAmount: number;
  netProfit: number;
  settledAt: string;
  accountantName: string;
}) {
  try {
    const session = await verifySession(AUDIT_ROLES);

    const record = await prisma.taxRecord.create({
      data: {
        period: data.period,
        revenue: data.revenue,
        cogs: data.cogs,
        expenses: data.expenses,
        salaries: data.salaries,
        restockCost: data.restockCost,
        ebt: data.ebt,
        citRate: data.citRate,
        citAmount: data.citAmount,
        pitAmount: data.pitAmount,
        netProfit: data.netProfit,
        settledAt: data.settledAt,
        accountantName: data.accountantName
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'TAX_RECORD_SETTLED',
        details: `Quyết toán thuế kỳ ${data.period}: EBT ${data.ebt.toLocaleString('vi-VN')}đ, Thuế TNDN ${data.citAmount.toLocaleString('vi-VN')}đ, Lợi nhuận ròng ${data.netProfit.toLocaleString('vi-VN')}đ`,
        performedById: session.userId,
        performedByName: session.name
      }
    });

    return { success: true, data: record };
  } catch (error: any) {
    console.error('settleTaxRecordAction error:', error);
    return { success: false, error: error.message || 'Không thể tạo bản quyết toán thuế' };
  }
}
