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
    slug: "how-to-remove-background-ecommerce",
    title: "How to Remove Image Backgrounds for E-Commerce Products",
    description:
      "Clean product photos sell more. Learn how to quickly remove backgrounds from product images and export white or transparent PNG files ready for Amazon, Shopify, and more.",
    date: "April 10, 2026",
    readTime: "5 min read",
    tag: "E-Commerce",
    tagColor: "bg-blue-100 text-blue-700",
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
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">BG Remover</span>
          </Link>
          <div className="ml-auto">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to app</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-14">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Blog</h1>
          <p className="text-gray-500 text-lg">Tutorials, tips, and guides for background removal.</p>
        </div>

        <div className="grid gap-6">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}/`}
              className="block bg-white rounded-2xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${post.tagColor}`}>
                      {post.tag}
                    </span>
                    <span className="text-xs text-gray-400">{post.date} · {post.readTime}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed">{post.description}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 flex-shrink-0 mt-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 px-4 mt-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} BG Remover</span>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-gray-600">Home</Link>
            <Link href="/pricing" className="hover:text-gray-600">Pricing</Link>
            <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-600">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
