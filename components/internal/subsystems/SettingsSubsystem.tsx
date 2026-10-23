'use client';

import React from 'react';
import { Settings } from 'lucide-react';

export const SettingsSubsystem: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b pb-4">
        <h3 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-neutral-800" />
          Cấu hình & Cài đặt hệ thống ERP
        </h3>
        <p className="text-xs text-neutral-450 mt-1">
          Thiết lập chính sách đồng bộ đa kênh, bảo mật phân quyền nhân viên và thông số cửa hàng NOVYN WEAR.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850 border-b pb-2">
            Phân quyền chi nhánh
          </h4>
          <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed">
            Thiết lập định vị GPS chấm công của nhân viên, giới hạn bán kính check-in tại quầy và quy định lịch ca xoay tự động.
          </p>
          <div className="pt-2 text-[10px] space-y-1.5 text-neutral-600 font-bold">
            <div>• Bán kính check-in: <span className="text-neutral-900 font-mono">100m</span></div>
            <div>• GPS Chi nhánh Q1: <span className="text-neutral-900 font-mono">10.7769, 106.7009</span></div>
            <div>• GPS Thảo Điền: <span className="text-neutral-900 font-mono">10.8016, 106.7381</span></div>
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850 border-b pb-2">
            Đồng bộ API Omnichannel
          </h4>
          <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed">
            Kết nối khóa token đồng bộ tồn kho thời gian thực với Shopee Open API, TikTok Shop, Lazada, và Webhooks Facebook Messenger.
          </p>
          <div className="pt-2 text-[10px] space-y-1.5 text-neutral-600 font-bold">
            <div>• Shopee API Sync: <span className="text-emerald-600 font-extrabold">Đang kết nối</span></div>
            <div>• TikTok Shop Sync: <span className="text-emerald-600 font-extrabold">Đang kết nối</span></div>
            <div>• Auto-refresh stock: <span className="text-neutral-900 font-mono">5 phút/lần</span></div>
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850 border-b pb-2">
            Bảo mật hệ thống ERP
          </h4>
          <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed">
            Giám sát nhật ký hoạt động hệ thống (System Audit logs), quản lý các phiên đăng nhập, cấu hình khóa sổ thuế và mã PIN của két tiền mặt.
          </p>
          <div className="pt-2 text-[10px] space-y-1.5 text-neutral-600 font-bold">
            <div>• Khóa sổ tài chính ngày: <span className="text-neutral-900 font-mono">22:30</span></div>
            <div>• Phiên làm việc max: <span className="text-neutral-900 font-mono">8 tiếng</span></div>
            <div>• Yêu cầu 2FA: <span className="text-rose-600 font-extrabold">Chưa kích hoạt</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
