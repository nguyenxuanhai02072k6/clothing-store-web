'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCheck } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { ChatMessage } from './chatbotTypes';
import { AGENT_AVATAR } from './chatbotLogic';

interface ChatMessageItemProps {
  message: ChatMessage;
  onQuickReplyClick: (reply: string) => void;
  onProductClick?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onQuickReplyClick,
  onProductClick,
}) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  return (
    <div
      className={`flex flex-col gap-1.5 ${
        isUser ? 'items-end' : isSystem ? 'items-center w-full' : 'items-start'
      }`}
    >
      {isSystem && (
        <div className="my-1 bg-neutral-100/80 border border-neutral-200/50 text-[9px] sm:text-[10px] text-neutral-400 font-semibold px-3 sm:px-4 py-1.5 rounded-full text-center tracking-wide shadow-inner select-none max-w-[85%] uppercase">
          {message.text}
        </div>
      )}

      {!isSystem && (
        <div className="flex items-end gap-1.5 sm:gap-2 max-w-[88%] sm:max-w-[85%]">
          {message.sender === 'bot' && (
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-neutral-900 text-[7px] sm:text-[8px] font-black text-white flex items-center justify-center shrink-0 border border-neutral-200">
              AI
            </div>
          )}
          {message.sender === 'agent' && (
            <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden shrink-0 border border-neutral-200">
              <Image src={AGENT_AVATAR} alt="CSKH" fill className="object-cover" unoptimized />
            </div>
          )}
          <div
            className={`p-3 rounded-2xl text-xs leading-relaxed ${
              isUser
                ? 'bg-neutral-950 text-white rounded-br-none shadow-sm'
                : 'bg-white text-neutral-800 rounded-bl-none border border-neutral-100 shadow-sm'
            }`}
            style={{ whiteSpace: 'pre-line' }}
          >
            {message.text}
            {isUser && (
              <span className="block text-right mt-1 opacity-50">
                <CheckCheck className="w-3 h-3 inline" />
              </span>
            )}
          </div>
        </div>
      )}

      {/* Product slider */}
      {message.products && message.products.length > 0 && (
        <div className="w-full pl-6 sm:pl-8 pr-1 sm:pr-2 mt-1 shrink-0">
          <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin snap-x snap-mandatory">
            {message.products.slice(0, 4).map((prod) => (
              <div
                key={prod.id}
                className="w-40 sm:w-48 bg-white border border-neutral-150 rounded-2xl overflow-hidden shrink-0 shadow-sm snap-start flex flex-col hover:border-neutral-300 transition-all"
              >
                <div className="relative w-full aspect-[4/5] bg-neutral-50">
                  <Image src={prod.images[0]} alt={prod.name} fill className="object-cover" unoptimized />
                  {prod.badges?.[0] && (
                    <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-neutral-950 text-white text-[7px] sm:text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md">
                      {prod.badges[0]}
                    </span>
                  )}
                </div>
                <div className="p-2.5 sm:p-3 flex-grow flex flex-col justify-between">
                  <h4 className="text-[9px] sm:text-[10px] font-bold text-neutral-900 line-clamp-1 mb-0.5">
                    {prod.name}
                  </h4>
                  <span className="text-[9px] sm:text-[10px] font-bold text-neutral-800">
                    {formatPrice(prod.price)}
                  </span>
                  <Link
                    href={`/products/${prod.slug}`}
                    onClick={onProductClick}
                    className="mt-1.5 sm:mt-2 w-full text-center bg-neutral-950 text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider py-1.5 rounded-lg hover:bg-neutral-800 transition-colors block"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick replies */}
      {message.quickReplies && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1 sm:mt-2 pl-6 sm:pl-8">
          {message.quickReplies.map((reply) => (
            <button
              key={reply}
              onClick={() => onQuickReplyClick(reply)}
              className="bg-white hover:bg-neutral-50 text-neutral-800 text-[9px] sm:text-[10px] font-semibold border border-neutral-200/80 px-2.5 sm:px-3 py-1.5 rounded-full shadow-sm hover:border-neutral-400 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              {reply}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
