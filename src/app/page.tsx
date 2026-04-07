"use client";

import { useState, useRef, useCallback } from "react";

type Status = "idle" | "uploading" | "processing" | "done" | "error";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload an image file.");
      setStatus("error");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("Image must be under 20MB.");
      setStatus("error");
      return;
    }

    // Preview original
    const localUrl = URL.createObjectURL(file);
    setOriginalUrl(localUrl);
    setResultUrl(null);
    setStatus("processing");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setStatus("done");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "removed-background.png";
    a.click();
  };

  const handleReset = () => {
    setStatus("idle");
    setOriginalUrl(null);
    setResultUrl(null);
    setErrorMsg("");
    setShowOriginal(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">BG Remover</h1>
          <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Free</span>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-12 px-6 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
          Remove Image Background<br />
          <span className="text-indigo-600">Instantly & Free</span>
        </h2>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Upload any image — our AI removes the background in seconds. No sign-up required.
        </p>
      </section>

      {/* Main content */}
      <section className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {status === "idle" && (
          <div
            className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors ${
              isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">Drop your image here</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse · PNG, JPG, WEBP · Max 20MB</p>
              </div>
              <button className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
                Upload Image
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        )}

        {status === "processing" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">Removing background...</p>
                <p className="text-sm text-gray-400 mt-1">AI is working on your image</p>
              </div>
              {originalUrl && (
                <img src={originalUrl} alt="Original" className="mt-4 max-h-48 rounded-xl object-contain opacity-50" />
              )}
            </div>
          </div>
        )}

        {status === "done" && resultUrl && (
          <div className="space-y-6">
            {/* Before / After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Original</p>
                <div className="bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center min-h-48">
                  {originalUrl && <img src={originalUrl} alt="Original" className="max-h-64 object-contain" />}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-indigo-200 p-4 ring-1 ring-indigo-100">
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-3">Background Removed ✓</p>
                <div
                  className="rounded-xl overflow-hidden flex items-center justify-center min-h-48"
                  style={{ background: "repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 20px 20px" }}
                >
                  <img src={resultUrl} alt="Result" className="max-h-64 object-contain" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleDownload}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PNG
              </button>
              <button
                onClick={handleReset}
                className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3 rounded-xl border border-gray-200 transition-colors"
              >
                Remove Another
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="bg-white rounded-2xl border border-red-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">Something went wrong</p>
                <p className="text-sm text-red-500 mt-1">{errorMsg}</p>
              </div>
              <button onClick={handleReset} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
                Try Again
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: "⚡", title: "Instant Results", desc: "AI processes your image in under 5 seconds" },
            { icon: "🔒", title: "Privacy First", desc: "Images are never stored on our servers" },
            { icon: "✂️", title: "Perfect Cutout", desc: "Handles hair, fur, and complex edges" },
          ].map((f) => (
            <div key={f.title}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6 px-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} BG Remover · Powered by Remove.bg API
      </footer>
    </main>
  );
}
