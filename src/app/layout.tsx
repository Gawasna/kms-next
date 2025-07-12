import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'antd/dist/reset.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import AntdConfigProvider from "../components/common/AntdConfigProvider"; 
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import BackToTop from "@/components/ui/BackToTop";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | KIMS Next App',
    default: 'KIMS Next App - Hệ thống quản lý tài liệu',
  },
  description: 'Hệ thống quản lý tài liệu thông minh (Knowledge & Information Management System) giúp tổ chức, lưu trữ và truy xuất tài liệu hiệu quả.',
  keywords: ['KIMS', 'quản lý tài liệu', 'document management', 'hệ thống thông tin', 'Next.js'],
  openGraph: {
    title: 'KIMS Next App - Hệ thống quản lý tài liệu',
    description: 'Hệ thống quản lý tài liệu thông minh giúp tổ chức, lưu trữ và truy xuất tài liệu hiệu quả.',
    url: 'https://www.kims-example.com',
    siteName: 'KIMS Next App',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KIMS Document Management System',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KIMS Next App - Hệ thống quản lý tài liệu',
    description: 'Hệ thống quản lý tài liệu thông minh giúp tổ chức, lưu trữ và truy xuất tài liệu hiệu quả.',
    creator: '@kims_dev',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.kims-example.com',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/shortcut-icon.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <AntdRegistry>
          <AntdConfigProvider>
            {/* Đây là phần cấu trúc layout toàn cục */}
            <div className="app-container"> {/* Container chính để quản lý layout (ví dụ sticky footer) */}
              <Header />
              <main className="content-wrapper"> {/* Phần này sẽ chứa nội dung của từng trang */}
                {children}
              </main>
              <Footer />
              <BackToTop /> {/* Nút quay lại đầu trang */}  
            </div>
          </AntdConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}