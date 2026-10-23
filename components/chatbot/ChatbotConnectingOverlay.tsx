'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ChatbotConnectingOverlayProps {
  isConnecting: boolean;
}

export const ChatbotConnectingOverlay: React.FC<ChatbotConnectingOverlayProps> = ({
  isConnecting,
}) => {
  return (
    <AnimatePresence>
      {isConnecting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-5 sm:mb-6 flex items-center justify-center">
            <span
              className="absolute inset-0 bg-neutral-900/5 rounded-full border border-neutral-900/10 animate-ping"
              style={{ animationDuration: '3s' }}
            />
            <span
              className="absolute inset-2 bg-neutral-900/10 rounded-full border border-neutral-900/20 animate-ping"
              style={{ animationDuration: '2s' }}
            />
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
  );
};
