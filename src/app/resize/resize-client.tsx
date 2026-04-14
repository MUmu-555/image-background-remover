"use client";

import { useState } from "react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 20;

interface Preset {
  label: string;
  w: number;
  h: number;
  desc: string;
  color: string;
}

const PRESETS: Preset[] = [
  { label: "Instagram Post", w: 1080, h: 1080, desc: "1080 × 1080", color: "bg-pink-50 text-pink-700 border-pink-200" },
  { label: "Instagram Story", w: 1080, h: 1920, desc: "1080 × 1920", color: "bg-pink-50 text-pink-700 border-pink-200" },
  { label: "Twitter Post", w: 1200, h: 675, desc: "1200 × 675", color: "bg-sky-50 text-sky-700 border-sky-200" },
  { label: "Twitter Header", w: 1500, h: 500, desc: "1500 × 500", color: "bg-sky-50 text-sky-700 border-sky-200" },
  { label: "LinkedIn Post", w: 1200, h: 627, desc: "1200 × 627", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "LinkedIn Banner", w: 1584, h: 396, desc: "1584 × 396", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "Facebook Post", w: 1200, h: 630, desc: "1200 × 630", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { label: "YouTube Thumb", w: 1280, h: 720, desc: "1280 × 720", color: "bg-red-50 text-red-700 border-red-200" },
  { label: "HD (1080p)", w: 1920, h: 1080, desc: "1920 × 1080", color: "bg-gray-50 text-gray-700 border-gray-200" },
  { label: "4K UHD", w: 3840, h: 2160, desc: "3840 × 2160", color: "bg-gray-50 text-gray-700 border-gray-200" },
];

type FitMode = "contain" | "cover" | "stretch";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / 1024 / 1024).toFixed(1) + " MB";
}

export default function ResizeClient() {
  const [dragOver, setDragOver] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lockAspect, setLockAspect] = useState(true);
  const [fitMode, setFitMode] = useState<FitMode>("contain");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resizing, setResizing] = useState(false);

  const loadFile = (file: File) => {
    if (!ACCEPTED.includes(file.type)) return;
    if (file.size > MAX_MB * 1024 * 1024) return;
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setOrigW(img.width);
      setOrigH(img.height);
      setWidth(String(img.width));
      setHeight(String(img.height));
    };
    img.src = url;
    setOriginalFile(file);
    setOriginalUrl(url);
    setResultUrl(null);
    setResultBlob(null);
  };

  const onWidthChange = (v: string) => {
    setWidth(v);
    if (lockAspect && origW && origH && v) {
      setHeight(String(Math.round((Number(v) / origW) * origH)));
    }
  };
  const onHeightChange = (v: string) => {
    setHeight(v);
    if (lockAspect && origW && origH && v) {
      setWidth(String(Math.round((Number(v) / origH) * origW)));
    }
  };
  const applyPreset = (p: Preset) => {
    setWidth(String(p.w));
    setHeight(String(p.h));
    setLockAspect(false);
  };

  const doResize = async () => {
    if (!originalFile || !originalUrl) return;
    const tw = parseInt(width);
    const th = parseInt(height);
    if (!tw || !th || tw < 1 || th < 1) return;
    setResizing(true);
    const img = new Image();
    img.src = originalUrl;
    await new Promise((res) => { img.onload = res; });
    const canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, tw, th);
    if (fitMode === "stretch") {
      ctx.drawImage(img, 0, 0, tw, th);
    } else if (fitMode === "cover") {
      const scale = Math.max(tw / img.width, th / img.height);
      const sw = img.width * scale, sh = img.height * scale;
      ctx.drawImage(img, (tw - sw) / 2, (th - sh) / 2, sw, sh);
    } else {
      // contain
      const scale = Math.min(tw / img.width, th / img.height);
      const sw = img.width * scale, sh = img.height * scale;
      ctx.drawImage(img, (tw - sw) / 2, (th - sh) / 2, sw, sh);
    }
    const mime = originalFile.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), mime, 0.92));
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultBlob(blob);
    setResultUrl(URL.createObjectURL(blob));
    setResizing(false);
  };

  const download = () => {
    if (!resultUrl || !originalFile) return;
    const ext = originalFile.type === "image/png" ? "png" : "jpg";
    const base = originalFile.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${base}-${width}x${height}.${ext}`;
    a.click();
  };

  const reset = () => {
    setOriginalFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setResultBlob(null);
    setWidth("");
    setHeight("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">📐 Image Resizer</h1>
          <p className="text-gray-500 text-lg">Resize images to any dimension — free & private, all in your browser.</p>
        </div>

        {!originalFile && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${dragOver ? "border-rose-400 bg-rose-50" : "border-gray-200 hover:border-rose-300"}`}
          >
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" id="resize-input" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
            <label htmlFor="resize-input" className="cursor-pointer block">
              <div className="text-5xl mb-4">📐</div>
              <p className="text-gray-700 font-semibold text-lg mb-1">Upload an image to resize</p>
              <p className="text-gray-400 text-sm mb-6">JPG · PNG · WebP · Max {MAX_MB} MB</p>
              <span className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-8 py-3 rounded-full text-sm transition-colors">Choose Image</span>
            </label>
          </div>
        )}

        {originalFile && (
          <div className="space-y-5">
            {/* File info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              {originalUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={originalUrl} alt="original" className="w-20 h-20 object-contain rounded-xl border border-gray-100 bg-gray-50 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{originalFile.name}</p>
                <p className="text-sm text-gray-400">{formatBytes(originalFile.size)} · {origW} × {origH} px</p>
                {resultBlob && (
                  <p className="text-sm text-green-600 font-medium mt-1">✅ Resized to {width} × {height} px · {formatBytes(resultBlob.size)}</p>
                )}
              </div>
              <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">✕</button>
            </div>

            {/* Presets */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">⚡ Quick Presets</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-all hover:shadow-sm ${p.color}`}
                  >
                    <span className="block font-semibold">{p.label}</span>
                    <span className="opacity-70">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom dimensions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">📏 Custom Size</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block">Width (px)</label>
                  <input
                    type="number" min={1} max={8000} value={width}
                    onChange={(e) => onWidthChange(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    placeholder="e.g. 1920"
                  />
                </div>
                <button
                  onClick={() => setLockAspect(!lockAspect)}
                  title={lockAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                  className={`mt-5 w-9 h-9 rounded-lg border-2 flex items-center justify-center text-base transition-colors ${lockAspect ? "border-rose-400 bg-rose-50" : "border-gray-200 bg-gray-50"}`}
                >
                  {lockAspect ? "🔒" : "🔓"}
                </button>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block">Height (px)</label>
                  <input
                    type="number" min={1} max={8000} value={height}
                    onChange={(e) => onHeightChange(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    placeholder="e.g. 1080"
                  />
                </div>
              </div>
            </div>

            {/* Fit mode + bg color */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">🖼️ Fit Mode</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: "contain", label: "Contain", desc: "Fit inside, add padding" },
                    { id: "cover", label: "Cover", desc: "Fill & crop to fit" },
                    { id: "stretch", label: "Stretch", desc: "Distort to exact size" },
                  ] as const).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setFitMode(m.id)}
                      className={`p-3 rounded-xl border-2 text-left text-xs transition-all ${fitMode === m.id ? "border-rose-400 bg-rose-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <p className="font-bold text-gray-800">{m.label}</p>
                      <p className="text-gray-400 mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              {fitMode === "contain" && (
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600 font-medium">Padding color:</label>
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                  <span className="text-xs text-gray-400">{bgColor}</span>
                  {[["#FFFFFF", "White"], ["#000000", "Black"], ["transparent", "Transparent"]].map(([c, n]) => (
                    <button key={c} onClick={() => setBgColor(c === "transparent" ? "#FFFFFF" : c)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">{n}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={doResize}
                disabled={resizing || !width || !height}
                className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {resizing
                  ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Resizing…</>
                  : `📐 Resize to ${width || "?"}×${height || "?"}`}
              </button>
              {resultUrl && (
                <button onClick={download} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                  ⬇️ Download
                </button>
              )}
            </div>
            {resultUrl && (
              <button onClick={reset} className="w-full border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                ↩ Resize Another
              </button>
            )}
          </div>
        )}

        <div className="mt-12 grid sm:grid-cols-3 gap-5 text-center">
          {[
            { icon: "📱", title: "Social Presets", desc: "One-click presets for Instagram, Twitter, LinkedIn, YouTube, and more." },
            { icon: "🔒", title: "100% Private", desc: "All resizing happens in your browser. Files never leave your device." },
            { icon: "🔒", title: "Aspect Lock", desc: "Lock the aspect ratio to resize proportionally without distortion." },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
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
