'use client';
/* eslint-disable react-hooks/purity, react-hooks/set-state-in-effect, @typescript-eslint/no-unused-vars */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, ArrowLeft, Loader2, CheckCheck, Clock } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../data/products';
import { formatPrice } from '../../lib/utils';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

interface Message {
  id: string;
  sender: 'bot' | 'user' | 'system' | 'agent';
  text: string;
  timestamp: Date;
  products?: typeof MOCK_PRODUCTS;
  quickReplies?: string[];
}

export const Chatbot: React.FC = () => {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const { createChatSession, sendCustomerMessage, getSessionById, chatSessions } = useChat();

  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState<'ai' | 'connecting' | 'agent' | 'live'>('ai');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef(0);

  const agentAvatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';

  const resetToAIGreeting = useCallback(() => {
    setChatMode('ai');
    setLiveSessionId(null);
    setMessages([
      {
        id: 'greet-ai',
        sender: 'bot',
        text: 'Xin chào! Tôi là Novyn Muse ✦ Nàng thơ tư vấn phong cách tối giản từ Novyn Wear. Tôi ở đây để đồng hành cùng bạn thiết lập những bản phối Quiet Luxury thời thượng, nhẹ tênh như không trọng lực. Hãy chọn một phong cách bên dưới để chúng ta bắt đầu nhé!',
        timestamp: new Date(),
        quickReplies: ['✦ Quiet Luxury', '✦ Mùa hè Linen', '✦ Office Elegance', '✦ Nhờ phối đồ giúp', '💬 Gặp nhân viên tư vấn'],
      },
    ]);
  }, []);

  // Initial greeting on load
  useEffect(() => {
    resetToAIGreeting();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, chatMode]);

  // Sync live chat session messages from ChatContext
  useEffect(() => {
    if (!liveSessionId) return;
    const session = getSessionById(liveSessionId);
    if (!session) return;

    const cskhMessages = session.messages;
    if (cskhMessages.length !== prevMsgCountRef.current) {
      prevMsgCountRef.current = cskhMessages.length;

      // Only add new CSKH messages (don't re-add customer ones)
      const lastMsg = cskhMessages[cskhMessages.length - 1];
      if (lastMsg?.sender === 'cskh') {
        const agentMsg: Message = {
          id: `live-${lastMsg.id}`,
          sender: 'agent',
          text: lastMsg.text,
          timestamp: new Date(lastMsg.timestamp),
          quickReplies: ['📦 Kiểm tra đơn hàng', '📍 Chi nhánh Showroom', '📐 Đổi trả & Hoàn tiền', '🤖 Quay lại Novyn AI'],
        };
        setMessages(prev => {
          // Avoid duplicate
          if (prev.find(m => m.id === `live-${lastMsg.id}`)) return prev;
          return [...prev, agentMsg];
        });
        setIsTyping(false);
      }
    }

    // If session is closed by CSKH
    if (session.status === 'closed' && chatMode === 'live') {
      setMessages(prev => [...prev, {
        id: `closed-${Date.now()}`,
        sender: 'system',
        text: 'Phiên hỗ trợ đã kết thúc. Cảm ơn bạn đã liên hệ Novyn Wear!',
        timestamp: new Date(),
      }]);
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
        }
      ]);
    }
  }, [chatSessions, liveSessionId, chatMode, getSessionById, resetToAIGreeting]);

  const handleConnectToAgent = () => {
    setChatMode('connecting');

    const customerName = currentUser?.name || 'Khách';
    const customerEmail = currentUser?.email || 'guest@example.com';
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
    setMessages(prev => [...prev, {
      id: `sys-connecting-${Date.now()}`,
      sender: 'system',
      text: 'Đang kết nối với nhân viên CSKH. Vui lòng chờ trong giây lát...',
      timestamp: new Date(),
    }]);
  };

  const handleSendMessage = (text: string, isUserText = true) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    if (isUserText) setInputValue('');

    if (chatMode === 'live' && liveSessionId) {
      // Send to real CSKH via ChatContext
      const customerName = currentUser?.name || 'Khách';
      sendCustomerMessage(liveSessionId, text, customerName);
      setIsTyping(true);
      // CSKH will reply asynchronously, we detect it in useEffect above
      return;
    }

    if (chatMode === 'agent') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, generateAgentResponse(text)]);
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

  // Simulated AI mode query logic
  const generateAIResponse = (userInput: string): Message => {
    const text = userInput.toLowerCase();
    const botMsgId = `ai-${Math.random().toString(36).substring(2, 9)}`;
    const time = new Date();

    if (text.includes('nhân viên') || text.includes('tư vấn') || text.includes('gặp nhân viên') || text.includes('người') || text.includes('chát với nhân viên') || text.includes('live chat') || text.includes('chat')) {
      return {
        id: botMsgId,
        sender: 'bot',
        text: 'Dạ, bạn có muốn kết nối trực tiếp với chuyên viên CSKH (nhân viên thật) để được giải quyết khiếu nại hoặc xử lý đơn hàng nhanh không ạ? Bấm nút bên dưới để em kết nối ngay nhé!',
        timestamp: time,
        quickReplies: ['💬 Kết nối chuyên viên ngay', '🤖 Hủy bỏ'],
      };
    }

    if (text.includes('quiet luxury')) {
      const luxuryProducts = MOCK_PRODUCTS.filter(p => p.id === 'prod-02' || p.id === 'prod-03');
      return {
        id: botMsgId,
        sender: 'bot',
        text: '✦ **Quiet Luxury Style** tập trung vào những chất liệu cao cấp mộc mạc và màu sắc trung tính trang nhã. Tôi gợi ý cho bạn bản phối sau:\n\n**Áo Khoác Blazer Relaxed Fit** (Lớp ngoài thanh lịch đứng dáng) phối cùng **Áo Sơ Mi Linen Cao Cấp** (Lớp trong nhẹ tênh phóng khoáng).\n\nDưới đây là bản phối khuyên dùng dành cho bạn:',
        timestamp: time,
        products: luxuryProducts,
        quickReplies: ['📐 Tư vấn chọn size', '🏷️ Mã giảm giá mới', '🤖 Quay lại Novyn AI']
      };
    }

    if (text.includes('mùa hè linen') || text.includes('linen') || text.includes('thô') || text.includes('mát') || text.includes('đũi')) {
      const linenProducts = MOCK_PRODUCTS.filter(p => p.id === 'prod-03' || p.name.toLowerCase().includes('linen') || p.description.toLowerCase().includes('linen'));
      return {
        id: botMsgId,
        sender: 'bot',
        text: '🌿 **Linen Summer Style** nhẹ tênh mang lại sự thoải mái tuyệt đối và phong thái phóng khoáng đầy lôi cuốn cho ngày nắng nóng. Bản phối gợi ý:\n\n**Áo Sơ Mi Linen Cao Cấp** dệt sợi lanh thô mộc tự nhiên thoáng khí, kết hợp cùng quần suông linen mộc mạc.\n\nSản phẩm Linen cao cấp:',
        timestamp: time,
        products: linenProducts,
        quickReplies: ['📐 Tư vấn chọn size', '🏷️ Mã giảm giá mới', '🤖 Quay lại Novyn AI']
      };
    }

    if (text.includes('office elegance') || text.includes('công sở') || text.includes('đi làm')) {
      const officeProducts = MOCK_PRODUCTS.filter(p => p.id === 'prod-02' || p.id === 'prod-04');
      return {
        id: botMsgId,
        sender: 'bot',
        text: '💼 **Office Elegance** thanh lịch chuyên nghiệp nhưng vô cùng dễ chịu và sang trọng. Bản phối gợi ý:\n\n**Áo Khoác Blazer Relaxed Fit** tuyết mưa phối cùng **Áo Len Dệt Kim Soft-Touch** mỏng nhẹ ôm dáng bên trong.\n\nSản phẩm khuyên dùng:',
        timestamp: time,
        products: officeProducts,
        quickReplies: ['📐 Tư vấn chọn size', '🏷️ Mã giảm giá mới', '🤖 Quay lại Novyn AI']
      };
    }

    if (text.includes('phối đồ') || text.includes('phối hợp') || text.includes('mix') || text.includes('match') || text.includes('style') || text.includes('nhờ phối')) {
      const suggestProds = MOCK_PRODUCTS.filter(p => p.id === 'prod-01' || p.id === 'prod-02' || p.id === 'prod-03');
      return {
        id: botMsgId,
        sender: 'bot',
        text: '✦ **Novyn Styling Advice** • Sự tinh tế nằm ở tính tối giản!\n\n1. **Phối năng động**: Áo thun Premium Cotton dệt Supima mịn phối cùng quần dáng suông rộng.\n2. **Phối thanh lịch**: Áo sơ mi Linen đũi lanh nhẹ mộc kết hợp cùng Áo khoác Blazer tuyết mưa đứng dáng.\n\nGợi ý bản phối hoàn hảo cho bạn:',
        timestamp: time,
        products: suggestProds,
        quickReplies: ['📐 Tư vấn chọn size', '🏷️ Mã giảm giá mới', '🤖 Quay lại Novyn AI']
      };
    }

    const weightMatch = text.match(/(\d+)\s*kg/);
    if (weightMatch || text.includes('size') || text.includes('kích cỡ') || text.includes('chọn size')) {
      let weight = 0;
      if (weightMatch) weight = parseInt(weightMatch[1]);
      let sizeAdvice = 'M';
      let reasoning = '';
      if (weight > 0) {
        if (weight < 58) { sizeAdvice = 'S'; reasoning = 'vì cân nặng dưới 58kg phom Regular Fit ôm nhẹ thoải mái.'; }
        else if (weight <= 68) { sizeAdvice = 'M'; reasoning = 'vì cân nặng từ 58-68kg cực kỳ cân đối với phom dáng chuẩn.'; }
        else if (weight <= 78) { sizeAdvice = 'L'; reasoning = 'vì cân nặng từ 69-78kg mặc rộng rũ thoải mái vai ngực.'; }
        else { sizeAdvice = 'XL'; reasoning = 'để mặc dài rộng thoải mái phom dáng.'; }
      }
      const responseText = weight > 0
        ? `Novyn Muse đã phân tích! Dựa trên cân nặng **${weight}kg**, bạn nên chọn **Size ${sizeAdvice}** ${reasoning}`
        : 'Bảng size tiêu chuẩn Novyn:\n- **S**: dưới 1m68, dưới 58kg\n- **M**: 1m68-1m74, 59-68kg\n- **L**: 1m75-1m80, 69-78kg\n- **XL**: trên 1m80, trên 79kg\n\n*Gõ cân nặng (VD: "65kg") để nhận tư vấn size cụ thể hơn!*';
      return { id: botMsgId, sender: 'bot', text: responseText, timestamp: time, quickReplies: ['✦ Quiet Luxury', '🏷️ Mã giảm giá mới', '💬 Gặp nhân viên tư vấn'] };
    }

    if (text.includes('mã') || text.includes('giảm giá') || text.includes('sale') || text.includes('coupon') || text.includes('ưu đãi')) {
      return { id: botMsgId, sender: 'bot', text: 'Mã giảm giá đang hoạt động dành cho bạn:\n\n1. **SALE10**: Giảm 10% tổng hóa đơn\n2. **FREESHIP**: Miễn phí vận chuyển toàn quốc\n\n*Nhập mã tại trang thanh toán để áp dụng nhé!* 🏷️', timestamp: time, quickReplies: ['🛒 Xem giỏ hàng', '✦ Quiet Luxury'] };
    }

    if (text.includes('áo') || text.includes('sơ mi')) {
      return { id: botMsgId, sender: 'bot', text: 'Bộ sưu tập Áo (Tops) tinh tế của Novyn:', timestamp: time, products: MOCK_PRODUCTS.filter(p => p.category === 'Tops'), quickReplies: ['📐 Tư vấn chọn size', '🏷️ Mã giảm giá mới'] };
    }

    if (text.includes('quần') || text.includes('bottoms')) {
      return { id: botMsgId, sender: 'bot', text: 'Bộ sưu tập Quần (Bottoms) thanh lịch:', timestamp: time, products: MOCK_PRODUCTS.filter(p => p.category === 'Bottoms'), quickReplies: ['📐 Tư vấn chọn size'] };
    }

    if (text.includes('đầm') || text.includes('dress') || text.includes('váy')) {
      return { id: botMsgId, sender: 'bot', text: 'Đầm Sang Trọng Quiet Luxury:', timestamp: time, products: MOCK_PRODUCTS.filter(p => p.category === 'Dresses'), quickReplies: ['✦ Quiet Luxury'] };
    }

    if (text.includes('áo khoác') || text.includes('blazer') || text.includes('trench coat') || text.includes('bomber')) {
      return { id: botMsgId, sender: 'bot', text: 'Áo Khoác Thời Trang Novyn:', timestamp: time, products: MOCK_PRODUCTS.filter(p => p.category === 'Outerwear'), quickReplies: ['✦ Quiet Luxury', '🏷️ Mã giảm giá mới'] };
    }

    if (text.includes('hot') || text.includes('bán chạy') || text.includes('bestseller') || text.includes('mới')) {
      return { id: botMsgId, sender: 'bot', text: '🌿 Best Seller & New Arrivals tuần này:', timestamp: time, products: MOCK_PRODUCTS.filter(p => p.badges?.includes('Best Seller') || p.badges?.includes('New')).slice(0, 4), quickReplies: ['📐 Tư vấn chọn size', '🏷️ Mã giảm giá'] };
    }

    if (text.includes('đổi trả') || text.includes('trả hàng') || text.includes('hoàn tiền') || text.includes('lỗi')) {
      return { id: botMsgId, sender: 'bot', text: '🔄 **Chính sách đổi trả Novyn Wear:**\n\nĐổi trả miễn phí trong **30 ngày** kể từ khi nhận hàng. Sản phẩm còn nguyên tag, chưa qua giặt.\n\nNếu lỗi từ nhà sản xuất, Novyn Wear sẽ cử bưu tá thu hồi và giao bù miễn phí!', timestamp: time, quickReplies: ['💬 Gặp nhân viên tư vấn', '🏷️ Mã giảm giá mới'] };
    }

    return { id: botMsgId, sender: 'bot', text: 'Dạ Novyn Muse đã ghi nhận câu hỏi. Bạn có thể chọn các gợi ý phong cách phối đồ bên dưới hoặc gõ: *phối đồ, quiet luxury, linen, công sở, tư vấn size*', timestamp: time, quickReplies: ['✦ Quiet Luxury', '✦ Mùa hè Linen', '✦ Office Elegance', '💬 Gặp nhân viên tư vấn'] };
  };

  const generateAgentResponse = (userInput: string): Message => {
    const text = userInput.toLowerCase();
    const agentMsgId = `agent-${Math.random().toString(36).substring(2, 9)}`;
    const time = new Date();

    if (text.includes('đơn hàng') || text.includes('kiểm tra') || text.includes('ship') || text.includes('giao')) {
      return { id: agentMsgId, sender: 'agent', text: 'Dạ, em sẵn sàng check ngay! Anh/chị có thể cung cấp **Số điện thoại đặt hàng** hoặc **Mã đơn hàng** không ạ? 📦', timestamp: time, quickReplies: ['📞 Gọi Hotline 1900', '📍 Showroom Sài Gòn'] };
    }

    if (text.includes('đổi') || text.includes('chật') || text.includes('rộng') || text.includes('không vừa')) {
      return { id: agentMsgId, sender: 'agent', text: 'Anh/chị đừng lo nhé! Em hỗ trợ đổi size miễn phí tận nhà. Bưu tá sẽ mang size mới qua và thu hồi size cũ đồng thời, không cần ra bưu cục ạ. Cho em xin SĐT đặt hàng cũ nhé!', timestamp: time, quickReplies: ['💬 Chat qua Zalo', '📞 Gọi Hotline 1900'] };
    }

    if (text.includes('địa chỉ') || text.includes('showroom') || text.includes('ở đâu') || text.includes('chi nhánh')) {
      return { id: agentMsgId, sender: 'agent', text: 'Novyn Wear mở cửa 9:00–22:30 hàng ngày:\n\n🏛️ **Quận 1 (TP.HCM):** 152 Đồng Khởi\n🏛️ **Thảo Điền (Quận 2):** 23 Xuân Thủy\n\nAnh/chị có muốn em đặt lịch giữ sẵn sản phẩm không ạ? 🌿', timestamp: time, quickReplies: ['📍 Chi nhánh Quận 1', '🤖 Quay lại Novyn AI'] };
    }

    if (text.includes('quay lại') || text.includes('hủy') || text.includes('ai') || text.includes('tự động')) {
      setTimeout(() => resetToAIGreeting(), 500);
      return { id: agentMsgId, sender: 'system', text: 'Đã chuyển lại chế độ Novyn AI.', timestamp: time };
    }

    return { id: agentMsgId, sender: 'agent', text: 'Dạ, em đã nhận được câu hỏi của mình rồi ạ. Để em phục vụ chu đáo nhất, anh/chị có thể kết nối qua **Zalo CSKH** hoặc gọi tổng đài miễn phí bên dưới không ạ? 🥰', timestamp: time, quickReplies: ['💬 Chat qua Zalo', '📞 Gọi Hotline 1900', '🤖 Quay lại Novyn AI'] };
  };

  if (pathname?.startsWith('/internal')) {
    return null;
  }

  const isLiveMode = chatMode === 'live';
  const isAgentMode = chatMode === 'agent' || isLiveMode;

  return (
    <>
      {/* 1. FLOATING ACTION BUTTON */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-[45] flex items-center justify-end">
        {/* Pulsing Outer Halo */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-neutral-950/20"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-10 bg-white/75 backdrop-blur-2xl border border-neutral-200/50 text-neutral-900 px-4 py-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:bg-white active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Novyn Chatbot"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close-icon" className="flex items-center justify-center" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div key="chat-icon" className="flex items-center gap-2" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="relative flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-neutral-900 fill-neutral-900/10 animate-pulse" />
                  <span className="absolute -top-1 -right-1 bg-amber-500 w-2 h-2 rounded-full border border-white animate-ping" />
                  <span className="absolute -top-1 -right-1 bg-amber-500 w-2 h-2 rounded-full border border-white" />
                </div>
                <span className="hidden md:inline text-xs font-semibold tracking-wider uppercase pr-1 text-neutral-800">
                  Novyn Muse
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

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
            <div className="bg-neutral-950/95 backdrop-blur-md px-4 sm:px-5 py-4 text-white flex items-center justify-between border-b border-neutral-900 shrink-0">
              <div className="flex items-center gap-3">
                {chatMode === 'ai' && (
                  <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center p-[1px] border border-white/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <div className="w-full h-full flex items-center justify-center bg-neutral-950 text-white font-black text-[9px] tracking-widest rounded-full uppercase">
                      <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300/20 animate-pulse" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full border-2 border-neutral-950" />
                  </div>
                )}
                {chatMode === 'connecting' && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-spin" />
                  </div>
                )}
                {(chatMode === 'agent' || chatMode === 'live') && (
                  <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-white/20">
                    <Image src={agentAvatar} alt="CSKH" fill className="object-cover" unoptimized />
                    <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full border-2 border-neutral-950 animate-pulse" />
                  </div>
                )}
                <div>
                  {chatMode === 'ai' && (
                    <>
                      <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
                        Novyn Muse
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 animate-pulse" />
                      </h3>
                      <span className="text-[8px] sm:text-[9px] text-emerald-400 font-semibold tracking-wide block">
                        Trợ lý phong cách AI • Đang trực tuyến
                      </span>
                    </>
                  )}
                  {chatMode === 'connecting' && (
                    <>
                      <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Đang kết nối...</h3>
                      <span className="text-[8px] sm:text-[9px] text-amber-400 font-medium tracking-wide block animate-pulse">Tìm kiếm nhân viên CSKH</span>
                    </>
                  )}
                  {(chatMode === 'agent' || chatMode === 'live') && (
                    <>
                      <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        Mai An
                        <span className="bg-emerald-500/20 text-emerald-400 text-[7px] sm:text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border border-emerald-500/30">CSKH</span>
                        {chatMode === 'live' && <span className="bg-sky-500/20 text-sky-400 text-[7px] sm:text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border border-sky-500/30">LIVE</span>}
                      </h3>
                      <span className="text-[8px] sm:text-[9px] text-emerald-400 font-medium tracking-wide block">
                        {chatMode === 'live' ? 'Đang chat trực tiếp' : 'Đang trực tiếp tư vấn'}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isAgentMode && (
                  <button onClick={resetToAIGreeting} className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors mr-1" title="Quay lại AI">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="Đóng">
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* MESSAGES BODY */}
            <div className="flex-grow p-3 sm:p-4 overflow-y-auto flex flex-col gap-3 sm:gap-4 bg-neutral-50/50 relative">
              {/* CONNECTING OVERLAY */}
              <AnimatePresence>
                {chatMode === 'connecting' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-5 sm:mb-6 flex items-center justify-center">
                      <span className="absolute inset-0 bg-neutral-900/5 rounded-full border border-neutral-900/10 animate-ping" style={{ animationDuration: '3s' }} />
                      <span className="absolute inset-2 bg-neutral-900/10 rounded-full border border-neutral-900/20 animate-ping" style={{ animationDuration: '2s' }} />
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-950 text-white rounded-full flex items-center justify-center shadow-lg border border-neutral-800 relative z-10">
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-amber-400" />
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-2">Đang kết nối nhân viên</h4>
                    <p className="text-xs text-neutral-400 max-w-[220px] sm:max-w-[240px] leading-relaxed">
                      Novyn đang tìm tư vấn viên CSKH trực tuyến. Yêu cầu của bạn đã được ghi nhận...
                    </p>
                    <div className="mt-4 flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1.5 ${msg.sender === 'user' ? 'items-end' : msg.sender === 'system' ? 'items-center w-full' : 'items-start'}`}
                >
                  {msg.sender === 'system' && (
                    <div className="my-1 bg-neutral-100/80 border border-neutral-200/50 text-[9px] sm:text-[10px] text-neutral-400 font-semibold px-3 sm:px-4 py-1.5 rounded-full text-center tracking-wide shadow-inner select-none max-w-[85%] uppercase">
                      {msg.text}
                    </div>
                  )}

                  {msg.sender !== 'system' && (
                    <div className="flex items-end gap-1.5 sm:gap-2 max-w-[88%] sm:max-w-[85%]">
                      {msg.sender === 'bot' && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-neutral-900 text-[7px] sm:text-[8px] font-black text-white flex items-center justify-center shrink-0 border border-neutral-200">AI</div>
                      )}
                      {msg.sender === 'agent' && (
                        <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden shrink-0 border border-neutral-200">
                          <Image src={agentAvatar} alt="CSKH" fill className="object-cover" unoptimized />
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-neutral-950 text-white rounded-br-none shadow-sm'
                            : 'bg-white text-neutral-800 rounded-bl-none border border-neutral-100 shadow-sm'
                        }`}
                        style={{ whiteSpace: 'pre-line' }}
                      >
                        {msg.text}
                        {msg.sender === 'user' && (
                          <span className="block text-right mt-1 opacity-50"><CheckCheck className="w-3 h-3 inline" /></span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Product slider */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="w-full pl-6 sm:pl-8 pr-1 sm:pr-2 mt-1 shrink-0">
                      <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin snap-x snap-mandatory">
                        {msg.products.slice(0, 4).map((prod) => (
                          <div key={prod.id} className="w-40 sm:w-48 bg-white border border-neutral-150 rounded-2xl overflow-hidden shrink-0 shadow-sm snap-start flex flex-col hover:border-neutral-300 transition-all">
                            <div className="relative w-full aspect-[4/5] bg-neutral-50">
                              <Image src={prod.images[0]} alt={prod.name} fill className="object-cover" unoptimized />
                              {prod.badges?.[0] && (
                                <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-neutral-950 text-white text-[7px] sm:text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md">{prod.badges[0]}</span>
                              )}
                            </div>
                            <div className="p-2.5 sm:p-3 flex-grow flex flex-col justify-between">
                              <h4 className="text-[9px] sm:text-[10px] font-bold text-neutral-900 line-clamp-1 mb-0.5">{prod.name}</h4>
                              <span className="text-[9px] sm:text-[10px] font-bold text-neutral-800">{formatPrice(prod.price)}</span>
                              <Link href={`/products/${prod.slug}`} onClick={() => setIsOpen(false)} className="mt-1.5 sm:mt-2 w-full text-center bg-neutral-950 text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider py-1.5 rounded-lg hover:bg-neutral-800 transition-colors block">
                                Xem chi tiết
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick replies */}
                  {msg.quickReplies && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1 sm:mt-2 pl-6 sm:pl-8">
                      {msg.quickReplies.map((reply) => (
                        <button
                          key={reply}
                          onClick={() => {
                            if (reply === '💬 Gặp nhân viên tư vấn' || reply === '💬 Kết nối chuyên viên ngay') {
                              handleConnectToAgent();
                            } else if (reply === '🤖 Quay lại Novyn AI' || reply === '🤖 Hủy bỏ') {
                              resetToAIGreeting();
                            } else if (reply === '🛒 Xem giỏ hàng') {
                              setIsOpen(false);
                              window.location.href = '/cart';
                            } else if (reply.includes('Showroom') || reply.includes('Chi nhánh')) {
                              setIsOpen(false);
                              window.location.href = '/contact';
                            } else if (reply === '💬 Chat qua Zalo') {
                              window.open('https://zalo.me/', '_blank');
                            } else if (reply === '📞 Gọi Hotline 1900') {
                              window.location.href = 'tel:19008899';
                            } else {
                              handleSendMessage(reply, false);
                            }
                          }}
                          className="bg-white hover:bg-neutral-50 text-neutral-800 text-[9px] sm:text-[10px] font-semibold border border-neutral-200/80 px-2.5 sm:px-3 py-1.5 rounded-full shadow-sm hover:border-neutral-400 active:scale-95 transition-all shrink-0 cursor-pointer"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-2.5 sm:p-3 bg-white border-t border-neutral-100 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder={chatMode === 'ai' ? 'Hỏi Novyn Muse điều gì...' : chatMode === 'live' ? 'Nhắn cho nhân viên CSKH...' : 'Nhắn cho Mai An...'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-grow bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs focus:outline-none focus:border-neutral-400 focus:bg-white transition-all text-neutral-800"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || chatMode === 'connecting'}
                className="bg-neutral-950 hover:bg-neutral-800 text-white p-2 sm:p-2.5 rounded-xl transition-all disabled:opacity-40 flex items-center justify-center"
                aria-label="Gửi tin nhắn"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
