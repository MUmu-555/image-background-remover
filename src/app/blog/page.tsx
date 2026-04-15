import Link from "next/link";

export const metadata = {
  title: "Blog – Background Removal Tips & Tutorials | BG Remover",
  description:
    "Learn how to remove image backgrounds like a pro. Tutorials for e-commerce, ID photos, design assets, and more.",
  alternates: { canonical: "https://image-backgroundremover.com/blog/" },
  openGraph: {
    title: "Blog – Background Removal Tips & Tutorials",
    description: "Learn how to remove image backgrounds for e-commerce, ID photos, and design work.",
    url: "https://image-backgroundremover.com/blog/",
  },
};

const POSTS = [
  {
    slug: "how-to-stitch-images-online",
    title: "How to Stitch & Merge Images Online (Free, No App Needed)",
    description:
      "Combine multiple photos side by side, stacked, or in an auto grid — in seconds, right in your browser. No app download, no sign-up required.",
    date: "April 15, 2026",
    readTime: "5 min read",
    tag: "Image Tools",
    tagColor: "bg-teal-100 text-teal-700",
    icon: "🖼️",
    iconBg: "from-teal-50 to-teal-100",
  },
  {
    slug: "how-to-add-border-to-image",
    title: "How to Add a Border or Rounded Corners to Any Image (Free)",
    description:
      "Frame photos with custom borders, soften edges with corner radius, and add shadows — all in your browser. No Photoshop, no upload, 100% private.",
    date: "April 15, 2026",
    readTime: "4 min read",
    tag: "Image Tools",
    tagColor: "bg-orange-100 text-orange-700",
    icon: "🖼",
    iconBg: "from-orange-50 to-orange-100",
  },
  {
    slug: "free-photo-editing-tools-no-photoshop",
    title: "Best Free Online Tools to Edit Photos Without Photoshop (2026)",
    description:
      "A curated guide to 8 browser-based tools that replace the most common Photoshop tasks — for free, with no subscription or download required.",
    date: "April 15, 2026",
    readTime: "6 min read",
    tag: "Guides",
    tagColor: "bg-amber-100 text-amber-700",
    icon: "🛠️",
    iconBg: "from-amber-50 to-amber-100",
  },
  {
    slug: "how-to-remove-background-ecommerce",
    title: "How to Remove Image Backgrounds for E-Commerce Products",
    description:
      "Clean product photos sell more. Learn how to quickly remove backgrounds from product images and export white or transparent PNG files ready for Amazon, Shopify, and more.",
    date: "April 10, 2026",
    readTime: "5 min read",
    tag: "E-Commerce",
    tagColor: "bg-blue-100 text-blue-700",
    icon: "🛒",
    iconBg: "from-blue-50 to-blue-100",
  },
  {
    slug: "remove-background-id-photo",
    title: "How to Remove Background from ID Photos (Free & Fast)",
    description:
      "Need a white-background ID photo for a passport, visa, or job application? Here's how to do it in seconds — no Photoshop required.",
    date: "April 10, 2026",
    readTime: "4 min read",
    tag: "ID Photos",
    tagColor: "bg-green-100 text-green-700",
    icon: "🪪",
    iconBg: "from-green-50 to-green-100",
  },
  {
    slug: "free-background-remover-tips",
    title: "5 Tips to Get the Best Results from an AI Background Remover",
    description:
      "AI background removal is powerful but works best with the right inputs. Here are 5 practical tips to get cleaner, sharper cutouts every time.",
    date: "April 10, 2026",
    readTime: "4 min read",
    tag: "Tips & Tricks",
    tagColor: "bg-purple-100 text-purple-700",
    icon: "💡",
    iconBg: "from-purple-50 to-purple-100",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
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
            <Link href="/blog" className="text-indigo-600 font-semibold">Blog</Link>
          </nav>
          <div className="ml-auto">
            <Link
              href="/"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to app
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-14">
        {/* Hero */}
        <div className="mb-12 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Tutorials & Guides
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Background Removal<br className="hidden sm:block" /> Tips & Tutorials
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Practical guides to help you get perfect cutouts — for e-commerce, ID photos, design, and more.
          </p>
        </div>

        {/* Featured post (first one) */}
        <Link
          href={`/blog/${POSTS[0].slug}/`}
          className="group block bg-white rounded-3xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all overflow-hidden mb-6"
        >
          <div className={`bg-gradient-to-r ${POSTS[0].iconBg} flex items-center justify-center h-36 text-6xl`}>
            {POSTS[0].icon}
          </div>
          <div className="p-7">
            <div className="flex items-center gap-2.5 mb-3">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${POSTS[0].tagColor}`}>
                {POSTS[0].tag}
              </span>
              <span className="text-xs text-gray-400">Featured · {POSTS[0].readTime}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
              {POSTS[0].title}
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">{POSTS[0].description}</p>
            <span className="text-sm font-semibold text-indigo-600 group-hover:underline">
              Read article →
            </span>
          </div>
        </Link>

        {/* Rest of posts grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {POSTS.slice(1).map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}/`}
              className="group flex flex-col bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${post.iconBg} flex items-center justify-center h-24 text-5xl`}>
                {post.icon}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${post.tagColor}`}>
                    {post.tag}
                  </span>
                  <span className="text-xs text-gray-400">{post.readTime}</span>
                </div>
                <h2 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 leading-snug">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{post.description}</p>
                <span className="mt-4 text-xs font-semibold text-indigo-600 group-hover:underline">Read more →</span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA banner */}
        <div className="mt-14 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-8 text-center text-white">
          <h2 className="text-2xl font-extrabold mb-2">Ready to remove backgrounds?</h2>
          <p className="text-indigo-200 mb-6">Free to start. No sign-up required for your first image.</p>
          <Link
            href="/"
            className="inline-block bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Try it free →
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 px-4 mt-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} BG Remover</span>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-gray-600">Home</Link>
            <Link href="/pricing" className="hover:text-gray-600">Pricing</Link>
            <Link href="/blog" className="hover:text-gray-600">Blog</Link>
            <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-600">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
