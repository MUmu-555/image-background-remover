import Link from "next/link";

export const metadata = {
  title: "How to Remove Background from ID Photos (Free & Fast) | BG Remover",
  description:
    "Need a white-background ID photo for a passport, visa, or job application? Here's how to remove the background in seconds — no Photoshop required.",
  alternates: { canonical: "https://image-backgroundremover.com/blog/remove-background-id-photo/" },
  openGraph: {
    title: "How to Remove Background from ID Photos (Free & Fast)",
    description: "Get a white-background ID photo for passport, visa, or job applications in seconds.",
    url: "https://image-backgroundremover.com/blog/remove-background-id-photo/",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Remove Background from ID Photos",
  description: "A simple guide to creating white-background ID photos for passports, visas, and job applications.",
  step: [
    { "@type": "HowToStep", name: "Take your photo", text: "Use a plain background and good lighting. Face the camera directly." },
    { "@type": "HowToStep", name: "Upload to BG Remover", text: "Go to image-backgroundremover.com and upload your photo." },
    { "@type": "HowToStep", name: "Select white background", text: "Choose the white background preset in the color picker." },
    { "@type": "HowToStep", name: "Download your ID photo", text: "Download the result as PNG. Your photo now has a clean white background." },
  ],
};

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

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
            <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-700">← Blog</Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-14">
        <div className="mb-8">
          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">ID Photos</span>
          <p className="text-xs text-gray-400 mt-3">April 10, 2026 · 4 min read</p>
          <h1 className="text-4xl font-extrabold text-gray-900 mt-3 leading-tight">
            How to Remove Background from ID Photos (Free & Fast)
          </h1>
          <p className="text-xl text-gray-500 mt-4 leading-relaxed">
            Need a white or light-blue background for a passport photo, visa application, or resume headshot? Do it in seconds — no Photoshop, no photo studio needed.
          </p>
        </div>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Why ID Photos Need Specific Backgrounds</h2>
            <p>
              Official ID photos — passports, driver&apos;s licenses, visa applications, work permits — almost always require a specific background color:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-3">
              <li><strong>US Passport:</strong> White or off-white background</li>
              <li><strong>UK Passport:</strong> Cream or light grey background</li>
              <li><strong>Schengen Visa:</strong> White or light grey background</li>
              <li><strong>Chinese ID / Visa:</strong> Often light blue background</li>
              <li><strong>Resume headshots:</strong> Typically white or light neutral</li>
            </ul>
            <p className="mt-3">
              With BG Remover, you can take any photo and instantly swap out the background — no studio, no designer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Step-by-Step Guide</h2>
            <ol className="list-decimal list-inside space-y-4">
              <li>
                <strong>Take your photo correctly.</strong> Stand in front of a plain wall. Use natural light from a window, or a ring light. Face the camera straight on. Make sure your full face and shoulders are visible.
              </li>
              <li>
                <strong>Upload your photo.</strong> Go to <Link href="/" className="text-indigo-600 hover:underline">image-backgroundremover.com</Link>. Drag &amp; drop your photo or click to browse. JPG, PNG, and WEBP are all supported.
              </li>
              <li>
                <strong>The AI removes the background automatically.</strong> This takes just 2–5 seconds. The AI is trained to handle hair edges, skin tones, and face profiles accurately.
              </li>
              <li>
                <strong>Select your required background color.</strong> Click the white preset for most ID photos, or use the custom color picker to enter a specific hex code (e.g., <code className="bg-gray-100 px-1 rounded text-sm">#438EDB</code> for Chinese visa blue).
              </li>
              <li>
                <strong>Download your photo.</strong> Click Download PNG. The image now has your chosen background and is ready to print or submit.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Common ID Photo Background Colors</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden mt-3">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Document</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Background</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Hex Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {[
                    ["US / UK Passport", "White", "#FFFFFF"],
                    ["Schengen Visa", "White / Light grey", "#FFFFFF"],
                    ["Chinese Visa", "Light blue", "#438EDB"],
                    ["Indian Passport", "White", "#FFFFFF"],
                    ["Resume Headshot", "White or light neutral", "#F8F8F8"],
                  ].map(([doc, bg, hex]) => (
                    <tr key={doc}>
                      <td className="px-4 py-3 font-medium text-gray-900">{doc}</td>
                      <td className="px-4 py-3 text-gray-500">{bg}</td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{hex}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Tips for the Best Results</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Avoid wearing colors similar to your background (e.g., don&apos;t wear white against a white wall)</li>
              <li>Keep hair neat and away from your face for cleaner edge detection</li>
              <li>Use good lighting — shadows on your face can confuse the AI</li>
              <li>Use the Slider view to check that edges around your hair look clean before downloading</li>
              <li>Always verify the final photo meets the specific requirements of your document</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Is It Legal to Use AI-Edited ID Photos?</h2>
            <p>
              For official government documents (passport, driver&apos;s license), requirements vary by country. Many countries allow digitally-taken or edited photos as long as the result is an accurate representation of your appearance. Always check the specific requirements for your document before submitting.
            </p>
            <p className="mt-3">
              For job applications, LinkedIn profiles, and resume photos, there are no restrictions — use whatever looks professional.
            </p>
          </section>
        </div>

        <div className="mt-12 bg-indigo-50 rounded-2xl p-8 text-center border border-indigo-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Create your ID photo now</h3>
          <p className="text-gray-500 mb-6">Free, fast, no sign-up required.</p>
          <Link
            href="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-sm"
          >
            Remove Background Now →
          </Link>
        </div>

        <div className="mt-12">
          <h3 className="font-bold text-gray-900 mb-4">More from the blog</h3>
          <div className="space-y-3">
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
