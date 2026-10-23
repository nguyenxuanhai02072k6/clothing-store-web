import { LookbookItem } from './lookbookTypes';

export const LOOKBOOK_COLLECTIONS: LookbookItem[] = [
  {
    id: 'lookbook-1',
    title: "Linen Ease",
    subtitle: "SỢI TỰ NHIÊN & PHÓNG KHOÁNG",
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
    description: 'Dệt nên từ sợi linen tự nhiên nhập khẩu siêu nhẹ và mát lành. Áo sơ mi linen cổ trụ mộc mạc đi kèm quần short dây rút tạo cảm giác tự do, phóng khoáng cho những chuyến đi mùa hè đầy trải nghiệm.',
    hotspots: [
      {
        id: 'hs-1-1',
        productId: 'prod-03', // Sơ mi linen
        top: '42%',
        left: '46%',
        tooltipPosition: 'right'
      },
      {
        id: 'hs-1-2',
        productId: 'prod-06', // Quần short linen
        top: '65%',
        left: '55%',
        tooltipPosition: 'left'
      }
    ]
  },
  {
    id: 'lookbook-2',
    title: "Urban Softness",
    subtitle: "PHONG THÁI ĐƯỜNG PHỐ TỰ DO",
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&auto=format&fit=crop&q=80',
    description: 'Vẻ đẹp năng động và cá tính của nhịp sống hiện đại được thể hiện qua chiếc áo khoác Bomber Satin óng nhẹ dập nổi khóa đồng sang trọng kết hợp cùng Quần jean straight-fit cổ điển bụi bặm.',
    hotspots: [
      {
        id: 'hs-2-1',
        productId: 'prod-33', // Bomber satin
        top: '38%',
        left: '48%',
        tooltipPosition: 'right'
      },
      {
        id: 'hs-2-2',
        productId: 'prod-31', // Jeans straight-fit
        top: '70%',
        left: '52%',
        tooltipPosition: 'left'
      }
    ]
  },
  {
    id: 'lookbook-3',
    title: "Everyday Neutral",
    subtitle: "ĐƯỜNG CẮT VÀ SỰ TĨNH LẶNG CỦA PHOM DÁNG",
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80',
    description: 'Sự kết hợp hoàn mỹ của áo khoác Blazer Relaxed Fit hiện đại phóng khoáng và chiếc Quần tây ống suông xếp ly Pleated Trousers kéo dài chân tôn dáng. Biểu trưng cho phong thái thanh lịch và tối giản.',
    hotspots: [
      {
        id: 'hs-3-1',
        productId: 'prod-02', // Blazer
        top: '40%',
        left: '49%',
        tooltipPosition: 'right'
      },
      {
        id: 'hs-3-2',
        productId: 'prod-05', // Quần tây
        top: '72%',
        left: '53%',
        tooltipPosition: 'left'
      }
    ]
  },
  {
    id: 'lookbook-4',
    title: "Light Motion",
    subtitle: "BẢN GIAO HƯỞNG GIỮA LỤA VÀ DẠ MĂNG TÔ",
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&auto=format&fit=crop&q=80',
    description: 'Một sự kết hợp đầy nghệ thuật giữa chất liệu lụa satin bias-cut óng ả và phom dáng đứng măng tô dạ len lông cừu dáng dài kinh điển. Sự tương phản mang lại chiều sâu độc đáo và cảm giác chuyển động nhẹ nhàng.',
    hotspots: [
      {
        id: 'hs-4-1',
        productId: 'prod-29', // Đầm lụa
        top: '60%',
        left: '46%',
        tooltipPosition: 'right'
      },
      {
        id: 'hs-4-2',
        productId: 'prod-30', // Trench coat dạ
        top: '32%',
        left: '53%',
        tooltipPosition: 'left'
      }
    ]
  }
];
