"use server";

import { prisma } from '@/database/db';
import { verifySession } from '@/backend/security/session';

// ----------------------------------------------------
// 2. Leave Request
// ----------------------------------------------------
export async function getLeaveRequestsAction() {
  try {
    await verifySession(['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker']);
    const list = await prisma.leaveRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return (list as any[]).map((r: any) => ({
      ...r,
      createdAt: r.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('getLeaveRequestsAction error:', error);
    return [];
  }
}

export async function requestLeaveAction(
  userId: string,
  name: string,
  role: string,
  branch: string,
  startDate: string,
  endDate: string,
  reason: string
) {
  try {
    const session = await verifySession();
    const targetUserId = session.userId;
    const targetName = session.name;
    const targetRole = session.role;
    const targetBranch = session.branch || branch || 'Chi nhánh Quận 1';

    const newRequest = await prisma.leaveRequest.create({
      data: {
        userId: targetUserId,
        name: targetName,
        role: targetRole,
        branch: targetBranch,
        startDate,
        endDate,
        reason,
        status: 'pending'
      }
    });

    return { success: true, request: { ...newRequest, createdAt: newRequest.createdAt.toISOString() } };
  } catch (error) {
    console.error('requestLeaveAction error:', error);
    return { success: false, message: 'Lỗi gửi yêu cầu nghỉ phép' };
  }
}

export async function approveLeaveRequestAction(requestId: string, managerComment?: string) {
  try {
    await verifySession(['director', 'manager']);
    await prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: 'approved',
        managerComment
      }
    });
    return true;
  } catch (error) {
    console.error('approveLeaveRequestAction error:', error);
    return false;
  }
}

export async function rejectLeaveRequestAction(requestId: string, managerComment?: string) {
  try {
    await verifySession(['director', 'manager']);
    await prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        managerComment
      }
    });
    return true;
  } catch (error) {
    console.error('rejectLeaveRequestAction error:', error);
    return false;
  }
}

// ----------------------------------------------------
// 3. Salary Request
// ----------------------------------------------------
export async function getSalaryRequestsAction() {
  try {
    await verifySession(['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker']);
    const list = await prisma.salaryRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return (list as any[]).map((r: any) => ({
      ...r,
      createdAt: r.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('getSalaryRequestsAction error:', error);
    return [];
  }
}

export async function requestSalaryIncreaseAction(
  userId: string,
  name: string,
  role: string,
  branch: string,
  currentSalary: number,
  proposedSalary: number,
  reason: string
) {
  try {
    const session = await verifySession();
    const targetUserId = session.userId;
    const targetName = session.name;
    const targetRole = session.role;
    const targetBranch = session.branch || branch || 'Chi nhánh Quận 1';

    const newRequest = await prisma.salaryRequest.create({
      data: {
        userId: targetUserId,
        name: targetName,
        role: targetRole,
        branch: targetBranch,
        currentSalary,
        proposedSalary,
        reason,
        status: 'pending'
      }
    });

    return { success: true, request: { ...newRequest, createdAt: newRequest.createdAt.toISOString() } };
  } catch (error) {
    console.error('requestSalaryIncreaseAction error:', error);
    return { success: false, message: 'Lỗi gửi yêu cầu tăng lương' };
  }
}

export async function approveSalaryRequestAction(requestId: string, directorComment?: string) {
  try {
    await verifySession(['director']);
    const request = await prisma.salaryRequest.findUnique({ where: { id: requestId } });
    if (!request) return false;

    await prisma.$transaction(async (tx: any) => {
      // Approve request
      await tx.salaryRequest.update({
        where: { id: requestId },
        data: {
          status: 'approved',
          directorComment
        }
      });

      // Update User Salary
      await tx.user.update({
        where: { id: request.userId },
        data: { salary: request.proposedSalary }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: 'SALARY_ADJUST',
          details: `Đã duyệt tăng lương đề xuất cho ${request.name} từ ${request.currentSalary}đ lên ${request.proposedSalary}đ.`
        }
      });
    });

    return true;
  } catch (error) {
    console.error('approveSalaryRequestAction error:', error);
    return false;
  }
}

export async function rejectSalaryRequestAction(requestId: string, directorComment?: string) {
  try {
    await verifySession(['director']);
    await prisma.salaryRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        directorComment
      }
    });
    return true;
  } catch (error) {
    console.error('rejectSalaryRequestAction error:', error);
    return false;
  }
}
