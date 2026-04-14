import type { Metadata } from "next";
import WatermarkClient from "./watermark-client";

export const metadata: Metadata = {
  title: "Image Watermark — Add Watermark to Photos Online Free",
  description:
    "Add text or image watermarks to photos online for free. Customize position, size, opacity, and font. Protect your images instantly in your browser.",
  keywords: ["add watermark", "image watermark", "watermark photo", "text watermark", "watermark online free", "photo watermark"],
  alternates: { canonical: "https://image-backgroundremover.com/watermark" },
  openGraph: {
    title: "Image Watermark — Add Text Watermark Online Free",
    description: "Add customizable text watermarks to your images. Free & private.",
    url: "https://image-backgroundremover.com/watermark",
  },
};

export default function WatermarkPage() {
  return <WatermarkClient />;
}
