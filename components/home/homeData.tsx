import React from 'react';
import { Leaf, Award, RefreshCw, Truck } from 'lucide-react';

export interface CategoryItem {
  name: string;
  slug: string;
  count: string;
  description: string;
  image: string;
  gridArea: string;
}

export interface BenefitItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  rating: number;
  avatar: string;
}

export const HOME_CATEGORIES: CategoryItem[] = [
  {
    name: 'Tops',
    slug: 'Tops',
    count: '9 sản phẩm',
    description: 'Áo thun Supima, sơ mi Linen nhẹ nhàng, tinh tế và cực kỳ thoáng mát.',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80',
    gridArea: 'col-span-1 md:col-span-2 row-span-1',
  },
  {
    name: 'Bottoms',
    slug: 'Bottoms',
    count: '9 sản phẩm',
    description: 'Quần tây suông xếp ly, quần shorts tự do tôn dáng và linh hoạt dạo phố.',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
    gridArea: 'col-span-1 row-span-1',
  },
  {
    name: 'Outerwear',
    slug: 'Outerwear',
    count: '3 sản phẩm',
    description: 'Blazer, bomber satin, trench coat thời thượng phom dáng relaxed.',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80',
    gridArea: 'col-span-1 md:col-span-2 row-span-1',
  },
  {
    name: 'Dresses',
    slug: 'Dresses',
    count: '1 sản phẩm',
    description: 'Đầm lụa bias-cut thướt tha, tôn trọn vẹn khí chất tự nhiên mềm mại.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80',
    gridArea: 'col-span-1 row-span-1',
  },
];

export const HOME_BENEFITS: BenefitItem[] = [
  {
    icon: <Leaf className="w-5 h-5 text-neutral-850" />,
    title: 'Chất liệu chọn lọc',
    desc: '100% sợi Linen tự nhiên, Cotton Supima hữu cơ siêu mát lành và thân thiện với làn da.',
  },
  {
    icon: <Award className="w-5 h-5 text-neutral-850" />,
    title: 'Form dáng dễ mặc',
    desc: 'Thiết kế tinh giản, relaxed-fit chuẩn dáng và mang lại nét thanh lịch, tự nhiên nhất.',
  },
  {
    icon: <RefreshCw className="w-5 h-5 text-neutral-850" />,
    title: 'Đổi trả linh hoạt',
    desc: 'Chính sách đổi size miễn phí hoặc đổi trả hoàn tiền trong vòng 7 ngày cực kỳ dễ dàng.',
  },
  {
    icon: <Truck className="w-5 h-5 text-neutral-850" />,
    title: 'Giao hàng toàn quốc',
    desc: 'Giao hàng nhanh toàn quốc, miễn phí vận chuyển cho mọi đơn hàng giá trị từ 500k.',
  },
];

export const HOME_TESTIMONIALS: TestimonialItem[] = [
  {
    quote: 'Tôi cực kỳ ấn tượng với chất liệu linen của Novyn Wear. Vải nhẹ, mặc mát và đứng dáng. Đóng gói hộp rất cao cấp, cảm giác khui hộp như nhận quà cao cấp vậy!',
    author: 'Hoàng Minh Tuấn',
    role: 'Creative Director',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
  {
    quote: 'Chiếc đầm lụa slip dress của Novyn Wear thực sự là cực phẩm. Lụa tơ tằm mềm mịn rủ tôn dáng cực kỳ quyến rũ, đường may bias-cut xéo vải tinh xảo hoàn hảo vô cùng!',
    author: 'Lê Khánh Linh',
    role: 'Fashion Blogger',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  },
  {
    quote: 'Bộ vest blazer và quần tây xếp ly của Novyn Wear mặc lên đứng phom rất thanh lịch và chuyên nghiệp. Chất vải tuyết mưa dày dặn nhưng mặc rất thoáng mát, cực kỳ ưng ý!',
    author: 'Phạm Thu Trang',
    role: 'Marketing Manager',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
];
