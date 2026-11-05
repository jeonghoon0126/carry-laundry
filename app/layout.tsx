import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import FixedCTA from "@/components/common/FixedCTA";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "캐리 (Carrie) | 스마트 세탁 & 반려견 라이프케어 피개행개",
  description: "라이프스타일 O2O 플랫폼 캐리(Carrie) 공식 웹사이트. 비대면 세탁 중개 및 반려견 동반 라이프케어 피개행개 운영사",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" async></script>
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <FixedCTA />
        </Providers>
      </body>
    </html>
  );
}
