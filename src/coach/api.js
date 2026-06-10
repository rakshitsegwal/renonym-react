// Interview Coach API client — talks to the existing Railway backend, reusing
// the same auth scheme as ResumeBuilder (shared API secret + per-browser
// client id + the signed-in user's JWT).

const RAILWAY_URL = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV
    ? '/api'
    : 'https://salesforce-resume-pdf-server-production.up.railway.app';

const API_SECRET = typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_API_SECRET
    : undefined;

export function getToken() { return localStorage.getItem('rn-auth-token'); }
export function getUser() {
    try { return JSON.parse(localStorage.getItem('rn-auth-user') || 'null'); } catch { return null; }
}
function clientId() {
    let id = localStorage.getItem('rb-client-id');
    if (!id) { id = (crypto.randomUUID ? crypto.randomUUID() : 'c-' + Date.now()); localStorage.setItem('rb-client-id', id); }
    return id;
}

function headers() {
    const t = getToken();
    return {
        'Content-Type': 'application/json',
        'x-client-id': clientId(),
        ...(API_SECRET ? { 'x-api-secret': API_SECRET } : {}),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
    };
}

// Throwable error that carries the backend gate code (AUTH_REQUIRED / PRO_REQUIRED).
export class CoachError extends Error {
    constructor(message, status, code) { super(message); this.status = status; this.code = code; }
}

async function req(path, { method = 'GET', body, timeoutMs = 90000 } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(`${RAILWAY_URL}${path}`, {
            method, headers: headers(), signal: controller.signal,
            ...(body ? { body: JSON.stringify(body) } : {}),
        });
        let data = null;
        try { data = await res.json(); } catch { /* non-json */ }
        if (!res.ok) {
            throw new CoachError((data && data.error) || `Request failed (${res.status})`, res.status, data && data.code);
        }
        return data;
    } finally { clearTimeout(timer); }
}

// ── Endpoints ────────────────────────────────────────────────────────────────
export const coachMe        = () => req('/coach/me');
export const createSession  = (cfg) => req('/coach/sessions', { method: 'POST', body: cfg });
export const listSessions   = () => req('/coach/sessions');
export const getSession     = (id) => req(`/coach/sessions/${id}`);
export const submitAnswer   = (id, questionId, text) => req(`/coach/sessions/${id}/answers`, { method: 'POST', body: { questionId, text } });
export const scoreSession   = (id) => req(`/coach/sessions/${id}/score`, { method: 'POST', timeoutMs: 120000 });

// ── Setup draft (carries config from Setup → Checkout → session create) ──────
const DRAFT_KEY = 'coach-draft';
export function saveDraft(cfg) { try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(cfg)); } catch {} }
export function loadDraft()    { try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null'); } catch { return null; } }
export function clearDraft()   { try { sessionStorage.removeItem(DRAFT_KEY); } catch {} }

// ── Razorpay checkout (reuses the existing /create-order + /verify-payment) ───
function loadRazorpay() {
    return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve(true); s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });
}

// Returns the verify-payment result on success; throws Error('CANCELLED') if dismissed.
export async function payAndVerify(planId, user) {
    const ok = await loadRazorpay();
    if (!ok) throw new Error('Could not load Razorpay. Check your connection.');

    const order = await req('/create-order', { method: 'POST', body: { planId, userId: user?.id || null } });

    return await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
            key: order.key_id, amount: order.amount, currency: order.currency, order_id: order.order_id,
            name: 'Renonym AI', description: 'Interview Coach',
            prefill: { name: user?.name || '', email: user?.email || '' },
            theme: { color: '#E8C994' },
            handler: async (r) => {
                try {
                    const v = await req('/verify-payment', { method: 'POST', body: {
                        razorpay_order_id: r.razorpay_order_id,
                        razorpay_payment_id: r.razorpay_payment_id,
                        razorpay_signature: r.razorpay_signature,
                        planId, userId: user?.id || null,
                    }});
                    resolve(v);
                } catch (e) { reject(e); }
            },
            modal: { ondismiss: () => reject(new Error('CANCELLED')) },
        });
        rzp.on('payment.failed', (resp) => reject(new Error(resp.error?.description || 'Payment failed')));
        rzp.open();
    });
}
