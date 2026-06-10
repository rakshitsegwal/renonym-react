import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Badge } from './primitives.jsx';

// S9 — Interview Complete (recreated from designs/screens/09-interview-complete.html)
export default function InterviewComplete({ nav, id = 'demo', name = 'Maya' }) {
    const [generating, setGenerating] = useState(false);

    function generate() {
        setGenerating(true);
        // Phase 5 will call the scoring endpoint; mock the async then route to report.
        setTimeout(() => nav(`/coach/report/${id}`), 1400);
    }

    return (
        <div className="rn-dark" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px', textAlign: 'center' }}>
            <div className="row jsb ac" style={{ width: '100%', maxWidth: 1240, height: 68 }}>
                <div className="brand"><div className="mark">R</div><div className="wm">Re<b>nonym</b></div></div>
                <a href="/" className="sm faint" onClick={(e) => { e.preventDefault(); nav('/'); }}>Close</a>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: 760, paddingBottom: 60 }}>
                <div className="orb" style={{ width: 88, height: 88, display: 'grid', placeItems: 'center', marginBottom: 30, boxShadow: 'var(--shadow-gold)' }}>
                    <Check size={48} color="var(--on-gold)" strokeWidth={2.4} />
                </div>

                <Badge variant="green" dot style={{ margin: '0 auto 22px' }}>Interview complete</Badge>
                <h1 className="display" style={{ fontSize: 'clamp(48px,7vw,74px)' }}>Nicely done, {name}.</h1>
                <p className="lead" style={{ maxWidth: '46ch', margin: '22px auto 0' }}>You answered all six questions for the <span style={{ color: 'var(--text)' }}>Senior PM · Stripe</span> interview. Your report is ready to generate.</p>

                <div className="grid gap-20" style={{ gridTemplateColumns: 'repeat(4,1fr)', margin: '44px 0', width: '100%', maxWidth: 640 }}>
                    {[['6/6', 'Questions answered'], ['14:08', 'Duration'], ['Voice', 'Mode'], ['412', 'Words spoken']].map(([v, l]) => (
                        <div key={l}><div className="h2" style={{ fontSize: 38 }}>{v}</div><div className="label" style={{ marginTop: 8 }}>{l}</div></div>
                    ))}
                </div>

                <div className="col ac gap-16">
                    <button className="btn btn-gold btn-lg" style={{ height: 58, padding: '0 40px', fontSize: 17 }} onClick={generate} disabled={generating}>
                        <Sparkles size={18} />{generating ? 'Scoring your answers…' : 'Generate my report'}
                    </button>
                    {!generating && <a href="#" className="sm faint" onClick={(e) => { e.preventDefault(); nav(`/coach/session/${id}`); }}>Review my answers first</a>}
                </div>

                {generating && <p className="xs" style={{ marginTop: 40 }}>Building your scored report across clarity, structure, confidence &amp; role fit…</p>}
            </div>
        </div>
    );
}
