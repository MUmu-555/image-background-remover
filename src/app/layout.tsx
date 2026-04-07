import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Background Remover - Free AI Image Background Removal",
  description: "Remove image backgrounds instantly with AI. Free, fast, and easy to use.",
  keywords: "background remover, remove background, image background remover, AI background removal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
