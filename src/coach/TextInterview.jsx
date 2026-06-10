import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { Badge } from './primitives.jsx';

// S8 — Text Interview (recreated from designs/screens/08-text-interview.html).
// Deliberately a dedicated composer, not a chat UI. Phase-3 mock: question
// flow + live word count; real evaluation/follow-ups land in Phase 5.
const QUESTIONS = [
    'Walk me through your background.',
    'Tell me about a time you shipped a product with incomplete data.',
    'How do you prioritize when every stakeholder insists their request is the urgent one?',
    "What's the hardest tradeoff you've personally owned?",
    'Tell me about a decision you got wrong.',
    'Why this role, and why now?',
];
const SHORT = ['Walk me through your background', 'Shipping with incomplete data', 'Prioritizing stakeholders', 'Hardest tradeoff you owned', 'A decision you got wrong', 'Why this role'];

export default function TextInterview({ nav, id = 'demo' }) {
    const [q, setQ] = useState(2); // start on Q3 like the design
    const [answer, setAnswer] = useState('I start by separating urgency from importance. First, I make the implicit explicit — I ask each stakeholder what outcome their request drives and by when, then map it against our quarterly goals. At Brex, when three teams escalated at once, I built a simple impact-vs-effort grid in a shared doc so the tradeoffs were visible to everyone, not decided behind closed doors.');

    const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
    const hasResult = /\d/.test(answer);

    function submit() {
        if (q >= QUESTIONS.length - 1) { nav(`/coach/session/${id}/complete`); return; }
        setQ(q + 1);
        setAnswer('');
    }
    function onKey(e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); submit(); }
    }

    return (
        <div className="rn-dark" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* top */}
            <div className="row ac jsb" style={{ padding: '0 32px', height: 68, borderBottom: '1px solid var(--line)', flex: 'none' }}>
                <div className="row ac gap-10">
                    <div className="av" style={{ width: 34, height: 34, background: '#3a3320', color: 'var(--gold)', fontSize: 14 }}>S</div>
                    <div><div className="h5" style={{ lineHeight: 1.1, whiteSpace: 'nowrap' }}>Senior PM · Stripe</div><div className="xs">Behavioral interview</div></div>
                </div>
                <div className="row ac gap-14">
                    <Badge variant="blue" dot>Text</Badge>
                    <span className="pill" style={{ height: 34 }}><Clock size={13} color="var(--muted)" />No time limit</span>
                    <span className="label">Q{q + 1} / {QUESTIONS.length}</span>
                    <button className="btn btn-ghost btn-sm" style={{ borderColor: 'var(--rose)', color: 'var(--rose)' }} onClick={() => nav(`/coach/session/${id}/complete`)}>End interview</button>
                </div>
            </div>

            <div className="grid fill" style={{ gridTemplateColumns: '300px 1fr', minHeight: 0 }}>
                {/* rail */}
                <aside style={{ borderRight: '1px solid var(--line)', padding: '32px 24px', overflowY: 'auto' }}>
                    <div className="label" style={{ marginBottom: 16 }}>Progress</div>
                    <div className="col gap-4">
                        {SHORT.map((s, i) => {
                            const done = i < q, now = i === q;
                            return (
                                <div key={i} className="row ac gap-10" style={{ padding: '10px 12px', borderRadius: 10, background: now ? 'var(--surface-3)' : 'transparent', color: now ? 'var(--text)' : done ? 'var(--text-2)' : 'var(--muted)' }}>
                                    <span style={{ width: 22, height: 22, borderRadius: '50%', flex: 'none', display: 'grid', placeItems: 'center', fontSize: 11, fontFamily: 'var(--rn-mono)', background: done ? 'var(--green-soft)' : now ? 'var(--gold)' : 'var(--surface-3)', color: done ? 'var(--green)' : now ? 'var(--on-gold)' : 'var(--muted)' }}>{done ? '✓' : i + 1}</span>
                                    <span className="sm" style={{ minWidth: 0 }}>{s}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="divider" style={{ margin: '26px 0' }} />
                    <div className="card-gold" style={{ padding: '16px 18px' }}>
                        <div className="label" style={{ color: 'var(--gold)', marginBottom: 8 }}>Coaching tip</div>
                        <p className="xs" style={{ color: 'var(--text-2)' }}>Structure with STAR: Situation, Task, Action, Result. End with a number.</p>
                    </div>
                    <div className="card" style={{ padding: '14px 16px', marginTop: 14 }}>
                        <div className="row ac gap-10"><div style={{ width: 28, height: 34, borderRadius: 5, background: '#F3F1EB', flex: 'none' }} /><div><div className="xs" style={{ color: 'var(--text-2)', fontWeight: 600 }}>Your résumé</div><div className="xs">Referenced live</div></div></div>
                    </div>
                </aside>

                {/* main */}
                <div style={{ padding: '40px 48px', overflowY: 'auto', maxWidth: 880, width: '100%', margin: '0 auto' }}>
                    <div className="label" style={{ marginBottom: 14 }}>Coach asks · Question {q + 1} of {QUESTIONS.length}</div>
                    <h1 className="h2" style={{ fontWeight: 400, marginBottom: 8 }}>{QUESTIONS[q]}</h1>
                    <p className="sm" style={{ marginBottom: 28 }}>Answer as you would in the real interview. The coach may ask a follow-up.</p>

                    <div className="card" style={{ padding: 22 }}>
                        <textarea
                            className="textarea"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            onKeyDown={onKey}
                            placeholder="Type your answer…"
                            style={{ minHeight: 200, background: 'transparent', border: 'none', boxShadow: 'none', padding: 0, fontSize: 15.5, lineHeight: 1.6, color: 'var(--text)' }}
                        />
                        <div className="divider" style={{ margin: '18px 0' }} />
                        <div className="row ac jsb wrap-f gap-12">
                            <div className="row ac gap-14">
                                <span className="xs">{words} words · ~{Math.max(1, Math.round(words / 130))} min read</span>
                                <Badge variant={words >= 40 ? 'green' : 'default'}>Structure {words >= 40 ? '✓' : '…'}</Badge>
                                {!hasResult && <Badge variant="amber">Add a result</Badge>}
                            </div>
                            <div className="row ac gap-10">
                                <button className="btn btn-ghost btn-sm">Save draft</button>
                                <button className="btn btn-gold" onClick={submit}>Submit answer →</button>
                            </div>
                        </div>
                    </div>
                    <div className="row ac gap-8 xs jc" style={{ marginTop: 16 }}><span className="kbd">⌘</span><span className="kbd">↵</span><span>to submit · Shift+↵ for newline</span></div>
                </div>
            </div>
        </div>
    );
}
