import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { Product, ColorOption } from '../../types';
import { formatPrice } from '../../lib/utils';

interface VirtualStylistSectionProps {
  outfitGender: 'male' | 'female';
  setOutfitGender: (g: 'male' | 'female') => void;
  outfitOccasion: string;
  setOutfitOccasion: (occ: string) => void;
  outfitColor: string;
  setOutfitColor: (col: string) => void;
  generatedOutfit: Product[];
  showOutfitResult: boolean;
  outfitSizes: Record<string, string>;
  setOutfitSizes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  outfitColors: Record<string, ColorOption>;
  setOutfitColors: React.Dispatch<React.SetStateAction<Record<string, ColorOption>>>;
  onGenerateOutfit: () => void;
  onApplyTemplate: (gender: 'male' | 'female', occasion: string, color: string) => void;
  onBuyOutfit: () => void;
}

export function VirtualStylistSection({
  outfitGender,
  setOutfitGender,
  outfitOccasion,
  setOutfitOccasion,
  outfitColor,
  setOutfitColor,
  generatedOutfit,
  showOutfitResult,
  outfitSizes,
  setOutfitSizes,
  outfitColors,
  setOutfitColors,
  onGenerateOutfit,
  onApplyTemplate,
  onBuyOutfit,
}: VirtualStylistSectionProps) {
  return (
    <div className="max-w-4xl mx-auto bg-[#FAF8F5] border border-brand-border rounded-3xl p-6 sm:p-8 mb-24 shadow-lg relative overflow-hidden text-brand-text">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/60 filter blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
        <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest">
          Novyn AI Fitting Lounge - Gợi ý phối đồ
        </h3>
      </div>

      {/* Quick Coordination Templates */}
      <div className="mb-8 flex flex-wrap gap-2.5 items-center justify-start border-b border-brand-border pb-6">
        <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mr-2">Bản phối gợi ý nhanh:</span>
        {[
          { name: '☕ Lịch lãm Công sở', gender: 'female', occasion: 'office', color: 'minimalist' },
          { name: '🌊 Đi biển Mộc mạc', gender: 'female', occasion: 'beach', color: 'neutral' },
          { name: '🍸 Tiệc đêm Sang trọng', gender: 'female', occasion: 'party', color: 'minimalist' },
          { name: '🛹 Dạo phố Phong cách', gender: 'male', occasion: 'streetwear', color: 'bright' },
        ].map((tpl) => (
          <button
            key={tpl.name}
            type="button"
            onClick={() => onApplyTemplate(tpl.gender as any, tpl.occasion, tpl.color)}
            className="px-3.5 py-2 rounded-xl bg-white border border-brand-border hover:bg-neutral-50 text-brand-text text-[10px] font-bold tracking-wide transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            {tpl.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pb-6 border-b border-brand-border">
        {/* Gender Select */}
        <div className="flex flex-col gap-2 text-left">
          <label className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">Giới tính</label>
          <div className="flex bg-white border border-brand-border rounded-xl p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setOutfitGender('female')}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                outfitGender === 'female' ? 'bg-brand-text text-white shadow-sm' : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              Nữ
            </button>
            <button
              type="button"
              onClick={() => setOutfitGender('male')}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                outfitGender === 'male' ? 'bg-brand-text text-white shadow-sm' : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              Nam
            </button>
          </div>
        </div>

        {/* Occasion Select */}
        <div className="flex flex-col gap-2 text-left">
          <label className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">Dịp sử dụng</label>
          <select
            value={outfitOccasion}
            onChange={(e) => setOutfitOccasion(e.target.value)}
            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2.5 text-xs text-brand-text font-semibold focus:outline-none cursor-pointer focus:border-brand-text shadow-sm"
          >
            <option value="office">Công sở / Thanh lịch</option>
            <option value="streetwear">Dạo phố / Streetwear</option>
            <option value="beach">Đi biển / Nghỉ dưỡng</option>
            <option value="party">Đi tiệc / Event</option>
          </select>
        </div>

        {/* Color Select */}
        <div className="flex flex-col gap-2 text-left">
          <label className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">Tông màu chủ đạo</label>
          <select
            value={outfitColor}
            onChange={(e) => setOutfitColor(e.target.value)}
            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2.5 text-xs text-brand-text font-semibold focus:outline-none cursor-pointer focus:border-brand-text shadow-sm"
          >
            <option value="minimalist">Tối giản (Đen / Trắng / Xám)</option>
            <option value="neutral">Trung tính (Beige / Nâu / Kem)</option>
            <option value="bright">Tươi sáng (Xanh mộc / Pastel)</option>
          </select>
        </div>
      </div>

      <div className="pt-6 flex justify-center">
        <button
          type="button"
          onClick={onGenerateOutfit}
          className="bg-brand-text hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <span>Phối đồ thông minh AI</span>
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* Result Panel */}
      <AnimatePresence>
        {showOutfitResult && generatedOutfit.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-8 border-t border-brand-border pt-8 overflow-hidden text-left"
          >
            <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-inner flex flex-col md:flex-row gap-8 items-start">
              
              {/* Left Column: Description & Summary */}
              <div className="flex-1 flex flex-col justify-between h-full min-h-[200px]">
                <div>
                  <span className="bg-[#FAF8F5] border border-brand-border px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-brand-muted w-fit block mb-4">
                    Set đồ hoàn thiện đề xuất
                  </span>
                  <h4 className="text-xl font-normal text-brand-text uppercase tracking-widest mb-3">
                    {outfitOccasion === 'office' ? 'Sophisticated Minimalist' :
                     outfitOccasion === 'streetwear' ? 'Urban Quiet Luxury' :
                     outfitOccasion === 'beach' ? 'Organic Breathable Summer' : 'Elegant Chic Party'}
                  </h4>
                  <p className="text-xs text-brand-muted leading-relaxed font-light mb-6">
                    {outfitOccasion === 'office'
                      ? 'Set đồ công sở lịch lãm pha trộn giữa chất liệu cao cấp mộc mạc và những đường cắt tinh xảo. Vừa thoải mái năng động vừa giữ vững nét chuyên nghiệp.'
                      : outfitOccasion === 'streetwear'
                      ? 'Thời trang dạo phố mang hơi thở tối giản hiện đại. Kết cấu thoải mái cùng phom dáng rủ nhẹ tạo cảm giác mặc tự do tự tại.'
                      : outfitOccasion === 'beach'
                      ? 'Hành trang nghỉ dưỡng nhẹ tênh dệt hoàn toàn từ sợi lanh tự nhiên thô mộc. Thấm hút mồ hôi cực tốt, thông thoáng mát mẻ suốt cả ngày.'
                      : 'Bản phối đi tiệc cao cấp tôn vinh phom dáng đứng măng tô dạ len wool và đầm satin bias-cut sang trọng.'}
                  </p>
                </div>

                <div className="border-t border-brand-border pt-4 mt-auto">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-brand-muted">
                      Giá trọn bộ phối đồ
                    </span>
                    <div className="text-right">
                      <span className="text-xs line-through text-brand-muted mr-2">
                        {formatPrice(generatedOutfit.reduce((acc, p) => acc + p.price, 0))}
                      </span>
                      <span className="text-lg font-normal text-brand-text">
                        {formatPrice(Math.round(generatedOutfit.reduce((acc, p) => acc + p.price, 0) * 0.9))}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onBuyOutfit}
                    className="w-full py-4 bg-brand-accent hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>Mua trọn bộ set đồ (-10%)</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Items Swatches List */}
              <div className="w-full md:w-96 flex flex-col gap-4">
                {generatedOutfit.map((product) => {
                  const selectedSize = outfitSizes[product.id] || product.sizes[0] || 'M';
                  const selectedColor = outfitColors[product.id] || product.colors[0];

                  return (
                    <div key={product.id} className="flex gap-4 p-4 border border-brand-border rounded-xl bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] transition-all">
                      <div className="relative aspect-[4/5] w-14 rounded-lg overflow-hidden bg-brand-bg border border-brand-border shrink-0">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <h5 className="text-xs font-bold uppercase text-brand-text truncate leading-tight mb-1">{product.name}</h5>
                          <span className="text-[10px] text-brand-text font-bold block">{formatPrice(product.price)}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-1.5">
                          {/* Quick Size selection */}
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-bold text-brand-muted uppercase">Size:</span>
                            <select
                              value={selectedSize}
                              onChange={(e) => setOutfitSizes(prev => ({ ...prev, [product.id]: e.target.value }))}
                              className="bg-transparent border-0 text-[9px] font-bold text-brand-text p-0 focus:outline-none uppercase cursor-pointer"
                            >
                              {product.sizes.map((sz) => (
                                <option key={sz} value={sz} className="bg-white text-brand-text">{sz}</option>
                              ))}
                            </select>
                          </div>

                          {/* Quick Color selection */}
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-bold text-brand-muted uppercase">Màu:</span>
                            <select
                              value={selectedColor?.name}
                              onChange={(e) => {
                                const col = product.colors.find(c => c.name === e.target.value);
                                if (col) setOutfitColors(prev => ({ ...prev, [product.id]: col }));
                              }}
                              className="bg-transparent border-0 text-[9px] font-bold text-brand-text p-0 focus:outline-none lowercase cursor-pointer"
                            >
                              {product.colors.map((c) => (
                                <option key={c.name} value={c.name} className="bg-white text-brand-text">{c.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
