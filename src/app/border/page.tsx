import type { Metadata } from "next";
import BorderClient from "./border-client";

export const metadata: Metadata = {
  title: "Free Image Border & Rounded Corners Tool — Add Frames Online",
  description:
    "Add borders, rounded corners, and drop shadows to any image for free. Browser-based, no upload to servers, no sign-up. Download as PNG.",
  alternates: { canonical: "https://image-backgroundremover.com/border/" },
  openGraph: {
    title: "Free Image Border & Rounded Corners Tool",
    description: "Add custom borders, rounded corners, and shadows to images. Free, in-browser, private.",
    url: "https://image-backgroundremover.com/border/",
  },
};

export default function BorderPage() {
  return <BorderClient />;
}
