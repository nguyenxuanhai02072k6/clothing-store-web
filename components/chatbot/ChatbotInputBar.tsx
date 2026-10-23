'use client';

import React from 'react';
import { Send } from 'lucide-react';
import { ChatMode } from './chatbotTypes';

interface ChatbotInputBarProps {
  inputValue: string;
  chatMode: ChatMode;
  onChangeInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChatbotInputBar: React.FC<ChatbotInputBarProps> = ({
  inputValue,
  chatMode,
  onChangeInput,
  onSubmit,
}) => {
  const placeholder =
    chatMode === 'ai'
      ? 'Hỏi Novyn Muse điều gì...'
      : chatMode === 'live'
      ? 'Nhắn cho nhân viên CSKH...'
      : 'Nhắn cho Mai An...';

  return (
    <form
      onSubmit={onSubmit}
      className="p-2.5 sm:p-3 bg-white border-t border-neutral-100 flex items-center gap-2 shrink-0"
    >
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => onChangeInput(e.target.value)}
        className="flex-grow bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs focus:outline-none focus:border-neutral-400 focus:bg-white transition-all text-neutral-800"
      />
      <button
        type="submit"
        disabled={!inputValue.trim() || chatMode === 'connecting'}
        className="bg-neutral-950 hover:bg-neutral-800 text-white p-2 sm:p-2.5 rounded-xl transition-all disabled:opacity-40 flex items-center justify-center cursor-pointer"
        aria-label="Gửi tin nhắn"
      >
        <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </form>
  );
};
