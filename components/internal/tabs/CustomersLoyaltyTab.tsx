'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface CustomersLoyaltyTabProps {
  usersList: any[];
}

export default function CustomersLoyaltyTab({ usersList }: CustomersLoyaltyTabProps) {
  const [customerSearch, setCustomerSearch] = useState('');

  const filteredCustomers = usersList.filter((u: any) => {
    if (u.role !== 'customer') return false;
    const q = customerSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  const tierColors: Record<string, string> = {
    diamond: 'from-cyan-500 to-blue-650 text-white',
    platinum: 'from-slate-700 to-slate-900 text-white',
    gold: 'from-amber-400 to-orange-500 text-white',
    silver: 'from-slate-350 to-slate-450 text-neutral-800 border-slate-205',
    standard: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
  };

  const tierLabels: Record<string, string> = {
    diamond: 'KIM CƯƠNG (DIAMOND)',
    platinum: 'BẠCH KIM (PLATINUM)',
    gold: 'VÀNG (GOLD)',
    silver: 'BẠC (SILVER)',
    standard: 'STANDARD MEMBER',
  };

  return (
    <div>
      <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Quản lý Khách hàng & Loyalty Tiers</h3>
      <p className="text-xs text-neutral-400 mb-8">Tra cứu nhanh hồ sơ khách hàng, phân hạng VIP Loyalty Program và kích hoạt quyền lợi chăm sóc đặc biệt.</p>

      <div className="mb-6 max-w-md relative">
        <input
          type="text"
          placeholder="Tìm kiếm khách hàng theo tên, email, sđt..."
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400 bg-white text-neutral-800"
        />
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.map((cust: any) => {
          const spent = cust.totalSpent || 0;
          const tier = spent >= 60000000 ? 'diamond' :
                       spent >= 30000000 ? 'platinum' :
                       spent >= 15000000 ? 'gold' :
                       spent >= 5000000 ? 'silver' : 'standard';

          return (
            <div key={cust.id} className="border border-neutral-100 bg-white p-5 rounded-3xl shadow-sm flex items-start justify-between gap-4 hover:border-neutral-200 transition-all duration-300">
              <div className="min-w-0">
                <h4 className="text-xs font-black text-neutral-900 mb-0.5 truncate">{cust.name}</h4>
                <p className="text-[10px] text-neutral-450 font-bold mb-2">{cust.email} • {cust.phone || 'Chưa có SĐT'}</p>
                
                <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black tracking-widest bg-gradient-to-r ${tierColors[tier]}`}>
                  {tierLabels[tier]}
                </span>
              </div>
              
              <div className="text-right">
                <span className="text-[9px] font-bold text-neutral-400 uppercase block mb-0.5">Tích lũy chi tiêu</span>
                <span className="text-xs font-black text-neutral-950">{formatPrice(spent)}</span>
              </div>
            </div>
          );
        })}
        {filteredCustomers.length === 0 && (
          <div className="col-span-2 py-12 text-center text-neutral-400 italic text-xs">
            Không tìm thấy khách hàng nào phù hợp với từ khóa tìm kiếm.
          </div>
        )}
      </div>
    </div>
  );
}
