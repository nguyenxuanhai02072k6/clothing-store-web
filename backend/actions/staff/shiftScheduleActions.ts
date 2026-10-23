"use server";

import { prisma } from '@/database/db';
import { verifySession } from '@/backend/security/session';

// ----------------------------------------------------
// 5. Shift Request
// ----------------------------------------------------
export async function getShiftRequestsAction() {
  try {
    await verifySession(['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker']);
    const list = await prisma.shiftRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return (list as any[]).map((r: any) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      shiftType: r.shiftType as 'morning' | 'afternoon' | 'evening',
      status: r.status as 'pending' | 'approved' | 'rejected'
    }));
  } catch (error) {
    console.error('getShiftRequestsAction error:', error);
    return [];
  }
}

export async function requestShiftAction(
  userId: string,
  name: string,
  role: string,
  branch: string,
  date: string,
  shiftType: 'morning' | 'afternoon' | 'evening'
) {
  try {
    const session = await verifySession(['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker']);
    const safeUserId = session.userId;
    const safeName = session.name;
    const safeRole = session.role;
    const safeBranch = session.branch || branch || 'Chi nhánh Quận 1';

    const newRequest = await prisma.shiftRequest.create({
      data: {
        userId: safeUserId,
        name: safeName,
        role: safeRole,
        branch: safeBranch,
        date,
        shiftType,
        status: 'pending'
      }
    });

    return { success: true, request: { ...newRequest, createdAt: newRequest.createdAt.toISOString(), shiftType } };
  } catch (error: any) {
    console.error('requestShiftAction error:', error);
    return { success: false, message: error.message || 'Lỗi đăng ký ca làm' };
  }
}

export async function approveShiftRequestAction(requestId: string, managerComment?: string) {
  try {
    await verifySession(['director', 'manager']);
    await prisma.shiftRequest.update({
      where: { id: requestId },
      data: {
        status: 'approved',
        managerComment
      }
    });
    return true;
  } catch (error) {
    console.error('approveShiftRequestAction error:', error);
    return false;
  }
}

export async function rejectShiftRequestAction(requestId: string, managerComment?: string) {
  try {
    await verifySession(['director', 'manager']);
    await prisma.shiftRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        managerComment
      }
    });
    return true;
  } catch (error) {
    console.error('rejectShiftRequestAction error:', error);
    return false;
  }
}

export async function addShiftDirectlyAction(
  userId: string,
  name: string,
  role: string,
  branch: string,
  date: string,
  shiftType: string,
  comment?: string
) {
  try {
    await verifySession(['director', 'manager']);
    const newShift = await prisma.shiftRequest.create({
      data: {
        id: `shf-${Date.now()}`,
        userId,
        name,
        role,
        branch,
        date,
        shiftType,
        status: 'approved',
        managerComment: comment || 'Quản lý xếp lịch trực tiếp'
      }
    });
    return { success: true, request: { ...newShift, createdAt: newShift.createdAt.toISOString(), shiftType } };
  } catch (error) {
    console.error('addShiftDirectlyAction error:', error);
    return { success: false, message: 'Lỗi xếp lịch trực tiếp' };
  }
}

export async function deleteShiftRequestAction(requestId: string) {
  try {
    await verifySession(['director', 'manager']);
    await prisma.shiftRequest.delete({
      where: { id: requestId }
    });
    return true;
  } catch (error) {
    console.error('deleteShiftRequestAction error:', error);
    return false;
  }
}

// ----------------------------------------------------
// 7. Shift Swap Request
// ----------------------------------------------------
export async function getShiftSwapsAction() {
  try {
    await verifySession(['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker']);
    const list = await prisma.shiftSwapRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return (list as any[]).map((s: any) => ({
      id: s.id,
      fromUserId: s.fromUserId,
      fromUserName: s.fromUserName,
      fromShiftId: s.fromShiftId,
      fromShiftDate: s.fromShiftDate,
      fromShiftType: s.fromShiftType as 'morning' | 'afternoon' | 'evening',
      toUserId: s.toUserId,
      toUserName: s.toUserName,
      toShiftId: s.toShiftId,
      toShiftDate: s.toShiftDate,
      toShiftType: s.toShiftType as 'morning' | 'afternoon' | 'evening',
      branch: s.branch,
      status: s.status as 'pending' | 'approved' | 'rejected',
      createdAt: s.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('getShiftSwapsAction error:', error);
    return [];
  }
}

export async function requestShiftSwapAction(
  fromUserId: string,
  fromUserName: string,
  fromShiftId: string,
  fromShiftDate: string,
  fromShiftType: 'morning' | 'afternoon' | 'evening',
  toUserId: string,
  toUserName: string,
  toShiftId: string,
  toShiftDate: string,
  toShiftType: 'morning' | 'afternoon' | 'evening',
  branch: string
) {
  try {
    const session = await verifySession(['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker']);
    const safeFromUserId = session.userId;
    const safeFromUserName = session.name;

    const newReq = await prisma.shiftSwapRequest.create({
      data: {
        fromUserId: safeFromUserId,
        fromUserName: safeFromUserName,
        fromShiftId,
        fromShiftDate,
        fromShiftType,
        toUserId,
        toUserName,
        toShiftId,
        toShiftDate,
        toShiftType,
        branch: session.branch || branch || 'Chi nhánh Quận 1',
        status: 'pending'
      }
    });

    return {
      success: true,
      request: {
        id: newReq.id,
        fromUserId: safeFromUserId,
        fromUserName: safeFromUserName,
        fromShiftId,
        fromShiftDate,
        fromShiftType,
        toUserId,
        toUserName,
        toShiftId,
        toShiftDate,
        toShiftType,
        branch: session.branch || branch || 'Chi nhánh Quận 1',
        status: 'pending' as const,
        createdAt: newReq.createdAt.toISOString()
      }
    };
  } catch (error: any) {
    console.error('requestShiftSwapAction error:', error);
    return { success: false, message: error.message || 'Lỗi gửi yêu cầu đổi ca' };
  }
}

export async function approveShiftSwapAction(requestId: string) {
  try {
    const session = await verifySession();
    const swapReq = await prisma.shiftSwapRequest.findUnique({
      where: { id: requestId }
    });
    if (!swapReq) return false;

    // Only the target employee (toUserId) or manager/director can approve the swap
    if (session.userId !== swapReq.toUserId && !['director', 'manager'].includes(session.role)) {
      return false;
    }

    await prisma.shiftSwapRequest.update({
      where: { id: requestId },
      data: { status: 'approved' }
    });
    return true;
  } catch (error) {
    console.error('approveShiftSwapAction error:', error);
    return false;
  }
}

export async function rejectShiftSwapAction(requestId: string) {
  try {
    const session = await verifySession();
    const swapReq = await prisma.shiftSwapRequest.findUnique({
      where: { id: requestId }
    });
    if (!swapReq) return false;
    
    // Check if caller is part of swap, or manager/director
    if (session.userId !== swapReq.toUserId && session.userId !== swapReq.fromUserId && !['director', 'manager'].includes(session.role)) {
      return false;
    }

    await prisma.shiftSwapRequest.update({
      where: { id: requestId },
      data: { status: 'rejected' }
    });
    return true;
  } catch (error) {
    console.error('rejectShiftSwapAction error:', error);
    return false;
  }
}
