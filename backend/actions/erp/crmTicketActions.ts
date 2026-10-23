"use server";

import { prisma } from '@/database/db';
import { verifySession } from '@/backend/security/session';
import { STAFF_ROLES, FINANCIAL_ROLES } from './erpRoles';

// ==========================================
// 1. CRM CLIENTS
// ==========================================

export async function getCRMClientsAction() {
  try {
    await verifySession(STAFF_ROLES);

    let clients = await prisma.cRMClient.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (clients.length === 0) {
      const defaultClients = [
        { id: 'crm-1', name: 'Lâm Khánh Vy', email: 'customer@novynwear.com', phone: '0912345678', totalSpent: 22500000, points: 225, tier: 'Gold' },
        { id: 'crm-2', name: 'Đoàn Phương Linh', email: 'linh.dp@gmail.com', phone: '0987654321', totalSpent: 35000000, points: 350, tier: 'Platinum' },
        { id: 'crm-3', name: 'Nguyễn Bích Thuỷ', email: 'thuy.nb@gmail.com', phone: '0909090909', totalSpent: 58000000, points: 580, tier: 'VVIP' },
        { id: 'crm-4', name: 'Hoàng Hải Nam', email: 'nam.hh@gmail.com', phone: '0933221100', totalSpent: 1200000, points: 12, tier: 'Regular' }
      ];

      for (const client of defaultClients) {
        await prisma.cRMClient.upsert({
          where: { id: client.id },
          update: {},
          create: client
        });
      }

      clients = await prisma.cRMClient.findMany({
        orderBy: { createdAt: 'desc' }
      });
    }

    return { success: true, data: clients };
  } catch (error: any) {
    console.error('getCRMClientsAction error:', error);
    return { success: false, error: error.message || 'Lỗi khi tải danh sách khách hàng CRM' };
  }
}

export async function createCRMClientAction(data: {
  name: string;
  email: string;
  phone: string;
  totalSpent?: number;
  points?: number;
  tier?: string;
}) {
  try {
    const session = await verifySession(STAFF_ROLES);

    const client = await prisma.cRMClient.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        totalSpent: data.totalSpent || 0,
        points: data.points || 0,
        tier: data.tier || 'Regular'
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CRM_CLIENT_CREATED',
        details: `Thêm khách hàng CRM: ${client.name} (${client.phone})`,
        performedById: session.userId,
        performedByName: session.name
      }
    });

    return { success: true, data: client };
  } catch (error: any) {
    console.error('createCRMClientAction error:', error);
    return { success: false, error: error.message || 'Không thể tạo khách hàng mới' };
  }
}

export async function updateCRMClientLoyaltyAction(clientId: string, addedSpent: number) {
  try {
    const session = await verifySession(FINANCIAL_ROLES);

    const client = await prisma.cRMClient.findUnique({ where: { id: clientId } });
    if (!client) {
      return { success: false, error: 'Khách hàng không tồn tại' };
    }

    const newSpent = client.totalSpent + addedSpent;
    const newPoints = Math.floor(newSpent / 100000);
    let newTier = 'Regular';
    if (newSpent >= 50000000) newTier = 'VVIP';
    else if (newSpent >= 30000000) newTier = 'Platinum';
    else if (newSpent >= 10000000) newTier = 'Gold';

    const updated = await prisma.cRMClient.update({
      where: { id: clientId },
      data: {
        totalSpent: newSpent,
        points: newPoints,
        tier: newTier
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CRM_CLIENT_LOYALTY_UPDATED',
        details: `Cộng tích lũy khách ${updated.name}: +${addedSpent.toLocaleString('vi-VN')}đ (Tổng: ${newSpent.toLocaleString('vi-VN')}đ, Hạng: ${newTier})`,
        performedById: session.userId,
        performedByName: session.name
      }
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('updateCRMClientLoyaltyAction error:', error);
    return { success: false, error: error.message || 'Không thể cập nhật điểm tích lũy' };
  }
}

// ==========================================
// 2. CSKH TICKETS
// ==========================================

export async function getCSKHTicketsAction() {
  try {
    await verifySession(STAFF_ROLES);

    let tickets = await prisma.cSKHTicket.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (tickets.length === 0) {
      const defaultTickets = [
        { id: 'tk-1', customerName: 'Lâm Khánh Vy', category: 'Đổi size', description: 'Đổi quần Linen size M sang size S do mặc bị rộng eo.', status: 'pending' },
        { id: 'tk-2', customerName: 'Đoàn Phương Linh', category: 'Trả hàng lỗi', description: 'Áo khoác Blazer tuyết mưa bị sứt chỉ cánh tay phải.', status: 'resolved' }
      ];

      for (const t of defaultTickets) {
        await prisma.cSKHTicket.upsert({
          where: { id: t.id },
          update: {},
          create: t
        });
      }

      tickets = await prisma.cSKHTicket.findMany({
        orderBy: { createdAt: 'desc' }
      });
    }

    return { success: true, data: tickets };
  } catch (error: any) {
    console.error('getCSKHTicketsAction error:', error);
    return { success: false, error: error.message || 'Lỗi khi tải danh sách phiếu khiếu nại' };
  }
}

export async function createCSKHTicketAction(data: {
  customerName: string;
  category: string;
  description: string;
}) {
  try {
    const session = await verifySession(STAFF_ROLES);

    const ticket = await prisma.cSKHTicket.create({
      data: {
        customerName: data.customerName,
        category: data.category,
        description: data.description,
        status: 'pending'
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CSKH_TICKET_CREATED',
        details: `Tạo phiếu khiếu nại (${ticket.category}) cho khách ${ticket.customerName}`,
        performedById: session.userId,
        performedByName: session.name
      }
    });

    return { success: true, data: ticket };
  } catch (error: any) {
    console.error('createCSKHTicketAction error:', error);
    return { success: false, error: error.message || 'Không thể tạo phiếu khiếu nại' };
  }
}

export async function updateCSKHTicketStatusAction(ticketId: string, status: string) {
  try {
    const session = await verifySession(STAFF_ROLES);

    const ticket = await prisma.cSKHTicket.update({
      where: { id: ticketId },
      data: { status }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CSKH_TICKET_STATUS_UPDATED',
        details: `Cập nhật phiếu CSKH ${ticket.id} thành: ${status}`,
        performedById: session.userId,
        performedByName: session.name
      }
    });

    return { success: true, data: ticket };
  } catch (error: any) {
    console.error('updateCSKHTicketStatusAction error:', error);
    return { success: false, error: error.message || 'Không thể cập nhật trạng thái phiếu' };
  }
}
