"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 20;

type Position = "top-left" | "top-center" | "top-right" | "center" | "bottom-left" | "bottom-center" | "bottom-right" | "tile";

const POSITIONS: { id: Position; label: string; icon: string }[] = [
  { id: "top-left", label: "Top Left", icon: "↖" },
  { id: "top-center", label: "Top Center", icon: "↑" },
  { id: "top-right", label: "Top Right", icon: "↗" },
  { id: "center", label: "Center", icon: "⊕" },
  { id: "bottom-left", label: "Bottom Left", icon: "↙" },
  { id: "bottom-center", label: "Bottom Center", icon: "↓" },
  { id: "bottom-right", label: "Bottom Right", icon: "↘" },
  { id: "tile", label: "Tile", icon: "▦" },
];

const PRESET_FONTS = ["Arial", "Georgia", "Courier New", "Times New Roman", "Verdana", "Impact"];
const PRESET_COLORS = ["#FFFFFF", "#000000", "#FF0000", "#FFD700", "#00BFFF", "#FF69B4"];

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / 1024 / 1024).toFixed(1) + " MB";
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  text: string,
  font: string,
  fontSize: number,
  color: string,
  opacity: number,
  position: Position,
  rotation: number,
  padding: number
) {
  ctx.save();
  ctx.globalAlpha = opacity / 100;
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px ${font}`;
  ctx.textBaseline = "middle";

  const measure = ctx.measureText(text);
  const tw = measure.width;
  const th = fontSize;

  const getXY = (pos: Position): [number, number] => {
    switch (pos) {
      case "top-left": return [padding + tw / 2, padding + th / 2];
      case "top-center": return [w / 2, padding + th / 2];
      case "top-right": return [w - padding - tw / 2, padding + th / 2];
      case "center": return [w / 2, h / 2];
      case "bottom-left": return [padding + tw / 2, h - padding - th / 2];
      case "bottom-center": return [w / 2, h - padding - th / 2];
      case "bottom-right": return [w - padding - tw / 2, h - padding - th / 2];
      default: return [w / 2, h / 2];
    }
  };

  if (position === "tile") {
    const gapX = tw + padding * 3;
    const gapY = th + padding * 3;
    ctx.textAlign = "center";
    for (let y = gapY / 2; y < h + gapY; y += gapY) {
      for (let x = gapX / 2; x < w + gapX; x += gapX) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    }
  } else {
    const [x, y] = getXY(position);
    ctx.textAlign = "center";
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

export default function WatermarkClient() {
  const [dragOver, setDragOver] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [origImg, setOrigImg] = useState<HTMLImageElement | null>(null);

  // watermark settings
  const [text, setText] = useState("© My Brand");
  const [font, setFont] = useState("Arial");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#FFFFFF");
  const [opacity, setOpacity] = useState(70);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [rotation, setRotation] = useState(-30);
  const [padding, setPadding] = useState(40);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const renderPreview = useCallback(() => {
    if (!origImg || !canvasRef.current || !text) return;
    const canvas = canvasRef.current;
    canvas.width = origImg.width;
    canvas.height = origImg.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(origImg, 0, 0);
    drawWatermark(ctx, origImg.width, origImg.height, text, font, fontSize, color, opacity, position, rotation, padding);
    canvas.toBlob((b) => { if (b) setResultBlob(b); }, "image/jpeg", 0.93);
  }, [origImg, text, font, fontSize, color, opacity, position, rotation, padding]);

  useEffect(() => { renderPreview(); }, [renderPreview]);

  const loadFile = (file: File) => {
    if (!ACCEPTED.includes(file.type)) return;
    if (file.size > MAX_MB * 1024 * 1024) return;
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { setOrigImg(img); };
    img.src = url;
    setOriginalFile(file);
    setOriginalUrl(url);
    setResultBlob(null);
  };

  const download = () => {
    if (!resultBlob || !originalFile) return;
    const base = originalFile.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(resultBlob);
    a.download = `${base}-watermarked.jpg`;
    a.click();
  };

  const reset = () => {
    setOriginalFile(null);
    setOriginalUrl(null);
    setOrigImg(null);
    setResultBlob(null);
  };

  // Canvas preview dimensions (scale down for display)
  const previewStyle = origImg
    ? { maxWidth: "100%", borderRadius: "12px", boxShadow: "0 2px 16px rgba(0,0,0,0.10)" }
    : {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-bold text-gray-900 text-lg">
            <span className="text-2xl">✂️</span> BG Remover
          </a>
          <div className="flex items-center gap-1.5">
            <a href="/replace-bg" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors">Replace BG</a>
            <a href="/watermark" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-teal-700 bg-teal-100 hover:bg-teal-200 transition-colors">Watermark</a>
            <a href="/id-photo" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors">ID Photo</a>
            <a href="/pricing" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors">Pricing</a>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">💧 Image Watermark</h1>
          <p className="text-gray-500 text-lg">Add text watermarks to protect your photos — free, private, instant.</p>
        </div>

        {!originalFile ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
            className={`border-2 border-dashed rounded-2xl p-14 text-center transition-colors ${dragOver ? "border-teal-400 bg-teal-50" : "border-gray-200 hover:border-teal-300"}`}
          >
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" id="wm-input" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
            <label htmlFor="wm-input" className="cursor-pointer block">
              <div className="text-5xl mb-4">💧</div>
              <p className="text-gray-700 font-semibold text-lg mb-1">Upload an image to watermark</p>
              <p className="text-gray-400 text-sm mb-6">JPG · PNG · WebP · Max {MAX_MB} MB</p>
              <span className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-full text-sm transition-colors">Choose Image</span>
            </label>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Controls — left panel */}
            <div className="lg:col-span-2 space-y-4">
              {/* File info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{originalFile.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(originalFile.size)} · {origImg?.width}×{origImg?.height}px</p>
                </div>
                <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 transition-colors">✕ Remove</button>
              </div>

              {/* Text */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">✏️ Watermark Text</p>
                <input
                  type="text" value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. © My Brand"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Font</label>
                    <select value={font} onChange={(e) => setFont(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300">
                      {PRESET_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Size: {fontSize}px</label>
                    <input type="range" min={12} max={200} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-teal-500 mt-1" />
                  </div>
                </div>
              </div>

              {/* Color & Opacity */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">🎨 Color & Opacity</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? "border-teal-500 scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c, boxShadow: c === "#FFFFFF" ? "inset 0 0 0 1px #e5e7eb" : undefined }}
                    />
                  ))}
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 cursor-pointer p-0" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-gray-400">Opacity</label>
                    <span className="text-xs font-bold text-teal-600">{opacity}%</span>
                  </div>
                  <input type="range" min={5} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-teal-500" />
                </div>
              </div>

              {/* Position */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">📍 Position</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {POSITIONS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPosition(p.id)}
                      title={p.label}
                      className={`py-1.5 rounded-lg text-sm font-bold transition-all ${position === p.id ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      {p.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotation & Padding */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">🔧 More Options</p>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-gray-400">Rotation</label>
                    <span className="text-xs font-bold text-teal-600">{rotation}°</span>
                  </div>
                  <input type="range" min={-180} max={180} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full accent-teal-500" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-gray-400">Padding</label>
                    <span className="text-xs font-bold text-teal-600">{padding}px</span>
                  </div>
                  <input type="range" min={0} max={200} value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="w-full accent-teal-500" />
                </div>
              </div>

              {/* Download */}
              <button
                onClick={download}
                disabled={!resultBlob || !text}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                ⬇️ Download Watermarked Image
              </button>
              <button onClick={reset} className="w-full border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                ↩ Upload Another
              </button>
            </div>

            {/* Preview — right panel */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-20">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Live Preview</p>
                <div className="flex items-center justify-center bg-gray-50 rounded-xl p-2 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    style={previewStyle}
                    className="max-h-[500px] w-full object-contain"
                  />
                </div>
                {origImg && (
                  <p className="text-xs text-gray-400 text-center mt-2">
                    {origImg.width} × {origImg.height} px
                    {resultBlob && ` · Output: ${formatBytes(resultBlob.size)}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!originalFile && (
          <div className="mt-12 grid sm:grid-cols-3 gap-5 text-center">
            {[
              { icon: "⚡", title: "Real-time Preview", desc: "See the watermark update live as you adjust settings." },
              { icon: "🎛️", title: "Fully Customizable", desc: "Font, size, color, opacity, position, rotation — all configurable." },
              { icon: "🔒", title: "100% Private", desc: "Everything happens in your browser. No uploads to any server." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="text-3xl mb-2">{f.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 bg-indigo-600 rounded-2xl p-7 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Also need to remove image backgrounds?</h2>
          <p className="text-indigo-200 text-sm mb-4">Our AI removes backgrounds in seconds — free.</p>
          <a href="/" className="inline-block bg-white text-indigo-700 font-bold px-6 py-2.5 rounded-full hover:bg-indigo-50 transition-colors text-sm">Try BG Remover →</a>
        </div>
      </main>

      <footer className="border-t border-gray-100 mt-12 py-6 text-center text-xs text-gray-400">
        <div className="flex flex-wrap justify-center gap-4 mb-2">
          <a href="/" className="hover:text-gray-600">Home</a>
          <a href="/replace-bg" className="hover:text-gray-600">Replace BG</a>
          <a href="/watermark" className="hover:text-gray-600">Watermark</a>
          <a href="/id-photo" className="hover:text-gray-600">ID Photo</a>
          <a href="/convert" className="hover:text-gray-600">Convert</a>
          <a href="/compress" className="hover:text-gray-600">Compress</a>
          <a href="/resize" className="hover:text-gray-600">Resize</a>
          <a href="/pricing" className="hover:text-gray-600">Pricing</a>
        </div>
        <p>© {new Date().getFullYear()} image-backgroundremover.com</p>
      </footer>
    </div>
  );
}
