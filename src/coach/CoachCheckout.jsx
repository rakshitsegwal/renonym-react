import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Check, Tag } from 'lucide-react';
import { Badge } from './primitives.jsx';
import { AuthModal } from '../AuthModal.jsx';
import { payAndVerify, createSession, coachMe, loadDraft, clearDraft, getUser, validatePromo } from './api.js';
import { refreshCachedUser } from '../PaymentModal.jsx';

// S6 — Coach Checkout. Order summary reflects the user's real interview draft.
// Already-entitled users (Unlimited / pass) are never shown the pay button —
// they go straight to session creation. Payment is collected by Razorpay's
// hosted modal, so no card fields live in app state.
// Reprice 2026-06 (cheap→premium). Plan `id`s keep their original names — the
// server's `amount` is the only price of record.
const PLANS = {
    session:   { id: 'single_499',  name: 'Single Interview', price: '₹49',    rupees: 49,   per: '',         note: 'This one interview (audio or text) + full scored report', tag: '' },
    prep:      { id: 'prep_199',    name: 'Prep Pack',        price: '₹199',   rupees: 199,  per: '/30 days', note: '3 full interviews · unlimited AI · all templates', tag: '' },
    unlimited: { id: 'season_1499', name: 'Season Pass',      price: '₹699',   rupees: 699,  per: '/90 days', note: '8 full interviews (audio + text) · unlimited AI · all templates', tag: 'MOST POPULAR' },
    pro:       { id: 'pro_2999',    name: 'Placement Pro',    price: '₹1,499', rupees: 1499, per: '/90 days', note: '25 interviews · everything in Season Pass · priority support', tag: '' },
};
const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function CoachCheckout({ nav }) {
    // ?plan=session preselects the Session Pass (e.g. the ₹599 CTA on /coach)
    const [plan, setPlan] = useState(() =>
        new URLSearchParams(window.location.search).get('plan') === 'session' ? 'session' : 'unlimited');
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [paid, setPaid] = useState(false);
    const [already, setAlready] = useState(false);   // entitled before visiting this page
    const [showAuth, setShowAuth] = useState(false);
    const [draft] = useState(loadDraft);
    const [coupon, setCoupon] = useState('');
    const [couponBusy, setCouponBusy] = useState(false);
    const [couponMsg, setCouponMsg] = useState('');
    const [promo, setPromo] = useState(null);   // { code, percent }
    const p = PLANS[plan];
    const payPrice = promo ? inr(Math.round(p.rupees * (100 - promo.percent) / 100)) : p.price;

    async function applyPromo() {
        const code = coupon.trim();
        if (!code || couponBusy || promo) return;
        setCouponBusy(true); setCouponMsg('');
        try {
            const r = await validatePromo(code);
            if (r && r.valid) { setPromo({ code: r.code, percent: r.percent }); setCouponMsg(`✓ ${r.percent}% off applied`); }
            else { setPromo(null); setCouponMsg("That code isn't valid."); }
        } catch (e) { setPromo(null); setCouponMsg("Couldn't check that code."); }
        finally { setCouponBusy(false); }
    }

    // If the signed-in user already has Coach access, never offer payment.
    // A 401 means the stored session is stale — force re-auth instead of letting
    // an entitled-but-expired user pay a second time.
    useEffect(() => {
        if (!getUser()) { setShowAuth(true); return; }   // checkout is a signed-in surface
        let alive = true;
        coachMe()
            .then(me => { if (alive && me && me.has) { setAlready(true); setPaid(true); } })
            .catch(e => {
                if (alive && e.status === 401) {
                    localStorage.removeItem('rn-auth-token');
                    localStorage.removeItem('rn-auth-user');
                    setShowAuth(true);
                }
            });
        return () => { alive = false; };
    }, []);

    const draftReady = draft && draft.jobDescription && String(draft.jobDescription).trim().length >= 30;
    const draftTitle = draft ? [draft.jobTitle, draft.company].filter(Boolean).join(' · ') : '';
    const draftSub = draft ? [draft.interviewType, draft.mode === 'text' ? 'Text' : 'Voice', draft.length ? `${draft.length} questions` : ''].filter(Boolean).join(' · ') : '';

    // Post-payment / already-entitled: create the interview from the saved draft.
    async function proceed() {
        if (!draftReady) { nav('/coach/new'); return; }   // keep a partial draft — Setup prefills from it
        setBusy(true); setError(''); setStatus('Generating your interview…');
        try {
            const s = await createSession(draft);
            clearDraft();
            nav(`/coach/session/${s.id}` + (draft.mode === 'text' ? '?mode=text' : ''));
        } catch (e) {
            console.error('[coach] createSession failed:', e, 'status=', e.status, 'code=', e.code);
            setStatus('');
            setError(e.message || 'Could not start the interview. Please try again.');
            setBusy(false);
        }
    }

    async function pay(user) {
        if (busy) return;   // no double Razorpay modals
        setError(''); setBusy(true);
        try {
            setStatus('Confirming your payment…');
            const v = await payAndVerify(p.id, user, 'Renonym', promo ? { coupon: promo.code } : {});   // Razorpay → grants entitlement
            console.log('[coach] verify response:', v);

            setStatus('Activating your access…');
            let me = null;
            try { me = await coachMe(); } catch (e) { console.error('[coach] coachMe failed:', e); }
            console.log('[coach] entitlement after pay:', me);
            // refresh the cached user so Dashboard/topbar show the new plan
            // without a re-login (fire-and-forget)
            refreshCachedUser().catch(() => {});
            if (!me || !me.has) {
                setError("Your payment was received, but access hasn't activated yet. Don't pay again — wait a few seconds, reload this page, and tap \"Set up interview\".");
                setBusy(false); setPaid(true);
                return;
            }
            setPaid(true);
            await proceed();
        } catch (e) {
            console.error('[coach] checkout failed:', e);
            setStatus('');
            if (e.message !== 'CANCELLED') {
                setError(e.message || 'Something went wrong during payment.');
            }
            setBusy(false);
        }
    }

    function handlePay() {
        const user = getUser();
        if (!user) { setShowAuth(true); return; }   // Coach requires an account
        pay(user);
    }

    return (
        <div className="rn-dark" style={{ minHeight: '100vh' }}>
            {showAuth && (
                <AuthModal
                    reason="payment"
                    onClose={() => setShowAuth(false)}
                    onAuth={(token, user) => {
                        localStorage.setItem('rn-auth-token', token);
                        localStorage.setItem('rn-auth-user', JSON.stringify(user));
                        setShowAuth(false);
                        // They may already own Coach on this account — never double-charge.
                        // If the check itself fails, surface it; do NOT fall through to payment.
                        setBusy(true);
                        coachMe()
                            .then(me => {
                                setBusy(false);
                                if (me && me.has) { setAlready(true); setPaid(true); proceed(); }
                                // Honor the FREE first interview (text) — don't show a pay prompt to a
                                // user who hasn't used it yet. Voice / out-of-free users still pay.
                                else if (me && me.freeInterviewAvailable && draft && draft.mode === 'text') { proceed(); }
                                else { pay(user); }
                            })
                            .catch(() => {
                                setBusy(false);
                                setError('Could not check your existing access — to avoid charging you twice, tap Pay only if you\'re sure you haven\'t bought Coach on this account.');
                            });
                    }}
                />
            )}
            <div className="row ac jsb" style={{ height: 68, borderBottom: '1px solid var(--line)', padding: '0 36px' }}>
                <div className="row ac gap-16">
                    <button className="btn btn-ghost btn-sm" style={{ width: 36, padding: 0 }} title="Back" onClick={() => { if (window.history.length > 1) window.history.back(); else nav('/coach/new'); }}>←</button>
                    <a href="/" className="brand" onClick={(e) => { e.preventDefault(); nav('/'); }} style={{ cursor: 'pointer' }}><div className="mark">R</div><div className="wm">Re<b>nonym</b></div></a>
                </div>
                <div className="row ac gap-10"><Lock size={15} color="var(--green)" /><span className="sm green-t">Secure checkout</span></div>
            </div>

            <div className="grid rn-split" style={{ gridTemplateColumns: '1fr 392px', minHeight: 'calc(100vh - 68px)' }}>
                {/* plan + pay */}
                <div style={{ padding: '48px 64px', maxWidth: 760 }}>
                    <h1 className="h2" style={{ marginBottom: 8 }}>{already ? 'You already have Coach access' : 'Unlock your interview'}</h1>
                    <p className="body-t" style={{ marginBottom: 36 }}>{already ? 'No payment needed — your plan is active. Start your interview whenever you\'re ready.' : 'Choose how you\'d like to pay. The AI Interview Coach is a premium feature.'}</p>

                    {!already && (
                        <div className="col gap-12" style={{ marginBottom: 36 }}>
                            {Object.entries(PLANS).map(([key, pl]) => {
                                const on = plan === key;
                                return (
                                    <button key={key} onClick={() => setPlan(key)}
                                            className={on ? 'card-gold' : 'card'}
                                            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px', borderColor: on ? 'var(--gold-line)' : 'var(--line)', cursor: 'pointer', textAlign: 'left' }}>
                                        <span style={{ width: 18, height: 18, borderRadius: '50%', flex: 'none', border: '2px solid ' + (on ? 'var(--gold)' : 'var(--line-3)'), background: on ? 'radial-gradient(circle,var(--gold) 0 5px,transparent 6px)' : 'transparent' }} />
                                        <div className="fill">
                                            <div className="row ac gap-10"><span className="h5">{pl.name}</span>{pl.tag && <Badge variant="gold">{pl.tag}</Badge>}</div>
                                            <div className="xs" style={{ marginTop: 4 }}>{pl.note}</div>
                                        </div>
                                        <div className="tr"><div className="h4">{pl.price}<span className="xs">{pl.per}</span></div><div className="xs">one-time</div></div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {!already && (
                        <div className="card-2" style={{ padding: 24, marginBottom: 28, display: 'flex', gap: 14, alignItems: 'center' }}>
                            <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--surface-3)', display: 'grid', placeItems: 'center', color: 'var(--blue)', flex: 'none' }}><ShieldCheck size={20} /></div>
                            <div className="fill">
                                <div className="sm" style={{ color: 'var(--text)', fontWeight: 600 }}>Payment via Razorpay</div>
                                <div className="xs" style={{ marginTop: 2 }}>Card / UPI / netbanking — entered securely in Razorpay's window. We never see your card details.</div>
                            </div>
                        </div>
                    )}

                    {!already && !paid && (
                        <div className="card" style={{ padding: '14px 16px', marginBottom: 16, borderColor: promo ? 'var(--green)' : 'var(--gold-line)' }}>
                            <div className="row ac gap-8" style={{ marginBottom: 10 }}>
                                <Tag size={15} color={promo ? 'var(--green)' : 'var(--gold)'} />
                                <span className="sm" style={{ color: 'var(--text)', fontWeight: 600 }}>{promo ? `Promo applied — ${promo.percent}% off` : 'Have a promo code?'}</span>
                            </div>
                            {!promo ? (
                                <div className="row gap-8 wrap-f">
                                    <input className="input fill" style={{ minWidth: 160, textTransform: 'uppercase' }} placeholder="PROMO CODE"
                                           value={coupon} onChange={(e) => setCoupon(e.target.value)} disabled={couponBusy}
                                           onKeyDown={(e) => e.key === 'Enter' && applyPromo()} maxLength={24} />
                                    <button className="btn btn-gold btn-sm none" onClick={applyPromo} disabled={couponBusy || !coupon.trim()}>{couponBusy ? '…' : 'Apply'}</button>
                                </div>
                            ) : (
                                <button className="btn btn-ghost btn-sm none" onClick={() => { setPromo(null); setCoupon(''); setCouponMsg(''); }}>Remove code</button>
                            )}
                            {couponMsg && <p className="xs" style={{ marginTop: 8, color: promo ? 'var(--green)' : 'var(--rose)' }}>{couponMsg}</p>}
                        </div>
                    )}

                    {paid
                        ? <button className="btn btn-gold btn-lg btn-block" onClick={proceed} disabled={busy}>
                            {busy ? (status || 'Working…') : (draftReady ? 'Start my interview →' : 'Set up your interview →')}
                          </button>
                        : <button className="btn btn-gold btn-lg btn-block" onClick={handlePay} disabled={busy}>
                            {busy ? (status || 'Processing…') : `Pay ${payPrice}${promo ? ` (${promo.percent}% off)` : ''} & start interview`}
                          </button>}
                    {error && (
                        <div className="card" style={{ marginTop: 14, padding: '14px 16px', borderColor: 'var(--rose)', background: 'var(--rose-soft)' }}>
                            <p className="sm" style={{ color: 'var(--rose)' }}>{error}</p>
                        </div>
                    )}
                    {!error && status && busy && <p className="sm" style={{ color: 'var(--gold)', marginTop: 12, textAlign: 'center' }}>{status}</p>}
                    {!already && (
                        <div className="row ac jc gap-10" style={{ marginTop: 18 }}>
                            <Lock size={14} color="var(--faint)" />
                            <span className="xs">Encrypted &amp; secure · Powered by Razorpay · One-time payment, no subscription</span>
                        </div>
                    )}
                </div>

                {/* order summary — the user's actual interview draft */}
                <aside style={{ borderLeft: '1px solid var(--line)', background: 'var(--bg-1)', padding: '40px 36px' }}>
                    <div style={{ position: 'sticky', top: 52 }}>
                        <div className="label" style={{ marginBottom: 20 }}>Your interview</div>
                        <div className="card" style={{ padding: 24, marginBottom: 22 }}>
                            <div className="row ac gap-14" style={{ marginBottom: 18 }}>
                                <div className="av" style={{ width: 44, height: 44, background: '#3a3320', color: 'var(--gold)', fontSize: 17, flex: 'none' }}>{(draft?.company || draft?.jobTitle || 'I')[0].toUpperCase()}</div>
                                <div style={{ minWidth: 0 }}>
                                    <div className="h4" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{draftTitle || 'Your interview'}</div>
                                    <div className="xs" style={{ marginTop: 2 }}>{draftSub || 'Configure it after unlocking'}</div>
                                </div>
                            </div>
                            <div className="divider" style={{ marginBottom: 18 }} />
                            <div className="label" style={{ marginBottom: 14 }}>What you get</div>
                            <div className="col gap-12">
                                {['A full AI mock interview, tailored to this role', 'Voice or text — your answers, really scored', 'A scored report with specific rewrites', 'Saved to your history to re-run anytime'].map(t => (
                                    <div key={t} className="row ac gap-10 sm" style={{ color: 'var(--text-2)' }}>
                                        <span style={{ width: 18, height: 18, flex: 'none', display: 'grid', placeItems: 'center' }}><Check size={13} color="var(--green)" /></span>{t}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {!already && (
                            <div className="card-2" style={{ padding: 24 }}>
                                <div className="row jsb sm" style={{ marginBottom: 12 }}><span className="muted">{p.name}</span><span style={{ color: 'var(--text)' }}>{p.price}</span></div>
                                <div className="divider" style={{ margin: '14px 0' }} />
                                <div className="row jsb" style={{ marginBottom: 4 }}><span className="h5">Due today</span><span className="h3">{p.price}</span></div>
                                <div className="xs">{plan === 'unlimited' ? 'One-time payment · 90 days · no subscription.' : 'One-time charge for this interview + report.'}</div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
