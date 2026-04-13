import Link from "next/link";

export const metadata = {
  title: "How to Remove Image Backgrounds for E-Commerce Products | BG Remover",
  description:
    "Clean product photos sell more. Learn how to quickly remove backgrounds from product images and export white or transparent PNG files ready for Amazon, Shopify, and more.",
  alternates: { canonical: "https://image-backgroundremover.com/blog/how-to-remove-background-ecommerce/" },
  openGraph: {
    title: "How to Remove Image Backgrounds for E-Commerce Products",
    description: "Learn how to quickly remove backgrounds from product images for Amazon, Shopify, and more.",
    url: "https://image-backgroundremover.com/blog/how-to-remove-background-ecommerce/",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Remove Image Backgrounds for E-Commerce Products",
  description: "A step-by-step guide to removing backgrounds from product photos for e-commerce platforms.",
  step: [
    { "@type": "HowToStep", name: "Upload your product photo", text: "Go to image-backgroundremover.com and upload your product image (JPG, PNG, or WEBP, up to 20MB)." },
    { "@type": "HowToStep", name: "AI removes the background", text: "Our AI instantly detects and removes the background, leaving only your product." },
    { "@type": "HowToStep", name: "Choose your background color", text: "Select white for Amazon/Shopify requirements, or keep it transparent for more flexibility." },
    { "@type": "HowToStep", name: "Download your image", text: "Download as PNG with transparent background or with a white background — ready to upload to any marketplace." },
  ],
};

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">BG Remover</span>
          </Link>
          <nav className="ml-6 hidden sm:flex items-center gap-5 text-sm text-gray-500">
            <Link href="/pricing" className="hover:text-gray-800 transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-gray-800 transition-colors">Blog</Link>
          </nav>
          <div className="ml-auto">
            <Link href="/blog" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              All articles
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-14">
        {/* Meta */}
        <div className="mb-8">
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">E-Commerce</span>
          <p className="text-xs text-gray-400 mt-3">April 10, 2026 · 5 min read</p>
          <h1 className="text-4xl font-extrabold text-gray-900 mt-3 leading-tight">
            How to Remove Image Backgrounds for E-Commerce Products
          </h1>
          <p className="text-xl text-gray-500 mt-4 leading-relaxed">
            Clean product photos sell more. Here&apos;s how to get professional white-background or transparent-background product images in seconds — for free.
          </p>
        </div>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Why Background Removal Matters for E-Commerce</h2>
            <p>
              Most major marketplaces — Amazon, Shopify, eBay, Etsy — require or strongly recommend product images with a <strong>pure white background</strong>. Studies show that clean product photos increase click-through rates by up to 40% compared to cluttered backgrounds.
            </p>
            <p className="mt-3">
              Hiring a professional photographer or editor can cost $5–$20 per image. With AI background removal, you can do it yourself in seconds for free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Step-by-Step: Remove Background from Product Photos</h2>
            <ol className="list-decimal list-inside space-y-4 mt-3">
              <li>
                <strong>Take or select your product photo.</strong> Use good lighting if possible — a well-lit product photo gives the AI more detail to work with. Natural light or a lightbox setup works great.
              </li>
              <li>
                <strong>Upload to BG Remover.</strong> Go to <Link href="/" className="text-indigo-600 hover:underline">image-backgroundremover.com</Link> and drag &amp; drop your image or click "Choose Image". Supports JPG, PNG, WEBP up to 20MB.
              </li>
              <li>
                <strong>Let AI do the work.</strong> Our AI (powered by remove.bg) will automatically detect your product and remove everything else. It&apos;s especially good with clean edges, products on surfaces, and items with complex shapes.
              </li>
              <li>
                <strong>Choose your background.</strong> For Amazon or most marketplaces, select White background. For Shopify or your own store, transparent PNG gives you more flexibility.
              </li>
              <li>
                <strong>Download.</strong> Click Download PNG. Your image is ready to upload to any marketplace.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Platform Requirements</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden mt-3">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Platform</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Background</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Format</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {[
                    ["Amazon", "Pure white (#FFFFFF)", "JPEG or PNG"],
                    ["Shopify", "White or transparent", "PNG recommended"],
                    ["eBay", "White recommended", "JPEG or PNG"],
                    ["Etsy", "Flexible, lifestyle OK", "JPEG or PNG"],
                    ["Walmart", "Pure white", "JPEG"],
                  ].map(([p, b, f]) => (
                    <tr key={p}>
                      <td className="px-4 py-3 font-medium text-gray-900">{p}</td>
                      <td className="px-4 py-3 text-gray-500">{b}</td>
                      <td className="px-4 py-3 text-gray-500">{f}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Batch Processing for High Volume</h2>
            <p>
              Have a lot of product photos? BG Remover supports <strong>batch upload</strong> — drag multiple images at once, and they&apos;ll all be processed sequentially. When done, download them all as a single ZIP file.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Tips for Better Results</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Shoot on a contrasting background (the AI works best with contrast)</li>
              <li>Avoid highly transparent or reflective products (glass, clear plastic)</li>
              <li>Use the Slider view to verify edges before downloading</li>
              <li>If edges look rough, try the white background option — it often looks cleaner</li>
            </ul>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-indigo-50 rounded-2xl p-8 text-center border border-indigo-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Try it now — it&apos;s free</h3>
          <p className="text-gray-500 mb-6">No sign-up required. 1 free image per month as a guest, or 5/month with a free account.</p>
          <Link
            href="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-sm"
          >
            Remove Background Now →
          </Link>
        </div>

        {/* More articles */}
        <div className="mt-12">
          <h3 className="font-bold text-gray-900 mb-4">More from the blog</h3>
          <div className="space-y-3">
            <Link href="/blog/remove-background-id-photo/" className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 transition-colors text-sm font-medium text-gray-700 hover:text-indigo-600">
              How to Remove Background from ID Photos →
            </Link>
            <Link href="/blog/free-background-remover-tips/" className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 transition-colors text-sm font-medium text-gray-700 hover:text-indigo-600">
              5 Tips to Get the Best Results from an AI Background Remover →
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 px-4 mt-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} BG Remover</span>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-gray-600">Home</Link>
            <Link href="/blog" className="hover:text-gray-600">Blog</Link>
            <Link href="/pricing" className="hover:text-gray-600">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
