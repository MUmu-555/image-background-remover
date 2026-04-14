import type { Metadata } from "next";
import CompressClient from "./compress-client";

export const metadata: Metadata = {
  title: "Image Compressor — Reduce Image Size Online Free",
  description:
    "Compress JPG, PNG, and WebP images online for free. Reduce file size without losing quality. Fast, private — all processing done in your browser.",
  keywords: ["image compressor", "compress image", "reduce image size", "jpg compressor", "png compressor", "image size reducer"],
  alternates: { canonical: "https://image-backgroundremover.com/compress" },
  openGraph: {
    title: "Image Compressor — Reduce File Size Free",
    description: "Compress images online. Reduce file size instantly in your browser.",
    url: "https://image-backgroundremover.com/compress",
  },
};

export default function CompressPage() {
  return <CompressClient />;
}
