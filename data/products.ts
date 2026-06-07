import { Product } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  // 1. TOPS
  {
    id: 'prod-01',
    name: 'Áo Thun Premium Cotton Minimalist',
    slug: 'ao-thun-premium-cotton-minimalist',
    category: 'Tops',
    price: 350000,
    oldPrice: 450000,
    description: 'Áo thun tối giản được dệt từ 100% sợi Cotton Supima cao cấp, mang lại độ mềm mại vượt trội, co giãn tốt và giữ form hoàn hảo sau nhiều lần giặt. Thiết kế basic phù hợp cho mọi dịp hàng ngày.',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviews: 124,
    colors: [
      { name: 'Trắng', hex: '#FFFFFF' },
      { name: 'Đen', hex: '#111827' },
      { name: 'Xám Melange', hex: '#9CA3AF' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 50,
    badges: ['Sale', 'Best Seller']
  },
  {
    id: 'prod-02',
    name: 'Áo Khoác Blazer Relaxed Fit',
    slug: 'ao-khoac-blazer-relaxed-fit',
    category: 'Tops',
    price: 950000,
    oldPrice: 1200000,
    description: 'Chiếc áo khoác Blazer phom dáng rộng relaxed fit hiện đại, chất liệu tuyết mưa cao cấp đứng dáng. Phù hợp phối đồ smart-casual đi làm, dạo phố hoặc đi tiệc nhẹ.',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviews: 86,
    colors: [
      { name: 'Beige', hex: '#D7C49E' },
      { name: 'Đen', hex: '#111827' },
      { name: 'Xanh Navy', hex: '#1E3A8A' }
    ],
    sizes: ['M', 'L', 'XL'],
    stock: 25,
    badges: ['New', 'Best Seller'],
    has3D: true,
    modelType: 'dress'
  },
  {
    id: 'prod-03',
    name: 'Áo Sơ Mi Linen Cao Cấp',
    slug: 'ao-so-mi-linen-cao-cap',
    category: 'Tops',
    price: 480000,
    description: 'Dệt từ 100% sợi lanh (linen) tự nhiên nhập khẩu, nhẹ tênh và cực kỳ thoáng khí. Bề mặt vải có kết cấu mộc mạc đặc trưng tạo nét phóng khoáng đầy phong cách cho những ngày hè nắng nóng.',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1621072156002-e2fcc103e86e?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.6,
    reviews: 73,
    colors: [
      { name: 'Xanh Sage', hex: '#87A987' },
      { name: 'Trắng', hex: '#FFFFFF' },
      { name: 'Cát Lợt', hex: '#EAE0D5' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 40,
    badges: ['New'],
    has3D: true,
    modelType: 'dress'
  },
  {
    id: 'prod-04',
    name: 'Áo Len Dệt Kim Soft-Touch',
    slug: 'ao-len-det-kim-soft-touch',
    category: 'Tops',
    price: 620000,
    oldPrice: 750000,
    description: 'Chất liệu len dệt kim mỏng nhẹ, bề mặt xử lý siêu mịn soft-touch cho cảm giác êm ái tối đa khi chạm vào da. Thiết kế cổ tròn tinh tế cùng các đường viền bo dệt co giãn ôm dáng nhẹ nhàng.',
    images: [
      'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviews: 42,
    colors: [
      { name: 'Nâu Mocha', hex: '#6F4E37' },
      { name: 'Xám Charcoal', hex: '#374151' }
    ],
    sizes: ['S', 'M', 'L'],
    stock: 15,
    badges: ['Sale'],
    has3D: true,
    modelType: 'dress'
  },
  // 1.2 NEW TOPS (Step 10 Catalog Expansion)
  {
    id: 'prod-17',
    name: 'Áo Sơ Mi Linen Cổ Tàu',
    slug: 'ao-so-mi-linen-co-tau',
    category: 'Tops',
    price: 460000,
    description: 'Áo sơ mi linen cổ tàu (grandad collar) phóng khoáng, dệt từ sợi lanh tự nhiên thô mộc. Thiết kế tối giản bỏ bớt chi tiết cổ bẻ gò bó, mang lại nét thanh lịch trẻ trung tự nhiên cho phái mạnh.',
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviews: 58,
    colors: [
      { name: 'Trắng Kem', hex: '#FFFFFF' },
      { name: 'Xanh Nhạt', hex: '#A5C9CA' },
      { name: 'Nâu Cát', hex: '#E6D7C3' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 35,
    badges: ['New']
  },
  {
    id: 'prod-18',
    name: 'Áo Polo Sợi Cotton Dệt Kim',
    slug: 'ao-polo-soi-cotton-det-kim',
    category: 'Tops',
    price: 540000,
    oldPrice: 650000,
    description: 'Kết hợp hoàn hảo giữa nét lịch lãm của áo polo cổ bẻ và độ mềm mại của sợi cotton dệt kim thông thoáng. Bề mặt mắt dệt tinh xảo tạo cảm giác đứng dáng nhưng vô cùng co giãn và thoáng mát.',
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviews: 69,
    colors: [
      { name: 'Đen Tuyển', hex: '#111827' },
      { name: 'Kem Beige', hex: '#F3EFE0' },
      { name: 'Xanh Olive', hex: '#424632' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 40,
    badges: ['Sale']
  },
  {
    id: 'prod-19',
    name: 'Áo Khoác Blazer Linen Cao Cấp',
    slug: 'ao-khoac-blazer-linen-cao-cap',
    category: 'Tops',
    price: 1150000,
    oldPrice: 1450000,
    description: 'Áo khoác blazer may đo tinh xảo từ chất liệu 100% lanh dày dặn đứng phom nhưng thoáng mát. Phù hợp cho những buổi tiệc nhẹ ngoài trời hoặc diện casual sành điệu công sở hàng ngày.',
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviews: 32,
    colors: [
      { name: 'Beige Cát', hex: '#E4D5C3' },
      { name: 'Xanh Navy', hex: '#1C2E4A' }
    ],
    sizes: ['M', 'L', 'XL'],
    stock: 18,
    badges: ['New', 'Best Seller']
  },

  // 2. BOTTOMS
  {
    id: 'prod-05',
    name: 'Quần Tây Ống Suông Pleated Trousers',
    slug: 'quan-tay-ong-suong-pleated-trousers',
    category: 'Bottoms',
    price: 580000,
    description: 'Thiết kế xếp ly sang trọng với phom ống suông rộng thời thượng tạo hiệu ứng kéo dài chân. Chất liệu vải chéo cao cấp không nhăn, bay dáng và thoáng mát.',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviews: 98,
    colors: [
      { name: 'Xám Nhạt', hex: '#D1D5DB' },
      { name: 'Đen', hex: '#111827' },
      { name: 'Xanh Olive', hex: '#3B533E' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 30,
    badges: ['Best Seller']
  },
  {
    id: 'prod-06',
    name: 'Quần Short Linen Drawstring',
    slug: 'quan-short-linen-drawstring',
    category: 'Bottoms',
    price: 320000,
    oldPrice: 420000,
    description: 'Quần short năng động dệt từ chất liệu linen pha cotton mát lạnh, đai quần chun phối dây rút tiện lợi. Lựa chọn tuyệt vời cho các chuyến du lịch biển hoặc dạo mát ngày hè.',
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.5,
    reviews: 51,
    colors: [
      { name: 'Cát', hex: '#E6D7C3' },
      { name: 'Trắng Kem', hex: '#F9F6F0' },
      { name: 'Xanh Pastel', hex: '#A5C9CA' }
    ],
    sizes: ['M', 'L', 'XL'],
    stock: 60,
    badges: ['Sale']
  },
  {
    id: 'prod-07',
    name: 'Quần Jean Raw Denim Classic',
    slug: 'quan-jean-raw-denim-classic',
    category: 'Bottoms',
    price: 720000,
    description: 'Chất liệu vải raw denim 13.5 oz cứng cáp dệt từ 100% cotton thô chưa qua xử lý hóa chất phai màu. Quần giữ phom ôm dáng thẳng đứng, tự co rút tạo nếp nhăn và bạc màu độc bản theo chuyển động của riêng bạn.',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviews: 35,
    colors: [
      { name: 'Xanh Indigo', hex: '#1E293B' }
    ],
    sizes: ['29', '30', '31', '32', '33'],
    stock: 20,
    badges: ['New']
  },
  {
    id: 'prod-08',
    name: 'Quần Jogger nỉ French Terry',
    slug: 'quan-jogger-ni-french-terry',
    category: 'Bottoms',
    price: 450000,
    oldPrice: 550000,
    description: 'Quần jogger chất liệu nỉ French Terry da cá dày dặn, đanh mịn và thấm hút tốt. Phom dáng sporty năng động kết hợp bo chun gấu quần gọn gàng, lý tưởng cho phong cách streetwear.',
    images: [
      'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviews: 67,
    colors: [
      { name: 'Xám Chì', hex: '#4B5563' },
      { name: 'Đen Jet', hex: '#0B0F19' }
    ],
    sizes: ['S', 'M', 'L'],
    stock: 45,
    badges: ['Sale']
  },
  // 2.2 NEW BOTTOMS (Step 10 Catalog Expansion)
  {
    id: 'prod-20',
    name: 'Quần Culottes Vải Linen Ống Rộng',
    slug: 'quan-culottes-vai-linen-ong-rong',
    category: 'Bottoms',
    price: 490000,
    description: 'Chiếc quần lanh ống rộng thướt tha dệt từ linen mộc cao cấp, dáng rũ tự nhiên siêu thoáng khí cho những buổi dạo mát cuối tuần. Đai quần thun phía sau cho cảm giác ôm vừa vặn.',
    images: [
      'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.6,
    reviews: 47,
    colors: [
      { name: 'Kem Sữa', hex: '#F5EBE0' },
      { name: 'Cát Lợt', hex: '#DDB892' },
      { name: 'Đen Mờ', hex: '#222525' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 30,
    badges: ['New']
  },
  {
    id: 'prod-21',
    name: 'Quần Kaki Chino Slim Fit',
    slug: 'quan-kaki-chino-slim-fit',
    category: 'Bottoms',
    price: 520000,
    oldPrice: 620000,
    description: 'Dáng quần ôm nhẹ tinh tế (slim fit) dệt từ cotton kaki pha spandex cho độ co giãn lý tưởng khi di chuyển. Thiết kế túi chéo cổ điển, đứng dáng lịch sự phù hợp mặc đi làm hàng ngày.',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviews: 74,
    colors: [
      { name: 'Kaki Be', hex: '#C5A880' },
      { name: 'Đen Jet', hex: '#111827' },
      { name: 'Rêu Phong', hex: '#4B5320' }
    ],
    sizes: ['29', '30', '31', '32', '33'],
    stock: 50,
    badges: ['Sale']
  },
  {
    id: 'prod-22',
    name: 'Quần Tây Xếp Ly Đúp Dáng Rũ',
    slug: 'quan-tay-xep-ly-dup-dang-ru',
    category: 'Bottoms',
    price: 620000,
    description: 'Thiết kế xếp ly đúp hai bên sâu tạo độ phồng rủ phóng khoáng cực kỳ thời thượng (dáng relaxed drape). Vải wool pha cao cấp dệt mỏng đứng ly tuyệt đối, bay phom dáng theo chuyển động.',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviews: 56,
    colors: [
      { name: 'Xám Charcoal', hex: '#374151' },
      { name: 'Nâu Đất', hex: '#4D3B31' },
      { name: 'Đen Tuyển', hex: '#111827' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 22,
    badges: ['Best Seller']
  },


  // 5. NEW FASHION CLOTHING REQUISITE (Step 27)
  {
    id: 'prod-29',
    name: 'Đầm Lụa Slip Dress Quiet Luxury',
    slug: 'dam-lua-slip-dress-quiet-luxury',
    category: 'Dresses',
    price: 1450000,
    oldPrice: 1850000,
    description: 'Chiếc đầm hai dây dệt từ lụa tơ tằm nguyên chất siêu mềm rủ quyến rũ. Đường may bias-cut xéo vải ôm trọn đường cong tự nhiên thanh lịch, biểu tượng hoàn hảo cho phong cách Quiet Luxury tối giản.',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 5.0,
    reviews: 48,
    colors: [
      { name: 'Đen Huyền Bí', hex: '#111827' },
      { name: 'Champagne', hex: '#E7CFA9' },
      { name: 'Đỏ Rượu Vang', hex: '#6B1D2F' }
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 20,
    badges: ['New', 'Best Seller']
  },
  {
    id: 'prod-30',
    name: 'Áo Khoác Trench Coat Dạ Dáng Dài',
    slug: 'ao-khoac-trench-coat-da-dang-dai',
    category: 'Outerwear',
    price: 2450000,
    oldPrice: 2950000,
    description: 'Áo măng tô dạ dáng dài kinh điển dệt từ len lông cừu tự nhiên giữ ấm tối đa. Thiết kế đứng dáng đai thắt eo thanh lịch, ve áo bẻ rộng cổ điển tôn phom dáng sang trọng cho những ngày lạnh.',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviews: 29,
    colors: [
      { name: 'Camel Be', hex: '#C19A6B' },
      { name: 'Đen Jet', hex: '#1C1F22' }
    ],
    sizes: ['M', 'L', 'XL'],
    stock: 12,
    badges: ['New']
  },
  {
    id: 'prod-31',
    name: 'Quần Jean Dáng Suông Straight-Fit',
    slug: 'quan-jean-dang-suong-straight-fit',
    category: 'Bottoms',
    price: 680000,
    description: 'Dáng quần bò ống suông thẳng đứng (straight-fit) cổ điển tôn dáng, dệt từ denim 12oz bền bỉ. Quy trình xử lý wash màu bạc nhẹ tạo điểm nhấn bụi bặm nhưng tinh tế cho trang phục casual hàng ngày.',
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviews: 63,
    colors: [
      { name: 'Xanh Blue Wash', hex: '#4F83A7' },
      { name: 'Xanh Đậm Navy', hex: '#213345' }
    ],
    sizes: ['29', '30', '31', '32', '33'],
    stock: 45,
    badges: ['Best Seller']
  },
  {
    id: 'prod-32',
    name: 'Áo Sơ Mi Lụa Cát Silk-Cotton',
    slug: 'ao-so-mi-lua-cat-silk-cotton',
    category: 'Tops',
    price: 790000,
    description: 'Dệt từ sự kết hợp của 40% lụa tự nhiên và 60% cotton hảo hạng. Bề mặt vải dập cát nhẹ tinh xảo óng ánh nhẹ, mang lại cảm giác mát lịm và lướt trên da cực kỳ êm ái.',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1621072156002-e2fcc103e86e?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviews: 35,
    colors: [
      { name: 'Trắng Ngọc Trai', hex: '#FDFBF7' },
      { name: 'Đen Mờ Velvet', hex: '#202124' },
      { name: 'Xanh Aqua', hex: '#A8DADC' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 25,
    badges: ['New']
  },
  {
    id: 'prod-33',
    name: 'Áo Khoác Bomber Satin Đứng Phom',
    slug: 'ao-khoac-bomber-satin-dung-phom',
    category: 'Outerwear',
    price: 1150000,
    oldPrice: 1350000,
    description: 'Áo bomber vải satin cao cấp óng nhẹ, phom dáng đứng cá tính năng động. Tích hợp bo dệt cổ tay dày dặn chống gió tốt, khóa zip đồng thau sang trọng dập nổi logo NOVYN tinh xảo.',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviews: 42,
    colors: [
      { name: 'Đen Nhám', hex: '#1C1D1F' },
      { name: 'Xanh Olive Lính', hex: '#3B443B' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 28,
    badges: ['Sale']
  },
  {
    id: 'prod-34',
    name: 'Quần Kaki Short Pleated Classic',
    slug: 'quan-kaki-short-pleated-classic',
    category: 'Bottoms',
    price: 380000,
    description: 'Thiết kế xếp ly đúp tinh tế tạo độ rộng rãi cử động đùi lý tưởng. Chất liệu cotton kaki đanh mịn giữ nếp ly chuẩn sau nhiều lần giặt giũ dã ngoại.',
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.6,
    reviews: 50,
    colors: [
      { name: 'Kaki Truyền Thống', hex: '#C5A880' },
      { name: 'Đen Carbon', hex: '#262626' }
    ],
    sizes: ['M', 'L', 'XL'],
    stock: 60,
    badges: []
  },
  {
    id: 'prod-35',
    name: 'Áo Tweed Jacket Cổ Cổ Điển',
    slug: 'ao-tweed-jacket-co-co-dien',
    category: 'Outerwear',
    price: 1850000,
    oldPrice: 2200000,
    description: 'Chiếc áo khoác dạ Tweed dệt vân họa tiết thủ công tinh xảo, cúc kim loại dập nổi sang trọng. Phom dáng lửng croptop thanh lịch tôn chiều cao, biểu tượng thời trang tiểu thư quý phái.',
    images: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviews: 31,
    colors: [
      { name: 'Trắng Sữa Kim Tuyến', hex: '#FFFDF9' },
      { name: 'Đen Phối Viền', hex: '#151719' }
    ],
    sizes: ['S', 'M', 'L'],
    stock: 15,
    badges: ['New', 'Best Seller']
  },
  {
    id: 'prod-36',
    name: 'Áo Thun Oversized Heavyweight Cotton',
    slug: 'ao-thun-oversized-heavyweight-cotton',
    category: 'Tops',
    price: 390000,
    description: 'Dệt từ 100% sợi cotton chải kỹ heavyweight 260gsm đứng dáng hoàn toàn. Phom dáng rộng drop-shoulder phóng khoáng bền bỉ, gấu cổ bo dệt co giãn tốt chống giãn qua thời gian dài.',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviews: 104,
    colors: [
      { name: 'Xám Xi Măng', hex: '#8E9094' },
      { name: 'Đen Jet Matte', hex: '#1C1C1E' },
      { name: 'Trắng Kem Bột', hex: '#FAF9F6' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 90,
    badges: ['New']
  }
];

