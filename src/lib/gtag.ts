// Google Analytics 4 utility
// Measurement ID: G-W9TWLH855E

export const GA_ID = "G-W9TWLH855E";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

/** Track a pageview (used on SPA route changes if needed) */
export function pageview(url: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("config", GA_ID, { page_path: url });
}

/** Send a GA4 custom event */
export function event(
  name: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}

// ─── Typed event helpers ──────────────────────────────────────────────────────

/** User uploads an image (single or batch) */
export function trackUpload(mode: "single" | "batch", count = 1) {
  event("image_upload", { mode, count });
}

/** Background removal succeeded */
export function trackRemoveSuccess(mode: "single" | "batch", count = 1) {
  event("remove_bg_success", { mode, count });
}

/** Background removal failed */
export function trackRemoveError(reason: string) {
  event("remove_bg_error", { reason });
}

/** User downloads the result */
export function trackDownload(format: "png" | "jpg" | "zip") {
  event("image_download", { format });
}

/** User copies result to clipboard */
export function trackCopy() {
  event("image_copy");
}

/** User clicks a plan upgrade button (before PayPal redirect) */
export function trackPlanClick(plan: string, billing: "monthly" | "yearly") {
  event("plan_click", { plan, billing });
}

/** User clicks a credit pack button */
export function trackPackClick(pack: string, price: number) {
  event("pack_click", { pack, price });
}

/** PayPal subscription/order created (redirect initiated) */
export function trackCheckoutStart(
  type: "subscription" | "pack",
  plan: string,
  value: number
) {
  event("begin_checkout", { type, plan, value, currency: "USD" });
}

/** User signed in */
export function trackLogin() {
  event("login", { method: "google" });
}
