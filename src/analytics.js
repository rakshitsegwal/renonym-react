import { track as vercelTrack } from '@vercel/analytics';

// One place to emit a custom event — goes to Vercel Web Analytics (funnels) and
// Microsoft Clarity (so you can filter session recordings by what happened).
// Never throws; a no-op if a provider isn't loaded.
export function track(event, props) {
    try { vercelTrack(event, props || undefined); } catch (_) {}
    try { if (window.clarity) window.clarity('event', event); } catch (_) {}
}

// Tag the current session with the signed-in user's id (anonymised) so Clarity
// can group a person's recordings without storing PII.
export function identify(userId) {
    try { if (window.clarity && userId) window.clarity('identify', String(userId)); } catch (_) {}
}

// Load Microsoft Clarity (session replay + click heatmaps) when configured via
// VITE_CLARITY_ID. Cookieless-friendly; injected once.
export function initClarity() {
    const id = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_CLARITY_ID : null;
    if (!id || (typeof window !== 'undefined' && window.clarity)) return;
    (function (c, l, a, r, i) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        const t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
        const y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', id);
}
