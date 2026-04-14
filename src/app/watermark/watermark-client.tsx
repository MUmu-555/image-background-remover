"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 20;
const PRESET_FONTS = ["Arial", "Georgia", "Courier New", "Times New Roman", "Verdana", "Impact"];
const PRESET_COLORS = ["#FFFFFF", "#000000", "#FF0000", "#FFD700", "#00BFFF", "#FF69B4"];

// Tile mode is a separate toggle
type Mode = "drag" | "tile";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / 1024 / 1024).toFixed(1) + " MB";
}

interface WmState {
  text: string;
  font: string;
  fontSize: number;
  color: string;
  opacity: number;
  rotation: number;
  // position in image coordinates (0..imgW, 0..imgH)
  x: number;
  y: number;
  mode: Mode;
  tileGap: number;
}

/** Render watermark onto ctx at full image resolution */
function renderWm(
  ctx: CanvasRenderingContext2D,
  imgW: number, imgH: number,
  wm: WmState
) {
  if (!wm.text) return;
  ctx.save();
  ctx.globalAlpha = wm.opacity / 100;
  ctx.fillStyle = wm.color;
  ctx.font = `bold ${wm.fontSize}px ${wm.font}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  const rad = (wm.rotation * Math.PI) / 180;

  if (wm.mode === "tile") {
    const measure = ctx.measureText(wm.text);
    const tw = measure.width + wm.tileGap;
    const th = wm.fontSize + wm.tileGap;
    for (let y = th / 2; y < imgH + th; y += th) {
      for (let x = tw / 2; x < imgW + tw; x += tw) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rad);
        ctx.fillText(wm.text, 0, 0);
        ctx.restore();
      }
    }
  } else {
    ctx.save();
    ctx.translate(wm.x, wm.y);
    ctx.rotate(rad);
    ctx.fillText(wm.text, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

export default function WatermarkClient() {
  const [dragOver, setDragOver] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [origImg, setOrigImg] = useState<HTMLImageElement | null>(null);

  const [wm, setWm] = useState<WmState>({
    text: "© My Brand",
    font: "Arial",
    fontSize: 48,
    color: "#FFFFFF",
    opacity: 70,
    rotation: -30,
    x: 0.75, // normalized 0-1
    y: 0.85,
    mode: "drag",
    tileGap: 80,
  });

  // Canvas refs
  const previewRef = useRef<HTMLCanvasElement>(null);   // display canvas (scaled)
  const outputRef  = useRef<HTMLCanvasElement>(null);   // full-res canvas (hidden)
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);

  // ── Render helpers ────────────────────────────────────────────────────────

  /** Draw full-res output and capture blob */
  const renderOutput = useCallback(() => {
    if (!origImg || !outputRef.current) return;
    const canvas = outputRef.current;
    canvas.width  = origImg.width;
    canvas.height = origImg.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(origImg, 0, 0);
    renderWm(ctx, origImg.width, origImg.height, {
      ...wm,
      x: wm.x * origImg.width,
      y: wm.y * origImg.height,
      fontSize: wm.fontSize,
    });
    canvas.toBlob((b) => { if (b) setResultBlob(b); }, "image/jpeg", 0.93);
  }, [origImg, wm]);

  /** Draw scaled preview onto display canvas */
  const renderPreview = useCallback(() => {
    if (!origImg || !previewRef.current || !wrapperRef.current) return;
    const canvas = previewRef.current;
    const wrapper = wrapperRef.current;
    const maxW = wrapper.clientWidth || 600;
    const maxH = 500;
    const scale = Math.min(maxW / origImg.width, maxH / origImg.height, 1);
    const dw = Math.round(origImg.width * scale);
    const dh = Math.round(origImg.height * scale);
    canvas.width  = dw;
    canvas.height = dh;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(origImg, 0, 0, dw, dh);
    renderWm(ctx, dw, dh, {
      ...wm,
      x: wm.x * dw,
      y: wm.y * dh,
      fontSize: wm.fontSize * scale,
    });

    // Draw drag handle circle when in drag mode
    if (wm.mode === "drag") {
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(wm.x * dw, wm.y * dh, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }, [origImg, wm]);

  useEffect(() => {
    renderPreview();
    renderOutput();
  }, [renderPreview, renderOutput]);

  // ── Drag logic on preview canvas ─────────────────────────────────────────

  const getCanvasXY = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = previewRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      nx: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      ny: Math.max(0, Math.min(1, (clientY - rect.top)  / rect.height)),
    };
  };

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (wm.mode !== "drag") return;
    e.preventDefault();
    const { nx, ny } = getCanvasXY(e);
    dragStart.current = { mx: nx, my: ny, ox: wm.x, oy: wm.y };
    setIsDragging(true);
  };

  const onPointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !dragStart.current) return;
    e.preventDefault();
    const { nx, ny } = getCanvasXY(e);
    const dx = nx - dragStart.current.mx;
    const dy = ny - dragStart.current.my;
    const newX = Math.max(0, Math.min(1, dragStart.current.ox + dx));
    const newY = Math.max(0, Math.min(1, dragStart.current.oy + dy));
    setWm((prev) => ({ ...prev, x: newX, y: newY }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  const onPointerUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };

  // ── File loading ──────────────────────────────────────────────────────────

  const loadFile = (file: File) => {
    if (!ACCEPTED.includes(file.type)) return;
    if (file.size > MAX_MB * 1024 * 1024) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setOrigImg(img);
      setWm((prev) => ({ ...prev, x: 0.75, y: 0.85 }));
      URL.revokeObjectURL(url);
    };
    img.src = url;
    setOriginalFile(file);
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
    setOrigImg(null);
    setResultBlob(null);
  };

  const upd = (patch: Partial<WmState>) => setWm((p) => ({ ...p, ...patch }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-bold text-gray-900 text-lg">
            <span className="text-2xl">✂️</span> BG Remover
          </a>
          <div className="flex items-center gap-1.5">
            <a href="/replace-bg" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors">Replace BG</a>
            <a href="/watermark"   className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-teal-700   bg-teal-100   hover:bg-teal-200   transition-colors">Watermark</a>
            <a href="/id-photo"   className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors">ID Photo</a>
            <a href="/pricing"    className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-amber-700  bg-amber-100  hover:bg-amber-200  transition-colors">Pricing</a>
          </div>
        </div>
      </nav>

      {/* Hidden full-res canvas */}
      <canvas ref={outputRef} className="hidden" />

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">💧 Image Watermark</h1>
          <p className="text-gray-500 text-lg">Drag the watermark anywhere on the preview — free, private, instant.</p>
        </div>

        {/* Upload */}
        {!originalFile && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
            className={`border-2 border-dashed rounded-2xl p-14 text-center transition-colors ${dragOver ? "border-teal-400 bg-teal-50" : "border-gray-200 hover:border-teal-300"}`}
          >
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" id="wm-input"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
            <label htmlFor="wm-input" className="cursor-pointer block">
              <div className="text-5xl mb-4">💧</div>
              <p className="text-gray-700 font-semibold text-lg mb-1">Upload an image to watermark</p>
              <p className="text-gray-400 text-sm mb-6">JPG · PNG · WebP · Max {MAX_MB} MB</p>
              <span className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-full text-sm transition-colors">Choose Image</span>
            </label>
          </div>
        )}

        {/* Editor */}
        {originalFile && origImg && (
          <div className="grid lg:grid-cols-5 gap-6">

            {/* ── Controls ── */}
            <div className="lg:col-span-2 space-y-4">

              {/* File info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{originalFile.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(originalFile.size)} · {origImg.width}×{origImg.height}px</p>
                </div>
                <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 transition-colors">✕ Remove</button>
              </div>

              {/* Text */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">✏️ Watermark Text</p>
                <input
                  type="text" value={wm.text} onChange={(e) => upd({ text: e.target.value })}
                  placeholder="© My Brand"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Font</label>
                    <select value={wm.font} onChange={(e) => upd({ font: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300">
                      {PRESET_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Size: {wm.fontSize}px</label>
                    <input type="range" min={12} max={300} value={wm.fontSize}
                      onChange={(e) => upd({ fontSize: Number(e.target.value) })}
                      className="w-full accent-teal-500 mt-1" />
                  </div>
                </div>
              </div>

              {/* Color & Opacity */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">🎨 Color & Opacity</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button key={c} onClick={() => upd({ color: c })}
                      className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${wm.color === c ? "border-teal-500 scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c, boxShadow: c === "#FFFFFF" ? "inset 0 0 0 1px #e5e7eb" : undefined }}
                    />
                  ))}
                  <input type="color" value={wm.color} onChange={(e) => upd({ color: e.target.value })}
                    className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 cursor-pointer p-0" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-gray-400">Opacity</label>
                    <span className="text-xs font-bold text-teal-600">{wm.opacity}%</span>
                  </div>
                  <input type="range" min={5} max={100} value={wm.opacity}
                    onChange={(e) => upd({ opacity: Number(e.target.value) })}
                    className="w-full accent-teal-500" />
                </div>
              </div>

              {/* Rotation & Mode */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">🔧 Style</p>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-gray-400">Rotation</label>
                    <span className="text-xs font-bold text-teal-600">{wm.rotation}°</span>
                  </div>
                  <input type="range" min={-180} max={180} value={wm.rotation}
                    onChange={(e) => upd({ rotation: Number(e.target.value) })}
                    className="w-full accent-teal-500" />
                </div>

                {/* Mode toggle */}
                <div className="flex rounded-xl overflow-hidden border border-gray-200">
                  <button
                    onClick={() => upd({ mode: "drag" })}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${wm.mode === "drag" ? "bg-teal-500 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                  >
                    🖱️ Drag Mode
                  </button>
                  <button
                    onClick={() => upd({ mode: "tile" })}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${wm.mode === "tile" ? "bg-teal-500 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                  >
                    ▦ Tile Mode
                  </button>
                </div>

                {wm.mode === "tile" && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs text-gray-400">Tile spacing</label>
                      <span className="text-xs font-bold text-teal-600">{wm.tileGap}px</span>
                    </div>
                    <input type="range" min={20} max={300} value={wm.tileGap}
                      onChange={(e) => upd({ tileGap: Number(e.target.value) })}
                      className="w-full accent-teal-500" />
                  </div>
                )}

                {wm.mode === "drag" && (
                  <p className="text-xs text-teal-600 bg-teal-50 rounded-lg px-3 py-2">
                    👆 Drag the watermark directly on the preview image to position it
                  </p>
                )}
              </div>

              {/* Actions */}
              <button
                onClick={download}
                disabled={!resultBlob || !wm.text}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                ⬇️ Download Watermarked Image
              </button>
              <button onClick={reset} className="w-full border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                ↩ Upload Another
              </button>
            </div>

            {/* ── Preview ── */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-20">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Live Preview
                    {wm.mode === "drag" && <span className="ml-2 text-teal-500">— drag to move</span>}
                  </p>
                  {resultBlob && <p className="text-xs text-gray-400">{formatBytes(resultBlob.size)}</p>}
                </div>
                <div
                  ref={wrapperRef}
                  className="flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden"
                >
                  <canvas
                    ref={previewRef}
                    onMouseDown={onPointerDown}
                    onMouseMove={onPointerMove}
                    onMouseUp={onPointerUp}
                    onMouseLeave={onPointerUp}
                    onTouchStart={onPointerDown}
                    onTouchMove={onPointerMove}
                    onTouchEnd={onPointerUp}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "500px",
                      borderRadius: "8px",
                      cursor: wm.mode === "drag" ? (isDragging ? "grabbing" : "grab") : "default",
                      touchAction: "none",
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                  {origImg.width} × {origImg.height} px
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Features (shown before upload) */}
        {!originalFile && (
          <div className="mt-12 grid sm:grid-cols-3 gap-5 text-center">
            {[
              { icon: "🖱️", title: "Drag to Position", desc: "Click and drag the watermark directly on the preview image to place it anywhere." },
              { icon: "⚡", title: "Real-time Preview", desc: "Every change — text, color, opacity, rotation — updates the preview instantly." },
              { icon: "🔒", title: "100% Private", desc: "All processing happens in your browser. Nothing is uploaded to our servers." },
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
