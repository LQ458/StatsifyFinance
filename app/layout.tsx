import { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./Providers";
import { injectSpeedInsights } from "@vercel/speed-insights";
import { Analytics } from "@vercel/analytics/react";

injectSpeedInsights();

export const metadata: Metadata = {
  title: "Statsify Finance",
  description: "Statsify Finance Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Analytics />
      <AuthProvider>
        <body className="m-0">
          <Suspense fallback={null}>{children}</Suspense>
        </body>
      </AuthProvider>
    </html>
  );
}
