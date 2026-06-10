import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Badge } from './primitives.jsx';
import { getSession, submitAnswer } from './api.js';

// S8 — Text Interview. Loads the AI-generated questions for the session and
// posts each typed answer to the backend; deliberately a dedicated composer.
export default function TextInterview({ nav, id }) {
    const [questions, setQuestions] = useState(null);
    const [company, setCompany] = useState('');
    const [q, setQ] = useState(0);
    const [answer, setAnswer] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');

    useEffect(() => {
        let alive = true;
        getSession(id).then(s => {
            if (!alive) return;
            const qs = Array.isArray(s.questions) ? s.questions : [];
            setQuestions(qs);
            setCompany([s.job_title, s.company].filter(Boolean).join(' · ') || 'Interview');
            // resume at the first unanswered question
            const answered = Array.isArray(s.answers) ? s.answers.length : 0;
            setQ(Math.min(answered, Math.max(0, qs.length - 1)));
        }).catch(e => {
            if (e.status === 401) nav('/coach');
            else setErr(e.message || 'Could not load this interview.');
        });
        return () => { alive = false; };
    }, [id]);

    if (err) return <Centered nav={nav} msg={err} />;
    if (!questions) return <Centered nav={nav} msg="Loading your interview…" spinner />;
    if (!questions.length) return <Centered nav={nav} msg="No questions found for this session." />;

    const total = questions.length;
    const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
    const hasResult = /\d/.test(answer);

    async function submit() {
        if (busy) return;
        setBusy(true); setErr('');
        try {
            await submitAnswer(id, questions[q].id, answer);
            if (q >= total - 1) { nav(`/coach/session/${id}/complete`); return; }
            setQ(q + 1); setAnswer(''); setBusy(false);
        } catch (e) { setErr(e.message || 'Could not save your answer.'); setBusy(false); }
    }
    function onKey(e) { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); submit(); } }

    return (
        <div className="rn-dark" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="row ac jsb" style={{ padding: '0 32px', height: 68, borderBottom: '1px solid var(--line)', flex: 'none' }}>
                <div className="row ac gap-10">
                    <div className="av" style={{ width: 34, height: 34, background: '#3a3320', color: 'var(--gold)', fontSize: 14 }}>{(company[0] || 'S')}</div>
                    <div><div className="h5" style={{ lineHeight: 1.1, whiteSpace: 'nowrap' }}>{company}</div><div className="xs">AI interview</div></div>
                </div>
                <div className="row ac gap-14">
                    <Badge variant="blue" dot>Text</Badge>
                    <span className="pill" style={{ height: 34 }}><Clock size={13} color="var(--muted)" />No time limit</span>
                    <span className="label">Q{q + 1} / {total}</span>
                    <button className="btn btn-ghost btn-sm" style={{ borderColor: 'var(--rose)', color: 'var(--rose)' }} onClick={() => nav(`/coach/session/${id}/complete`)}>End interview</button>
                </div>
            </div>

            <div className="grid fill" style={{ gridTemplateColumns: '300px 1fr', minHeight: 0 }}>
                <aside style={{ borderRight: '1px solid var(--line)', padding: '32px 24px', overflowY: 'auto' }}>
                    <div className="label" style={{ marginBottom: 16 }}>Progress</div>
                    <div className="col gap-4">
                        {questions.map((qq, i) => {
                            const done = i < q, now = i === q;
                            return (
                                <div key={qq.id} className="row ac gap-10" style={{ padding: '10px 12px', borderRadius: 10, background: now ? 'var(--surface-3)' : 'transparent', color: now ? 'var(--text)' : done ? 'var(--text-2)' : 'var(--muted)' }}>
                                    <span style={{ width: 22, height: 22, borderRadius: '50%', flex: 'none', display: 'grid', placeItems: 'center', fontSize: 11, fontFamily: 'var(--rn-mono)', background: done ? 'var(--green-soft)' : now ? 'var(--gold)' : 'var(--surface-3)', color: done ? 'var(--green)' : now ? 'var(--on-gold)' : 'var(--muted)' }}>{done ? '✓' : i + 1}</span>
                                    <span className="sm" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{qq.focus || qq.text}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="divider" style={{ margin: '26px 0' }} />
                    <div className="card-gold" style={{ padding: '16px 18px' }}>
                        <div className="label" style={{ color: 'var(--gold)', marginBottom: 8 }}>Coaching tip</div>
                        <p className="xs" style={{ color: 'var(--text-2)' }}>Structure with STAR: Situation, Task, Action, Result. End with a number.</p>
                    </div>
                </aside>

                <div style={{ padding: '40px 48px', overflowY: 'auto', maxWidth: 880, width: '100%', margin: '0 auto' }}>
                    <div className="label" style={{ marginBottom: 14 }}>Coach asks · Question {q + 1} of {total}</div>
                    <h1 className="h2" style={{ fontWeight: 400, marginBottom: 8 }}>{questions[q].text}</h1>
                    <p className="sm" style={{ marginBottom: 28 }}>Answer as you would in the real interview. The coach scores every answer.</p>

                    <div className="card" style={{ padding: 22 }}>
                        <textarea className="textarea" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={onKey} autoFocus
                                  placeholder="Type your answer…" style={{ minHeight: 200, background: 'transparent', border: 'none', boxShadow: 'none', padding: 0, fontSize: 15.5, lineHeight: 1.6, color: 'var(--text)' }} />
                        <div className="divider" style={{ margin: '18px 0' }} />
                        <div className="row ac jsb wrap-f gap-12">
                            <div className="row ac gap-14">
                                <span className="xs">{words} words · ~{Math.max(1, Math.round(words / 130))} min read</span>
                                <Badge variant={words >= 40 ? 'green' : 'default'}>Structure {words >= 40 ? '✓' : '…'}</Badge>
                                {!hasResult && answer && <Badge variant="amber">Add a result</Badge>}
                            </div>
                            <div className="row ac gap-10">
                                <button className="btn btn-gold" onClick={submit} disabled={busy || !answer.trim()}>{busy ? 'Saving…' : (q >= total - 1 ? 'Finish →' : 'Submit answer →')}</button>
                            </div>
                        </div>
                    </div>
                    {err && <p className="sm" style={{ color: 'var(--rose)', marginTop: 12 }}>{err}</p>}
                    <div className="row ac gap-8 xs jc" style={{ marginTop: 16 }}><span className="kbd">⌘</span><span className="kbd">↵</span><span>to submit</span></div>
                </div>
            </div>
        </div>
    );
}

function Centered({ nav, msg, spinner }) {
    return (
        <div className="rn-dark" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <div>
                {spinner && <div className="orb pulse" style={{ width: 48, height: 48, margin: '0 auto 18px' }} />}
                <p className="lead" style={{ marginBottom: 18 }}>{msg}</p>
                <button className="btn btn-outline" onClick={() => nav('/coach')}>Back to Coach</button>
            </div>
        </div>
    );
}
