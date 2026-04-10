import PricingClient from "./pricing-client";

const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Pricing – BG Remover",
  url: "https://image-backgroundremover.com/pricing/",
  description:
    "Simple, transparent pricing for AI background removal. Free tier available. Pro and Business plans with monthly and annual billing.",
  mainEntity: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description: "5 images per month, no credit card required.",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "9.9",
      priceCurrency: "USD",
      description: "30 images per month, billed monthly.",
    },
    {
      "@type": "Offer",
      name: "Business",
      price: "34.9",
      priceCurrency: "USD",
      description: "100 images per month, billed monthly.",
    },
  ],
};

export const metadata = {
  title: "Pricing – BG Remover",
  description:
    "Simple pricing for AI background removal. Free tier with 5 images/month. Pro ($9.9/mo) and Business ($34.9/mo) plans. Credit packs available.",
  alternates: {
    canonical: "https://image-backgroundremover.com/pricing/",
  },
  openGraph: {
    title: "Pricing – BG Remover",
    description:
      "Simple pricing for AI background removal. Free tier with 5 images/month. Pro and Business plans available.",
    url: "https://image-backgroundremover.com/pricing/",
  },
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      <PricingClient />
    </>
  );
}
