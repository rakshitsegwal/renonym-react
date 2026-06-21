import React, { useState } from 'react';
import { X, Check, Tag } from 'lucide-react';
import { AuthModal } from './AuthModal.jsx';
import { payAndVerify, authMe, getUser, validatePromo } from './coach/api.js';
import { track } from './analytics.js';

// The ladder modal — the single purchase surface for the credit + pass ladder.
// Display order cheap→premium: Prep Pack → Season Pass (HERO, pre-selected) →
// Placement Pro → Boost Pack. Opened from: out-of-credits gates,
// premium-template crowns, the sidebar credit pill, and the landing cards.
// Prices reprice 2026-06; plan `id`s keep their original names (the server's
// `amount` is the only price of record).
const LADDER = [
    {
        id: 'prep_199', name: 'Prep Pack', price: '₹199', rupees: 199, per: '30 days',
        feats: ['3 full interviews (audio + text)', 'Unlimited AI actions', 'All 10 templates', 'Full scored reports'],
        tag: null,
    },
    {
        id: 'season_1499', name: 'Season Pass', price: '₹699', rupees: 699, per: '90 days',
        feats: ['8 full interviews (audio + text)', 'Unlimited AI actions', 'All 10 templates', 'Full scored reports'],
        tag: 'MOST POPULAR', hero: true,
    },
    {
        id: 'pro_2999', name: 'Placement Pro', price: '₹1,499', rupees: 1499, per: '90 days',
        feats: ['25 full interviews (audio + text)', 'Unlimited AI actions', 'All 10 templates', 'Priority support'],
        tag: null,
    },
    {
        id: 'boost_299', name: 'Boost Pack', price: '₹299', rupees: 299, per: 'one-time',
        feats: ['+10 credits', 'Tailoring, AI review, AI styles', 'Valid 6 months'],
        tag: null,
    },
];
const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

// Shared: refresh the cached user (credits/pass) after any purchase.
export async function refreshCachedUser() {
    try {
        const u = await authMe();
        if (u && u.id) {
            localStorage.setItem('rn-auth-user', JSON.stringify({
                id: u.id, email: u.email, name: u.name, avatarUrl: u.avatarUrl,
                plan: u.plan || 'free', coach: u.coach || null,
                credits: u.credits || 0, passType: u.passType || null,
                passExpiresAt: u.passExpiresAt || null,
                passInterviewsRemaining: u.passInterviewsRemaining || 0,
                interviewCredits: u.interviewCredits || 0,
                freeInterviewUsed: !!u.freeInterviewUsed,
                referralCode: u.referralCode || null,
            }));
        }
        return u;
    } catch (e) { return null; }
}

export default function PaymentModal({ onClose, onSuccess, reason = 'generic', meta = {} }) {
    const [selected, setSelected] = useState('season_1499');
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [showAuth, setShowAuth] = useState(false);
    const [coupon, setCoupon] = useState('');
    const [couponBusy, setCouponBusy] = useState(false);
    const [couponMsg, setCouponMsg] = useState('');
    const [promo, setPromo] = useState(null);   // { code, percent } once validated

    const pct = promo ? promo.percent : 0;
    const priceOf = (rupees) => promo ? Math.round(rupees * (100 - pct) / 100) : rupees;

    // Validate the promo code so the discounted price shown matches what the
    // server will actually charge. The server is authoritative on the amount.
    async function applyPromo() {
        const code = coupon.trim();
        if (!code || couponBusy || promo) return;
        setCouponBusy(true); setCouponMsg(''); setError('');
        try {
            const r = await validatePromo(code);
            if (r && r.valid) { setPromo({ code: r.code, percent: r.percent }); setCouponMsg(`✓ ${r.percent}% off applied`); }
            else { setPromo(null); setCouponMsg("That code isn't valid."); }
        } catch (e) { setPromo(null); setCouponMsg("Couldn't check that code — try again."); }
        finally { setCouponBusy(false); }
    }
    function clearPromo() { setPromo(null); setCoupon(''); setCouponMsg(''); }

    const titles = {
        credits: "You're out of credits",
        template: 'Unlock all 10 templates',
        interview: 'Keep interviewing',
        generic: 'Upgrade your job hunt',
    };
    const subs = {
        credits: 'Top up, or go unlimited for the whole season.',
        template: 'Premium templates are included with any pass.',
        interview: 'Pick the pass that matches your search.',
        generic: 'One-time payments. No subscriptions. No surprises.',
    };

    async function pay(user) {
        if (busy) return;
        setBusy(true); setError(''); setStatus('Opening secure checkout…');
        try {
            await payAndVerify(selected, user, LADDER.find(p => p.id === selected)?.name || 'Renonym', promo ? { coupon: promo.code } : {});
            setStatus('Activating…');
            await refreshCachedUser();
            track('purchase', { plan: selected, reason, promo: promo ? promo.code : undefined });
            setStatus('');
            onSuccess ? onSuccess(selected) : onClose();
        } catch (e) {
            setStatus('');
            if (e.message !== 'CANCELLED') setError(e.message || 'Payment failed — try again.');
            setBusy(false);
        }
    }

    function handlePay() {
        const user = getUser();
        if (!user) { setShowAuth(true); return; }
        pay(user);
    }

    return (
        <div className="rn-dark" style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(4,5,7,0.78)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}
             onClick={(e) => e.target === e.currentTarget && !busy && onClose()}>
            {showAuth && (
                <AuthModal reason="payment" onClose={() => setShowAuth(false)}
                    onAuth={(token, user) => {
                        localStorage.setItem('rn-auth-token', token);
                        localStorage.setItem('rn-auth-user', JSON.stringify(user));
                        setShowAuth(false);
                        pay(user);
                    }} />
            )}
            <div className="card-2" style={{ width: '100%', maxWidth: 760, maxHeight: '94dvh', overflowY: 'auto', padding: '30px 28px' }}>
                <div className="row ac jsb" style={{ marginBottom: 6 }}>
                    <h2 style={{ fontFamily: 'var(--rn-serif)', fontWeight: 400, fontSize: 26, color: 'var(--text)' }}>{titles[reason] || titles.generic}</h2>
                    <button className="btn btn-ghost btn-sm" style={{ width: 32, padding: 0 }} onClick={onClose} disabled={busy}><X size={15} /></button>
                </div>
                <p className="sm" style={{ marginBottom: 20 }}>{subs[reason] || subs.generic}</p>

                {reason === 'credits' && (
                    <div className="card" style={{ padding: '12px 16px', marginBottom: 18, borderColor: 'var(--gold-line)', background: 'var(--gold-soft)' }}>
                        <p className="sm" style={{ color: 'var(--text)' }}>
                            You've used <b>{meta.actionsUsed ?? 0}</b> AI action{(meta.actionsUsed ?? 0) === 1 ? '' : 's'}. Candidates who land interviews tailor their résumé <b>15+ times</b>.
                        </p>
                    </div>
                )}

                {/* Promo code — applies a flat % off (server-validated). */}
                <div className="card" style={{ padding: '14px 16px', marginBottom: 18, borderColor: promo ? 'var(--green)' : 'var(--gold-line)' }}>
                    <div className="row ac gap-8" style={{ marginBottom: 10 }}>
                        <Tag size={15} color={promo ? 'var(--green)' : 'var(--gold)'} />
                        <span className="sm" style={{ color: 'var(--text)', fontWeight: 600 }}>{promo ? `Promo applied — ${promo.percent}% off` : 'Have a promo code?'}</span>
                    </div>
                    {!promo ? (
                        <div className="row gap-8 wrap-f">
                            <input className="input fill" style={{ minWidth: 160, textTransform: 'uppercase' }} placeholder="PROMO CODE"
                                   value={coupon} onChange={(e) => setCoupon(e.target.value)} disabled={couponBusy}
                                   onKeyDown={(e) => e.key === 'Enter' && applyPromo()} maxLength={24} />
                            <button className="btn btn-gold btn-sm none" onClick={applyPromo} disabled={couponBusy || !coupon.trim()}>
                                {couponBusy ? '…' : 'Apply'}
                            </button>
                        </div>
                    ) : (
                        <button className="btn btn-ghost btn-sm none" onClick={clearPromo}>Remove code</button>
                    )}
                    {couponMsg && <p className="xs" style={{ marginTop: 8, color: promo ? 'var(--green)' : 'var(--rose)' }}>{couponMsg}</p>}
                </div>

                <div className="grid gap-12 g-3" style={{ gridTemplateColumns: (reason === 'template' || reason === 'interview') ? '1fr 1fr' : '1fr 1fr 1fr', marginBottom: 18, alignItems: 'stretch', paddingTop: 12 }}>
                    {LADDER.filter(p => (reason !== 'template' && reason !== 'interview') || p.id !== 'boost_299').map(p => {
                        const on = selected === p.id;
                        return (
                            <button key={p.id} onClick={() => setSelected(p.id)}
                                    className={on || p.hero ? 'card-gold' : 'card'}
                                    style={{ padding: '18px 16px', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                             borderColor: on ? 'var(--gold)' : p.hero ? 'var(--gold-line)' : 'var(--line)',
                                             boxShadow: on ? '0 0 0 2px var(--gold-soft)' : 'none', position: 'relative' }}>
                                {p.tag && <span className="badge gold" style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>{p.tag}</span>}
                                <div className="row ac gap-8" style={{ marginBottom: 6 }}>
                                    <span style={{ width: 16, height: 16, borderRadius: '50%', flex: 'none', border: '2px solid ' + (on ? 'var(--gold)' : 'var(--line-3)'), background: on ? 'radial-gradient(circle,var(--gold) 0 4px,transparent 5px)' : 'transparent' }} />
                                    <span className="h5">{p.name}</span>
                                </div>
                                <div className="row ae gap-6" style={{ marginBottom: 10 }}>
                                    {promo && <span className="xs" style={{ textDecoration: 'line-through', color: 'var(--faint)', paddingBottom: 4 }}>{p.price}</span>}
                                    <span className="h3" style={{ fontSize: 24, color: 'var(--text)' }}>{promo ? inr(priceOf(p.rupees)) : p.price}</span>
                                    <span className="xs" style={{ paddingBottom: 4 }}>{p.per}</span>
                                </div>
                                <div className="col gap-6" style={{ flex: 1 }}>
                                    {p.feats.map(f => (
                                        <div key={f} className="row gap-6 xs" style={{ color: 'var(--text-2)', alignItems: 'flex-start' }}>
                                            <Check size={11} color="var(--green)" style={{ flex: 'none', marginTop: 2 }} />{f}
                                        </div>
                                    ))}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {error && <div className="card" style={{ padding: '12px 14px', marginBottom: 12, borderColor: 'var(--rose)', background: 'var(--rose-soft)' }}><p className="sm" style={{ color: 'var(--rose)' }}>{error}</p></div>}

                <button className="btn btn-gold btn-lg btn-block" onClick={handlePay} disabled={busy}>
                    {busy ? (status || 'Processing…') : (() => {
                        const p = LADDER.find(x => x.id === selected);
                        const price = promo ? inr(priceOf(p.rupees)) : p.price;
                        return `Get ${p?.name} — ${price}${promo ? ` (${promo.percent}% off)` : ''}`;
                    })()}
                </button>
                <p className="xs tc" style={{ marginTop: 12 }}>
                    One-time payment via Razorpay (card / UPI / netbanking). Need just one interview? <b>Single Interview ₹49</b> is available at interview setup.
                </p>
            </div>
        </div>
    );
}
