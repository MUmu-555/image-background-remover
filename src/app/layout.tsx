import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Image Background Remover — Free AI Tool | Remove BG Instantly",
  description:
    "Remove image backgrounds instantly with AI. Free, fast, no sign-up required. Perfect for e-commerce, ID photos, and design assets. Download transparent PNG in seconds.",
  keywords:
    "background remover, remove background, image background remover, remove bg, transparent background, AI background removal, free background remover",
  openGraph: {
    title: "Image Background Remover — Free AI Tool",
    description:
      "Remove image backgrounds instantly with AI. Free, fast, no sign-up required.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen antialiased">{children}</body>
    </html>
  );
}
