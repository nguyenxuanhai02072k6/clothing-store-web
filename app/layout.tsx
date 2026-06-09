import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastProvider } from '../context/ToastContext';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { ChatProvider } from '../context/ChatContext';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Chatbot } from '../components/common/Chatbot';
import { LuckyWheel } from '../components/common/LuckyWheel';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://novynwear.com'),
  title: 'NOVYN.WEAR | Cửa Hàng Thời Trang Quần Áo Thiết Kế Cao Cấp',
  description: 'Khám phá bộ sưu tập quần áo thời trang tối giản, hiện đại và tinh tế tại NOVYN.WEAR. Trải nghiệm mua sắm tuyệt vời, giao hàng nhanh chóng.',
  keywords: 'thời trang, novyn wear, quần áo, áo thun, quần tây, đầm lụa, blazer, tối giản, e-commerce, thiết kế hiện đại, quiet luxury',
  authors: [{ name: 'NOVYN.WEAR Team' }],
  openGraph: {
    title: 'NOVYN.WEAR | Cửa Hàng Thời Trang Quần Áo Thiết Kế Cao Cấp',
    description: 'Khám phá bộ sưu tập quần áo thời trang tối giản, hiện đại và tinh tế tại NOVYN.WEAR. Trải nghiệm mua sắm tuyệt vời, giao hàng nhanh chóng.',
    url: 'https://novynwear.com',
    siteName: 'NOVYN.WEAR',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NOVYN.WEAR - Quiet Luxury Fashion Collection',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NOVYN.WEAR | Cửa Hàng Thời Trang Quần Áo Thiết Kế Cao Cấp',
    description: 'Khám phá bộ sưu tập quần áo thời trang tối giản, hiện đại và tinh tế tại NOVYN.WEAR. Trải nghiệm mua sắm tuyệt vời, giao hàng nhanh chóng.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`h-full antialiased ${inter.variable}`}>
      <body className="min-h-full flex flex-col font-sans bg-brand-bg text-brand-text bg-grid-lines relative">
        
        {/* Elegant Ambient Glowing Mesh Orbs (Background Art) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[-15%] w-[40rem] h-[40rem] rounded-full bg-[#5F7065]/10 filter blur-[120px] animate-float-slow" />
          <div className="absolute top-[45%] right-[-15%] w-[45rem] h-[45rem] rounded-full bg-[#9F523F]/8 filter blur-[160px] animate-spin-slow" />
          <div className="absolute bottom-[5%] left-[5%] w-[32rem] h-[32rem] rounded-full bg-[#EAE3D8]/40 filter blur-[110px] animate-pulse-slow" />
        </div>

        <ToastProvider>
          <AuthProvider>
            <ChatProvider>
              <CartProvider>
                {/* Header Sticky Navbar */}
                <Header />
                
                {/* Floating Chatbot Assistant */}
                <Chatbot />

                {/* Floating Lucky Spin Wheel */}
                <LuckyWheel />
                
                {/* Main Content Area */}
                <main className="flex-grow relative z-10">
                  {children}
                </main>
                
                {/* Footer Area */}
                <Footer />
              </CartProvider>
            </ChatProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
