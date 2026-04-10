import Link from "next/link";

export const metadata = {
  title: "Terms of Service – BG Remover",
  description: "Terms of Service for image-backgroundremover.com",
};

const LAST_UPDATED = "April 10, 2026";
const CONTACT_EMAIL = "support@image-backgroundremover.com";
const SITE = "image-backgroundremover.com";

export default function TermsPage() {
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
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using {SITE} (the "Service"), you agree to be bound by these Terms of
              Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Description of Service</h2>
            <p>
              BG Remover provides an AI-powered image background removal service. Users can upload images
              and receive processed versions with backgrounds removed. The Service is available to both
              guests (limited usage) and registered users (plan-based usage).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Accounts &amp; Registration</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You must sign in with a valid Google account to access registered user features.</li>
              <li>You are responsible for maintaining the security of your account.</li>
              <li>You must be at least 13 years old to use this Service.</li>
              <li>One account per person. Creating multiple accounts to circumvent usage limits is prohibited.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Usage Limits &amp; Plans</h2>
            <p className="mb-3">Usage limits vary by plan:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Plan</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Monthly Limit</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {[
                    ["Guest (no login)", "1 image / month", "Free"],
                    ["Free (registered)", "5 images / month", "Free"],
                    ["Pro", "30 images / month", "$9.9/mo or $79/yr"],
                    ["Business", "100 images / month", "$34.9/mo or $279/yr"],
                  ].map(([plan, limit, price]) => (
                    <tr key={plan}>
                      <td className="px-4 py-3 font-medium text-gray-900">{plan}</td>
                      <td className="px-4 py-3 text-gray-500">{limit}</td>
                      <td className="px-4 py-3 text-gray-500">{price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Credit packs provide additional one-time credits that never expire and stack with your monthly plan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Payments &amp; Subscriptions</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Payments are processed securely via PayPal.</li>
              <li>Subscription plans are billed monthly or annually and renew automatically.</li>
              <li>Credit packs are one-time purchases and non-refundable once used.</li>
              <li>
                <strong>Refunds:</strong> Unused subscription time may be refunded within 7 days of
                purchase if you have not used more than 5 credits during that period. Contact us at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-600 hover:underline">{CONTACT_EMAIL}</a>.
              </li>
              <li>We reserve the right to change pricing with 30 days' notice to existing subscribers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Acceptable Use</h2>
            <p className="mb-2">You agree not to use the Service to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Upload images containing illegal content, including child sexual abuse material (CSAM)</li>
              <li>Process images you do not have the right to use</li>
              <li>Reverse-engineer, scrape, or abuse the Service's APIs</li>
              <li>Attempt to bypass usage limits or security measures</li>
              <li>Resell access to the Service without authorization</li>
              <li>Use the Service for any unlawful purpose</li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that violate these terms without refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Your Content &amp; Intellectual Property</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You retain full ownership of the images you upload and the processed results.</li>
              <li>By uploading images, you grant us a temporary license to process them solely for delivering the Service.</li>
              <li>We do not claim any intellectual property rights over your images.</li>
              <li>You represent that you have the right to upload and process the images you submit.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is" and "as available" without warranties of any kind, either
              express or implied. We do not warrant that the Service will be uninterrupted, error-free, or
              that processed results will meet your specific requirements. AI-based processing may
              occasionally produce imperfect results.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, {SITE} shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of the Service,
              including but not limited to loss of data, lost profits, or business interruption.
              Our total liability shall not exceed the amount you paid us in the 3 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Termination</h2>
            <p>
              You may close your account at any time by contacting us. We reserve the right to suspend
              or terminate your access to the Service at our discretion if you violate these Terms.
              Upon termination, your stored image history will be deleted within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of significant changes via
              email or a notice on our website. Continued use of the Service after changes take effect
              constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with applicable law.
              Any disputes arising under these Terms shall be resolved through good-faith negotiation,
              followed by binding arbitration if necessary.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us at:{" "}
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
