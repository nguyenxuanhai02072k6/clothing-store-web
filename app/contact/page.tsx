import { Metadata } from 'next';
import ContactClient from '@/components/contact/ContactClient';

export const metadata: Metadata = {
  title: 'Liên Hệ & Hệ Thống Showroom | NOVYN WEAR',
  description: 'Liên hệ với thương hiệu thời trang thiết kế NOVYN WEAR. Hỗ trợ đơn hàng, tư vấn phong cách, khiếu nại dịch vụ và thông tin showroom tại Hà Nội và TP.HCM.',
  openGraph: {
    title: 'Liên Hệ & Hệ Thống Showroom | NOVYN WEAR',
    description: 'Liên hệ với đội ngũ CSKH của NOVYN WEAR. Hỗ trợ đơn hàng, tư vấn phong cách, khiếu nại dịch vụ.',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
