"use client";

import { useState, useEffect, useCallback } from "react";

const PLANS = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    credits: 5,
    period: "month",
    description: "Perfect for occasional use",
    color: "border-gray-200",
    badge: null,
    cta: "Get started free",
    ctaStyle: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    planKey: null,
    features: [
      "5 images per month",
      "High-res PNG download",
      "Google sign-in",
      "Basic support",
    ],
    missing: ["Credit rollover", "Batch processing", "API access", "Priority queue"],
  },
  {
    name: "Pro",
    monthly: 9.9,
    yearly: 79,
    credits: 30,
    period: "month",
    description: "For designers & freelancers",
    color: "border-indigo-500 ring-2 ring-indigo-200",
    badge: "Most Popular",
    cta: "Upgrade to Pro",
    ctaStyle: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
    planKey: "pro",
    features: [
      "30 images per month",
      "High-res PNG download",
      "Processing history",
      "Batch processing (up to 5)",
      "Priority support",
    ],
    missing: ["API access", "Priority queue"],
  },
  {
    name: "Business",
    monthly: 34.9,
    yearly: 279,
    credits: 100,
    period: "month",
    description: "For teams & high-volume use",
    color: "border-gray-200",
    badge: null,
    cta: "Upgrade to Business",
    ctaStyle: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    planKey: "business",
    features: [
      "100 images per month",
      "High-res PNG download",
      "Processing history (30 days)",
      "Batch processing (up to 10)",
      "API access",
      "Priority queue",
      "Priority support",
    ],
    missing: [],
  },
];

const CREDIT_PACKS = [
  { key: "starter", name: "Starter", credits: 10, price: 3.4, perCredit: "0.34", badge: null },
  { key: "popular", name: "Popular", credits: 30, price: 9.9, perCredit: "0.33", badge: "🔥 Best Value" },
  { key: "pro", name: "Pro Pack", credits: 80, price: 24.9, perCredit: "0.31", badge: null },
  { key: "bulk", name: "Bulk", credits: 200, price: 59.9, perCredit: "0.30", badge: null },
];

const FAQ = [
  {
    q: "What counts as one credit?",
    a: "Each image processed uses one credit, regardless of file size or resolution.",
  },
  {
    q: "Do unused monthly credits roll over?",
    a: "Monthly subscription credits reset on the 1st of each month and don't roll over. Credit pack credits never expire.",
  },
  {
    q: "What's the difference between subscription and credit packs?",
    a: "Subscriptions give you a monthly allowance at a lower per-image cost. Credit packs are one-time purchases that never expire — great for occasional or burst usage.",
  },
  {
    q: "Can I use credit packs alongside a subscription?",
    a: "Yes! Monthly credits are used first. Once exhausted, credit pack credits kick in automatically.",
  },
  {
    q: "What image formats are supported?",
    a: "JPG, PNG, and WEBP up to 20MB. Results are always delivered as transparent PNG.",
  },
  {
    q: "How many free tries do guests get?",
    a: "Guests (not signed in) get 1 free try per month per IP. Sign up for a free account to get 5 credits every month.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Absolutely. Cancel anytime — you keep access until the end of your billing period.",
  },
];

function Check() {
  return (
    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function X() {
  return (
    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
    </svg>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // 检查 URL 参数（支付回调后的提示）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");

    if (success === "credits") {
      const credits = params.get("credits");
      setToast({ type: "success", msg: `🎉 ${credits} credits added to your account!` });
    } else if (success === "subscription") {
      const plan = params.get("plan");
      setToast({ type: "success", msg: `🎉 Successfully upgraded to ${plan?.toUpperCase()} plan!` });
    } else if (error) {
      const msgs: Record<string, string> = {
        payment_failed: "Payment failed. Please try again.",
        capture_failed: "Failed to process payment. Contact support.",
        subscription_not_active: "Subscription activation failed.",
        missing_token: "Invalid payment session.",
        invalid_data: "Payment data error. Contact support.",
        server_error: "Server error. Please try again.",
      };
      setToast({ type: "error", msg: msgs[error] || `Payment error: ${error}` });
    }

    // 清理 URL 参数
    if (success || error) {
      window.history.replaceState({}, "", "/pricing");
    }
  }, []);

  // 自动隐藏 toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  // 处理套餐购买（订阅）
  const handlePlanClick = useCallback(async (plan: typeof PLANS[0]) => {
    if (!plan.planKey) {
      window.location.href = "/api/auth/login";
      return;
    }

    setLoadingPlan(plan.planKey);
    try {
      const res = await fetch("/api/paypal/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.planKey, billing }),
      });

      if (res.status === 401) {
        window.location.href = "/api/auth/login";
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      if (data.approveUrl) {
        window.location.href = data.approveUrl;
      } else {
        throw new Error("No approve URL");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setToast({ type: "error", msg: `Payment error: ${msg}` });
    } finally {
      setLoadingPlan(null);
    }
  }, [billing]);

  // 处理积分包购买（一次性）
  const handlePackClick = useCallback(async (pack: typeof CREDIT_PACKS[0]) => {
    setLoadingPack(pack.key);
    try {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: pack.key }),
      });

      if (res.status === 401) {
        window.location.href = "/api/auth/login";
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      if (data.approveUrl) {
        window.location.href = data.approveUrl;
      } else {
        throw new Error("No approve URL");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setToast({ type: "error", msg: `Payment error: ${msg}` });
    } finally {
      setLoadingPack(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast 通知 */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-4 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">BG Remover</span>
          </a>
          <div className="ml-auto">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to app</a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Start free. Upgrade when you need more. No hidden fees, cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 mt-8 bg-white border border-gray-200 rounded-full p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition-all ${
                billing === "monthly" ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition-all flex items-center gap-2 ${
                billing === "yearly" ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Yearly
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${billing === "yearly" ? "bg-white/20 text-white" : "bg-green-100 text-green-700"}`}>
                Save 33%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PLANS.map((plan) => {
            const monthlyPrice = billing === "yearly" ? (plan.yearly / 12).toFixed(1) : plan.monthly;
            const isLoading = plan.planKey !== null && loadingPlan === plan.planKey;

            return (
              <div key={plan.name} className={`bg-white rounded-2xl border-2 ${plan.color} p-7 flex flex-col relative`}>
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {plan.monthly === 0 ? (
                    <div className="text-4xl font-extrabold text-gray-900">Free</div>
                  ) : (
                    <>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-extrabold text-gray-900">
                          ${billing === "yearly" ? monthlyPrice : plan.monthly}
                        </span>
                        <span className="text-gray-400 mb-1">/mo</span>
                      </div>
                      {billing === "yearly" && (
                        <p className="text-sm text-gray-500 mt-1">
                          Billed ${plan.yearly}/year
                        </p>
                      )}
                    </>
                  )}
                  <p className="text-sm text-indigo-600 font-semibold mt-2">
                    {plan.credits} images/month
                  </p>
                </div>

                <button
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors mb-6 flex items-center justify-center gap-2 ${plan.ctaStyle} ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                  onClick={() => handlePlanClick(plan)}
                  disabled={isLoading}
                >
                  {isLoading && <Spinner />}
                  {isLoading ? "Redirecting..." : plan.cta}
                </button>

                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <Check />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                      <X />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Credit Packs */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Credit Packs</h2>
            <p className="text-gray-500">One-time purchase · Never expire · Stack with any plan</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CREDIT_PACKS.map((pack) => {
              const isLoading = loadingPack === pack.key;
              return (
                <div key={pack.name} className="bg-white rounded-2xl border border-gray-200 p-6 text-center relative hover:border-indigo-300 hover:shadow-md transition-all">
                  {pack.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-orange-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                        {pack.badge}
                      </span>
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 mb-1">{pack.name}</h3>
                  <div className="text-3xl font-extrabold text-indigo-600 my-3">{pack.credits}</div>
                  <p className="text-sm text-gray-500 mb-4">credits</p>
                  <div className="text-2xl font-bold text-gray-900 mb-1">${pack.price}</div>
                  <p className="text-xs text-gray-400 mb-5">${pack.perCredit}/credit</p>
                  <button
                    className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                    onClick={() => handlePackClick(pack)}
                    disabled={isLoading}
                  >
                    {isLoading && <Spinner />}
                    {isLoading ? "Redirecting..." : "Buy now"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {item.q}
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-500 text-sm">
            Questions? Email us at{" "}
            <a href="mailto:support@image-backgroundremover.com" className="text-indigo-600 hover:underline">
              support@image-backgroundremover.com
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4 mt-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} BG Remover · All rights reserved</span>
          <div className="flex gap-5">
            <a href="/" className="hover:text-gray-600">Home</a>
            <a href="/dashboard" className="hover:text-gray-600">Dashboard</a>
            <a href="/privacy" className="hover:text-gray-600">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-600">Terms of Service</a>
            <a href="mailto:support@image-backgroundremover.com" className="hover:text-gray-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
