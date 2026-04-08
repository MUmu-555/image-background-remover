"use client";

import { useState, useEffect } from "react";

interface Credits {
  plan: string;
  limit: number;
  used: number;
  monthlyRemaining: number;
  bonusCredits: number;
  totalRemaining: number;
  canUse: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  credits: Credits;
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${color ?? "text-gray-900"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          window.location.href = "/api/auth/login";
        } else {
          setUser(d.user);
        }
      })
      .catch(() => (window.location.href = "/"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const { credits } = user;
  const usedPct = credits ? Math.round((credits.used / credits.limit) * 100) : 0;
  const nextReset = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
  const planLabel: Record<string, string> = { free: "Free", pro: "Pro", business: "Business" };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">BG Remover</span>
          </a>
          <div className="ml-auto flex items-center gap-3">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to app</a>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-sm text-red-500 hover:text-red-700">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Profile */}
        <div className="flex items-center gap-5 mb-10">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full ring-2 ring-indigo-100" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <span className="inline-block mt-1.5 text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full capitalize">
              {planLabel[credits?.plan] ?? "Free"} Plan
            </span>
          </div>
          {credits?.plan === "free" && (
            <a
              href="/pricing"
              className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Upgrade →
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Monthly Credits"
            value={credits?.monthlyRemaining ?? 0}
            sub={`of ${credits?.limit ?? 5} remaining`}
            color={credits?.monthlyRemaining === 0 ? "text-red-500" : "text-indigo-600"}
          />
          <StatCard
            label="Used This Month"
            value={credits?.used ?? 0}
            sub={`${usedPct}% of monthly limit`}
          />
          <StatCard
            label="Bonus Credits"
            value={credits?.bonusCredits ?? 0}
            sub="Never expire"
            color={credits?.bonusCredits > 0 ? "text-green-600" : "text-gray-900"}
          />
          <StatCard
            label="Resets On"
            value={nextReset.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            sub="Monthly credits reset"
          />
        </div>

        {/* Usage bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Monthly Usage</h2>
            <span className="text-sm text-gray-500">
              {credits?.used ?? 0} / {credits?.limit ?? 5} credits used
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                usedPct >= 100 ? "bg-red-500" : usedPct >= 80 ? "bg-yellow-400" : "bg-indigo-500"
              }`}
              style={{ width: `${Math.min(usedPct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>0</span>
            <span>{credits?.limit ?? 5}</span>
          </div>
          {credits?.monthlyRemaining === 0 && (
            <div className="mt-4 bg-red-50 rounded-xl p-4 flex items-center justify-between">
              <p className="text-sm text-red-700 font-medium">Monthly credits exhausted</p>
              <a href="/pricing" className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                Get more →
              </a>
            </div>
          )}
        </div>

        {/* Credit packs CTA */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Need more credits?</h3>
              <p className="text-sm text-gray-500">
                Credit packs never expire and stack with your monthly plan.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <a
                href="/pricing"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                Buy credits
              </a>
              <a
                href="/pricing"
                className="border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                View plans
              </a>
            </div>
          </div>
        </div>

        {/* Plan details */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Plan Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              ["Current plan", planLabel[credits?.plan] ?? "Free"],
              ["Monthly limit", `${credits?.limit ?? 5} images`],
              ["Billing", credits?.plan === "free" ? "Free forever" : "Subscription"],
              ["Support", credits?.plan === "business" ? "Priority support" : "Standard support"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
          {credits?.plan === "free" && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">Unlock more with Pro — $9.9/month</p>
              <a href="/pricing" className="text-sm font-semibold text-indigo-600 hover:underline">
                See plans →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
