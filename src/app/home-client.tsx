"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  trackUpload,
  trackRemoveSuccess,
  trackRemoveError,
  trackDownload,
  trackCopy,
} from "@/lib/gtag";

// ─── Types ───────────────────────────────────────────────────────────────────
type Status = "idle" | "processing" | "done" | "error" | "batch-preview" | "batch";

interface BatchItem {
  id: string;
  file: File;
  originalUrl: string;
  status: "pending" | "processing" | "done" | "error";
  resultUrl?: string;
  resultBlob?: Blob;
  errorMsg?: string;
}

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
          <a href="/id-photo" className="hidden sm:inline text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors">
            ID Photo
          </a>
          <a href="/blog" className="hidden sm:inline text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors">
            Blog
          </a>
          <a href="/pricing" className="hidden sm:inline text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors">
            Pricing
          </a>
          {user ? (
            <UserMenu user={user} />
          ) : (
            <a
              href="/api/auth/login"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors shadow-sm"
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
  onFiles,
}: {
  onFile: (file: File) => void;
  onFiles: (files: File[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [tab, setTab] = useState<"single" | "batch">("single");
  const isBatch = tab === "batch";

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files || []).filter((f) =>
        ACCEPTED_TYPES.includes(f.type)
      );
      if (files.length === 1) onFile(files[0]);
      else if (files.length > 1) onFiles(files);
    },
    [onFile, onFiles]
  );

  const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length >= 1) onFile(files[0]);
    e.target.value = "";
  };

  const handleBatchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 1) onFile(files[0]);
    else if (files.length > 1) onFiles(files);
    e.target.value = "";
  };

  const inputId = isBatch ? "batch-file-input" : "single-file-input";

  return (
    <div className="space-y-0">
      {/* Tab switcher */}
      <div className="flex rounded-t-2xl overflow-hidden border border-b-0 border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setTab("single"); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
            !isBatch
              ? "bg-white text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Single Image
        </button>
        <div className="w-px bg-gray-200" />
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setTab("batch"); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
            isBatch
              ? "bg-white text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Batch Upload
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
            up to 20
          </span>
        </button>
      </div>

      {/* Hidden file inputs — label association is the reliable trigger */}
      <input
        id="single-file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleSingleChange}
      />
      <input
        id="batch-file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleBatchChange}
      />

      {/* Drop zone — label wraps everything so clicking anywhere opens file picker */}
      <label
        htmlFor={inputId}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { handleDrop(e); }}
        className={`
          block relative cursor-pointer border-2 border-dashed transition-all duration-200
          rounded-b-2xl text-center
          ${isDragging
            ? "border-indigo-500 bg-indigo-50 scale-[1.005]"
            : isBatch
              ? "border-indigo-300 bg-indigo-50/40 hover:border-indigo-400 hover:bg-indigo-50"
              : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/50"
          }
        `}
      >
        <div className="flex flex-col items-center justify-center p-10 sm:p-14">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
            isDragging ? "bg-indigo-200" : isBatch ? "bg-indigo-100" : "bg-gray-100"
          }`}>
            {isBatch ? (
              <svg className={`w-8 h-8 ${isDragging ? "text-indigo-700" : "text-indigo-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            ) : (
              <svg className={`w-8 h-8 transition-colors ${isDragging ? "text-indigo-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            )}
          </div>

          {isBatch ? (
            <>
              <p className="text-xl font-semibold text-gray-800 mb-1">
                {isDragging ? "Drop all images here" : "Click to select multiple images"}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Select up to <strong>20 images</strong> — hold <kbd className="bg-gray-100 border border-gray-300 text-gray-600 text-xs px-1.5 py-0.5 rounded font-mono">Ctrl</kbd> / <kbd className="bg-gray-100 border border-gray-300 text-gray-600 text-xs px-1.5 py-0.5 rounded font-mono">⌘</kbd> to pick multiple
              </p>
              <p className="text-xs text-gray-400 mb-6">
                JPG, PNG, WEBP · Max {MAX_SIZE_MB}MB each · Download all as ZIP
              </p>
              <span className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-sm pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Select Images
              </span>
              <p className="mt-4 text-xs text-gray-400">Or drag & drop multiple files here</p>
            </>
          ) : (
            <>
              <p className="text-xl font-semibold text-gray-700 mb-1">
                {isDragging ? "Drop your image here" : "Click to select an image"}
              </p>
              <p className="text-sm text-gray-400 mb-6">
                JPG, PNG, WEBP · Max {MAX_SIZE_MB}MB
              </p>
              <span className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-sm pointer-events-none">
                Choose Image
              </span>
              <p className="mt-4 text-xs text-gray-400">
                Or drag & drop · Works best with people, products, animals
              </p>
            </>
          )}
        </div>
      </label>
    </div>
  );
}

// ─── Batch View ───────────────────────────────────────────────────────────────
// ─── Batch Preview (before processing) ───────────────────────────────────────
function BatchPreviewView({
  items,
  onRemove,
  onAddMore,
  onStart,
  onCancel,
}: {
  items: BatchItem[];
  onRemove: (id: string) => void;
  onAddMore: (files: File[]) => void;
  onStart: () => void;
  onCancel: () => void;
}) {
  const addMoreRef = useRef<HTMLInputElement>(null);

  const handleAddMore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (f) => ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_SIZE_MB * 1024 * 1024
    );
    if (files.length > 0) onAddMore(files);
    e.target.value = "";
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-lg">Review Images</h3>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
              {items.length} / 20
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Remove unwanted images, then click <strong>Start Processing</strong>.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {items.length < 20 && (
            <>
              <button
                type="button"
                onClick={() => addMoreRef.current?.click()}
                className="border border-gray-300 text-gray-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add More
              </button>
              <input
                ref={addMoreRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleAddMore}
              />
            </>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="border border-gray-300 text-gray-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onStart}
            disabled={items.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Processing ({items.length})
          </button>
        </div>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Preview */}
            <div className="relative aspect-square bg-gray-50">
              <img
                src={item.originalUrl}
                alt={item.file.name}
                className="w-full h-full object-contain"
              />
              {/* Delete button — always visible on mobile, hover on desktop */}
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                title="Remove image"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* File info */}
            <div className="p-2">
              <p className="text-xs text-gray-600 truncate" title={item.file.name}>
                {item.file.name}
              </p>
              <p className="text-xs text-gray-400">{(item.file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          </div>
        ))}

        {/* Add more slot */}
        {items.length < 20 && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 flex flex-col items-center justify-center cursor-pointer transition-colors group">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleAddMore}
            />
            <svg className="w-8 h-8 text-gray-300 group-hover:text-indigo-400 transition-colors mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs text-gray-400 group-hover:text-indigo-500 font-medium">Add more</span>
          </label>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4">
        <p className="text-sm text-indigo-700">
          <span className="font-semibold">{items.length}</span> image{items.length !== 1 ? "s" : ""} ready to process
        </p>
        <button
          type="button"
          onClick={onStart}
          disabled={items.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Start Processing
        </button>
      </div>
    </div>
  );
}

// ─── Batch View (processing & results) ───────────────────────────────────────
function BatchView({
  items,
  onReset,
}: {
  items: BatchItem[];
  onReset: () => void;
}) {
  const doneItems = items.filter((i) => i.status === "done" && i.resultBlob);
  const allDone = items.every((i) => i.status === "done" || i.status === "error");

  const BG_PRESETS = [
    { label: "Transparent", value: "transparent" },
    { label: "White", value: "#ffffff" },
    { label: "Black", value: "#000000" },
    { label: "Light Gray", value: "#f3f4f6" },
    { label: "Red", value: "#fecaca" },
    { label: "Blue", value: "#bfdbfe" },
    { label: "Green", value: "#bbf7d0" },
    { label: "Yellow", value: "#fef08a" },
  ];

  const [bgColor, setBgColor] = useState<string>("transparent");

  // Compose a single blob with bg color applied
  const composedBlob = useCallback(async (blob: Blob): Promise<Blob> => {
    if (bgColor === "transparent") return blob;
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((b) => resolve(b || blob), "image/png");
      };
      img.src = url;
    });
  }, [bgColor]);

  const handleDownloadAll = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const JSZip = (await import("https://cdn.skypack.dev/jszip" as any)).default;
    const zip = new JSZip();
    await Promise.all(doneItems.map(async (item) => {
      const name = item.file.name.replace(/\.[^.]+$/, "") + "-removed.png";
      const blob = await composedBlob(item.resultBlob!);
      zip.file(name, blob);
    }));
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "removed-backgrounds.zip";
    a.click();
    URL.revokeObjectURL(url);
    trackDownload("zip");
  };

  const handleDownloadOne = async (item: BatchItem) => {
    if (!item.resultBlob) return;
    const blob = await composedBlob(item.resultBlob);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.file.name.replace(/\.[^.]+$/, "") + "-removed.png";
    a.click();
    URL.revokeObjectURL(url);
    trackDownload("png");
  };

  // Preview style: show bg color or checkerboard
  const previewStyle: React.CSSProperties =
    bgColor === "transparent"
      ? { backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='10' height='10' fill='%23eee'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23eee'/%3E%3Crect x='10' width='10' height='10' fill='%23fff'/%3E%3Crect y='10' width='10' height='10' fill='%23fff'/%3E%3C/svg%3E\")" }
      : { backgroundColor: bgColor };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-lg">Batch Processing</h3>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
              {items.length} images
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {allDone
              ? `✅ ${doneItems.length} of ${items.length} completed successfully`
              : `Processing… (${items.filter(i => i.status === "done" || i.status === "error").length}/${items.length} done)`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {allDone && doneItems.length > 1 && (
            <button
              onClick={handleDownloadAll}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download All ZIP
            </button>
          )}
          {allDone && doneItems.length === 1 && (
            <button
              onClick={() => handleDownloadOne(doneItems[0])}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download PNG
            </button>
          )}
          {allDone && (
            <button
              onClick={onReset}
              className="border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              New Batch
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {!allDone && (
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="h-2.5 bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${(items.filter(i => i.status === "done" || i.status === "error").length / items.length) * 100}%` }}
          />
        </div>
      )}

      {/* Background color picker */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Background Color
          <span className="normal-case font-normal text-gray-400 ml-1">— applied to all images on download</span>
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          {BG_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setBgColor(preset.value)}
              title={preset.label}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                bgColor === preset.value
                  ? "border-indigo-500 scale-110 shadow-md"
                  : "border-gray-200 hover:border-gray-400"
              } ${preset.value === "transparent" ? "checkerboard" : ""}`}
              style={preset.value !== "transparent" ? { backgroundColor: preset.value } : {}}
            />
          ))}
          {/* Custom color picker */}
          <input
            type="color"
            value={bgColor === "transparent" ? "#ffffff" : bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-8 h-8 rounded-lg border-2 border-gray-200 cursor-pointer p-0.5"
            title="Custom color"
          />
          {bgColor !== "transparent" && (
            <button
              onClick={() => setBgColor("transparent")}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100"
            >
              Clear
            </button>
          )}
          <span className="ml-auto text-xs text-gray-400 hidden sm:inline">
            {bgColor === "transparent" ? "PNG with transparency" : `Background: ${bgColor}`}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Preview */}
            <div className="relative aspect-square" style={item.status === "done" && item.resultUrl ? previewStyle : { backgroundColor: "#f9fafb" }}>
              {item.status === "done" && item.resultUrl ? (
                <img
                  src={item.resultUrl}
                  alt={item.file.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <img src={item.originalUrl} alt={item.file.name} className="w-full h-full object-contain opacity-40" />
              )}
              {/* Status overlays */}
              {item.status === "processing" && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {item.status === "pending" && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                  <span className="text-xs text-gray-400">Pending</span>
                </div>
              )}
              {item.status === "error" && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50/80">
                  <span className="text-xs text-red-500 px-2 text-center">{item.errorMsg || "Error"}</span>
                </div>
              )}
              {item.status === "done" && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            {/* File name + download */}
            <div className="p-2">
              <p className="text-xs text-gray-600 truncate" title={item.file.name}>{item.file.name}</p>
              {item.status === "done" && (
                <button
                  onClick={() => handleDownloadOne(item)}
                  className="mt-1.5 w-full text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 py-1 rounded-lg transition-colors"
                >
                  Download
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
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

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
        onClick={onClose}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img
        src={src}
        alt="Full size preview"
        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ─── Before/After Slider ──────────────────────────────────────────────────────
function BeforeAfterSlider({
  originalUrl,
  resultUrl,
  bgColor,
}: {
  originalUrl: string;
  resultUrl: string;
  bgColor: string;
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const onMouseDown = () => { dragging.current = true; };
  const onMouseMove = (e: React.MouseEvent) => { if (dragging.current) updatePos(e.clientX); };
  const onMouseUp = () => { dragging.current = false; };
  const onTouchMove = (e: React.TouchEvent) => { updatePos(e.touches[0].clientX); };

  const resultBgStyle =
    bgColor === "transparent"
      ? { backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='10' height='10' fill='%23eee'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23eee'/%3E%3Crect x='10' width='10' height='10' fill='%23fff'/%3E%3Crect y='10' width='10' height='10' fill='%23fff'/%3E%3C/svg%3E\")" }
      : { backgroundColor: bgColor };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden border border-gray-200 select-none cursor-col-resize"
      style={{ minHeight: 240 }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchEnd={() => { dragging.current = false; }}
    >
      {/* Result (right / full background) */}
      <div className="absolute inset-0 flex items-center justify-center" style={resultBgStyle}>
        <img src={resultUrl} alt="Result" className="max-h-72 w-full object-contain" draggable={false} />
      </div>

      {/* Original (left clip) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center" style={{ width: containerRef.current?.offsetWidth ?? 600 }}>
          <img src={originalUrl} alt="Original" className="max-h-72 w-full object-contain" draggable={false} />
        </div>
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${sliderPos}%` }}
      >
        {/* Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-white rounded-full shadow-xl border border-gray-200 flex items-center justify-center cursor-col-resize"
          onMouseDown={onMouseDown}
          onTouchStart={() => { dragging.current = true; }}
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-2 left-3 bg-black/40 text-white text-xs font-semibold px-2 py-0.5 rounded-full pointer-events-none">
        Original
      </div>
      <div className="absolute top-2 right-3 bg-indigo-600/80 text-white text-xs font-semibold px-2 py-0.5 rounded-full pointer-events-none">
        Removed
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
  onDownload: (bg?: string) => void;
  onReset: () => void;
}) {
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [copied, setCopied] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"split" | "slider">("split");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const BG_PRESETS = [
    { label: "None", value: "transparent" },
    { label: "White", value: "#ffffff" },
    { label: "Black", value: "#000000" },
    { label: "Gray", value: "#f3f4f6" },
    { label: "Red", value: "#fecaca" },
    { label: "Blue", value: "#bfdbfe" },
    { label: "Green", value: "#bbf7d0" },
    { label: "Yellow", value: "#fef08a" },
  ];

  const getComposedBlob = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!imageState.resultUrl) return resolve(null);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        if (bgColor !== "transparent") {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const mime = bgColor === "transparent" ? "image/png" : "image/png";
        canvas.toBlob((blob) => resolve(blob), mime);
      };
      img.src = imageState.resultUrl;
    });
  }, [imageState.resultUrl, bgColor]);

  const handleCopy = async () => {
    try {
      const blob = await getComposedBlob();
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackCopy();
    } catch {
      alert("Copy not supported in this browser. Please download instead.");
    }
  };

  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpg">("png");

  const handleDownloadWithBg = async () => {
    const isJpg = downloadFormat === "jpg";
    // JPG 必须有背景色，默认白色
    const effectiveBg = isJpg && bgColor === "transparent" ? "#ffffff" : bgColor;

    if (!isJpg && effectiveBg === "transparent") {
      onDownload();
      trackDownload("png");
      return;
    }

    // 用 canvas 合成
    const blob = await new Promise<Blob | null>((resolve) => {
      if (!imageState.resultUrl) return resolve(null);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        if (effectiveBg !== "transparent") {
          ctx.fillStyle = effectiveBg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((b) => resolve(b), isJpg ? "image/jpeg" : "image/png", isJpg ? 0.92 : undefined);
      };
      img.src = imageState.resultUrl;
    });

    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const base = imageState.originalName?.replace(/\.[^.]+$/, "") || "removed-background";
    a.download = `${base}-removed.${isJpg ? "jpg" : "png"}`;
    a.click();
    URL.revokeObjectURL(url);
    trackDownload(isJpg ? "jpg" : "png");
  };

  // 预览图（带背景色合成）
  const previewStyle =
    bgColor === "transparent"
      ? { backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='10' height='10' fill='%23eee'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23eee'/%3E%3Crect x='10' width='10' height='10' fill='%23fff'/%3E%3Crect y='10' width='10' height='10' fill='%23fff'/%3E%3C/svg%3E\")" }
      : { backgroundColor: bgColor };

  return (
    <div className="space-y-5">
      {/* Lightbox */}
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

      {/* File info + view toggle */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{imageState.originalName} · {imageState.originalSize}</span>
        <div className="flex items-center gap-3">
          <span className="text-green-600 font-semibold">✓ Background removed</span>
          <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("split")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${viewMode === "split" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode("slider")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${viewMode === "slider" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Slider
            </button>
          </div>
        </div>
      </div>

      {/* Image comparison */}
      {viewMode === "slider" && imageState.originalUrl && imageState.resultUrl ? (
        <BeforeAfterSlider
          originalUrl={imageState.originalUrl}
          resultUrl={imageState.resultUrl}
          bgColor={bgColor}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 pt-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Original</span>
            </div>
            <div className="bg-gray-50 flex items-center justify-center p-4 min-h-48">
              {imageState.originalUrl && (
                <img
                  src={imageState.originalUrl}
                  alt="Original"
                  className="max-h-56 max-w-full object-contain rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity"
                  onClick={() => setLightboxSrc(imageState.originalUrl!)}
                />
              )}
            </div>
          </div>

          {/* Result with background */}
          <div className="bg-white rounded-2xl border-2 border-indigo-200 overflow-hidden ring-1 ring-indigo-100">
            <div className="px-4 pt-3 pb-2 border-b border-indigo-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Background Removed</span>
              <span className="ml-auto text-xs text-green-600 font-semibold">✓ Done</span>
            </div>
            <div className="flex items-center justify-center p-4 min-h-48" style={previewStyle}>
              {imageState.resultUrl && (
                <img
                  src={imageState.resultUrl}
                  alt="Background removed"
                  className="max-h-56 max-w-full object-contain rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity"
                  onClick={() => setLightboxSrc(imageState.resultUrl!)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Background color picker */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Background Color</p>
        <div className="flex flex-wrap gap-2 items-center">
          {BG_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setBgColor(preset.value)}
              title={preset.label}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                bgColor === preset.value ? "border-indigo-500 scale-110 shadow-md" : "border-gray-200 hover:border-gray-400"
              } ${preset.value === "transparent" ? "checkerboard" : ""}`}
              style={preset.value !== "transparent" ? { backgroundColor: preset.value } : {}}
            />
          ))}
          {/* Custom color picker */}
          <div className="relative">
            <input
              type="color"
              value={bgColor === "transparent" ? "#ffffff" : bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-8 h-8 rounded-lg border-2 border-gray-200 cursor-pointer p-0.5"
              title="Custom color"
            />
          </div>
          {bgColor !== "transparent" && (
            <button
              onClick={() => setBgColor("transparent")}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Format toggle + Download */}
        <div className="flex-1 flex rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={handleDownloadWithBg}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold px-5 py-3.5 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download {downloadFormat.toUpperCase()}
          </button>
          {/* Format picker */}
          <div className="flex border-l border-indigo-500 bg-indigo-600">
            {(["png", "jpg"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setDownloadFormat(fmt)}
                className={`px-3 py-3.5 text-xs font-bold transition-colors ${
                  downloadFormat === fmt
                    ? "bg-indigo-800 text-white"
                    : "text-indigo-200 hover:text-white hover:bg-indigo-700"
                }`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex-1 sm:flex-none sm:px-6 py-3.5 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-xl border border-gray-300 transition-colors flex items-center justify-center gap-2"
        >
          {copied ? (
            <><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Copied!</>
          ) : (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy</>
          )}
        </button>
        <button
          onClick={onReset}
          className="flex-1 sm:flex-none sm:px-6 py-3.5 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-xl border border-gray-300 transition-colors"
        >
          Remove Another
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
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
    {
      emoji: "📦",
      title: "Batch Upload",
      desc: "Process up to 20 images at once. Download them all as a ZIP in one click.",
    },
  ];

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
          Why choose BG Remover?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
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

// ─── Blog Preview Section ─────────────────────────────────────────────────────

const BLOG_POSTS = [
  {
    slug: "how-to-remove-background-ecommerce",
    title: "How to Remove Image Backgrounds for E-Commerce Products",
    desc: "Clean product photos sell more. Get your images ready for Amazon, Shopify, and more in seconds.",
    tag: "E-Commerce",
    tagColor: "bg-blue-100 text-blue-700",
    icon: "🛒",
    iconBg: "bg-blue-50",
  },
  {
    slug: "remove-background-id-photo",
    title: "How to Remove Background from ID Photos (Free & Fast)",
    desc: "Need a white-background passport or visa photo? Done in seconds — no Photoshop required.",
    tag: "ID Photos",
    tagColor: "bg-green-100 text-green-700",
    icon: "🪪",
    iconBg: "bg-green-50",
  },
  {
    slug: "free-background-remover-tips",
    title: "5 Tips to Get the Best Results from an AI Background Remover",
    desc: "Practical tips on lighting, contrast, and file prep to get cleaner, sharper cutouts every time.",
    tag: "Tips & Tricks",
    tagColor: "bg-purple-100 text-purple-700",
    icon: "💡",
    iconBg: "bg-purple-50",
  },
];

function BlogPreviewSection() {
  return (
    <section className="py-14 px-4 bg-white border-t border-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Tutorials & Tips</h2>
            <p className="text-gray-500 mt-1 text-sm">Learn how to get the most out of AI background removal.</p>
          </div>
          <a
            href="/blog"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            View all posts
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {BLOG_POSTS.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}/`}
              className="group flex flex-col bg-gray-50 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all overflow-hidden"
            >
              {/* Icon banner */}
              <div className={`${post.iconBg} flex items-center justify-center h-20 text-4xl`}>
                {post.icon}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full w-fit mb-3 ${post.tagColor}`}>
                  {post.tag}
                </span>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug mb-2">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed flex-1">{post.desc}</p>
                <span className="mt-4 text-xs font-semibold text-indigo-600 group-hover:underline">Read more →</span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <a href="/blog" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            View all posts →
          </a>
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
                className="border-2 border-white/60 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/15 transition-colors"
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
                className="border-2 border-white/60 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/15 transition-colors"
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
            <a href="/id-photo" className="hover:text-gray-600">ID Photo</a>
            <a href="mailto:support@image-backgroundremover.com" className="hover:text-gray-600">Support</a>
            <a href="/privacy" className="hover:text-gray-600">Privacy</a>
            <a href="/terms" className="hover:text-gray-600">Terms</a>
            <a href="/blog" className="hover:text-gray-600">Blog</a>
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
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string>("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => {});

    const params = new URLSearchParams(window.location.search);
    const err = params.get("auth_error");
    if (err) {
      setAuthError(decodeURIComponent(err));
      window.history.replaceState({}, "", "/");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (imageState.originalUrl) URL.revokeObjectURL(imageState.originalUrl);
      if (imageState.resultUrl) URL.revokeObjectURL(imageState.resultUrl);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 单图处理 ─────────────────────────────────────────────
  const processFile = useCallback(async (file: File) => {
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

    if (imageState.originalUrl) URL.revokeObjectURL(imageState.originalUrl);
    if (imageState.resultUrl) URL.revokeObjectURL(imageState.resultUrl);

    const originalUrl = URL.createObjectURL(file);
    setImageState({ originalUrl, resultUrl: null, originalName: file.name, originalSize: formatBytes(file.size) });
    setStatus("processing");
    setErrorMsg("");
    trackUpload("single");

    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/remove-bg", { method: "POST", body: fd });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: `Error ${res.status}` }));
        if (body.error === "credits_exhausted" || body.error === "guest_limit_reached") {
          throw new Error(body.message || "Credits exhausted.");
        }
        throw new Error(body.error || `Server error ${res.status}`);
      }

      const blob = await res.blob();
      const resultUrl = URL.createObjectURL(blob);
      setImageState((prev) => ({ ...prev, resultUrl }));
      setStatus("done");
      trackRemoveSuccess("single");

      // 额度实时更新：处理成功后静默刷新用户信息
      fetch("/api/auth/me")
        .then((r) => r.json())
        .then((d) => { if (d.user) setUser(d.user); })
        .catch(() => {});
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : "unknown";
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
      trackRemoveError(reason);
    }
  }, [imageState.originalUrl, imageState.resultUrl]);

  // ── 批量处理 ─────────────────────────────────────────────
  const processFiles = useCallback(async (files: File[]) => {
    const valid = files.filter(
      (f) => ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_SIZE_MB * 1024 * 1024
    ).slice(0, 20); // 最多20张

    if (valid.length === 0) return;

    const items: BatchItem[] = valid.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      originalUrl: URL.createObjectURL(file),
      status: "pending",
    }));

    setBatchItems(items);
    setStatus("batch-preview"); // 先进预览，让用户确认后再处理
  }, []);

  // 用户点击"开始处理"后真正跑 API
  const startBatchProcessing = useCallback(async (items: BatchItem[]) => {
    if (items.length === 0) return;

    setStatus("batch");
    trackUpload("batch", items.length);

    // 逐一处理（串行，避免并发太多）
    let successCount = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      setBatchItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, status: "processing" } : x))
      );
      try {
        const fd = new FormData();
        fd.append("image", item.file);
        const res = await fetch("/api/remove-bg", { method: "POST", body: fd });
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: `Error ${res.status}` }));
          throw new Error(body.message || body.error || `Error ${res.status}`);
        }
        const blob = await res.blob();
        const resultUrl = URL.createObjectURL(blob);
        setBatchItems((prev) =>
          prev.map((x) =>
            x.id === item.id ? { ...x, status: "done", resultUrl, resultBlob: blob } : x
          )
        );
        successCount++;
      } catch (err: unknown) {
        setBatchItems((prev) =>
          prev.map((x) =>
            x.id === item.id
              ? { ...x, status: "error", errorMsg: err instanceof Error ? err.message : "Failed" }
              : x
          )
        );
      }
    }
    if (successCount > 0) trackRemoveSuccess("batch", successCount);
  }, []);

  // 预览阶段：删除某张图
  const handleBatchRemove = useCallback((id: string) => {
    setBatchItems((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item) URL.revokeObjectURL(item.originalUrl);
      const next = prev.filter((x) => x.id !== id);
      if (next.length === 0) setStatus("idle");
      return next;
    });
  }, []);

  // 预览阶段：追加更多图片
  const handleBatchAddMore = useCallback((files: File[]) => {
    setBatchItems((prev) => {
      const remaining = 20 - prev.length;
      if (remaining <= 0) return prev;
      const newItems: BatchItem[] = files.slice(0, remaining).map((file) => ({
        id: Math.random().toString(36).slice(2),
        file,
        originalUrl: URL.createObjectURL(file),
        status: "pending",
      }));
      return [...prev, ...newItems];
    });
  }, []);

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
    batchItems.forEach((item) => {
      URL.revokeObjectURL(item.originalUrl);
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    });
    setStatus("idle");
    setImageState({ originalUrl: null, resultUrl: null, originalName: "", originalSize: "" });
    setBatchItems([]);
    setErrorMsg("");
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header user={user} authError={authError} />

      {user?.credits && user.credits.totalRemaining <= 2 && user.credits.totalRemaining > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2.5 text-center text-sm text-yellow-800">
          ⚠️ Only <strong>{user.credits.totalRemaining}</strong> credit{user.credits.totalRemaining > 1 ? "s" : ""} left this month.{" "}
          <a href="/pricing" className="underline font-semibold hover:text-yellow-900">Upgrade now →</a>
        </div>
      )}
      {user?.credits && user.credits.totalRemaining === 0 && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 text-center text-sm text-red-800">
          🚫 You&apos;ve used all your credits.{" "}
          <a href="/pricing" className="underline font-semibold hover:text-red-900">Get more credits →</a>
        </div>
      )}

      <HeroSection />

      <section className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {status === "idle" && (
          <UploadZone onFile={processFile} onFiles={processFiles} />
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
        {status === "batch-preview" && (
          <BatchPreviewView
            items={batchItems}
            onRemove={handleBatchRemove}
            onAddMore={handleBatchAddMore}
            onStart={() => startBatchProcessing(batchItems)}
            onCancel={handleReset}
          />
        )}
        {status === "batch" && (
          <BatchView items={batchItems} onReset={handleReset} />
        )}
      </section>

      <FeaturesSection />
      <UseCasesSection />
      <FAQSection />
      <BlogPreviewSection />
      <CTASection user={user} />
      <Footer />
    </main>
  );
}
