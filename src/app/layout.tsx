import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration";
import { OfflineIndicator } from "@/components/shared/OfflineIndicator";
import "./globals.css";

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const pretendard = localFont({
  src: [
    {
      path: "../fonts/PretendardVariable.woff2",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "Roboto",
    "Helvetica Neue",
    "Segoe UI",
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    "Malgun Gothic",
    "sans-serif",
  ],
});

export const metadata: Metadata = {
  title: {
    default: "경조사 관리 대장",
    template: "%s | 경조사 관리 대장",
  },
  description: "경조사 금전을 깔끔하게 관리하세요. 인원 관리, 금액 기록, 통계 분석까지 한 번에.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "경조사 관리 대장",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5e6e0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${notoSerifKr.variable} ${pretendard.variable} font-sans antialiased`}
        style={{ fontFamily: "var(--font-pretendard), sans-serif" }}
      >
        {children}
        <Toaster richColors position="top-center" />
        <ServiceWorkerRegistration />
        <OfflineIndicator />
      </body>
    </html>
  );
}
