import React, { useState, useEffect, useRef } from 'react';
import { Upload, MessageSquare, FileText, Check } from 'lucide-react';
import { VoiceOrb, Badge } from './primitives.jsx';
import { saveDraft, loadDraft, clearDraft, coachMe, createSession, parseResumeFile, getUser, getToken } from './api.js';

function loadSavedResume() {
    try { const d = JSON.parse(localStorage.getItem('rb-draft') || '{}'); return d && d.fullName ? d : null; } catch { return null; }
}

// S5 — Interview Setup (recreated from designs/screens/05-interview-setup.html).
// Restores the in-flight draft so going back from checkout keeps the form.
const TYPES   = ['Behavioral', 'Technical', 'Mixed', 'System design', 'Case'];
const LENGTHS = [{ q: 5, label: '5 Q' }, { q: 6, label: '6 Q · ~15 min' }, { q: 10, label: '10 Q' }];

export default function InterviewSetup({ nav }) {
    const [draft] = useState(loadDraft);   // sessionStorage — survives checkout round-trip
    const [company, setCompany] = useState(draft?.company || '');
    const [title, setTitle]     = useState(draft?.jobTitle || '');
    const [jd, setJd]           = useState(draft?.jobDescription || '');
    const [type, setType]       = useState(TYPES.includes(draft?.interviewType) ? draft.interviewType : 'Behavioral');
    const [length, setLength]   = useState([5, 6, 10].includes(draft?.length) ? draft.length : 6);
    const [mode, setMode]       = useState(draft?.mode === 'text' ? 'text' : 'voice');
    const [difficulty, setDifficulty] = useState([35, 66, 90].includes(draft?.difficulty) ? draft.difficulty : 66);
    const [busy, setBusy]       = useState(false);
    const [err, setErr]         = useState('');
    const [resume, setResume]   = useState(loadSavedResume);   // user's actual résumé (saved or uploaded)
    const [resumeBusy, setResumeBusy] = useState(false);
    const [access, setAccess]   = useState(null);   // { unlimited, passes, has } — entitled users see no pay UI
    const fileRef = useRef(null);
    const user = getUser();

    useEffect(() => {
        if (!getToken()) return;
        let alive = true;
        coachMe().then(me => { if (alive) setAccess(me); }).catch(() => {});
        return () => { alive = false; };
    }, []);

    async function onResumeFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setResumeBusy(true); setErr('');
        try {
            const data = await parseResumeFile(file);
            setResume(data);
            try { localStorage.setItem('rb-draft', JSON.stringify(data)); } catch {}
        } catch (ex) {
            setErr(ex.message || 'Could not read that résumé. Try a PDF, DOCX, or TXT.');
        } finally {
            setResumeBusy(false);
            if (e.target) e.target.value = '';
        }
    }

    const lenLabel = LENGTHS.find(l => l.q === length)?.label || `${length} Q`;
    const estMin   = length <= 5 ? '~12 min' : length <= 6 ? '~15 min' : '~24 min';

    async function handleContinue() {
        if (jd.trim().length < 30) { setErr('Add a job description (at least 30 characters) so we can tailor the interview.'); return; }
        setBusy(true); setErr('');
        const cfg = { resumeData: resume || {}, company, jobTitle: title, jobDescription: jd, interviewType: type, difficulty, mode, length };
        saveDraft(cfg);

        // Check entitlement separately from session creation so a creation error
        // never bounces an already-paid user back to checkout. Only a definitive
        // 401/402 routes to payment — a network blip or 500 must NOT charge a
        // paying user twice, so those show a retry error instead.
        let entitled = false;
        try {
            const me = await coachMe();
            // the one free TEXT interview counts — backend enforces it independently
            entitled = !!(me && (me.has || (mode === 'text' && me.freeInterviewAvailable && !me.passType)));
        }
        catch (e) {
            if (e.status === 401 || e.status === 402) { setBusy(false); nav('/coach/checkout'); return; }
            setErr('Could not verify your access — check your connection and try again.');
            setBusy(false); return;
        }

        if (!entitled) { setBusy(false); nav('/coach/checkout'); return; }

        try {
            const s = await createSession(cfg);
            clearAndGo(s.id);
        } catch (e) {
            setErr(e.message || 'Could not start the interview. Please try again.');
            setBusy(false);
        }
    }
    function clearAndGo(id) {
        clearDraft();   // session created — a stale draft must not resurface later
        nav(`/coach/session/${id}` + (mode === 'text' ? '?mode=text' : ''));
    }
    function saveAndExit(e) {
        e.preventDefault();
        saveDraft({ resumeData: resume || {}, company, jobTitle: title, jobDescription: jd, interviewType: type, difficulty, mode, length });
        nav('/');
    }

    return (
        <div className="rn-dark" style={{ minHeight: '100vh' }}>
            {/* top bar */}
            <div className="row ac jsb" style={{ height: 68, borderBottom: '1px solid var(--line)', padding: '0 36px' }}>
                <div className="row ac gap-16">
                    <button className="btn btn-ghost btn-sm" style={{ width: 36, padding: 0 }} onClick={() => nav('/coach')}>←</button>
                    <a href="/" className="brand" onClick={(e) => { e.preventDefault(); nav('/'); }} style={{ cursor: 'pointer' }}><div className="mark">R</div><div className="wm">Re<b>nonym</b></div></a>
                </div>
                <div className="row ac gap-14">
                    <a href="/dashboard" className="sm muted none" onClick={(e) => { e.preventDefault(); nav('/dashboard'); }}>Dashboard</a>
                    <a href="/builder" className="sm muted none" onClick={(e) => { e.preventDefault(); nav('/builder'); }}>Résumé Studio</a>
                    {user && (
                        <span className="row ac gap-8" title={user.email}>
                            <span className="av" style={{ width: 26, height: 26, fontSize: 11, background: '#3a3320', color: 'var(--gold)' }}>{(user.name || user.email || 'U')[0].toUpperCase()}</span>
                            <span className="sm" style={{ color: 'var(--text-2)' }}>{(user.name || '').split(' ')[0] || 'You'}</span>
                            {access?.unlimited && <Badge variant="gold">Unlimited</Badge>}
                        </span>
                    )}
                    <a href="/" className="sm faint" onClick={saveAndExit}>Save &amp; exit</a>
                </div>
            </div>

            <div className="grid rn-split" style={{ gridTemplateColumns: '1fr 392px', minHeight: 'calc(100vh - 68px)' }}>
                {/* FORM */}
                <div style={{ padding: '48px 64px', maxWidth: 760 }}>
                    {/* stepper */}
                    <div className="row ac gap-10" style={{ marginBottom: 40 }}>
                        <div className="row ac gap-10"><Step n="1" on label="Set up" /></div>
                        <div style={{ width: 36, height: 1, background: 'var(--line-3)' }} />
                        <Step n="2" label={access?.has ? 'Interview' : 'Checkout'} />
                        <div style={{ width: 36, height: 1, background: 'var(--line-3)' }} />
                        <Step n="3" label={access?.has ? 'Report' : 'Interview'} />
                    </div>

                    <h1 className="h2" style={{ marginBottom: 8 }}>Set up your interview</h1>
                    <p className="body-t" style={{ marginBottom: 40 }}>We'll generate questions from your résumé and this exact role.</p>

                    {/* résumé */}
                    <div style={{ marginBottom: 34 }}>
                        <div className="input-lbl" style={{ marginBottom: 14 }}>Your résumé <span className="faint">(optional — sharpens the questions)</span></div>
                        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" hidden onChange={onResumeFile} />
                        {resume && resume.fullName ? (
                            <div className="row ac gap-14" style={{ border: '1px solid var(--gold-line)', background: 'var(--gold-soft)', borderRadius: 'var(--r-m)', padding: '16px 18px', marginBottom: 12 }}>
                                <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--gold)', display: 'grid', placeItems: 'center', flex: 'none' }}><Check size={12} color="var(--on-gold)" /></span>
                                <div className="fill"><div className="sm" style={{ color: 'var(--text)', fontWeight: 600 }}>{resume.fullName}{resume.title ? ` · ${resume.title}` : ''}</div><div className="xs">Using this résumé to tailor your interview</div></div>
                                <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={resumeBusy}>Replace</button>
                            </div>
                        ) : (
                            <button className="row ac gap-18" onClick={() => fileRef.current?.click()} disabled={resumeBusy}
                                    style={{ width: '100%', textAlign: 'left', border: '1.5px dashed var(--line-3)', background: 'transparent', borderRadius: 'var(--r-l)', padding: 26, cursor: 'pointer' }}>
                                <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--surface-3)', display: 'grid', placeItems: 'center', color: 'var(--gold)', flex: 'none' }}>{resumeBusy ? <Upload size={18} className="orb" /> : <Upload size={18} />}</div>
                                <div className="fill"><div className="sm" style={{ color: 'var(--text-2)', fontWeight: 600 }}>{resumeBusy ? 'Reading your résumé…' : 'Upload your résumé'}</div><div className="xs">PDF, DOCX or TXT · up to 5 MB. Or skip — we'll tailor from the role.</div></div>
                                <span className="btn btn-ghost btn-sm none">Browse</span>
                            </button>
                        )}
                    </div>

                    {/* role */}
                    <div style={{ marginBottom: 34 }}>
                        <div className="grid gap-16" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="field"><label className="input-lbl">Company</label><input className="input" maxLength={255} placeholder="e.g. Infosys" value={company} onChange={(e) => setCompany(e.target.value)} /></div>
                            <div className="field"><label className="input-lbl">Job title</label><input className="input" maxLength={255} placeholder="e.g. Senior Salesforce Developer" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                        </div>
                    </div>
                    <div style={{ marginBottom: 34 }}>
                        <label className="input-lbl" style={{ display: 'block', marginBottom: 8 }}>Job description</label>
                        <textarea className="textarea" style={{ minHeight: 130 }} value={jd} onChange={(e) => setJd(e.target.value)} />
                        <div className="xs" style={{ marginTop: 10 }}>Paste the full job description — the AI builds questions from it.</div>
                    </div>

                    {/* type */}
                    <div style={{ marginBottom: 34 }}>
                        <div className="input-lbl" style={{ marginBottom: 14 }}>Interview type</div>
                        <div className="row gap-10 wrap-f">
                            {TYPES.map(t => (
                                <button key={t} className={'chip' + (type === t ? ' on' : '')} onClick={() => setType(t)}>{t}</button>
                            ))}
                        </div>
                    </div>

                    {/* difficulty + length */}
                    <div style={{ marginBottom: 34 }}>
                        <div className="row gap-32">
                            <div style={{ flex: 1 }}>
                                <div className="input-lbl" style={{ marginBottom: 14 }}>Difficulty</div>
                                <div className="row gap-10">
                                    {[[35, 'Warm-up'], [66, 'Realistic'], [90, 'Brutal']].map(([v, l]) => (
                                        <button key={v} className={'chip' + (difficulty === v ? ' on' : '')} onClick={() => setDifficulty(v)}>{l}</button>
                                    ))}
                                </div>
                                <div className="meter" style={{ height: 6, marginTop: 12 }}><span style={{ width: difficulty + '%' }} /></div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="input-lbl" style={{ marginBottom: 14 }}>Length</div>
                                <div className="row gap-10">
                                    {LENGTHS.map(l => (
                                        <button key={l.q} className={'chip' + (length === l.q ? ' on' : '')} onClick={() => setLength(l.q)}>{l.label}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* mode */}
                    <div style={{ marginBottom: 34 }}>
                        <div className="input-lbl" style={{ marginBottom: 14 }}>Interview mode</div>
                        <div className="grid gap-12" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <ModeCard on={mode === 'voice'} onClick={() => setMode('voice')}
                                      icon={<VoiceOrb size={36} state="idle" />} title="Audio"
                                      desc={access && !access.has ? 'Needs a pass or Single Interview (₹499) — your free interview is text' : 'The AI interviewer speaks — you answer out loud'} />
                            <ModeCard on={mode === 'text'} onClick={() => setMode('text')}
                                      icon={<div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-3)', display: 'grid', placeItems: 'center', color: 'var(--blue)' }}><MessageSquare size={18} /></div>}
                                      title="Text" desc="Read each question and type your answers" />
                        </div>
                    </div>
                </div>

                {/* SUMMARY */}
                <aside style={{ borderLeft: '1px solid var(--line)', background: 'var(--bg-1)', padding: '40px 36px' }}>
                    <div style={{ position: 'sticky', top: 40 }}>
                        <div className="label" style={{ marginBottom: 18 }}>Session summary</div>
                        <div className="card" style={{ padding: 22, marginBottom: 20 }}>
                            <div className="h4" style={{ marginBottom: 4 }}>{[title, company].filter(Boolean).join(' · ') || 'Your interview'}</div>
                            <div className="xs" style={{ marginBottom: 18 }}>{type} · {difficulty >= 80 ? 'Brutal' : difficulty >= 50 ? 'Realistic' : 'Warm-up'} · {(access && !access.has && access.freeInterviewAvailable && !access.passType && mode === 'text') ? '5 questions (free)' : `${length} questions`}</div>
                            <div className="col gap-12">
                                <Row k="Mode" v={mode === 'voice' ? 'Audio' : 'Text'} />
                                <Row k="Est. length" v={estMin} />
                                <Row k="Résumé" v={resume?.fullName ? resume.fullName : 'From the role'} />
                                <Row k="Report" v="Full scored" />
                            </div>
                        </div>
                        {access?.has ? (
                            <div className="card-gold" style={{ padding: '18px 20px', marginBottom: 20 }}>
                                <div className="row ac jsb"><Badge variant="gold" dot>{
                                    access.passType === 'season' ? 'Season Pass'
                                    : access.passType === 'placement_pro' ? 'Placement Pro'
                                    : access.unlimited ? 'Coach Unlimited'
                                    : access.interviewCredits > 0 ? 'Single Interview' : 'Session Pass'
                                }</Badge><Check size={16} color="var(--green)" /></div>
                                <p className="sm" style={{ marginTop: 10, color: 'var(--text-2)' }}>
                                    {access.passType
                                        ? `Your pass is active — ${access.passInterviewsRemaining} interview${access.passInterviewsRemaining === 1 ? '' : 's'} left. This one is included.`
                                        : access.unlimited
                                            ? 'Your plan is active — this interview is included. No payment needed.'
                                            : access.interviewCredits > 0
                                                ? `You have ${access.interviewCredits} interview${access.interviewCredits > 1 ? 's' : ''} ready — this uses one.`
                                                : `You have ${access.passes} session pass${access.passes > 1 ? 'es' : ''} — this interview uses one.`}
                                </p>
                            </div>
                        ) : (getToken() && access === null) ? null : (access && access.freeInterviewAvailable && !access.passType && mode === 'text') ? (
                            <div className="card-gold" style={{ padding: '18px 20px', marginBottom: 20, borderColor: 'var(--green-line)' }}>
                                <div className="row ac jsb"><Badge variant="green" dot>Included</Badge><span className="sm green-t" style={{ fontWeight: 600 }}>First interview FREE</span></div>
                                <p className="sm" style={{ marginTop: 10, color: 'var(--text-2)' }}>Your first text interview is on us — 5 questions, real scoring, partial report (full report ₹299 or included with a pass).</p>
                            </div>
                        ) : (
                            <div className="card-gold" style={{ padding: '18px 20px', marginBottom: 20 }}>
                                {access && access.freeInterviewAvailable && !access.passType && (
                                    <p className="xs" style={{ marginBottom: 10, color: 'var(--green)' }}>Tip: switch to Text mode and your first interview is free.</p>
                                )}
                                <div className="row ac jsb"><Badge variant="gold" dot>Premium</Badge><span className="sm gold" style={{ fontWeight: 600 }}>Single Interview</span></div>
                                <div className="row ae gap-6" style={{ marginTop: 12 }}><span className="h2" style={{ fontSize: 34 }}>₹499</span><span className="xs" style={{ paddingBottom: 8 }}>one interview + full report</span></div>
                                <p className="xs" style={{ marginTop: 8 }}>Or 6 interviews + unlimited AI with the Season Pass — ₹1,499 / 90 days.</p>
                            </div>
                        )}
                        <button className="btn btn-gold btn-lg btn-block" onClick={handleContinue} disabled={busy}>
                            {busy ? 'Preparing…' : access?.has ? 'Start interview →' : (access?.freeInterviewAvailable && !access?.passType && mode === 'text') ? 'Start your free interview →' : (getToken() && access === null) ? 'Continue →' : 'Continue to checkout →'}
                        </button>
                        {err && <div className="card" style={{ marginTop: 12, padding: '12px 14px', borderColor: 'var(--rose)', background: 'var(--rose-soft)' }}><p className="sm" style={{ color: 'var(--rose)' }}>{err}</p></div>}
                        {!access?.has && <p className="xs tc" style={{ marginTop: 14 }}>You won't be charged until the next step.</p>}
                    </div>
                </aside>
            </div>
        </div>
    );
}

function Step({ n, on, label }) {
    return (
        <div className="row ac gap-10">
            <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600, fontFamily: 'var(--rn-mono)', background: on ? 'var(--gold)' : 'var(--surface-3)', color: on ? 'var(--on-gold)' : 'var(--muted)' }}>{n}</div>
            <span className="sm" style={on ? { color: 'var(--text)', fontWeight: 600 } : undefined}>{label}</span>
        </div>
    );
}
function ModeCard({ on, onClick, icon, title, desc }) {
    return (
        <button onClick={onClick} className="card" style={{ borderColor: on ? 'var(--gold-line)' : 'var(--line-2)', background: on ? 'var(--gold-soft)' : 'var(--surface)', borderRadius: 'var(--r-l)', padding: 22, cursor: 'pointer', textAlign: 'left' }}>
            <div className="row ac jsb">
                <div className="row ac gap-12">{icon}<div><div className="h5">{title}</div><div className="xs" style={{ marginTop: 2 }}>{desc}</div></div></div>
                <span style={{ width: 18, height: 18, borderRadius: '50%', flex: 'none', border: '2px solid ' + (on ? 'var(--gold)' : 'var(--line-3)'), background: on ? 'radial-gradient(circle,var(--gold) 0 5px,transparent 6px)' : 'transparent' }} />
            </div>
        </button>
    );
}
function Row({ k, v }) {
    return <div className="row jsb sm"><span className="faint">{k}</span><span style={{ color: 'var(--text)' }}>{v}</span></div>;
}
