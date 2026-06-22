import React, { useState, useEffect, useRef } from 'react';
import { isInAppBrowser, inAppBrowserName, isAndroid } from './webview.js';

const RAILWAY_URL = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV
    ? '/api'
    : 'https://salesforce-resume-pdf-server-production.up.railway.app';

function getClientId() {
    let id = localStorage.getItem('rb-client-id');
    if (!id) {
        id = (crypto.randomUUID ? crypto.randomUUID() : 'c-' + Date.now());
        localStorage.setItem('rb-client-id', id);
    }
    return id;
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────
// Signup paths, in priority of reliability:
//   1. Email OTP — works EVERYWHERE incl. Instagram/FB/TikTok in-app browsers
//      (no popup, no third-party cookie, no polling — the code is typed back in).
//   2. Google OAuth (popup) — fast on real browsers, but blocked in webviews,
//      so inside an in-app browser we lead with email and offer "open in browser".
export function AuthModal({ onAuth, onClose, reason }) {
    const inApp = isInAppBrowser();
    const [step, setStep]       = useState('choose');   // 'choose' | 'code'
    const [email, setEmail]     = useState('');
    const [code, setCode]       = useState('');
    const [sending, setSending] = useState(false);   // requesting a code
    const [verifying, setVerifying] = useState(false);
    const [error, setError]     = useState('');
    const [showOpenIn, setShowOpenIn] = useState(false);
    const [copied, setCopied]   = useState(false);
    const pollRef               = useRef(null);

    useEffect(() => () => clearInterval(pollRef.current), []);

    async function handleGoogle() {
        setError(''); setShowOpenIn(false);
        try {
            const nr = await fetch(`${RAILWAY_URL}/auth/init-poll`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }
            });
            const { nonce } = await nr.json();

            // Open OAuth popup — and CHECK it actually opened. In-app browsers
            // return null/blocked here; that used to fail silently.
            const w = 520, h = 620;
            const left = window.screenX + (window.outerWidth - w) / 2;
            const top  = window.screenY + (window.outerHeight - h) / 2;
            const popup = window.open(
                `${RAILWAY_URL}/auth/google?nonce=${nonce}`,
                'renonym_auth',
                `width=${w},height=${h},left=${left},top=${top}`
            );
            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                setError('Your browser blocked the Google pop-up. Use email below, or open renonym.com in your browser.');
                setShowOpenIn(true);
                return;
            }

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
            setTimeout(() => clearInterval(iv), 5 * 60 * 1000);
        } catch (e) {
            setError('Could not start Google sign-in. Please use email instead.');
        }
    }

    async function requestCode(e) {
        if (e) e.preventDefault();
        const addr = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) { setError('Please enter a valid email address.'); return; }
        setSending(true); setError('');
        try {
            const r = await fetch(`${RAILWAY_URL}/auth/email/request-otp`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: addr })
            });
            const data = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(data.error || 'Could not send your code.');
            setStep('code'); setCode('');
        } catch (err) {
            setError(err.message || 'Could not send your code. Please try again.');
        } finally {
            setSending(false);
        }
    }

    async function verifyCode(e) {
        if (e) e.preventDefault();
        if (!/^\d{6}$/.test(code)) { setError('Enter the 6-digit code from your email.'); return; }
        setVerifying(true); setError('');
        try {
            const r = await fetch(`${RAILWAY_URL}/auth/email/verify-otp`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase(), code, clientId: getClientId() })
            });
            const data = await r.json().catch(() => ({}));
            if (!r.ok || !data.token) throw new Error(data.error || 'That code didn’t work.');
            onAuth(data.token, data.user);
        } catch (err) {
            setError(err.message || 'Sign-in failed. Please try again.');
            setVerifying(false);
        }
    }

    function openInBrowser() {
        const url = 'https://renonym.com' + (reason ? '' : '');
        // Android can hand off to Chrome via an intent URL; iOS must be instructed.
        if (isAndroid()) {
            try {
                // hand off to Chrome; fall back to the normal URL if Chrome is absent
                window.location.href = 'intent://renonym.com/#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=https%3A%2F%2Frenonym.com;end';
                return;
            } catch {}
        }
        try {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {}
    }

    const title = reason === 'export' ? 'Sign in to export' : reason === 'payment' ? 'Sign in to upgrade' : 'Create your free account';
    const sub   = reason === 'export'
        ? 'Create a free account to download your résumé PDF.'
        : reason === 'payment'
        ? 'Create a free account first, then complete your purchase.'
        : 'Takes 20 seconds — no password, no credit card.';

    const googleBtn = (
        <button className="rn-auth-btn rn-auth-btn--google" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
        </button>
    );

    const emailForm = (
        <form className="rn-auth-modal__magic-form" onSubmit={requestCode}>
            <input type="email" inputMode="email" autoComplete="email" className="rn-auth-input"
                placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus={inApp} />
            <button className="rn-auth-btn rn-auth-btn--magic" disabled={sending}>
                {sending ? 'Sending…' : 'Email me a sign-in code'}
            </button>
        </form>
    );

    return (
        <div className="rn-auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="rn-auth-modal">
                <button className="rn-auth-modal__close" onClick={onClose}>×</button>

                <div className="rn-auth-modal__icon">✦</div>
                <h2 className="rn-auth-modal__title">{title}</h2>
                <p className="rn-auth-modal__sub">{sub}</p>

                {inApp && step === 'choose' && (
                    <div className="rn-auth-note">
                        You’re in {inAppBrowserName()}’s in-app browser. Sign in with your <strong>email</strong> below — it works right here.
                    </div>
                )}

                {error && <div className="rn-auth-modal__error">{error}</div>}

                {/* STEP 1 — choose method (email always available; Google order depends on env) */}
                {step === 'choose' && (
                    <div className="rn-auth-modal__actions">
                        {inApp ? (
                            <>
                                {emailForm}
                                <div className="rn-auth-modal__divider">or</div>
                                <button className="rn-auth-btn rn-auth-btn--ghost" onClick={() => setShowOpenIn(v => !v)}>
                                    Use Google (opens your browser)
                                </button>
                            </>
                        ) : (
                            <>
                                {googleBtn}
                                <div className="rn-auth-modal__divider">or</div>
                                {emailForm}
                            </>
                        )}

                        {showOpenIn && (
                            <div className="rn-auth-note rn-auth-note--steps">
                                {isAndroid()
                                    ? <>Tap below to open Renonym in Chrome, then use Google there.</>
                                    : <>Tap the <strong>•••</strong> menu (top-right) and choose <strong>“Open in browser”</strong>, then use Google.</>}
                                <button className="rn-auth-btn rn-auth-btn--ghost" style={{ marginTop: 10 }} onClick={openInBrowser}>
                                    {isAndroid() ? 'Open in Chrome ↗' : (copied ? 'Link copied ✓' : 'Copy link')}
                                </button>
                            </div>
                        )}

                        <p className="rn-auth-modal__terms">Free to start · No credit card needed</p>
                    </div>
                )}

                {/* STEP 2 — enter the 6-digit code */}
                {step === 'code' && (
                    <form className="rn-auth-modal__magic-form" onSubmit={verifyCode}>
                        <p className="rn-auth-modal__sub" style={{ marginBottom: 4 }}>
                            We emailed a 6-digit code to <strong>{email}</strong>. Enter it below.
                        </p>
                        <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                            className="rn-auth-input rn-auth-input--code" placeholder="••••••" value={code}
                            onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setCode(v); setError(''); }}
                            autoFocus />
                        <button className="rn-auth-btn rn-auth-btn--magic" disabled={verifying || code.length !== 6}>
                            {verifying ? 'Verifying…' : 'Verify & continue →'}
                        </button>
                        <div className="rn-auth-modal__row">
                            <button type="button" className="rn-auth-back" onClick={() => { setStep('choose'); setError(''); }}>← Change email</button>
                            <button type="button" className="rn-auth-back" onClick={requestCode} disabled={sending}>
                                {sending ? 'Sending…' : 'Resend code'}
                            </button>
                        </div>
                    </form>
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
            sub: 'Premium templates need a pass — free templates and AI styles export clean at no cost.',
        },
        limit_reached: {
            icon: '✦',
            title: "You've used today's free actions",
            sub: 'AI actions run on credits. Top up with a Boost Pack, or get unlimited AI with a Season Pass.',
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
                        <span className="rn-credit-option__label">See plans — from ₹199</span>
                        <span className="rn-credit-option__desc">Credit packs &amp; passes · one-time payments, no subscriptions</span>
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
                    <div className="rn-user-menu__plan">{user.passType === 'season' ? '★ Season Pass' : user.passType === 'placement_pro' ? '★ Placement Pro' : user.coach?.unlimited ? '★ Coach Unlimited' : user.plan === 'pro' ? '★ Pro' : 'Free plan'}</div>
                    <button className="rn-user-menu__logout" onClick={(e) => { e.stopPropagation(); onLogout(); }}>
                        Sign out
                    </button>
                </div>
            )}
        </div>
    );
}
