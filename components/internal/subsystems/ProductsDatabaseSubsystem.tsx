'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Box, Plus, Search, Edit2, CheckCircle2, PlusCircle, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface ProductsDatabaseSubsystemProps {
  currentUser: any;
  productsList: any[];
  addGlobalProduct?: (
    name: string,
    category: string,
    price: number,
    description: string,
    images: string[],
    colors: any[],
    sizes: string[],
    stock: number
  ) => void;
  updateGlobalProductDetails?: (
    id: string,
    name: string,
    description: string,
    category: string,
    price: number,
    colors: any[],
    sizes: string[],
    images: string[],
    isActive?: boolean
  ) => void;
  deleteGlobalProduct?: (id: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const categoryLabel: Record<string, string> = {
  Tops: 'Áo thiết kế',
  Bottoms: 'Quần & Chân váy',
  Dresses: 'Đầm thanh lịch',
  Outerwear: 'Áo khoác blazer',
};

export const ProductsDatabaseSubsystem: React.FC<ProductsDatabaseSubsystemProps> = ({
  currentUser,
  productsList,
  addGlobalProduct,
  updateGlobalProductDetails,
  deleteGlobalProduct,
  showToast,
}) => {
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [dbCategoryFilter, setDbCategoryFilter] = useState('all');
  const [activeRowDropdown, setActiveRowDropdown] = useState<string | null>(null);

  // Modal states
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [dbModalMode, setDbModalMode] = useState<'create' | 'edit'>('create');
  const [dbSelectedProductId, setDbSelectedProductId] = useState('');
  const [dbProductName, setDbProductName] = useState('');
  const [dbProductCategory, setDbProductCategory] = useState('Tops');
  const [dbProductPrice, setDbProductPrice] = useState(0);
  const [dbProductDescription, setDbProductDescription] = useState('');
  const [dbProductImages, setDbProductImages] = useState('');
  const [dbProductColors, setDbProductColors] = useState('');
  const [dbProductSizes, setDbProductSizes] = useState<string[]>(['S', 'M', 'L']);
  const [dbProductInitialStock, setDbProductInitialStock] = useState(20);
  const [dbProductIsActive, setDbProductIsActive] = useState(true);

  const openCreateModal = () => {
    setDbModalMode('create');
    setDbProductName('');
    setDbProductCategory('Tops');
    setDbProductPrice(0);
    setDbProductDescription('');
    setDbProductImages('');
    setDbProductColors('');
    setDbProductSizes(['S', 'M', 'L']);
    setDbProductInitialStock(20);
    setDbProductIsActive(true);
    setDbModalOpen(true);
  };

  const openEditModal = (prod: any) => {
    setDbSelectedProductId(prod.id);
    setDbProductName(prod.name);
    setDbProductCategory(prod.category);
    setDbProductPrice(prod.price);
    setDbProductDescription(prod.description || '');
    setDbProductImages(prod.images ? prod.images.join(', ') : '');
    setDbProductColors(
      prod.colors ? prod.colors.map((c: any) => `${c.name}|${c.hex}`).join(', ') : ''
    );
    setDbProductSizes(prod.sizes || []);
    setDbProductIsActive(prod.isActive !== false);
    setDbModalMode('edit');
    setDbModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const colorArray = dbProductColors
      .split(',')
      .map((c) => {
        const parts = c.trim().split('|');
        return {
          name: parts[0] || 'Default',
          hex: parts[1] || '#999999',
        };
      })
      .filter((c) => c.name);

    const imageArray = dbProductImages
      .split(',')
      .map((img) => img.trim())
      .filter(Boolean);
    if (imageArray.length === 0) {
      imageArray.push('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400');
    }

    if (dbModalMode === 'create') {
      if (addGlobalProduct) {
        addGlobalProduct(
          dbProductName,
          dbProductCategory,
          dbProductPrice,
          dbProductDescription,
          imageArray,
          colorArray,
          dbProductSizes,
          dbProductInitialStock
        );
        showToast('✓ Đã thêm sản phẩm mới thành công!', 'success');
      }
    } else {
      if (updateGlobalProductDetails) {
        updateGlobalProductDetails(
          dbSelectedProductId,
          dbProductName,
          dbProductDescription,
          dbProductCategory,
          dbProductPrice,
          colorArray,
          dbProductSizes,
          imageArray,
          dbProductIsActive
        );
        showToast('✓ Đã cập nhật thông tin sản phẩm!', 'success');
      }
    }
    setDbModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight flex items-center gap-2">
            <Box className="w-5 h-5 text-neutral-800" />
            Cơ sở dữ liệu sản phẩm NOVYN.WEAR
          </h3>
          <p className="text-xs text-neutral-450 mt-1">
            Xem danh sách sản phẩm hệ thống, điều chỉnh thông tin, ẩn/hiện, sửa hoặc xóa sản phẩm.
          </p>
        </div>

        {currentUser.role === 'director' && (
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" /> Thêm sản phẩm mới
          </button>
        )}
      </div>

      {/* Table Toolbar Search and Filter */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Tìm sản phẩm theo tên hoặc mã SKU..."
            value={dbSearchQuery}
            onChange={(e) => setDbSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:border-neutral-900 text-neutral-800"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto select-none no-scrollbar">
          {[
            { id: 'all', name: 'Tất cả danh mục' },
            { id: 'Tops', name: 'Áo' },
            { id: 'Bottoms', name: 'Quần' },
            { id: 'Dresses', name: 'Đầm' },
            { id: 'Outerwear', name: 'Áo khoác' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setDbCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all border cursor-pointer active:scale-95 ${
                dbCategoryFilter === cat.id
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                  : 'bg-white hover:bg-neutral-50 text-neutral-500 border-neutral-200 hover:text-neutral-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                <th className="p-3">Ảnh</th>
                <th className="p-3">Tên sản phẩm / SKU</th>
                <th className="p-3">Danh mục</th>
                <th className="p-3 text-right">Giá bán</th>
                <th className="p-3 text-center">Tồn kho</th>
                <th className="p-3">Màu sắc</th>
                <th className="p-3">Kích cỡ</th>
                <th className="p-3 text-center">Trạng thái</th>
                {currentUser.role === 'director' && <th className="p-3 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
              {(() => {
                const filtered = productsList
                  .filter(
                    (prod) =>
                      prod.name.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
                      prod.id.toLowerCase().includes(dbSearchQuery.toLowerCase())
                  )
                  .filter((prod) => dbCategoryFilter === 'all' || prod.category === dbCategoryFilter);

                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td
                        colSpan={currentUser.role === 'director' ? 9 : 8}
                        className="p-8 text-center text-neutral-400 italic font-normal bg-neutral-50/10"
                      >
                        Không tìm thấy sản phẩm nào khớp với điều kiện lọc.
                      </td>
                    </tr>
                  );
                }

                return filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-neutral-50/20 transition-colors">
                    <td className="p-3">
                      <div className="relative w-10 h-12 rounded-lg overflow-hidden border">
                        <Image
                          src={
                            prod.images && prod.images[0]
                              ? prod.images[0]
                              : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100'
                          }
                          alt={prod.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-neutral-900 block">{prod.name}</span>
                      <span className="text-[9px] text-neutral-400 font-mono font-bold">{prod.id}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-neutral-100 font-bold text-neutral-600">
                        {categoryLabel[prod.category] || prod.category}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-neutral-900">
                      {formatPrice(prod.price)}
                    </td>
                    <td className="p-3 text-center font-mono">
                      <span
                        className={`font-bold ${
                          prod.stock < 5 ? 'text-rose-600 animate-pulse' : 'text-neutral-500'
                        }`}
                      >
                        {prod.stock} chiếc
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        {prod.colors?.map((col: any, ci: number) => (
                          <span
                            key={ci}
                            className="w-3 h-3 rounded-full border border-neutral-300 inline-block shadow-sm"
                            style={{ backgroundColor: col.hex }}
                            title={col.name}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {prod.sizes?.map((sz: string, si: number) => (
                          <span key={si} className="text-[8px] font-black border px-1 rounded text-neutral-500">
                            {sz}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                          prod.isActive !== false
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-neutral-100 text-neutral-400 border'
                        }`}
                      >
                        {prod.isActive !== false ? 'Đang bán' : 'Ngừng bán'}
                      </span>
                    </td>
                    {currentUser.role === 'director' && (
                      <td className="p-3 text-center relative">
                        <div className="inline-block text-left">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveRowDropdown(activeRowDropdown === prod.id ? null : prod.id)
                            }
                            className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer active:scale-95"
                          >
                            <span className="font-bold text-sm leading-none block px-1">•••</span>
                          </button>

                          {activeRowDropdown === prod.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setActiveRowDropdown(null)}
                              />
                              <div className="absolute right-0 mt-1 w-40 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 p-1.5 text-xs text-left">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveRowDropdown(null);
                                    openEditModal(prod);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 text-neutral-800 font-semibold flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-neutral-500" /> Sửa thông tin
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveRowDropdown(null);
                                    if (updateGlobalProductDetails) {
                                      const newActive = prod.isActive === false;
                                      updateGlobalProductDetails(
                                        prod.id,
                                        prod.name,
                                        prod.description || '',
                                        prod.category,
                                        prod.price,
                                        prod.colors,
                                        prod.sizes,
                                        prod.images,
                                        newActive
                                      );
                                    }
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 text-neutral-800 font-semibold flex items-center gap-1.5 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-500" />{' '}
                                  {prod.isActive !== false ? 'Ngừng bán' : 'Cho phép bán'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveRowDropdown(null);
                                    if (addGlobalProduct) {
                                      addGlobalProduct(
                                        `${prod.name} (Bản sao)`,
                                        prod.category,
                                        prod.price,
                                        prod.description || '',
                                        prod.images || [],
                                        prod.colors || [],
                                        prod.sizes || [],
                                        20
                                      );
                                    }
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 text-neutral-800 font-semibold flex items-center gap-1.5 cursor-pointer"
                                >
                                  <PlusCircle className="w-3.5 h-3.5 text-neutral-500" /> Nhân bản
                                </button>

                                <div className="border-t border-neutral-100 my-1" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveRowDropdown(null);
                                    if (deleteGlobalProduct) {
                                      if (
                                        confirm(
                                          `Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm "${prod.name}" khỏi hệ thống?`
                                        )
                                      ) {
                                        deleteGlobalProduct(prod.id);
                                        showToast(`✓ Đã xóa vĩnh viễn sản phẩm ${prod.name}!`, 'info');
                                      }
                                    }
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 font-semibold flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Xóa vĩnh viễn
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {dbModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border max-w-lg w-full rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setDbModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center cursor-pointer font-bold text-neutral-600"
            >
              ×
            </button>

            <h3 className="text-sm font-black text-neutral-950 tracking-widest uppercase mb-4">
              {dbModalMode === 'create' ? 'Thêm sản phẩm mới' : 'Cập nhật sản phẩm'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[9px] font-bold text-neutral-450 block mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={dbProductName}
                  onChange={(e) => setDbProductName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white focus:outline-none font-semibold text-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-neutral-450 block mb-1">Danh mục *</label>
                  <select
                    value={dbProductCategory}
                    onChange={(e) => setDbProductCategory(e.target.value)}
                    className="w-full px-3 py-2 border bg-white rounded-xl font-bold text-neutral-800 focus:outline-none"
                  >
                    <option value="Tops">Tops (Áo)</option>
                    <option value="Bottoms">Bottoms (Quần)</option>
                    <option value="Dresses">Dresses (Đầm)</option>
                    <option value="Outerwear">Outerwear (Áo khoác)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-neutral-450 block mb-1">Giá bán lẻ (₫) *</label>
                  <input
                    type="number"
                    required
                    value={dbProductPrice || ''}
                    onChange={(e) => setDbProductPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-white focus:outline-none font-bold text-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-450 block mb-1">
                  Ảnh (Link Unsplash cách nhau bởi dấu phẩy) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="URL 1, URL 2..."
                  value={dbProductImages}
                  onChange={(e) => setDbProductImages(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-neutral-450 block mb-1">
                    Màu sắc (Tên|Hex, Tên|Hex) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Trắng|#FFFFFF, Đen|#111827"
                    value={dbProductColors}
                    onChange={(e) => setDbProductColors(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white focus:outline-none font-semibold text-neutral-700"
                  />
                </div>
                {dbModalMode === 'create' ? (
                  <div>
                    <label className="text-[9px] font-bold text-neutral-450 block mb-1">
                      Tồn kho ban đầu *
                    </label>
                    <input
                      type="number"
                      required
                      value={dbProductInitialStock}
                      onChange={(e) => setDbProductInitialStock(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-xl bg-white focus:outline-none font-bold text-neutral-800"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col justify-end pb-2">
                    <label className="flex items-center gap-2 font-bold text-neutral-850 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dbProductIsActive}
                        onChange={(e) => setDbProductIsActive(e.target.checked)}
                        className="rounded"
                      />
                      Sản phẩm đang mở bán
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-450 block mb-2">
                  Các kích cỡ hỗ trợ (Sizes) *
                </label>
                <div className="flex gap-4">
                  {['S', 'M', 'L', 'XL', 'F'].map((size) => (
                    <label
                      key={size}
                      className="flex items-center gap-1.5 text-xs font-black text-neutral-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={dbProductSizes.includes(size)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDbProductSizes((prev) => [...prev, size]);
                          } else {
                            setDbProductSizes((prev) => prev.filter((s) => s !== size));
                          }
                        }}
                        className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-450 block mb-1">Mô tả sản phẩm *</label>
                <textarea
                  required
                  value={dbProductDescription}
                  onChange={(e) => setDbProductDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white focus:outline-none font-semibold text-neutral-800"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-850 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                {dbModalMode === 'create' ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
