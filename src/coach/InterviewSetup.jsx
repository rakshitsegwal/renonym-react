import React, { useState } from 'react';
import { Upload, MessageSquare } from 'lucide-react';
import { VoiceOrb, Badge } from './primitives.jsx';
import { saveDraft, coachMe, createSession } from './api.js';

// S5 — Interview Setup (recreated from designs/screens/05-interview-setup.html)
// Phase-3 mock: interactive config; "Continue to checkout" routes to /coach/checkout.
const TYPES   = ['Behavioral', 'Technical', 'Mixed', 'System design', 'Case'];
const LENGTHS = [{ q: 5, label: '5 Q' }, { q: 6, label: '6 Q · ~15 min' }, { q: 10, label: '10 Q' }];

export default function InterviewSetup({ nav }) {
    const [company, setCompany] = useState('Stripe');
    const [title, setTitle]     = useState('Senior Product Manager');
    const [jd, setJd]           = useState("You'll own the roadmap for our payments platform, partnering with engineering and design to ship 0→1 products. 6+ years in product, experience with payments or fintech preferred…");
    const [type, setType]       = useState('Behavioral');
    const [length, setLength]   = useState(6);
    const [mode, setMode]       = useState('voice');
    const [difficulty]          = useState(66);
    const [busy, setBusy]       = useState(false);
    const [err, setErr]         = useState('');

    const lenLabel = LENGTHS.find(l => l.q === length)?.label || `${length} Q`;
    const estMin   = length <= 5 ? '~12 min' : length <= 6 ? '~15 min' : '~24 min';

    async function handleContinue() {
        if (jd.trim().length < 30) { setErr('Add a job description (at least 30 characters) so we can tailor the interview.'); return; }
        setBusy(true); setErr('');
        let resumeData = {};
        try { resumeData = JSON.parse(localStorage.getItem('rb-draft') || '{}'); } catch {}
        const cfg = { resumeData, company, jobTitle: title, jobDescription: jd, interviewType: type, difficulty, mode, length };
        saveDraft(cfg);

        // Check entitlement separately from session creation so a creation error
        // never bounces an already-paid user back to checkout.
        let entitled = false;
        try { const me = await coachMe(); entitled = !!(me && me.has); }
        catch (e) { entitled = false; }   // 401 not-signed-in / 402 no entitlement → pay first

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
        nav(`/coach/session/${id}` + (mode === 'text' ? '?mode=text' : ''));
    }

    return (
        <div className="rn-dark" style={{ minHeight: '100vh' }}>
            {/* top bar */}
            <div className="row ac jsb" style={{ height: 68, borderBottom: '1px solid var(--line)', padding: '0 36px' }}>
                <div className="row ac gap-16">
                    <button className="btn btn-ghost btn-sm" style={{ width: 36, padding: 0 }} onClick={() => nav('/coach')}>←</button>
                    <div className="brand"><div className="mark">R</div><div className="wm">Re<b>nonym</b></div></div>
                </div>
                <div className="row ac gap-12"><Badge variant="gold" dot>New interview</Badge><a href="/" className="sm faint" onClick={(e) => { e.preventDefault(); nav('/'); }}>Save &amp; exit</a></div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 392px', minHeight: 'calc(100vh - 68px)' }}>
                {/* FORM */}
                <div style={{ padding: '48px 64px', maxWidth: 760 }}>
                    {/* stepper */}
                    <div className="row ac gap-10" style={{ marginBottom: 40 }}>
                        <div className="row ac gap-10"><Step n="1" on label="Set up" /></div>
                        <div style={{ width: 36, height: 1, background: 'var(--line-3)' }} />
                        <Step n="2" label="Checkout" />
                        <div style={{ width: 36, height: 1, background: 'var(--line-3)' }} />
                        <Step n="3" label="Interview" />
                    </div>

                    <h1 className="h2" style={{ marginBottom: 8 }}>Set up your interview</h1>
                    <p className="body-t" style={{ marginBottom: 40 }}>We'll generate questions from your résumé and this exact role.</p>

                    {/* résumé */}
                    <div style={{ marginBottom: 34 }}>
                        <div className="input-lbl" style={{ marginBottom: 14 }}>Your résumé</div>
                        <div className="row ac gap-14" style={{ border: '1px solid var(--gold-line)', background: 'var(--gold-soft)', borderRadius: 'var(--r-m)', padding: '16px 18px', marginBottom: 12 }}>
                            <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--gold)', background: 'radial-gradient(circle,var(--gold) 0 5px,transparent 6px)', flex: 'none' }} />
                            <div style={{ width: 34, height: 42, borderRadius: 5, background: '#F3F1EB', flex: 'none' }} />
                            <div className="fill"><div className="sm" style={{ color: 'var(--text)', fontWeight: 600 }}>Maya_Chen_PM.pdf</div><div className="xs">Saved résumé · tailored to Stripe</div></div>
                            <Badge variant="green">ATS 94</Badge>
                        </div>
                        <div className="row ac gap-18" style={{ border: '1.5px dashed var(--line-3)', borderRadius: 'var(--r-l)', padding: 26 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--surface-3)', display: 'grid', placeItems: 'center', color: 'var(--gold)', flex: 'none' }}><Upload size={18} /></div>
                            <div className="fill"><div className="sm" style={{ color: 'var(--text-2)', fontWeight: 600 }}>Upload a different résumé</div><div className="xs">PDF or DOCX, up to 5MB</div></div>
                            <button className="btn btn-ghost btn-sm">Browse</button>
                        </div>
                    </div>

                    {/* role */}
                    <div style={{ marginBottom: 34 }}>
                        <div className="grid gap-16" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="field"><label className="input-lbl">Company</label><input className="input" value={company} onChange={(e) => setCompany(e.target.value)} /></div>
                            <div className="field"><label className="input-lbl">Job title</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                        </div>
                    </div>
                    <div style={{ marginBottom: 34 }}>
                        <label className="input-lbl" style={{ display: 'block', marginBottom: 8 }}>Job description</label>
                        <textarea className="textarea" style={{ minHeight: 130 }} value={jd} onChange={(e) => setJd(e.target.value)} />
                        <div className="row ac gap-8" style={{ marginTop: 12 }}><Badge variant="gold">✦ Detected: Payments</Badge><Badge>Senior · IC</Badge><Badge>0→1</Badge></div>
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
                                <div className="meter" style={{ height: 8, marginBottom: 10 }}><span style={{ width: difficulty + '%' }} /></div>
                                <div className="row jsb xs"><span>Warm-up</span><span className="gold">Realistic</span><span>Brutal</span></div>
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
                                      icon={<VoiceOrb size={36} state="idle" />} title="Voice" desc="Speak your answers" />
                            <ModeCard on={mode === 'text'} onClick={() => setMode('text')}
                                      icon={<div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-3)', display: 'grid', placeItems: 'center', color: 'var(--blue)' }}><MessageSquare size={18} /></div>}
                                      title="Text" desc="Type your answers" />
                        </div>
                    </div>
                </div>

                {/* SUMMARY */}
                <aside style={{ borderLeft: '1px solid var(--line)', background: 'var(--bg-1)', padding: '40px 36px' }}>
                    <div style={{ position: 'sticky', top: 40 }}>
                        <div className="label" style={{ marginBottom: 18 }}>Session summary</div>
                        <div className="card" style={{ padding: 22, marginBottom: 20 }}>
                            <div className="h4" style={{ marginBottom: 4 }}>{title.split(' ').slice(-1)[0] === 'Manager' ? 'Senior PM' : title} · {company}</div>
                            <div className="xs" style={{ marginBottom: 18 }}>{type} · Realistic · {length} questions</div>
                            <div className="col gap-12">
                                <Row k="Mode" v={mode === 'voice' ? 'Voice' : 'Text'} />
                                <Row k="Est. length" v={estMin} />
                                <Row k="Résumé" v="Maya_Chen_PM" />
                                <Row k="Report" v="Full scored" />
                            </div>
                        </div>
                        <div className="card-gold" style={{ padding: '18px 20px', marginBottom: 20 }}>
                            <div className="row ac jsb"><Badge variant="gold" dot>Premium</Badge><span className="sm gold" style={{ fontWeight: 600 }}>Session Pass</span></div>
                            <div className="row ae gap-6" style={{ marginTop: 12 }}><span className="h2" style={{ fontSize: 34 }}>₹599</span><span className="xs" style={{ paddingBottom: 8 }}>one interview + report</span></div>
                            <p className="xs" style={{ marginTop: 8 }}>Or unlock unlimited with Coach Unlimited at ₹1,599/mo.</p>
                        </div>
                        <button className="btn btn-gold btn-lg btn-block" onClick={handleContinue} disabled={busy}>{busy ? 'Preparing…' : 'Continue to checkout →'}</button>
                        {err && <div className="card" style={{ marginTop: 12, padding: '12px 14px', borderColor: 'var(--rose)', background: 'var(--rose-soft)' }}><p className="sm" style={{ color: 'var(--rose)' }}>{err}</p></div>}
                        <p className="xs tc" style={{ marginTop: 14 }}>You won't be charged until the next step.</p>
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
