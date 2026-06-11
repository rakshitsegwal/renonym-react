import React, { useState, useEffect, useRef } from 'react';

const RAILWAY_URL = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV
    ? '/api'
    : 'https://salesforce-resume-pdf-server-production.up.railway.app';

// ─── Auth Modal ───────────────────────────────────────────────────────────────
export function AuthModal({ onAuth, onClose, reason }) {
    const [mode, setMode]         = useState('choose');   // 'choose' | 'magic'
    const [email, setEmail]       = useState('');
    const [sending, setSending]   = useState(false);
    const [sent, setSent]         = useState(false);
    const [error, setError]       = useState('');
    const pollRef                 = useRef(null);

    useEffect(() => () => clearInterval(pollRef.current), []);

    async function handleGoogle() {
        setError('');
        try {
            // Get a polling nonce first
            const nr = await fetch(`${RAILWAY_URL}/auth/init-poll`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }
            });
            const { nonce } = await nr.json();

            // Open OAuth popup
            const w = 520, h = 620;
            const left = window.screenX + (window.outerWidth - w) / 2;
            const top  = window.screenY + (window.outerHeight - h) / 2;
            window.open(
                `${RAILWAY_URL}/auth/google?nonce=${nonce}`,
                'renonym_auth',
                `width=${w},height=${h},left=${left},top=${top}`
            );

            // Poll for result (own handle — must not be killed by another flow's timer)
            clearInterval(pollRef.current);
            const iv = setInterval(async () => {
                try {
                    const pr = await fetch(`${RAILWAY_URL}/auth/poll?nonce=${nonce}`);
                    const data = await pr.json();
                    if (!data.pending) {
                        clearInterval(iv);
                        if (data.token) onAuth(data.token, data.user);
                    }
                } catch {}
            }, 1500);
            pollRef.current = iv;

            // Auto-stop polling after 5 min
            setTimeout(() => clearInterval(iv), 5 * 60 * 1000);
        } catch (e) {
            setError('Could not start Google sign-in. Try magic link instead.');
        }
    }

    async function handleMagicLink(e) {
        e.preventDefault();
        if (!email.trim()) { setError('Please enter your email.'); return; }
        setSending(true); setError('');
        try {
            // clientId keys the server-side polling slot — without it the SPA can
            // never learn the link was clicked (email opens in a separate tab).
            let clientId = localStorage.getItem('rb-client-id');
            if (!clientId) {
                clientId = (crypto.randomUUID ? crypto.randomUUID() : 'c-' + Date.now());
                localStorage.setItem('rb-client-id', clientId);
            }
            const r = await fetch(`${RAILWAY_URL}/auth/magic-link/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), clientId })
            });
            const data = await r.json();
            if (!r.ok) throw new Error(data.error || 'Failed to send');
            setSent(true);

            // Poll until the user clicks the emailed link (15-min link lifetime).
            // 6s interval stays well under the server's poll rate limit.
            clearInterval(pollRef.current);
            const iv = setInterval(async () => {
                try {
                    const pr = await fetch(`${RAILWAY_URL}/auth/poll?nonce=${clientId}_ml`);
                    const d = await pr.json();
                    if (!d.pending && d.token) {
                        clearInterval(iv);
                        onAuth(d.token, d.user);
                    }
                } catch {}
            }, 6000);
            pollRef.current = iv;
            setTimeout(() => clearInterval(iv), 15 * 60 * 1000);
        } catch (e) {
            setError(e.message || 'Failed to send magic link.');
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="rn-auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="rn-auth-modal">
                <button className="rn-auth-modal__close" onClick={onClose}>×</button>

                <div className="rn-auth-modal__icon">✦</div>
                <h2 className="rn-auth-modal__title">
                    {reason === 'export' ? 'Sign in to export' : reason === 'payment' ? 'Sign in to upgrade' : 'Sign in to continue'}
                </h2>
                <p className="rn-auth-modal__sub">
                    {reason === 'export'
                        ? 'Create a free account to download your resume PDF.'
                        : reason === 'payment'
                        ? 'Create a free account first, then complete your purchase.'
                        : 'Sign in to save your work and access all features.'}
                </p>

                {error && <div className="rn-auth-modal__error">{error}</div>}

                {mode === 'choose' && !sent && (
                    <div className="rn-auth-modal__actions">
                        <button className="rn-auth-btn rn-auth-btn--google" onClick={handleGoogle}>
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </button>

                        <div className="rn-auth-modal__divider">
                            <span>or</span>
                        </div>

                        <button className="rn-auth-btn rn-auth-btn--magic" onClick={() => setMode('magic')}>
                            ✉ Continue with email
                        </button>

                        <p className="rn-auth-modal__terms">
                            Free forever · No credit card needed
                        </p>
                    </div>
                )}

                {mode === 'magic' && !sent && (
                    <form className="rn-auth-modal__magic-form" onSubmit={handleMagicLink}>
                        <input
                            type="email"
                            className="rn-auth-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoFocus
                        />
                        <button className="rn-auth-btn rn-auth-btn--magic" disabled={sending}>
                            {sending ? 'Sending…' : 'Send magic link →'}
                        </button>
                        <button type="button" className="rn-auth-back" onClick={() => setMode('choose')}>
                            ← Back
                        </button>
                    </form>
                )}

                {sent && (
                    <div className="rn-auth-modal__sent">
                        <div className="rn-auth-modal__sent-icon">✉</div>
                        <p>Check your inbox!</p>
                        <p className="rn-auth-modal__sent-sub">
                            We sent a sign-in link to <strong>{email}</strong>.<br />
                            Click it to sign in — the link expires in 15 minutes.<br />
                            Keep this tab open: you'll be signed in here automatically.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Credit gate modal ────────────────────────────────────────────────────────
export function CreditGateModal({ reason, onClose, onUpgrade }) {
    const COPY = {
        pro_required: {
            icon: '⬇',
            title: 'Downloading is a Pro feature',
            sub: 'Your free preview is watermarked and blurred. Go premium to download a clean, full-resolution PDF — plus unlimited AI features.',
        },
        limit_reached: {
            icon: '✦',
            title: "You've used today's free actions",
            sub: 'Free accounts get a limited number of AI actions per day. Go premium for unlimited AI styling, job-match analysis, reviews, and clean downloads.',
        },
    };
    const c = COPY[reason] || COPY.limit_reached;
    return (
        <div className="rn-auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="rn-auth-modal">
                <button className="rn-auth-modal__close" onClick={onClose}>×</button>
                <div className="rn-auth-modal__icon">{c.icon}</div>
                <h2 className="rn-auth-modal__title">{c.title}</h2>
                <p className="rn-auth-modal__sub">{c.sub}</p>
                <div className="rn-credit-options">
                    <button className="rn-credit-option rn-credit-option--pro" onClick={onUpgrade}>
                        <span className="rn-credit-option__label">Get Coach Unlimited · ₹1,599/mo</span>
                        <span className="rn-credit-option__desc">Unlimited interviews + unlimited AI + clean, watermark-free downloads</span>
                    </button>
                    <button className="rn-auth-back" onClick={onClose}>Maybe later</button>
                </div>
            </div>
        </div>
    );
}

// ─── Logged-in user pill (top bar) ────────────────────────────────────────────
export function UserPill({ user, onLogout }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="rn-user-pill" onClick={() => setOpen(!open)}>
            {user.avatarUrl
                ? <img src={user.avatarUrl} className="rn-user-pill__avatar" alt="" />
                : <div className="rn-user-pill__initials">
                    {(user.name || user.email || '?')[0].toUpperCase()}
                  </div>
            }
            <span className="rn-user-pill__name">{user.name || user.email?.split('@')[0]}</span>
            {open && (
                <div className="rn-user-menu">
                    <div className="rn-user-menu__email">{user.email}</div>
                    <div className="rn-user-menu__plan">{user.coach?.unlimited ? '★ Coach Unlimited' : user.plan === 'pro' ? '★ Pro' : 'Free plan'}</div>
                    <button className="rn-user-menu__logout" onClick={(e) => { e.stopPropagation(); onLogout(); }}>
                        Sign out
                    </button>
                </div>
            )}
        </div>
    );
}
