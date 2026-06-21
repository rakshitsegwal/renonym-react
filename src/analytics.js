import { track as vercelTrack } from '@vercel/analytics';

// Rupee value per SKU — Meta Pixel needs a value+currency on Purchase to optimise
// ad delivery and report ROAS. Server is still the source of truth for revenue.
const SKU_VALUE = { boost_299: 299, single_499: 499, season_1499: 1499, pro_2999: 2999, report_unlock_299: 299 };

// Forward an event to the Meta (Facebook) Pixel, mapping to Meta standard events
// where they exist (better for ad optimisation) and trackCustom for the rest.
function fbqEvent(event, props) {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
    try {
        if (event === 'purchase') {
            window.fbq('track', 'Purchase', { value: SKU_VALUE[props && props.plan] || 0, currency: 'INR', content_name: (props && props.plan) || '' });
        } else if (event === 'signup') {
            window.fbq('track', 'CompleteRegistration');
        } else if (event === 'founding_redeemed') {
            window.fbq('track', 'StartTrial');
        } else {
            window.fbq('trackCustom', event, props || {});
        }
    } catch (_) {}
}

// One place to emit a custom event — goes to Vercel Web Analytics (funnels),
// Microsoft Clarity (filter session recordings by what happened) and the Meta
// Pixel (ad optimisation). Never throws; a no-op if a provider isn't loaded.
export function track(event, props) {
    try { vercelTrack(event, props || undefined); } catch (_) {}
    try { if (window.clarity) window.clarity('event', event); } catch (_) {}
    fbqEvent(event, props);
}

// Re-fire a Meta Pixel PageView on SPA route changes (the base snippet only
// fires once on initial load, so client-side navigations would be invisible).
export function fbqPageView() {
    try { if (typeof window !== 'undefined' && typeof window.fbq === 'function') window.fbq('track', 'PageView'); } catch (_) {}
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
