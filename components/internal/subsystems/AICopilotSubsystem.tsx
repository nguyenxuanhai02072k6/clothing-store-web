'use client';

import React, { useState } from 'react';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export interface AICopilotSubsystemProps {
  showToast: (msg: string, type?: any) => void;
}

export default function AICopilotSubsystem({ showToast }: AICopilotSubsystemProps) {
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSEOProductAttributes, setAiSEOProductAttributes] = useState({
    material: 'Linen tự nhiên',
    fit: 'Oversized',
    color: 'Màu Cát Tĩnh Lặng',
    season: 'Summer 2026'
  });
  const [aiSelectedChannel, setAiSelectedChannel] = useState<'facebook' | 'tiktok' | 'instagram'>('facebook');
  const [aiSelectedTone, setAiSelectedTone] = useState<'trendy' | 'elegant' | 'minimalist'>('trendy');
  const [aiGeneratedSEODesc, setAiGeneratedSEODesc] = useState('');
  const [aiGeneratedCaption, setAiGeneratedCaption] = useState('');
  const [aiCannedReplyOutput, setAiCannedReplyOutput] = useState('');
  const [aiGeneratedTitleTags, setAiGeneratedTitleTags] = useState('');
  const [aiGeneratedMeta, setAiGeneratedMeta] = useState('');
  const [aiGeneratedBlog, setAiGeneratedBlog] = useState('');
  const [aiGeneratedBrief, setAiGeneratedBrief] = useState('');

  const handleGenerateSEODesc = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const generated = `✦ CHI TIẾT SẢN PHẨM PHONG CÁCH QUIET LUXURY ✦\n\nMẫu thiết kế thời thượng chế tác từ sợi **${aiSEOProductAttributes.material}** tuyển chọn mộc mạc thoáng mát tuyệt đối. Phom dáng **${aiSEOProductAttributes.fit}** phóng khoáng rủ nhẹ nâng niu cơ thể trong sắc màu **${aiSEOProductAttributes.color}** trung tính cực sang. Phù hợp hoàn hảo cho bộ sưu tập **${aiSEOProductAttributes.season}** thời thượng.\n\n✔️ Đứng dáng, đường may giấu chỉ cao cấp\n✔️ Thoáng khí tự nhiên, thấm hút mồ hôi siêu tốt\n✔️ Thích hợp cho cả dạo phố nắng hay office công sở trang nhã.\n\n*Từ khóa SEO: thời trang quiet luxury, ${aiSEOProductAttributes.material.toLowerCase()}, thiết kế tối giản, NOVYN WEAR*`;
      setAiGeneratedSEODesc(generated);
      setAiGenerating(false);
      showToast('✓ AI đã tạo mô tả sản phẩm chuẩn SEO thời trang!', 'success');
    }, 1500);
  };

  const handleGenerateCaption = () => {
    setAiGenerating(true);
    setTimeout(() => {
      let cap = '';
      if (aiSelectedTone === 'trendy') {
        cap = `🔥 NEW ARRIVALS ON TOP 🔥\n\nNắng lên rồi, lên đồ "Quiet Luxury" thanh lịch cùng NOVYN WEAR thôi cả nhà ơi! Chất liệu ${aiSEOProductAttributes.material} siêu mát lạnh xịn mịn phom dáng ${aiSEOProductAttributes.fit} che khuyết điểm 10/10. \n\n👉 Chốt ngay một em màu ${aiSEOProductAttributes.color} cực hot hit tại link bio nha! Số lượng giới hạn chốt lẹ tay! 🛍️`;
      } else if (aiSelectedTone === 'elegant') {
        cap = `✦ NOVYN Elegant Collection • Thiết lập bản phối tối giản tinh tế.\n\nSự sang trọng thầm lặng thể hiện qua chất liệu ${aiSEOProductAttributes.material} tự nhiên kết hợp cùng phối màu ${aiSEOProductAttributes.fit} tối giản. Sắc màu ${aiSEOProductAttributes.color} trầm ấm nâng tầm phong cách quý cô công sở hiện đại.\n\n🌿 Trải nghiệm bộ sưu tập mới nhất tại chi nhánh showroom của chúng tôi.`;
      } else {
        cap = `🌿 TỐI GIẢN • NHẸ TÊNH • Novyn Muse\n\n- Chất liệu: ${aiSEOProductAttributes.material}\n- Kiểu dáng: ${aiSEOProductAttributes.fit}\n- Tông màu: ${aiSEOProductAttributes.color}\n\nTinh giản mọi chi tiết dư thừa để tìm lại sự bình yên mộc mạc trong từng sợi lanh dệt. Sẵn sàng cho mùa ${aiSEOProductAttributes.season}.`;
      }
      setAiGeneratedCaption(cap);
      setAiGenerating(false);
      showToast(`✓ AI đã viết bài đăng kênh ${aiSelectedChannel} phong cách ${aiSelectedTone}!`, 'success');
    }, 1200);
  };

  const handleAICannedReply = (type: string) => {
    if (type === 'size') {
      setAiCannedReplyOutput(`🤖 Novyn Muse khuyên dùng size S / M:\n\nDạ, dựa trên chiều cao cân nặng của mình, phom dáng ${aiSEOProductAttributes.fit} sẽ cực kỳ tôn dáng và vừa vặn ở size M nếu muốn mặc rộng rũ lãng mạn, hoặc size S nếu muốn ôm vừa vặn đứng vai ạ. Bạn có muốn NOVYN chốt giữ size cho mình tại showroom không ạ? 🥰`);
    } else {
      setAiCannedReplyOutput(`🤖 NOVYN WEAR xin chân thành lỗi vì sự cố hàng lỗi:\n\nDạ, NOVYN vô cùng xin lỗi anh/chị vì trải nghiệm sản phẩm không trọn vẹn lần này ạ! NOVYN xin gửi shipper mang sản phẩm mới 100% nguyên mác qua đổi tận nhà và thu hồi sản phẩm bị lỗi đồng thời, hoàn toàn không thu thêm bất kỳ chi phí nào. Tặng kèm mã giảm giá SALE10 cho đơn hàng tiếp theo coi như lời tạ lỗi chân thành của chúng em ạ! 🌸`);
    }
    showToast('✓ AI đã soạn thảo câu trả lời khách hàng!', 'info');
  };

  const handleGenerateTitleTags = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const title = `Áo Sơ Mi ${aiSEOProductAttributes.material} ${aiSEOProductAttributes.fit} NOVYN WEAR`;
      const tags = `#NovynWear #LinenShirt #QuietLuxury #ClassicMinimalism #UnisexStyle #SummerCollection #${aiSEOProductAttributes.color.replace(/\s+/g, '')}`;
      setAiGeneratedTitleTags(`🏷️ TIÊU ĐỀ ĐỀ XUẤT:\n${title}\n\n🏷️ HASHTAGS:\n${tags}`);
      setAiGenerating(false);
      showToast('✓ AI đã viết tiêu đề và tạo thẻ tags!', 'success');
    }, 1000);
  };

  const handleGenerateMeta = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const metaTitle = `${aiSEOProductAttributes.material} ${aiSEOProductAttributes.fit} Cực Sang | NOVYN.WEAR`;
      const metaDesc = `Mua sắm ngay dòng sản phẩm thiết kế từ chất liệu ${aiSEOProductAttributes.material} tự nhiên. Thiết kế tối giản ${aiSEOProductAttributes.fit} màu ${aiSEOProductAttributes.color} phù hợp cho BST ${aiSEOProductAttributes.season}. Giao hàng 2h toàn quốc, đổi trả 7 ngày.`;
      setAiGeneratedMeta(`🔍 SEO META TITLE:\n${metaTitle}\n\n🔍 SEO META DESCRIPTION:\n${metaDesc}`);
      setAiGenerating(false);
      showToast('✓ AI đã tạo thẻ Meta SEO thành công!', 'success');
    }, 1000);
  };

  const handleGenerateBlog = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const blogContent = `🌿 BẢN THUYẾT MINH VỀ SỰ THANH LỊCH CỦA CHẤT LIỆU ${aiSEOProductAttributes.material.toUpperCase()}\n\nTrong kỷ nguyên của lối sống "Less is more", dòng trang phục dệt từ sợi ${aiSEOProductAttributes.material.toLowerCase()} nổi lên như một tuyên ngôn phong cách vượt thời gian. Không hào nhoáng cầu kỳ, chính sự mộc mạc nguyên bản của chất vải dệt đã tạo nên một sức hút sang trọng thầm lặng (Quiet Luxury) đầy mê hoặc.\n\nThiết kế phom dáng ${aiSEOProductAttributes.fit.toLowerCase()} kết hợp tông màu ${aiSEOProductAttributes.color.toLowerCase()} dịu mát đặc trưng mang lại một cảm giác giải phóng cơ thể tối đa. Khi khoác lên mình mẫu trang phục này của NOVYN, bạn không chỉ mặc một chiếc áo sơ mi đơn thuần, mà đang tận hưởng triết lý thiết kế hướng về sự tự do của chuyển động và sự bền vững của tự nhiên.\n\nKết hợp tinh tế mẫu áo này cùng quần tây be sáng hoặc short linen đồng điệu để tạo nên diện mạo phóng khoáng cho mùa hè ${aiSEOProductAttributes.season} đầy cảm hứng.`;
      setAiGeneratedBlog(blogContent);
      setAiGenerating(false);
      showToast('✓ AI đã viết bài blog thời trang!', 'success');
    }, 1500);
  };

  const handleGenerateBrief = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const briefContent = `📋 BẢN TÓM TẮT CHIẾN DỊCH (CAMPAIGN BRIEF): NOVYN "WEIGHTLESS ${aiSEOProductAttributes.season.toUpperCase()}"\n\n1. THÔNG ĐIỆP CHỦ ĐẠO: "Nhẹ nhàng chạm vào xúc giác - Tự do trong từng chuyển động"\n2. KÊNH ĐỒNG BỘ: Instagram lookbook reels, TikTok UGC review, và email marketing gửi khách VIP.\n3. CONCEPT CHỤP ẢNH: Editorial Fashion ngoài trời với ánh sáng tự nhiên ngả vàng, nền cát biển hoặc kiến trúc tối giản be kem.\n4. MỤC TIÊU: Tiếp cận 50,000 khách hàng mục tiêu yêu thích thời trang quiet luxury, thúc đẩy 1,500 lượt add-to-cart cho mẫu thiết kế ${aiSEOProductAttributes.material} màu ${aiSEOProductAttributes.color}.\n5. KEYWORDS: #NovynWear #${aiSEOProductAttributes.material.replace(/\s+/g, '')} #QuietLuxury #Minimalism`;
      setAiGeneratedBrief(briefContent);
      setAiGenerating(false);
      showToast('✓ AI đã lập tóm tắt chiến dịch thành công!', 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          Novyn Muse AI Copilot & Content Hub
        </h3>
        <p className="text-xs text-neutral-450 mt-1">Trí tuệ nhân tạo hỗ trợ dự báo tồn kho, tối ưu hóa nhập hàng và tự động tạo caption tiếp thị.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* AI inventory optimizer */}
        <div className="lg:col-span-5 bg-white border rounded-3xl p-5 shadow-sm space-y-5">
          <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI Inventory Optimizer & Anomaly Detector
          </h4>

          <div className="space-y-4 text-xs font-medium text-neutral-700">
            {/* AI Replenishment alert */}
            <div className="bg-amber-550/10 border border-amber-200 rounded-2xl p-4 space-y-2">
              <span className="text-[9px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
                AI Đề xuất nhập kho (AI Replenishment)
              </span>
              <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                💡 **Tốc độ bán hàng tăng 15%**: Đề xuất nhập thêm **20 chiếc** sản phẩm **Áo Sơ Mi Linen Màu Cát (Size M)** tại showroom Quận 1 để tránh đứt hàng trong 14 ngày tới.
              </p>
            </div>

            {/* AI Stock optimizer alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
              <span className="text-[9px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                AI Xử lý tồn kho chậm (AI Stock Optimizer)
              </span>
              <p className="text-[11px] text-blue-800 font-semibold leading-relaxed">
                ⚠️ **Hàng tồn đọng &gt; 60 ngày**: Mẫu **Áo Thun Supima màu Trắng (Size S)** hiện đang có tỷ lệ tồn kho cao. Khuyên dùng: Chạy flash-sale giảm **30%** hoặc tặng quà kèm đơn hàng để tối ưu dòng tiền.
              </p>
            </div>

            {/* AI Anomaly Alert */}
            <div className="bg-rose-50 border border-rose-250 rounded-2xl p-4 space-y-2">
              <span className="text-[9px] font-black text-rose-900 uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
                AI Phát hiện bất thường (AI Anomaly Detector)
              </span>
              <p className="text-[11px] text-rose-800 font-semibold leading-relaxed">
                🔔 **Chỉ số bất thường két**: Số lượng hóa đơn bị hủy bởi thu ngân tại chi nhánh Thảo Điền tăng **4%** trong 3 ngày qua. Giám đốc nên tiến hành đối soát camera.
              </p>
            </div>
          </div>
        </div>

        {/* AI SEO & Content Creator */}
        <div className="lg:col-span-7 bg-white border rounded-3xl p-5 shadow-sm space-y-5">
          <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            AI Content Marketing & SEO Creator
          </h4>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Chất liệu vải</label>
                <input
                  type="text"
                  value={aiSEOProductAttributes.material}
                  onChange={(e) => setAiSEOProductAttributes({ ...aiSEOProductAttributes, material: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Phom dáng</label>
                <input
                  type="text"
                  value={aiSEOProductAttributes.fit}
                  onChange={(e) => setAiSEOProductAttributes({ ...aiSEOProductAttributes, fit: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Phối màu</label>
                <input
                  type="text"
                  value={aiSEOProductAttributes.color}
                  onChange={(e) => setAiSEOProductAttributes({ ...aiSEOProductAttributes, color: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Bộ sưu tập</label>
                <input
                  type="text"
                  value={aiSEOProductAttributes.season}
                  onChange={(e) => setAiSEOProductAttributes({ ...aiSEOProductAttributes, season: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-white text-neutral-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button
                onClick={handleGenerateSEODesc}
                className="py-2.5 bg-neutral-900 text-white rounded-xl text-[11px] font-bold hover:bg-neutral-805 transition-colors cursor-pointer"
              >
                Viết mô tả SEO AI
              </button>
              <button
                onClick={handleGenerateCaption}
                className="py-2.5 bg-rose-500 text-white rounded-xl text-[11px] font-bold hover:bg-rose-600 transition-colors cursor-pointer"
              >
                Tạo Caption Đa Kênh
              </button>
              <button
                onClick={handleGenerateTitleTags}
                className="py-2.5 bg-amber-600 text-white rounded-xl text-[11px] font-bold hover:bg-amber-700 transition-colors cursor-pointer"
              >
                Tạo Tiêu đề & Tag
              </button>
              <button
                onClick={handleGenerateMeta}
                className="py-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-bold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Tạo Meta SEO
              </button>
              <button
                onClick={handleGenerateBlog}
                className="py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Viết Blog Thời trang
              </button>
              <button
                onClick={handleGenerateBrief}
                className="py-2.5 bg-emerald-600 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Tóm tắt Chiến dịch
              </button>
            </div>

            {aiGenerating ? (
              <div className="bg-neutral-50 rounded-2xl p-6 border flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                <span className="font-bold text-neutral-450 uppercase tracking-wide text-[10px]">Novyn Muse AI đang suy nghĩ...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {aiGeneratedSEODesc && (
                  <div className="p-4 bg-amber-50/20 border border-amber-250/70 rounded-2xl space-y-1">
                    <span className="text-[9px] font-black text-amber-900 uppercase tracking-widest block mb-1.5">Mô tả SEO sản phẩm AI</span>
                    <p className="text-[11px] text-neutral-700 whitespace-pre-line leading-relaxed font-semibold">{aiGeneratedSEODesc}</p>
                  </div>
                )}

                {aiGeneratedTitleTags && (
                  <div className="p-4 bg-amber-550/10 border border-amber-200 rounded-2xl space-y-1">
                    <span className="text-[9px] font-black text-amber-950 uppercase tracking-widest block mb-1.5">Tiêu đề & Thẻ Tags AI</span>
                    <p className="text-[11px] text-neutral-700 whitespace-pre-line leading-relaxed font-semibold">{aiGeneratedTitleTags}</p>
                  </div>
                )}

                {aiGeneratedMeta && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                    <span className="text-[9px] font-black text-blue-900 uppercase tracking-widest block mb-1.5">Thẻ SEO Meta AI</span>
                    <p className="text-[11px] text-neutral-700 whitespace-pre-line leading-relaxed font-semibold">{aiGeneratedMeta}</p>
                  </div>
                )}

                {aiGeneratedBlog && (
                  <div className="p-4 bg-neutral-50 border border-neutral-250 rounded-2xl space-y-1">
                    <span className="text-[9px] font-black text-neutral-900 uppercase tracking-widest block mb-1.5">Bài viết Blog thời trang AI</span>
                    <p className="text-[11px] text-neutral-700 whitespace-pre-line leading-relaxed font-semibold">{aiGeneratedBlog}</p>
                  </div>
                )}

                {aiGeneratedBrief && (
                  <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-2xl space-y-1">
                    <span className="text-[9px] font-black text-emerald-900 uppercase tracking-widest block mb-1.5">Bản tóm tắt Chiến dịch AI</span>
                    <p className="text-[11px] text-neutral-700 whitespace-pre-line leading-relaxed font-semibold">{aiGeneratedBrief}</p>
                  </div>
                )}
                
                {aiGeneratedCaption && (
                  <div className="p-4 bg-rose-50/20 border border-rose-250/70 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-rose-900 uppercase tracking-widest">Caption tiếp thị đa kênh AI</span>
                      
                      <div className="flex gap-1.5">
                        {['facebook', 'tiktok', 'instagram'].map(ch => (
                          <button
                            key={ch}
                            onClick={() => setAiSelectedChannel(ch as any)}
                            className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                              aiSelectedChannel === ch ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'
                            }`}
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-1.5 border-b pb-2">
                      {['trendy', 'elegant', 'minimalist'].map(tn => (
                        <button
                          key={tn}
                          onClick={() => setAiSelectedTone(tn as any)}
                          className={`px-2.5 py-0.5 rounded border text-[8px] font-semibold ${
                            aiSelectedTone === tn ? 'border-rose-450 bg-rose-50 text-rose-700' : 'border-neutral-200 text-neutral-500'
                          }`}
                        >
                          {tn}
                        </button>
                      ))}
                    </div>

                    <p className="text-[11px] text-neutral-700 whitespace-pre-line leading-relaxed font-semibold">{aiGeneratedCaption}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI customer reply dialog block */}
      <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
        <h4 className="text-xs font-black uppercase text-neutral-850 tracking-wider">AI Trợ lý kịch bản hội thoại tư vấn CSKH</h4>
        <p className="text-[10px] text-neutral-450">• Nhấp chọn tình huống khách hàng chat để AI Muse tự động đề xuất phương án trả lời tinh tế.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2.5">
            {[
              { id: 'size', title: '💬 Khách: "68kg cao 1m72 mặc size gì vừa em?"' },
              { id: 'refund', title: '💬 Khách: "Vải đầm nhận bị bung cúc chỉ rồi em ơi..."' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handleAICannedReply(item.id)}
                className="w-full text-left p-3.5 rounded-2xl border bg-neutral-50 hover:bg-neutral-100 transition-colors text-xs font-bold text-neutral-700 cursor-pointer block"
              >
                {item.title}
              </button>
            ))}
          </div>

          {aiCannedReplyOutput && (
            <div className="bg-amber-50/20 border border-amber-250/70 p-4 rounded-2xl animate-pulse space-y-1.5">
              <span className="text-[9px] font-black text-amber-900 uppercase tracking-widest block mb-1">Novyn Muse AI đề xuất phản hồi:</span>
              <p className="text-xs text-neutral-700 leading-relaxed font-semibold whitespace-pre-line bg-white p-3 rounded-xl border">
                {aiCannedReplyOutput}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
