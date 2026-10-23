"use server";

import { prisma } from '@/database/db';
import { verifySession } from '@/backend/security/session';

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
