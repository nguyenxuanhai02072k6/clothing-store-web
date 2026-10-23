'use client';

import React from 'react';
import { ShoppingBag, HelpCircle, X, Plus, History } from 'lucide-react';
import { CartTab } from '../posTypes';

interface POSHeaderTabsProps {
  currentUser: any;
  cartTabs: CartTab[];
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  handleAddNewTab: () => void;
  handleCloseTab: (tabIdToClose: string, e?: React.MouseEvent) => void;
  setShowHotkeysGuide: (v: boolean) => void;
  posHistory: any[];
  setPrintedReceipt: (receipt: any) => void;
}

export default function POSHeaderTabs({
  currentUser,
  cartTabs,
  activeTabId,
  setActiveTabId,
  handleAddNewTab,
  handleCloseTab,
  setShowHotkeysGuide,
  posHistory,
  setPrintedReceipt
}: POSHeaderTabsProps) {
  return (
    <div className="bg-white border rounded-2xl p-4 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-neutral-900 tracking-tight uppercase">
                Quầy Thu Ngân Bán Lẻ POS 2.0
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                Online
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Thu ngân: <span className="font-bold text-neutral-800">{currentUser?.name || 'Nhân viên'}</span> • Chi nhánh:{' '}
              <span className="font-bold text-neutral-800">{currentUser?.branch || 'Chi nhánh Quận 1'}</span>
            </p>
          </div>
        </div>

        {/* Hotkey Helper Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setShowHotkeysGuide(true)}
            className="px-2.5 py-1 text-[10px] font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Phím tắt</span>
          </button>
          <span className="px-2 py-1 text-[9px] font-mono font-bold bg-neutral-50 text-neutral-500 rounded border border-neutral-200">
            <kbd className="font-sans font-black text-neutral-800">F1</kbd> Tìm SP
          </span>
          <span className="px-2 py-1 text-[9px] font-mono font-bold bg-neutral-50 text-neutral-500 rounded border border-neutral-200">
            <kbd className="font-sans font-black text-neutral-800">F2</kbd> Khách
          </span>
          <span className="px-2 py-1 text-[9px] font-mono font-bold bg-neutral-50 text-neutral-500 rounded border border-neutral-200">
            <kbd className="font-sans font-black text-neutral-800">F3</kbd> Voucher
          </span>
          <span className="px-2 py-1 text-[9px] font-mono font-bold bg-rose-50 text-rose-700 rounded border border-rose-200">
            <kbd className="font-sans font-black text-rose-900">F9</kbd> Thanh toán
          </span>
          <span className="px-2 py-1 text-[9px] font-mono font-bold bg-neutral-50 text-neutral-500 rounded border border-neutral-200">
            <kbd className="font-sans font-black text-neutral-800">F10</kbd> In lại bill
          </span>
        </div>
      </div>

      {/* MULTI-CART HOLD TABS */}
      <div className="flex items-center gap-2 pt-2 border-t border-neutral-150 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5">
          {cartTabs.map((tab, idx) => {
            const isActive = tab.id === activeTabId;
            const itemCount = tab.items.reduce((sum, i) => sum + i.quantity, 0);

            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none border ${
                  isActive
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200'
                }`}
              >
                <span className="font-mono text-[10px] text-neutral-400 group-hover:text-neutral-500">
                  Ctrl+{idx + 1}
                </span>
                <span>{tab.name}</span>
                {itemCount > 0 && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-rose-500 text-white' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {itemCount}
                  </span>
                )}
                {/* Close Tab Button */}
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className={`p-0.5 rounded-md hover:bg-white/20 transition-colors ${
                    isActive ? 'text-white/70 hover:text-white' : 'text-neutral-400 hover:text-neutral-700'
                  }`}
                  title="Đóng đơn"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* New Tab Button */}
        {cartTabs.length < 5 && (
          <button
            onClick={handleAddNewTab}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-neutral-50 text-neutral-700 border border-dashed border-neutral-300 hover:border-neutral-400 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
            title="Mở thêm đơn tạm mới"
          >
            <Plus className="w-3.5 h-3.5 text-neutral-500" />
            <span>Thêm đơn ({cartTabs.length}/5)</span>
          </button>
        )}

        {/* Re-print last bill quick action */}
        {posHistory.length > 0 && (
          <button
            onClick={() => setPrintedReceipt(posHistory[0])}
            className="ml-auto px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            title="In lại hóa đơn gần nhất [F10]"
          >
            <History className="w-3.5 h-3.5 text-neutral-500" />
            <span>Bill gần nhất ({posHistory[0]?.id})</span>
          </button>
        )}
      </div>
    </div>
  );
}
