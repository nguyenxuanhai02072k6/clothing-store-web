import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liên Hệ & Hệ Thống Showroom | NOVYN WEAR',
  description: 'Liên hệ với thương hiệu thời trang thiết kế NOVYN WEAR. Hỗ trợ đơn hàng, tư vấn phong cách, khiếu nại dịch vụ và thông tin showroom tại Hà Nội và TP.HCM.',
  openGraph: {
    title: 'Liên Hệ & Hệ Thống Showroom | NOVYN WEAR',
    description: 'Liên hệ với đội ngũ CSKH của NOVYN WEAR. Hỗ trợ đơn hàng, tư vấn phong cách, khiếu nại dịch vụ.',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
