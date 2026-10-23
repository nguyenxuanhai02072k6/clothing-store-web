"use server";

import { prisma } from '@/database/db';
import { verifySession } from '@/backend/security/session';

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
