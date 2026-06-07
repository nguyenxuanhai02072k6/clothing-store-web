"use server"

import { prisma } from '../db';

export async function getChatSessionsAction() {
  try {
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
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    });

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId }
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

    // If initial message is provided, create the message record
    if (initialMessage) {
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          sender: 'customer',
          content: initialMessage
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
    await prisma.chatMessage.create({
      data: {
        sessionId,
        sender: 'customer',
        content: text
      }
    });

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        lastMessage: text
      }
    });
  } catch (error) {
    console.error('sendCustomerMessageAction error:', error);
  }
}

export async function sendCskhMessageAction(sessionId: string, text: string, cskhName: string) {
  try {
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
        lastMessage: text
      }
    });
  } catch (error) {
    console.error('sendCskhMessageAction error:', error);
  }
}

export async function acceptSessionAction(sessionId: string, cskhName: string) {
  try {
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: 'active',
        cskhName
      }
    });
  } catch (error) {
    console.error('acceptSessionAction error:', error);
  }
}

export async function closeSessionAction(sessionId: string) {
  try {
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
