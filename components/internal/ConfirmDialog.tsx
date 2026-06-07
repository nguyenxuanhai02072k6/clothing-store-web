'use client';

import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  requireReason?: boolean;
  reasonPlaceholder?: string;
  isDanger?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  requireReason = false,
  reasonPlaceholder = 'Vui lòng nhập lý do thực hiện...',
  isDanger = false
}: ConfirmDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('Bạn bắt buộc phải nhập lý do!');
      return;
    }
    setError('');
    onConfirm(reason);
    setReason('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-accent/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative bg-white border border-brand-border rounded-2xl max-w-md w-full shadow-2xl p-6 overflow-hidden z-10 text-brand-text"
          >
            {/* Header */}
            <div className="flex items-start gap-3.5 mb-4">
              <div className={`p-2 rounded-xl shrink-0 ${isDanger ? 'bg-brand-danger/10 text-brand-danger' : 'bg-brand-warning/10 text-brand-warning'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black uppercase tracking-tight">{title}</h3>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">{message}</p>
              </div>
              <button
                onClick={onClose}
                className="text-brand-muted hover:text-brand-text p-1 hover:bg-brand-bg rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reason input if required */}
            {requireReason && (
              <div className="mb-4">
                <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted block mb-1">
                  Lý do thực hiện <span className="text-brand-danger">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (e.target.value.trim()) setError('');
                  }}
                  placeholder={reasonPlaceholder}
                  rows={3}
                  className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-brand-accent bg-brand-bg text-brand-text focus:bg-white resize-none font-medium transition-all"
                />
                {error && <span className="text-[10px] text-brand-danger font-bold mt-1 block">{error}</span>}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3.5 border-t border-brand-border pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-brand-border rounded-lg text-xs font-bold text-brand-muted hover:bg-brand-bg transition-colors cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider text-white transition-all active:scale-95 cursor-pointer ${
                  isDanger ? 'bg-brand-danger hover:bg-brand-danger/90' : 'bg-brand-accent hover:bg-brand-accent/90'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
