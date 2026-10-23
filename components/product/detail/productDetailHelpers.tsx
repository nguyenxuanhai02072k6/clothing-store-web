import React from 'react';
import { Product } from '../../../types';

export const getFabricType = (product: Product): 'linen' | 'cotton' | 'silk' | 'denim' | 'knitwear' | 'default' => {
  if (!product) return 'default';
  const name = product.name.toLowerCase();
  const desc = product.description.toLowerCase();
  if (name.includes('linen') || desc.includes('linen') || name.includes('lanh')) return 'linen';
  if (name.includes('silk') || desc.includes('silk') || name.includes('lụa')) return 'silk';
  if (name.includes('jean') || desc.includes('jean') || name.includes('denim') || desc.includes('denim')) return 'denim';
  if (name.includes('len') || desc.includes('len') || name.includes('dệt kim') || desc.includes('dệt kim') || name.includes('knit')) return 'knitwear';
  if (name.includes('cotton') || desc.includes('cotton') || name.includes('thun') || name.includes('polo')) return 'cotton';
  return 'default';
};

export const getMaterialText = (product: Product): string => {
  const type = getFabricType(product);
  switch (type) {
    case 'linen':
      return 'Sản phẩm được làm từ 100% sợi Linen (lanh) tự nhiên nhập khẩu cao cấp. Chất liệu lanh sở hữu các nếp nhăn mộc mạc đặc trưng đầy phóng khoáng, khả năng thấm hút mồ hôi và tản nhiệt vượt trội giúp điều hòa thân nhiệt cực tốt trong những ngày nóng ẩm.';
    case 'cotton':
      return 'Sản phẩm được dệt từ 100% sợi Supima Cotton cao cấp (hoặc Heavyweight Cotton siêu dày dặn). Đây là loại cotton sợi dài thượng hạng có độ bền gấp đôi cotton thường, bề mặt vải đanh mịn, không đổ lông, cực kỳ êm dịu với làn da nhạy cảm.';
    case 'silk':
      return 'Sản phẩm dệt từ chất liệu lụa tơ tằm thượng hạng (Silk) pha cotton/satin, mang lại độ bóng bảy óng ả tự nhiên vô cùng sang trọng. Vải có đặc tính siêu nhẹ, lướt êm ái trên da mang lại cảm giác mát lịm và mềm mại như làn nước.';
    case 'denim':
      return 'Sản phẩm dệt từ chất liệu vải Raw Denim 12oz - 13.5oz cao cấp siêu bền bỉ. Vải giữ phom đứng dáng nguyên bản, có khả năng tự co rút và tạo vết phai màu (fade) độc bản cá tính theo thời gian sử dụng của riêng bạn.';
    case 'knitwear':
      return 'Sản phẩm dệt từ sợi len/dệt kim mỏng nhẹ cao cấp, được xử lý bề mặt soft-touch mềm như bông. Mắt dệt tinh xảo tạo độ thoáng khí tốt mà vẫn giữ ấm vừa phải, co giãn đa chiều thoải mái mà không lo mất phom dáng.';
    default:
      return 'Sản phẩm dệt từ sợi tự nhiên hữu cơ kết hợp tuyết mưa hoặc sợi tổng hợp cao cấp đứng dáng. Đường chỉ giấu tinh xảo, cấu trúc may đo hai lớp Quiet Luxury đem lại độ bền bỉ và giữ phom dáng chuẩn mực suốt ngày dài.';
  }
};

export const getCareInstructions = (product: Product): string[] => {
  const type = getFabricType(product);
  switch (type) {
    case 'linen':
      return [
        'Nên giặt tay bằng nước mát hoặc giặt máy ở chế độ nhẹ nhàng (delicate) với túi giặt.',
        'Sử dụng nước giặt dịu nhẹ, không dùng thuốc tẩy chứa clo mạnh làm mục sợi lanh.',
        'Không vắt xoắn mạnh; phơi ngang dưới bóng râm thoáng mát, tránh ánh nắng gắt.',
        'Ủi (là) bằng hơi nước khi áo còn ẩm nhẹ để các nếp nhăn tự nhiên phẳng đều.'
      ];
    case 'cotton':
      return [
        'Giặt máy ở nhiệt độ thường (dưới 40°C) với các sản phẩm cùng màu.',
        'Tránh ngâm sản phẩm quá lâu trong nước giặt hoặc thuốc tẩy mạnh.',
        'Phơi mặt trái dưới bóng râm để giữ màu sắc sản phẩm bền lâu.',
        'Ủi ở nhiệt độ trung bình (dưới 150°C), có thể sấy ở chế độ nhẹ.'
      ];
    case 'silk':
      return [
        'Ưu tiên giặt khô hoặc giặt bằng tay nhẹ nhàng với nước lạnh và dầu gội/sữa tắm.',
        'Tuyệt đối không vắt xoắn hoặc chà xát mạnh làm xước và gãy sợi lụa.',
        'Phơi phẳng trong bóng râm, tránh ánh nắng mặt trời trực tiếp.',
        'Ủi hơi nước ở chế độ dành riêng cho lụa (silk mode) hoặc dùng một tấm vải lót trên bề mặt khi ủi.'
      ];
    case 'denim':
      return [
        'Hạn chế giặt thường xuyên; nên giặt riêng ở nước lạnh trong vài lần đầu để tránh lem màu.',
        'Khi giặt, lộn mặt trái của quần jean ra ngoài và kéo toàn bộ khóa kéo lên.',
        'Không dùng nước xả vải làm nhão phom denim; không sấy nóng.',
        'Phơi khô tự nhiên trong bóng mát, treo bằng móc đai quần để giữ phom thẳng dáng.'
      ];
    case 'knitwear':
      return [
        'Chỉ giặt tay nhẹ nhàng bằng nước mát hoặc giặt máy chế độ giặt len.',
        'Dùng nước giặt trung tính dịu nhẹ, không dùng nước xả vải làm mất độ đàn hồi của len.',
        'Không vắt xoắn; dùng khăn khô ấn nhẹ để thấm bớt nước trước khi phơi.',
        'Phơi phẳng trên lưới phơi hoặc phơi ngang trên sào. TUYỆT ĐỐI không treo móc dọc làm chảy sệ áo.'
      ];
    default:
      return [
        'Giặt máy nhẹ nhàng ở nước mát với túi giặt bảo vệ.',
        'Không sấy khô sản phẩm ở nhiệt độ cao để tránh co rút vải.',
        'Ủi hơi nước nhẹ nhàng ở nhiệt độ thấp.',
        'Treo bằng móc gỗ bản to đối với áo blazer và măng tô để giữ cầu vai đứng dáng.'
      ];
  }
};

export const renderSizeTable = (category: string) => {
  const cat = category.toLowerCase();
  if (cat === 'bottoms') {
    return (
      <div className="overflow-x-auto my-3 border border-brand-border rounded-xl">
        <table className="w-full min-w-[460px] text-xs text-left border-collapse bg-white">
          <thead>
            <tr className="bg-neutral-50 border-b border-brand-border">
              <th className="p-3 font-bold text-brand-text uppercase tracking-wider">Size</th>
              <th className="p-3 font-bold text-brand-text uppercase tracking-wider">Vòng eo (cm)</th>
              <th className="p-3 font-bold text-brand-text uppercase tracking-wider">Vòng mông (cm)</th>
              <th className="p-3 font-bold text-brand-text uppercase tracking-wider">Dài quần (cm)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border text-brand-muted font-normal">
            <tr className="hover:bg-neutral-50/50">
              <td className="p-3 font-bold text-brand-text">S / 29</td>
              <td className="p-3 font-mono">74 - 78</td>
              <td className="p-3 font-mono">92 - 96</td>
              <td className="p-3 font-mono">98</td>
            </tr>
            <tr className="hover:bg-neutral-50/50">
              <td className="p-3 font-bold text-brand-text">M / 30-31</td>
              <td className="p-3 font-mono">78 - 82</td>
              <td className="p-3 font-mono">96 - 100</td>
              <td className="p-3 font-mono">100</td>
            </tr>
            <tr className="hover:bg-neutral-50/50">
              <td className="p-3 font-bold text-brand-text">L / 32</td>
              <td className="p-3 font-mono">82 - 86</td>
              <td className="p-3 font-mono">100 - 104</td>
              <td className="p-3 font-mono">102</td>
            </tr>
            <tr className="hover:bg-neutral-50/50">
              <td className="p-3 font-bold text-brand-text">XL / 33</td>
              <td className="p-3 font-mono">86 - 90</td>
              <td className="p-3 font-mono">104 - 108</td>
              <td className="p-3 font-mono">104</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  if (cat === 'dresses') {
    return (
      <div className="overflow-x-auto my-3 border border-brand-border rounded-xl">
        <table className="w-full min-w-[460px] text-xs text-left border-collapse bg-white">
          <thead>
            <tr className="bg-neutral-50 border-b border-brand-border">
              <th className="p-3 font-bold text-brand-text uppercase tracking-wider">Size</th>
              <th className="p-3 font-bold text-brand-text uppercase tracking-wider">Vòng ngực (cm)</th>
              <th className="p-3 font-bold text-brand-text uppercase tracking-wider">Vòng eo (cm)</th>
              <th className="p-3 font-bold text-brand-text uppercase tracking-wider">Dài đầm (cm)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border text-brand-muted font-normal">
            <tr className="hover:bg-neutral-50/50">
              <td className="p-3 font-bold text-brand-text">XS</td>
              <td className="p-3 font-mono">78 - 82</td>
              <td className="p-3 font-mono">62 - 66</td>
              <td className="p-3 font-mono">110</td>
            </tr>
            <tr className="hover:bg-neutral-50/50">
              <td className="p-3 font-bold text-brand-text">S</td>
              <td className="p-3 font-mono">82 - 86</td>
              <td className="p-3 font-mono">66 - 70</td>
              <td className="p-3 font-mono">112</td>
            </tr>
            <tr className="hover:bg-neutral-50/50">
              <td className="p-3 font-bold text-brand-text">M</td>
              <td className="p-3 font-mono">86 - 90</td>
              <td className="p-3 font-mono">70 - 74</td>
              <td className="p-3 font-mono">114</td>
            </tr>
            <tr className="hover:bg-neutral-50/50">
              <td className="p-3 font-bold text-brand-text">L</td>
              <td className="p-3 font-mono">90 - 94</td>
              <td className="p-3 font-mono">74 - 78</td>
              <td className="p-3 font-mono">116</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  if (cat === 'outerwear') {
    return (
      <div className="overflow-x-auto my-3 border border-brand-border rounded-xl">
        <table className="w-full min-w-[460px] text-xs text-left border-collapse bg-white">
          <thead>
            <tr className="bg-neutral-50 border-b border-brand-border">
              <th className="p-3 font-bold text-brand-text uppercase tracking-wider">Size</th>
              <th className="p-3 font-bold text-brand-text uppercase tracking-wider">Rộng vai (cm)</th>
              <th className="p-3 font-bold text-brand-text uppercase tracking-wider">Vòng ngực (cm)</th>
              <th className="p-3 font-bold text-brand-text uppercase tracking-wider">Dài áo (cm)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border text-brand-muted font-normal">
            <tr className="hover:bg-neutral-50/50">
              <td className="p-3 font-bold text-brand-text">S</td>
              <td className="p-3 font-mono">44</td>
              <td className="p-3 font-mono">102</td>
              <td className="p-3 font-mono">70</td>
            </tr>
            <tr className="hover:bg-neutral-50/50">
              <td className="p-3 font-bold text-brand-text">M</td>
              <td className="p-3 font-mono">46</td>
              <td className="p-3 font-mono">106</td>
              <td className="p-3 font-mono">72</td>
            </tr>
            <tr className="hover:bg-neutral-50/50">
              <td className="p-3 font-bold text-brand-text">L</td>
              <td className="p-3 font-mono">48</td>
              <td className="p-3 font-mono">110</td>
              <td className="p-3 font-mono">74</td>
            </tr>
            <tr className="hover:bg-neutral-50/50">
              <td className="p-3 font-bold text-brand-text">XL</td>
              <td className="p-3 font-mono">50</td>
              <td className="p-3 font-mono">114</td>
              <td className="p-3 font-mono">76</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  // Default is Tops
  return (
    <div className="overflow-x-auto my-3 border border-brand-border rounded-xl">
      <table className="w-full min-w-[460px] text-xs text-left border-collapse bg-white">
        <thead>
          <tr className="bg-neutral-50 border-b border-brand-border">
            <th className="p-3 font-bold text-brand-text uppercase tracking-wider">Size</th>
            <th className="p-3 font-bold text-brand-text uppercase tracking-wider">Rộng vai (cm)</th>
            <th className="p-3 font-bold text-brand-text uppercase tracking-wider">Vòng ngực (cm)</th>
            <th className="p-3 font-bold text-brand-text uppercase tracking-wider">Dài áo (cm)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border text-brand-muted font-normal">
          <tr className="hover:bg-neutral-50/50">
            <td className="p-3 font-bold text-brand-text">S</td>
            <td className="p-3 font-mono">43</td>
            <td className="p-3 font-mono">96</td>
            <td className="p-3 font-mono">67</td>
          </tr>
          <tr className="hover:bg-neutral-50/50">
            <td className="p-3 font-bold text-brand-text">M</td>
            <td className="p-3 font-mono">45</td>
            <td className="p-3 font-mono">100</td>
            <td className="p-3 font-mono">69</td>
          </tr>
          <tr className="hover:bg-neutral-50/50">
            <td className="p-3 font-bold text-brand-text">L</td>
            <td className="p-3 font-mono">47</td>
            <td className="p-3 font-mono">104</td>
            <td className="p-3 font-mono">71</td>
          </tr>
          <tr className="hover:bg-neutral-50/50">
            <td className="p-3 font-bold text-brand-text">XL</td>
            <td className="p-3 font-mono">49</td>
            <td className="p-3 font-mono">108</td>
            <td className="p-3 font-mono">73</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
