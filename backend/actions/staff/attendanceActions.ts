"use server";

import { prisma } from '@/database/db';
import { verifySession } from '@/backend/security/session';

// ----------------------------------------------------
// 1. Attendance Log
// ----------------------------------------------------
export async function getAttendanceLogsAction() {
  try {
    await verifySession(['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker']);
    return await prisma.attendanceLog.findMany({
      orderBy: { date: 'desc' }
    });
  } catch (error) {
    console.error('getAttendanceLogsAction error:', error);
    return [];
  }
}

export async function checkInAction(userId: string, name: string, role: string, branch: string) {
  try {
    const session = await verifySession(['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker']);
    const targetUserId = session.userId;
    const targetName = session.name;
    const targetRole = session.role;
    const targetBranch = session.branch || branch || 'Chi nhánh Quận 1';

    const today = new Date().toISOString().substring(0, 10);
    const nowTime = new Date().toTimeString().substring(0, 8);

    // Check if user already checked in today
    const exists = await prisma.attendanceLog.findFirst({
      where: { userId: targetUserId, date: today }
    });

    if (exists) return { success: false, message: 'Hôm nay bạn đã chấm công vào rồi!' };

    const newLog = await prisma.attendanceLog.create({
      data: {
        userId: targetUserId,
        name: targetName,
        role: targetRole,
        branch: targetBranch,
        date: today,
        timeIn: nowTime
      }
    });

    return { success: true, log: newLog };
  } catch (error) {
    console.error('checkInAction error:', error);
    return { success: false, message: 'Lỗi chấm công vào' };
  }
}

export async function checkOutAction(userId: string) {
  try {
    const session = await verifySession();
    const targetUserId = session.userId;

    const today = new Date().toISOString().substring(0, 10);
    const nowTime = new Date().toTimeString().substring(0, 8);

    const log = await prisma.attendanceLog.findFirst({
      where: { userId: targetUserId, date: today }
    });

    if (!log) return { success: false, message: 'Hôm nay bạn chưa chấm công vào!' };
    if (log.timeOut) return { success: false, message: 'Bạn đã chấm công ra hôm nay rồi!' };

    const updatedLog = await prisma.attendanceLog.update({
      where: { id: log.id },
      data: { timeOut: nowTime }
    });

    return { success: true, log: updatedLog };
  } catch (error) {
    console.error('checkOutAction error:', error);
    return { success: false, message: 'Lỗi chấm công ra' };
  }
}
