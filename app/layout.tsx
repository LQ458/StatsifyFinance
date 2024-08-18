import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./Providers";

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
      <AuthProvider>
        <body className="m-0">{children}</body>
      </AuthProvider>
    </html>
  );
}
