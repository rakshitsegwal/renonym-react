import React, { useState } from 'react';
import { Lock, ShieldCheck, Check } from 'lucide-react';
import { Badge } from './primitives.jsx';
import { AuthModal } from '../AuthModal.jsx';
import { payAndVerify, createSession, loadDraft, clearDraft, getUser } from './api.js';

// S6 — Coach Checkout (recreated from designs/screens/06-payment.html).
// The design shows Stripe card fields as placeholders; we use the existing
// Razorpay integration (hosted modal), so raw card fields are intentionally
// omitted — payment is collected by Razorpay, not in app state.
const PLANS = {
    unlimited: { id: 'coach_unlimited', name: 'Coach Unlimited', price: '₹1,599', per: '/mo', note: 'Unlimited voice & text interviews, reports & history', tag: 'Best value' },
    session:   { id: 'session_pass',    name: 'Single Session Pass', price: '₹599', per: '', note: 'This one interview + full scored report', tag: '' },
};

export default function CoachCheckout({ nav }) {
    const [plan, setPlan] = useState('unlimited');
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [paid, setPaid] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const p = PLANS[plan];

    async function pay(user) {
        setError(''); setBusy(true);
        try {
            setStatus('Confirming your payment…');
            await payAndVerify(p.id, user);                 // Razorpay → grants Coach entitlement
            console.log('[coach] payment verified; entitlement granted');

            const draft = loadDraft();
            const ready = draft && draft.jobDescription && draft.jobDescription.trim().length >= 30;
            if (!ready) {
                // Paid, but no interview configured yet → set it up (now entitled).
                console.log('[coach] no interview draft → routing to setup');
                clearDraft();
                nav('/coach/new');
                return;
            }

            setStatus('Payment confirmed. Generating your interview…');
            const s = await createSession(draft);           // consumes entitlement, generates questions
            console.log('[coach] session created', s?.id);
            clearDraft();
            nav(`/coach/session/${s.id}` + (draft.mode === 'text' ? '?mode=text' : ''));
        } catch (e) {
            console.error('[coach] checkout failed:', e);
            setStatus('');
            if (e.message !== 'CANCELLED') {
                // Payment likely succeeded; the post-payment step failed. Don't leave them stuck.
                setError((e.message || 'Something went wrong after payment.') + ' — your access is active; tap “Set up interview”.');
                setPaid(true);
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
                        pay(user);
                    }}
                />
            )}
            <div className="row ac jsb" style={{ height: 68, borderBottom: '1px solid var(--line)', padding: '0 36px' }}>
                <div className="row ac gap-16">
                    <button className="btn btn-ghost btn-sm" style={{ width: 36, padding: 0 }} onClick={() => nav('/coach/new')}>←</button>
                    <div className="brand"><div className="mark">R</div><div className="wm">Re<b>nonym</b></div></div>
                </div>
                <div className="row ac gap-10"><Lock size={15} color="var(--green)" /><span className="sm green-t">Secure checkout</span></div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 392px', minHeight: 'calc(100vh - 68px)' }}>
                {/* plan + pay */}
                <div style={{ padding: '48px 64px', maxWidth: 760 }}>
                    <h1 className="h2" style={{ marginBottom: 8 }}>Unlock your interview</h1>
                    <p className="body-t" style={{ marginBottom: 36 }}>Choose how you'd like to pay. The AI Interview Coach is a premium feature.</p>

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
                                    <div className="tr"><div className="h4">{pl.price}<span className="xs">{pl.per}</span></div><div className="xs">{key === 'unlimited' ? 'cancel anytime' : 'one-time'}</div></div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Razorpay collects card details in its own secure modal */}
                    <div className="card-2" style={{ padding: 24, marginBottom: 28, display: 'flex', gap: 14, alignItems: 'center' }}>
                        <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--surface-3)', display: 'grid', placeItems: 'center', color: 'var(--blue)', flex: 'none' }}><ShieldCheck size={20} /></div>
                        <div className="fill">
                            <div className="sm" style={{ color: 'var(--text)', fontWeight: 600 }}>Payment via Razorpay</div>
                            <div className="xs" style={{ marginTop: 2 }}>Card / UPI / netbanking — entered securely in Razorpay's window. We never see your card details.</div>
                        </div>
                    </div>

                    {paid
                        ? <button className="btn btn-gold btn-lg btn-block" onClick={() => nav('/coach/new')}>Set up your interview →</button>
                        : <button className="btn btn-gold btn-lg btn-block" onClick={handlePay} disabled={busy}>
                            {busy ? (status || 'Processing…') : `Pay ${p.price} & start interview`}
                          </button>}
                    {error && (
                        <div className="card" style={{ marginTop: 14, padding: '14px 16px', borderColor: 'var(--rose)', background: 'var(--rose-soft)' }}>
                            <p className="sm" style={{ color: 'var(--rose)' }}>{error}</p>
                        </div>
                    )}
                    {!error && status && <p className="sm" style={{ color: 'var(--gold)', marginTop: 12, textAlign: 'center' }}>{status}</p>}
                    <div className="row ac jc gap-10" style={{ marginTop: 18 }}>
                        <Lock size={14} color="var(--faint)" />
                        <span className="xs">Encrypted &amp; secure · Powered by Razorpay · Cancel anytime</span>
                    </div>
                </div>

                {/* order summary */}
                <aside style={{ borderLeft: '1px solid var(--line)', background: 'var(--bg-1)', padding: '40px 36px' }}>
                    <div style={{ position: 'sticky', top: 52 }}>
                        <div className="label" style={{ marginBottom: 20 }}>Your interview</div>
                        <div className="card" style={{ padding: 24, marginBottom: 22 }}>
                            <div className="row ac gap-14" style={{ marginBottom: 18 }}>
                                <div className="av" style={{ width: 44, height: 44, background: '#3a3320', color: 'var(--gold)', fontSize: 17 }}>S</div>
                                <div><div className="h4">Senior PM · Stripe</div><div className="xs" style={{ marginTop: 2 }}>Behavioral · Voice · 6 questions</div></div>
                            </div>
                            <div className="divider" style={{ marginBottom: 18 }} />
                            <div className="label" style={{ marginBottom: 14 }}>What you get</div>
                            <div className="col gap-12">
                                {['A full AI mock interview, tailored to this role', 'Real-time voice with adaptive follow-ups', 'A scored report with specific rewrites', 'Saved to your history to re-run anytime'].map(t => (
                                    <div key={t} className="row ac gap-10 sm" style={{ color: 'var(--text-2)' }}>
                                        <span style={{ width: 18, height: 18, flex: 'none', display: 'grid', placeItems: 'center' }}><Check size={13} color="var(--green)" /></span>{t}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card-2" style={{ padding: 24 }}>
                            <div className="row jsb sm" style={{ marginBottom: 12 }}><span className="muted">{p.name}</span><span style={{ color: 'var(--text)' }}>{p.price}</span></div>
                            <div className="divider" style={{ margin: '14px 0' }} />
                            <div className="row jsb" style={{ marginBottom: 4 }}><span className="h5">Due today</span><span className="h3">{p.price}</span></div>
                            <div className="xs">{plan === 'unlimited' ? 'Then ₹1,599/mo · cancel anytime from settings.' : 'One-time charge for this interview + report.'}</div>
                        </div>
                        <div className="row ac gap-12" style={{ marginTop: 22, padding: '16px 18px', border: '1px solid var(--line)', borderRadius: 14 }}>
                            <span className="gold" style={{ fontSize: 18, letterSpacing: 1 }}>★★★★★</span>
                            <span className="xs">"Worth it for the first session alone." — verified user</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
