'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { ChatMode, ChatMessage } from '../chatbot/chatbotTypes';
import {
  createInitialAIMessage,
  generateAIResponse,
  generateAgentResponse,
} from '../chatbot/chatbotLogic';
import { ChatbotFloatingButton } from '../chatbot/ChatbotFloatingButton';
import { ChatbotHeader } from '../chatbot/ChatbotHeader';
import { ChatbotConnectingOverlay } from '../chatbot/ChatbotConnectingOverlay';
import { ChatMessageItem } from '../chatbot/ChatMessageItem';
import { ChatbotInputBar } from '../chatbot/ChatbotInputBar';

export const Chatbot: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useAuth();
  const { createChatSession, sendCustomerMessage, getCustomerSession } = useChat();

  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('ai');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef(0);

  const resetToAIGreeting = useCallback(() => {
    setChatMode('ai');
    setLiveSessionId(null);
    setMessages([createInitialAIMessage()]);
  }, []);

  // Initial greeting on load
  useEffect(() => {
    resetToAIGreeting();
  }, [resetToAIGreeting]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, chatMode]);

  // Sync live chat session messages from getCustomerSession (Customer side)
  useEffect(() => {
    if (!liveSessionId) return;

    let isMounted = true;
    const pollSession = async () => {
      try {
        const session = await getCustomerSession(liveSessionId);
        if (!session || !isMounted) return;

        const cskhMessages = session.messages;
        if (cskhMessages.length !== prevMsgCountRef.current) {
          prevMsgCountRef.current = cskhMessages.length;

          // Only add new CSKH messages (don't re-add customer ones)
          const lastMsg = cskhMessages[cskhMessages.length - 1];
          if (lastMsg?.sender === 'cskh') {
            const agentMsg: ChatMessage = {
              id: `live-${lastMsg.id}`,
              sender: 'agent',
              text: lastMsg.text,
              timestamp: new Date(lastMsg.timestamp),
              quickReplies: ['📦 Kiểm tra đơn hàng', '📍 Chi nhánh Showroom', '📐 Đổi trả & Hoàn tiền', '🤖 Quay lại Novyn AI'],
            };
            setMessages(prev => {
              if (prev.find(m => m.id === `live-${lastMsg.id}`)) return prev;
              return [...prev, agentMsg];
            });
            setIsTyping(false);
          }
        }

        // If session is closed by CSKH
        if (session.status === 'closed' && chatMode === 'live') {
          setMessages(prev => [
            ...prev,
            {
              id: `closed-${Date.now()}`,
              sender: 'system',
              text: 'Phiên hỗ trợ đã kết thúc. Cảm ơn bạn đã liên hệ Novyn Wear!',
              timestamp: new Date(),
            },
          ]);
          setChatMode('ai');
          setLiveSessionId(null);
          setTimeout(resetToAIGreeting, 3000);
        }

        // Transition from connecting to live when CSKH accepts
        if (session.status === 'active' && chatMode === 'connecting') {
          setChatMode('live');
          const time = new Date();
          setMessages(prev => [
            ...prev,
            {
              id: `sys-${Math.random()}`,
              sender: 'system',
              text: `Nhân viên ${session.cskhName || 'CSKH'} đã tham gia hỗ trợ trực tuyến.`,
              timestamp: time,
            },
            {
              id: `agent-greet-${Math.random()}`,
              sender: 'agent',
              text: `Dạ, em chào anh/chị ạ! Em là ${session.cskhName || 'Mai An'} - chuyên viên CSKH hỗ trợ trực tuyến của Novyn Wear. Rất hân hạnh được trực tiếp tư vấn chi tiết cho mình. Anh/chị cần em giải đáp thông tin về đổi size, check đơn hàng hay cần lên đơn ship gấp hỏa tốc ạ? 🌸`,
              timestamp: time,
              quickReplies: ['📦 Kiểm tra đơn hàng', '📍 Chi nhánh Showroom', '📐 Đổi trả & Hoàn tiền', '🤖 Quay lại Novyn AI'],
            },
          ]);
        }
      } catch (e) {
        console.error('Failed to sync customer chat session:', e);
      }
    };

    pollSession();
    const interval = setInterval(pollSession, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [liveSessionId, chatMode, getCustomerSession, resetToAIGreeting]);

  const handleConnectToAgent = () => {
    setChatMode('connecting');

    const customerName = currentUser?.name || 'Khách';
    const customerEmail = currentUser?.email || 'guest@novynwear.com';
    const customerId = currentUser?.id || `guest-${Date.now()}`;
    const customerAvatar = currentUser?.avatar;

    const sessionId = createChatSession(
      customerId,
      customerName,
      customerEmail,
      customerAvatar,
      'Khách hàng cần hỗ trợ tư vấn trực tiếp.'
    );
    setLiveSessionId(sessionId);
    prevMsgCountRef.current = 1;

    // Add connecting UI message
    setMessages(prev => [
      ...prev,
      {
        id: `sys-connecting-${Date.now()}`,
        sender: 'system',
        text: 'Đang kết nối với nhân viên CSKH. Vui lòng chờ trong giây lát...',
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = (text: string, isUserText = true) => {
    if (!text.trim()) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    if (isUserText) setInputValue('');

    if (chatMode === 'live' && liveSessionId) {
      const customerName = currentUser?.name || 'Khách';
      sendCustomerMessage(liveSessionId, text, customerName);
      setIsTyping(true);
      return;
    }

    if (chatMode === 'agent') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, generateAgentResponse(text, resetToAIGreeting)]);
      }, 1800);
      return;
    }

    if (chatMode === 'ai') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, generateAIResponse(text)]);
      }, 1000);
    }
  };

  const handleQuickReply = (reply: string) => {
    if (reply === '💬 Gặp nhân viên tư vấn' || reply === '💬 Kết nối chuyên viên ngay') {
      handleConnectToAgent();
    } else if (reply === '🤖 Quay lại Novyn AI' || reply === '🤖 Hủy bỏ') {
      resetToAIGreeting();
    } else if (reply === '🛒 Xem giỏ hàng') {
      setIsOpen(false);
      router.push('/cart');
    } else if (reply.includes('Showroom') || reply.includes('Chi nhánh')) {
      setIsOpen(false);
      router.push('/contact');
    } else if (reply === '💬 Chat qua Zalo') {
      window.open('https://zalo.me/', '_blank');
    } else if (reply === '📞 Gọi Hotline 1900') {
      window.location.href = 'tel:19008899';
    } else {
      handleSendMessage(reply, false);
    }
  };

  if (pathname?.startsWith('/internal')) {
    return null;
  }

  return (
    <>
      {/* 1. FLOATING ACTION BUTTON */}
      <ChatbotFloatingButton isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />

      {/* 2. CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 22, stiffness: 220 }}
            className="fixed bottom-24 right-4 sm:right-6 z-[45] w-[calc(100vw-2rem)] sm:w-[380px] md:w-[400px] h-[520px] max-h-[80vh] rounded-[24px] sm:rounded-[28px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden border border-neutral-100"
          >
            {/* HEADER */}
            <ChatbotHeader
              chatMode={chatMode}
              onResetToAI={resetToAIGreeting}
              onClose={() => setIsOpen(false)}
            />

            {/* MESSAGES BODY */}
            <div className="flex-grow p-3 sm:p-4 overflow-y-auto flex flex-col gap-3 sm:gap-4 bg-neutral-50/50 relative">
              {/* CONNECTING OVERLAY */}
              <ChatbotConnectingOverlay isConnecting={chatMode === 'connecting'} />

              {/* Messages List */}
              {messages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  onQuickReplyClick={handleQuickReply}
                  onProductClick={() => setIsOpen(false)}
                />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-1.5 sm:gap-2 max-w-[85%] self-start">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-neutral-900 text-[7px] sm:text-[8px] font-black text-white flex items-center justify-center shrink-0 border border-neutral-200">
                    {chatMode === 'ai' ? 'AI' : 'MA'}
                  </div>
                  <div className="bg-white border border-neutral-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* Live chat waiting hint */}
              {chatMode === 'live' && (
                <div className="flex items-center justify-center gap-1.5 text-[9px] text-neutral-400 font-medium py-1">
                  <Clock className="w-3 h-3" />
                  <span>Tin nhắn được gửi đến nhân viên CSKH trực tiếp</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* INPUT FORM */}
            <ChatbotInputBar
              inputValue={inputValue}
              chatMode={chatMode}
              onChangeInput={setInputValue}
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
