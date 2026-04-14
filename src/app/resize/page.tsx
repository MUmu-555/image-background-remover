import type { Metadata } from "next";
import ResizeClient from "./resize-client";

export const metadata: Metadata = {
  title: "Image Resizer — Resize Images Online Free",
  description:
    "Resize images to any dimension online for free. Choose custom sizes or presets for Instagram, Twitter, LinkedIn. Fast & private — processed in your browser.",
  keywords: ["image resizer", "resize image", "resize photo online", "image resize tool", "crop image", "image dimensions"],
  alternates: { canonical: "https://image-backgroundremover.com/resize" },
  openGraph: {
    title: "Image Resizer — Resize Photos Online Free",
    description: "Resize images to any dimension instantly. Free & private.",
    url: "https://image-backgroundremover.com/resize",
  },
};

export default function ResizePage() {
  return <ResizeClient />;
}
