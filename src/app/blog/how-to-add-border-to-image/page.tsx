import Link from "next/link";

export const metadata = {
  title: "How to Add a Border or Rounded Corners to Any Image (Free) | BG Remover",
  description:
    "Add a custom border or rounded corners to any photo in seconds — free, browser-based, no Photoshop needed. Perfect for social media, profiles, and product shots.",
  alternates: { canonical: "https://image-backgroundremover.com/blog/how-to-add-border-to-image/" },
  openGraph: {
    title: "How to Add a Border or Rounded Corners to Any Image (Free)",
    description: "Add borders, rounded corners, and shadows to photos — free browser tool, no upload to servers.",
    url: "https://image-backgroundremover.com/blog/how-to-add-border-to-image/",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Add a Border or Rounded Corners to Any Image",
  description: "Add custom borders and rounded corners to any photo using a free browser-based tool.",
  step: [
    { "@type": "HowToStep", name: "Open the Border Tool", text: "Go to image-backgroundremover.com/border — no sign-up needed." },
    { "@type": "HowToStep", name: "Upload your image", text: "Drag & drop or click to upload a JPG, PNG, or WebP image." },
    { "@type": "HowToStep", name: "Choose border style", text: "Set border width, color, and corner radius using the sliders." },
    { "@type": "HowToStep", name: "Preview in real time", text: "The preview updates instantly as you adjust the settings." },
    { "@type": "HowToStep", name: "Download", text: "Click Download PNG to save your bordered image." },
  ],
};

const USE_CASES = [
  {
    icon: "👤",
    title: "Profile Pictures",
    desc: "Add a colored ring or circle frame to make your avatar stand out on social media.",
  },
  {
    icon: "🛍️",
    title: "Product Photos",
    desc: "A thin border separates your product from the page background and looks more polished.",
  },
  {
    icon: "📸",
    title: "Photography Portfolios",
    desc: "Classic white borders give photos a printed/gallery feel on websites and Instagram.",
  },
  {
    icon: "📋",
    title: "Presentation Slides",
    desc: "Rounded-corner images look more modern and less 'clipart-like' in decks.",
  },
  {
    icon: "🪪",
    title: "ID & Document Photos",
    desc: "Some document templates require images with specific border widths.",
  },
  {
    icon: "🎨",
    title: "Creative Projects",
    desc: "Mix colored borders with shadows for eye-catching social posts and thumbnails.",
  },
];

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
          <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">Image Tools</span>
          <p className="text-xs text-gray-400 mt-3">April 15, 2026 · 4 min read</p>
          <h1 className="text-4xl font-extrabold text-gray-900 mt-3 leading-tight">
            How to Add a Border or Rounded Corners to Any Image (Free)
          </h1>
          <p className="text-xl text-gray-500 mt-4 leading-relaxed">
            Framing a photo with a border or softening its corners with a radius transform can take it from plain to polished. Here&apos;s how to do it for free — no Photoshop, no apps, just your browser.
          </p>
        </div>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Why Add Borders to Images?</h2>
            <p>
              Borders serve both aesthetic and functional purposes. A well-placed frame draws the eye, separates the image from its surroundings, and signals intentional design. Rounded corners give photos a soft, modern look that feels native to today&apos;s UIs — you see them everywhere from iOS icons to product cards.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
              {USE_CASES.map((u) => (
                <div key={u.title} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-2xl mb-2">{u.icon}</div>
                  <p className="font-semibold text-sm text-gray-800 mb-1">{u.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{u.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Step-by-Step: Add a Border Online</h2>
            <ol className="list-decimal list-inside space-y-4 mt-3">
              <li>
                <strong>Open the free Border Tool.</strong>{" "}
                Go to <Link href="/border" className="text-indigo-600 hover:underline">image-backgroundremover.com/border</Link>. No account required.
              </li>
              <li>
                <strong>Upload your image.</strong> Drag &amp; drop a JPG, PNG, or WebP file (up to 20 MB) onto the upload area, or click to browse.
              </li>
              <li>
                <strong>Set the border width.</strong> Use the slider to pick border thickness in pixels — anywhere from 0 (no border) to 100+ px for a heavy frame look.
              </li>
              <li>
                <strong>Choose a border color.</strong> Pick from preset swatches (white, black, grey, gold, etc.) or enter a custom hex color. For a subtle look, try a 1–2 px border matching your background color.
              </li>
              <li>
                <strong>Adjust corner radius.</strong> Set radius from 0 (sharp corners) to 50%+ (pill or circle shape). For a classic photo frame, keep it at 0. For social profiles, try 16–32 px.
              </li>
              <li>
                <strong>Add a drop shadow (optional).</strong> Toggle shadow on for a floating card effect. Adjust blur and offset for a subtle or dramatic look.
              </li>
              <li>
                <strong>Download.</strong> The preview updates in real time. When you&apos;re happy, click <em>Download PNG</em>.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Border Style Reference</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden mt-3">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Style</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Settings</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Best For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {[
                    ["Classic Frame", "White, 20–40 px, radius 0", "Photography, prints"],
                    ["Thin Outline", "Dark, 2–4 px, radius 0", "Product photos, docs"],
                    ["Rounded Card", "Light grey, 4–8 px, radius 16 px", "App screenshots, blog"],
                    ["Circle Crop", "Colored, 4 px, radius 50%", "Profile pictures, avatars"],
                    ["Floating Card", "White, 12 px + shadow, radius 12 px", "Presentations, ads"],
                    ["Polaroid", "White, 16 px top/sides, 40 px bottom", "Instagram, nostalgia"],
                  ].map(([s, c, b]) => (
                    <tr key={s}>
                      <td className="px-4 py-3 font-medium text-gray-900">{s}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">{c}</td>
                      <td className="px-4 py-3 text-gray-500">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Rounded Corners: Design Tips</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Use <strong>the same radius</strong> across all images on a page for a consistent look</li>
              <li>A radius of <strong>8–12 px</strong> is the &quot;iOS default&quot; — it feels familiar and clean</li>
              <li>For a full circle, set radius to <strong>50%</strong> (works best with square images)</li>
              <li>Pair rounded corners with a <strong>subtle drop shadow</strong> — the combination reads as a &quot;card&quot; and lifts off the page</li>
              <li>Avoid mixing sharp and rounded images in the same layout — it looks unintentional</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Is My Image Uploaded to a Server?</h2>
            <p>
              No. The border and corner-radius tool uses the browser&apos;s Canvas API to process everything locally on your device. <strong>No image data is ever sent to our servers.</strong> It works offline once the page is loaded, and there&apos;s no limit on the number of images you can process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
            <div className="space-y-4 mt-3">
              {[
                {
                  q: "Can I add a border without changing the image dimensions?",
                  a: "Yes — the border is drawn outside the image, so the original content area stays the same. The output image will be slightly larger (by the border width on each side).",
                },
                {
                  q: "Does the rounded corner crop my image?",
                  a: "Corners are clipped, but the image content is preserved. The output PNG has a transparent corner where the crop happens, so it works on any background.",
                },
                {
                  q: "What format does the output use?",
                  a: "Always PNG — it supports transparency for the rounded corner areas and preserves quality.",
                },
                {
                  q: "Can I use this for commercial projects?",
                  a: "Yes, the tool is free for personal and commercial use with no watermarks.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="border border-gray-200 rounded-xl p-5 bg-white">
                  <p className="font-semibold text-gray-900 mb-1">{q}</p>
                  <p className="text-sm text-gray-500">{a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-indigo-50 rounded-2xl p-8 text-center border border-indigo-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Try the Border Tool — free, no sign-up</h3>
          <p className="text-gray-500 mb-6">Add borders, rounded corners, and shadows to any image. All processing is in your browser — 100% private.</p>
          <Link
            href="/border"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-sm"
          >
            Add Border Now →
          </Link>
        </div>

        {/* More articles */}
        <div className="mt-12">
          <h3 className="font-bold text-gray-900 mb-4">More from the blog</h3>
          <div className="space-y-3">
            <Link href="/blog/how-to-stitch-images-online/" className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 transition-colors text-sm font-medium text-gray-700 hover:text-indigo-600">
              How to Stitch &amp; Merge Images Online (Free, No App Needed) →
            </Link>
            <Link href="/blog/how-to-remove-background-ecommerce/" className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 transition-colors text-sm font-medium text-gray-700 hover:text-indigo-600">
              How to Remove Image Backgrounds for E-Commerce Products →
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
