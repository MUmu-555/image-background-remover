import Link from "next/link";

export const metadata = {
  title: "Privacy Policy – BG Remover",
  description: "Privacy Policy for image-backgroundremover.com",
};

const LAST_UPDATED = "April 10, 2026";
const CONTACT_EMAIL = "support@image-backgroundremover.com";
const SITE = "image-backgroundremover.com";

export default function PrivacyPage() {
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

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-14">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Overview</h2>
            <p>
              {SITE} ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, and safeguard your information when you use our AI-powered
              background removal service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
            <h3 className="font-semibold text-gray-800 mb-2">2.1 Account Information</h3>
            <p>
              When you sign in with Google, we receive your name, email address, and profile picture from
              Google OAuth. We store this information to manage your account and usage limits.
            </p>
            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.2 Images You Upload</h3>
            <p>
              Images you submit for background removal are sent to our third-party processing provider
              (<a href="https://www.remove.bg" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">remove.bg</a>)
              solely for the purpose of processing. <strong>We do not permanently store your original uploaded images</strong> on our servers.
            </p>
            <p className="mt-2">
              If you are a logged-in user, the <strong>processed result image</strong> (with background removed) may be
              stored in Cloudflare R2 to enable our History feature, allowing you to re-download your results.
              You can delete your history at any time from your Dashboard.
            </p>
            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.3 Usage Data</h3>
            <p>
              We track how many images you process each month to enforce plan limits. This data is stored in
              our database and resets on the 1st of each month.
            </p>
            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.4 Payment Information</h3>
            <p>
              Payments are processed by PayPal. We do not collect or store your credit card or banking
              details. We receive confirmation of successful payments from PayPal via webhooks, and store
              basic transaction records (amount, plan, date) for account management.
            </p>
            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.5 Cookies &amp; Session Data</h3>
            <p>
              We use a single HttpOnly cookie to maintain your login session (valid for 7 days). We do not
              use advertising cookies or third-party tracking cookies.
            </p>
            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.6 IP Addresses (Guest Users)</h3>
            <p>
              For visitors who are not logged in, we store your IP address temporarily in Cloudflare KV to
              enforce the free monthly usage limit (1 image per month). This data expires automatically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide and improve our background removal service</li>
              <li>To manage your account, plan, and usage limits</li>
              <li>To process payments and manage subscriptions</li>
              <li>To store your processed image history (logged-in users only)</li>
              <li>To prevent abuse and enforce rate limits</li>
              <li>To respond to your support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Third-Party Services</h2>
            <p>We rely on the following third-party providers:</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Provider</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Purpose</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Privacy Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["Google OAuth", "Authentication", "https://policies.google.com/privacy"],
                    ["remove.bg", "Image processing", "https://www.remove.bg/privacy"],
                    ["Cloudflare", "Hosting, CDN, Storage", "https://www.cloudflare.com/privacypolicy/"],
                    ["PayPal", "Payment processing", "https://www.paypal.com/webapps/mpp/ua/privacy-full"],
                  ].map(([provider, purpose, url]) => (
                    <tr key={provider} className="bg-white">
                      <td className="px-4 py-3 font-medium text-gray-900">{provider}</td>
                      <td className="px-4 py-3 text-gray-500">{purpose}</td>
                      <td className="px-4 py-3">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                          View policy
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Retention</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Account data:</strong> Retained while your account is active</li>
              <li><strong>Processed images (History):</strong> Retained until you delete them or close your account</li>
              <li><strong>Monthly usage counters:</strong> Reset on the 1st of each month</li>
              <li><strong>Guest IP rate limit data:</strong> Expires after 32 days automatically</li>
              <li><strong>Payment records:</strong> Retained for 7 years for legal/accounting compliance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong>Access</strong> the personal data we hold about you</li>
              <li><strong>Delete</strong> your account and associated data</li>
              <li><strong>Download</strong> your processed image history</li>
              <li><strong>Opt out</strong> of any marketing communications</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-600 hover:underline">{CONTACT_EMAIL}</a>.
              We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Children's Privacy</h2>
            <p>
              Our service is not directed to children under the age of 13. We do not knowingly collect
              personal information from children. If you believe we have inadvertently collected such
              information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the
              "Last updated" date at the top of this page. Continued use of our service after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-600 hover:underline">{CONTACT_EMAIL}</a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4 mt-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} BG Remover · All rights reserved</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-gray-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
