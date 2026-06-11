import React, { useState, useEffect } from 'react';
import { Check, Sparkles, AlertCircle } from 'lucide-react';
import { Badge } from './primitives.jsx';
import { getSession, scoreSession, getUser } from './api.js';

// S9 — Interview Complete. Loads the real session and reports honestly:
// how many questions actually got answers, real word count, real duration.
// Zero answers → no fake "nicely done", no report button — resume instead.
const isRealAnswer = (t) => t && String(t).trim() && !String(t).startsWith('[Spoken answer');

export default function InterviewComplete({ nav, id }) {
    const [s, setS] = useState(null);
    const [loadErr, setLoadErr] = useState('');
    const [generating, setGenerating] = useState(false);
    const [err, setErr] = useState('');
    const name = (getUser()?.name || '').split(' ')[0] || 'there';

    useEffect(() => {
        let alive = true;
        getSession(id)
            .then(d => { if (alive) setS(d); })
            .catch(e => { if (e.status === 401) nav('/coach'); else setLoadErr(e.message || 'Could not load this interview.'); });
        return () => { alive = false; };
    }, [id]);

    if (loadErr) return <Shell nav={nav}><p className="lead" style={{ marginBottom: 18 }}>{loadErr}</p><button className="btn btn-outline" onClick={() => nav('/coach')}>Back to Coach</button></Shell>;
    if (!s) return <Shell nav={nav}><div className="orb pulse" style={{ width: 48, height: 48, margin: '0 auto 18px' }} /><p className="lead">Loading…</p></Shell>;

    const questions = Array.isArray(s.questions) ? s.questions : [];
    const raw = Array.isArray(s.answers) ? s.answers : [];
    const lastByQ = {};
    raw.forEach(a => { if (a && a.questionId) lastByQ[a.questionId] = a; });
    const real = Object.values(lastByQ).filter(a => isRealAnswer(a.text));
    const total = questions.length;
    const count = real.length;
    const words = real.reduce((n, a) => n + String(a.text).trim().split(/\s+/).length, 0);
    const role = [s.job_title, s.company].filter(Boolean).join(' · ') || 'this';
    const modeLabel = s.mode === 'text' ? 'Text' : 'Voice';
    const sessionPath = `/coach/session/${id}` + (s.mode === 'text' ? '?mode=text' : '');
    const duration = (() => {
        try {
            const end = raw.length ? new Date(raw[raw.length - 1].at) : null;
            if (!end || !s.created_at) return '—';
            const sec = Math.max(0, Math.round((end - new Date(s.created_at)) / 1000));
            return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
        } catch { return '—'; }
    })();

    async function generate() {
        setGenerating(true); setErr('');
        try {
            await scoreSession(id);     // runs the AI scoring (idempotent)
            nav(`/coach/report/${id}`);
        } catch (e) {
            setErr(e.message || 'Could not generate the report. Please try again.');
            setGenerating(false);
        }
    }

    return (
        <Shell nav={nav}>
            {count === 0 ? (
                <>
                    <div style={{ width: 88, height: 88, borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 30px', background: 'var(--amber-soft)', border: '1px solid var(--amber-line)' }}>
                        <AlertCircle size={42} color="var(--amber)" />
                    </div>
                    <Badge variant="amber" dot style={{ margin: '0 auto 22px' }}>Interview ended early</Badge>
                    <h1 className="display" style={{ fontSize: 'clamp(42px,6vw,64px)' }}>No answers recorded.</h1>
                    <p className="lead" style={{ maxWidth: '46ch', margin: '22px auto 0' }}>You left the <span style={{ color: 'var(--text)' }}>{role}</span> interview before answering — there's nothing to score yet. Pick it back up whenever you're ready.</p>
                    <div className="row jc gap-12" style={{ marginTop: 44 }}>
                        <button className="btn btn-gold btn-lg" style={{ height: 58, padding: '0 40px', fontSize: 17 }} onClick={() => nav(sessionPath)}>Resume interview →</button>
                        <button className="btn btn-outline btn-lg" onClick={() => nav('/coach/reports')}>My interviews</button>
                    </div>
                </>
            ) : (
                <>
                    <div className="orb" style={{ width: 88, height: 88, display: 'grid', placeItems: 'center', margin: '0 auto 30px', boxShadow: 'var(--shadow-gold)' }}>
                        <Check size={48} color="var(--on-gold)" strokeWidth={2.4} />
                    </div>
                    <Badge variant="green" dot style={{ margin: '0 auto 22px' }}>Interview complete</Badge>
                    <h1 className="display" style={{ fontSize: 'clamp(48px,7vw,74px)' }}>{count === total ? `Nicely done, ${name}.` : `Good work, ${name}.`}</h1>
                    <p className="lead" style={{ maxWidth: '46ch', margin: '22px auto 0' }}>You answered {count} of {total} questions for the <span style={{ color: 'var(--text)' }}>{role}</span> interview. Your report is ready to generate.</p>

                    <div className="grid gap-20 g-stats" style={{ gridTemplateColumns: 'repeat(4,1fr)', margin: '44px auto', width: '100%', maxWidth: 640 }}>
                        {[[`${count}/${total}`, 'Questions answered'], [duration, 'Duration'], [modeLabel, 'Mode'], [String(words), s.mode === 'text' ? 'Words written' : 'Words spoken']].map(([v, l]) => (
                            <div key={l}><div className="h2" style={{ fontSize: 38 }}>{v}</div><div className="label" style={{ marginTop: 8 }}>{l}</div></div>
                        ))}
                    </div>

                    <div className="col ac gap-16">
                        {s.status === 'scored' ? (
                            <button className="btn btn-gold btn-lg" style={{ height: 58, padding: '0 40px', fontSize: 17 }} onClick={() => nav(`/coach/report/${id}`)}>
                                <Sparkles size={18} />View my report
                            </button>
                        ) : (
                            <button className="btn btn-gold btn-lg" style={{ height: 58, padding: '0 40px', fontSize: 17 }} onClick={generate} disabled={generating}>
                                <Sparkles size={18} />{generating ? 'Scoring your answers…' : 'Generate my report'}
                            </button>
                        )}
                        {!generating && count < total && <a href="#" className="sm faint" onClick={(e) => { e.preventDefault(); nav(sessionPath); }}>Answer the remaining {total - count} first</a>}
                    </div>

                    {generating && <p className="xs" style={{ marginTop: 40 }}>Building your scored report across clarity, structure, confidence &amp; role fit…</p>}
                    {err && <p className="sm" style={{ color: 'var(--rose)', marginTop: 24 }}>{err}</p>}
                </>
            )}
        </Shell>
    );
}

function Shell({ nav, children }) {
    return (
        <div className="rn-dark" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px', textAlign: 'center' }}>
            <div className="row jsb ac" style={{ width: '100%', maxWidth: 1240, height: 68 }}>
                <div className="brand"><div className="mark">R</div><div className="wm">Re<b>nonym</b></div></div>
                <a href="/" className="sm faint" onClick={(e) => { e.preventDefault(); nav('/'); }}>Close</a>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: 760, paddingBottom: 60 }}>
                {children}
            </div>
        </div>
    );
}
