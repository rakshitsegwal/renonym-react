import React, { useState } from 'react';
import { X, Check, Gift } from 'lucide-react';
import { AuthModal } from './AuthModal.jsx';
import { payAndVerify, authMe, getUser, redeemFounding } from './coach/api.js';

// The ladder modal — the single purchase surface for the v14 credit + pass
// ladder. Display order: Placement Pro → Season Pass (HERO, pre-selected) →
// Boost Pack. Opened from: out-of-credits gates, premium-template crowns,
// the sidebar credit pill, and the landing pricing cards.
const LADDER = [
    {
        id: 'pro_2999', name: 'Placement Pro', price: '₹2,999', rupees: 2999, per: '90 days',
        feats: ['25 full interviews (audio + text)', 'Unlimited AI actions', 'All 10 templates', 'Priority support'],
        tag: null,
    },
    {
        id: 'season_1499', name: 'Season Pass', price: '₹1,499', rupees: 1499, per: '90 days',
        feats: ['6 full interviews (audio + text)', 'Unlimited AI actions', 'All 10 templates', 'Full scored reports'],
        tag: 'MOST POPULAR', hero: true,
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
    const [authIntent, setAuthIntent] = useState('pay');   // 'pay' | 'redeem'
    const [coupon, setCoupon] = useState('');
    const [couponBusy, setCouponBusy] = useState(false);
    const [couponMsg, setCouponMsg] = useState('');

    const me = getUser();
    const founding = me && me.founding;
    const discount = !!(founding && founding.discountAvailable);   // 30% off first purchase

    async function redeem() {
        const code = coupon.trim();
        if (!code || couponBusy) return;
        if (!getUser()) { setAuthIntent('redeem'); setShowAuth(true); return; }
        setCouponBusy(true); setCouponMsg(''); setError('');
        try {
            await redeemFounding(code);
            await refreshCachedUser();
            setCouponMsg('🎉 You’re a founding member — 7 days of full premium unlocked!');
            setTimeout(() => { onSuccess ? onSuccess('founding') : onClose(); }, 1500);
        } catch (e) {
            setCouponMsg(
                e.code === 'FULL'         ? 'All 20 founding spots are taken.' :
                e.code === 'NOT_VERIFIED' ? 'Verify your email first — sign in with Google or the email link.' :
                e.code === 'NOT_ELIGIBLE' ? 'The founding program is for new accounts created during the beta.' :
                (e.message || 'That code isn’t valid.'));
            setCouponBusy(false);
        }
    }

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
            await payAndVerify(selected, user, LADDER.find(p => p.id === selected)?.name || 'Renonym');
            setStatus('Activating…');
            await refreshCachedUser();
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
                        if (authIntent === 'redeem') redeem(); else pay(user);
                    }} />
            )}
            <div className="card-2" style={{ width: '100%', maxWidth: 760, maxHeight: '94dvh', overflowY: 'auto', padding: '30px 28px' }}>
                <div className="row ac jsb" style={{ marginBottom: 6 }}>
                    <h2 style={{ fontFamily: 'var(--rn-serif)', fontWeight: 400, fontSize: 26, color: 'var(--text)' }}>{titles[reason] || titles.generic}</h2>
                    <button className="btn btn-ghost btn-sm" style={{ width: 32, padding: 0 }} onClick={onClose} disabled={busy}><X size={15} /></button>
                </div>
                <p className="sm" style={{ marginBottom: 20 }}>{subs[reason] || subs.generic}</p>

                {/* Founding member — already in. Show the 30%-off perk if unused. */}
                {founding && (
                    <div className="card" style={{ padding: '12px 16px', marginBottom: 18, borderColor: 'var(--gold-line)', background: 'var(--gold-soft)' }}>
                        <p className="sm" style={{ color: 'var(--text)' }}>
                            <b>★ Founding member #{founding.number}</b>
                            {founding.trialActive ? ` — ${founding.trialDaysRemaining} day${founding.trialDaysRemaining === 1 ? '' : 's'} of full premium left.` : ' — trial ended.'}
                            {discount && <> Your <b>30% founding discount</b> is applied below.</>}
                        </p>
                    </div>
                )}

                {/* Founding coupon redemption (only if not yet a founding member). */}
                {!founding && (
                    <div className="card" style={{ padding: '14px 16px', marginBottom: 18, borderColor: 'var(--gold-line)' }}>
                        <div className="row ac gap-8" style={{ marginBottom: 10 }}>
                            <Gift size={15} color="var(--gold)" />
                            <span className="sm" style={{ color: 'var(--text)', fontWeight: 600 }}>Have a founding code?</span>
                        </div>
                        <div className="row gap-8 wrap-f">
                            <input className="input fill" style={{ minWidth: 160, textTransform: 'uppercase' }} placeholder="FOUNDING CODE"
                                   value={coupon} onChange={(e) => setCoupon(e.target.value)} disabled={couponBusy}
                                   onKeyDown={(e) => e.key === 'Enter' && redeem()} maxLength={16} />
                            <button className="btn btn-gold btn-sm none" onClick={redeem} disabled={couponBusy || !coupon.trim()}>
                                {couponBusy ? '…' : 'Redeem'}
                            </button>
                        </div>
                        {couponMsg && <p className="xs" style={{ marginTop: 8, color: couponMsg.startsWith('🎉') ? 'var(--green)' : 'var(--rose)' }}>{couponMsg}</p>}
                    </div>
                )}

                {reason === 'credits' && (
                    <div className="card" style={{ padding: '12px 16px', marginBottom: 18, borderColor: 'var(--gold-line)', background: 'var(--gold-soft)' }}>
                        <p className="sm" style={{ color: 'var(--text)' }}>
                            You've used <b>{meta.actionsUsed ?? 0}</b> AI action{(meta.actionsUsed ?? 0) === 1 ? '' : 's'}. Candidates who land interviews tailor their résumé <b>15+ times</b>.
                        </p>
                    </div>
                )}

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
                                    {discount && <span className="xs" style={{ textDecoration: 'line-through', color: 'var(--faint)', paddingBottom: 4 }}>{p.price}</span>}
                                    <span className="h3" style={{ fontSize: 24, color: 'var(--text)' }}>{discount ? inr(Math.round(p.rupees * 0.7)) : p.price}</span>
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
                        const price = discount ? inr(Math.round(p.rupees * 0.7)) : p.price;
                        return `Get ${p?.name} — ${price}${discount ? ' (30% off)' : ''}`;
                    })()}
                </button>
                <p className="xs tc" style={{ marginTop: 12 }}>
                    One-time payment via Razorpay (card / UPI / netbanking). Need just one interview? <b>Single Interview ₹499</b> is available at interview setup.
                </p>
            </div>
        </div>
    );
}
