'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Sparkles, Sliders, Box, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ProductDesignerProps {
  addGlobalProduct: (
    name: string,
    category: string,
    price: number,
    description: string,
    images: string[],
    colors: { name: string; hex: string }[],
    sizes: string[],
    initialStock?: number
  ) => void;
}

const SHIRT_COLORS = [
  { name: 'Elegant Cream', hex: '#F9F6F0' },
  { name: 'Charcoal Matte', hex: '#262626' },
  { name: 'Tuscan Amber', hex: '#D97706' },
  { name: 'Olive Green', hex: '#3F4E4F' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Vintage Brown', hex: '#4A3E3D' },
];

const FONTS = [
  { id: 'serif', name: 'Playfair Display (Elegant Serif)', css: 'font-serif' },
  { id: 'sans', name: 'Inter Mono (Modern Minimal)', css: 'font-mono tracking-widest uppercase' },
  { id: 'classic', name: 'Italian Renaissance (Calligraphy)', css: 'italic tracking-wide font-serif' },
];

export default function ProductDesigner({ addGlobalProduct }: ProductDesignerProps) {
  const [selectedColor, setSelectedColor] = useState(SHIRT_COLORS[0]);
  const [customText, setCustomText] = useState('NOVYN WEAR');
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [textScale, setTextScale] = useState(100);
  const [textY, setTextY] = useState(0);
  const [textX, setTextX] = useState(0);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState(450000);
  const [productCat, setProductCat] = useState('clothing');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handlePublishProduct = () => {
    if (!productName.trim()) {
      alert('Vui lòng nhập tên dòng sản phẩm tùy chỉnh!');
      return;
    }
    if (productPrice <= 0) {
      alert('Vui lòng nhập giá trị lớn hơn 0!');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Create a gorgeous description
      const desc = `Dòng sản phẩm thêu/in chữ độc quyền nghệ thuật "${customText}" được thiết kế riêng trực tiếp từ Novyn Wear. Sử dụng chất liệu vải tự nhiên organic cao cấp, mang lại phom dáng cực đẹp chuẩn Quiet Luxury.\n\n• Màu sắc thiết kế: ${selectedColor.name}\n• Kiểu chữ thêu: ${selectedFont.name}\n• Vải thun dệt kim mềm mịn, siêu thấm hút và thoáng mát.`;
      
      // Let's use a beautiful placeholder image of a modern minimal styled shirt card, representing our mockup!
      const mockImage = '/images/products/tee-cream.jpg'; // fallback image path

      addGlobalProduct(
        productName.trim(),
        productCat,
        productPrice,
        desc,
        [mockImage], // image source
        [{ name: selectedColor.name, hex: selectedColor.hex }],
        ['S', 'M', 'L', 'XL'],
        100 // initial stock
      );

      showToast(`Đã xuất xưởng và đăng bán thành công sản phẩm "${productName}" trên Storefront!`, 'success');
      
      // Reset form
      setProductName('');
      setCustomText('NOVYN WEAR');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="pb-6 border-b border-neutral-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-neutral-955 tracking-tight uppercase flex items-center gap-2">
            <Palette className="w-5 h-5 text-neutral-900" />
            Product Custom Designer Studio
          </h3>
          <p className="text-xs text-neutral-400 mt-1">Xưởng thiết kế sản phẩm in thêu cao cấp. Thiết kế và đăng bán trực tiếp trên Storefront chỉ trong vài phút.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT: Live Interactive Preview */}
        <div className="lg:col-span-6 bg-neutral-100/50 rounded-[32px] border border-neutral-200/50 p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
          <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest text-neutral-400 bg-white/80 px-3 py-1 rounded-full border">Mockup Canvas Giả Lập 2D</span>

          {/* Simulated T-shirt Canvas box */}
          <div 
            className="w-72 h-80 rounded-3xl relative shadow-lg flex flex-col items-center justify-center transition-all duration-500 overflow-hidden"
            style={{ backgroundColor: selectedColor.hex, border: selectedColor.hex === '#FFFFFF' ? '1px solid #E5E5E5' : 'none' }}
          >
            {/* T-shirt outline mockup shadow details */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
            
            {/* Simulated Crewneck collar shape */}
            <div className="absolute top-0 w-24 h-6 bg-black/10 rounded-b-full border-t border-black/5" />
            
            {/* Design Text Box with slider values */}
            <motion.div
              style={{
                y: textY,
                x: textX,
                scale: textScale / 100,
              }}
              className={`text-center select-none cursor-grab active:cursor-grabbing font-bold ${selectedFont.css}`}
            >
              <span 
                style={{ 
                  color: selectedColor.hex === '#262626' || selectedColor.hex === '#3F4E4F' || selectedColor.hex === '#4A3E3D' ? '#FFFFFF' : '#171717',
                  textShadow: selectedColor.hex === '#FFFFFF' ? 'none' : '0 1px 2px rgba(0,0,0,0.1)'
                }}
                className="text-lg font-bold block max-w-[200px] break-words uppercase"
              >
                {customText || 'NOVYN'}
              </span>
            </motion.div>

            {/* Simulated stitching / sewing lines at sleeves and hem */}
            <div className="absolute bottom-3 left-6 right-6 border-b border-dashed border-black/10" />
          </div>

          <div className="mt-4 text-center">
            <span className="text-[10px] text-neutral-400 font-bold block">Tone màu: <span className="text-neutral-700 font-black">{selectedColor.name}</span></span>
          </div>
        </div>

        {/* RIGHT: Controls & Registration */}
        <div className="lg:col-span-6 bg-white border border-neutral-100 rounded-[32px] p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-450 block">1. Cấu hình họa tiết in thêu</span>

            {/* Custom text */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">Họa tiết chữ / Logo in</label>
              <input
                type="text"
                maxLength={25}
                placeholder="Gõ chữ thêu lên áo..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-250 text-xs font-bold text-neutral-850 focus:outline-none focus:border-neutral-950 uppercase"
              />
            </div>

            {/* T-Shirt Canvas color selection */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-2">Chọn màu sắc áo canvas</label>
              <div className="flex flex-wrap gap-2.5">
                {SHIRT_COLORS.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColor(col)}
                    className={`w-7 h-7 rounded-full transition-all flex items-center justify-center cursor-pointer border shadow-sm relative ${
                      selectedColor.name === col.name ? 'ring-2 ring-neutral-950 scale-110' : 'hover:scale-105 border-neutral-200'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {selectedColor.name === col.name && (
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col.hex === '#FFFFFF' ? '#000000' : '#FFFFFF' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Font family selection */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">Chọn phông chữ thêu</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {FONTS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFont(f)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all text-center cursor-pointer ${
                      selectedFont.id === f.id
                        ? 'bg-neutral-950 border-neutral-950 text-white shadow-sm'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {f.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders for scale and alignment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-[8px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Cỡ chữ ({textScale}%)</label>
                <input
                  type="range"
                  min={50}
                  max={150}
                  value={textScale}
                  onChange={(e) => setTextScale(Number(e.target.value))}
                  className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-950"
                />
              </div>

              <div>
                <label className="text-[8px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Trục dọc Y ({textY}px)</label>
                <input
                  type="range"
                  min={-80}
                  max={80}
                  value={textY}
                  onChange={(e) => setTextY(Number(e.target.value))}
                  className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-950"
                />
              </div>

              <div>
                <label className="text-[8px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Trục ngang X ({textX}px)</label>
                <input
                  type="range"
                  min={-60}
                  max={60}
                  value={textX}
                  onChange={(e) => setTextX(Number(e.target.value))}
                  className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-950"
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-450 block">2. Đăng bán sản phẩm</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">Tên sản phẩm thương mại</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Tee NOVYN Embroidery..."
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:border-neutral-950"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">Giá bán niêm yết (VND)</label>
                  <input
                    type="number"
                    required
                    value={productPrice || ''}
                    onChange={(e) => setProductPrice(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-xl text-xs font-black focus:outline-none focus:border-neutral-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">Nhóm danh mục</label>
                  <select
                    value={productCat}
                    onChange={(e) => setProductCat(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border bg-white text-xs font-semibold text-neutral-800"
                  >
                    <option value="clothing">Áo thun & Quần áo</option>
                    <option value="bags">Túi xách cao cấp</option>
                    <option value="accessories">Phụ kiện & Mắt kính</option>
                  </select>
                </div>
                
                <div className="flex flex-col justify-end">
                  <button
                    onClick={handlePublishProduct}
                    disabled={isSubmitting || !productName.trim()}
                    className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-850 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>✓ Xuất xưởng & Đăng bán</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
