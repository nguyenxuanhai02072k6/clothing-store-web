'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Sparkles, Send } from 'lucide-react';

export interface CSKHLiveChatHubTabProps {
  currentUser: any;
  waitingSessions: any[];
  activeSessions: any[];
  chatSessions: any[];
  unreadCount: number;
  acceptSession: (sessionId: string, agentName: string) => void;
  closeSession: (sessionId: string) => void;
  sendCskhMessage: (sessionId: string, text: string, senderName: string) => void;
}

export default function CSKHLiveChatHubTab({
  currentUser,
  waitingSessions,
  activeSessions,
  chatSessions,
  unreadCount,
  acceptSession,
  closeSession,
  sendCskhMessage,
}: CSKHLiveChatHubTabProps) {
  const [selectedChatSessionId, setSelectedChatSessionId] = useState<string | null>(null);
  const [chatReplyText, setChatReplyText] = useState('');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const allActiveSessions = [...waitingSessions, ...activeSessions];
  const selectedSession = selectedChatSessionId ? chatSessions.find(s => s.id === selectedChatSessionId) : null;

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession?.messages]);

  const getLastCustomerMessage = (session: any) => {
    const customerMsgs = session.messages.filter((m: any) => m.sender === 'customer');
    return customerMsgs[customerMsgs.length - 1]?.text || '';
  };

  const getSentiment = (text: string) => {
    if (!text) return { emoji: '💬', label: 'Trung lập', color: 'bg-neutral-100 text-neutral-700' };
    const lower = text.toLowerCase();
    const frustratedKeywords = ['chậm', 'tệ', 'hoàn tiền', 'lỗi', 'không đúng', 'bực', 'kém', 'quá lâu', 'lừa', 'thất vọng'];
    const positiveKeywords = ['đẹp', 'thích', 'nhanh', 'cảm ơn', 'tốt', 'ưng', 'tuyệt', 'ok', 'iu', 'yêu'];
    
    if (frustratedKeywords.some(kw => lower.includes(kw))) {
      return { emoji: '😡', label: 'Bực dọc', color: 'bg-rose-105 text-rose-700 border border-rose-250 animate-pulse font-bold' };
    }
    if (positiveKeywords.some(kw => lower.includes(kw))) {
      return { emoji: '😊', label: 'Hài lòng', color: 'bg-emerald-105 text-emerald-700 border border-emerald-250 font-bold' };
    }
    return { emoji: '💬', label: 'Trung lập', color: 'bg-neutral-150 text-neutral-750 font-semibold' };
  };

  const getQuickReplies = (text: string) => {
    const lower = text.toLowerCase();
    const frustratedKeywords = ['chậm', 'tệ', 'hoàn tiền', 'lỗi', 'không đúng', 'bực', 'kém', 'quá lâu', 'lừa', 'thất vọng'];
    const positiveKeywords = ['đẹp', 'thích', 'nhanh', 'cảm ơn', 'tốt', 'ưng', 'tuyệt', 'ok', 'iu', 'yêu'];
    
    if (frustratedKeywords.some(kw => lower.includes(kw))) {
      return [
        'Dạ NOVYN chân thành xin lỗi ạ. NOVYN xin phép gửi tặng voucher 15% bù đắp trải nghiệm nhé ạ!',
        'NOVYN đã tiếp nhận phản hồi và đang tiến hành kiểm tra đơn hàng gấp để hoàn tiền ngay cho mình ạ.',
        'Dạ chuyên viên quản lý của NOVYN sẽ gọi điện thoại hỗ trợ mình trực tiếp trong 5 phút nữa ạ!'
      ];
    }
    if (positiveKeywords.some(kw => lower.includes(kw))) {
      return [
        'NOVYN chân thành cảm ơn đánh giá tuyệt vời của mình! Rất hy vọng được phục vụ mình trong BST tới ạ.',
        'Dạ cảm ơn khách yêu! Mình đừng quên tích điểm loyalty tại tab NOVYN Circle để nhận voucher VIP nhé.',
        'NOVYN rất vui vì mình ưng ý sản phẩm! Mình có cần hỗ trợ thêm thông tin phối đồ lookbook không ạ?'
      ];
    }
    return [
      'Dạ NOVYN có thể giúp gì cho mình về kích cỡ (size) hoặc tư vấn màu sắc sản phẩm này ạ?',
      'Dạ sản phẩm này hiện đang có sẵn tại chi nhánh Quận 1 và Thảo Điền để mình ghé thử ạ.',
      'Dạ mình vui lòng cung cấp mã đơn hàng để NOVYN tra cứu tiến độ vận chuyển chi tiết nhé ạ!'
    ];
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-black text-neutral-950 tracking-tight uppercase flex items-center gap-2">
            Chat Trực tiếp
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {unreadCount} mới
              </span>
            )}
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">Phản hồi trực tiếp với khách hàng đang liên hệ qua chatbox</p>
        </div>
      </div>

      {allActiveSessions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-neutral-100 p-12 text-center">
          <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-7 h-7 text-neutral-300" />
          </div>
          <h4 className="text-sm font-bold text-neutral-500 mb-1">Chưa có cuộc hội thoại nào</h4>
          <p className="text-xs text-neutral-400">Khi khách hàng liên hệ qua chat, bạn sẽ thấy thông báo ở đây.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[500px]">
          {/* Session list */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-neutral-100 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-neutral-50">
              <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Cuộc hội thoại ({allActiveSessions.length})</span>
            </div>
            <div className="flex-grow overflow-y-auto">
              {allActiveSessions.map((session: any) => {
                const lastMsg = session.messages[session.messages.length - 1];
                const hasUnread = lastMsg?.sender === 'customer';
                return (
                  <button
                    key={session.id}
                    onClick={() => {
                      setSelectedChatSessionId(session.id);
                      if (session.status === 'waiting') {
                        acceptSession(session.id, currentUser.name);
                      }
                    }}
                    className={`w-full text-left p-4 border-b border-neutral-50 hover:bg-neutral-50 transition-all ${selectedChatSessionId === session.id ? 'bg-purple-50 border-l-2 border-l-purple-500' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-black">
                          {session.customerName.charAt(0)}
                        </div>
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${session.status === 'waiting' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                      </div>
                      <div className="min-w-0 flex-grow">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-bold truncate ${hasUnread ? 'text-neutral-900' : 'text-neutral-600'}`}>{session.customerName}</span>
                          {hasUnread && <span className="w-2 h-2 bg-rose-500 rounded-full shrink-0" />}
                        </div>
                        <span className={`text-[9px] block truncate mt-0.5 ${session.status === 'waiting' ? 'text-amber-600 font-bold' : 'text-neutral-400'}`}>
                          {session.status === 'waiting' ? '⏳ Chờ kết nối...' : lastMsg?.text || 'Bắt đầu cuộc hội thoại'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat window */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-neutral-100 flex flex-col overflow-hidden">
            {!selectedSession ? (
              <div className="flex-grow flex items-center justify-center text-center p-8">
                <div>
                  <MessageSquare className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
                  <p className="text-sm text-neutral-400 font-medium">Chọn một cuộc hội thoại để bắt đầu phản hồi</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-black shrink-0">
                      {selectedSession.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 block">{selectedSession.customerName}</span>
                        {(() => {
                          const lastMsgText = getLastCustomerMessage(selectedSession);
                          const sentiment = getSentiment(lastMsgText);
                          return (
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${sentiment.color}`} title={`Cảm xúc khách hàng: ${sentiment.label}`}>
                              <span>{sentiment.emoji}</span>
                              <span>{sentiment.label}</span>
                            </span>
                          );
                        })()}
                      </div>
                      <span className="text-[9px] text-neutral-400 block mt-0.5">{selectedSession.customerEmail}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase ${selectedSession.status === 'waiting' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {selectedSession.status === 'waiting' ? 'Chờ kết nối' : 'Đang hoạt động'}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm('Kết thúc phiên hỗ trợ này?')) {
                          closeSession(selectedSession.id);
                          setSelectedChatSessionId(null);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 transition-all"
                      title="Kết thúc phiên"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-neutral-50/50">
                  {selectedSession.messages.length === 0 && (
                    <div className="text-center py-8 text-xs text-neutral-400">Chưa có tin nhắn nào</div>
                  )}
                  {selectedSession.messages.map((msg: any) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'cskh' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'cskh'
                          ? 'bg-purple-600 text-white rounded-br-none'
                          : 'bg-white text-neutral-800 border border-neutral-100 rounded-bl-none shadow-sm'
                      }`} style={{ whiteSpace: 'pre-line' }}>
                        {msg.text}
                        <span className="block text-right text-[8px] opacity-50 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatMessagesEndRef} />
                </div>

                {/* Suggested quick replies */}
                {(() => {
                  const lastMsgText = getLastCustomerMessage(selectedSession);
                  const replies = getQuickReplies(lastMsgText);
                  return (
                    <div className="px-4 py-2 bg-neutral-50/70 border-t border-neutral-100 flex flex-wrap gap-2 items-center text-left shrink-0">
                      <span className="text-[8px] font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        AI Gợi ý trả lời nhanh:
                      </span>
                      {replies.map((rep, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setChatReplyText(rep)}
                          className="px-2.5 py-1 bg-white hover:bg-purple-50 border border-neutral-150 rounded-lg text-[9px] font-bold text-neutral-700 hover:text-purple-700 hover:border-purple-300 transition-all cursor-pointer truncate max-w-[250px]"
                          title={rep}
                        >
                          {rep}
                        </button>
                      ))}
                    </div>
                  );
                })()}

                {/* Reply input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!chatReplyText.trim() || !selectedChatSessionId) return;
                    if (selectedSession.status === 'waiting') {
                      acceptSession(selectedChatSessionId, currentUser.name);
                    }
                    sendCskhMessage(selectedChatSessionId, chatReplyText, currentUser.name);
                    setChatReplyText('');
                  }}
                  className="p-3 border-t border-neutral-100 flex items-center gap-2 bg-white shrink-0"
                >
                  <input
                    type="text"
                    placeholder="Nhập phản hồi cho khách hàng..."
                    value={chatReplyText}
                    onChange={(e) => setChatReplyText(e.target.value)}
                    className="flex-grow bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-400 focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!chatReplyText.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-xl transition-all disabled:opacity-40 flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
