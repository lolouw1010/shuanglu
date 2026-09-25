import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "双陆 Shuanglu",
  description: "A playable Shuanglu web prototype.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
