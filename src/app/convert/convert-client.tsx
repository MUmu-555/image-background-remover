"use client";

import { useState, useRef, useCallback } from "react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 20;

type Format = "png" | "jpg" | "webp";

const FORMAT_INFO: Record<Format, { label: string; mime: string; ext: string; desc: string }> = {
  png: { label: "PNG", mime: "image/png", ext: "png", desc: "Lossless · Best for graphics & transparency" },
  jpg: { label: "JPG", mime: "image/jpeg", ext: "jpg", desc: "Lossy · Best for photos, smaller size" },
  webp: { label: "WebP", mime: "image/webp", ext: "webp", desc: "Modern · Smaller than PNG/JPG, broad support" },
};

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / 1024 / 1024).toFixed(1) + " MB";
}

export default function ConvertClient() {
  const [dragOver, setDragOver] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<Format>("jpg");
  const [quality, setQuality] = useState(92);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [converting, setConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convert = useCallback(async (file: File, fmt: Format, q: number) => {
    setConverting(true);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    await new Promise((res) => { img.onload = res; });
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    if (fmt !== "png") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    const mime = FORMAT_INFO[fmt].mime;
    const qualityVal = fmt === "png" ? undefined : q / 100;
    const blob = await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b!), mime, qualityVal)
    );
    const out = URL.createObjectURL(blob);
    setResultUrl(out);
    setResultSize(blob.size);
    setConverting(false);
  }, [resultUrl]);

  const processFile = (file: File) => {
    if (!ACCEPTED.includes(file.type)) return;
    if (file.size > MAX_MB * 1024 * 1024) return;
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setResultSize(0);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const download = () => {
    if (!resultUrl || !originalFile) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    const base = originalFile.name.replace(/\.[^.]+$/, "");
    a.download = `${base}.${FORMAT_INFO[targetFormat].ext}`;
    a.click();
  };

  const currentFormat = originalFile
    ? (originalFile.type === "image/jpeg" ? "jpg" : originalFile.type === "image/png" ? "png" : "webp")
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-bold text-gray-900 text-lg">
            <span className="text-2xl">✂️</span> BG Remover
          </a>
          <div className="flex items-center gap-1.5">
            <a href="/convert" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-sky-700 bg-sky-100 hover:bg-sky-200 transition-colors">Convert</a>
            <a href="/compress" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-violet-700 bg-violet-100 hover:bg-violet-200 transition-colors">Compress</a>
            <a href="/resize" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-rose-700 bg-rose-100 hover:bg-rose-200 transition-colors">Resize</a>
            <a href="/pricing" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors">Pricing</a>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">🔄 Image Format Converter</h1>
          <p className="text-gray-500 text-lg">Convert PNG, JPG, WebP instantly — free & private, all in your browser.</p>
        </div>

        {/* Upload */}
        {!originalFile && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${dragOver ? "border-sky-400 bg-sky-50" : "border-gray-200 hover:border-sky-300"}`}
          >
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" id="convert-input" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }} />
            <label htmlFor="convert-input" className="cursor-pointer block">
              <div className="text-5xl mb-4">🖼️</div>
              <p className="text-gray-700 font-semibold text-lg mb-1">Upload an image to convert</p>
              <p className="text-gray-400 text-sm mb-6">JPG · PNG · WebP · Max {MAX_MB} MB</p>
              <span className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-8 py-3 rounded-full text-sm transition-colors">Choose Image</span>
            </label>
          </div>
        )}

        {/* Editor */}
        {originalFile && (
          <div className="space-y-5">
            {/* Preview row */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-center">
              {originalUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={originalUrl} alt="original" className="w-32 h-32 object-contain rounded-xl border border-gray-100 bg-gray-50" />
              )}
              <div className="flex-1 space-y-1 text-sm">
                <p className="font-semibold text-gray-800 truncate">{originalFile.name}</p>
                <p className="text-gray-400">{formatBytes(originalFile.size)} · {currentFormat?.toUpperCase()}</p>
                {resultUrl && (
                  <p className="text-green-600 font-medium mt-2">
                    ✅ Converted · {formatBytes(resultSize)} ({FORMAT_INFO[targetFormat].label})
                    {resultSize < originalFile.size && (
                      <span className="ml-2 text-xs text-green-500">-{Math.round((1 - resultSize / originalFile.size) * 100)}%</span>
                    )}
                  </p>
                )}
              </div>
              <button onClick={() => { setOriginalFile(null); setOriginalUrl(null); setResultUrl(null); }} className="text-xs text-gray-400 hover:text-red-500 transition-colors">✕ Remove</button>
            </div>

            {/* Format picker */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">🎯 Convert To</p>
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(FORMAT_INFO) as Format[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setTargetFormat(fmt)}
                    disabled={fmt === currentFormat}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      fmt === currentFormat
                        ? "opacity-40 cursor-not-allowed border-gray-100 bg-gray-50"
                        : targetFormat === fmt
                          ? "border-sky-500 bg-sky-50"
                          : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-bold text-gray-800">{FORMAT_INFO[fmt].label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{FORMAT_INFO[fmt].desc}</p>
                    {fmt === currentFormat && <p className="text-xs text-gray-400 mt-1">Current format</p>}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality slider (only for jpg/webp) */}
            {targetFormat !== "png" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">⚙️ Quality</p>
                  <span className="text-sm font-bold text-sky-600">{quality}%</span>
                </div>
                <input
                  type="range" min={10} max={100} value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => convert(originalFile, targetFormat, quality)}
                disabled={converting || targetFormat === currentFormat}
                className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {converting ? (
                  <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Converting…</>
                ) : (
                  <>🔄 Convert to {FORMAT_INFO[targetFormat].label}</>
                )}
              </button>
              {resultUrl && (
                <button onClick={download} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                  ⬇️ Download {FORMAT_INFO[targetFormat].label}
                </button>
              )}
            </div>
            {resultUrl && (
              <button onClick={() => { setOriginalFile(null); setOriginalUrl(null); setResultUrl(null); }} className="w-full border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                ↩ Convert Another Image
              </button>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid sm:grid-cols-3 gap-5 text-center">
          {[
            { icon: "🔒", title: "100% Private", desc: "All conversion happens in your browser. Nothing is uploaded to our servers." },
            { icon: "⚡", title: "Instant", desc: "Conversion completes in milliseconds — no waiting, no queue." },
            { icon: "🆓", title: "Always Free", desc: "Format conversion is completely free, no account needed." },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-indigo-600 rounded-2xl p-7 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Also need to remove backgrounds?</h2>
          <p className="text-indigo-200 text-sm mb-4">Our AI removes image backgrounds in seconds — free.</p>
          <a href="/" className="inline-block bg-white text-indigo-700 font-bold px-6 py-2.5 rounded-full hover:bg-indigo-50 transition-colors text-sm">Try BG Remover →</a>
        </div>
      </main>

      <footer className="border-t border-gray-100 mt-12 py-6 text-center text-xs text-gray-400">
        <div className="flex flex-wrap justify-center gap-4 mb-2">
          <a href="/" className="hover:text-gray-600">Home</a>
          <a href="/convert" className="hover:text-gray-600">Convert</a>
          <a href="/compress" className="hover:text-gray-600">Compress</a>
          <a href="/resize" className="hover:text-gray-600">Resize</a>
          <a href="/id-photo" className="hover:text-gray-600">ID Photo</a>
          <a href="/pricing" className="hover:text-gray-600">Pricing</a>
        </div>
        <p>© {new Date().getFullYear()} image-backgroundremover.com</p>
      </footer>
    </div>
  );
}
