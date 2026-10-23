'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

export interface BranchStockViewTabProps {
  currentUser: any;
  productsList: any[];
  branchStock: any;
  branchSizeStock: any;
}

export default function BranchStockViewTab({
  currentUser,
  productsList,
  branchStock,
  branchSizeStock,
}: BranchStockViewTabProps) {
  const [stockSearch, setStockSearch] = useState('');

  return (
    <div>
      <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Tồn kho của chi nhánh</h3>
      <p className="text-xs text-neutral-400 mb-8">Tra cứu số lượng tồn của các sản phẩm cao cấp hiện khả dụng tại {currentUser.branch}.</p>

      <div className="mb-6 max-w-md relative">
        <input
          type="text"
          placeholder="Tìm sản phẩm theo tên..."
          value={stockSearch}
          onChange={(e) => setStockSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400 bg-white"
        />
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
        <div className="overflow-x-auto max-h-[500px] pr-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                <th className="p-3">Sản phẩm</th>
                <th className="p-3">Danh mục</th>
                <th className="p-3 text-center">Tồn kho chi nhánh</th>
                <th className="p-3 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
              {productsList
                .filter((prod: any) => prod.name.toLowerCase().includes(stockSearch.toLowerCase()))
                .map((prod: any) => {
                  const stockCount = branchStock?.[prod.id]?.[currentUser?.branch || ''] || 0;
                  const sizeStock = branchSizeStock?.[prod.id]?.[currentUser?.branch || ''] || {};
                  const sizes = prod.sizes && prod.sizes.length > 0 ? prod.sizes : ['S', 'M', 'L', 'XL'];
                  return (
                    <tr key={prod.id} className="hover:bg-neutral-50/20 transition-colors">
                      <td className="p-3">
                        <span className="font-bold text-neutral-900 block">{prod.name}</span>
                        <span className="text-[9px] text-neutral-455 uppercase font-bold tracking-wider font-mono">{prod.id}</span>
                      </td>
                      <td className="p-3">{prod.category}</td>
                      <td className="p-3 text-center">
                        <span className="font-mono font-black text-neutral-900 block">{stockCount} chiếc</span>
                        <div className="flex gap-1 justify-center mt-1.5 flex-wrap">
                          {sizes.map((sz: string) => {
                            const qty = sizeStock[sz] || 0;
                            return (
                              <span key={sz} className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${qty < 2 ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-neutral-100 text-neutral-600'}`}>
                                {sz}: {qty}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                          stockCount < 5 ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse' : 'bg-emerald-50 text-emerald-650'
                        }`}>
                          {stockCount < 5 ? 'Hết hàng / Sắp hết' : 'Đầy đủ'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
