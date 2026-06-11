import React, { useState, useEffect, useRef } from 'react';
import { Clock, SkipForward, RotateCcw, Type, Square, MicOff } from 'lucide-react';
import { VoiceOrb, Waveform, ProgressDots, Badge } from './primitives.jsx';
import { getSession, submitAnswer, questionAudio, transcribeAudio } from './api.js';

// S7 — Audio Interview. The AI interviewer SPEAKS each question (server TTS,
// natural voice; browser speechSynthesis as fallback) and the candidate
// answers out loud: the mic records (MediaRecorder) and the answer is
// transcribed server-side (Whisper). Where the browser also has live
// SpeechRecognition (Chrome/Edge), a live transcript preview is shown and
// doubles as the fallback if transcription fails. Works on Chrome, Edge,
// Safari and Firefox; browsers with no audio capture at all go to text mode.
const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
const HAS_RECORDER = typeof window !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);

const recogLang = () => {
    const l = navigator.language || 'en-US';
    return l.toLowerCase().startsWith('en') ? l : 'en-US';
};
const fmtClock = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

export default function VoiceInterview({ nav, id }) {
    const [questions, setQuestions] = useState(null);
    const [company, setCompany] = useState('');
    const [q, setQ] = useState(0);
    const [phase, setPhase] = useState('speaking');   // speaking | recording | transcribing | denied
    const [finalText, setFinalText] = useState('');   // live SR preview (when available)
    const [interim, setInterim] = useState('');
    const [recTime, setRecTime] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const [fatal, setFatal] = useState('');

    const genRef = useRef(0);             // bumped on every transition — stale async callbacks no-op
    const audioRef = useRef(null);        // playing question audio
    const audioCacheRef = useRef(new Map());   // questionId -> object URL (so Repeat is instant)
    const utterRef = useRef(null);        // browser-TTS fallback utterance
    const streamRef = useRef(null);       // persistent mic stream (one permission prompt)
    const recorderRef = useRef(null);
    const chunksRef = useRef([]);
    const recogRef = useRef(null);        // live-preview SpeechRecognition
    const listeningRef = useRef(false);
    const finalRef = useRef('');

    const usable = HAS_RECORDER || !!SR;  // some capture path exists

    useEffect(() => {
        if (!usable) {
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

    // answer-recording clock
    useEffect(() => {
        if (phase !== 'recording') return;
        const t = setInterval(() => setRecTime(s => s + 1), 1000);
        return () => clearInterval(t);
    }, [phase]);

    // each question: the interviewer speaks, then the mic opens
    useEffect(() => {
        if (!questions || !questions.length || !usable) return;
        askQuestion(questions[q]);
        return () => { stopEverything(); };
    }, [questions, q]);

    // full teardown on unmount (incl. the persistent mic stream + cached audio)
    useEffect(() => () => {
        stopEverything();
        try { streamRef.current && streamRef.current.getTracks().forEach(t => t.stop()); } catch {}
        streamRef.current = null;
        for (const url of audioCacheRef.current.values()) { try { URL.revokeObjectURL(url); } catch {} }
        audioCacheRef.current.clear();
    }, []);

    // ── engine ───────────────────────────────────────────────────────────────

    // Cancel ALL in-flight audio work. Detach handlers BEFORE cancelling so
    // interruption events can't restart anything after cleanup.
    function stopEverything() {
        genRef.current++;
        listeningRef.current = false;
        const a = audioRef.current;
        if (a) { a.onended = null; a.onerror = null; try { a.pause(); } catch {} audioRef.current = null; }
        const u = utterRef.current;
        if (u) { u.onend = null; u.onerror = null; utterRef.current = null; }
        try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch {}
        const r = recogRef.current;
        if (r) { r.onresult = null; r.onend = null; r.onerror = null; recogRef.current = null; try { r.abort(); } catch {} }
        const mr = recorderRef.current;
        if (mr) { recorderRef.current = null; try { mr.ondataavailable = null; mr.onstop = null; mr.state !== 'inactive' && mr.stop(); } catch {} }
        chunksRef.current = [];
    }

    async function askQuestion(question) {
        stopEverything();
        const gen = genRef.current;
        finalRef.current = ''; setFinalText(''); setInterim(''); setErr(''); setRecTime(0);
        setPhase('speaking');

        // 1) natural AI interviewer voice from the server (cached per question)
        try {
            let url = audioCacheRef.current.get(question.id);
            if (!url) {
                const blob = await questionAudio(id, question.id);
                if (gen !== genRef.current) return;
                url = URL.createObjectURL(blob);
                audioCacheRef.current.set(question.id, url);
            }
            const a = new Audio(url);
            a.onended = () => { if (gen === genRef.current) beginAnswer(gen); };
            a.onerror = () => {
                if (gen !== genRef.current) return;
                // corrupt blob — purge it so Repeat refetches, then speak ONCE
                a.onended = null; a.onerror = null;
                try { URL.revokeObjectURL(url); } catch {}
                audioCacheRef.current.delete(question.id);
                speakFallback(question.text, gen);
            };
            audioRef.current = a;
            try {
                await a.play();   // rejects if blocked by autoplay policy
                return;
            } catch (playErr) {
                a.onended = null; a.onerror = null;   // exactly one fallback path
                if (gen !== genRef.current) return;
            }
        } catch {
            if (gen !== genRef.current) return;
        }
        // 2) browser TTS fallback
        speakFallback(question.text, gen);
    }

    function speakFallback(text, gen) {
        if (!window.speechSynthesis) { beginAnswer(gen); return; }
        try {
            const u = new SpeechSynthesisUtterance(text);
            u.lang = recogLang(); u.rate = 1.03; u.pitch = 1;
            // Watchdog: speechSynthesis sometimes fires neither onend nor onerror
            // (Chrome kills long remote-voice utterances) — open the mic anyway.
            const dog = setTimeout(() => {
                if (gen !== genRef.current || utterRef.current !== u) return;
                try { window.speechSynthesis.cancel(); } catch {}   // stop a zombie utterance
                beginAnswer(gen);
            }, Math.min(30000, 5000 + text.length * 65));
            u.onend = () => { clearTimeout(dog); if (gen === genRef.current && utterRef.current === u) beginAnswer(gen); };
            u.onerror = (e) => {
                clearTimeout(dog);
                if (gen !== genRef.current || utterRef.current !== u) return;
                if (e.error === 'interrupted' || e.error === 'canceled') return;
                beginAnswer(gen);   // real synthesis failure → just open the mic
            };
            utterRef.current = u;
            window.speechSynthesis.speak(u);
        } catch { beginAnswer(gen); }
    }

    async function beginAnswer(gen) {
        if (gen !== genRef.current) return;
        // start the recorder (authoritative answer audio → Whisper)
        if (HAS_RECORDER) {
            try {
                if (!streamRef.current || !streamRef.current.active) {
                    // local first — a stale acquisition must stop its own tracks,
                    // never overwrite the stream a newer question is recording on
                    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
                    if (gen !== genRef.current) { try { s.getTracks().forEach(t => t.stop()); } catch {} return; }
                    streamRef.current = s;
                }
                if (gen !== genRef.current) return;
                chunksRef.current = [];
                const mr = new MediaRecorder(streamRef.current);
                mr.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
                recorderRef.current = mr;
                mr.start(1000);
            } catch (e) {
                if (gen !== genRef.current) return;
                if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) { setPhase('denied'); return; }
                // no usable mic device → live SR may still work below
            }
        }
        if (gen !== genRef.current) return;
        setPhase('recording');
        startPreview(gen);   // live transcript (Chrome/Edge) — preview + fallback
        if (!recorderRef.current && !SR) {
            setErr('No microphone available — switch to text mode to continue.');
        }
    }

    function startPreview(gen) {
        if (!SR) return;
        const r = new SR();
        r.lang = recogLang(); r.continuous = true; r.interimResults = true;
        r.onresult = (e) => {
            if (recogRef.current !== r) return;
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
            if (!HAS_RECORDER && (e.error === 'not-allowed' || e.error === 'service-not-allowed')) { listeningRef.current = false; setPhase('denied'); }
        };
        r.onend = () => { if (listeningRef.current && recogRef.current === r) { try { r.start(); } catch {} } };
        recogRef.current = r;
        listeningRef.current = true;
        try { r.start(); } catch {}
    }

    // Stop the recorder and hand back the captured audio (null if nothing).
    function stopRecording() {
        return new Promise(resolve => {
            const mr = recorderRef.current;
            recorderRef.current = null;
            if (!mr || mr.state === 'inactive') { const c = chunksRef.current; chunksRef.current = []; resolve(c.length ? new Blob(c, { type: mr ? mr.mimeType : 'audio/webm' }) : null); return; }
            mr.onstop = () => {
                const c = chunksRef.current; chunksRef.current = [];
                resolve(c.length ? new Blob(c, { type: mr.mimeType || 'audio/webm' }) : null);
            };
            try { mr.stop(); } catch { resolve(null); }
        });
    }

    // ── render guards ────────────────────────────────────────────────────────

    if (fatal) return <Centered nav={nav} msg={fatal} />;
    if (!usable) return (
        <Centered nav={nav} msg="Your browser doesn't support audio interviews — switching you to text mode…" spinner
                  extra={<button className="btn btn-gold" onClick={() => nav(`/coach/session/${id}?mode=text`)}>Continue in text mode →</button>} />
    );
    if (!questions) return <Centered nav={nav} msg="Loading your interview…" spinner />;
    if (!questions.length) return <Centered nav={nav} msg="No questions found for this session." />;

    const total = questions.length;
    const question = questions[q];
    const preview = (finalText + ' ' + interim).trim();
    const qLen = question.text.length;
    const qSize = qLen > 240 ? 24 : qLen > 160 ? 28 : qLen > 90 ? 33 : 40;

    // ── actions ──────────────────────────────────────────────────────────────

    async function finish() {
        if (busy || phase === 'speaking') return;
        const livePreview = (finalRef.current + ' ' + interim).trim();
        if (recTime < 2 && !livePreview) { setErr("We didn't catch anything yet — answer out loud, or use Skip / text mode."); return; }
        setBusy(true); setErr('');
        const gen = genRef.current;

        // stop the preview, keep its text as fallback; stop + collect the recording
        listeningRef.current = false;
        const r = recogRef.current;
        if (r) { r.onend = null; r.onerror = null; recogRef.current = null; try { r.stop(); } catch {} }
        const blob = await stopRecording();
        if (gen !== genRef.current) return;

        let answer = '';
        if (blob && blob.size > 2000) {
            setPhase('transcribing');
            try { answer = (await transcribeAudio(id, blob)) || ''; }
            catch (e) { console.warn('[coach] transcription failed, using live preview:', e.message); }
        }
        if (gen !== genRef.current) return;
        if (!answer.trim()) answer = livePreview;
        if (!answer.trim()) {
            setErr("We couldn't hear that clearly. Try answering again, or switch to text mode.");
            setBusy(false);
            beginAnswer(gen);   // captured gen — a no-op if the user already left
            return;
        }

        try {
            await submitAnswer(id, question.id, answer.trim());
            if (gen !== genRef.current) return;   // user left while saving — don't touch anything
            if (q >= total - 1) { stopEverything(); nav(`/coach/session/${id}/complete`); return; }
            setQ(q + 1); setBusy(false);
        } catch (e) {
            if (gen !== genRef.current) return;   // never re-open the mic after unmount
            setErr(e.message || 'Could not save your answer.');
            setBusy(false);
            beginAnswer(gen);
        }
    }

    function skip() {
        if (busy) return;
        stopEverything();
        if (q >= total - 1) { nav(`/coach/session/${id}/complete`); return; }
        setQ(q + 1);
    }

    function repeat() {
        if (busy) return;
        askQuestion(question);   // replays (cached) audio, then reopens the mic
    }

    function toText() { stopEverything(); nav(`/coach/session/${id}?mode=text`); }

    const statusLine = phase === 'speaking' ? 'The interviewer is asking…'
        : phase === 'transcribing' ? 'Transcribing your answer…'
        : `Recording ${fmtClock(recTime)} — speak your answer`;

    return (
        <div className="rn-dark vh-shell" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="row ac jsb" style={{ padding: '0 32px', height: 68, borderBottom: '1px solid var(--line)', flex: 'none' }}>
                <div className="row ac gap-10" style={{ minWidth: 0 }}>
                    <div className="av" style={{ width: 34, height: 34, background: '#3a3320', color: 'var(--gold)', fontSize: 14, flex: 'none' }}>{company[0] || 'I'}</div>
                    <div style={{ minWidth: 0 }}><div className="h5" style={{ lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{company}</div><div className="xs">AI audio interview</div></div>
                </div>
                <div className="row ac gap-14" style={{ flex: 'none' }}>
                    <Badge variant="blue" dot>Audio</Badge>
                    <span className="pill" style={{ height: 34 }}><Clock size={13} color="var(--muted)" />{fmtClock(elapsed)}</span>
                    <span className="label">Q{q + 1} / {total}</span>
                    <button className="btn btn-ghost btn-sm" style={{ borderColor: 'var(--rose)', color: 'var(--rose)' }} onClick={() => { stopEverything(); nav(`/coach/session/${id}/complete`); }}>End interview</button>
                </div>
            </div>

            <div className="row jc" style={{ padding: '18px 0 0', flex: 'none' }}><ProgressDots total={total} current={q} /></div>

            {/* scrolls if a long question + transcript exceed the viewport */}
            <div className="fill" style={{ overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <div className="col ac" style={{ textAlign: 'center', padding: '18px 24px', margin: 'auto', width: '100%' }}>
                    <div className="label" style={{ marginBottom: 16 }}>Interviewer asks · Question {q + 1}</div>
                    <h1 style={{ fontFamily: 'var(--rn-serif)', fontWeight: 400, fontSize: qSize, lineHeight: 1.2, letterSpacing: '-0.02em', maxWidth: 780 }}>{renderHi(question.text, question.hint)}</h1>

                    {phase === 'denied' ? (
                        <div className="card" style={{ marginTop: 36, padding: '22px 26px', maxWidth: 560, borderColor: 'var(--rose)', background: 'var(--rose-soft)' }}>
                            <div className="row ac jc gap-10" style={{ marginBottom: 8 }}><MicOff size={16} color="var(--rose)" /><span className="sm" style={{ color: 'var(--rose)', fontWeight: 600 }}>Microphone blocked</span></div>
                            <p className="xs" style={{ marginBottom: 14 }}>Allow microphone access for this site (lock icon in the address bar), then try again — or continue by typing.</p>
                            <div className="row jc gap-10">
                                <button className="btn btn-ghost btn-sm" onClick={() => beginAnswer(genRef.current)}>Try again</button>
                                <button className="btn btn-gold btn-sm" onClick={toText}>Switch to text mode</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="rel" style={{ margin: '34px 0 0' }}><VoiceOrb size={120} state={phase === 'speaking' ? 'speaking' : 'listening'} /></div>
                            <Waveform bars={15} live={phase === 'recording'} height={48} style={{ marginTop: 26 }} />
                            <div className="pill" style={{ marginTop: 22 }}>
                                <span className="dot" style={phase !== 'recording' ? { background: 'var(--blue)' } : undefined} />
                                {statusLine}
                            </div>
                            {preview && (
                                <div className="card-2" style={{ marginTop: 22, padding: '16px 20px', maxWidth: 680, width: '100%', maxHeight: 130, overflowY: 'auto', textAlign: 'left' }}>
                                    <div className="label" style={{ marginBottom: 8 }}>Live transcript · {preview.split(/\s+/).length} words</div>
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
                    <button className="btn btn-gold" style={{ height: 54, padding: '0 26px', fontSize: 15 }} onClick={finish} disabled={busy || phase === 'denied' || phase === 'speaking'}>
                        <Square size={12} fill="var(--on-gold)" stroke="none" />{busy ? (phase === 'transcribing' ? 'Transcribing…' : 'Saving…') : 'Finish answer'}
                    </button>
                    <CBtn title="Repeat the question" onClick={repeat}><RotateCcw size={20} /></CBtn>
                    <CBtn title="Switch to text mode" onClick={toText}><Type size={20} /></CBtn>
                </div>
                <p className="xs tc" style={{ marginTop: 12 }}>Your answer is transcribed securely — only the text is kept for scoring.</p>
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
