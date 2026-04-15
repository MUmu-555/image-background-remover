import type { Metadata } from "next";
import StitchClient from "./stitch-client";

export const metadata: Metadata = {
  title: "Free Image Stitcher — Merge Photos Side by Side or in a Grid",
  description:
    "Combine multiple images side by side, stacked, or in a grid for free. Browser-based, no upload to servers, no sign-up needed. Download as PNG.",
  alternates: { canonical: "https://image-backgroundremover.com/stitch/" },
  openGraph: {
    title: "Free Image Stitcher — Merge Photos Side by Side or in a Grid",
    description: "Combine photos in a horizontal, vertical, or grid layout. Free, in-browser, private.",
    url: "https://image-backgroundremover.com/stitch/",
  },
};

export default function StitchPage() {
  return <StitchClient />;
}
