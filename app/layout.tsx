import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "./Providers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "@/libs/get-messages";

export const metadata: Metadata = {
  title: "Statsify Finance",
  description: "Statsify Finance Website",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  // 默认使用中文
  const locale = params?.locale || "zh";
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <body className="m-0">
              <Suspense fallback={null}>{children}</Suspense>
            </body>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
