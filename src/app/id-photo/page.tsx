import type { Metadata } from "next";
import IdPhotoClient from "./id-photo-client";

export const metadata: Metadata = {
  title: "ID Photo Maker — Create Passport & Visa Photos Online",
  description:
    "Create professional ID photos online for free. Choose from standard sizes (2×2 inch, 35×45mm, and more) with white, light blue, or cream backgrounds. Instant download.",
  keywords: [
    "id photo maker",
    "passport photo",
    "visa photo",
    "id photo online",
    "create passport photo",
    "id photo background",
    "passport photo maker free",
    "id photo size",
  ],
  openGraph: {
    title: "ID Photo Maker — Passport & Visa Photos Online",
    description:
      "Create professional ID photos online. Choose size and background color. Instant AI background removal.",
    type: "website",
    url: "https://image-backgroundremover.com/id-photo",
  },
  alternates: {
    canonical: "https://image-backgroundremover.com/id-photo",
  },
};

export default function IdPhotoPage() {
  return <IdPhotoClient />;
}
