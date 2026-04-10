"use client";

import { useState, useEffect, useCallback } from "react";

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

interface HistoryItem {
  id: number;
  originalFilename: string;
  fileSize: number;
  createdAt: string;
  downloadUrl: string | null;
  thumbnailUrl: string | null;
}

interface HistoryData {
  items: HistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${color ?? "text-gray-900"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryTab() {
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [previewId, setPreviewId] = useState<number | null>(null);

  const fetchHistory = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/history?page=${p}&limit=12`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchHistory(page);
  }, [page, fetchHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!history || history.items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-gray-900 font-semibold mb-2">No history yet</h3>
        <p className="text-gray-500 text-sm mb-6">
          Your processed images will appear here after you remove a background.
        </p>
        <a
          href="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          Remove a background →
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {history.pagination.total} image{history.pagination.total !== 1 ? "s" : ""} processed
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {history.items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow"
          >
            {/* 图片预览（透明棋盘背景） */}
            <div
              className="relative aspect-square bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZWVlIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlZWUiLz48cmVjdCB4PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZmZmIi8+PHJlY3QgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')] cursor-pointer"
              onClick={() => setPreviewId(previewId === item.id ? null : item.id)}
            >
              {item.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnailUrl}
                  alt={item.originalFilename || "Processed image"}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                  </svg>
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-md">Preview</span>
              </div>
            </div>

            {/* 文件信息 + 下载按钮 */}
            <div className="p-3">
              <p className="text-xs text-gray-700 font-medium truncate" title={item.originalFilename}>
                {item.originalFilename || "image"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.createdAt)}</p>
              <p className="text-xs text-gray-400">{formatFileSize(item.fileSize)}</p>
              {item.downloadUrl && (
                <a
                  href={item.downloadUrl}
                  download
                  className="mt-2 w-full flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 分页 */}
      {history.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            Page {history.pagination.page} / {history.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(history.pagination.totalPages, p + 1))}
            disabled={!history.pagination.hasMore}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");

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
        <div className="flex items-center gap-5 mb-8">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
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

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
          {(["overview", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "overview" ? "Overview" : "History"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <>
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
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6 mb-8">
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
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
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
          </>
        )}

        {activeTab === "history" && <HistoryTab />}
      </div>
    </div>
  );
}
