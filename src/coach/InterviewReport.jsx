import React, { useState, useEffect } from 'react';
import { Download, Sparkles } from 'lucide-react';
import { ScoreRing, Meter, Badge } from './primitives.jsx';
import { getSession, scoreSession, payAndVerify, getUser } from './api.js';
import PaymentModal from '../PaymentModal.jsx';

// S10 — Interview Report. Loads the scored report for the session (scoring it on
// the fly if it hasn't been generated yet).
export default function InterviewReport({ nav, id }) {
    const [data, setData] = useState(null);   // { report, company, jobTitle, type, mode, date }
    const [err, setErr] = useState('');
    const [unlockBusy, setUnlockBusy] = useState(false);
    const [unlockErr, setUnlockErr] = useState('');
    const [showLadder, setShowLadder] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const s = await getSession(id);
                let report = s.report;
                let locked = !!s.report_locked;
                if (!report) { const r = await scoreSession(id); report = r.report; locked = !!r.locked; }
                if (!alive) return;
                // answered count comes from the session itself (latest real answer per question)
                const lastByQ = {};
                (Array.isArray(s.answers) ? s.answers : []).forEach(a => { if (a && a.questionId) lastByQ[a.questionId] = a; });
                const answered = Object.values(lastByQ).filter(a => a.text && String(a.text).trim() && !String(a.text).startsWith('[Spoken answer')).length;
                setData({
                    report,
                    locked: locked || !!(report && report.locked),
                    answered,
                    totalQ: Array.isArray(s.questions) ? s.questions.length : 0,
                    title: [s.job_title, s.company].filter(Boolean).join(' · ') || 'Interview',
                    sub: [s.interview_type, fmtDate(s.created_at), s.mode === 'text' ? 'Text' : 'Voice'].filter(Boolean).join(' · '),
                });
            } catch (e) {
                if (e.status === 401) nav('/coach');
                else setErr(e.message || 'Report unavailable.');
            }
        })();
        return () => { alive = false; };
    }, [id, reloadKey]);

    if (err) return <Centered nav={nav} msg={err} />;
    if (!data) return <Centered nav={nav} msg="Generating your report…" spinner />;

    async function unlockReport() {
        if (unlockBusy) return;
        const user = getUser();
        if (!user) { setUnlockErr('Sign in to unlock your report.'); return; }
        setUnlockBusy(true); setUnlockErr('');
        try {
            const v = await payAndVerify('report_unlock_299', user, 'Full Report Unlock', { sessionId: id });
            if (v && v.grant && v.grant.rows === 0) {
                setUnlockErr("Payment received but the unlock didn't apply — do NOT pay again; reload in a moment or contact support.");
                setUnlockBusy(false);
                return;
            }
            setReloadKey(k => k + 1);   // refetch replaces this card — stay busy meanwhile
        } catch (e) {
            if (e.message !== 'CANCELLED') setUnlockErr(e.message || 'Could not unlock — try again.');
            setUnlockBusy(false);
        }
    }

    const r = data.report || {};
    const dims = r.dimensions || [];
    const verdict = r.verdict || {};

    return (
        <div className="rn-dark" style={{ minHeight: '100vh' }}>
            <div className="row ac jsb no-print" style={{ position: 'sticky', top: 0, zIndex: 40, height: 68, borderBottom: '1px solid var(--line)', padding: '0 36px', background: 'rgba(10,11,13,0.8)', backdropFilter: 'blur(14px)' }}>
                <div className="row ac gap-16" style={{ minWidth: 0 }}>
                    <button className="btn btn-ghost btn-sm" style={{ width: 36, padding: 0, flex: 'none' }} onClick={() => nav('/coach/reports')}>←</button>
                    <div style={{ minWidth: 0 }}><div className="h5" style={{ lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.title} — Report</div><div className="xs">{data.sub}</div></div>
                </div>
                <div className="row ac gap-10" style={{ flex: 'none' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => window.print()} title="Print or save as PDF"><Download size={15} />Export PDF</button>
                    <button className="btn btn-gold btn-sm" onClick={() => nav('/coach/new')}>↻ Run it again</button>
                </div>
            </div>

            <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 36px 80px' }}>
                {/* HERO */}
                <div className="card-gold rel rpt-hero" style={{ borderColor: 'var(--gold-line)', borderRadius: 'var(--r-2xl)', padding: 48, marginBottom: 40, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40, alignItems: 'center', overflow: 'hidden' }}>
                    <div className="glow-gold" style={{ width: 480, height: 480, left: -120, top: -160 }} />
                    <div className="rel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <ScoreRing value={r.overall || 0} size={240} />
                    </div>
                    <div className="rel">
                        <span className="eyebrow">Your verdict</span>
                        <h1 className="h1" style={{ margin: '14px 0 16px' }}>{verdict.headline || 'Your interview score'}</h1>
                        <p className="lead" style={{ maxWidth: '46ch' }}>{verdict.summary || ''}</p>
                        {r.percentile && (
                            <div className="row gap-32" style={{ marginTop: 28 }}>
                                <div><div className="label">Questions</div><div className="h4" style={{ marginTop: 6 }}>{data.totalQ ? `${data.answered}/${data.totalQ}` : '—'}</div></div>
                                <div><div className="label">Percentile</div><div className="h4" style={{ marginTop: 6 }}>{r.percentile}</div></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* DIMENSIONS */}
                {dims.length > 0 && (
                <div className="grid gap-20 g-dims" style={{ gridTemplateColumns: `repeat(${Math.min(4, dims.length) || 4},1fr)`, marginBottom: 40 }}>
                    {dims.map(d => {
                        const amber = d.score < 60;
                        return (
                            <div key={d.key} className="card" style={{ padding: 24, borderColor: amber ? 'var(--amber-line)' : 'var(--line)' }}>
                                <div className="row jsb ac" style={{ marginBottom: 14 }}><span className="h5">{d.key}</span><span className={'h3 ' + (amber ? 'amber-t' : 'gold')}>{d.score}</span></div>
                                <Meter value={d.score} style={{ marginBottom: 14 }} />
                                <p className="xs">{d.note}</p>
                            </div>
                        );
                    })}
                </div>
                )}

                {/* STRENGTHS / WEAKNESSES */}
                <div className="grid gap-24 g-2" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 40 }}>
                    <div className="card" style={{ padding: 30 }}>
                        <div style={{ marginBottom: 20 }}><Badge variant="green" dot>Strengths</Badge></div>
                        <div className="col gap-18">
                            {(r.strengths || []).map((s, i) => (
                                <div key={i} className="row gap-12"><span className="green-t" style={{ marginTop: 2 }}>✓</span><div><div className="sm" style={{ color: 'var(--text)', fontWeight: 600 }}>{s.title}</div><p className="xs" style={{ marginTop: 3 }}>{s.detail}</p></div></div>
                            ))}
                        </div>
                    </div>
                    <div className="card" style={{ padding: 30 }}>
                        <div style={{ marginBottom: 20 }}><Badge variant="amber" dot>Areas to improve</Badge></div>
                        <div className="col gap-18">
                            {(r.weaknesses || []).map((w, i) => (
                                <div key={i} className="row gap-12"><span className="amber-t" style={{ marginTop: 2 }}>!</span><div><div className="sm" style={{ color: 'var(--text)', fontWeight: 600 }}>{w.title}</div><p className="xs" style={{ marginTop: 3 }}>{w.detail}</p></div></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* LOCKED — the full breakdown is behind the unlock */}
                {data.locked && (
                    <div className="card-gold rel" style={{ padding: 36, marginBottom: 40, textAlign: 'center', borderColor: 'var(--gold-line)', overflow: 'hidden' }}>
                        <div className="glow-gold" style={{ width: 420, height: 320, left: '50%', top: -120, transform: 'translateX(-50%)' }} />
                        <div className="rel">
                            <Badge variant="gold" dot style={{ margin: '0 auto 16px' }}>Partial report</Badge>
                            <h2 className="h3" style={{ marginBottom: 10 }}>Your full report is ready — and locked.</h2>
                            <p className="body-t" style={{ maxWidth: '52ch', margin: '0 auto 8px' }}>
                                Waiting for you inside: scores across all four dimensions, your remaining strengths and weaknesses,
                                your weakest answers <b>quoted with stronger rewrites</b>, and your next steps.
                            </p>
                            <div className="row ac jc gap-12 wrap-f" style={{ marginTop: 22 }}>
                                <button className="btn btn-gold btn-lg" onClick={unlockReport} disabled={unlockBusy}>
                                    {unlockBusy ? 'Unlocking…' : 'Unlock your full report — ₹299'}
                                </button>
                                <button className="btn btn-outline btn-lg" onClick={() => setShowLadder(true)}>
                                    Or 6 complete interviews — Season Pass ₹1,499
                                </button>
                            </div>
                            {unlockErr && <p className="sm" style={{ color: 'var(--rose)', marginTop: 14 }}>{unlockErr}</p>}
                            {/* blurred skeleton of what's inside */}
                            <div className="grid gap-12 g-dims" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginTop: 28, filter: 'blur(5px)', opacity: 0.55, pointerEvents: 'none', userSelect: 'none' }} aria-hidden="true">
                                {['Communication', 'Confidence', 'Structure', 'Technical relevance'].map(k => (
                                    <div key={k} className="card" style={{ padding: 20 }}>
                                        <div className="row jsb ac" style={{ marginBottom: 12 }}><span className="h5">{k}</span><span className="h3 gold">··</span></div>
                                        <div className="meter"><span style={{ width: '60%' }} /></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* FIXES */}
                {(r.fixes || []).length > 0 && (
                    <div style={{ marginBottom: 40 }}>
                        <div className="row ac jsb" style={{ marginBottom: 20 }}><h2 className="h3">The fixes that matter most</h2><span className="label">Tied to what you actually said</span></div>
                        <div className="grid gap-20 g-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            {r.fixes.map((f, i) => (
                                <div key={i} className="card" style={{ padding: 26 }}>
                                    <div className="row ac jsb" style={{ marginBottom: 16 }}><Badge>{f.tag}</Badge><Badge variant="amber">{f.score}</Badge></div>
                                    <div style={{ borderLeft: '2px solid var(--line-3)', paddingLeft: 14, marginBottom: 16 }}><p className="sm" style={{ color: 'var(--muted)', fontStyle: 'italic' }}>{f.quote}</p></div>
                                    <div className="row ac gap-8" style={{ marginBottom: 8 }}><Sparkles size={14} color="var(--gold)" /><span className="label" style={{ color: 'var(--gold)' }}>Suggested rewrite</span></div>
                                    <p className="sm" style={{ color: 'var(--text-2)' }}>{renderRewrite(f.rewrite)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* RECOMMENDATIONS */}
                {(r.recommendations || []).length > 0 && (
                    <div className="card" style={{ padding: 34 }}>
                        <h2 className="h3" style={{ marginBottom: 20 }}>Recommended next steps</h2>
                        {r.recommendations.map((t, i) => (
                            <div key={i} className="row ac gap-16" style={{ padding: '16px 0', borderTop: '1px solid var(--line)' }}>
                                <span className="label" style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface-3)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flex: 'none' }}>{i + 1}</span>
                                <div className="fill"><div className="h5">{t}</div></div>
                                {i === 0 && <button className="btn btn-gold btn-sm none" onClick={() => nav('/coach/new')}>Re-run →</button>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {showLadder && <PaymentModal reason="interview" onClose={() => setShowLadder(false)}
                onSuccess={() => { setShowLadder(false); setReloadKey(k => k + 1); }} />}
        </div>
    );
}

function renderRewrite(text) {
    return String(text || '').split(/(\{[^}]+\})/g).map((part, i) =>
        part.startsWith('{') && part.endsWith('}')
            ? <b key={i} style={{ color: 'var(--text)' }}>{part.slice(1, -1)}</b>
            : <React.Fragment key={i}>{part}</React.Fragment>
    );
}
function fmtDate(d) { try { return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch { return ''; } }
function Centered({ nav, msg, spinner }) {
    return (
        <div className="rn-dark" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <div>{spinner && <div className="orb pulse" style={{ width: 48, height: 48, margin: '0 auto 18px' }} />}<p className="lead" style={{ marginBottom: 18 }}>{msg}</p><button className="btn btn-outline" onClick={() => nav('/coach/reports')}>Back to history</button></div>
        </div>
    );
}
