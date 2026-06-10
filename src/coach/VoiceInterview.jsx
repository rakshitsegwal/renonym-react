import React, { useState, useEffect } from 'react';
import { Clock, SkipForward, RotateCcw, Type, Square } from 'lucide-react';
import { VoiceOrb, Waveform, ProgressDots, Badge } from './primitives.jsx';
import { getSession, submitAnswer } from './api.js';

// S7 — Voice Interview. Loads the AI questions for the session. NOTE: real
// mic/STT/TTS + the full 8 states land in Phase 6; for now "Finish answer"
// records a placeholder and advances, so the flow completes end-to-end.
// (Text mode is the real-answer path until voice transcription ships.)
const VOICE_PLACEHOLDER = '[Spoken answer — live transcription ships in the voice beta.]';

export default function VoiceInterview({ nav, id }) {
    const [questions, setQuestions] = useState(null);
    const [company, setCompany] = useState('');
    const [q, setQ] = useState(0);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');

    useEffect(() => {
        let alive = true;
        getSession(id).then(s => {
            if (!alive) return;
            const qs = Array.isArray(s.questions) ? s.questions : [];
            setQuestions(qs);
            setCompany([s.job_title, s.company].filter(Boolean).join(' · ') || 'Interview');
            const answered = Array.isArray(s.answers) ? s.answers.length : 0;
            setQ(Math.min(answered, Math.max(0, qs.length - 1)));
        }).catch(e => { if (e.status === 401) nav('/coach'); else setErr(e.message || 'Could not load this interview.'); });
        return () => { alive = false; };
    }, [id]);

    if (err) return <Centered nav={nav} msg={err} />;
    if (!questions) return <Centered nav={nav} msg="Loading your interview…" spinner />;
    if (!questions.length) return <Centered nav={nav} msg="No questions found for this session." />;

    const total = questions.length;
    const question = questions[q];

    async function finish() {
        if (busy) return;
        setBusy(true); setErr('');
        try {
            await submitAnswer(id, question.id, VOICE_PLACEHOLDER);
            if (q >= total - 1) { nav(`/coach/session/${id}/complete`); return; }
            setQ(q + 1); setBusy(false);
        } catch (e) { setErr(e.message || 'Could not save.'); setBusy(false); }
    }

    return (
        <div className="rn-dark" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="row ac jsb" style={{ padding: '0 32px', height: 68, borderBottom: '1px solid var(--line)', flex: 'none' }}>
                <div className="row ac gap-10">
                    <div className="av" style={{ width: 34, height: 34, background: '#3a3320', color: 'var(--gold)', fontSize: 14 }}>{company[0] || 'S'}</div>
                    <div><div className="h5" style={{ lineHeight: 1.1, whiteSpace: 'nowrap' }}>{company}</div><div className="xs">AI interview</div></div>
                </div>
                <div className="row ac gap-14">
                    <Badge variant="blue" dot>Voice</Badge>
                    <span className="pill" style={{ height: 34 }}><Clock size={13} color="var(--muted)" />12:30 left</span>
                    <span className="label">Q{q + 1} / {total}</span>
                    <button className="btn btn-ghost btn-sm" style={{ borderColor: 'var(--rose)', color: 'var(--rose)' }} onClick={() => nav(`/coach/session/${id}/complete`)}>End interview</button>
                </div>
            </div>

            <div className="row jc" style={{ padding: '20px 0 0', flex: 'none' }}><ProgressDots total={total} current={q} /></div>

            <div className="col ac jc fill" style={{ textAlign: 'center', padding: '0 24px', minHeight: 0 }}>
                <div className="label" style={{ marginBottom: 20 }}>Coach asks · Question {q + 1}</div>
                <h1 className="h1" style={{ fontWeight: 400, maxWidth: '20ch', lineHeight: 1.1 }}>{renderHi(question.text, question.hint)}</h1>
                <div className="rel" style={{ margin: '48px 0 0' }}><VoiceOrb size={140} state="listening" /></div>
                <Waveform bars={15} live height={60} style={{ marginTop: 34 }} />
                <div className="pill" style={{ marginTop: 30 }}><span className="dot" />Listening — speak naturally</div>
            </div>

            <div style={{ maxWidth: 720, width: '100%', margin: '0 auto', padding: '0 24px 18px', flex: 'none' }}>
                <div className="card-2" style={{ padding: '14px 20px', borderRadius: 14, textAlign: 'center' }}>
                    <span className="xs">Voice transcription ships in the voice beta — use <button className="gold" style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'var(--gold)' }} onClick={() => nav(`/coach/session/${id}?mode=text`)}>text mode</button> for full scoring today.</span>
                </div>
                {err && <p className="sm" style={{ color: 'var(--rose)', textAlign: 'center', marginTop: 10 }}>{err}</p>}
            </div>

            <div className="row ac jc gap-16" style={{ padding: '0 0 30px', flex: 'none' }}>
                <CBtn title="Skip" onClick={finish}><SkipForward size={20} /></CBtn>
                <button className="btn btn-gold" style={{ height: 54, padding: '0 26px', fontSize: 15 }} onClick={finish} disabled={busy}>
                    <Square size={12} fill="var(--on-gold)" stroke="none" />{busy ? 'Saving…' : 'Finish answer'}
                </button>
                <CBtn title="Repeat"><RotateCcw size={20} /></CBtn>
                <CBtn title="Show as text" onClick={() => nav(`/coach/session/${id}?mode=text`)}><Type size={20} /></CBtn>
            </div>
        </div>
    );
}

function CBtn({ children, title, onClick }) {
    return <button title={title} onClick={onClick} style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--line-2)', color: 'var(--text-2)', display: 'grid', placeItems: 'center' }}>{children}</button>;
}
function renderHi(text, hi) {
    if (!hi || !text.includes(hi)) return text;
    const [a, b] = text.split(hi);
    return <>{a}<span className="italic gold">{hi}</span>{b}</>;
}
function Centered({ nav, msg, spinner }) {
    return (
        <div className="rn-dark" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <div>{spinner && <div className="orb pulse" style={{ width: 48, height: 48, margin: '0 auto 18px' }} />}<p className="lead" style={{ marginBottom: 18 }}>{msg}</p><button className="btn btn-outline" onClick={() => nav('/coach')}>Back to Coach</button></div>
        </div>
    );
}
