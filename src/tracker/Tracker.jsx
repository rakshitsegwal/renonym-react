import React, { useState, useEffect, useCallback } from 'react';
import { Plus, LayoutGrid, Mic, FileText, History, Briefcase, Search, Check, X } from 'lucide-react';
import { Badge } from '../coach/primitives.jsx';
import { saveDraft } from '../coach/api.js';
import { listJobs, createJob, updateJob, updateEvent, addEvent, getJob, getAgenda, getInsights, getUser, getToken, STAGES, daysAgo, fmtDue } from './api.js';

// Application Tracker — the job-search CRM home. Not a spreadsheet: the screen
// opens on TODAY (what needs doing), then momentum, then the pipeline board.
export default function Tracker({ nav }) {
    const [jobs, setJobs] = useState(null);
    const [agenda, setAgenda] = useState(null);
    const [insights, setInsights] = useState(null);
    const [query, setQuery] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [err, setErr] = useState('');
    const [, force] = useState(0);   // re-render after 401 sign-out
    const user = getUser();

    function handle401() {
        // expired session: clear it and fall through to the sign-in gate below
        localStorage.removeItem('rn-auth-token');
        localStorage.removeItem('rn-auth-user');
        force(n => n + 1);
    }

    const reload = useCallback(() => {
        listJobs(showArchived ? { archived: 'true' } : {})
            .then(r => { setJobs(r.jobs); setErr(''); })
            .catch(e => { if (e.status === 401) handle401(); else setErr(e.message); });
        getAgenda().then(setAgenda).catch(() => {});
        getInsights().then(setInsights).catch(() => {});
    }, [showArchived]);
    useEffect(() => { if (getToken()) reload(); }, [reload]);

    if (!getToken()) {
        return (
            <div className="rn-dark" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 20 }}>
                <div>
                    <span className="eyebrow">Application Tracker</span>
                    <h1 className="h1" style={{ margin: '12px 0 8px' }}>Every job, one pipeline.</h1>
                    <p className="lead" style={{ marginBottom: 24, maxWidth: '44ch' }}>Sign in to track applications, recruiters, salaries and follow-ups — wired straight into your résumé and interview prep.</p>
                    <button className="btn btn-gold btn-lg" onClick={() => { try { localStorage.setItem('rn-return-to', '/tracker'); } catch {} nav('/'); }}>Sign in to start</button>
                </div>
            </div>
        );
    }

    async function moveStage(job, stage) {
        try { await updateJob(job.id, { stage }); reload(); }
        catch (e) { if (e.status === 401) handle401(); else setErr(e.message || 'Could not move the job.'); }
    }
    async function completeItem(item) {
        try {
            if (item.kind === 'event') { await updateEvent(item.id, { done: true }); reload(); }
            else {
                await updateJob(item.job_id, { nextAction: null, nextActionDue: null });
                nav(`/tracker/job/${item.job_id}`);   // close the loop: set the NEXT step right away
            }
        } catch (e) { if (e.status === 401) handle401(); else setErr(e.message || 'Could not update.'); }
    }
    async function scheduleFollowUp(s) {
        try {
            const due = new Date(); due.setDate(due.getDate() + 1); due.setHours(10, 0, 0, 0);
            await addEvent(s.job_id, { type: 'followup', title: `Follow up with ${s.company}`, dueAt: due.toISOString() });
            reload();
        } catch (e) { setErr(e.message || 'Could not schedule.'); }
    }
    async function practiceRound(item) {
        try {
            const { job } = await getJob(item.job_id);
            saveDraft({ resumeData: loadResumeDraft() || {}, company: job.company, jobTitle: job.title, jobDescription: job.jd || '', interviewType: 'Behavioral', difficulty: 66, mode: 'voice', length: 6 });
            nav('/coach/new');
        } catch (e) { setErr(e.message || 'Could not open the coach.'); }
    }

    const q = query.trim().toLowerCase();
    const shown = (jobs || []).filter(j => !q || `${j.company} ${j.title}`.toLowerCase().includes(q));

    // bucket in the BROWSER's timezone — the server is UTC, the user isn't
    const all = agenda ? [...agenda.overdue, ...agenda.today, ...agenda.upcoming].map(i => ({ ...i, kind: i.kind || 'event' })) : [];
    const todayStr = new Date().toDateString();
    const agendaItems = [
        ...all.filter(i => new Date(i.due_at) < new Date() && new Date(i.due_at).toDateString() !== todayStr).map(i => ({ ...i, bucket: 'overdue' })),
        ...all.filter(i => new Date(i.due_at).toDateString() === todayStr).map(i => ({ ...i, bucket: 'today' })),
        ...all.filter(i => new Date(i.due_at) > new Date() && new Date(i.due_at).toDateString() !== todayStr).slice(0, 4).map(i => ({ ...i, bucket: 'upcoming' })),
    ];

    return (
        <div className="rn-dark appshell">
            <aside className="sidebar">
                <div className="brand" style={{ padding: '6px 8px 18px' }}><div className="mark">R</div><div className="wm">Re<b>nonym</b></div></div>
                <button className="btn btn-gold btn-block" style={{ marginBottom: 16 }} onClick={() => setShowAdd(true)}><Plus size={16} />Add a job</button>
                <a className="navitem" onClick={() => nav('/dashboard')}><LayoutGrid className="ic" size={18} />Dashboard</a>
                <a className="navitem on"><Briefcase className="ic" size={18} />Applications</a>
                <a className="navitem" onClick={() => nav('/coach')}><Mic className="ic" size={18} />Interview Coach<Badge variant="gold">Premium</Badge></a>
                <a className="navitem" onClick={() => nav('/builder')}><FileText className="ic" size={18} />Résumé Studio</a>
                <a className="navitem" onClick={() => nav('/coach/reports')}><History className="ic" size={18} />Interview Reports</a>
                <div style={{ marginTop: 'auto' }}>
                    <div className="navitem"><div className="av" style={{ width: 26, height: 26, fontSize: 11, background: '#3a3320', color: 'var(--gold)' }}>{(user?.name || user?.email || 'U')[0].toUpperCase()}</div>{user?.name || 'Your account'}</div>
                </div>
            </aside>

            <div className="fill" style={{ minWidth: 0 }}>
                <div className="row jsb ac" style={{ height: 68, padding: '0 32px', borderBottom: '1px solid var(--line)' }}>
                    <div className="h4" style={{ fontFamily: 'var(--rn-serif)', fontWeight: 400, fontSize: 22 }}>Applications</div>
                    <div className="row ac gap-14">
                        <button className={'chip' + (showArchived ? ' on' : '')} onClick={() => { setShowArchived(v => !v); setJobs(null); }}>Archived</button>
                        <div className="row ac" style={{ position: 'relative' }}>
                            <Search size={15} color="var(--faint)" style={{ position: 'absolute', left: 14, pointerEvents: 'none' }} />
                            <input className="input" placeholder="Search jobs" value={query} onChange={(e) => setQuery(e.target.value)}
                                   style={{ width: 220, height: 40, background: 'var(--surface-2)', paddingLeft: 38 }} />
                        </div>
                        <button className="btn btn-gold btn-sm" onClick={() => setShowAdd(true)}><Plus size={14} />Add job</button>
                    </div>
                </div>

                <div style={{ padding: 28 }}>
                    {err && <p className="sm" style={{ color: 'var(--rose)', marginBottom: 14 }}>{err}</p>}

                    {/* TODAY — the daily loop */}
                    {!showArchived && (agendaItems.length > 0 || (agenda?.suggested?.length > 0)) && (
                        <div style={{ marginBottom: 26 }}>
                            <div className="label" style={{ marginBottom: 12 }}>Today</div>
                            <div className="row gap-12 wrap-f">
                                {agendaItems.map(item => (
                                    <div key={(item.kind || 'e') + (item.id || item.job_id) + item.due_at}
                                         className="card row ac gap-12"
                                         style={{ padding: '12px 16px', borderColor: item.bucket === 'overdue' ? 'var(--rose)' : item.bucket === 'today' ? 'var(--gold-line)' : 'var(--line)' }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div className="sm" style={{ color: 'var(--text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>
                                                {item.type === 'round' ? '🎤 ' : ''}{item.title || 'Next step'}
                                            </div>
                                            <div className="xs">
                                                <a style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }} onClick={() => nav(`/tracker/job/${item.job_id}`)}>{item.company} · {item.job_title}</a>
                                                {' · '}<span style={item.bucket === 'overdue' ? { color: 'var(--rose)' } : undefined}>{fmtDue(item.due_at)}</span>
                                            </div>
                                        </div>
                                        {item.type === 'round' && <button className="btn btn-gold btn-sm none" onClick={() => practiceRound(item)}>Practice</button>}
                                        <button className="btn btn-ghost btn-sm none" title="Mark done" onClick={() => completeItem(item)}><Check size={14} /></button>
                                    </div>
                                ))}
                                {(agenda?.suggested || []).map(sg => (
                                    <div key={'sg' + sg.job_id} className="card row ac gap-12" style={{ padding: '12px 16px', borderColor: 'var(--blue-line)' }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div className="sm" style={{ color: 'var(--blue)', fontWeight: 600 }}>
                                                {sg.stage === 'interviewing' ? `Gone quiet for ${daysAgo(sg.updated_at)} — nudge them?` : `No reply in ${daysAgo(sg.updated_at)} — follow up?`}
                                            </div>
                                            <div className="xs"><a style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }} onClick={() => nav(`/tracker/job/${sg.job_id}`)}>{sg.company} · {sg.job_title}</a></div>
                                        </div>
                                        <button className="btn btn-ghost btn-sm none" onClick={() => scheduleFollowUp(sg)}>Schedule</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* MOMENTUM — hidden until there's something to measure */}
                    {!showArchived && insights && (jobs || []).length > 0 && (
                        <div className="grid gap-16 g-stats" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 26 }}>
                            {[['Active applications', insights.active],
                              ['Applied this week', `${insights.appliedThisWeek}${insights.appliedLastWeek ? (insights.appliedThisWeek >= insights.appliedLastWeek ? ' ↑' : ' ↓') : ''}`],
                              ['Response rate', insights.responseRate != null ? insights.responseRate + '%' : '—'],
                              ['Offers', insights.offers]].map(([l, v]) => (
                                <div key={l} className="card" style={{ padding: '16px 20px' }}><div className="label">{l}</div><div className="h2" style={{ fontSize: 28, marginTop: 6 }}>{v}</div></div>
                            ))}
                        </div>
                    )}

                    {/* PIPELINE BOARD */}
                    {jobs && jobs.length === 0 ? (
                        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                            <h3 className="h3" style={{ marginBottom: 8 }}>{showArchived ? 'No archived jobs' : 'Your pipeline is empty'}</h3>
                            {!showArchived && <>
                                <p className="body-t" style={{ maxWidth: '46ch', margin: '0 auto 24px' }}>Add the first job you're eyeing — then tailor your résumé to it and rehearse the interview, all from one card.</p>
                                <button className="btn btn-gold" onClick={() => setShowAdd(true)}><Plus size={16} />Add your first job</button>
                            </>}
                        </div>
                    ) : (
                        <div className="row gap-14" style={{ alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 12 }}>
                            {STAGES.map(st => {
                                const col = shown.filter(j => j.stage === st.key);
                                return (
                                    <div key={st.key} style={{ minWidth: 250, width: 250, flex: 'none' }}>
                                        <div className="row ac jsb" style={{ padding: '0 4px 10px' }}>
                                            <span className="label">{st.label}</span>
                                            <span className="xs">{col.length}</span>
                                        </div>
                                        <div className="col gap-10">
                                            {col.map(j => (
                                                <div key={j.id} className="card card-int" style={{ padding: 14, cursor: 'pointer' }} onClick={() => nav(`/tracker/job/${j.id}`)}>
                                                    <div className="row ac gap-10" style={{ marginBottom: 8 }}>
                                                        <div className="av" style={{ width: 30, height: 30, fontSize: 13, background: '#3a3320', color: 'var(--gold)', flex: 'none' }}>{(j.company || '?')[0].toUpperCase()}</div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div className="sm" style={{ color: 'var(--text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.title}</div>
                                                            <div className="xs" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.company} · {daysAgo(j.updated_at)} in stage</div>
                                                        </div>
                                                    </div>
                                                    {j.next_action && (
                                                        <div className="xs" style={{ marginBottom: 8, color: j.next_action_due && new Date(j.next_action_due) < new Date() ? 'var(--rose)' : 'var(--gold)' }}>
                                                            ↻ {j.next_action}{j.next_action_due ? ` · ${fmtDue(j.next_action_due)}` : ''}
                                                        </div>
                                                    )}
                                                    <select className="input" value={j.stage}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => moveStage(j, e.target.value)}
                                                            style={{ height: 40, fontSize: 16, padding: '0 8px', background: 'var(--surface-2)' }}>
                                                        {STAGES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                                                    </select>
                                                </div>
                                            ))}
                                            {col.length === 0 && <div className="xs" style={{ padding: '14px 4px', color: 'var(--ghost)' }}>—</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {!jobs && <p className="sm" style={{ padding: 20 }}>Loading your pipeline…</p>}
                </div>
            </div>

            {showAdd && <JobFormModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); reload(); }} />}
        </div>
    );
}

// Shared create/edit form — JobDetail reuses it for "Edit job".
export function JobFormModal({ initial, onClose, onSaved }) {
    const isEdit = !!(initial && initial.id);
    const [f, setF] = useState({
        company: initial?.company || '', title: initial?.title || '', url: initial?.url || '',
        location: initial?.location || '', source: initial?.source || '', jd: initial?.jd || '',
        stage: initial?.stage || 'saved',
        salaryMin: initial?.salary_min ?? '', salaryMax: initial?.salary_max ?? '',
        salaryCurrency: initial?.salary_currency || 'INR', salaryNotes: initial?.salary_notes || '',
    });
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

    async function save() {
        if (!f.company.trim() || !f.title.trim()) { setErr('Company and job title are required.'); return; }
        setBusy(true); setErr('');
        try {
            const payload = { ...f, salaryMin: f.salaryMin || null, salaryMax: f.salaryMax || null };
            if (isEdit) { delete payload.stage; await updateJob(initial.id, payload); }
            else await createJob(payload);
            onSaved();
        } catch (e) { setErr(e.message || 'Could not save the job.'); setBusy(false); }
    }

    return (
        <div className="rn-dark" style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(4,5,7,0.72)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
             onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="card-2" style={{ width: '100%', maxWidth: 560, maxHeight: '92dvh', overflowY: 'auto', padding: 28 }}>
                <div className="row ac jsb" style={{ marginBottom: 18 }}>
                    <h2 className="h3">{isEdit ? 'Edit job' : 'Add a job'}</h2>
                    <button className="btn btn-ghost btn-sm" style={{ width: 32, padding: 0 }} onClick={onClose}><X size={15} /></button>
                </div>
                <div className="grid gap-12 g-2" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 12 }}>
                    <div className="field"><label className="input-lbl">Company *</label><input className="input" maxLength={255} value={f.company} onChange={set('company')} placeholder="e.g. Infosys" autoFocus={!isEdit} /></div>
                    <div className="field"><label className="input-lbl">Job title *</label><input className="input" maxLength={255} value={f.title} onChange={set('title')} placeholder="e.g. Senior Salesforce Developer" /></div>
                    <div className="field"><label className="input-lbl">Posting URL</label><input className="input" value={f.url} onChange={set('url')} placeholder="https://…" /></div>
                    <div className="field"><label className="input-lbl">Location</label><input className="input" maxLength={255} value={f.location} onChange={set('location')} placeholder="Remote / Bengaluru…" /></div>
                    <div className="field"><label className="input-lbl">Source</label><input className="input" maxLength={100} value={f.source} onChange={set('source')} placeholder="LinkedIn, referral…" /></div>
                    {!isEdit && (
                        <div className="field"><label className="input-lbl">Stage</label>
                            <select className="select" value={f.stage} onChange={set('stage')}>
                                {STAGES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="field"><label className="input-lbl">Salary min</label><input className="input" type="number" value={f.salaryMin} onChange={set('salaryMin')} /></div>
                    <div className="field"><label className="input-lbl">Salary max</label><input className="input" type="number" value={f.salaryMax} onChange={set('salaryMax')} /></div>
                    <div className="field"><label className="input-lbl">Currency</label>
                        <select className="select" value={f.salaryCurrency} onChange={set('salaryCurrency')}>
                            {['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="field" style={{ marginBottom: 12 }}>
                    <label className="input-lbl">Salary notes <span className="faint">(offers, ranges discussed, expectations)</span></label>
                    <textarea className="textarea" style={{ minHeight: 56 }} value={f.salaryNotes} onChange={set('salaryNotes')} placeholder="e.g. Recruiter opened at 28 LPA, I asked for 34…" />
                </div>
                <div className="field" style={{ marginBottom: 16 }}>
                    <label className="input-lbl">Job description <span className="faint">(powers tailored résumés &amp; mock interviews)</span></label>
                    <textarea className="textarea" style={{ minHeight: 110 }} value={f.jd} onChange={set('jd')} placeholder="Paste the JD here…" />
                </div>
                {err && <p className="sm" style={{ color: 'var(--rose)', marginBottom: 12 }}>{err}</p>}
                <button className="btn btn-gold btn-block" onClick={save} disabled={busy}>{busy ? 'Saving…' : isEdit ? 'Save changes' : 'Save to pipeline'}</button>
            </div>
        </div>
    );
}

function loadResumeDraft() {
    try { const d = JSON.parse(localStorage.getItem('rb-draft') || 'null'); return d && d.fullName ? d : null; } catch { return null; }
}
