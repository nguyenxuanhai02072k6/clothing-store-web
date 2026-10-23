"use server";

import { prisma } from '@/database/db';
import { verifySession } from '@/backend/security/session';

// ----------------------------------------------------
// 4. Daily Report
// ----------------------------------------------------
export async function getDailyReportsAction() {
  try {
    await verifySession(['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker']);
    const list = await prisma.dailyReport.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return (list as any[]).map((r: any) => ({
      ...r,
      readAt: r.readAt || undefined,
      createdAt: r.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('getDailyReportsAction error:', error);
    return [];
  }
}

export async function submitDailyReportAction(
  userId: string,
  name: string,
  role: string,
  branch: string,
  title: string,
  content: string
) {
  try {
    const session = await verifySession();
    const targetUserId = session.userId;
    const targetName = session.name;
    const targetRole = session.role;
    const targetBranch = session.branch || branch || 'Chi nhánh Quận 1';

    const today = new Date().toISOString().substring(0, 10);
    const newReport = await prisma.dailyReport.create({
      data: {
        userId: targetUserId,
        name: targetName,
        role: targetRole,
        branch: targetBranch,
        reportDate: today,
        title,
        content,
        status: 'unread'
      }
    });

    return { success: true, report: { ...newReport, readAt: undefined, createdAt: newReport.createdAt.toISOString() } };
  } catch (error) {
    console.error('submitDailyReportAction error:', error);
    return { success: false, message: 'Lỗi gửi báo cáo ngày' };
  }
}

export async function markReportAsReadAction(reportId: string) {
  try {
    await verifySession(['director', 'manager']);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await prisma.dailyReport.update({
      where: { id: reportId },
      data: {
        status: 'read',
        readAt: nowStr
      }
    });
    return true;
  } catch (error) {
    console.error('markReportAsReadAction error:', error);
    return false;
  }
}

// ----------------------------------------------------
// 6. Announcement
// ----------------------------------------------------
export async function getAnnouncementsAction() {
  try {
    await verifySession(['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker']);
    const list = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return (list as any[]).map((a: any) => ({
      ...a,
      createdAt: a.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('getAnnouncementsAction error:', error);
    return [];
  }
}

export async function addAnnouncementAction(title: string, content: string, recipientType: string, senderName?: string) {
  try {
    const session = await verifySession(['director', 'manager']);
    if (!title?.trim() || !content?.trim()) {
      return { success: false, message: 'Tiêu đề và nội dung không được để trống' };
    }
    const validRecipients = ['all', 'accountant', 'branch_q1', 'branch_td'];
    const safeRecipient = validRecipients.includes(recipientType) ? recipientType : 'all';

    const newAnn = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        recipientType: safeRecipient,
        senderName: session.name || senderName || 'Ban Giám Đốc'
      }
    });

    return { success: true, announcement: { ...newAnn, createdAt: newAnn.createdAt.toISOString() } };
  } catch (error: any) {
    console.error('addAnnouncementAction error:', error);
    return { success: false, message: error.message || 'Lỗi tạo thông báo' };
  }
}

export async function deleteAnnouncementAction(id: string) {
  try {
    await verifySession(['director', 'manager']);
    await prisma.announcement.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    console.error('deleteAnnouncementAction error:', error);
    return { success: false, message: 'Lỗi xóa thông báo' };
  }
}
