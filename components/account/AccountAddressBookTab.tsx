'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccountAddressBookTabProps {
  addresses: any[];
  setAddresses: React.Dispatch<React.SetStateAction<any[]>>;
  currentUser: any;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AccountAddressBookTab({
  addresses,
  setAddresses,
  currentUser,
  showToast
}: AccountAddressBookTabProps) {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrDetail, setAddrDetail] = useState('');
  const [addrCity, setAddrCity] = useState('TP. Hồ Chí Minh');
  const [addrDefault, setAddrDefault] = useState(false);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName.trim() || !addrPhone.trim() || !addrDetail.trim()) {
      showToast('Vui lòng điền đầy đủ thông tin địa chỉ.', 'error');
      return;
    }

    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!phoneRegex.test(addrPhone)) {
      showToast('Số điện thoại nhận hàng không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09).', 'error');
      return;
    }

    let updated = [...addresses];

    if (addrDefault) {
      updated = updated.map(a => ({ ...a, isDefault: false }));
    }

    if (editingAddress) {
      updated = updated.map(a => a.id === editingAddress.id ? {
        ...a,
        fullName: addrName,
        phone: addrPhone,
        detailAddress: addrDetail,
        city: addrCity,
        isDefault: addrDefault
      } : a);
    } else {
      const newAddr = {
        id: `addr-${Math.floor(Math.random() * 100000)}`,
        fullName: addrName,
        phone: addrPhone,
        detailAddress: addrDetail,
        city: addrCity,
        isDefault: updated.length === 0 ? true : addrDefault
      };
      updated.push(newAddr);
    }

    setAddresses(updated);
    try {
      if (currentUser) {
        localStorage.setItem(`novyn_addresses_${currentUser.id}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }

    setAddrName('');
    setAddrPhone('');
    setAddrDetail('');
    setAddrCity('TP. Hồ Chí Minh');
    setAddrDefault(false);
    setEditingAddress(null);
    setShowAddressForm(false);
    showToast('Đã lưu địa chỉ nhận hàng thành công!', 'success');
  };

  const handleEditAddressClick = (addr: any) => {
    setEditingAddress(addr);
    setAddrName(addr.fullName);
    setAddrPhone(addr.phone);
    setAddrDetail(addr.detailAddress);
    setAddrCity(addr.city);
    setAddrDefault(addr.isDefault);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (id: string) => {
    const target = addresses.find(a => a.id === id);
    let updated = addresses.filter(a => a.id !== id);
    if (target?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    setAddresses(updated);
    try {
      if (currentUser) {
        localStorage.setItem(`novyn_addresses_${currentUser.id}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
    showToast('Đã xóa địa chỉ nhận hàng.', 'info');
  };

  const handleSetDefaultAddress = (id: string) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    try {
      if (currentUser) {
        localStorage.setItem(`novyn_addresses_${currentUser.id}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
    showToast('Đã thiết lập địa chỉ mặc định mới.', 'success');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-brand-border mb-6 gap-4 text-left">
        <div>
          <h3 className="text-xl font-normal text-brand-text tracking-widest uppercase mb-1">Sổ địa chỉ nhận hàng</h3>
          <p className="text-xs text-brand-muted font-light">Quản lý các địa chỉ nhận hàng để thanh toán nhanh chóng.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingAddress(null);
            setAddrName('');
            setAddrPhone('');
            setAddrDetail('');
            setAddrCity('TP. Hồ Chí Minh');
            setAddrDefault(addresses.length === 0);
            setShowAddressForm(!showAddressForm);
          }}
          className="bg-brand-accent hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm shrink-0"
        >
          {showAddressForm ? 'Hủy bỏ' : '+ Thêm địa chỉ mới'}
        </button>
      </div>

      <AnimatePresence>
        {showAddressForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSaveAddress}
            className="bg-neutral-50 p-5 border border-brand-border rounded-2xl mb-8 flex flex-col gap-4 overflow-hidden text-left"
          >
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest">
              {editingAddress ? 'Cập nhật địa chỉ nhận hàng' : 'Thêm địa chỉ nhận hàng mới'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase">Họ và tên người nhận *</label>
                <input
                  type="text"
                  required
                  value={addrName}
                  onChange={(e) => setAddrName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A..."
                  className="bg-white border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase">Số điện thoại liên hệ *</label>
                <input
                  type="tel"
                  required
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  placeholder="Ví dụ: 0909xxxxxx..."
                  className="bg-white border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase">
                  Địa chỉ chi tiết (Số nhà, tên đường, phường/xã, quận/huyện) *
                </label>
                <input
                  type="text"
                  required
                  value={addrDetail}
                  onChange={(e) => setAddrDetail(e.target.value)}
                  placeholder="Ví dụ: 120 Lê Lợi..."
                  className="bg-white border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase">Tỉnh / Thành phố *</label>
                <select
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  className="bg-white border border-brand-border rounded-xl px-3 py-2.5 text-xs text-brand-text font-bold focus:outline-none cursor-pointer"
                >
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer mt-2 w-fit text-xs text-brand-muted font-bold">
              <input
                type="checkbox"
                checked={addrDefault}
                disabled={editingAddress?.isDefault && addrDefault}
                onChange={(e) => setAddrDefault(e.target.checked)}
                className="w-4 h-4 rounded border-brand-border accent-brand-accent"
              />
              <span>Đặt làm địa chỉ nhận hàng mặc định</span>
            </label>

            <button
              type="submit"
              className="bg-brand-accent hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 w-fit px-8 mt-2"
            >
              Lưu địa chỉ
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-brand-border flex flex-col items-center">
          <span className="text-3xl mb-3">📍</span>
          <p className="text-xs text-brand-muted font-bold">Sổ địa chỉ của bạn đang trống.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-5 border border-brand-border rounded-xl bg-neutral-50/45 hover:bg-white transition-all shadow-xs flex flex-col sm:flex-row justify-between gap-4 text-left"
            >
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h4 className="text-xs font-bold uppercase text-brand-text">{addr.fullName}</h4>
                  {addr.isDefault && (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full shrink-0">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-xs text-brand-text font-medium leading-relaxed">
                  {addr.detailAddress}, {addr.city}
                </p>
                <span className="text-[10px] text-brand-muted block mt-1 tracking-wider">
                  Sđt: {addr.phone}
                </span>
              </div>

              <div className="flex sm:flex-col gap-2 justify-end sm:items-end shrink-0">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditAddressClick(addr)}
                    className="px-3 py-1.5 border border-brand-border bg-white text-[9px] font-bold uppercase tracking-widest rounded-lg hover:border-brand-text transition-colors cursor-pointer"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="px-3 py-1.5 border border-rose-100 bg-white text-[9px] font-bold uppercase tracking-widest text-rose-600 rounded-lg hover:border-rose-300 transition-colors cursor-pointer"
                  >
                    Xóa
                  </button>
                </div>
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefaultAddress(addr.id)}
                    className="text-[9px] font-bold text-brand-muted hover:text-brand-text uppercase tracking-widest cursor-pointer mt-1"
                  >
                    Đặt mặc định
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
