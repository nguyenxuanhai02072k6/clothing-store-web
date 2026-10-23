import React from 'react';
import { ArrowRight } from 'lucide-react';
import { FormErrors } from './checkoutTypes';

interface CheckoutCustomerInfoStepProps {
  fullName: string;
  setFullName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  email: string;
  setEmail: (email: string) => void;
  setAddress: (addr: string) => void;
  addressBook: any[];
  currentUser: any;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  onContinue: () => void;
}

export function CheckoutCustomerInfoStep({
  fullName,
  setFullName,
  phone,
  setPhone,
  email,
  setEmail,
  setAddress,
  addressBook,
  currentUser,
  errors,
  setErrors,
  onContinue,
}: CheckoutCustomerInfoStepProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm flex flex-col gap-5">
      <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest pb-4 border-b border-brand-border mb-2">
        1. Thông tin liên hệ
      </h3>

      {currentUser && addressBook.length > 0 && (
        <div className="flex flex-col gap-2 pb-4 border-b border-brand-border mb-2 animate-fade-in">
          <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1">
            Sử dụng địa chỉ đã lưu
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {addressBook.map((addr) => {
              const isSelected = fullName === addr.fullName && phone === addr.phone;
              return (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => {
                    setFullName(addr.fullName);
                    setPhone(addr.phone);
                    setAddress(`${addr.detailAddress}, ${addr.city}`);
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer focus:outline-none ${
                    isSelected
                      ? 'border-brand-text bg-neutral-50 shadow-sm'
                      : 'border-brand-border hover:border-brand-text bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-bold text-brand-text">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.5 border border-emerald-100 rounded-md">Mặc định</span>
                    )}
                  </div>
                  <span className="text-[10px] text-brand-muted font-mono">{addr.phone}</span>
                  <span className="text-[10px] text-brand-muted line-clamp-1">{addr.detailAddress}, {addr.city}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Họ và tên *</label>
        <input
          type="text"
          placeholder="Ví dụ: Nguyễn Văn A..."
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors({ ...errors, fullName: undefined });
          }}
          className={`bg-white border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-accent focus:bg-neutral-50 w-full ${
            errors.fullName ? 'border-rose-600 focus:border-rose-700' : 'border-brand-border'
          }`}
        />
        {errors.fullName && <p className="text-[10px] font-bold text-rose-600">{errors.fullName}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phone Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Số điện thoại *</label>
          <input
            type="tel"
            placeholder="Ví dụ: 0909xxxxxx..."
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors({ ...errors, phone: undefined });
            }}
            className={`bg-white border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-accent focus:bg-neutral-50 w-full ${
              errors.phone ? 'border-rose-600 focus:border-rose-700' : 'border-brand-border'
            }`}
          />
          {errors.phone && <p className="text-[10px] font-bold text-rose-600">{errors.phone}</p>}
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Email liên hệ *</label>
          <input
            type="email"
            placeholder="Ví dụ: name@gmail.com..."
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            className={`bg-white border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-accent focus:bg-neutral-50 w-full ${
              errors.email ? 'border-rose-600 focus:border-rose-700' : 'border-brand-border'
            }`}
          />
          {errors.email && <p className="text-[10px] font-bold text-rose-600">{errors.email}</p>}
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-4 bg-brand-accent hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
      >
        <span>Tiếp tục vận chuyển</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
