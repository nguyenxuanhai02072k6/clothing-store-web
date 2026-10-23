'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface ChatbotFloatingButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatbotFloatingButton: React.FC<ChatbotFloatingButtonProps> = ({
  isOpen,
  onToggle,
}) => {
  return (
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
        onClick={onToggle}
        className="relative z-10 bg-white/75 backdrop-blur-2xl border border-neutral-200/50 text-neutral-900 px-4 py-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:bg-white active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Novyn Chatbot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              className="flex items-center justify-center"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="chat-icon"
              className="flex items-center gap-2"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
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
  );
};
