import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, Target, ExternalLink, Archive, Check, Trash2, Pencil } from 'lucide-react';
import { Badge } from '../coach/primitives.jsx';
import { saveDraft } from '../coach/api.js';
import { JobFormModal } from './Tracker.jsx';
import { getJob, updateJob, archiveJob, addEvent, updateEvent, deleteEvent, getUser, STAGES, EVENT_LABELS, fmtDue, fmtSalary, safeExternalUrl } from './api.js';
import Celebrate from './Celebrate.jsx';

// One job's CRM record: stage, facts, next action, and the full timeline
// (notes · interview rounds · recruiter contacts · salary · follow-ups).
// The bridges are the moat: practice THIS job's interview, tailor the résumé
// to THIS job's JD — one click each.
const COMPOSER_TYPES = ['note', 'round', 'contact', 'salary', 'followup'];

export default function JobDetail({ nav, id }) {
    const [job, setJob] = useState(null);
    const [events, setEvents] = useState([]);
    const [err, setErr] = useState('');
    const [na, setNa] = useState({ text: '', due: '' });
    const [showEdit, setShowEdit] = useState(false);
    const [celebrate, setCelebrate] = useState(false);
    const naLoadedRef = useRef(false);   // don't clobber in-progress typing on reloads

    const fail = (e) => {
        if (e.status === 401) {
            localStorage.removeItem('rn-auth-token'); localStorage.removeItem('rn-auth-user');
            nav('/tracker'); return;
        }
        setErr(e.message || 'Something went wrong.');
    };

    const reload = useCallback(() => {
        getJob(id).then(r => {
            setJob(r.job); setEvents(r.events); setErr('');
            if (!naLoadedRef.current) {
                naLoadedRef.current = true;
                setNa({ text: r.job.next_action || '', due: r.job.next_action_due ? toLocal(r.job.next_action_due) : '' });
            }
        }).catch(fail);
    }, [id]);
    useEffect(() => { naLoadedRef.current = false; reload(); }, [reload]);

    if (!job && err) return <Shell nav={nav}><p className="lead" style={{ margin: '60px 0 18px' }}>{err}</p><button className="btn btn-outline" onClick={() => nav('/tracker')}>Back to applications</button></Shell>;
    if (!job) return <Shell nav={nav}><p className="sm" style={{ padding: 40 }}>Loading…</p></Shell>;

    const salary = fmtSalary(job);
    const hasJd = !!(job.jd && job.jd.trim().length >= 30);

    function practiceInterview() {
        if (!hasJd) return;
        saveDraft({
            resumeData: loadResumeDraft() || {},
            company: job.company, jobTitle: job.title,
            jobDescription: job.jd, interviewType: 'Behavioral',
            difficulty: 66, mode: 'voice', length: 6,
        });
        nav('/coach/new');
    }
    function tailorResume() {
        if (!hasJd) return;
        try { localStorage.setItem('rn-jd-handoff', job.jd); } catch {}
        nav('/builder?mode=jobmatch');
    }
    function setStage(stage) {
        updateJob(job.id, { stage }).then(() => {
            if (stage === 'offer') setCelebrate(true);
            reload();
        }).catch(fail);
    }
    function saveNextAction() {
        updateJob(job.id, { nextAction: na.text || null, nextActionDue: na.due ? new Date(na.due).toISOString() : null })
            .then(() => { naLoadedRef.current = false; reload(); }).catch(fail);
    }
    function clearNextAction() {
        setNa({ text: '', due: '' });
        updateJob(job.id, { nextAction: null, nextActionDue: null })
            .then(() => { naLoadedRef.current = false; reload(); }).catch(fail);
    }
    function doArchive() {
        if (!window.confirm(`Archive "${job.title}" at ${job.company}? You can find it under the Archived filter.`)) return;
        archiveJob(job.id).then(() => nav('/tracker')).catch(fail);
    }
    function unarchive() {
        updateJob(job.id, { archived: false }).then(reload).catch(fail);
    }
    function removeEvent(ev) {
        if (!window.confirm(`Delete this ${EVENT_LABELS[ev.type]?.toLowerCase() || 'entry'} permanently?`)) return;
        deleteEvent(ev.id).then(reload).catch(fail);
    }

    return (
        <Shell nav={nav}>
            {err && <div className="card" style={{ padding: '12px 16px', marginBottom: 14, borderColor: 'var(--rose)', background: 'var(--rose-soft)' }}><p className="sm" style={{ color: 'var(--rose)' }}>{err}</p></div>}
            {job.archived && (
                <div className="card row ac jsb" style={{ padding: '12px 16px', marginBottom: 14, borderColor: 'var(--amber-line)' }}>
                    <span className="sm amber-t">This job is archived.</span>
                    <button className="btn btn-ghost btn-sm" onClick={unarchive}>Unarchive</button>
                </div>
            )}

            {/* header */}
            <div className="card" style={{ padding: 26, marginBottom: 18 }}>
                <div className="row jsb wrap-f gap-16">
                    <div className="row gap-14" style={{ minWidth: 0 }}>
                        <div className="av" style={{ width: 52, height: 52, fontSize: 22, background: '#3a3320', color: 'var(--gold)', flex: 'none' }}>{(job.company || '?')[0].toUpperCase()}</div>
                        <div style={{ minWidth: 0 }}>
                            <h1 className="h3" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.title}</h1>
                            <div className="sm" style={{ marginTop: 2 }}>
                                {job.company}{job.location ? ` · ${job.location}` : ''}{job.source ? ` · via ${job.source}` : ''}
                            </div>
                            <div className="row ac gap-10 wrap-f" style={{ marginTop: 10 }}>
                                {STAGES.map(s => (
                                    <button key={s.key} className={'chip' + (job.stage === s.key ? ' on' : '')} onClick={() => setStage(s.key)}>{s.label}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="col gap-8" style={{ flex: 'none' }}>
                        <button className="btn btn-gold btn-sm" onClick={practiceInterview} disabled={!hasJd}
                                title={hasJd ? 'Mock interview built from this JD' : 'Add the job description (Edit job) to enable'}>
                            <Mic size={14} />Practice this interview
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={tailorResume} disabled={!hasJd}
                                title={hasJd ? 'Job Match with this JD' : 'Add the job description (Edit job) to enable'}>
                            <Target size={14} />Tailor résumé to this JD
                        </button>
                        <div className="row gap-8">
                            <button className="btn btn-outline btn-sm fill" onClick={() => setShowEdit(true)}><Pencil size={13} />Edit job</button>
                            {safeExternalUrl(job.url) && <a className="btn btn-outline btn-sm" href={safeExternalUrl(job.url)} target="_blank" rel="noopener noreferrer" title="Open posting"><ExternalLink size={13} /></a>}
                            {!job.archived && <button className="btn btn-outline btn-sm" title="Archive" onClick={doArchive}><Archive size={13} /></button>}
                        </div>
                        {!hasJd && <span className="xs" style={{ textAlign: 'right' }}>Add the JD to unlock practice &amp; tailoring</span>}
                    </div>
                </div>
                <div className="row gap-28 wrap-f" style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                    <Fact k="Salary" v={salary || '—'} />
                    <Fact k="Applied" v={job.applied_at ? new Date(job.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'} />
                    <Fact k="Added" v={new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                    <div>
                        <div className="label" style={{ marginBottom: 4 }}>Excitement</div>
                        <div className="row gap-2">
                            {[1, 2, 3, 4, 5].map(n => (
                                <button key={n} onClick={() => updateJob(job.id, { excitement: n }).then(reload).catch(fail)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, padding: '4px 3px', color: n <= (job.excitement || 3) ? 'var(--gold)' : 'var(--ghost)' }}>★</button>
                            ))}
                        </div>
                    </div>
                </div>
                {job.salary_notes && (
                    <p className="sm" style={{ marginTop: 12, color: 'var(--text-2)' }}><span className="label" style={{ marginRight: 8 }}>Salary notes</span>{job.salary_notes}</p>
                )}
            </div>

            {/* TRIGGER: interview stage + JD on file — practice this exact one */}
            {job.stage === 'interviewing' && hasJd && (
                <div className="card-gold row ac jsb wrap-f gap-12" style={{ padding: '16px 20px', marginBottom: 18, borderColor: 'var(--gold-line)' }}>
                    <div style={{ minWidth: 0 }}>
                        <div className="sm" style={{ color: 'var(--gold)', fontWeight: 600 }}>🎤 Interview coming up — practice this exact one.</div>
                        <div className="xs" style={{ marginTop: 2 }}>Your JD and résumé are already loaded. {getUser()?.passType ? 'Included in your pass.' : 'From ₹49 — or free in text mode for your first.'}</div>
                    </div>
                    <button className="btn btn-gold btn-sm none" onClick={practiceInterview}>Practice now →</button>
                </div>
            )}

            {/* next action */}
            <div className="card" style={{ padding: 20, marginBottom: 18 }}>
                <div className="label" style={{ marginBottom: 10 }}>Next action <span className="faint" style={{ textTransform: 'none', letterSpacing: 0 }}>— always know your next move</span></div>
                <div className="row gap-10 wrap-f">
                    <input className="input fill" style={{ minWidth: 200 }} maxLength={255} placeholder="e.g. Email the recruiter about timelines"
                           value={na.text} onChange={(e) => setNa({ ...na, text: e.target.value })} />
                    <input className="input none" type="datetime-local" style={{ width: 210 }} value={na.due} onChange={(e) => setNa({ ...na, due: e.target.value })} />
                    <button className="btn btn-gold btn-sm none" onClick={saveNextAction}>Save</button>
                    {job.next_action && <button className="btn btn-ghost btn-sm none" onClick={clearNextAction}><Check size={14} />Done</button>}
                </div>
            </div>

            {/* timeline */}
            <Composer jobId={job.id} onSaved={reload} onFail={fail} />
            <div className="col gap-10" style={{ marginTop: 14 }}>
                {events.length === 0 && <p className="sm" style={{ padding: '10px 4px' }}>No activity yet — log your first note, round, or recruiter contact above.</p>}
                {events.map(ev => (
                    <div key={ev.id} className="card" style={{ padding: '14px 18px' }}>
                        <div className="row jsb ac gap-10">
                            <div className="row ac gap-10" style={{ minWidth: 0 }}>
                                <Badge variant={ev.type === 'round' ? 'blue' : ev.type === 'offer' ? 'green' : ev.type === 'rejection' ? 'amber' : ev.type === 'followup' || ev.type === 'task' ? 'gold' : 'default'}>
                                    {EVENT_LABELS[ev.type] || ev.type}
                                </Badge>
                                {ev.title && <span className="sm" style={{ color: 'var(--text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</span>}
                                {ev.meta && ev.meta.who && <span className="xs" style={{ flex: 'none' }}>· {ev.meta.who}</span>}
                            </div>
                            <div className="row ac gap-10" style={{ flex: 'none' }}>
                                {ev.due_at && (
                                    <label className="row ac gap-6 xs" style={{ cursor: 'pointer', color: !ev.done && new Date(ev.due_at) < new Date() ? 'var(--rose)' : undefined }}>
                                        <input type="checkbox" checked={!!ev.done} onChange={(e) => updateEvent(ev.id, { done: e.target.checked }).then(reload).catch(fail)} />
                                        {fmtDue(ev.due_at)}
                                    </label>
                                )}
                                <span className="xs">{new Date(ev.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                <button className="btn btn-ghost btn-sm" style={{ width: 36, height: 36, padding: 0 }} title="Delete"
                                        onClick={() => removeEvent(ev)}><Trash2 size={13} /></button>
                            </div>
                        </div>
                        {ev.body && <p className="sm" style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{ev.body}</p>}
                    </div>
                ))}
            </div>

            {showEdit && <JobFormModal initial={job} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); naLoadedRef.current = false; reload(); }} />}
            {celebrate && <Celebrate job={job} onClose={() => setCelebrate(false)} />}
        </Shell>
    );
}

function Composer({ jobId, onSaved, onFail }) {
    const [type, setType] = useState('note');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [who, setWho] = useState('');
    const [due, setDue] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const needsDue = type === 'round' || type === 'followup';
    const hasWho = type === 'round' || type === 'contact';

    async function save() {
        if (!title.trim() && !body.trim()) { setErr('Write something first.'); return; }
        setBusy(true); setErr('');
        try {
            await addEvent(jobId, {
                type, title: title.trim() || null, body: body.trim() || null,
                dueAt: due ? new Date(due).toISOString() : null,
                ...(hasWho && who.trim() ? { meta: { who: who.trim().slice(0, 200) } } : {}),
            });
            setTitle(''); setBody(''); setWho(''); setDue(''); setBusy(false);
            onSaved();
        } catch (e) { setBusy(false); if (e.status === 401 && onFail) onFail(e); else setErr(e.message || 'Could not save.'); }
    }

    return (
        <div className="card-2" style={{ padding: 18 }}>
            <div className="row gap-8 wrap-f" style={{ marginBottom: 12 }}>
                {COMPOSER_TYPES.map(t => (
                    <button key={t} className={'chip' + (type === t ? ' on' : '')} onClick={() => setType(t)}>{EVENT_LABELS[t]}</button>
                ))}
            </div>
            <div className="row gap-10 wrap-f" style={{ marginBottom: 10 }}>
                <input className="input fill" style={{ minWidth: 200 }} maxLength={255}
                       placeholder={type === 'round' ? 'e.g. Technical round 2 with the hiring manager' : type === 'contact' ? 'e.g. Call with the recruiter' : type === 'salary' ? 'e.g. They opened at 28 LPA' : type === 'followup' ? 'e.g. Nudge on application status' : 'Title (optional)'}
                       value={title} onChange={(e) => setTitle(e.target.value)} />
                {hasWho && <input className="input none" style={{ width: 220 }} maxLength={200} placeholder="Who? (name · email)" value={who} onChange={(e) => setWho(e.target.value)} />}
                {(needsDue || due) && <input className="input none" type="datetime-local" style={{ width: 210 }} value={due} onChange={(e) => setDue(e.target.value)} />}
            </div>
            <textarea className="textarea" style={{ minHeight: 64 }} placeholder="Details, names, numbers — future-you will thank you."
                      value={body} onChange={(e) => setBody(e.target.value)} />
            {err && <p className="sm" style={{ color: 'var(--rose)', marginTop: 8 }}>{err}</p>}
            <div className="row jsb ac" style={{ marginTop: 10 }}>
                <span className="xs">{needsDue ? 'Add a date and it shows up in your daily agenda.' : ''}</span>
                <button className="btn btn-gold btn-sm" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Log it'}</button>
            </div>
        </div>
    );
}

function Fact({ k, v }) {
    return <div><div className="label" style={{ marginBottom: 4 }}>{k}</div><div className="sm" style={{ color: 'var(--text)' }}>{v}</div></div>;
}
function Shell({ nav, children }) {
    return (
        <div className="rn-dark" style={{ minHeight: '100vh' }}>
            <div className="row ac jsb no-print" style={{ height: 68, borderBottom: '1px solid var(--line)', padding: '0 32px' }}>
                <div className="row ac gap-16">
                    <button className="btn btn-ghost btn-sm" style={{ width: 36, padding: 0 }} onClick={() => nav('/tracker')}>←</button>
                    <a href="/" className="brand" onClick={(e) => { e.preventDefault(); nav('/'); }} style={{ cursor: 'pointer' }}><div className="mark">R</div><div className="wm">Re<b>nonym</b></div></a>
                </div>
                <div className="row ac gap-14">
                    <a href="/tracker" className="sm muted" onClick={(e) => { e.preventDefault(); nav('/tracker'); }}>Applications</a>
                    <a href="/dashboard" className="sm muted" onClick={(e) => { e.preventDefault(); nav('/dashboard'); }}>Dashboard</a>
                </div>
            </div>
            <div style={{ maxWidth: 880, margin: '0 auto', padding: '28px 20px 80px' }}>{children}</div>
        </div>
    );
}
function toLocal(iso) {
    try {
        const d = new Date(iso);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch { return ''; }
}
function loadResumeDraft() {
    try { const d = JSON.parse(localStorage.getItem('rb-draft') || 'null'); return d && d.fullName ? d : null; } catch { return null; }
}
