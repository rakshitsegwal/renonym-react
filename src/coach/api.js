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
export const authMe         = () => req('/auth/me');   // fresh plan from the server — localStorage goes stale after purchases
export const claimReferral   = (code) => req('/referral/claim', { method: 'POST', body: { code } });
// Promo coupon (e.g. Meta ad code) — validate to show the discounted price.
export const validatePromo   = (code) => req(`/promo/validate?code=${encodeURIComponent(code)}`);
export const adminFounding   = () => req('/admin/founding');                                   // email-allowlist gated
export const createSession  = (cfg) => req('/coach/sessions', { method: 'POST', body: cfg, timeoutMs: 150000 });

// ── Audio interview: AI interviewer voice + spoken-answer transcription ──────
// Both have client-side fallbacks (browser TTS / live SpeechRecognition), so a
// failure here degrades gracefully instead of blocking the interview.
export async function questionAudio(sessionId, questionId) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
        const res = await fetch(`${RAILWAY_URL}/coach/sessions/${sessionId}/question-audio`, {
            method: 'POST', headers: headers(), signal: controller.signal,
            body: JSON.stringify({ questionId }),
        });
        if (!res.ok) throw new CoachError(`Audio unavailable (${res.status})`, res.status);
        return await res.blob();
    } finally { clearTimeout(timer); }
}

export async function transcribeAudio(sessionId, blob) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    try {
        const t = getToken();
        const res = await fetch(`${RAILWAY_URL}/coach/sessions/${sessionId}/transcribe`, {
            method: 'POST', signal: controller.signal,
            headers: {
                'Content-Type': blob.type || 'application/octet-stream',
                'x-client-id': clientId(),
                ...(API_SECRET ? { 'x-api-secret': API_SECRET } : {}),
                ...(t ? { Authorization: `Bearer ${t}` } : {}),
            },
            body: blob,
        });
        let data = null;
        try { data = await res.json(); } catch {}
        if (!res.ok) throw new CoachError((data && data.error) || `Transcription failed (${res.status})`, res.status);
        return (data && data.text) || '';
    } finally { clearTimeout(timer); }
}
export const listSessions   = () => req('/coach/sessions');
export const getSession     = (id) => req(`/coach/sessions/${id}`);
export const submitAnswer   = (id, questionId, text) => req(`/coach/sessions/${id}/answers`, { method: 'POST', body: { questionId, text } });
export const scoreSession   = (id) => req(`/coach/sessions/${id}/score`, { method: 'POST', timeoutMs: 120000 });

// ── Résumé upload + parse (reuses the existing /extract-resume endpoint) ─────
function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src; s.onload = () => resolve(); s.onerror = () => reject(new Error('load failed'));
        document.head.appendChild(s);
    });
}
async function fileToText(file) {
    const name = (file.name || '').toLowerCase();
    if (name.endsWith('.pdf') || file.type === 'application/pdf') {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
        const pdfjsLib = window.pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buf, isEvalSupported: false }).promise;   // CVE-2024-4367 mitigation
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(it => it.str).join(' ') + '\n';
        }
        return text;
    }
    if (name.endsWith('.docx')) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
        const buf = await file.arrayBuffer();
        const r = await window.mammoth.extractRawText({ arrayBuffer: buf });
        return r.value || '';
    }
    return await file.text(); // txt / fallback
}
// Returns structured résumé data the question generator can use.
export async function parseResumeFile(file) {
    if (file.size > 5 * 1024 * 1024) throw new Error('Résumé must be under 5 MB.');
    const text = await fileToText(file);
    if (!text || text.trim().length < 30) throw new Error('Could not read that file. Try a PDF, DOCX, or TXT.');
    return await req('/extract-resume', { method: 'POST', body: { text } });
}

// ── Setup draft (carries config from Setup → Checkout → session create) ──────
const DRAFT_KEY = 'coach-draft';
const DRAFT_TTL = 2 * 60 * 60 * 1000;   // a 2h-old draft is stale, not resumable
export function saveDraft(cfg) { try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...cfg, _ts: Date.now() })); } catch {} }
export function loadDraft() {
    try {
        const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null');
        if (d && d._ts && Date.now() - d._ts > DRAFT_TTL) { sessionStorage.removeItem(DRAFT_KEY); return null; }
        return d;
    } catch { return null; }
}
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
export async function payAndVerify(planId, user, description = 'Renonym', extra = {}) {
    const ok = await loadRazorpay();
    if (!ok) throw new Error('Could not load Razorpay. Check your connection.');

    const order = await req('/create-order', { method: 'POST', body: { planId, userId: user?.id || null, ...extra } });

    return await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
            key: order.key_id, amount: order.amount, currency: order.currency, order_id: order.order_id,
            name: 'Renonym AI', description,
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
