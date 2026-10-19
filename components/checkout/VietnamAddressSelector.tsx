'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapPin, Navigation, Sparkles, Building2, Store } from 'lucide-react';
import { VIETNAM_PROVINCES, Province, District } from '../../data/vietnamLocations';
import { smartShippingEngine, SmartShippingResult } from '../../lib/services/smartShippingEngine';

export interface AddressSelectorValue {
  province: string;
  district: string;
  ward: string;
  street: string;
  fullAddress: string;
  shippingData: SmartShippingResult;
}

interface VietnamAddressSelectorProps {
  initialProvince?: string;
  initialDistrict?: string;
  initialWard?: string;
  initialStreet?: string;
  subtotal: number;
  customerTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'standard';
  paymentMethod?: 'cod' | 'transfer' | 'vnpay' | 'card';
  appliedPromoCode?: string;
  onChange: (value: AddressSelectorValue) => void;
  error?: string;
}

export default function VietnamAddressSelector({
  initialProvince = 'TP. Hồ Chí Minh',
  initialDistrict = 'Quận 1',
  initialWard = 'Phường Bến Thành',
  initialStreet = '',
  subtotal,
  customerTier = 'bronze',
  paymentMethod = 'cod',
  appliedPromoCode,
  onChange,
  error
}: VietnamAddressSelectorProps) {
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>(initialProvince);
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>(initialDistrict);
  const [selectedWardName, setSelectedWardName] = useState<string>(initialWard);
  const [streetAddress, setStreetAddress] = useState<string>(initialStreet);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // 1. Tìm Object Province đang được chọn
  const currentProvince: Province = useMemo(() => {
    return VIETNAM_PROVINCES.find(p => p.name === selectedProvinceName) || VIETNAM_PROVINCES[0];
  }, [selectedProvinceName]);

  // 2. Tìm Object District đang được chọn
  const currentDistrict: District | undefined = useMemo(() => {
    return currentProvince.districts.find(d => d.name === selectedDistrictName) || currentProvince.districts[0];
  }, [currentProvince, selectedDistrictName]);

  // 3. Danh sách Phường/Xã tương ứng
  const wardsList: string[] = useMemo(() => {
    return currentDistrict?.wards || [];
  }, [currentDistrict]);

  // 4. Tính toán định tuyến và cước phí tự động thông qua SmartShippingEngine
  const shippingData: SmartShippingResult = useMemo(() => {
    return smartShippingEngine.calculate({
      provinceName: selectedProvinceName,
      districtName: selectedDistrictName,
      wardName: selectedWardName,
      subtotal,
      customerTier,
      paymentMethod,
      appliedPromoCode
    });
  }, [selectedProvinceName, selectedDistrictName, selectedWardName, subtotal, customerTier, paymentMethod, appliedPromoCode]);

  // 5. Đồng bộ chuỗi địa chỉ đầy đủ lên Component cha (CheckoutPage)
  useEffect(() => {
    const fullAddress = [
      streetAddress.trim(),
      selectedWardName,
      selectedDistrictName,
      selectedProvinceName
    ].filter(Boolean).join(', ');

    onChangeRef.current({
      province: selectedProvinceName,
      district: selectedDistrictName,
      ward: selectedWardName,
      street: streetAddress,
      fullAddress,
      shippingData
    });
  }, [selectedProvinceName, selectedDistrictName, selectedWardName, streetAddress, shippingData]);

  // Xử lý đổi Tỉnh/Thành -> Reset Quận & Phường tương ứng
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvName = e.target.value;
    setSelectedProvinceName(newProvName);

    const newProv = VIETNAM_PROVINCES.find(p => p.name === newProvName) || VIETNAM_PROVINCES[0];
    const defaultDist = newProv.districts[0]?.name || '';
    const defaultWard = newProv.districts[0]?.wards[0] || '';

    setSelectedDistrictName(defaultDist);
    setSelectedWardName(defaultWard);
  };

  // Xử lý đổi Quận/Huyện -> Reset Phường tương ứng
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistName = e.target.value;
    setSelectedDistrictName(newDistName);

    const targetDist = currentProvince.districts.find(d => d.name === newDistName);
    const defaultWard = targetDist?.wards[0] || '';
    setSelectedWardName(defaultWard);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Bộ 3 Dropdown Tỉnh/Thành -> Quận/Huyện -> Phường/Xã */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Cấp 1: Tỉnh / Thành phố */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3 h-3 text-brand-accent" />
            Tỉnh / Thành phố *
          </label>
          <select
            value={selectedProvinceName}
            onChange={handleProvinceChange}
            className="bg-white border border-brand-border rounded-xl px-3 py-2.5 text-xs text-brand-text font-medium focus:outline-none focus:border-brand-accent focus:bg-neutral-50 transition-all cursor-pointer shadow-2xs"
          >
            {VIETNAM_PROVINCES.map(prov => (
              <option key={prov.id} value={prov.name}>
                {prov.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cấp 2: Quận / Huyện / Thị xã */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider flex items-center gap-1">
            <Navigation className="w-3 h-3 text-brand-accent" />
            Quận / Huyện *
          </label>
          <select
            value={selectedDistrictName}
            onChange={handleDistrictChange}
            className="bg-white border border-brand-border rounded-xl px-3 py-2.5 text-xs text-brand-text font-medium focus:outline-none focus:border-brand-accent focus:bg-neutral-50 transition-all cursor-pointer shadow-2xs"
          >
            {currentProvince.districts.map(dist => (
              <option key={dist.name} value={dist.name}>
                {dist.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cấp 3: Phường / Xã / Thị trấn */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3 text-brand-accent" />
            Phường / Xã *
          </label>
          <select
            value={selectedWardName}
            onChange={(e) => setSelectedWardName(e.target.value)}
            className="bg-white border border-brand-border rounded-xl px-3 py-2.5 text-xs text-brand-text font-medium focus:outline-none focus:border-brand-accent focus:bg-neutral-50 transition-all cursor-pointer shadow-2xs"
          >
            {wardsList.map(ward => (
              <option key={ward} value={ward}>
                {ward}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cấp 4: Số nhà, tên đường chi tiết */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
          Địa chỉ chi tiết (Số nhà, tên đường, căn hộ / toà nhà) *
        </label>
        <input
          type="text"
          placeholder="Ví dụ: 125 Lê Lợi, Căn hộ A-12.04, Toà nhà Sunwah..."
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          className={`bg-white border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-accent focus:bg-neutral-50 w-full transition-all shadow-2xs ${
            error ? 'border-rose-500 bg-rose-50/30' : 'border-brand-border'
          }`}
        />
        {error && <p className="text-[10px] font-bold text-rose-600">{error}</p>}
      </div>

      {/* Thanh Thông Báo Định Tuyến Kho Thông Minh (Smart Routing Badge) */}
      <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-neutral-600">
            Kho phục vụ tối ưu: <strong className="text-brand-text font-bold">{shippingData.recommendedBranch}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-[10px] border border-emerald-200">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          {shippingData.zone === 'ZONE_1_HCM'
            ? 'Tuyến Nội thành TP.HCM (Hỗ trợ Hỏa Tốc 2H)'
            : shippingData.zone === 'ZONE_2_SOUTH'
            ? 'Tuyến Miền Nam (Giao 1-2 ngày)'
            : 'Tuyến Liên miền Đường bay (2-3 ngày)'}
        </div>
      </div>
    </div>
  );
}
