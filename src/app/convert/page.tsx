import type { Metadata } from "next";
import ConvertClient from "./convert-client";

export const metadata: Metadata = {
  title: "Image Format Converter — Convert PNG, JPG, WebP Online Free",
  description:
    "Convert images between PNG, JPG, and WebP formats instantly in your browser. Free, fast, no upload needed — all processing is done locally.",
  keywords: ["image converter", "png to jpg", "jpg to png", "webp converter", "convert image format", "image format converter online free"],
  alternates: { canonical: "https://image-backgroundremover.com/convert" },
  openGraph: {
    title: "Image Format Converter — PNG, JPG, WebP",
    description: "Convert images between formats instantly. Free & private.",
    url: "https://image-backgroundremover.com/convert",
  },
};

export default function ConvertPage() {
  return <ConvertClient />;
}
