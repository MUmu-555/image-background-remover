"use client";

import { useState, useRef, useCallback } from "react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 20;

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / 1024 / 1024).toFixed(1) + " MB";
}

export default function CompressClient() {
  const [dragOver, setDragOver] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [compressing, setCompressing] = useState(false);

  const compress = useCallback(async (file: File, q: number) => {
    setCompressing(true);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    await new Promise((res) => { img.onload = res; });
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    // white bg for jpg
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    // keep original mime; png stays png (lossless but still smaller via canvas)
    const mime = file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
    const qualityVal = mime === "image/png" ? undefined : q / 100;
    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), mime, qualityVal));
    setResultBlob(blob);
    setResultUrl(URL.createObjectURL(blob));
    setCompressing(false);
  }, [resultUrl]);

  const processFile = (file: File) => {
    if (!ACCEPTED.includes(file.type)) return;
    if (file.size > MAX_MB * 1024 * 1024) return;
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setResultBlob(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const download = () => {
    if (!resultUrl || !originalFile || !resultBlob) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    const ext = originalFile.type === "image/png" ? "png" : originalFile.type === "image/webp" ? "webp" : "jpg";
    const base = originalFile.name.replace(/\.[^.]+$/, "");
    a.download = `${base}-compressed.${ext}`;
    a.click();
  };

  const savedPct = originalFile && resultBlob
    ? Math.round((1 - resultBlob.size / originalFile.size) * 100)
    : 0;

  const reset = () => {
    setOriginalFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setResultBlob(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">🗜️ Image Compressor</h1>
          <p className="text-gray-500 text-lg">Reduce image file size instantly — free, private, no upload needed.</p>
        </div>

        {!originalFile && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${dragOver ? "border-violet-400 bg-violet-50" : "border-gray-200 hover:border-violet-300"}`}
          >
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" id="compress-input" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }} />
            <label htmlFor="compress-input" className="cursor-pointer block">
              <div className="text-5xl mb-4">🗜️</div>
              <p className="text-gray-700 font-semibold text-lg mb-1">Upload an image to compress</p>
              <p className="text-gray-400 text-sm mb-6">JPG · PNG · WebP · Max {MAX_MB} MB</p>
              <span className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3 rounded-full text-sm transition-colors">Choose Image</span>
            </label>
          </div>
        )}

        {originalFile && (
          <div className="space-y-5">
            {/* Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                {originalUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resultUrl || originalUrl} alt="preview" className="w-32 h-32 object-contain rounded-xl border border-gray-100 bg-gray-50" />
                )}
                <div className="flex-1 space-y-3 w-full">
                  <p className="font-semibold text-gray-800 truncate">{originalFile.name}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Original</p>
                      <p className="font-bold text-gray-700">{formatBytes(originalFile.size)}</p>
                    </div>
                    <div className={`rounded-xl p-3 text-center ${resultBlob ? "bg-green-50" : "bg-gray-50"}`}>
                      <p className="text-xs text-gray-400 mb-1">Compressed</p>
                      <p className={`font-bold ${resultBlob ? "text-green-600" : "text-gray-300"}`}>
                        {resultBlob ? formatBytes(resultBlob.size) : "—"}
                      </p>
                    </div>
                  </div>
                  {resultBlob && savedPct > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-center">
                      <span className="text-green-700 font-bold">🎉 Saved {savedPct}% ({formatBytes(originalFile.size - resultBlob.size)})</span>
                    </div>
                  )}
                </div>
                <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 transition-colors self-start">✕</button>
              </div>
            </div>

            {/* Quality */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">⚙️ Quality</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-violet-600">{quality}%</span>
                  <span className="text-xs text-gray-400">
                    {quality >= 85 ? "High quality" : quality >= 65 ? "Balanced" : "Max compression"}
                  </span>
                </div>
              </div>
              <input
                type="range" min={10} max={100} value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10% — Smallest file</span>
                <span>100% — Best quality</span>
              </div>
              {originalFile.type === "image/png" && (
                <p className="text-xs text-amber-600 mt-2">ℹ️ PNG is lossless — quality setting applies only to JPG/WebP.</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => compress(originalFile, quality)}
                disabled={compressing}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {compressing
                  ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Compressing…</>
                  : "🗜️ Compress"}
              </button>
              {resultUrl && (
                <button onClick={download} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                  ⬇️ Download
                </button>
              )}
            </div>
            {resultUrl && (
              <button onClick={reset} className="w-full border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                ↩ Compress Another
              </button>
            )}
          </div>
        )}

        <div className="mt-12 grid sm:grid-cols-3 gap-5 text-center">
          {[
            { icon: "🔒", title: "100% Private", desc: "Compression happens in your browser. Files never leave your device." },
            { icon: "🎚️", title: "Adjustable Quality", desc: "Drag the slider to find the perfect balance between size and quality." },
            { icon: "🆓", title: "Always Free", desc: "No account, no watermarks, no limits on file count." },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>

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
