import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { AuthProvider } from "./Providers";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Statsify Finance",
  description: "Your Path To Financial Clarity",
};

// 创建 Stagewise 客户端组件
const StagewiseClient = dynamic(() => import("./stagewise-client"), {
  ssr: false,
  loading: () => null,
});

export default async function RootLayout({
  children,
  params: { locale = "zh" },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    messages = (await import(`../messages/zh.json`)).default;
    console.warn(`Language file for ${locale} not found, falling back to zh`);
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>{children}</AuthProvider>
        </NextIntlClientProvider>
        {/* Stagewise 工具栏 - 仅在开发模式下显示 */}
        {process.env.NODE_ENV === "development" && <StagewiseClient />}
      </body>
    </html>
  );
}
