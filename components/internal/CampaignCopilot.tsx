'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Send, CheckCircle2, Loader2, Megaphone, Trash2, ArrowRight, BarChart3 } from 'lucide-react';
import { formatPrice } from '../../lib/utils';

interface Campaign {
  id: string;
  title: string;
  description: string;
  targetTier: string;
  promoCode: string;
  subject: string;
  body: string;
  sentCount: number;
  clickThroughRate: number;
  conversionRate: number;
  revenue: number;
  createdAt: string;
  status: 'draft' | 'sending' | 'sent';
}

interface CampaignCopilotProps {
  currentUser: any;
  usersList: any[];
}

export default function CampaignCopilot({ currentUser, usersList }: CampaignCopilotProps) {
  const [prompt, setPrompt] = useState('');
  const [targetTier, setTargetTier] = useState<string>('all');
  const [promoCode, setPromoCode] = useState('NOVYNVIP15');
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [campaignHistory, setCampaignHistory] = useState<Campaign[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('novyn_marketing_campaigns');
    const hasMojibake = saved && (
      saved.includes('áº') || 
      saved.includes('á»') || 
      saved.includes('á°') || 
      saved.includes('Ã¡') || 
      saved.includes('Ãª') || 
      saved.includes('Ã­') || 
      saved.includes('Ã³') || 
      saved.includes('Ã´') || 
      saved.includes('Ãº') || 
      saved.includes('Ã½') ||
      saved.includes('chiáº¿n') ||
      saved.includes('dá»‹ch') ||
      saved.includes('Soáº¡n') ||
      saved.includes('tháº£o')
    );
    if (saved && !hasMojibake) {
      try {
        setCampaignHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Seed with beautiful campaigns
      const seeds: Campaign[] = [
        {
          id: 'camp-1',
          title: 'Chiến dịch Chào Hè Premium 2026',
          description: 'Giới thiệu Bộ sưu tập Lụa Tơ Tằm Thượng Hạng dành cho Hội viên Kim cương',
          targetTier: 'diamond',
          promoCode: 'NOVYNDIAMOND20',
          subject: 'Novyn Privé • Đặc quyền ra mắt BST Silk & Linen Hè 2026',
          body: 'Kính gửi quý khách hàng,\n\nNovyn Wear trân trọng giới thiệu dòng thiết kế tơ tằm thượng hạng Silk Couture mới nhất, chế tác thủ công độc bản dành riêng cho quý khách hàng Diamond Elite.\n\nNhận ngay ưu đãi đặc quyền 20% khi nhập mã NOVYNDIAMOND20.',
          sentCount: 12,
          clickThroughRate: 58.3,
          conversionRate: 25.0,
          revenue: 145000000,
          createdAt: '2026-05-20',
          status: 'sent',
        },
        {
          id: 'camp-2',
          title: 'Tri ân VIP Thảo Điền',
          description: 'Gửi thiệp mời Private Sale mừng sinh nhật chi nhánh Thảo Điền',
          targetTier: 'gold',
          promoCode: 'NOVYNVIPGOLD',
          subject: 'Lời mời Private Sale: Trải nghiệm thời trang & Fine Dining cùng Novyn Thảo Điền',
          body: 'Chào quý khách,\n\nMừng sinh nhật chi nhánh Thảo Điền, Novyn trân trọng kính mời quý khách tham dự buổi dạ tiệc Private Sale khép kín và nhận quà tặng đặc biệt trị giá 500,000đ khi xuất trình mã này tại quầy.',
          sentCount: 38,
          clickThroughRate: 42.1,
          conversionRate: 15.8,
          revenue: 89000000,
          createdAt: '2026-05-28',
          status: 'sent',
        }
      ];
      setCampaignHistory(seeds);
      localStorage.setItem('novyn_marketing_campaigns', JSON.stringify(seeds));
    }
  }, []);

  const saveCampaigns = (newList: Campaign[]) => {
    setCampaignHistory(newList);
    localStorage.setItem('novyn_marketing_campaigns', JSON.stringify(newList));
  };

  // Simulate AI copy generator
  const handleGenerateCopy = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const uppercasePrompt = prompt.toLowerCase();
      let subject = '';
      let body = '';

      if (uppercasePrompt.includes('hè') || uppercasePrompt.includes('summer')) {
        subject = `NOVYN Summer Palette • Bộ sưu tập Linen & Silk phóng khoáng đầy kiêu sa`;
        body = `Kính gửi quý khách,\n\nMùa hè gõ cửa cũng là lúc bản hòa ca sắc màu NOVYN Summer Palette được xướng lên. Mang tinh thần tự do, lịch lãm được dệt thủ công từ những sợi đũi, tơ tằm thanh mảnh, BST hứa hẹn sẽ đồng hành cùng quý khách trong mọi kỳ nghỉ xa hoa.\n\nĐặc quyền dành riêng cho hạng VIP, nhập ngay mã ${promoCode} để nhận chiết khấu cao cấp cùng dịch vụ giao hàng ưu tiên tận nhà.\n\nTrân trọng,\nNOVYN WEAR.`;
      } else if (uppercasePrompt.includes('vip') || uppercasePrompt.includes('tri ân') || uppercasePrompt.includes('platinum')) {
        subject = `Đặc quyền thượng lưu • Tri ân khách hàng thân thiết NOVYN Circle`;
        body = `Kính gửi quý hội viên NOVYN Circle,\n\nĐể tri ân sự đồng hành tuyệt vời của quý khách đối với triết lý thời trang tối giản của NOVYN WEAR, chúng tôi trân trọng gửi tặng riêng quý hội viên voucher quà tặng tri ân.\n\nÁp dụng mã ${promoCode} tại giỏ hàng để quy đổi ưu đãi độc quyền dành cho hội viên thân thiết.\n\nThương mến,\nNOVYN Team.`;
      } else {
        subject = `NOVYN WEAR • Bản giao hương của những đường cắt may thời thượng`;
        body = `Kính gửi quý khách,\n\nMỗi sản phẩm của NOVYN WEAR không chỉ là trang phục, mà là một tác phẩm nghệ thuật tôn vinh khí chất tĩnh lặng và sang trọng của quý khách. Chúng tôi hân hạnh gửi tới quý khách những thiết kế may đo tỉ mỉ mới nhất vừa lên kệ.\n\nSử dụng mã ưu đãi ${promoCode} để trải nghiệm phong cách quiet luxury tuyệt mỹ ngay hôm nay.\n\nTrân trọng,\nNOVYN WEAR.`;
      }

      setGeneratedSubject(subject);
      setGeneratedBody(body);
      setIsGenerating(false);
    }, 1500);
  };

  // Simulate dispatch campaign sending progress
  const handleDispatchCampaign = () => {
    if (!generatedSubject || !generatedBody) return;
    setIsSending(true);
    setSendProgress(0);

    // Calculate target customers count
    const targetCustomers = usersList.filter(u => {
      if (u.role !== 'customer') return false;
      if (targetTier === 'all') return true;
      // Calculate customer's tier based on lifetime spent
      const spend = u.totalSpent || 0;
      let tier = 'standard';
      if (spend >= 60000000) tier = 'diamond';
      else if (spend >= 30000000) tier = 'platinum';
      else if (spend >= 15000000) tier = 'gold';
      else if (spend >= 5000000) tier = 'silver';
      return tier === targetTier;
    });

    const sendCount = targetCustomers.length > 0 ? targetCustomers.length : 15; // fallback mock

    const interval = setInterval(() => {
      setSendProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Generate final metrics
          let ctr = 30 + Math.random() * 30; // 30% - 60%
          let conv = 5 + Math.random() * 15;  // 5% - 20%
          let rev = sendCount * conv * 0.01 * (350000 + Math.random() * 500000);

          const newCampaign: Campaign = {
            id: `camp-${Date.now()}`,
            title: prompt.trim() || `Chiến dịch gửi tệp ${targetTier.toUpperCase()}`,
            description: `Gửi tệp khách hàng phân hạng ${targetTier.toUpperCase()} kèm mã ${promoCode}`,
            targetTier,
            promoCode,
            subject: generatedSubject,
            body: generatedBody,
            sentCount: sendCount,
            clickThroughRate: parseFloat(ctr.toFixed(1)),
            conversionRate: parseFloat(conv.toFixed(1)),
            revenue: Math.round(rev),
            createdAt: new Date().toISOString().split('T')[0],
            status: 'sent',
          };

          saveCampaigns([newCampaign, ...campaignHistory]);
          setIsSending(false);
          setPrompt('');
          setGeneratedSubject('');
          setGeneratedBody('');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleDeleteCampaign = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa lịch sử chiến dịch này?')) {
      const filtered = campaignHistory.filter(c => c.id !== id);
      saveCampaigns(filtered);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="pb-6 border-b border-neutral-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-neutral-955 tracking-tight uppercase flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            AI Marketing Copilot & Dispatch Desk
          </h3>
          <p className="text-xs text-neutral-400 mt-1">Soạn thảo chiến dịch VIP tối giản, gửi tin đa kênh tự động và kiểm toán doanh thu chuyển đổi.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT: AI Generator Panel */}
        <div className="lg:col-span-5 bg-neutral-50 p-6 rounded-[28px] border border-neutral-150/40 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-455 block">1. Tham số chiến dịch tiếp thị</span>

            <div>
              <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">Mục tiêu & Tinh thần chiến dịch</label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Giới thiệu các thiết kế đầm tiệc linen mỏng nhẹ, sang trọng, tinh tế cho kỳ nghỉ hè..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-250 text-xs font-semibold text-neutral-800 bg-white focus:outline-none focus:border-neutral-955 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">Nhóm hội viên mục tiêu</label>
                <select
                  value={targetTier}
                  onChange={(e) => setTargetTier(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-250 text-xs font-semibold text-neutral-800 bg-white focus:outline-none"
                >
                  <option value="all">Tất cả khách hàng</option>
                  <option value="diamond">Hội viên Diamond VIP (Kim cương)</option>
                  <option value="platinum">Hội viên Platinum VIP (Bạch kim)</option>
                  <option value="gold">Hội viên Gold VIP (Vàng)</option>
                  <option value="silver">Hội viên Silver VIP (Bạc)</option>
                  <option value="standard">Hội viên Standard (Mới)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">Mã giảm giá đi kèm</label>
                <input
                  type="text"
                  placeholder="Mã giảm giá..."
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-250 text-xs font-bold text-neutral-850 bg-white focus:outline-none uppercase"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateCopy}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-850 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Trí tuệ nhân tạo đang phác thảo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Phác thảo nội dung bằng AI</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-200 text-[10px] text-neutral-400 font-semibold leading-relaxed flex items-start gap-2">
            <Megaphone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>AI sẽ phân tích đối tượng mục tiêu để tự động viết văn phong nhã nhặn, sang trọng đậm phong thái Quiet Luxury đặc trưng của Novyn.</span>
          </div>
        </div>

        {/* RIGHT: dispatch and output screen */}
        <div className="lg:col-span-7 bg-white border border-neutral-100 rounded-[28px] p-6 shadow-sm flex flex-col justify-between min-h-[400px]">
          <AnimatePresence mode="wait">
            {isSending ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-grow flex flex-col items-center justify-center text-center p-8 space-y-4"
              >
                <div className="relative w-16 h-16 flex items-center justify-center bg-amber-50 rounded-full">
                  <Loader2 className="w-8 h-8 text-amber-550 animate-spin" />
                  <Mail className="w-4 h-4 text-neutral-950 absolute" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-neutral-955 uppercase tracking-wide">Đang phát chiến dịch hàng loạt</h4>
                  <p className="text-xs text-neutral-400">Đang gửi bản tin được mã hóa tới tệp email khách hàng...</p>
                </div>
                <div className="w-full max-w-xs bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-neutral-955 h-full rounded-full transition-all duration-300" style={{ width: `${sendProgress}%` }}></div>
                </div>
                <span className="text-xs font-mono font-bold text-neutral-700">{sendProgress}% Hoàn tất</span>
              </motion.div>
            ) : generatedSubject ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex-grow flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Bản phác thảo từ AI</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[8px] font-black uppercase">Văn phong: Lịch thiệp</span>
                  </div>

                  <div className="space-y-3 bg-neutral-50/50 p-5 rounded-2xl border text-xs">
                    <div>
                      <span className="text-[8px] uppercase tracking-widest font-black text-neutral-400 block mb-1">Tiêu đề thư (Subject)</span>
                      <p className="font-bold text-neutral-900 leading-snug">{generatedSubject}</p>
                    </div>
                    <div className="pt-3 border-t border-dashed border-neutral-200">
                      <span className="text-[8px] uppercase tracking-widest font-black text-neutral-400 block mb-1">Nội dung (Body Copy)</span>
                      <p className="text-neutral-700 leading-relaxed whitespace-pre-line font-medium">{generatedBody}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 border-t pt-4">
                  <button
                    onClick={() => {
                      setGeneratedSubject('');
                      setGeneratedBody('');
                    }}
                    className="flex-1 py-3 border border-neutral-200 text-xs font-bold text-neutral-500 hover:bg-neutral-50 transition-all rounded-xl cursor-pointer"
                  >
                    Bỏ bản thảo
                  </button>
                  <button
                    onClick={handleDispatchCampaign}
                    className="flex-1 py-3 bg-neutral-950 hover:bg-neutral-850 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Bắn chiến dịch ngay</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-12 text-neutral-400">
                <div className="w-14 h-14 bg-neutral-50 rounded-full flex items-center justify-center mb-4 border border-dashed">
                  <Mail className="w-6 h-6 text-neutral-350" />
                </div>
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Hòm thử nghiệm chiến dịch</h4>
                <p className="text-[10px] text-neutral-400 max-w-xs leading-relaxed">Nhập mục tiêu tiếp thị bên cạnh và chọn "Phác thảo bằng AI" để tạo thư chiêu thị cao cấp.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Campaign logs history and audit */}
      <div className="bg-white border border-neutral-100 p-6 rounded-[28px] shadow-sm">
        <h4 className="text-xs font-black text-neutral-955 tracking-wider uppercase mb-4 flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-emerald-500" />
          Lịch sử các chiến dịch tiếp thị và Phân tích doanh số
        </h4>
        
        <div className="space-y-4">
          {campaignHistory.map((camp) => (
            <div key={camp.id} className="border border-neutral-100 rounded-2xl p-4 hover:shadow-md transition-all duration-300 bg-neutral-50/20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-neutral-900">{camp.title}</span>
                    <span className="px-2 py-0.5 text-[8px] bg-neutral-950 text-white font-extrabold uppercase rounded">
                      {camp.targetTier === 'all' ? 'TẤT CẢ' : camp.targetTier.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 text-[8px] bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded">
                      CODE: {camp.promoCode}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-450 font-semibold">{camp.description} • Gửi ngày {camp.createdAt}</p>
                </div>
                
                {/* Stats row */}
                <div className="flex gap-4 flex-wrap text-right">
                  <div className="bg-white px-3 py-1.5 rounded-lg border text-left min-w-[70px]">
                    <span className="text-[7px] text-neutral-400 font-bold block uppercase">ĐÃ GỬI</span>
                    <span className="text-xs font-black text-neutral-800">{camp.sentCount} Khách</span>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded-lg border text-left min-w-[75px]">
                    <span className="text-[7px] text-neutral-400 font-bold block uppercase">TỶ LỆ CTR</span>
                    <span className="text-xs font-black text-indigo-600">{camp.clickThroughRate}%</span>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded-lg border text-left min-w-[75px]">
                    <span className="text-[7px] text-neutral-400 font-bold block uppercase">TỶ LỆ MUA</span>
                    <span className="text-xs font-black text-emerald-600">{camp.conversionRate}%</span>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded-lg border text-left min-w-[100px]">
                    <span className="text-[7px] text-neutral-400 font-bold block uppercase">DOANH THU ĐẠT ĐƯỢC</span>
                    <span className="text-xs font-black text-neutral-955">{formatPrice(camp.revenue)}</span>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteCampaign(camp.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all self-center cursor-pointer shadow-sm border border-rose-100"
                    title="Xóa lịch sử chiến dịch"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {campaignHistory.length === 0 && (
            <p className="text-xs text-neutral-400 italic text-center py-10">Chưa có chiến dịch tiếp thị nào được gửi.</p>
          )}
        </div>
      </div>

    </div>
  );
}
