'use client';

import React, { useState } from 'react';
import { QrCode, X, Copy, Check, Download, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { getVoucherQrCodeUrl } from '@/lib/voucherQr';
import { formatPrice } from '@/lib/utils';

interface VoucherQrViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: {
    code: string;
    description?: string;
    value?: number;
    type?: string;
  } | null;
}

export const VoucherQrViewModal: React.FC<VoucherQrViewModalProps> = ({
  isOpen,
  onClose,
  voucher,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !voucher) return null;

  const qrImageUrl = getVoucherQrCodeUrl(voucher.code, 280);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `NOVYN-VOUCHER-${voucher.code}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-neutral-200 text-neutral-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col">
        {/* Top Header */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-xs uppercase tracking-wider text-neutral-900">
                Thẻ Voucher Điện Tử
              </h3>
              <p className="text-[10px] text-neutral-500">Mã QR chính hãng NOVYN WEAR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-200/60 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Presentation Box */}
        <div className="p-6 flex flex-col items-center text-center bg-gradient-to-b from-white to-neutral-50/50">
          {/* Card Label */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[10px] font-bold uppercase tracking-widest text-neutral-700 mb-4">
            <Sparkles className="w-3 h-3 text-amber-500" />
            NOVYN PRIVILEGE REWARD
          </div>

          {/* QR Code Image Card */}
          <div className="p-3.5 bg-white rounded-2xl border-2 border-neutral-900/10 shadow-lg mb-4 relative group">
            <img
              src={qrImageUrl}
              alt={`QR Code ${voucher.code}`}
              className="w-48 h-48 object-contain rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-md border-2 border-white">
                <Tag className="w-4 h-4 text-rose-400" />
              </div>
            </div>
          </div>

          {/* Code display with copy button */}
          <div className="w-full flex items-center justify-between px-4 py-2.5 bg-neutral-100 rounded-xl border border-neutral-200 mb-3">
            <div className="text-left">
              <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-widest">
                Mã ưu đãi
              </span>
              <span className="text-base font-black font-mono tracking-wider text-neutral-900">
                {voucher.code}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-50 text-[10px] font-bold text-neutral-700 flex items-center gap-1 shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-neutral-500" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>

          {/* Voucher Details */}
          {voucher.description && (
            <p className="text-xs text-neutral-600 font-medium px-2 leading-relaxed mb-1">
              {voucher.description}
            </p>
          )}

          {voucher.value !== undefined && (
            <div className="text-xs font-bold text-rose-600 mt-1">
              {voucher.type === 'percent'
                ? `Chiết khấu ${voucher.value}% tổng hóa đơn`
                : `Giảm trực tiếp ${formatPrice(voucher.value)}`}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Có thể quét tại quầy thu ngân hoặc giỏ hàng online</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex gap-2">
          <button
            onClick={handleDownloadQr}
            className="flex-1 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Tải ảnh mã QR
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
