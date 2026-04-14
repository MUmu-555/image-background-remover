"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 20;

type BgType = "color" | "image" | "gradient";
type Step = "upload" | "processing" | "done" | "error";

const PRESET_COLORS = [
  { hex: "#FFFFFF", label: "White" },
  { hex: "#F0F4FF", label: "Light Blue" },
  { hex: "#F0FFF4", label: "Light Green" },
  { hex: "#FFF7ED", label: "Warm" },
  { hex: "#1E293B", label: "Dark" },
  { hex: "#3B82F6", label: "Blue" },
  { hex: "#10B981", label: "Green" },
  { hex: "#F43F5E", label: "Red" },
];

const PRESET_GRADIENTS = [
  { id: "sunset", label: "Sunset", from: "#FF6B6B", to: "#FFA07A" },
  { id: "ocean", label: "Ocean", from: "#006994", to: "#00B4D8" },
  { id: "forest", label: "Forest", from: "#134E4A", to: "#6EE7B7" },
  { id: "purple", label: "Purple", from: "#7C3AED", to: "#C4B5FD" },
  { id: "gold", label: "Gold", from: "#F59E0B", to: "#FDE68A" },
  { id: "night", label: "Night", from: "#1E1B4B", to: "#4C1D95" },
];

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / 1024 / 1024).toFixed(1) + " MB";
}

async function compositeWithBg(
  transparentBlob: Blob,
  bgType: BgType,
  bgColor: string,
  bgGradient: { from: string; to: string } | null,
  bgImageUrl: string | null
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(transparentBlob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;

      const drawFg = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("Canvas export failed"));
        }, "image/png");
      };

      if (bgType === "color") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawFg();
      } else if (bgType === "gradient" && bgGradient) {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, bgGradient.from);
        grad.addColorStop(1, bgGradient.to);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawFg();
      } else if (bgType === "image" && bgImageUrl) {
        const bgImg = new Image();
        bgImg.onload = () => {
          // cover
          const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
          const sw = bgImg.width * scale, sh = bgImg.height * scale;
          ctx.drawImage(bgImg, (canvas.width - sw) / 2, (canvas.height - sh) / 2, sw, sh);
          drawFg();
        };
        bgImg.onerror = () => reject(new Error("Background image failed to load"));
        bgImg.src = bgImageUrl;
      } else {
        drawFg();
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}

export default function ReplaceBgClient() {
  const [step, setStep] = useState<Step>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [transparentBlob, setTransparentBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // bg options
  const [bgType, setBgType] = useState<BgType>("color");
  const [bgColor, setBgColor] = useState("#3B82F6");
  const [bgGradient, setBgGradient] = useState(PRESET_GRADIENTS[1]);
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);

  // result
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [recomposing, setRecomposing] = useState(false);

  const bgFileRef = useRef<HTMLInputElement>(null);

  // Re-composite when bg options change (after we have transparent blob)
  useEffect(() => {
    if (!transparentBlob || step !== "done") return;
    setRecomposing(true);
    compositeWithBg(transparentBlob, bgType, bgColor, bgGradient, bgImageUrl)
      .then((blob) => {
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultUrl(URL.createObjectURL(blob));
      })
      .finally(() => setRecomposing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgType, bgColor, bgGradient, bgImageUrl, transparentBlob]);

  const processFile = useCallback(async (file: File) => {
    if (!ACCEPTED.includes(file.type)) { setErrorMsg("Please upload JPG, PNG or WebP."); setStep("error"); return; }
    if (file.size > MAX_MB * 1024 * 1024) { setErrorMsg(`Max file size is ${MAX_MB} MB.`); setStep("error"); return; }
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setStep("processing");

    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/remove-bg", { method: "POST", body: fd });
      if (!res.ok) {
        let msg = "Background removal failed.";
        try { const d = await res.json(); if (d.error) msg = d.error; } catch { /* ignore */ }
        throw new Error(msg);
      }
      const ab = await res.arrayBuffer();
      const tBlob = new Blob([ab], { type: "image/png" });
      setTransparentBlob(tBlob);

      const resultBlob = await compositeWithBg(tBlob, bgType, bgColor, bgGradient, bgImageUrl);
      setResultUrl(URL.createObjectURL(resultBlob));
      setStep("done");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStep("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalUrl, bgType, bgColor, bgGradient, bgImageUrl]);

  const onBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (bgImageUrl) URL.revokeObjectURL(bgImageUrl);
    setBgImageFile(file);
    setBgImageUrl(URL.createObjectURL(file));
    setBgType("image");
    e.target.value = "";
  };

  const download = () => {
    if (!resultUrl || !originalFile) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = originalFile.name.replace(/\.[^.]+$/, "") + "-new-bg.png";
    a.click();
  };

  const reset = () => {
    setStep("upload");
    setOriginalFile(null);
    setOriginalUrl(null);
    setTransparentBlob(null);
    setResultUrl(null);
    setErrorMsg("");
  };

  const NavBar = () => (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
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
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">🖼️ Background Replacer</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Upload a photo — AI removes the background, then you choose any color, gradient, or custom image as the new background.
          </p>
        </div>

        {/* Background options panel — always visible */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {/* Color */}
          <button
            onClick={() => setBgType("color")}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${bgType === "color" ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
          >
            <p className="font-semibold text-gray-800 mb-2">🎨 Solid Color</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={(e) => { e.stopPropagation(); setBgColor(c.hex); setBgType("color"); }}
                  title={c.label}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${bgColor === c.hex && bgType === "color" ? "border-orange-500 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c.hex, boxShadow: c.hex === "#FFFFFF" ? "inset 0 0 0 1px #e5e7eb" : undefined }}
                />
              ))}
              <input
                type="color" value={bgColor}
                onChange={(e) => { setBgColor(e.target.value); setBgType("color"); }}
                className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 cursor-pointer p-0"
                title="Custom color"
              />
            </div>
          </button>

          {/* Gradient */}
          <button
            onClick={() => setBgType("gradient")}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${bgType === "gradient" ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
          >
            <p className="font-semibold text-gray-800 mb-2">🌈 Gradient</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_GRADIENTS.map((g) => (
                <button
                  key={g.id}
                  onClick={(e) => { e.stopPropagation(); setBgGradient(g); setBgType("gradient"); }}
                  title={g.label}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${bgGradient.id === g.id && bgType === "gradient" ? "border-orange-500 scale-110" : "border-transparent"}`}
                  style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                />
              ))}
            </div>
            {bgType === "gradient" && (
              <p className="text-xs text-orange-600 mt-2 font-medium">{bgGradient.label}</p>
            )}
          </button>

          {/* Custom image */}
          <div
            onClick={() => bgFileRef.current?.click()}
            className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${bgType === "image" ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
          >
            <p className="font-semibold text-gray-800 mb-2">📸 Custom Image</p>
            {bgImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bgImageUrl} alt="bg" className="w-full h-12 object-cover rounded-lg" />
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-lg h-12 flex items-center justify-center text-xs text-gray-400">
                Click to upload background
              </div>
            )}
            {bgImageFile && <p className="text-xs text-gray-400 mt-1 truncate">{bgImageFile.name}</p>}
            <input ref={bgFileRef} type="file" accept="image/*" className="hidden" onChange={onBgImageChange} />
          </div>
        </div>

        {/* Main area */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          {step === "upload" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragOver ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-orange-300"}`}
            >
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" id="replace-bg-input" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }} />
              <label htmlFor="replace-bg-input" className="cursor-pointer block">
                <div className="text-5xl mb-4">🖼️</div>
                <p className="text-gray-700 font-semibold text-lg mb-1">Upload your photo</p>
                <p className="text-gray-400 text-sm mb-6">JPG · PNG · WebP · Max {MAX_MB} MB</p>
                <span className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-full text-sm transition-colors">Choose Photo</span>
              </label>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center py-16 gap-5">
              {originalUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={originalUrl} alt="original" className="w-32 h-32 object-cover rounded-xl opacity-60" />
              )}
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                <p className="text-gray-600 font-medium">Removing background & applying new one…</p>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">😕</div>
              <p className="text-red-600 font-semibold mb-2">Something went wrong</p>
              <p className="text-gray-500 mb-6">{errorMsg}</p>
              <button onClick={reset} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-full transition-colors">Try Again</button>
            </div>
          )}

          {step === "done" && resultUrl && (
            <div>
              <div className="flex flex-col sm:flex-row gap-8 items-center justify-center mb-5">
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Original</p>
                  {originalUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={originalUrl} alt="original" className="w-40 h-40 object-contain rounded-xl border border-gray-100 bg-gray-50" />
                  )}
                </div>
                <div className="text-2xl text-gray-300 hidden sm:block">→</div>
                <div className="text-center relative">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">New Background</p>
                  <div className="relative inline-block">
                    {recomposing && (
                      <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center z-10">
                        <svg className="animate-spin h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resultUrl} alt="result" className="w-40 h-40 object-contain rounded-xl shadow-md" />
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-orange-500 mb-5">💡 Change background above — preview updates instantly!</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={download} disabled={recomposing} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-full transition-colors">⬇️ Download PNG</button>
                <button onClick={reset} className="border border-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-full hover:bg-gray-50 transition-colors">↩ New Photo</button>
              </div>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="mt-10 grid sm:grid-cols-3 gap-5 text-center">
          {[
            { icon: "📤", title: "Upload Photo", desc: "Upload any photo — portrait, product, pet, anything." },
            { icon: "🤖", title: "AI Removes BG", desc: "Our AI precisely removes the background automatically." },
            { icon: "🎨", title: "Pick New Background", desc: "Choose a color, gradient, or upload your own image." },
          ].map((s) => (
            <div key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-3xl mb-2">{s.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{s.title}</h3>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-indigo-600 rounded-2xl p-7 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Need ID photos with specific backgrounds?</h2>
          <p className="text-indigo-200 text-sm mb-4">Try our ID Photo Maker — creates passport & visa photos in seconds.</p>
          <a href="/id-photo" className="inline-block bg-white text-indigo-700 font-bold px-6 py-2.5 rounded-full hover:bg-indigo-50 transition-colors text-sm">Try ID Photo Maker →</a>
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
