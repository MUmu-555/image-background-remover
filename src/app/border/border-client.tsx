"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 20;

const BORDER_COLOR_PRESETS = [
  "#ffffff", "#000000", "#374151", "#d1d5db",
  "#f59e0b", "#ef4444", "#6366f1", "#10b981",
];

const SHADOW_PRESETS = [
  { label: "None", blur: 0, offset: 0 },
  { label: "Soft", blur: 20, offset: 8 },
  { label: "Deep", blur: 40, offset: 16 },
  { label: "Float", blur: 60, offset: 24 },
];

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / 1024 / 1024).toFixed(1) + " MB";
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}

interface Settings {
  borderWidth: number;
  borderColor: string;
  radius: number;
  shadowBlur: number;
  shadowOffset: number;
  shadowColor: string;
  bgColor: string;
}

export default function BorderClient() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    borderWidth: 16,
    borderColor: "#ffffff",
    radius: 0,
    shadowBlur: 0,
    shadowOffset: 0,
    shadowColor: "#00000040",
    bgColor: "transparent",
  });
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [k]: v }));
    setResultUrl(null);
    setResultBlob(null);
  };

  const renderToCanvas = useCallback(async (maxW?: number): Promise<{ canvas: HTMLCanvasElement; w: number; h: number }> => {
    if (!originalUrl) throw new Error("No image");
    const img = await loadImage(originalUrl);
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const { borderWidth, borderColor, radius, shadowBlur, shadowOffset, bgColor } = settings;

    const padding = shadowBlur + Math.abs(shadowOffset) + borderWidth;
    const fullW = iw + padding * 2;
    const fullH = ih + padding * 2;

    const scale = maxW ? Math.min(1, maxW / fullW) : 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(fullW * scale);
    canvas.height = Math.round(fullH * scale);
    const ctx = canvas.getContext("2d")!;

    // transparent canvas bg
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bx = padding * scale;
    const by = padding * scale;
    const bw = iw * scale;
    const bh = ih * scale;
    const r = radius * scale;
    const brd = borderWidth * scale;
    const sBlur = shadowBlur * scale;
    const sOff = shadowOffset * scale;

    // Draw outer rect (border color) with shadow
    ctx.save();
    if (sBlur > 0 || sOff > 0) {
      ctx.shadowColor = settings.shadowColor;
      ctx.shadowBlur = sBlur;
      ctx.shadowOffsetX = sOff;
      ctx.shadowOffsetY = sOff;
    }

    // Rounded rect helper
    const roundRect = (x: number, y: number, w: number, h: number, rad: number) => {
      const maxR = Math.min(rad, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + maxR, y);
      ctx.lineTo(x + w - maxR, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + maxR);
      ctx.lineTo(x + w, y + h - maxR);
      ctx.quadraticCurveTo(x + w, y + h, x + w - maxR, y + h);
      ctx.lineTo(x + maxR, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - maxR);
      ctx.lineTo(x, y + maxR);
      ctx.quadraticCurveTo(x, y, x + maxR, y);
      ctx.closePath();
    };

    if (borderWidth > 0) {
      ctx.fillStyle = borderColor;
      roundRect(bx - brd, by - brd, bw + brd * 2, bh + brd * 2, r + brd);
      ctx.fill();
    } else if (sBlur > 0) {
      // Draw transparent shadow base
      ctx.fillStyle = "rgba(0,0,0,0.01)";
      roundRect(bx, by, bw, bh, r);
      ctx.fill();
    }
    ctx.restore();

    // Clip & draw image
    ctx.save();
    roundRect(bx, by, bw, bh, r);
    ctx.clip();

    if (bgColor !== "transparent") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(bx, by, bw, bh);
    }
    ctx.drawImage(img, bx, by, bw, bh);
    ctx.restore();

    return { canvas, w: fullW, h: fullH };
  }, [originalUrl, settings]);

  // Live preview
  useEffect(() => {
    if (!originalUrl || !previewRef.current) return;
    let cancelled = false;
    const maxW = previewRef.current.parentElement?.clientWidth ?? 500;
    renderToCanvas(maxW).then(({ canvas }) => {
      if (cancelled || !previewRef.current) return;
      previewRef.current.width = canvas.width;
      previewRef.current.height = canvas.height;
      const ctx = previewRef.current.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(canvas, 0, 0);
    });
    return () => { cancelled = true; };
  }, [originalUrl, settings, renderToCanvas]);

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

  const handleApply = async () => {
    setProcessing(true);
    try {
      const { canvas } = await renderToCanvas();
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultUrl || !originalFile) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    const base = originalFile.name.replace(/\.[^.]+$/, "");
    a.download = `${base}-bordered.png`;
    a.click();
  };

  const reset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setOriginalFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setResultBlob(null);
  };

  const { borderWidth, borderColor, radius, shadowBlur, shadowOffset, bgColor } = settings;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-bold text-gray-900 text-lg">
            <span className="text-2xl">✂️</span> BG Remover
          </a>
          <div className="flex items-center gap-1.5">
            <a href="/stitch" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-teal-700 bg-teal-100 hover:bg-teal-200 transition-colors">Stitch</a>
            <a href="/watermark" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-pink-700 bg-pink-100 hover:bg-pink-200 transition-colors">Watermark</a>
            <a href="/border" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors">Border</a>
            <a href="/pricing" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors">Pricing</a>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">🖼 Border & Corners</h1>
          <p className="text-gray-500 text-lg">Add borders, rounded corners, and shadows to any image — free, in your browser.</p>
        </div>

        {!originalFile && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${dragOver ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-orange-300"}`}
          >
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" id="border-input" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }} />
            <label htmlFor="border-input" className="cursor-pointer block">
              <div className="text-5xl mb-4">🖼</div>
              <p className="text-gray-700 font-semibold text-lg mb-1">Upload an image</p>
              <p className="text-gray-400 text-sm mb-6">JPG · PNG · WebP · Max {MAX_MB} MB</p>
              <span className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-full text-sm transition-colors">Choose Image</span>
            </label>
          </div>
        )}

        {originalFile && (
          <div className="space-y-5">
            {/* File info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={originalUrl!} alt="" className="w-14 h-14 object-contain rounded-lg border border-gray-100 bg-gray-50" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate text-sm">{originalFile.name}</p>
                <p className="text-xs text-gray-400">{formatBytes(originalFile.size)}</p>
              </div>
              <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 transition-colors">✕ Remove</button>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">⚙️ Border Settings</p>

              {/* Border width */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-500 font-medium">Border Width</p>
                  <span className="text-sm font-bold text-orange-500">{borderWidth} px</span>
                </div>
                <input type="range" min={0} max={120} value={borderWidth} onChange={(e) => set("borderWidth", Number(e.target.value))} className="w-full accent-orange-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0 — No border</span><span>120 px — Wide frame</span></div>
              </div>

              {/* Border color */}
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Border Color</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {BORDER_COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      onClick={() => set("borderColor", c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${borderColor === c ? "border-orange-500 scale-110" : "border-gray-200"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => set("borderColor", e.target.value)}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 cursor-pointer"
                    title="Custom color"
                  />
                  <span className="text-xs text-gray-400 font-mono">{borderColor}</span>
                </div>
              </div>

              {/* Corner radius */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-500 font-medium">Corner Radius</p>
                  <span className="text-sm font-bold text-orange-500">{radius} px</span>
                </div>
                <input type="range" min={0} max={200} value={radius} onChange={(e) => set("radius", Number(e.target.value))} className="w-full accent-orange-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0 — Sharp</span>
                  <span className="cursor-pointer hover:text-orange-500" onClick={() => set("radius", 9999)}>Max — Circle</span>
                </div>
                {/* Quick presets */}
                <div className="flex gap-2 mt-2">
                  {[[0, "Square"], [8, "Soft"], [24, "Rounded"], [9999, "Circle"]].map(([v, label]) => (
                    <button
                      key={label}
                      onClick={() => set("radius", v as number)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${radius === v ? "bg-orange-500 text-white border-orange-500" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-300"}`}
                    >{label}</button>
                  ))}
                </div>
              </div>

              {/* Shadow */}
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Drop Shadow</p>
                <div className="flex gap-2 mb-3">
                  {SHADOW_PRESETS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => { set("shadowBlur", s.blur); set("shadowOffset", s.offset); }}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors ${shadowBlur === s.blur && shadowOffset === s.offset ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >{s.label}</button>
                  ))}
                </div>
                {(shadowBlur > 0 || shadowOffset > 0) && (
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Blur</span><span>{shadowBlur}px</span></div>
                        <input type="range" min={0} max={80} value={shadowBlur} onChange={(e) => set("shadowBlur", Number(e.target.value))} className="w-full accent-orange-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Offset</span><span>{shadowOffset}px</span></div>
                        <input type="range" min={0} max={40} value={shadowOffset} onChange={(e) => set("shadowOffset", Number(e.target.value))} className="w-full accent-orange-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">👁️ Live Preview</p>
              <div className="overflow-auto rounded-xl p-4" style={{ background: "repeating-conic-gradient(#e5e7eb 0% 25%, #f9fafb 0% 50%) 0 0 / 16px 16px" }}>
                <canvas ref={previewRef} className="max-w-full mx-auto block" />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Checkerboard = transparent area</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleApply}
                disabled={processing}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {processing
                  ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Processing…</>
                  : "🖼 Apply & Export"}
              </button>
              {resultUrl && (
                <button onClick={download} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                  ⬇️ Download PNG {resultBlob && <span className="text-xs opacity-80">({formatBytes(resultBlob.size)})</span>}
                </button>
              )}
            </div>
            {resultUrl && (
              <button onClick={reset} className="w-full border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                ↩ Process Another
              </button>
            )}
          </div>
        )}

        {/* Feature bullets */}
        <div className="mt-12 grid sm:grid-cols-3 gap-5 text-center">
          {[
            { icon: "🔒", title: "100% Private", desc: "Everything runs in your browser. Your image never leaves your device." },
            { icon: "⚡", title: "Instant Preview", desc: "Live canvas preview updates as you drag the sliders — no wait." },
            { icon: "🆓", title: "Always Free", desc: "No account, no watermarks, unlimited images." },
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
          <a href="/stitch" className="hover:text-gray-600">Stitch</a>
          <a href="/border" className="hover:text-gray-600">Border</a>
          <a href="/watermark" className="hover:text-gray-600">Watermark</a>
          <a href="/pricing" className="hover:text-gray-600">Pricing</a>
        </div>
        <p>© {new Date().getFullYear()} image-backgroundremover.com</p>
      </footer>
    </div>
  );
}
