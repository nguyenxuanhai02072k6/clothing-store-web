"use server"

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
    const callerSession = await verifySession(['director']);
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

// ----------------------------------------------------
// 8. Office Reservation
// ----------------------------------------------------
export async function getReservationsAction() {
  try {
    await verifySession(['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker']);
    const list = await prisma.officeReservation.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return (list as any[]).map((r: any) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      slot: r.slot as 'morning' | 'afternoon' | 'full',
      type: r.type as 'desk' | 'room_a' | 'room_b'
    }));
  } catch (error) {
    console.error('getReservationsAction error:', error);
    return [];
  }
}

export async function reserveDeskOrRoomAction(
  userId: string,
  userName: string,
  type: 'desk' | 'room_a' | 'room_b',
  resourceId: string,
  date: string,
  slot: 'morning' | 'afternoon' | 'full'
) {
  try {
    const session = await verifySession(['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker']);
    const exists = await prisma.officeReservation.findFirst({
      where: { type, resourceId, date, slot }
    });

    if (exists) {
      return { success: false, message: 'Tài nguyên này đã bị đặt vào thời gian trên!' };
    }

    const newRes = await prisma.officeReservation.create({
      data: {
        userId: session.userId || userId,
        userName: session.name || userName,
        type,
        resourceId,
        date,
        slot
      }
    });

    return {
      success: true,
      reservation: {
        ...newRes,
        createdAt: newRes.createdAt.toISOString(),
        slot,
        type
      }
    };
  } catch (error) {
    console.error('reserveDeskOrRoomAction error:', error);
    return { success: false, message: 'Lỗi đặt bàn/phòng họp' };
  }
}

export async function cancelReservationAction(id: string) {
  try {
    const session = await verifySession();
    const reservation = await prisma.officeReservation.findUnique({ where: { id } });
    if (!reservation) return false;
    
    // Check ownership or authority
    if (session.userId !== reservation.userId && !['director', 'manager'].includes(session.role)) {
      return false;
    }

    await prisma.officeReservation.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    console.error('cancelReservationAction error:', error);
    return false;
  }
}

// ----------------------------------------------------
// 9. Workspace Task
// ----------------------------------------------------
export async function getWorkspaceTasksAction() {
  try {
    await verifySession(['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker']);
    const list = await prisma.workspaceTask.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return (list as any[]).map((t: any) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      column: t.column as 'todo' | 'in_progress' | 'review' | 'done',
      priority: t.priority as 'low' | 'medium' | 'high'
    }));
  } catch (error) {
    console.error('getWorkspaceTasksAction error:', error);
    return [];
  }
}

export async function addWorkspaceTaskAction(
  title: string,
  description: string,
  priority: 'low' | 'medium' | 'high',
  assigneeId: string,
  assigneeName: string,
  dueDate: string
) {
  try {
    await verifySession(['director', 'manager']);
    const newTask = await prisma.workspaceTask.create({
      data: {
        title,
        description,
        priority,
        assigneeId,
        assigneeName,
        dueDate,
        column: 'todo'
      }
    });

    return {
      success: true,
      task: {
        ...newTask,
        createdAt: newTask.createdAt.toISOString(),
        column: 'todo' as const,
        priority
      }
    };
  } catch (error) {
    console.error('addWorkspaceTaskAction error:', error);
    return { success: false, message: 'Lỗi tạo công việc mới' };
  }
}

export async function updateWorkspaceTaskColumnAction(taskId: string, column: 'todo' | 'in_progress' | 'review' | 'done') {
  try {
    const session = await verifySession();
    const task = await prisma.workspaceTask.findUnique({ where: { id: taskId } });
    if (!task) return false;
    
    // Verify user is assignee or manager/director
    if (session.userId !== task.assigneeId && !['director', 'manager'].includes(session.role)) {
      return false;
    }

    await prisma.workspaceTask.update({
      where: { id: taskId },
      data: { column }
    });
    return true;
  } catch (error) {
    console.error('updateWorkspaceTaskColumnAction error:', error);
    return false;
  }
}

export async function deleteWorkspaceTaskAction(taskId: string) {
  try {
    await verifySession(['director', 'manager']);
    await prisma.workspaceTask.delete({
      where: { id: taskId }
    });
    return true;
  } catch (error) {
    console.error('deleteWorkspaceTaskAction error:', error);
    return false;
  }
}

// ----------------------------------------------------
// 10. Workspace Post
// ----------------------------------------------------
export async function getWorkspacePostsAction() {
  try {
    await verifySession(['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker']);
    const list = await prisma.workspacePost.findMany({
      include: { comments: true },
      orderBy: { createdAt: 'desc' }
    });

    return (list as any[]).map((p: any) => ({
      id: p.id,
      authorName: p.authorName,
      authorAvatar: p.authorAvatar || undefined,
      content: p.content,
      likes: p.likes,
      hearts: p.hearts,
      likedBy: JSON.parse(p.likedBy),
      heartedBy: JSON.parse(p.heartedBy),
      type: p.type as 'general' | 'birthday' | 'announcement',
      createdAt: p.createdAt.toISOString(),
      comments: (p.comments as any[]).map((c: any) => ({
        id: c.id,
        authorName: c.authorName,
        content: c.content,
        createdAt: c.createdAt.toISOString()
      }))
    }));
  } catch (error) {
    console.error('getWorkspacePostsAction error:', error);
    return [];
  }
}

export async function addWorkspacePostAction(authorName: string, authorAvatar: string | undefined, content: string, type: 'general' | 'birthday' | 'announcement') {
  try {
    const session = await verifySession(['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker']);
    const newPost = await prisma.workspacePost.create({
      data: {
        authorName: session.name || authorName,
        authorAvatar: authorAvatar || null,
        content,
        type,
        likedBy: '[]',
        heartedBy: '[]',
        likes: 0,
        hearts: 0
      }
    });

    return {
      success: true,
      post: {
        id: newPost.id,
        authorName: newPost.authorName,
        authorAvatar: newPost.authorAvatar || undefined,
        content: newPost.content,
        likes: 0,
        hearts: 0,
        likedBy: [],
        heartedBy: [],
        type,
        createdAt: newPost.createdAt.toISOString(),
        comments: []
      }
    };
  } catch (error) {
    console.error('addWorkspacePostAction error:', error);
    return { success: false, message: 'Lỗi tạo bài đăng mới' };
  }
}

export async function reactToPostAction(postId: string, reaction: 'like' | 'heart', _userId: string) {
  try {
    const session = await verifySession();
    const targetUserId = session.userId;
    const post = await prisma.workspacePost.findUnique({ where: { id: postId } });
    if (!post) return false;

    let likedBy: string[] = JSON.parse(post.likedBy);
    let heartedBy: string[] = JSON.parse(post.heartedBy);

    if (reaction === 'like') {
      const idx = likedBy.indexOf(targetUserId);
      if (idx !== -1) {
        likedBy.splice(idx, 1); // Unlike
      } else {
        likedBy.push(targetUserId); // Like
      }
    } else if (reaction === 'heart') {
      const idx = heartedBy.indexOf(targetUserId);
      if (idx !== -1) {
        heartedBy.splice(idx, 1); // Un-heart
      } else {
        heartedBy.push(targetUserId); // Heart
      }
    }

    await prisma.workspacePost.update({
      where: { id: postId },
      data: {
        likedBy: JSON.stringify(likedBy),
        heartedBy: JSON.stringify(heartedBy),
        likes: likedBy.length,
        hearts: heartedBy.length
      }
    });

    return true;
  } catch (error) {
    console.error('reactToPostAction error:', error);
    return false;
  }
}

export async function commentOnPostAction(postId: string, authorName: string, content: string) {
  try {
    const session = await verifySession();
    const targetAuthorName = session.name;
    const newComment = await prisma.workspaceComment.create({
      data: {
        postId,
        authorName: targetAuthorName,
        content
      }
    });

    return {
      success: true,
      comment: {
        id: newComment.id,
        authorName: newComment.authorName,
        content: newComment.content,
        createdAt: newComment.createdAt.toISOString()
      }
    };
  } catch (error) {
    console.error('commentOnPostAction error:', error);
    return { success: false, message: 'Lỗi gửi bình luận' };
  }
}

// ----------------------------------------------------
// 11. Wiki Doc
// ----------------------------------------------------
export async function getWikiDocsAction() {
  try {
    await verifySession(['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker']);
    return await prisma.wikiDoc.findMany({
      orderBy: { lastUpdated: 'desc' }
    });
  } catch (error) {
    console.error('getWikiDocsAction error:', error);
    return [];
  }
}

export async function addWikiDocAction(title: string, category: 'hr' | 'operations' | 'benefits', content: string) {
  try {
    await verifySession(['director', 'manager']);
    const today = new Date().toISOString().substring(0, 10);
    const newDoc = await prisma.wikiDoc.create({
      data: {
        title,
        category,
        content,
        lastUpdated: today
      }
    });

    return { success: true, doc: newDoc };
  } catch (error) {
    console.error('addWikiDocAction error:', error);
    return { success: false, message: 'Lỗi tạo tài liệu wiki mới' };
  }
}

export async function updateWikiDocAction(docId: string, title: string, category: 'hr' | 'operations' | 'benefits', content: string) {
  try {
    await verifySession(['director', 'manager']);
    const today = new Date().toISOString().substring(0, 10);
    const updated = await prisma.wikiDoc.update({
      where: { id: docId },
      data: {
        title,
        category,
        content,
        lastUpdated: today
      }
    });

    return { success: true, doc: updated };
  } catch (error) {
    console.error('updateWikiDocAction error:', error);
    return { success: false, message: 'Lỗi cập nhật tài liệu wiki' };
  }
}

// ----------------------------------------------------
// 12. Audit Log
// ----------------------------------------------------
export async function getAuditLogsAction() {
  try {
    await verifySession(['director', 'manager', 'accountant']);
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Last 100 entries
    });

    return (logs as any[]).map((l: any) => ({
      id: l.id,
      action: l.action,
      details: l.details,
      performedById: l.performedById || undefined,
      performedByName: l.performedByName || undefined,
      createdAt: l.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('getAuditLogsAction error:', error);
    return [];
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
