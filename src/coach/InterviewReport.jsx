import React from 'react';
import { Download, Sparkles } from 'lucide-react';
import { ScoreRing, Meter, Badge } from './primitives.jsx';

// S10 — Interview Report (recreated from designs/screens/10-interview-report.html).
// Phase-3 mock data; Phase 5 feeds real scored results + wires Export PDF.
const DIMS = [
    { k: 'Communication',      v: 84, note: 'Clear, well-paced delivery with minimal filler.' },
    { k: 'Confidence',         v: 76, note: 'Assured tone; occasional hedging on tradeoffs.' },
    { k: 'Structure',          v: 78, note: 'Strong STAR shape on 4 of 6 answers.' },
    { k: 'Technical relevance', v: 54, note: 'Quantify impact — answers lack hard metrics.' },
];
const STRENGTHS = [
    ['Clear ownership language', 'You consistently said "I decided" and "I led" — recruiters read this as senior.'],
    ['Well-structured narratives', 'Four answers followed a clean situation → action → result arc.'],
    ['Calm under follow-ups', 'You stayed composed and specific when the coach probed deeper.'],
];
const IMPROVE = [
    ['Missing quantified outcomes', 'Two answers ended without a number — the most common reason strong stories fall flat.'],
    ['Tradeoffs left implicit', 'Name the option you rejected and why — it shows judgment, not just action.'],
    ['One answer ran long', 'The rewards-dashboard story could lose ~20 seconds without losing substance.'],
];
const FIXES = [
    { tag: 'Q2 · Incomplete data', score: 62, quote: '"…so we defined three proxy metrics we could trust and shipped on time."', rewrite: '"…we defined three proxy metrics, shipped on time, and the dashboard drove a {22% lift in card activation} within the first month."' },
    { tag: 'Q5 · Hardest tradeoff', score: 58, quote: '"I chose to prioritize the enterprise feature for that quarter."', rewrite: '"I chose enterprise over the SMB polish — {knowingly delaying a launch I cared about} — because it unblocked ₹100M in pipeline. Here\'s how I made that call…"' },
];

export default function InterviewReport({ nav, score = 72 }) {
    return (
        <div className="rn-dark" style={{ minHeight: '100vh' }}>
            {/* top bar */}
            <div className="row ac jsb" style={{ position: 'sticky', top: 0, zIndex: 40, height: 68, borderBottom: '1px solid var(--line)', padding: '0 36px', background: 'rgba(10,11,13,0.8)', backdropFilter: 'blur(14px)' }}>
                <div className="row ac gap-16">
                    <button className="btn btn-ghost btn-sm" style={{ width: 36, padding: 0 }} onClick={() => nav('/coach/reports')}>←</button>
                    <div><div className="h5" style={{ lineHeight: 1.1, whiteSpace: 'nowrap' }}>Senior PM · Stripe — Report</div><div className="xs">Behavioral · Apr 14 · Voice</div></div>
                </div>
                <div className="row ac gap-10">
                    <button className="btn btn-ghost btn-sm"><Download size={15} />Export PDF</button>
                    <button className="btn btn-ghost btn-sm">Share</button>
                    <button className="btn btn-gold btn-sm" onClick={() => nav('/coach/new')}>↻ Run it again</button>
                </div>
            </div>

            <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 36px 80px' }}>
                {/* HERO SCORE */}
                <div className="card-gold rel" style={{ borderColor: 'var(--gold-line)', borderRadius: 'var(--r-2xl)', padding: 48, marginBottom: 40, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40, alignItems: 'center', overflow: 'hidden' }}>
                    <div className="glow-gold" style={{ width: 480, height: 480, left: -120, top: -160 }} />
                    <div className="rel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <ScoreRing value={score} size={240} />
                        <Badge variant="green" dot style={{ marginTop: 22 }}>▲ +14 vs your first Stripe rep</Badge>
                    </div>
                    <div className="rel">
                        <span className="eyebrow">Your verdict</span>
                        <h1 className="h1" style={{ margin: '14px 0 16px' }}>Strong — you're<br />interview ready.</h1>
                        <p className="lead" style={{ maxWidth: '46ch' }}>A confident, well-structured session. You're in good shape for Stripe — tighten two answers with hard metrics and you'll clear the bar comfortably.</p>
                        <div className="row gap-32" style={{ marginTop: 28 }}>
                            <div><div className="label">Questions</div><div className="h4" style={{ marginTop: 6 }}>6 answered</div></div>
                            <div style={{ width: 1, background: 'var(--line)' }} />
                            <div><div className="label">Duration</div><div className="h4" style={{ marginTop: 6 }}>14:08</div></div>
                            <div style={{ width: 1, background: 'var(--line)' }} />
                            <div><div className="label">Percentile</div><div className="h4" style={{ marginTop: 6 }}>Top 25%</div></div>
                        </div>
                    </div>
                </div>

                {/* DIMENSIONS */}
                <div className="grid gap-20" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 40 }}>
                    {DIMS.map(d => {
                        const amber = d.v < 60;
                        return (
                            <div key={d.k} className="card" style={{ padding: 24, borderColor: amber ? 'var(--amber-line)' : 'var(--line)' }}>
                                <div className="row jsb ac" style={{ marginBottom: 14 }}><span className="h5">{d.k}</span><span className={'h3 ' + (amber ? 'amber-t' : 'gold')}>{d.v}</span></div>
                                <Meter value={d.v} style={{ marginBottom: 14 }} />
                                <p className="xs">{d.note}</p>
                            </div>
                        );
                    })}
                </div>

                {/* STRENGTHS / WEAKNESSES */}
                <div className="grid gap-24" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 40 }}>
                    <div className="card" style={{ padding: 30 }}>
                        <div style={{ marginBottom: 20 }}><Badge variant="green" dot>Strengths</Badge></div>
                        <div className="col gap-18">
                            {STRENGTHS.map(([t, d]) => (
                                <div key={t} className="row gap-12"><span className="green-t" style={{ marginTop: 2 }}>✓</span><div><div className="sm" style={{ color: 'var(--text)', fontWeight: 600 }}>{t}</div><p className="xs" style={{ marginTop: 3 }}>{d}</p></div></div>
                            ))}
                        </div>
                    </div>
                    <div className="card" style={{ padding: 30 }}>
                        <div style={{ marginBottom: 20 }}><Badge variant="amber" dot>Areas to improve</Badge></div>
                        <div className="col gap-18">
                            {IMPROVE.map(([t, d]) => (
                                <div key={t} className="row gap-12"><span className="amber-t" style={{ marginTop: 2 }}>!</span><div><div className="sm" style={{ color: 'var(--text)', fontWeight: 600 }}>{t}</div><p className="xs" style={{ marginTop: 3 }}>{d}</p></div></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FIXES (quote → rewrite) */}
                <div style={{ marginBottom: 40 }}>
                    <div className="row ac jsb" style={{ marginBottom: 20 }}><h2 className="h3">The fixes that matter most</h2><span className="label">Tied to what you actually said</span></div>
                    <div className="grid gap-20" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        {FIXES.map(f => (
                            <div key={f.tag} className="card" style={{ padding: 26 }}>
                                <div className="row ac jsb" style={{ marginBottom: 16 }}><Badge>{f.tag}</Badge><Badge variant="amber">{f.score}</Badge></div>
                                <div style={{ borderLeft: '2px solid var(--line-3)', paddingLeft: 14, marginBottom: 16 }}>
                                    <p className="sm" style={{ color: 'var(--muted)', fontStyle: 'italic' }}>{f.quote}</p>
                                </div>
                                <div className="row ac gap-8" style={{ marginBottom: 8 }}><Sparkles size={14} color="var(--gold)" /><span className="label" style={{ color: 'var(--gold)' }}>Suggested rewrite</span></div>
                                <p className="sm" style={{ color: 'var(--text-2)' }}>{renderRewrite(f.rewrite)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RECOMMENDATIONS */}
                <div className="card" style={{ padding: 34 }}>
                    <h2 className="h3" style={{ marginBottom: 8 }}>Recommended next steps</h2>
                    <p className="sm" style={{ marginBottom: 20 }}>Do these three things before your Stripe interview in 2 days.</p>
                    {[['1', 'Re-run this interview with metrics in every answer', "Target an 80+ on Technical Relevance. You're one rep away.", true],
                      ['2', 'Rehearse the "decision you got wrong" story', 'It was your weakest answer — practice naming the lesson explicitly.', false],
                      ['3', 'Tighten your two longest answers by 20 seconds', 'Crisp beats complete. Lead with the result, then the how.', false]].map(([n, t, d, btn]) => (
                        <div key={n} className="row ac gap-16" style={{ padding: '16px 0', borderTop: n === '1' ? '1px solid var(--line)' : '1px solid var(--line)' }}>
                            <span className="label" style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface-3)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flex: 'none' }}>{n}</span>
                            <div className="fill"><div className="h5">{t}</div><p className="sm" style={{ marginTop: 4 }}>{d}</p></div>
                            {btn && <button className="btn btn-gold btn-sm none" onClick={() => nav('/coach/new')}>Re-run →</button>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Render {highlighted} spans inside rewrite copy as bold/bright text.
function renderRewrite(text) {
    return text.split(/(\{[^}]+\})/g).map((part, i) =>
        part.startsWith('{') && part.endsWith('}')
            ? <b key={i} style={{ color: 'var(--text)' }}>{part.slice(1, -1)}</b>
            : <React.Fragment key={i}>{part}</React.Fragment>
    );
}
