"use server"

import { cookies } from 'next/headers';
import { prisma } from '@/database/db';
import { verifySession, getSessionUser } from '@/backend/security/session';

const CSKH_ROLES = ['director', 'manager', 'cskh'];

async function canAccessChatSession(chatSession: { id: string; customerEmail: string }): Promise<boolean> {
  const userSession = await getSessionUser();
  if (userSession && CSKH_ROLES.includes(userSession.role)) {
    return true;
  }
  if (userSession?.role === 'customer' && userSession.email.toLowerCase() === chatSession.customerEmail.toLowerCase()) {
    return true;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get(`novyn_chat_${chatSession.id}`)?.value;
  return token === '1';
}

export async function getChatSessionsAction() {
  try {
    await verifySession(CSKH_ROLES);
    const sessions = await prisma.chatSession.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    return (sessions as any[]).map((s: any) => ({
      id: s.id,
      customerId: s.customerEmail, // Map email as customerId to match frontend
      customerName: s.customerName,
      customerEmail: s.customerEmail,
      status: s.status as 'waiting' | 'active' | 'closed',
      cskhName: s.cskhName || undefined,
      createdAt: s.createdAt.toISOString(),
      lastMessageAt: s.updatedAt.toISOString(),
      messages: (s.messages as any[]).map((m: any) => ({
        id: m.id,
        sender: (m.sender === 'staff' ? 'cskh' : 'customer') as 'customer' | 'cskh',
        text: m.content,
        timestamp: m.createdAt.toISOString(),
        senderName: m.sender === 'staff' ? (s.cskhName || 'CSKH') : s.customerName
      }))
    }));
  } catch (error) {
    console.error('getChatSessionsAction error:', error);
    return [];
  }
}

export async function getChatMessagesAction(sessionId: string) {
  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) return [];

    const allowed = await canAccessChatSession(session);
    if (!allowed) {
      return [];
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    });

    return (messages as any[]).map((m: any) => ({
      id: m.id,
      sender: (m.sender === 'staff' ? 'cskh' : 'customer') as 'customer' | 'cskh',
      text: m.content,
      timestamp: m.createdAt.toISOString(),
      senderName: m.sender === 'staff' ? (session?.cskhName || 'CSKH') : (session?.customerName || 'Khách hàng')
    }));
  } catch (error) {
    console.error('getChatMessagesAction error:', error);
    return [];
  }
}

export async function getCustomerChatSessionAction(sessionId: string) {
  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) return null;

    const allowed = await canAccessChatSession(session);
    if (!allowed) {
      return null;
    }

    return {
      id: session.id,
      customerId: session.customerEmail,
      customerName: session.customerName,
      customerEmail: session.customerEmail,
      status: session.status as 'waiting' | 'active' | 'closed',
      cskhName: session.cskhName || undefined,
      createdAt: session.createdAt.toISOString(),
      lastMessageAt: session.updatedAt.toISOString(),
      messages: (session.messages as any[]).map((m: any) => ({
        id: m.id,
        sender: (m.sender === 'staff' ? 'cskh' : 'customer') as 'customer' | 'cskh',
        text: m.content,
        timestamp: m.createdAt.toISOString(),
        senderName: m.sender === 'staff' ? (session.cskhName || 'CSKH') : session.customerName
      }))
    };
  } catch (error) {
    console.error('getCustomerChatSessionAction error:', error);
    return null;
  }
}

export async function createChatSessionAction(
  customerId: string,
  customerName: string,
  customerEmail: string,
  customerAvatar?: string,
  initialMessage?: string
) {
  try {
    // Check if there is an active (non-closed) session for this email
    let session = await prisma.chatSession.findFirst({
      where: {
        customerEmail,
        status: { in: ['waiting', 'active'] }
      }
    });

    // If none exists, create a new one
    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          customerName,
          customerEmail,
          status: 'waiting',
          lastMessage: initialMessage || null
        }
      });
    } else if (initialMessage) {
      session = await prisma.chatSession.update({
        where: { id: session.id },
        data: { lastMessage: initialMessage }
      });
    }

    // Set HttpOnly possession cookie for guest chat ownership
    try {
      const cookieStore = await cookies();
      cookieStore.set(`novyn_chat_${session.id}`, '1', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
    } catch (e) {
      console.error('Failed to set chat possession cookie:', e);
    }

    // If initial message is provided, create the message record
    if (initialMessage && initialMessage.trim()) {
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          sender: 'customer',
          content: initialMessage.trim().substring(0, 2000)
        }
      });
    }

    return session.id;
  } catch (error) {
    console.error('createChatSessionAction error:', error);
    throw error;
  }
}

export async function sendCustomerMessageAction(sessionId: string, text: string, senderName: string) {
  try {
    const cleanText = text?.trim();
    if (!cleanText || cleanText.length > 2000) return;

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });
    if (!session || session.status === 'closed') return;

    const allowed = await canAccessChatSession(session);
    if (!allowed) {
      console.warn(`Unauthorized attempt to send customer message to session: ${sessionId}`);
      return;
    }

    await prisma.chatMessage.create({
      data: {
        sessionId,
        sender: 'customer',
        content: cleanText
      }
    });

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        lastMessage: cleanText
      }
    });
  } catch (error) {
    console.error('sendCustomerMessageAction error:', error);
  }
}

export async function sendCskhMessageAction(sessionId: string, text: string, cskhName: string) {
  try {
    const session = await verifySession(CSKH_ROLES);
    await prisma.chatMessage.create({
      data: {
        sessionId,
        sender: 'staff',
        content: text
      }
    });

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        lastMessage: text,
        cskhName: session.name || cskhName
      }
    });
  } catch (error) {
    console.error('sendCskhMessageAction error:', error);
  }
}

export async function acceptSessionAction(sessionId: string, cskhName: string) {
  try {
    const session = await verifySession(CSKH_ROLES);
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: 'active',
        cskhName: session.name || cskhName
      }
    });
  } catch (error) {
    console.error('acceptSessionAction error:', error);
  }
}

export async function closeSessionAction(sessionId: string) {
  try {
    await verifySession(CSKH_ROLES);
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: 'closed'
      }
    });
  } catch (error) {
    console.error('closeSessionAction error:', error);
  }
}
