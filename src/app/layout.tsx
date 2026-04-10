import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://image-backgroundremover.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Image Background Remover — Free AI Tool | Remove BG Instantly",
    template: "%s | BG Remover",
  },
  description:
    "Remove image backgrounds instantly with AI. Free, fast, no sign-up required. Perfect for e-commerce, ID photos, and design assets. Download transparent PNG in seconds.",
  keywords: [
    "background remover",
    "remove background",
    "image background remover",
    "remove bg",
    "transparent background",
    "AI background removal",
    "free background remover",
    "remove background from photo",
    "background eraser",
    "photo background remover",
    "remove image background online",
  ],
  authors: [{ name: "BG Remover" }],
  creator: "BG Remover",
  publisher: "BG Remover",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "BG Remover",
    title: "Image Background Remover — Free AI Tool",
    description:
      "Remove image backgrounds instantly with AI. Free, fast, no sign-up required. Download transparent PNG in seconds.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "BG Remover – AI Background Removal Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Background Remover — Free AI Tool",
    description:
      "Remove image backgrounds instantly with AI. Free, fast, no sign-up required.",
    images: ["/og-image.svg"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-gray-50 min-h-screen antialiased">{children}</body>
    </html>
  );
}
