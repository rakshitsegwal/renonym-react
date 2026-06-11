// Application Tracker API client — same auth scheme as the coach client
// (shared API secret + per-browser client id + the signed-in user's JWT).

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

export class TrackerError extends Error {
    constructor(message, status) { super(message); this.status = status; }
}

async function req(path, { method = 'GET', body } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
        const t = getToken();
        const res = await fetch(`${RAILWAY_URL}${path}`, {
            method, signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': clientId(),
                ...(API_SECRET ? { 'x-api-secret': API_SECRET } : {}),
                ...(t ? { Authorization: `Bearer ${t}` } : {}),
            },
            ...(body ? { body: JSON.stringify(body) } : {}),
        });
        let data = null;
        try { data = await res.json(); } catch { /* non-json */ }
        if (!res.ok) throw new TrackerError((data && data.error) || `Request failed (${res.status})`, res.status);
        return data;
    } finally { clearTimeout(timer); }
}

export const listJobs    = (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')).toString();
    return req(`/tracker/jobs${q ? '?' + q : ''}`);
};
export const createJob   = (job)         => req('/tracker/jobs', { method: 'POST', body: job });
export const getJob      = (id)          => req(`/tracker/jobs/${id}`);
export const updateJob   = (id, patch)   => req(`/tracker/jobs/${id}`, { method: 'PATCH', body: patch });
export const archiveJob  = (id)          => req(`/tracker/jobs/${id}`, { method: 'DELETE' });
export const addEvent    = (jobId, ev)   => req(`/tracker/jobs/${jobId}/events`, { method: 'POST', body: ev });
export const updateEvent = (id, patch)   => req(`/tracker/events/${id}`, { method: 'PATCH', body: patch });
export const deleteEvent = (id)          => req(`/tracker/events/${id}`, { method: 'DELETE' });
export const getAgenda   = ()            => req('/tracker/agenda');
export const getInsights = ()            => req('/tracker/insights');

// ── Shared display helpers ───────────────────────────────────────────────────
export const STAGES = [
    { key: 'saved',        label: 'Saved' },
    { key: 'applied',      label: 'Applied' },
    { key: 'interviewing', label: 'Interviewing' },
    { key: 'offer',        label: 'Offer' },
    { key: 'rejected',     label: 'Rejected' },
];
export const EVENT_LABELS = {
    note: 'Note', stage: 'Stage', round: 'Interview round', contact: 'Recruiter contact',
    salary: 'Salary', followup: 'Follow-up', task: 'Task', offer: 'Offer', rejection: 'Rejection',
};

export function daysAgo(d) {
    try {
        const days = Math.floor((Date.now() - new Date(d)) / 86400000);
        return days <= 0 ? 'today' : days === 1 ? '1d' : `${days}d`;
    } catch { return ''; }
}
export function fmtDue(d) {
    try {
        const dt = new Date(d);
        const today = new Date().toDateString() === dt.toDateString();
        return (today ? 'Today ' : dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ') +
            dt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    } catch { return ''; }
}
export function fmtSalary(j) {
    if (!j.salary_min && !j.salary_max) return null;
    const cur = j.salary_currency || 'INR';
    const f = (n) => n >= 100000 && cur === 'INR' ? `${(n / 100000).toFixed(n % 100000 ? 1 : 0)}L` : n.toLocaleString();
    if (j.salary_min && j.salary_max) return `${cur} ${f(j.salary_min)}–${f(j.salary_max)}`;
    return `${cur} ${f(j.salary_min || j.salary_max)}`;
}
