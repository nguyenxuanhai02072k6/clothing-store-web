'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';

export const OmnichannelSubsystem: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b pb-4">
        <h3 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-indigo-500" />
          Đồng bộ hóa đơn hàng & Doanh thu đa kênh (Omnichannel Hub)
        </h3>
        <p className="text-xs text-neutral-450 mt-1">
          Giám sát luồng đơn hàng thời gian thực đồng bộ từ Web, Shopee, TikTok Shop, Lazada và Chat inbox.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Realtime stream */}
        <div className="lg:col-span-8 bg-white border rounded-3xl p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider">
            Luồng đơn hàng đa kênh đồng bộ thời gian thực
          </h4>

          <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
            {[
              { id: 'SHP-12903', channel: 'Shopee', name: 'Nguyễn Thị Thanh', total: 680000, date: '2026-06-02 09:15', status: 'shipping' },
              { id: 'TTS-88127', channel: 'TikTok Shop', name: 'Trần Minh Đức', total: 1250000, date: '2026-06-02 09:30', status: 'completed' },
              { id: 'LAZ-44912', channel: 'Lazada', name: 'Đoàn Hùng Anh', total: 390000, date: '2026-06-02 09:40', status: 'pending' },
              { id: 'WEB-99120', channel: 'Website', name: 'Lâm Khánh Vy', total: 2200000, date: '2026-06-02 09:50', status: 'completed' },
              { id: 'FB-33921', channel: 'Facebook Inbox', name: 'Phạm Thu Hằng', total: 950000, date: '2026-06-02 10:05', status: 'pending' },
            ].map((ord) => (
              <div
                key={ord.id}
                className="bg-neutral-50 rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="text-xs font-semibold text-neutral-800 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-white ${
                        ord.channel === 'Shopee'
                          ? 'bg-orange-500'
                          : ord.channel === 'TikTok Shop'
                          ? 'bg-neutral-900'
                          : ord.channel === 'Lazada'
                          ? 'bg-blue-600'
                          : ord.channel === 'Website'
                          ? 'bg-rose-500'
                          : 'bg-sky-500'
                      }`}
                    >
                      {ord.channel}
                    </span>
                    <span className="text-neutral-900 font-bold">{ord.id}</span>
                  </div>
                  <span className="text-[11px] text-neutral-600 block">
                    Khách hàng: {ord.name} • lúc {ord.date}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold shrink-0 justify-between sm:justify-end">
                  <span className="font-mono text-rose-650 font-black">{formatPrice(ord.total)}</span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                      ord.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : ord.status === 'shipping'
                        ? 'bg-blue-50 text-blue-600 border border-blue-100 animate-pulse'
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}
                  >
                    {ord.status === 'completed' ? 'Đã giao' : ord.status === 'shipping' ? 'Đang ship' : 'Chờ duyệt'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales share metrics */}
        <div className="lg:col-span-4 bg-white border rounded-3xl p-5 shadow-sm space-y-5">
          <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider">
            Tỷ trọng doanh thu giữa các kênh bán hàng
          </h4>

          <div className="space-y-4 text-xs font-medium text-neutral-700">
            {[
              { channel: 'Website chính thức', pct: 40, amt: 12500000, color: 'bg-rose-500' },
              { channel: 'Shopee Mall', pct: 25, amt: 7800000, color: 'bg-orange-500' },
              { channel: 'TikTok Shop', pct: 20, amt: 6200000, color: 'bg-neutral-900' },
              { channel: 'Lazada Mall', pct: 10, amt: 3100000, color: 'bg-blue-600' },
              { channel: 'Facebook Inbox', pct: 5, amt: 1560000, color: 'bg-sky-500' },
            ].map((ch, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between font-bold text-neutral-750">
                  <span>{ch.channel}</span>
                  <span className="font-mono">
                    {ch.pct}% ({formatPrice(ch.amt)})
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${ch.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${ch.pct}%` }}
                    transition={{ duration: 1.2, delay: idx * 0.1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
