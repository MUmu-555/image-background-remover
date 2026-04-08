"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Status = "idle" | "processing" | "done" | "error";

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
  credits?: Credits;
}

interface ImageState {
  originalUrl: string | null;
  resultUrl: string | null;
  originalName: string;
  originalSize: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 20;

// ─── Helper ──────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CreditsBar({ credits }: { credits: Credits }) {
  const pct = Math.round((credits.monthlyRemaining / credits.limit) * 100);
  const color = pct > 50 ? "bg-green-500" : pct > 20 ? "bg-yellow-400" : "bg-red-500";

  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-gray-500">Monthly credits</span>
        <span className="text-xs font-semibold text-gray-700">
          {credits.monthlyRemaining}/{credits.limit}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      {credits.bonusCredits > 0 && (
        <p className="text-xs text-indigo-600 mt-1.5 font-medium">
          +{credits.bonusCredits} bonus credits
        </p>
      )}
      {credits.totalRemaining === 0 && (
        <a
          href="/pricing"
          className="block mt-2 text-center text-xs bg-indigo-600 text-white rounded-lg py-1.5 font-semibold hover:bg-indigo-700 transition-colors"
        >
          Get more credits →
        </a>
      )}
    </div>
  );
}

function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:bg-gray-100 rounded-full pl-2 pr-3 py-1 transition-colors"
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {user.name?.[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user.name}</span>
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
            <span className="inline-block mt-1 text-xs bg-indigo-100 text-indigo-600 font-semibold px-2 py-0.5 rounded-full capitalize">
              {user.credits?.plan ?? "free"}
            </span>
          </div>
          {user.credits && <CreditsBar credits={user.credits} />}
          <a href="/pricing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Upgrade plan
          </a>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Header({ user, authError }: { user: User | null; authError?: string }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-base">BG Remover</span>
        </div>
        <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Free</span>

        {authError && (
          <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full hidden sm:inline">
            {authError}
          </span>
        )}

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <a
              href="/api/auth/login"
              className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors shadow-sm"
            >
              {/* Google icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-indigo-50 via-white to-white pt-12 pb-8 px-4 text-center">
      <div className="max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
          AI-Powered · Instant Results
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          Remove Image Background
          <span className="block text-indigo-600">in Seconds — For Free</span>
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
          Upload any image and our AI instantly removes the background.
          Perfect for e-commerce, ID photos, and design assets.
        </p>
      </div>
    </section>
  );
}

function UploadZone({
  onFile,
}: {
  onFile: (file: File) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 
        flex flex-col items-center justify-center p-10 sm:p-16 text-center
        ${isDragging
          ? "border-indigo-500 bg-indigo-50 drag-active scale-[1.01]"
          : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/50"
        }
      `}
    >
      {/* Upload icon */}
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-colors ${isDragging ? "bg-indigo-200" : "bg-gray-100"}`}>
        <svg className={`w-10 h-10 transition-colors ${isDragging ? "text-indigo-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>

      <p className="text-xl font-semibold text-gray-700 mb-2">
        {isDragging ? "Drop your image here" : "Drag & drop your image here"}
      </p>
      <p className="text-sm text-gray-400 mb-6">
        Supports JPG, PNG, WEBP · Max {MAX_SIZE_MB}MB
      </p>

      <button
        type="button"
        className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-sm"
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
      >
        Choose Image
      </button>

      {/* Sample images hint */}
      <p className="mt-5 text-xs text-gray-400">
        Works best with people, products, animals, and objects
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
    </div>
  );
}

function ProcessingView({ originalUrl }: { originalUrl: string | null }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
      <div className="flex flex-col items-center gap-5">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">Removing background…</p>
          <p className="text-sm text-gray-400 mt-1">AI is analyzing your image. Usually takes 2–5 seconds.</p>
        </div>
        {/* Preview of original while loading */}
        {originalUrl && (
          <div className="mt-2 relative">
            <img
              src={originalUrl}
              alt="Processing"
              className="max-h-40 max-w-xs rounded-xl object-contain opacity-40 blur-sm"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white/90 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow">
                Processing…
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultView({
  imageState,
  onDownload,
  onReset,
}: {
  imageState: ImageState;
  onDownload: () => void;
  onReset: () => void;
}) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setShowOriginal(false)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              !showOriginal ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Result
          </button>
          <button
            onClick={() => setShowOriginal(true)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              showOriginal ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Original
          </button>
        </div>
        <div className="text-xs text-gray-400">
          {imageState.originalName} · {imageState.originalSize}
        </div>
      </div>

      {/* Image comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 pt-3 pb-2 border-b border-gray-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Original</span>
          </div>
          <div className="bg-gray-50 flex items-center justify-center p-4 min-h-48">
            {imageState.originalUrl && (
              <img src={imageState.originalUrl} alt="Original" className="max-h-56 max-w-full object-contain rounded-lg" />
            )}
          </div>
        </div>

        {/* Result */}
        <div className="bg-white rounded-2xl border-2 border-indigo-200 overflow-hidden ring-1 ring-indigo-100">
          <div className="px-4 pt-3 pb-2 border-b border-indigo-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Background Removed</span>
            <span className="ml-auto text-xs text-green-600 font-semibold">✓ Done</span>
          </div>
          <div className="checkerboard flex items-center justify-center p-4 min-h-48">
            {imageState.resultUrl && (
              <img src={imageState.resultUrl} alt="Background removed" className="max-h-56 max-w-full object-contain rounded-lg" />
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onDownload}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PNG
        </button>
        <button
          onClick={onReset}
          className="flex-1 sm:flex-none sm:px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-200 transition-colors"
        >
          Remove Another Image
        </button>
      </div>

      {/* Tips */}
      <p className="text-center text-xs text-gray-400">
        💡 Your image is processed in memory and never stored on our servers
      </p>
    </div>
  );
}

function ErrorView({
  message,
  onRetry,
  user,
}: {
  message: string;
  onRetry: () => void;
  user: User | null;
}) {
  const isCreditsError =
    message.includes("Credits") ||
    message.includes("credits") ||
    message.includes("free daily tries") ||
    message.includes("free credits");

  return (
    <div className="bg-white rounded-2xl border border-red-200 p-10 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <p className="text-base font-semibold text-gray-800">
            {isCreditsError ? "You're out of credits" : "Something went wrong"}
          </p>
          <p className="text-sm text-red-500 mt-1 max-w-sm">{message}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-1">
          {isCreditsError ? (
            <>
              {!user && (
                <a
                  href="/api/auth/login"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  Sign in for 5 free/month
                </a>
              )}
              <a
                href="/pricing"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Get more credits →
              </a>
            </>
          ) : (
            <button
              onClick={onRetry}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  const features = [
    {
      emoji: "⚡",
      title: "Instant Results",
      desc: "AI removes the background in 2–5 seconds. No waiting, no queue.",
    },
    {
      emoji: "🔒",
      title: "100% Private",
      desc: "Images are processed in memory and never stored on our servers.",
    },
    {
      emoji: "✂️",
      title: "Perfect Cutout",
      desc: "Handles hair, fur, complex edges, and transparent objects with ease.",
    },
  ];

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
          Why choose BG Remover?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-3">{f.emoji}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  const cases = [
    { icon: "🛍️", title: "E-commerce", desc: "Create clean white-background product photos" },
    { icon: "🪪", title: "ID Photos", desc: "Swap backgrounds for official documents" },
    { icon: "🎨", title: "Design", desc: "Extract subjects for graphics and presentations" },
    { icon: "📱", title: "Social Media", desc: "Create stickers and engaging content" },
  ];

  return (
    <section className="bg-white py-12 px-4 border-t border-gray-100">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
          Perfect for every use case
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cases.map((c) => (
            <div key={c.title} className="flex flex-col items-center text-center p-4">
              <div className="text-3xl mb-2">{c.icon}</div>
              <p className="font-semibold text-gray-800 text-sm mb-1">{c.title}</p>
              <p className="text-xs text-gray-500">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    {
      q: "Is it really free?",
      a: "Yes! Guests get 3 free tries per day. Sign up for a free account to get 5 credits every month — no credit card required.",
    },
    {
      q: "How many images can I process?",
      a: "Guests: 1/month. Free accounts: 5/month. Pro: 30/month. Business: 100/month. You can also buy credit packs that never expire.",
    },
    {
      q: "Are my images stored on your servers?",
      a: "No. Images are processed in memory and immediately discarded. We never store your original or result images.",
    },
    {
      q: "What image formats are supported?",
      a: "JPG, PNG, and WEBP up to 20MB. Results are always delivered as transparent PNG.",
    },
    {
      q: "How accurate is the background removal?",
      a: "We use industry-leading AI that handles hair, fur, complex edges, and transparent objects with high accuracy.",
    },
    {
      q: "What are credit packs?",
      a: "One-time purchases of extra credits that never expire. They stack with your monthly plan and are used automatically when your monthly credits run out.",
    },
  ];

  return (
    <section className="py-14 px-4 bg-white border-t border-gray-100">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
          Frequently asked questions
        </h2>
        <div className="space-y-2">
          {faqs.map((item, i) => (
            <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {item.q}
                <svg
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ user }: { user: User | null }) {
  return (
    <section className="py-14 px-4 bg-gradient-to-br from-indigo-600 to-indigo-700">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
          {user ? "Need more credits?" : "Get 5 free credits every month"}
        </h2>
        <p className="text-indigo-200 mb-8">
          {user
            ? "Upgrade your plan or buy a credit pack — they never expire."
            : "Sign up free. No credit card required. Upgrade anytime."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {user ? (
            <>
              <a
                href="/pricing"
                className="bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                View pricing →
              </a>
              <a
                href="/dashboard"
                className="border border-white/30 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                My dashboard
              </a>
            </>
          ) : (
            <>
              <a
                href="/api/auth/login"
                className="bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2 justify-center"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up free with Google
              </a>
              <a
                href="/pricing"
                className="border border-white/30 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                See pricing
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-gray-700 text-sm">BG Remover</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-400">
            <a href="/pricing" className="hover:text-gray-600">Pricing</a>
            <a href="/dashboard" className="hover:text-gray-600">Dashboard</a>
            <a href="mailto:support@image-backgroundremover.com" className="hover:text-gray-600">Support</a>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} BG Remover · Powered by AI
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [status, setStatus] = useState<Status>("idle");
  const [imageState, setImageState] = useState<ImageState>({
    originalUrl: null,
    resultUrl: null,
    originalName: "",
    originalSize: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string>("");

  // 获取登录用户信息
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => {});

    // 检查 URL 中的 auth_error
    const params = new URLSearchParams(window.location.search);
    const err = params.get("auth_error");
    if (err) {
      setAuthError(decodeURIComponent(err));
      window.history.replaceState({}, "", "/");
    }
  }, []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (imageState.originalUrl) URL.revokeObjectURL(imageState.originalUrl);
      if (imageState.resultUrl) URL.revokeObjectURL(imageState.resultUrl);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const processFile = useCallback(async (file: File) => {
    // Client-side validation
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMsg("Please upload an image file (JPG, PNG, WEBP).");
      setStatus("error");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg("Image must be under 20MB.");
      setStatus("error");
      return;
    }

    // Revoke previous URLs
    if (imageState.originalUrl) URL.revokeObjectURL(imageState.originalUrl);
    if (imageState.resultUrl) URL.revokeObjectURL(imageState.resultUrl);

    const originalUrl = URL.createObjectURL(file);
    setImageState({
      originalUrl,
      resultUrl: null,
      originalName: file.name,
      originalSize: formatBytes(file.size),
    });
    setStatus("processing");
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch("/api/remove-bg", { method: "POST", body: fd });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: `Error ${res.status}` }));
        // 区分额度用完 vs 普通错误
        if (body.error === "credits_exhausted" || body.error === "guest_limit_reached") {
          throw new Error(body.message || "Credits exhausted.");
        }
        throw new Error(body.error || `Server error ${res.status}`);
      }

      const blob = await res.blob();
      const resultUrl = URL.createObjectURL(blob);

      setImageState((prev) => ({ ...prev, resultUrl }));
      setStatus("done");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }, [imageState.originalUrl, imageState.resultUrl]);

  const handleDownload = () => {
    if (!imageState.resultUrl) return;
    const a = document.createElement("a");
    a.href = imageState.resultUrl;
    a.download = "removed-background.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    if (imageState.originalUrl) URL.revokeObjectURL(imageState.originalUrl);
    if (imageState.resultUrl) URL.revokeObjectURL(imageState.resultUrl);
    setStatus("idle");
    setImageState({ originalUrl: null, resultUrl: null, originalName: "", originalSize: "" });
    setErrorMsg("");
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header user={user} authError={authError} />

      {/* 额度预警 banner */}
      {user?.credits && user.credits.totalRemaining <= 2 && user.credits.totalRemaining > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2.5 text-center text-sm text-yellow-800">
          ⚠️ Only <strong>{user.credits.totalRemaining}</strong> credit{user.credits.totalRemaining > 1 ? "s" : ""} left this month.{" "}
          <a href="/pricing" className="underline font-semibold hover:text-yellow-900">Upgrade now →</a>
        </div>
      )}
      {user?.credits && user.credits.totalRemaining === 0 && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 text-center text-sm text-red-800">
          🚫 You've used all your credits.{" "}
          <a href="/pricing" className="underline font-semibold hover:text-red-900">Get more credits →</a>
        </div>
      )}

      <HeroSection />

      {/* Main interaction area */}
      <section className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {status === "idle" && (
          <UploadZone onFile={processFile} />
        )}
        {status === "processing" && (
          <ProcessingView originalUrl={imageState.originalUrl} />
        )}
        {status === "done" && (
          <ResultView
            imageState={imageState}
            onDownload={handleDownload}
            onReset={handleReset}
          />
        )}
        {status === "error" && (
          <ErrorView message={errorMsg} onRetry={handleReset} user={user} />
        )}
      </section>

      <FeaturesSection />
      <UseCasesSection />
      <FAQSection />
      <CTASection user={user} />
      <Footer />
    </main>
  );
}
