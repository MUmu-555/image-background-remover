"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { event } from "@/lib/gtag";

// ─── Types ───────────────────────────────────────────────────────────────────
type Step = "upload" | "processing" | "done" | "error";

interface PhotoSize {
  id: string;
  label: string;
  description: string;
  widthMm: number;
  heightMm: number;
  widthPx: number; // at 300 dpi
  heightPx: number;
}

interface BgColor {
  id: string;
  label: string;
  hex: string;
  border?: string;
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

// ─── Constants ───────────────────────────────────────────────────────────────

const PHOTO_SIZES: PhotoSize[] = [
  {
    id: "2x2",
    label: '2×2"',
    description: "US Passport / Visa",
    widthMm: 51,
    heightMm: 51,
    widthPx: 600,
    heightPx: 600,
  },
  {
    id: "35x45",
    label: "35×45 mm",
    description: "UK / EU Passport",
    widthMm: 35,
    heightMm: 45,
    widthPx: 413,
    heightPx: 531,
  },
  {
    id: "30x40",
    label: "30×40 mm",
    description: "China Visa / General ID",
    widthMm: 30,
    heightMm: 40,
    widthPx: 354,
    heightPx: 472,
  },
  {
    id: "33x48",
    label: "33×48 mm",
    description: "Chinese Passport",
    widthMm: 33,
    heightMm: 48,
    widthPx: 390,
    heightPx: 567,
  },
  {
    id: "40x40",
    label: "40×40 mm",
    description: "Square ID",
    widthMm: 40,
    heightMm: 40,
    widthPx: 472,
    heightPx: 472,
  },
];

const BG_COLORS: BgColor[] = [
  {
    id: "white",
    label: "Pure White",
    hex: "#FFFFFF",
    border: "border border-gray-200",
  },
  { id: "lightgray", label: "Light Gray", hex: "#F5F5F5", border: "border border-gray-200" },
  { id: "lightblue", label: "Light Blue", hex: "#D6E8F7" },
  { id: "cream", label: "Cream", hex: "#FDF6EC" },
];

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 20;

// ─── Canvas composer ──────────────────────────────────────────────────────────

async function compositeIdPhoto(
  transparentBlob: Blob,
  bgHex: string,
  targetW: number,
  targetH: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(transparentBlob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d")!;

      // Fill background
      ctx.fillStyle = bgHex;
      ctx.fillRect(0, 0, targetW, targetH);

      // Scale image to fill (cover), centered
      const scale = Math.max(targetW / img.width, targetH / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      const sx = (targetW - sw) / 2;
      const sy = (targetH - sh) / 2;

      ctx.drawImage(img, sx, sy, sw, sh);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas export failed"));
        },
        "image/jpeg",
        0.95
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };
    img.src = url;
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IdPhotoClient() {
  const [step, setStep] = useState<Step>("upload");
  const [user, setUser] = useState<User | null>(null);
  const [selectedSize, setSelectedSize] = useState<PhotoSize>(PHOTO_SIZES[0]);
  const [selectedBg, setSelectedBg] = useState<BgColor>(BG_COLORS[0]);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [transparentBlob, setTransparentBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [recomposing, setRecomposing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
      })
      .catch(() => {});
  }, []);

  // Re-composite when bg or size changes after we have transparent blob
  useEffect(() => {
    if (!transparentBlob || step !== "done") return;
    setRecomposing(true);
    compositeIdPhoto(transparentBlob, selectedBg.hex, selectedSize.widthPx, selectedSize.heightPx)
      .then((blob) => {
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        const url = URL.createObjectURL(blob);
        setResultBlob(blob);
        setResultUrl(url);
      })
      .finally(() => setRecomposing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBg, selectedSize, transparentBlob]);

  const processFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setErrorMsg("Please upload a JPG, PNG, or WebP image.");
        setStep("error");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setErrorMsg(`File too large. Max size is ${MAX_SIZE_MB} MB.`);
        setStep("error");
        return;
      }

      // Preview original
      const previewUrl = URL.createObjectURL(file);
      setOriginalUrl(previewUrl);
      setStep("processing");

      event("id_photo_upload", { size: selectedSize.id, bg: selectedBg.id });

      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/remove-bg", { method: "POST", body: formData });

        if (!res.ok) {
          // Error responses are JSON
          let errMsg = "Background removal failed.";
          try {
            const errData = await res.json();
            if (errData?.error) errMsg = errData.error;
          } catch {
            // ignore
          }
          throw new Error(errMsg);
        }

        // Success: API returns raw PNG binary
        const arrayBuffer = await res.arrayBuffer();
        const tBlob = new Blob([arrayBuffer], { type: "image/png" });
        setTransparentBlob(tBlob);

        // Composite with chosen bg + size
        const finalBlob = await compositeIdPhoto(
          tBlob,
          selectedBg.hex,
          selectedSize.widthPx,
          selectedSize.heightPx
        );
        const finalUrl = URL.createObjectURL(finalBlob);
        setResultBlob(finalBlob);
        setResultUrl(finalUrl);
        setStep("done");

        event("id_photo_success", { size: selectedSize.id, bg: selectedBg.id });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        setErrorMsg(msg);
        setStep("error");
        event("id_photo_error", { reason: msg });
      }
    },
    [selectedSize, selectedBg]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const downloadResult = () => {
    if (!resultBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(resultBlob);
    a.download = `id-photo-${selectedSize.id}.jpg`;
    a.click();
    event("id_photo_download", { size: selectedSize.id, bg: selectedBg.id });
  };

  const reset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setOriginalUrl(null);
    setResultUrl(null);
    setResultBlob(null);
    setTransparentBlob(null);
    setErrorMsg("");
    setStep("upload");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-bold text-gray-900 text-lg">
            <span className="text-2xl">✂️</span> BG Remover
          </a>
          <div className="flex items-center gap-1.5">
            <a href="/blog" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg transition-colors text-emerald-700 bg-emerald-100 hover:bg-emerald-200">Blog</a>
            <a href="/pricing" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg transition-colors text-amber-700 bg-amber-100 hover:bg-amber-200">Pricing</a>
            {user ? (
              <a href="/dashboard" className="flex items-center gap-2">
                {user.avatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                )}
              </a>
            ) : (
              <a
                href="/api/auth/login"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-colors"
              >
                Sign in
              </a>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* ── Header ── */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            🪪 ID Photo Maker
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Upload a portrait photo — AI removes the background and creates a professional ID photo in seconds.
          </p>
        </div>

        {/* ── Options (always visible) ── */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          {/* Size picker */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              📐 Photo Size
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {PHOTO_SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all ${
                    selectedSize.id === size.id
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <span className="font-medium">{size.label}</span>
                  <span className="text-xs text-gray-400">{size.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Background color picker */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              🎨 Background Color
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {BG_COLORS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBg(bg)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all text-sm ${
                    selectedBg.id === bg.id
                      ? "border-indigo-500 shadow-md"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex-shrink-0 ${bg.border ?? ""}`}
                    style={{ backgroundColor: bg.hex }}
                  />
                  <span className="text-gray-700 font-medium text-left leading-tight">{bg.label}</span>
                </button>
              ))}
            </div>

            {/* Live color preview swatch */}
            {step === "done" && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">Current background</p>
                <div
                  className="h-8 rounded-lg border border-gray-200 transition-colors"
                  style={{ backgroundColor: selectedBg.hex }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Upload / Result area ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {/* Upload */}
          {step === "upload" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
                dragOver ? "border-indigo-400 bg-indigo-50" : "border-gray-200 hover:border-indigo-300"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                id="id-photo-input"
                onChange={onFileChange}
              />
              <label htmlFor="id-photo-input" className="cursor-pointer block">
                <div className="text-5xl mb-4">🤳</div>
                <p className="text-gray-700 font-semibold text-lg mb-1">
                  Upload your portrait photo
                </p>
                <p className="text-gray-400 text-sm">
                  JPG, PNG, WebP · Max {MAX_SIZE_MB} MB · Drag & drop or click
                </p>
                <div className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-full transition-colors text-sm">
                  Choose Photo
                </div>
              </label>
            </div>
          )}

          {/* Processing */}
          {step === "processing" && (
            <div className="flex flex-col items-center py-16 gap-6">
              {originalUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={originalUrl}
                  alt="Original"
                  className="w-32 h-32 object-cover rounded-xl shadow opacity-60"
                />
              )}
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <p className="text-gray-600 font-medium">Removing background & generating ID photo…</p>
              </div>
            </div>
          )}

          {/* Error */}
          {step === "error" && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">😕</div>
              <p className="text-red-600 font-semibold text-lg mb-2">Something went wrong</p>
              <p className="text-gray-500 mb-6">{errorMsg}</p>
              <button
                onClick={reset}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-full transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Done */}
          {step === "done" && resultUrl && (
            <div>
              <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start justify-center">
                {/* Original */}
                <div className="text-center">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Original</p>
                  {originalUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={originalUrl}
                      alt="Original"
                      className="w-40 h-48 object-cover rounded-xl shadow border border-gray-100"
                    />
                  )}
                </div>

                {/* Arrow */}
                <div className="hidden sm:flex items-center self-center text-3xl text-gray-300">→</div>

                {/* Result */}
                <div className="text-center">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                    ID Photo · {selectedSize.label}
                  </p>
                  <div className="relative inline-block">
                    {recomposing && (
                      <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center z-10">
                        <svg className="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resultUrl}
                      alt="ID Photo Result"
                      className="w-40 h-48 object-contain rounded-xl shadow-md border border-gray-200"
                      style={{ backgroundColor: selectedBg.hex }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedSize.widthPx} × {selectedSize.heightPx} px · 300 dpi
                  </p>
                </div>
              </div>

              {/* Tip: change options live */}
              <p className="text-center text-xs text-indigo-500 mt-5 mb-6">
                💡 Change size or background above — preview updates instantly!
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={downloadResult}
                  disabled={recomposing}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  ⬇️ Download JPG
                </button>
                <button
                  onClick={reset}
                  className="border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-8 py-3 rounded-full transition-colors"
                >
                  ↩ New Photo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── How it works ── */}
        <div className="mt-12 grid sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: "📤", title: "Upload Portrait", desc: "Any photo with a person works. Face should be clearly visible." },
            { icon: "🤖", title: "AI Removes BG", desc: "Our AI precisely removes the background and isolates the subject." },
            { icon: "🎨", title: "Customize & Download", desc: "Choose size and background color, then download your ID photo." },
          ].map((step) => (
            <div key={step.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="text-3xl mb-3">{step.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Supported sizes table ── */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-4">📏 Supported ID Photo Sizes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-gray-400 font-medium">Size</th>
                  <th className="pb-2 text-gray-400 font-medium">Dimensions</th>
                  <th className="pb-2 text-gray-400 font-medium">Pixels (300 dpi)</th>
                  <th className="pb-2 text-gray-400 font-medium">Common Use</th>
                </tr>
              </thead>
              <tbody>
                {PHOTO_SIZES.map((s, i) => (
                  <tr key={s.id} className={i % 2 === 0 ? "bg-gray-50/50" : ""}>
                    <td className="py-2.5 pr-4 font-semibold text-gray-800">{s.label}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{s.widthMm}×{s.heightMm} mm</td>
                    <td className="py-2.5 pr-4 text-gray-600">{s.widthPx}×{s.heightPx} px</td>
                    <td className="py-2.5 text-gray-500">{s.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mt-10 space-y-4">
          <h2 className="font-bold text-gray-800 text-lg">❓ FAQ</h2>
          {[
            {
              q: "Is this ID Photo Maker free?",
              a: "Yes! Free users get 1 free processing per month (IP-based). Sign up for a free account to get 5 per month, or upgrade for more.",
            },
            {
              q: "What photo should I upload?",
              a: "Use a clear portrait photo with your face fully visible. A neutral expression and good lighting give the best results.",
            },
            {
              q: "Can I use this for official passport photos?",
              a: "Our tool generates photos at the correct pixel dimensions for common passport sizes. However, always verify requirements with your issuing authority.",
            },
            {
              q: "Can I change size and background after processing?",
              a: "Yes! Once processed, you can freely switch sizes and background colors — the preview updates instantly without re-processing.",
            },
          ].map(({ q, a }) => (
            <details key={q} className="bg-white rounded-xl border border-gray-100 shadow-sm group">
              <summary className="cursor-pointer px-5 py-4 font-semibold text-gray-800 list-none flex justify-between items-center">
                {q}
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="px-5 pb-4 text-sm text-gray-500">{a}</p>
            </details>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="mt-12 bg-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Need more ID photos?</h2>
          <p className="text-indigo-200 mb-6">
            Upgrade to Pro or Business for up to 100 photos per month.
          </p>
          <a
            href="/pricing"
            className="inline-block bg-white text-indigo-700 font-bold px-8 py-3 rounded-full hover:bg-indigo-50 transition-colors"
          >
            View Pricing →
          </a>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 mt-16 py-8 text-center text-xs text-gray-400">
        <div className="flex flex-wrap justify-center gap-4 mb-3">
          <a href="/" className="hover:text-gray-600">Home</a>
          <a href="/pricing" className="hover:text-gray-600">Pricing</a>
          <a href="/dashboard" className="hover:text-gray-600">Dashboard</a>
          <a href="/blog" className="hover:text-gray-600">Blog</a>
          <a href="/privacy" className="hover:text-gray-600">Privacy</a>
          <a href="/terms" className="hover:text-gray-600">Terms</a>
        </div>
        <p>© {new Date().getFullYear()} image-backgroundremover.com · All rights reserved.</p>
      </footer>
    </div>
  );
}
