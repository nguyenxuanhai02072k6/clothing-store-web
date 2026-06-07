'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatService, ChatSession, ChatMessage } from '../lib/services/chatService';

interface ChatContextType {
  chatSessions: ChatSession[];
  activeSessions: ChatSession[];
  waitingSessions: ChatSession[];
  createChatSession: (customerId: string, customerName: string, customerEmail: string, customerAvatar?: string, initialMessage?: string) => string;
  sendCustomerMessage: (sessionId: string, text: string, senderName: string) => void;
  sendCskhMessage: (sessionId: string, text: string, cskhName: string) => void;
  acceptSession: (sessionId: string, cskhName: string) => void;
  closeSession: (sessionId: string) => void;
  getSessionById: (sessionId: string) => ChatSession | undefined;
  unreadCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  // Load from localStorage on mount via service
  useEffect(() => {
    chatService.getChatSessions().then(setChatSessions);
  }, []);

  // Poll for external changes (simulates real-time between tabs)
  useEffect(() => {
    const interval = setInterval(() => {
      chatService.getChatSessions().then(parsed => {
        // Only update if data actually changed
        setChatSessions(prev => {
          const prevStr = JSON.stringify(prev);
          const newStr = JSON.stringify(parsed);
          if (prevStr !== newStr) return parsed;
          return prev;
        });
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const createChatSession = (
    customerId: string,
    customerName: string,
    customerEmail: string,
    customerAvatar?: string,
    initialMessage?: string
  ): string => {
    const sessionId = `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    chatService.createChatSession(customerId, customerName, customerEmail, customerAvatar, initialMessage).then(() => {
      chatService.getChatSessions().then(setChatSessions);
    });
    return sessionId;
  };

  const sendCustomerMessage = (sessionId: string, text: string, senderName: string) => {
    chatService.sendCustomerMessage(sessionId, text, senderName).then(() => {
      chatService.getChatSessions().then(setChatSessions);
    });
  };

  const sendCskhMessage = (sessionId: string, text: string, cskhName: string) => {
    chatService.sendCskhMessage(sessionId, text, cskhName).then(() => {
      chatService.getChatSessions().then(setChatSessions);
    });
  };

  const acceptSession = (sessionId: string, cskhName: string) => {
    chatService.acceptSession(sessionId, cskhName).then(() => {
      chatService.getChatSessions().then(setChatSessions);
    });
  };

  const closeSession = (sessionId: string) => {
    chatService.closeSession(sessionId).then(() => {
      chatService.getChatSessions().then(setChatSessions);
    });
  };

  const getSessionById = (sessionId: string) => {
    return chatSessions.find(s => s.id === sessionId);
  };

  const activeSessions = chatSessions.filter(s => s.status === 'active');
  const waitingSessions = chatSessions.filter(s => s.status === 'waiting');
  const unreadCount = waitingSessions.length + activeSessions.filter(s => {
    const lastMsg = s.messages[s.messages.length - 1];
    return lastMsg?.sender === 'customer';
  }).length;

  return (
    <ChatContext.Provider
      value={{
        chatSessions,
        activeSessions,
        waitingSessions,
        createChatSession,
        sendCustomerMessage,
        sendCskhMessage,
        acceptSession,
        closeSession,
        getSessionById,
        unreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
