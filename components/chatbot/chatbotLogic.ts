import { MOCK_PRODUCTS } from '../../data/products';
import { ChatMessage } from './chatbotTypes';

export const AGENT_AVATAR = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';

export function createInitialAIMessage(): ChatMessage {
  return {
    id: 'greet-ai',
    sender: 'bot',
    text: 'Xin chào! Tôi là Novyn Muse ✦ Nàng thơ tư vấn phong cách tối giản từ Novyn Wear. Tôi ở đây để đồng hành cùng bạn thiết lập những bản phối Quiet Luxury thời thượng, nhẹ tênh như không trọng lực. Hãy chọn một phong cách bên dưới để chúng ta bắt đầu nhé!',
    timestamp: new Date(),
    quickReplies: ['✦ Quiet Luxury', '✦ Mùa hè Linen', '✦ Office Elegance', '✦ Nhờ phối đồ giúp', '💬 Gặp nhân viên tư vấn'],
  };
}

export function generateAIResponse(userInput: string): ChatMessage {
  const text = userInput.toLowerCase();
  const botMsgId = `ai-${Math.random().toString(36).substring(2, 9)}`;
  const time = new Date();

  if (
    text.includes('nhân viên') ||
    text.includes('tư vấn') ||
    text.includes('gặp nhân viên') ||
    text.includes('người') ||
    text.includes('chát với nhân viên') ||
    text.includes('live chat') ||
    text.includes('chat')
  ) {
    return {
      id: botMsgId,
      sender: 'bot',
      text: 'Dạ, bạn có muốn kết nối trực tiếp với chuyên viên CSKH (nhân viên thật) để được giải quyết khiếu nại hoặc xử lý đơn hàng nhanh không ạ? Bấm nút bên dưới để em kết nối ngay nhé!',
      timestamp: time,
      quickReplies: ['💬 Kết nối chuyên viên ngay', '🤖 Hủy bỏ'],
    };
  }

  if (text.includes('quiet luxury')) {
    const luxuryProducts = MOCK_PRODUCTS.filter(p => p.id === 'prod-02' || p.id === 'prod-03');
    return {
      id: botMsgId,
      sender: 'bot',
      text: '✦ **Quiet Luxury Style** tập trung vào những chất liệu cao cấp mộc mạc và màu sắc trung tính trang nhã. Tôi gợi ý cho bạn bản phối sau:\n\n**Áo Khoác Blazer Relaxed Fit** (Lớp ngoài thanh lịch đứng dáng) phối cùng **Áo Sơ Mi Linen Cao Cấp** (Lớp trong nhẹ tênh phóng khoáng).\n\nDưới đây là bản phối khuyên dùng dành cho bạn:',
      timestamp: time,
      products: luxuryProducts,
      quickReplies: ['📐 Tư vấn chọn size', '🏷️ Mã giảm giá mới', '🤖 Quay lại Novyn AI']
    };
  }

  if (text.includes('mùa hè linen') || text.includes('linen') || text.includes('thô') || text.includes('mát') || text.includes('đũi')) {
    const linenProducts = MOCK_PRODUCTS.filter(p => p.id === 'prod-03' || p.name.toLowerCase().includes('linen') || p.description.toLowerCase().includes('linen'));
    return {
      id: botMsgId,
      sender: 'bot',
      text: '🌿 **Linen Summer Style** nhẹ tênh mang lại sự thoải mái tuyệt đối và phong thái phóng khoáng đầy lôi cuốn cho ngày nắng nóng. Bản phối gợi ý:\n\n**Áo Sơ Mi Linen Cao Cấp** dệt sợi lanh thô mộc tự nhiên thoáng khí, kết hợp cùng quần suông linen mộc mạc.\n\nSản phẩm Linen cao cấp:',
      timestamp: time,
      products: linenProducts,
      quickReplies: ['📐 Tư vấn chọn size', '🏷️ Mã giảm giá mới', '🤖 Quay lại Novyn AI']
    };
  }

  if (text.includes('office elegance') || text.includes('công sở') || text.includes('đi làm')) {
    const officeProducts = MOCK_PRODUCTS.filter(p => p.id === 'prod-02' || p.id === 'prod-04');
    return {
      id: botMsgId,
      sender: 'bot',
      text: '💼 **Office Elegance** thanh lịch chuyên nghiệp nhưng vô cùng dễ chịu và sang trọng. Bản phối gợi ý:\n\n**Áo Khoác Blazer Relaxed Fit** tuyết mưa phối cùng **Áo Len Dệt Kim Soft-Touch** mỏng nhẹ ôm dáng bên trong.\n\nSản phẩm khuyên dùng:',
      timestamp: time,
      products: officeProducts,
      quickReplies: ['📐 Tư vấn chọn size', '🏷️ Mã giảm giá mới', '🤖 Quay lại Novyn AI']
    };
  }

  if (text.includes('phối đồ') || text.includes('phối hợp') || text.includes('mix') || text.includes('match') || text.includes('style') || text.includes('nhờ phối')) {
    const suggestProds = MOCK_PRODUCTS.filter(p => p.id === 'prod-01' || p.id === 'prod-02' || p.id === 'prod-03');
    return {
      id: botMsgId,
      sender: 'bot',
      text: '✦ **Novyn Styling Advice** • Sự tinh tế nằm ở tính tối giản!\n\n1. **Phối năng động**: Áo thun Premium Cotton dệt Supima mịn phối cùng quần dáng suông rộng.\n2. **Phối thanh lịch**: Áo sơ mi Linen đũi lanh nhẹ mộc kết hợp cùng Áo khoác Blazer tuyết mưa đứng dáng.\n\nGợi ý bản phối hoàn hảo cho bạn:',
      timestamp: time,
      products: suggestProds,
      quickReplies: ['📐 Tư vấn chọn size', '🏷️ Mã giảm giá mới', '🤖 Quay lại Novyn AI']
    };
  }

  const weightMatch = text.match(/(\d+)\s*kg/);
  if (weightMatch || text.includes('size') || text.includes('kích cỡ') || text.includes('chọn size')) {
    let weight = 0;
    if (weightMatch) weight = parseInt(weightMatch[1]);
    let sizeAdvice = 'M';
    let reasoning = '';
    if (weight > 0) {
      if (weight < 58) { sizeAdvice = 'S'; reasoning = 'vì cân nặng dưới 58kg phom Regular Fit ôm nhẹ thoải mái.'; }
      else if (weight <= 68) { sizeAdvice = 'M'; reasoning = 'vì cân nặng từ 58-68kg cực kỳ cân đối với phom dáng chuẩn.'; }
      else if (weight <= 78) { sizeAdvice = 'L'; reasoning = 'vì cân nặng từ 69-78kg mặc rộng rũ thoải mái vai ngực.'; }
      else { sizeAdvice = 'XL'; reasoning = 'để mặc dài rộng thoải mái phom dáng.'; }
    }
    const responseText = weight > 0
      ? `Novyn Muse đã phân tích! Dựa trên cân nặng **${weight}kg**, bạn nên chọn **Size ${sizeAdvice}** ${reasoning}`
      : 'Bảng size tiêu chuẩn Novyn:\n- **S**: dưới 1m68, dưới 58kg\n- **M**: 1m68-1m74, 59-68kg\n- **L**: 1m75-1m80, 69-78kg\n- **XL**: trên 1m80, trên 79kg\n\n*Gõ cân nặng (VD: "65kg") để nhận tư vấn size cụ thể hơn!*';
    return { id: botMsgId, sender: 'bot', text: responseText, timestamp: time, quickReplies: ['✦ Quiet Luxury', '🏷️ Mã giảm giá mới', '💬 Gặp nhân viên tư vấn'] };
  }

  if (text.includes('mã') || text.includes('giảm giá') || text.includes('sale') || text.includes('coupon') || text.includes('ưu đãi')) {
    return { id: botMsgId, sender: 'bot', text: 'Mã giảm giá đang hoạt động dành cho bạn:\n\n1. **SALE10**: Giảm 10% tổng hóa đơn\n2. **FREESHIP**: Miễn phí vận chuyển toàn quốc\n\n*Nhập mã tại trang thanh toán để áp dụng nhé!* 🏷️', timestamp: time, quickReplies: ['🛒 Xem giỏ hàng', '✦ Quiet Luxury'] };
  }

  if (text.includes('áo') || text.includes('sơ mi')) {
    return { id: botMsgId, sender: 'bot', text: 'Bộ sưu tập Áo (Tops) tinh tế của Novyn:', timestamp: time, products: MOCK_PRODUCTS.filter(p => p.category === 'Tops'), quickReplies: ['📐 Tư vấn chọn size', '🏷️ Mã giảm giá mới'] };
  }

  if (text.includes('quần') || text.includes('bottoms')) {
    return { id: botMsgId, sender: 'bot', text: 'Bộ sưu tập Quần (Bottoms) thanh lịch:', timestamp: time, products: MOCK_PRODUCTS.filter(p => p.category === 'Bottoms'), quickReplies: ['📐 Tư vấn chọn size'] };
  }

  if (text.includes('đầm') || text.includes('dress') || text.includes('váy')) {
    return { id: botMsgId, sender: 'bot', text: 'Đầm Sang Trọng Quiet Luxury:', timestamp: time, products: MOCK_PRODUCTS.filter(p => p.category === 'Dresses'), quickReplies: ['✦ Quiet Luxury'] };
  }

  if (text.includes('áo khoác') || text.includes('blazer') || text.includes('trench coat') || text.includes('bomber')) {
    return { id: botMsgId, sender: 'bot', text: 'Áo Khoác Thời Trang Novyn:', timestamp: time, products: MOCK_PRODUCTS.filter(p => p.category === 'Outerwear'), quickReplies: ['✦ Quiet Luxury', '🏷️ Mã giảm giá mới'] };
  }

  if (text.includes('hot') || text.includes('bán chạy') || text.includes('bestseller') || text.includes('mới')) {
    return { id: botMsgId, sender: 'bot', text: '🌿 Best Seller & New Arrivals tuần này:', timestamp: time, products: MOCK_PRODUCTS.filter(p => p.badges?.includes('Best Seller') || p.badges?.includes('New')).slice(0, 4), quickReplies: ['📐 Tư vấn chọn size', '🏷️ Mã giảm giá'] };
  }

  if (text.includes('đổi trả') || text.includes('trả hàng') || text.includes('hoàn tiền') || text.includes('lỗi')) {
    return { id: botMsgId, sender: 'bot', text: '🔄 **Chính sách đổi trả Novyn Wear:**\n\nĐổi trả miễn phí trong **30 ngày** kể từ khi nhận hàng. Sản phẩm còn nguyên tag, chưa qua giặt.\n\nNếu lỗi từ nhà sản xuất, Novyn Wear sẽ cử bưu tá thu hồi và giao bù miễn phí!', timestamp: time, quickReplies: ['💬 Gặp nhân viên tư vấn', '🏷️ Mã giảm giá mới'] };
  }

  return { id: botMsgId, sender: 'bot', text: 'Dạ Novyn Muse đã ghi nhận câu hỏi. Bạn có thể chọn các gợi ý phong cách phối đồ bên dưới hoặc gõ: *phối đồ, quiet luxury, linen, công sở, tư vấn size*', timestamp: time, quickReplies: ['✦ Quiet Luxury', '✦ Mùa hè Linen', '✦ Office Elegance', '💬 Gặp nhân viên tư vấn'] };
}

export function generateAgentResponse(userInput: string, onResetToAI?: () => void): ChatMessage {
  const text = userInput.toLowerCase();
  const agentMsgId = `agent-${Math.random().toString(36).substring(2, 9)}`;
  const time = new Date();

  if (text.includes('đơn hàng') || text.includes('kiểm tra') || text.includes('ship') || text.includes('giao')) {
    return { id: agentMsgId, sender: 'agent', text: 'Dạ, em sẵn sàng check ngay! Anh/chị có thể cung cấp **Số điện thoại đặt hàng** hoặc **Mã đơn hàng** không ạ? 📦', timestamp: time, quickReplies: ['📞 Gọi Hotline 1900', '📍 Showroom Sài Gòn'] };
  }

  if (text.includes('đổi') || text.includes('chật') || text.includes('rộng') || text.includes('không vừa')) {
    return { id: agentMsgId, sender: 'agent', text: 'Anh/chị đừng lo nhé! Em hỗ trợ đổi size miễn phí tận nhà. Bưu tá sẽ mang size mới qua và thu hồi size cũ đồng thời, không cần ra bưu cục ạ. Cho em xin SĐT đặt hàng cũ nhé!', timestamp: time, quickReplies: ['💬 Chat qua Zalo', '📞 Gọi Hotline 1900'] };
  }

  if (text.includes('địa chỉ') || text.includes('showroom') || text.includes('ở đâu') || text.includes('chi nhánh')) {
    return { id: agentMsgId, sender: 'agent', text: 'Novyn Wear mở cửa 9:00–22:30 hàng ngày:\n\n🏛️ **Quận 1 (TP.HCM):** 152 Đồng Khởi\n🏛️ **Thảo Điền (Quận 2):** 23 Xuân Thủy\n\nAnh/chị có muốn em đặt lịch giữ sẵn sản phẩm không ạ? 🌿', timestamp: time, quickReplies: ['📍 Chi nhánh Quận 1', '🤖 Quay lại Novyn AI'] };
  }

  if (text.includes('quay lại') || text.includes('hủy') || text.includes('ai') || text.includes('tự động')) {
    if (onResetToAI) setTimeout(onResetToAI, 500);
    return { id: agentMsgId, sender: 'system', text: 'Đã chuyển lại chế độ Novyn AI.', timestamp: time };
  }

  return { id: agentMsgId, sender: 'agent', text: 'Dạ, em đã nhận được câu hỏi của mình rồi ạ. Để em phục vụ chu đáo nhất, anh/chị có thể kết nối qua **Zalo CSKH** hoặc gọi tổng đài miễn phí bên dưới không ạ? 🥰', timestamp: time, quickReplies: ['💬 Chat qua Zalo', '📞 Gọi Hotline 1900', '🤖 Quay lại Novyn AI'] };
}
