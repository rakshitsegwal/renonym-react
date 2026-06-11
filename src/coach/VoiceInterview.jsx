import React, { useState, useEffect, useRef } from 'react';
import { Clock, SkipForward, RotateCcw, Type, Square, MicOff } from 'lucide-react';
import { VoiceOrb, Waveform, ProgressDots, Badge } from './primitives.jsx';
import { getSession, submitAnswer } from './api.js';

// S7 — Voice Interview, real speech. The coach reads each question aloud
// (speechSynthesis) and the answer is transcribed live in the browser via
// SpeechRecognition (Chrome/Edge/Safari). Audio never leaves the device —
// only the final transcript is submitted for scoring. Browsers without
// SpeechRecognition are routed to text mode.
const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

const recogLang = () => {
    const l = navigator.language || 'en-US';
    return l.toLowerCase().startsWith('en') ? l : 'en-US';
};
const fmtClock = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

export default function VoiceInterview({ nav, id }) {
    const [questions, setQuestions] = useState(null);
    const [company, setCompany] = useState('');
    const [q, setQ] = useState(0);
    const [phase, setPhase] = useState('speaking');   // speaking | listening | denied
    const [finalText, setFinalText] = useState('');
    const [interim, setInterim] = useState('');
    const [elapsed, setElapsed] = useState(0);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const [fatal, setFatal] = useState('');

    const recogRef = useRef(null);
    const utterRef = useRef(null);        // active TTS utterance — handlers detached on stopAll
    const listeningRef = useRef(false);   // intent: keep restarting recognition while true
    const finalRef = useRef('');          // authoritative transcript (state mirrors it for render)

    // No SpeechRecognition (Firefox, some Safari) → text mode is the only honest path.
    useEffect(() => {
        if (!SR) {
            const t = setTimeout(() => nav(`/coach/session/${id}?mode=text`), 2600);
            return () => clearTimeout(t);
        }
    }, []);

    useEffect(() => {
        let alive = true;
        getSession(id).then(s => {
            if (!alive) return;
            const qs = Array.isArray(s.questions) ? s.questions : [];
            setQuestions(qs);
            setCompany([s.job_title, s.company].filter(Boolean).join(' · ') || 'Interview');
            // resume at the first question with no recorded answer; all answered →
            // complete screen (never re-show the last question of a finished run)
            const ansIds = new Set((Array.isArray(s.answers) ? s.answers : []).map(a => a.questionId));
            const firstOpen = qs.findIndex(qq => !ansIds.has(qq.id));
            if (firstOpen === -1 && qs.length) { nav(`/coach/session/${id}/complete`); return; }
            setQ(Math.max(0, firstOpen));
        }).catch(e => { if (e.status === 401) nav('/coach'); else setFatal(e.message || 'Could not load this interview.'); });
        return () => { alive = false; };
    }, [id]);

    // session clock
    useEffect(() => {
        const t = setInterval(() => setElapsed(s => s + 1), 1000);
        return () => clearInterval(t);
    }, []);

    // each question: coach speaks it, then the mic opens
    useEffect(() => {
        if (!questions || !questions.length || !SR) return;
        finalRef.current = ''; setFinalText(''); setInterim(''); setErr('');
        speakThenListen(questions[q].text);
        return () => { stopAll(); };
    }, [questions, q]);

    // Detach every handler BEFORE cancelling: speechSynthesis.cancel() fires the
    // utterance's onerror ('interrupted') and recognition.stop() flushes a late
    // onresult — without detaching, a cancelled question restarts the mic after
    // unmount (mic stays on forever) or bleeds transcript into the next answer.
    function stopAll() {
        listeningRef.current = false;
        const u = utterRef.current;
        if (u) { u.onend = null; u.onerror = null; utterRef.current = null; }
        const r = recogRef.current;
        if (r) { r.onresult = null; r.onend = null; r.onerror = null; recogRef.current = null; try { r.abort(); } catch {} }
        try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch {}
    }

    function speakThenListen(text) {
        stopAll();
        if (!window.speechSynthesis) { startListening(); return; }
        try {
            setPhase('speaking');
            const u = new SpeechSynthesisUtterance(text);
            u.lang = recogLang(); u.rate = 1.03; u.pitch = 1;
            u.onend = () => { if (utterRef.current === u) startListening(); };
            u.onerror = (e) => {
                if (utterRef.current !== u) return;                       // already cancelled
                if (e.error === 'interrupted' || e.error === 'canceled') return;
                startListening();                                          // real synthesis failure → skip to mic
            };
            utterRef.current = u;
            window.speechSynthesis.speak(u);
        } catch { startListening(); }
    }

    function startListening() {
        if (!SR) return;
        const old = recogRef.current;
        if (old) { old.onresult = null; old.onend = null; old.onerror = null; try { old.abort(); } catch {} }
        const r = new SR();
        r.lang = recogLang(); r.continuous = true; r.interimResults = true;
        r.onresult = (e) => {
            if (recogRef.current !== r) return;   // stale instance — discard
            let inter = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const t = e.results[i][0].transcript;
                if (e.results[i].isFinal) { finalRef.current += t + ' '; }
                else inter += t;
            }
            setFinalText(finalRef.current); setInterim(inter);
        };
        r.onerror = (e) => {
            if (recogRef.current !== r) return;
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { listeningRef.current = false; setPhase('denied'); }
            // 'no-speech' / 'aborted' are routine — onend restarts while intent holds
        };
        r.onend = () => { if (listeningRef.current && recogRef.current === r) { try { r.start(); } catch {} } };
        recogRef.current = r;
        listeningRef.current = true;
        setPhase('listening');
        try { r.start(); } catch {}
    }

    if (fatal) return <Centered nav={nav} msg={fatal} />;
    if (!SR) return (
        <Centered nav={nav} msg="Your browser doesn't support voice interviews — switching you to text mode…" spinner
                  extra={<button className="btn btn-gold" onClick={() => nav(`/coach/session/${id}?mode=text`)}>Continue in text mode →</button>} />
    );
    if (!questions) return <Centered nav={nav} msg="Loading your interview…" spinner />;
    if (!questions.length) return <Centered nav={nav} msg="No questions found for this session." />;

    const total = questions.length;
    const question = questions[q];
    const transcript = (finalText + ' ' + interim).trim();
    // long AI questions must shrink, not overflow the screen
    const qLen = question.text.length;
    const qSize = qLen > 240 ? 24 : qLen > 160 ? 28 : qLen > 90 ? 33 : 40;

    async function finish() {
        if (busy) return;
        const answer = (finalRef.current + ' ' + interim).trim();
        if (!answer) { setErr("We didn't catch anything yet — answer out loud, or use Skip / text mode."); return; }
        setBusy(true); setErr('');
        stopAll();
        try {
            await submitAnswer(id, question.id, answer);
            if (q >= total - 1) { nav(`/coach/session/${id}/complete`); return; }
            setQ(q + 1); setBusy(false);
        } catch (e) { setErr(e.message || 'Could not save your answer.'); setBusy(false); startListening(); }
    }

    function skip() {
        if (busy) return;
        stopAll();
        if (q >= total - 1) { nav(`/coach/session/${id}/complete`); return; }
        setQ(q + 1);
    }

    function repeat() { if (busy) return; speakThenListen(question.text); }

    return (
        <div className="rn-dark vh-shell" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="row ac jsb" style={{ padding: '0 32px', height: 68, borderBottom: '1px solid var(--line)', flex: 'none' }}>
                <div className="row ac gap-10" style={{ minWidth: 0 }}>
                    <div className="av" style={{ width: 34, height: 34, background: '#3a3320', color: 'var(--gold)', fontSize: 14, flex: 'none' }}>{company[0] || 'I'}</div>
                    <div style={{ minWidth: 0 }}><div className="h5" style={{ lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{company}</div><div className="xs">AI interview</div></div>
                </div>
                <div className="row ac gap-14" style={{ flex: 'none' }}>
                    <Badge variant="blue" dot>Voice</Badge>
                    <span className="pill" style={{ height: 34 }}><Clock size={13} color="var(--muted)" />{fmtClock(elapsed)}</span>
                    <span className="label">Q{q + 1} / {total}</span>
                    <button className="btn btn-ghost btn-sm" style={{ borderColor: 'var(--rose)', color: 'var(--rose)' }} onClick={() => { stopAll(); nav(`/coach/session/${id}/complete`); }}>End interview</button>
                </div>
            </div>

            <div className="row jc" style={{ padding: '18px 0 0', flex: 'none' }}><ProgressDots total={total} current={q} /></div>

            {/* scrolls if a long question + transcript exceed the viewport */}
            <div className="fill" style={{ overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <div className="col ac" style={{ textAlign: 'center', padding: '18px 24px', margin: 'auto', width: '100%' }}>
                    <div className="label" style={{ marginBottom: 16 }}>Coach asks · Question {q + 1}</div>
                    <h1 style={{ fontFamily: 'var(--rn-serif)', fontWeight: 400, fontSize: qSize, lineHeight: 1.2, letterSpacing: '-0.02em', maxWidth: 780 }}>{renderHi(question.text, question.hint)}</h1>

                    {phase === 'denied' ? (
                        <div className="card" style={{ marginTop: 36, padding: '22px 26px', maxWidth: 560, borderColor: 'var(--rose)', background: 'var(--rose-soft)' }}>
                            <div className="row ac jc gap-10" style={{ marginBottom: 8 }}><MicOff size={16} color="var(--rose)" /><span className="sm" style={{ color: 'var(--rose)', fontWeight: 600 }}>Microphone blocked</span></div>
                            <p className="xs" style={{ marginBottom: 14 }}>Allow microphone access for this site (lock icon in the address bar), then try again — or continue by typing.</p>
                            <div className="row jc gap-10">
                                <button className="btn btn-ghost btn-sm" onClick={() => startListening()}>Try again</button>
                                <button className="btn btn-gold btn-sm" onClick={() => { stopAll(); nav(`/coach/session/${id}?mode=text`); }}>Switch to text mode</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="rel" style={{ margin: '34px 0 0' }}><VoiceOrb size={120} state={phase} /></div>
                            <Waveform bars={15} live={phase === 'listening'} height={48} style={{ marginTop: 26 }} />
                            <div className="pill" style={{ marginTop: 22 }}>
                                <span className="dot" style={phase === 'speaking' ? { background: 'var(--blue)' } : undefined} />
                                {phase === 'speaking' ? 'Coach is asking…' : 'Listening — speak your answer'}
                            </div>
                            {transcript && (
                                <div className="card-2" style={{ marginTop: 22, padding: '16px 20px', maxWidth: 680, width: '100%', maxHeight: 130, overflowY: 'auto', textAlign: 'left' }}>
                                    <div className="label" style={{ marginBottom: 8 }}>Your answer · {transcript.split(/\s+/).length} words</div>
                                    <p className="sm" style={{ color: 'var(--text-2)' }}>{finalText}<span style={{ color: 'var(--faint)' }}>{interim}</span></p>
                                </div>
                            )}
                        </>
                    )}
                    {err && <p className="sm" style={{ color: 'var(--rose)', marginTop: 16 }}>{err}</p>}
                </div>
            </div>

            <div style={{ flex: 'none', padding: '10px 24px 26px' }}>
                <div className="row ac jc gap-16">
                    <CBtn title="Skip this question" onClick={skip}><SkipForward size={20} /></CBtn>
                    <button className="btn btn-gold" style={{ height: 54, padding: '0 26px', fontSize: 15 }} onClick={finish} disabled={busy || phase === 'denied'}>
                        <Square size={12} fill="var(--on-gold)" stroke="none" />{busy ? 'Saving…' : 'Finish answer'}
                    </button>
                    <CBtn title="Repeat the question" onClick={repeat}><RotateCcw size={20} /></CBtn>
                    <CBtn title="Switch to text mode" onClick={() => { stopAll(); nav(`/coach/session/${id}?mode=text`); }}><Type size={20} /></CBtn>
                </div>
                <p className="xs tc" style={{ marginTop: 12 }}>Transcribed on your device — only the text is saved for scoring.</p>
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
function Centered({ nav, msg, spinner, extra }) {
    return (
        <div className="rn-dark" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <div>{spinner && <div className="orb pulse" style={{ width: 48, height: 48, margin: '0 auto 18px' }} />}<p className="lead" style={{ marginBottom: 18 }}>{msg}</p>{extra || <button className="btn btn-outline" onClick={() => nav('/coach')}>Back to Coach</button>}</div>
        </div>
    );
}
