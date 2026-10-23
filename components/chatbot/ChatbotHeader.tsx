'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, Loader2, ArrowLeft, X } from 'lucide-react';
import { ChatMode } from './chatbotTypes';
import { AGENT_AVATAR } from './chatbotLogic';

interface ChatbotHeaderProps {
  chatMode: ChatMode;
  onResetToAI: () => void;
  onClose: () => void;
}

export const ChatbotHeader: React.FC<ChatbotHeaderProps> = ({
  chatMode,
  onResetToAI,
  onClose,
}) => {
  const isLiveMode = chatMode === 'live';
  const isAgentMode = chatMode === 'agent' || isLiveMode;

  return (
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
            <Image src={AGENT_AVATAR} alt="CSKH" fill className="object-cover" unoptimized />
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
          <button onClick={onResetToAI} className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors mr-1 cursor-pointer" title="Quay lại AI">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <button onClick={onClose} className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" aria-label="Đóng">
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};
