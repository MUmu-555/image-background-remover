import type { Metadata } from "next";
import ReplaceBgClient from "./replace-bg-client";

export const metadata: Metadata = {
  title: "Background Replacer — Replace Image Background Online Free",
  description:
    "Replace image backgrounds instantly online. Upload your photo, remove the background with AI, then add a custom background image or color. Free & private.",
  keywords: ["background replacer", "replace background", "change background", "custom background", "swap background online", "background changer"],
  alternates: { canonical: "https://image-backgroundremover.com/replace-bg" },
  openGraph: {
    title: "Background Replacer — Custom Background Online Free",
    description: "Remove background and replace with any image or color. AI-powered, free.",
    url: "https://image-backgroundremover.com/replace-bg",
  },
};

export default function ReplaceBgPage() {
  return <ReplaceBgClient />;
}
