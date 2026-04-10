import HomeClient from "./home-client";

// ── Structured Data ───────────────────────────────────────────────────────────
const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "BG Remover – AI Background Removal Tool",
  url: "https://image-backgroundremover.com",
  description:
    "Remove image backgrounds instantly with AI. Free, fast, no sign-up required. Perfect for e-commerce, ID photos, and design assets.",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free tier available. Paid plans start at $9.9/month.",
  },
  featureList: [
    "AI-powered background removal",
    "Supports JPG, PNG, WEBP",
    "Download transparent PNG",
    "No software installation required",
    "Free tier available",
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is it really free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Guests get 1 free try per month. Sign up for a free account to get 5 credits every month — no credit card required.",
      },
    },
    {
      "@type": "Question",
      name: "How many images can I process?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Guests: 1/month. Free accounts: 5/month. Pro: 30/month. Business: 100/month. You can also buy credit packs that never expire.",
      },
    },
    {
      "@type": "Question",
      name: "Are my images stored on your servers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Images are processed in memory and immediately discarded. We never store your original or result images.",
      },
    },
    {
      "@type": "Question",
      name: "What image formats are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JPG, PNG, and WEBP up to 20MB. Results are always delivered as transparent PNG.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is the background removal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We use industry-leading AI that handles hair, fur, complex edges, and transparent objects with high accuracy.",
      },
    },
    {
      "@type": "Question",
      name: "What are credit packs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "One-time purchases of extra credits that never expire. They stack with your monthly plan and are used automatically when your monthly credits run out.",
      },
    },
  ],
};

export const metadata = {
  alternates: {
    canonical: "https://image-backgroundremover.com/",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeClient />
    </>
  );
}
