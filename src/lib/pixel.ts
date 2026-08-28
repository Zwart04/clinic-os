// Lightweight pixel tracker - injects fbq + gtag if env vars set.
// For static export: we record events into local DB and (optionally) call gtag/fbq.

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    _fbq?: unknown;
    _gtag?: unknown;
    dataLayer?: unknown[];
  }
}

export function initPixels() {
  if (typeof window === "undefined") return;

  if (META_PIXEL_ID && !window.fbq) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (function (f: any, b, e, v, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        // eslint-disable-next-line prefer-rest-params
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq!("init", META_PIXEL_ID);
    window.fbq!("track", "PageView");
  }

  if (GOOGLE_ADS_ID && !window.gtag) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.gtag = function gtag(...args: any[]) {
      // eslint-disable-next-line prefer-rest-params
      (window.dataLayer as unknown[]).push(args);
    };
    window.gtag!("js", new Date());
    window.gtag!("config", GOOGLE_ADS_ID);
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (window.fbq) {
    try { window.fbq!("track", name, params ?? {}); } catch { /* noop */ }
  }
  if (window.gtag) {
    try { window.gtag!("event", name, params ?? {}); } catch { /* noop */ }
  }
}
