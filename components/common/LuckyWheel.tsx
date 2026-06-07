'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles, AlertCircle, ShoppingBag, Check, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { usePathname } from 'next/navigation';

interface WheelOption {
  code: string;
  label: string;
  type: 'percent' | 'fixed' | 'message';
  value: number;
  description: string;
  color: string;
  textColor: string;
}

export const LuckyWheel: React.FC = () => {
  const pathname = usePathname();
  const { addDynamicPromoCode, applyPromoCode, appliedPromo } = useCart();
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<WheelOption | null>(null);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const wheelOptions: WheelOption[] = [
    { code: 'SALE15', label: 'GIẢM 15%', type: 'percent', value: 15, description: 'Giảm 15% tổng hóa đơn mua hàng', color: '#FDFBF7', textColor: '#1C1917' }, // Cream
    { code: 'LUCKYSHIP', label: 'FREESHIP', type: 'fixed', value: 30000, description: 'Miễn phí vận chuyển toàn quốc (trị giá 30K)', color: '#1C1917', textColor: '#FFFFFF' }, // Charcoal
    { code: 'NOVYN50K', label: 'GIẢM 50K', type: 'fixed', value: 50000, description: 'Giảm 50.000 ₫ cho hóa đơn bất kỳ', color: '#E7E5E4', textColor: '#1C1917' }, // Stone
    { code: 'SALE20', label: 'JACKPOT 20%', type: 'percent', value: 20, description: 'Ưu đãi Độc quyền cực khủng - Giảm 20% hóa đơn', color: '#D97706', textColor: '#FFFFFF' }, // Gold
    { code: 'SALE12', label: 'GIẢM 12%', type: 'percent', value: 12, description: 'Giảm 12% tổng hóa đơn mua hàng', color: '#F5F5F4', textColor: '#1C1917' }, // Light stone
    { code: 'LUCKYSHIP2', label: 'FREESHIP', type: 'fixed', value: 30000, description: 'Miễn phí vận chuyển toàn quốc (trị giá 30K)', color: '#292524', textColor: '#FFFFFF' }, // Dark charcoal
  ];

  // Load spin history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const spun = localStorage.getItem('novyn_lucky_spun');
      if (spun) {
        // For demo purposes, we let them spin if they refresh, but in production we persist
        // We can allow bypass for demo
      }
    }
  }, []);

  if (pathname?.startsWith('/internal')) {
    return null;
  }

  const handleSpin = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    
    // Choose a random winning option (Jackpot 20% has slightly lower probability, but we do random for demo)
    const prizeIndex = Math.floor(Math.random() * wheelOptions.length);
    const selectedPrize = wheelOptions[prizeIndex];

    // Each option occupies 360 / 6 = 60 degrees.
    // Calculate final rotation angle: multiple full spins (e.g. 5 full rounds = 1800 deg) + offset for the selected option.
    // needle is at top (0 deg). Offset for index is: 360 - (index * 60) - 30 (middle of segment)
    const segmentAngle = 360 / wheelOptions.length;
    const offset = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2);
    const totalRotation = 1800 + offset; // Spin 5 times before stopping

    setRotation(totalRotation);
    setPrize(selectedPrize);

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      setShowPrizeModal(true);
      localStorage.setItem('novyn_lucky_spun', 'true');
      showToast(`Chúc mừng! Bạn đã quay trúng mã ưu đãi ${selectedPrize.code}!`, 'success');
    }, 4000); // 4 seconds spin animation length
  };

  const handleApplyPromo = () => {
    if (!prize) return;
    addDynamicPromoCode(prize.code, prize.type as any, prize.value, prize.description);
    
    setTimeout(() => {
      applyPromoCode(prize.code);
      setHasApplied(true);
      showToast(`Đã tự động kích hoạt mã ${prize.code} vào giỏ hàng của bạn!`, 'success');
    }, 100);
  };

  return (
    <>
      {/* 1. FLOATING ACTION BUTTON */}
      <div className="fixed bottom-6 left-4 sm:left-6 z-[45] flex items-center justify-start">
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-amber-500/20"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 2.0,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        <motion.button
          onClick={() => setIsOpen(true)}
          className="relative z-10 bg-neutral-950 text-white px-4 py-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:bg-neutral-850 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-neutral-800"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Vòng quay may mắn"
        >
          <Gift className="w-5 h-5 text-amber-400 animate-bounce" />
          <span className="hidden md:inline text-xs font-black tracking-widest uppercase pr-1">
            Quà Tặng Hè 🎁
          </span>
        </motion.button>
      </div>

      {/* 2. SPIN WHEEL MODAL */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[36px] max-w-md w-full p-6 md:p-8 shadow-2xl relative overflow-hidden border border-neutral-100 flex flex-col items-center text-center"
            >
              
              {/* Close Button */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 rounded-full transition-colors cursor-pointer"
                disabled={isSpinning}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title */}
              <div className="mb-6 flex flex-col items-center">
                <div className="bg-amber-500/10 text-amber-600 px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/20 mb-3 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500 animate-spin" />
                  <span>Chương trình tri ân mùa hè 2026</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-neutral-950 uppercase tracking-tight">Vòng Quay May Mắn</h3>
                <p className="text-xs text-neutral-450 mt-1 max-w-[260px]">Quay bánh xe để nhận các mã giảm giá và quà tặng ngẫu nhiên cực khủng từ Novyn Wear.</p>
              </div>

              {/* WHEEL CANVAS DRAWING */}
              <div className="relative w-64 h-64 md:w-72 md:h-72 mb-8 flex items-center justify-center shrink-0">
                
                {/* Pointer Needle */}
                <div className="absolute top-0 z-40 -mt-2.5">
                  <div className="w-5 h-6 bg-amber-500 rounded-b-full shadow-lg relative flex items-center justify-center">
                    <div className="absolute top-0 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px] border-b-amber-500 -mt-2" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>

                {/* Spinning Wheel */}
                <motion.div
                  style={{ transform: `rotate(${rotation}deg)` }}
                  animate={isSpinning ? undefined : { transform: `rotate(${rotation}deg)` }}
                  transition={isSpinning ? undefined : { type: 'spring', damping: 25, stiffness: 40 }}
                  className="w-full h-full rounded-full border-[8px] border-neutral-950 shadow-2xl relative overflow-hidden flex items-center justify-center select-none"
                  id="novyn-spin-wheel"
                >
                  {/* SVG segments */}
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {wheelOptions.map((opt, i) => {
                      const angle = 360 / wheelOptions.length;
                      const startAngle = i * angle;
                      const endAngle = (i + 1) * angle;

                      // Convert polar to cartesian coordinates
                      const rad = (deg: number) => (deg * Math.PI) / 180;
                      const x1 = 50 + 50 * Math.cos(rad(startAngle));
                      const y1 = 50 + 50 * Math.sin(rad(startAngle));
                      const x2 = 50 + 50 * Math.cos(rad(endAngle));
                      const y2 = 50 + 50 * Math.sin(rad(endAngle));

                      const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                      return (
                        <path
                          key={opt.code}
                          d={pathData}
                          fill={opt.color}
                          stroke="#1C1917"
                          strokeWidth="0.3"
                        />
                      );
                    })}
                  </svg>

                  {/* Texts positioned inside segments */}
                  {wheelOptions.map((opt, i) => {
                    const angle = 360 / wheelOptions.length;
                    const rotate = i * angle + angle / 2;
                    return (
                      <div
                        key={opt.code}
                        className="absolute h-1/2 origin-bottom bottom-1/2 flex items-center justify-center pb-12 text-[9px] md:text-[10px] font-black tracking-wider text-center"
                        style={{
                          transform: `rotate(${rotate}deg)`,
                          color: opt.textColor,
                        }}
                      >
                        <span className="transform rotate-90 block">{opt.label}</span>
                      </div>
                    );
                  })}

                  {/* Center pin button */}
                  <div className="absolute w-12 h-12 rounded-full bg-neutral-950 border-4 border-amber-500 shadow-md flex items-center justify-center z-20">
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping absolute" />
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  </div>

                </motion.div>

              </div>

              {/* SPIN BUTTON */}
              <button
                onClick={handleSpin}
                disabled={isSpinning || hasSpun}
                className={`w-full py-4.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-98 flex items-center justify-center gap-2 ${
                  isSpinning
                    ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 shadow-inner'
                    : hasSpun
                    ? 'bg-emerald-500 text-white shadow-emerald-500/10 cursor-not-allowed'
                    : 'bg-neutral-950 hover:bg-neutral-850 text-white shadow-neutral-950/20'
                }`}
              >
                {isSpinning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                    <span>Đang xoay bánh xe...</span>
                  </>
                ) : hasSpun ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã nhận giải thưởng</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Quay ngay trúng lớn</span>
                  </>
                )}
              </button>

              {/* Reset shortcut (strictly for demo and testing convenience) */}
              {hasSpun && (
                <button
                  onClick={() => {
                    setHasSpun(false);
                    setRotation(0);
                    setPrize(null);
                    setHasApplied(false);
                  }}
                  className="mt-3 text-[9px] font-black text-neutral-400 uppercase tracking-wider hover:text-neutral-600 transition-colors"
                >
                  [ Bỏ chặn để quay lại (Demo Bypass) ]
                </button>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. PRIZE NOTIFICATION MODAL */}
      <AnimatePresence>
        {showPrizeModal && prize && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-neutral-950 text-white rounded-[40px] max-w-sm w-full p-8 shadow-2xl relative overflow-hidden border border-neutral-850 flex flex-col items-center text-center"
            >
              
              {/* Confetti Simulated Floating Orbs */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-[10%] left-[20%] w-12 h-12 rounded-full bg-amber-500 filter blur-xl animate-anti-gravity-2" />
                <div className="absolute bottom-[20%] right-[10%] w-16 h-16 rounded-full bg-rose-500 filter blur-xl animate-anti-gravity-1" />
                <div className="absolute top-[40%] right-[30%] w-10 h-10 rounded-full bg-sky-500 filter blur-xl animate-anti-gravity-3" />
              </div>

              <div className="relative z-10 flex flex-col items-center">
                
                {/* Crown/Trophy Icon */}
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mb-6 animate-pulse">
                  <Sparkles className="w-8 h-8 text-amber-400 fill-amber-400/10" />
                </div>

                <span className="text-[10px] font-black uppercase tracking-widest text-amber-440 mb-2 block font-mono">Chúc mừng chiến thắng!</span>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2 leading-none">Bản trúng thưởng</h3>
                <p className="text-xs text-neutral-400 mb-6 max-w-[240px]">Bạn nhận được mã ưu đãi đặc biệt có giới hạn thời gian.</p>

                {/* Big Coupon Card UI */}
                <div className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-5 mb-8 relative flex flex-col items-center shadow-inner">
                  {/* Decorative notch left */}
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-neutral-950 rounded-full border-r border-neutral-800" />
                  {/* Decorative notch right */}
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-neutral-950 rounded-full border-l border-neutral-800" />

                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Mã Coupon ưu đãi:</span>
                  <div className="text-2xl font-black tracking-widest text-white font-mono bg-neutral-950 border border-neutral-800 px-5 py-2.5 rounded-2xl select-all">{prize.code}</div>
                  
                  <span className="h-px w-full bg-neutral-800 my-4 block" />
                  <p className="text-[11px] font-bold text-amber-300 leading-normal">{prize.description}</p>
                </div>

                {/* Apply button */}
                <button
                  onClick={() => {
                    handleApplyPromo();
                    setShowPrizeModal(false);
                  }}
                  disabled={hasApplied}
                  className={`w-full py-4.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    hasApplied
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : 'bg-white hover:bg-neutral-100 text-neutral-950 shadow-lg shadow-white/5 active:scale-98'
                  }`}
                >
                  {hasApplied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Đã áp dụng mã giảm giá</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Áp dụng vào giỏ hàng ngay</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowPrizeModal(false)}
                  className="mt-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
                >
                  Để sau
                </button>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
