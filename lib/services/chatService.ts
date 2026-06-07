import { ChatSession, ChatMessage } from '../../types';
export type { ChatSession, ChatMessage };
import {
  getChatSessionsAction,
  createChatSessionAction,
  sendCustomerMessageAction,
  sendCskhMessageAction,
  acceptSessionAction,
  closeSessionAction
} from '../actions/chatActions';

export const chatService = {
  getChatSessions: async (): Promise<ChatSession[]> => {
    const sessions = await getChatSessionsAction();
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return sessions.filter(s => {
      if (s.status === 'closed') {
        return new Date(s.lastMessageAt).getTime() > cutoff;
      }
      return true;
    }) as any[];
  },

  createChatSession: async (
    customerId: string,
    customerName: string,
    customerEmail: string,
    customerAvatar?: string,
    initialMessage?: string
  ): Promise<string> => {
    return await createChatSessionAction(customerId, customerName, customerEmail, customerAvatar, initialMessage);
  },

  sendCustomerMessage: async (sessionId: string, text: string, senderName: string): Promise<void> => {
    await sendCustomerMessageAction(sessionId, text, senderName);
  },

  sendCskhMessage: async (sessionId: string, text: string, cskhName: string): Promise<void> => {
    await sendCskhMessageAction(sessionId, text, cskhName);
  },

  acceptSession: async (sessionId: string, cskhName: string): Promise<void> => {
    await acceptSessionAction(sessionId, cskhName);
  },

  closeSession: async (sessionId: string): Promise<void> => {
    await closeSessionAction(sessionId);
  }
};
