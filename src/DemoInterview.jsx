import React, { useState, useRef } from 'react';
import { ScoreRing, Meter, Badge } from './coach/primitives.jsx';
import { demoFeedback, demoEmailReport } from './coach/api.js';
import { track } from './analytics.js';

// Value-before-signup hook. A cold visitor answers ONE real interview question
// by typing and gets a genuine AI scorecard — no setup form, no account. The
// full mock (exact role + complete report) is the upsell after they feel value.
const DEMO_Q = 'Tell me about a project you’re proud of — what was your role, and what was the impact?';

const DIMS = [
    ['communication', 'Communication'],
    ['confidence', 'Confidence'],
    ['specificity', 'Specificity'],
];

export default function DemoInterview({ onStartFull, heroMode = false }) {
    const [answer, setAnswer]   = useState('');
    const [busy, setBusy]       = useState(false);
    const [result, setResult]   = useState(null);
    const [error, setError]     = useState('');
    const [email, setEmail]         = useState('');
    const [emailing, setEmailing]   = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailErr, setEmailErr]   = useState('');
    const startedRef            = useRef(false);

    async function submit() {
        if (answer.trim().length < 15 || busy) return;
        if (!startedRef.current) { startedRef.current = true; track('demo_started'); }
        setBusy(true); setError('');
        try {
            const r = await demoFeedback({ question: DEMO_Q, answer: answer.trim() });
            setResult(r);
            track('demo_feedback_shown', { overall: r.overall });
        } catch (e) {
            setError(e.message || 'Could not score that answer. Please try again.');
        } finally {
            setBusy(false);
        }
    }

    async function emailReport() {
        const addr = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) { setEmailErr('Please enter a valid email address.'); return; }
        setEmailing(true); setEmailErr('');
        try {
            await demoEmailReport({
                email: addr, answer: answer.trim(),
                scores: { communication: result.communication, confidence: result.confidence, specificity: result.specificity, overall: result.overall },
                verdict: result.verdict, notes: result.notes,
            });
            setEmailSent(true);
            track('email_captured');
        } catch (e) {
            setEmailErr(e.message || 'Could not send. Try again, or tap “Start now”.');
        } finally {
            setEmailing(false);
        }
    }

    return (
        <section id="demo" className={heroMode ? 'di-hero' : ''} style={{ padding: heroMode ? '0 0 8px' : '20px 0 72px' }}>
            <div className="wrap" style={{ maxWidth: heroMode ? 660 : 760 }}>
                {!heroMode && (
                    <div className="tc" style={{ marginBottom: 26 }}>
                        <span className="eyebrow">Try it now · no signup</span>
                        <h2 className="h1" style={{ marginTop: 14 }}>See what the AI coach tells you — <span className="italic gold">right now</span>.</h2>
                        <p className="lead" style={{ marginTop: 12 }}>Answer one real interview question. Get a live scorecard on <em>your</em> answer in seconds.</p>
                    </div>
                )}

                <div className="card-gold" style={{ borderRadius: 'var(--r-2xl)', overflow: 'hidden', borderColor: 'var(--gold-line)' }}>
                    {/* the question */}
                    <div style={{ padding: heroMode ? '16px 20px' : '26px 28px', borderBottom: '1px solid var(--line)' }}>
                        <div className="row ac gap-10" style={{ marginBottom: 10 }}>
                            <Badge variant="gold" dot>Interviewer asks</Badge>
                            <span className="label">Behavioral · Q1 of your mock</span>
                        </div>
                        <p className="h4 di-q" style={{ fontFamily: 'var(--rn-serif)', fontWeight: 400, fontSize: heroMode ? 20 : 24, lineHeight: 1.35, color: 'var(--text)' }}>“{DEMO_Q}”</p>
                    </div>

                    {/* the answer + score */}
                    <div style={{ padding: heroMode ? '18px 20px' : 28 }}>
                        {!result ? (
                            <>
                                <label className="input-lbl" style={{ display: 'block', marginBottom: 8 }}>Your answer</label>
                                <textarea
                                    className="textarea di-textarea"
                                    style={{ minHeight: heroMode ? 100 : 150 }}
                                    placeholder="Answer like you're in the real interview — a project, your exact role, what you did, and the result…"
                                    value={answer}
                                    onChange={(e) => { setAnswer(e.target.value); setError(''); }}
                                    onFocus={(e) => { const t = e.target; setTimeout(() => { try { t.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch {} }, 250); }}
                                />
                                {error && <div className="sm" style={{ color: 'var(--rose)', marginTop: 10 }}>{error}</div>}
                                <div className="row ac jsb wrap-f gap-12 di-submit-row" style={{ marginTop: 14 }}>
                                    <span className="xs">{answer.trim().length < 15 ? 'Type a couple of sentences to get scored.' : 'No signup · scored by the same AI as the full coach.'}</span>
                                    <button className="btn btn-gold btn-lg di-submit" onClick={submit} disabled={busy || answer.trim().length < 15}>
                                        {busy ? 'Scoring your answer…' : 'Get my feedback →'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="row ac gap-24 wrap-f" style={{ marginBottom: 22 }}>
                                    <ScoreRing value={result.overall} size={104} stroke={8} label="overall" />
                                    <div className="fill" style={{ minWidth: 220 }}>
                                        <div className="label" style={{ marginBottom: 6 }}>Your scorecard</div>
                                        <p className="h4" style={{ fontFamily: 'var(--rn-serif)', fontWeight: 400, color: 'var(--text)' }}>{result.verdict}</p>
                                    </div>
                                </div>

                                <div className="col gap-14">
                                    {DIMS.map(([k, lbl]) => (
                                        <div key={k}>
                                            <div className="row jsb xs" style={{ marginBottom: 6 }}>
                                                <span style={{ color: 'var(--text-2)' }}>{lbl}</span>
                                                <span className={result[k] < 60 ? 'amber-t' : 'gold'}>{result[k]}</span>
                                            </div>
                                            <Meter value={result[k]} />
                                        </div>
                                    ))}
                                </div>

                                {result.notes && result.notes.length > 0 && (
                                    <div style={{ marginTop: 22 }}>
                                        <div className="label" style={{ marginBottom: 10 }}>What to fix</div>
                                        <div className="col gap-10">
                                            {result.notes.map((n, i) => (
                                                <div key={i} className="row gap-10" style={{ alignItems: 'flex-start' }}>
                                                    <span className="gold" style={{ flex: 'none', fontWeight: 700 }}>›</span>
                                                    <span className="body-t">{n}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Email capture AFTER value — soft, never a gate. They get the
                                    report in their inbox even without finishing account creation. */}
                                <div className="divider" style={{ margin: '24px 0 18px' }} />
                                <div className="card" style={{ padding: '20px', borderRadius: 'var(--r-l)', background: 'var(--gold-soft)', borderColor: 'var(--gold-line)' }}>
                                    {emailSent ? (
                                        <div className="tc">
                                            <div style={{ fontSize: 30, marginBottom: 6 }}>✉️</div>
                                            <p className="h5" style={{ color: 'var(--text)' }}>Check your inbox — your scorecard is on the way.</p>
                                            <p className="sm" style={{ marginTop: 6 }}>It has a link to start your full free mock interview for your exact role.</p>
                                            <button className="btn btn-gold btn-lg" style={{ marginTop: 16 }} onClick={onStartFull}>Or start it now →</button>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="body-t" style={{ color: 'var(--text)' }}>That was <b>one</b> question. Want the full mock for your <b>exact role</b> + this report saved? We’ll email it.</p>
                                            <div className="row gap-10 wrap-f" style={{ marginTop: 14 }}>
                                                <input type="email" inputMode="email" autoComplete="email" className="input fill" placeholder="you@example.com" value={email} style={{ minWidth: 200 }}
                                                    onChange={(e) => { setEmail(e.target.value); setEmailErr(''); }}
                                                    onFocus={(e) => { const t = e.target; setTimeout(() => { try { t.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch {} }, 250); }}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') emailReport(); }} />
                                                <button className="btn btn-gold" onClick={emailReport} disabled={emailing}>{emailing ? 'Sending…' : 'Email me my report →'}</button>
                                            </div>
                                            {emailErr && <div className="sm" style={{ color: 'var(--rose)', marginTop: 10 }}>{emailErr}</div>}
                                            <div className="row ac gap-16 wrap-f" style={{ marginTop: 14 }}>
                                                <button className="sm gold" style={{ fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={onStartFull}>Or start my full interview now →</button>
                                                <button className="btn btn-ghost btn-sm" onClick={() => { setResult(null); setAnswer(''); }}>Try another answer</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
