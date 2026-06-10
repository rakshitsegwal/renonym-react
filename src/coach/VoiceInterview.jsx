import React, { useState } from 'react';
import { Clock, SkipForward, RotateCcw, Type, Square } from 'lucide-react';
import { VoiceOrb, Waveform, ProgressDots, Badge } from './primitives.jsx';

// S7 — Voice Interview (recreated from designs/screens/07-voice-interview.html).
// Phase-3 mock: visual states + question flow. Real mic/STT/TTS + the full 8
// states (coach-speaking, listening, processing, follow-up, mic-denied,
// no-audio, reconnecting, end-confirm) land in Phase 6.
const QUESTIONS = [
    { text: 'Walk me through your background.', hi: 'background' },
    { text: 'Tell me about a time you shipped a product with incomplete data.', hi: 'incomplete data' },
    { text: 'How do you prioritize when every stakeholder insists their request is the urgent one?', hi: 'the urgent one' },
    { text: "What's the hardest tradeoff you've personally owned?", hi: 'hardest tradeoff' },
    { text: 'Tell me about a decision you got wrong.', hi: 'got wrong' },
    { text: 'Why this role, and why now?', hi: 'Why this role' },
];
const TRANSCRIPT = '"At Brex, we had to launch the rewards dashboard before the analytics pipeline was finished, so I worked with data to define three proxy metrics we could trust, and I"';

export default function VoiceInterview({ nav, id = 'demo' }) {
    const [q, setQ] = useState(1); // 0-indexed; start on Q2 like the design

    function finish() {
        if (q >= QUESTIONS.length - 1) nav(`/coach/session/${id}/complete`);
        else setQ(q + 1);
    }

    const question = QUESTIONS[q];

    return (
        <div className="rn-dark" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* top */}
            <div className="row ac jsb" style={{ padding: '0 32px', height: 68, borderBottom: '1px solid var(--line)', flex: 'none' }}>
                <div className="row ac gap-10">
                    <div className="av" style={{ width: 34, height: 34, background: '#3a3320', color: 'var(--gold)', fontSize: 14 }}>S</div>
                    <div><div className="h5" style={{ lineHeight: 1.1, whiteSpace: 'nowrap' }}>Senior PM · Stripe</div><div className="xs">Behavioral interview</div></div>
                </div>
                <div className="row ac gap-14">
                    <Badge variant="blue" dot>Voice</Badge>
                    <span className="pill" style={{ height: 34 }}><Clock size={13} color="var(--muted)" />12:30 left</span>
                    <span className="label">Q{q + 1} / {QUESTIONS.length}</span>
                    <button className="btn btn-ghost btn-sm" style={{ borderColor: 'var(--rose)', color: 'var(--rose)' }} onClick={() => nav(`/coach/session/${id}/complete`)}>End interview</button>
                </div>
            </div>

            {/* progress */}
            <div className="row jc" style={{ padding: '20px 0 0', flex: 'none' }}>
                <ProgressDots total={QUESTIONS.length} current={q} />
            </div>

            {/* center */}
            <div className="col ac jc fill" style={{ textAlign: 'center', padding: '0 24px', minHeight: 0 }}>
                <div className="label" style={{ marginBottom: 20 }}>Coach asks · Question {q + 1}</div>
                <h1 className="h1" style={{ fontWeight: 400, maxWidth: '18ch', lineHeight: 1.1 }}>{renderHi(question.text, question.hi)}</h1>

                <div className="rel" style={{ margin: '48px 0 0' }}><VoiceOrb size={140} state="listening" /></div>
                <Waveform bars={15} live height={60} style={{ marginTop: 34 }} />
                <div className="pill" style={{ marginTop: 30 }}><span className="dot" />Listening — speak naturally</div>
            </div>

            {/* transcript */}
            <div style={{ maxWidth: 720, width: '100%', margin: '0 auto', padding: '0 24px 18px', flex: 'none' }}>
                <div className="card-2" style={{ padding: '18px 22px', borderRadius: 14 }}>
                    <div className="row ac gap-10" style={{ marginBottom: 8 }}>
                        <span className="label" style={{ color: 'var(--gold)' }}>Live transcript</span>
                        <Waveform bars={3} live height={14} style={{ gap: 3 }} />
                    </div>
                    <p className="sm" style={{ color: 'var(--text)', lineHeight: 1.55 }}>{TRANSCRIPT}<span className="gold">▍</span></p>
                </div>
            </div>

            {/* controls */}
            <div className="row ac jc gap-16" style={{ padding: '0 0 30px', flex: 'none' }}>
                <CBtn title="Skip" onClick={finish}><SkipForward size={20} /></CBtn>
                <button className="btn btn-gold" style={{ height: 54, padding: '0 26px', fontSize: 15 }} onClick={finish}>
                    <Square size={12} fill="var(--on-gold)" stroke="none" />Finish answer
                </button>
                <CBtn title="Repeat"><RotateCcw size={20} /></CBtn>
                <CBtn title="Show as text" onClick={() => nav(`/coach/session/${id}?mode=text`)}><Type size={20} /></CBtn>
            </div>
        </div>
    );
}

function CBtn({ children, title, onClick }) {
    return (
        <button title={title} onClick={onClick} style={{
            width: 52, height: 52, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--line-2)',
            color: 'var(--text-2)', display: 'grid', placeItems: 'center', transition: '.15s var(--ease)',
        }}>{children}</button>
    );
}

// Highlight the key phrase in gold italic.
function renderHi(text, hi) {
    if (!hi || !text.includes(hi)) return text;
    const [a, b] = text.split(hi);
    return <>{a}<span className="italic gold">{hi}</span>{b}</>;
}
