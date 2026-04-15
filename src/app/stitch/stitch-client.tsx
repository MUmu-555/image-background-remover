"use client";

import { useState, useRef, useCallback, useEffect } from "react";
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 20;
const MAX_IMAGES = 10;

type Layout = "horizontal" | "vertical" | "grid";
type Align = "start" | "center" | "end";

interface ImageItem {
  id: string;
  file: File;
  url: string;
  width: number;
  height: number;
}

function uid() {
  return Math.random().toString(36).slice(2);
}

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

export default function StitchClient() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [layout, setLayout] = useState<Layout>("horizontal");
  const [gap, setGap] = useState(8);
  const [align, setAlign] = useState<Align>("center");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<{ w: number; h: number } | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(
      (f) => ACCEPTED.includes(f.type) && f.size <= MAX_MB * 1024 * 1024
    );
    const remaining = MAX_IMAGES - images.length;
    const toAdd = arr.slice(0, remaining);
    const items: ImageItem[] = await Promise.all(
      toAdd.map(async (file) => {
        const url = URL.createObjectURL(file);
        const img = await loadImage(url);
        return { id: uid(), file, url, width: img.naturalWidth, height: img.naturalHeight };
      })
    );
    setImages((prev) => [...prev, ...items]);
    setResultUrl(null);
  }, [images.length]);

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((i) => i.id !== id);
    });
    setResultUrl(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  // Drag-to-reorder
  const onDragStart = (idx: number) => setDragIdx(idx);
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(dragIdx, 1);
      next.splice(idx, 0, item);
      return next;
    });
    setDragIdx(idx);
    setResultUrl(null);
  };

  const computeCanvas = useCallback(async (): Promise<{ canvas: HTMLCanvasElement; w: number; h: number }> => {
    const imgs = await Promise.all(images.map((i) => loadImage(i.url)));

    let cw = 0, ch = 0;

    if (layout === "horizontal") {
      const totalW = imgs.reduce((s, img) => s + img.naturalWidth, 0) + gap * (imgs.length - 1);
      const maxH = Math.max(...imgs.map((i) => i.naturalHeight));
      cw = totalW; ch = maxH;
    } else if (layout === "vertical") {
      const maxW = Math.max(...imgs.map((i) => i.naturalWidth));
      const totalH = imgs.reduce((s, img) => s + img.naturalHeight, 0) + gap * (imgs.length - 1);
      cw = maxW; ch = totalH;
    } else {
      // grid: try to make it roughly square
      const cols = Math.ceil(Math.sqrt(imgs.length));
      const rows = Math.ceil(imgs.length / cols);
      const cellW = Math.max(...imgs.map((i) => i.naturalWidth));
      const cellH = Math.max(...imgs.map((i) => i.naturalHeight));
      cw = cols * cellW + (cols - 1) * gap;
      ch = rows * cellH + (rows - 1) * gap;
    }

    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cw, ch);

    if (layout === "horizontal") {
      let x = 0;
      for (const img of imgs) {
        let y = 0;
        if (align === "center") y = (ch - img.naturalHeight) / 2;
        else if (align === "end") y = ch - img.naturalHeight;
        ctx.drawImage(img, x, y);
        x += img.naturalWidth + gap;
      }
    } else if (layout === "vertical") {
      let y = 0;
      for (const img of imgs) {
        let x = 0;
        if (align === "center") x = (cw - img.naturalWidth) / 2;
        else if (align === "end") x = cw - img.naturalWidth;
        ctx.drawImage(img, x, y);
        y += img.naturalHeight + gap;
      }
    } else {
      const cols = Math.ceil(Math.sqrt(imgs.length));
      const cellW = Math.max(...imgs.map((i) => i.naturalWidth));
      const cellH = Math.max(...imgs.map((i) => i.naturalHeight));
      imgs.forEach((img, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * (cellW + gap) + (cellW - img.naturalWidth) / 2;
        const y = row * (cellH + gap) + (cellH - img.naturalHeight) / 2;
        ctx.drawImage(img, x, y);
      });
    }

    return { canvas, w: cw, h: ch };
  }, [images, layout, gap, align, bgColor]);

  // Live preview (scaled)
  useEffect(() => {
    if (images.length < 2 || !previewRef.current) return;
    let cancelled = false;
    computeCanvas().then(({ canvas, w, h }) => {
      if (cancelled || !previewRef.current) return;
      const pv = previewRef.current;
      const maxW = pv.parentElement?.clientWidth ?? 600;
      const scale = Math.min(1, maxW / w);
      pv.width = w * scale;
      pv.height = h * scale;
      const ctx = pv.getContext("2d")!;
      ctx.drawImage(canvas, 0, 0, pv.width, pv.height);
    });
    return () => { cancelled = true; };
  }, [images, layout, gap, align, bgColor, computeCanvas]);

  const handleStitch = async () => {
    if (images.length < 2) return;
    setProcessing(true);
    try {
      const { canvas, w, h } = await computeCanvas();
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize({ w, h });
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "stitched.png";
    a.click();
  };

  const reset = () => {
    images.forEach((i) => URL.revokeObjectURL(i.url));
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setImages([]);
    setResultUrl(null);
    setResultSize(null);
  };

  const BG_PRESETS = ["#ffffff", "#000000", "#f3f4f6", "#1e1b4b", "#fef9c3", "#d1fae5"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
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
            <a href="/stitch" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-teal-700 bg-teal-100 hover:bg-teal-200 transition-colors">Stitch</a>
            <a href="/pricing" className="hidden sm:inline-block text-sm font-medium px-3 py-1.5 rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors">Pricing</a>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">🖼️ Image Stitcher</h1>
          <p className="text-gray-500 text-lg">Combine multiple photos side by side, stacked, or in a grid — free, in your browser.</p>
        </div>

        {/* Upload zone */}
        {images.length === 0 && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${dragOver ? "border-teal-400 bg-teal-50" : "border-gray-200 hover:border-teal-300"}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              id="stitch-input"
              onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
            />
            <label htmlFor="stitch-input" className="cursor-pointer block">
              <div className="text-5xl mb-4">🖼️</div>
              <p className="text-gray-700 font-semibold text-lg mb-1">Upload 2–10 images to stitch</p>
              <p className="text-gray-400 text-sm mb-6">JPG · PNG · WebP · Max {MAX_MB} MB each</p>
              <span className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-full text-sm transition-colors">Choose Images</span>
            </label>
          </div>
        )}

        {/* Image grid + reorder */}
        {images.length > 0 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">📂 Images ({images.length}/{MAX_IMAGES})</p>
                <div className="flex gap-2">
                  {images.length < MAX_IMAGES && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        id="stitch-add"
                        onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
                      />
                      <label htmlFor="stitch-add" className="cursor-pointer text-xs font-semibold text-teal-600 border border-teal-200 rounded-lg px-3 py-1.5 hover:bg-teal-50 transition-colors">
                        + Add More
                      </label>
                    </>
                  )}
                  <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 transition-colors border border-gray-200 rounded-lg px-3 py-1.5">Clear All</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => onDragStart(idx)}
                    onDragOver={(e) => onDragOver(e, idx)}
                    onDragEnd={() => setDragIdx(null)}
                    className={`relative group cursor-grab active:cursor-grabbing rounded-xl overflow-hidden border-2 transition-colors ${dragIdx === idx ? "border-teal-400 opacity-50" : "border-gray-200"}`}
                    style={{ width: 80, height: 80 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >×</button>
                    <span className="absolute bottom-1 left-1 text-[10px] font-bold text-white bg-black/50 rounded px-1">{idx + 1}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Drag thumbnails to reorder · hover to delete</p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">⚙️ Layout Settings</p>

              {/* Layout */}
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Layout</p>
                <div className="flex gap-2">
                  {(["horizontal", "vertical", "grid"] as Layout[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLayout(l); setResultUrl(null); }}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${layout === l ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      {l === "horizontal" ? "↔ Side by Side" : l === "vertical" ? "↕ Stacked" : "⊞ Grid"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gap */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-500 font-medium">Gap between images</p>
                  <span className="text-sm font-bold text-teal-600">{gap} px</span>
                </div>
                <input type="range" min={0} max={80} value={gap} onChange={(e) => { setGap(Number(e.target.value)); setResultUrl(null); }} className="w-full accent-teal-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0 — No gap</span><span>80 — Wide gap</span></div>
              </div>

              {/* Alignment (for horizontal/vertical) */}
              {layout !== "grid" && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Alignment</p>
                  <div className="flex gap-2">
                    {([["start", layout === "horizontal" ? "⬆ Top" : "⬅ Left"], ["center", "⬤ Center"], ["end", layout === "horizontal" ? "⬇ Bottom" : "➡ Right"]] as [Align, string][]).map(([v, label]) => (
                      <button
                        key={v}
                        onClick={() => { setAlign(v); setResultUrl(null); }}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${align === v ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >{label}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Background color */}
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Background / Gap color</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {BG_PRESETS.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setBgColor(c); setResultUrl(null); }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${bgColor === c ? "border-teal-500 scale-110" : "border-gray-200"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => { setBgColor(e.target.value); setResultUrl(null); }}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 cursor-pointer"
                    title="Custom color"
                  />
                  <span className="text-xs text-gray-400 font-mono">{bgColor}</span>
                </div>
              </div>
            </div>

            {/* Live preview */}
            {images.length >= 2 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">👁️ Preview</p>
                <div className="overflow-auto rounded-xl bg-gray-50 border border-gray-100 p-2">
                  <canvas ref={previewRef} className="max-w-full rounded-lg" />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleStitch}
                disabled={images.length < 2 || processing}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {processing
                  ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Processing…</>
                  : "🖼️ Stitch Images"}
              </button>
              {resultUrl && (
                <button onClick={download} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                  ⬇️ Download PNG {resultSize && <span className="text-xs opacity-80">({resultSize.w}×{resultSize.h})</span>}
                </button>
              )}
            </div>
            {images.length < 2 && (
              <p className="text-center text-sm text-amber-600">⚠️ Upload at least 2 images to stitch.</p>
            )}
          </div>
        )}

        {/* Feature bullets */}
        <div className="mt-12 grid sm:grid-cols-3 gap-5 text-center">
          {[
            { icon: "🔒", title: "100% Private", desc: "All processing happens in your browser. Images never leave your device." },
            { icon: "↕↔⊞", title: "3 Layouts", desc: "Side by side, stacked vertically, or auto-balanced grid — you pick." },
            { icon: "🎨", title: "Custom Gap & Color", desc: "Control spacing and background color for a polished, professional look." },
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
