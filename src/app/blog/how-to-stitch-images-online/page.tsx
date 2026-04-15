import Link from "next/link";

export const metadata = {
  title: "How to Stitch & Merge Images Online (Free, No App Needed) | BG Remover",
  description:
    "Learn how to stitch or merge multiple images side by side or vertically — for free, directly in your browser. No app download required.",
  alternates: { canonical: "https://image-backgroundremover.com/blog/how-to-stitch-images-online/" },
  openGraph: {
    title: "How to Stitch & Merge Images Online (Free, No App Needed)",
    description: "Combine multiple photos into one image — horizontally, vertically, or in a grid. Free browser tool, no upload.",
    url: "https://image-backgroundremover.com/blog/how-to-stitch-images-online/",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Stitch & Merge Images Online",
  description: "A step-by-step guide to combining multiple images into one using a free browser-based tool.",
  step: [
    { "@type": "HowToStep", name: "Open the Image Stitcher", text: "Go to image-backgroundremover.com/stitch — no sign-up needed." },
    { "@type": "HowToStep", name: "Upload your images", text: "Drag & drop or click to upload 2–10 images (JPG, PNG, or WebP)." },
    { "@type": "HowToStep", name: "Choose layout", text: "Pick horizontal (side by side), vertical (top to bottom), or auto-grid layout." },
    { "@type": "HowToStep", name: "Adjust spacing and alignment", text: "Set gap between images and alignment (top, center, or bottom)." },
    { "@type": "HowToStep", name: "Download", text: "Click Download PNG to save the merged image to your device." },
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
          <span className="text-xs font-semibold bg-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full">Image Tools</span>
          <p className="text-xs text-gray-400 mt-3">April 15, 2026 · 5 min read</p>
          <h1 className="text-4xl font-extrabold text-gray-900 mt-3 leading-tight">
            How to Stitch &amp; Merge Images Online (Free, No App Needed)
          </h1>
          <p className="text-xl text-gray-500 mt-4 leading-relaxed">
            Want to combine multiple photos into one image — side by side, stacked, or in a grid? Here&apos;s how to do it in seconds, for free, right in your browser.
          </p>
        </div>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">What Is Image Stitching?</h2>
            <p>
              Image stitching (also called image merging or collage-making) is the process of combining two or more photos into a single image. The most common use cases include:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li><strong>Before/after comparisons</strong> — show the difference side by side</li>
              <li><strong>Product detail shots</strong> — combine front, back, and close-up into one image</li>
              <li><strong>Panoramic photos</strong> — join overlapping images taken from the same spot</li>
              <li><strong>Social media collages</strong> — pack multiple moments into one post</li>
              <li><strong>Step-by-step guides</strong> — line up screenshots or tutorial images</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Step-by-Step: Merge Images Online</h2>
            <ol className="list-decimal list-inside space-y-4 mt-3">
              <li>
                <strong>Open the free Image Stitcher.</strong>{" "}
                Go to <Link href="/stitch" className="text-indigo-600 hover:underline">image-backgroundremover.com/stitch</Link>. No account needed.
              </li>
              <li>
                <strong>Upload your images.</strong> Drag &amp; drop 2–10 images onto the page (JPG, PNG, or WebP, up to 20 MB each). You can reorder them by dragging the thumbnails.
              </li>
              <li>
                <strong>Choose a layout.</strong> Pick from:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Horizontal</strong> — images placed side by side, left to right</li>
                  <li><strong>Vertical</strong> — images stacked top to bottom</li>
                  <li><strong>Auto Grid</strong> — automatically arranged into a balanced grid</li>
                </ul>
              </li>
              <li>
                <strong>Adjust spacing.</strong> Use the gap slider to add or remove space between images. Set the alignment (top, center, or bottom) for horizontal layouts.
              </li>
              <li>
                <strong>Preview and download.</strong> A live preview updates as you adjust settings. Click <em>Download PNG</em> to save the merged image.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Layout Guide: Which One to Use?</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden mt-3">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Layout</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Best For</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Typical Use</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {[
                    ["Horizontal", "2–4 images", "Before/after, product views"],
                    ["Vertical", "3–8 images", "Step-by-step guides, screenshots"],
                    ["Auto Grid", "4–9 images", "Social collages, portfolios"],
                  ].map(([l, n, u]) => (
                    <tr key={l}>
                      <td className="px-4 py-3 font-medium text-gray-900">{l}</td>
                      <td className="px-4 py-3 text-gray-500">{n}</td>
                      <td className="px-4 py-3 text-gray-500">{u}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Tips for Clean Results</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Use images with <strong>consistent dimensions</strong> for the cleanest alignment</li>
              <li>For before/after shots, set alignment to <strong>center</strong> so subjects line up</li>
              <li>Add a small gap (8–16 px) between images to give them visual breathing room</li>
              <li>For social media, target a total output width of <strong>1080 px</strong> (Instagram) or <strong>1200 px</strong> (Twitter)</li>
              <li>If images have white backgrounds, try a white gap color so the join is invisible</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Privacy: Does My Data Get Uploaded?</h2>
            <p>
              No. The image stitching tool works <strong>entirely in your browser</strong> using the HTML5 Canvas API. Your photos are never sent to any server — they stay on your device from start to finish. This also means it works offline once the page has loaded.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
            <div className="space-y-4 mt-3">
              {[
                {
                  q: "Can I merge more than 2 images?",
                  a: "Yes — you can upload up to 10 images at once. Use Auto Grid for large collections.",
                },
                {
                  q: "What file formats are supported?",
                  a: "JPG, PNG, and WebP are all accepted. The output is always a PNG to preserve quality.",
                },
                {
                  q: "Can I control the output resolution?",
                  a: "The output matches the resolution of your input images. For best results, use the highest-resolution originals you have.",
                },
                {
                  q: "Is there a file size limit?",
                  a: "Each image can be up to 20 MB. Very large images may take a moment to process depending on your device.",
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
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Try the Image Stitcher — it&apos;s free</h3>
          <p className="text-gray-500 mb-6">Combine photos side by side or in a grid. No sign-up, no watermarks, no limits.</p>
          <Link
            href="/stitch"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-sm"
          >
            Stitch Images Now →
          </Link>
        </div>

        {/* More articles */}
        <div className="mt-12">
          <h3 className="font-bold text-gray-900 mb-4">More from the blog</h3>
          <div className="space-y-3">
            <Link href="/blog/how-to-add-border-to-image/" className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 transition-colors text-sm font-medium text-gray-700 hover:text-indigo-600">
              How to Add a Border or Rounded Corners to Any Image →
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
