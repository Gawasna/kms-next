// src/app/layout.tsx (sau khi xóa HydrationWrapper)

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'antd/dist/reset.css';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import AntdConfigProvider from "../components/common/AntdConfigProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KIMS Next App",
  description: "KIMS Next.js Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <AntdRegistry>
          <AntdConfigProvider>
            {children}
          </AntdConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}