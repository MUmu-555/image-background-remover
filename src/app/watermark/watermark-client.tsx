"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 20;
const PRESET_FONTS = ["Arial", "Georgia", "Courier New", "Times New Roman", "Verdana", "Impact"];
const PRESET_COLORS = ["#FFFFFF", "#000000", "#FF0000", "#FFD700", "#00BFFF", "#FF69B4"];

type Mode = "drag" | "tile";
type WmType = "text" | "image";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / 1024 / 1024).toFixed(1) + " MB";
}

interface WmState {
  wmType: WmType;
  text: string;
  font: string;
  fontSize: number;
  color: string;
  wmImgWidth: number;
  opacity: number;
  rotation: number;
  x: number;
  y: number;
  mode: Mode;
  tileGap: number;
}

function renderWmOnCtx(
  ctx: CanvasRenderingContext2D,
  cw: number, ch: number,
  wm: WmState,
  wmImg: HTMLImageElement | null
) {
  const rad = (wm.rotation * Math.PI) / 180;
  ctx.save();
  ctx.globalAlpha = wm.opacity / 100;

  if (wm.wmType === "text") {
    if (!wm.text) { ctx.restore(); return; }
    ctx.fillStyle = wm.color;
    ctx.font = `bold ${wm.fontSize}px ${wm.font}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    if (wm.mode === "tile") {
      const tw = ctx.measureText(wm.text).width + wm.tileGap;
      const th = wm.fontSize + wm.tileGap;
      for (let y = th / 2; y < ch + th; y += th) {
        for (let x = tw / 2; x < cw + tw; x += tw) {
          ctx.save(); ctx.translate(x, y); ctx.rotate(rad);
          ctx.fillText(wm.text, 0, 0); ctx.restore();
        }
      }
    } else {
      ctx.save(); ctx.translate(wm.x * cw, wm.y * ch); ctx.rotate(rad);
      ctx.fillText(wm.text, 0, 0); ctx.restore();
    }
  } else {
    if (!wmImg) { ctx.restore(); return; }
    const iw = cw * wm.wmImgWidth;
    const ih = (wmImg.height / wmImg.width) * iw;
    if (wm.mode === "tile") {
      const gapX = iw + wm.tileGap;
      const gapY = ih + wm.tileGap;
      for (let y = gapY / 2; y < ch + gapY; y += gapY) {
        for (let x = gapX / 2; x < cw + gapX; x += gapX) {
          ctx.save(); ctx.translate(x, y); ctx.rotate(rad);
          ctx.drawImage(wmImg, -iw / 2, -ih / 2, iw, ih); ctx.restore();
        }
      }
    } else {
      ctx.save(); ctx.translate(wm.x * cw, wm.y * ch); ctx.rotate(rad);
      ctx.drawImage(wmImg, -iw / 2, -ih / 2, iw, ih); ctx.restore();
    }
  }
  ctx.restore();
}

export default function WatermarkClient() {
  const [dragOver, setDragOver] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [origImg, setOrigImg] = useState<HTMLImageElement | null>(null);
  const [wmImgFile, setWmImgFile] = useState<File | null>(null);
  const [wmImg, setWmImg] = useState<HTMLImageElement | null>(null);
  const [wmImgPreviewUrl, setWmImgPreviewUrl] = useState<string | null>(null);
  const wmImgInputRef = useRef<HTMLInputElement>(null);

  const [wm, setWm] = useState<WmState>({
    wmType: "text", text: "© My Brand", font: "Arial", fontSize: 48,
    color: "#FFFFFF", wmImgWidth: 0.25, opacity: 70, rotation: -30,
    x: 0.75, y: 0.85, mode: "drag", tileGap: 80,
  });

  const previewRef = useRef<HTMLCanvasElement>(null);
  const outputRef  = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);

  const renderOutput = useCallback(() => {
    if (!origImg || !outputRef.current) return;
    const canvas = outputRef.current;
    canvas.width = origImg.width; canvas.height = origImg.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(origImg, 0, 0);
    renderWmOnCtx(ctx, origImg.width, origImg.height, wm, wmImg);
    canvas.toBlob((b) => { if (b) setResultBlob(b); }, "image/jpeg", 0.93);
  }, [origImg, wm, wmImg]);

  const renderPreview = useCallback(() => {
    if (!origImg || !previewRef.current || !wrapperRef.current) return;
    const canvas = previewRef.current;
    const maxW = wrapperRef.current.clientWidth || 600;
    const scale = Math.min(maxW / origImg.width, 500 / origImg.height, 1);
    const dw = Math.round(origImg.width * scale);
    const dh = Math.round(origImg.height * scale);
    canvas.width = dw; canvas.height = dh;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(origImg, 0, 0, dw, dh);
    renderWmOnCtx(ctx, dw, dh, { ...wm, fontSize: wm.fontSize * scale }, wmImg);
    if (wm.mode === "drag") {
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.arc(wm.x * dw, wm.y * dh, 14, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }, [origImg, wm, wmImg]);

  useEffect(() => { renderPreview(); renderOutput(); }, [renderPreview, renderOutput]);

  const getCanvasXY = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = previewRef.current!.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      nx: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      ny: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
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
    setWm((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(1, dragStart.current!.ox + nx - dragStart.current!.mx)),
      y: Math.max(0, Math.min(1, dragStart.current!.oy + ny - dragStart.current!.my)),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  const onPointerUp = () => { setIsDragging(false); dragStart.current = null; };

  const loadMainFile = (file: File) => {
    if (!ACCEPTED.includes(file.type) || file.size > MAX_MB * 1024 * 1024) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { setOrigImg(img); setWm((p) => ({ ...p, x: 0.75, y: 0.85 })); URL.revokeObjectURL(url); };
    img.src = url;
    setOriginalFile(file); setResultBlob(null);
  };

  const loadWmImage = (file: File) => {
    if (wmImgPreviewUrl) URL.revokeObjectURL(wmImgPreviewUrl);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setWmImg(img);
    img.src = url;
    setWmImgFile(file);
    setWmImgPreviewUrl(url);
    setWm((p) => ({ ...p, wmType: "image" }));
  };

  const download = () => {
    if (!resultBlob || !originalFile) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(resultBlob);
    a.download = originalFile.name.replace(/\.[^.]+$/, "") + "-watermarked.jpg";
    a.click();
  };

  const reset = () => { setOriginalFile(null); setOrigImg(null); setResultBlob(null); };
  const upd = (patch: Partial<WmState>) => setWm((p) => ({ ...p, ...patch }));
  const canDownload = !!resultBlob && (wm.wmType === "text" ? !!wm.text : !!wmImg);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-bold text-gray-900 text-lg"><span className="text-2xl">✂️</span> BG Remover</a>
          <div className="flex items-center gap-1.5">
            <a href="/replace-bg" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors">Replace BG</a>
            <a href="/watermark"  className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-teal-700 bg-teal-100 hover:bg-teal-200 transition-colors">Watermark</a>
            <a href="/id-photo"  className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors">ID Photo</a>
            <a href="/pricing"   className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors">Pricing</a>
          </div>
        </div>
      </nav>

      <canvas ref={outputRef} className="hidden" />

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">💧 Image Watermark</h1>
          <p className="text-gray-500 text-lg">Add text or logo watermarks — drag to position, free &amp; private.</p>
        </div>

        {!originalFile ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) loadMainFile(f); }}
            className={`border-2 border-dashed rounded-2xl p-14 text-center transition-colors ${dragOver ? "border-teal-400 bg-teal-50" : "border-gray-200 hover:border-teal-300"}`}
          >
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" id="wm-input"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) loadMainFile(f); e.target.value = ""; }} />
            <label htmlFor="wm-input" className="cursor-pointer block">
              <div className="text-5xl mb-4">💧</div>
              <p className="text-gray-700 font-semibold text-lg mb-1">Upload an image to watermark</p>
              <p className="text-gray-400 text-sm mb-6">JPG · PNG · WebP · Max {MAX_MB} MB</p>
              <span className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-full text-sm transition-colors">Choose Image</span>
            </label>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-4">

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{originalFile.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(originalFile.size)} · {origImg?.width}×{origImg?.height}px</p>
                </div>
                <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 transition-colors">✕ Remove</button>
              </div>

              {/* Watermark type */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">💧 Watermark Type</p>
                <div className="flex rounded-xl overflow-hidden border border-gray-200">
                  <button onClick={() => upd({ wmType: "text" })}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${wm.wmType === "text" ? "bg-teal-500 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
                    ✏️ Text
                  </button>
                  <button onClick={() => upd({ wmType: "image" })}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${wm.wmType === "image" ? "bg-teal-500 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
                    🖼️ Logo / Image
                  </button>
                </div>

                {wm.wmType === "text" && (
                  <div className="space-y-3 pt-1">
                    <input type="text" value={wm.text} onChange={(e) => upd({ text: e.target.value })}
                      placeholder="© My Brand"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
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
                    <div className="flex items-center gap-2 flex-wrap">
                      {PRESET_COLORS.map((c) => (
                        <button key={c} onClick={() => upd({ color: c })}
                          className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${wm.color === c ? "border-teal-500 scale-110" : "border-transparent"}`}
                          style={{ backgroundColor: c, boxShadow: c === "#FFFFFF" ? "inset 0 0 0 1px #e5e7eb" : undefined }} />
                      ))}
                      <input type="color" value={wm.color} onChange={(e) => upd({ color: e.target.value })}
                        className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 cursor-pointer p-0" />
                    </div>
                  </div>
                )}

                {wm.wmType === "image" && (
                  <div className="space-y-3 pt-1">
                    <input ref={wmImgInputRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) loadWmImage(f); e.target.value = ""; }} />
                    {!wmImg ? (
                      <button onClick={() => wmImgInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-teal-300 rounded-xl py-6 text-center hover:bg-teal-50 transition-colors">
                        <div className="text-3xl mb-1">🖼️</div>
                        <p className="text-sm font-semibold text-teal-700">Upload Logo / Watermark Image</p>
                        <p className="text-xs text-gray-400 mt-1">PNG with transparency recommended</p>
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 bg-teal-50 rounded-xl p-3">
                        {wmImgPreviewUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={wmImgPreviewUrl} alt="wm logo" className="w-12 h-12 object-contain rounded-lg bg-white border border-gray-100" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700 truncate">{wmImgFile?.name}</p>
                          <p className="text-xs text-gray-400">{wmImg.width}×{wmImg.height}px</p>
                        </div>
                        <button onClick={() => { setWmImg(null); setWmImgFile(null); setWmImgPreviewUrl(null); }}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors">✕</button>
                      </div>
                    )}
                    {wmImg && (
                      <>
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="text-xs text-gray-400">Logo size</label>
                            <span className="text-xs font-bold text-teal-600">{Math.round(wm.wmImgWidth * 100)}% width</span>
                          </div>
                          <input type="range" min={3} max={80} value={Math.round(wm.wmImgWidth * 100)}
                            onChange={(e) => upd({ wmImgWidth: Number(e.target.value) / 100 })}
                            className="w-full accent-teal-500" />
                        </div>
                        <button onClick={() => wmImgInputRef.current?.click()}
                          className="text-xs text-teal-600 hover:text-teal-800 underline">Change logo</button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Opacity */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-semibold text-gray-700">Opacity</label>
                  <span className="text-sm font-bold text-teal-600">{wm.opacity}%</span>
                </div>
                <input type="range" min={5} max={100} value={wm.opacity}
                  onChange={(e) => upd({ opacity: Number(e.target.value) })}
                  className="w-full accent-teal-500" />
              </div>

              {/* Rotation + Mode */}
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
                <div className="flex rounded-xl overflow-hidden border border-gray-200">
                  <button onClick={() => upd({ mode: "drag" })}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${wm.mode === "drag" ? "bg-teal-500 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
                    🖱️ Drag
                  </button>
                  <button onClick={() => upd({ mode: "tile" })}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${wm.mode === "tile" ? "bg-teal-500 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
                    ▦ Tile
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
                    👆 Drag the watermark on the preview to position it
                  </p>
                )}
              </div>

              <button onClick={download} disabled={!canDownload}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm">
                ⬇️ Download Watermarked Image
              </button>
              <button onClick={reset} className="w-full border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                ↩ Upload Another
              </button>
            </div>

            {/* Preview */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-20">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Live Preview {wm.mode === "drag" && <span className="text-teal-500 ml-1">— drag to move</span>}
                  </p>
                  {resultBlob && <p className="text-xs text-gray-400">{formatBytes(resultBlob.size)}</p>}
                </div>
                <div ref={wrapperRef} className="flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
                  <canvas ref={previewRef}
                    onMouseDown={onPointerDown} onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
                    onTouchStart={onPointerDown} onTouchMove={onPointerMove} onTouchEnd={onPointerUp}
                    style={{
                      maxWidth: "100%", maxHeight: "500px", borderRadius: "8px", touchAction: "none",
                      cursor: wm.mode === "drag" ? (isDragging ? "grabbing" : "grab") : "default",
                    }} />
                </div>
                {origImg && <p className="text-xs text-gray-400 text-center mt-2">{origImg.width} × {origImg.height} px</p>}
              </div>
            </div>
          </div>
        )}

        {!originalFile && (
          <div className="mt-12 grid sm:grid-cols-3 gap-5 text-center">
            {[
              { icon: "🖼️", title: "Text or Logo", desc: "Add a text watermark or upload your own logo/image as the watermark." },
              { icon: "🖱️", title: "Drag to Position", desc: "Click and drag the watermark anywhere on the preview image." },
              { icon: "🔒", title: "100% Private", desc: "Everything runs in your browser — nothing is uploaded to any server." },
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
          {["/", "/replace-bg", "/watermark", "/id-photo", "/convert", "/compress", "/resize", "/pricing"].map((href) => (
            <a key={href} href={href} className="hover:text-gray-600 capitalize">{href === "/" ? "Home" : href.slice(1).replace("-", " ")}</a>
          ))}
        </div>
        <p>© {new Date().getFullYear()} image-backgroundremover.com</p>
      </footer>
    </div>
  );
}
