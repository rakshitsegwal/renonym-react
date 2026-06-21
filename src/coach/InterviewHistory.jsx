import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, Mic, FileText, History, Briefcase, Search } from 'lucide-react';
import { Badge } from './primitives.jsx';
import { listSessions, coachMe, getUser } from './api.js';

// S11 — Interview History. Loads the user's real sessions.
export default function InterviewHistory({ nav }) {
    const [sessions, setSessions] = useState(null);
    const [err, setErr] = useState('');
    const [access, setAccess] = useState(null);   // { unlimited, passes, has }
    const [query, setQuery] = useState('');
    const user = getUser();

    useEffect(() => {
        let alive = true;
        listSessions()
            .then(r => { if (alive) setSessions(r.sessions || []); })
            .catch(e => { if (e.status === 401) nav('/coach'); else setErr(e.message || 'Could not load history.'); });
        coachMe().then(me => { if (alive) setAccess(me); }).catch(() => {});
        return () => { alive = false; };
    }, []);

    const COLS = '2.2fr 1.4fr 1fr 0.7fr 1.4fr';
    const q = query.trim().toLowerCase();
    const shown = (sessions || []).filter(s =>
        !q || [s.job_title, s.company, s.interview_type].filter(Boolean).join(' ').toLowerCase().includes(q));
    const scored = (sessions || []).filter(s => s.overall_score != null);
    const avg = scored.length ? Math.round(scored.reduce((a, s) => a + s.overall_score, 0) / scored.length) : 0;
    const best = scored.length ? Math.max(...scored.map(s => s.overall_score)) : 0;
    const roles = new Set((sessions || []).map(s => `${s.job_title}·${s.company}`)).size;

    return (
        <div className="rn-dark appshell">
            <aside className="sidebar">
                <div className="brand" style={{ padding: '6px 8px 18px' }}><div className="mark">R</div><div className="wm">Re<b>nonym</b></div></div>
                <button className="btn btn-gold btn-block" style={{ marginBottom: 16 }} onClick={() => nav('/coach/new')}><Plus size={16} />Start an interview</button>
                <a className="navitem" onClick={() => nav('/dashboard')}><LayoutGrid className="ic" size={18} />Dashboard</a>
                <a className="navitem" onClick={() => nav('/tracker')}><Briefcase className="ic" size={18} />Applications</a>
                <a className="navitem" onClick={() => nav('/coach')}><Mic className="ic" size={18} />Interview Coach<Badge variant="gold">Premium</Badge></a>
                <a className="navitem" onClick={() => nav('/builder')}><FileText className="ic" size={18} />Résumé Studio</a>
                <a className="navitem on"><History className="ic" size={18} />Reports</a>
                <div style={{ marginTop: 'auto' }}>
                    {access !== null && (
                    <div className="card-gold" style={{ padding: 16, borderRadius: 14, marginBottom: 12 }}>
                        <div style={{ marginBottom: 8 }}><Badge variant="gold" dot>Coach</Badge></div>
                        {access?.unlimited ? (
                            <>
                                <p className="xs" style={{ color: 'var(--text-2)' }}>Coach Unlimited — active. Interview as often as you like.</p>
                                <button className="btn btn-gold btn-sm btn-block" style={{ marginTop: 12 }} onClick={() => nav('/coach/new')}>New interview</button>
                            </>
                        ) : access?.passType ? (
                            <>
                                <p className="xs" style={{ color: 'var(--text-2)' }}>{access.passType === 'season' ? 'Season Pass' : 'Placement Pro'} — {access.passInterviewsRemaining ?? 0} interview{(access.passInterviewsRemaining ?? 0) === 1 ? '' : 's'} left.</p>
                                <button className="btn btn-gold btn-sm btn-block" style={{ marginTop: 12 }} onClick={() => nav('/coach/new')}>New interview</button>
                            </>
                        ) : access?.interviewCredits > 0 ? (
                            <>
                                <p className="xs" style={{ color: 'var(--text-2)' }}>{access.interviewCredits} interview{access.interviewCredits > 1 ? 's' : ''} ready to run.</p>
                                <button className="btn btn-gold btn-sm btn-block" style={{ marginTop: 12 }} onClick={() => nav('/coach/new')}>Start one</button>
                            </>
                        ) : access?.passes > 0 ? (
                            <>
                                <p className="xs" style={{ color: 'var(--text-2)' }}>{access.passes} session pass{access.passes > 1 ? 'es' : ''} left.</p>
                                <button className="btn btn-gold btn-sm btn-block" style={{ marginTop: 12 }} onClick={() => nav('/coach/new')}>Use a pass</button>
                            </>
                        ) : (
                            <>
                                <p className="xs" style={{ color: 'var(--text-2)' }}>Unlimited interviews &amp; reports.</p>
                                <button className="btn btn-gold btn-sm btn-block" style={{ marginTop: 12 }} onClick={() => nav('/coach/checkout')}>Season Pass · ₹699</button>
                            </>
                        )}
                    </div>
                    )}
                    <div className="navitem"><div className="av" style={{ width: 26, height: 26, fontSize: 11, background: '#3a3320', color: 'var(--gold)' }}>{(user?.name || user?.email || 'U')[0].toUpperCase()}</div>{user?.name || 'Your account'}</div>
                </div>
            </aside>

            <div className="fill" style={{ minWidth: 0 }}>
                <div className="row jsb ac" style={{ height: 68, padding: '0 32px', borderBottom: '1px solid var(--line)' }}>
                    <div className="h4" style={{ fontFamily: 'var(--rn-serif)', fontWeight: 400, fontSize: 22 }}>Interview history</div>
                    <div className="row ac gap-14">
                        <div className="row ac" style={{ position: 'relative' }}>
                            <Search size={15} color="var(--faint)" style={{ position: 'absolute', left: 14, pointerEvents: 'none' }} />
                            <input className="input" placeholder="Search interviews" value={query} onChange={(e) => setQuery(e.target.value)}
                                   style={{ width: 260, height: 40, background: 'var(--surface-2)', paddingLeft: 38 }} />
                        </div>
                        <div className="av" style={{ width: 38, height: 38, background: '#3a3320', color: 'var(--gold)' }}>{(user?.name || user?.email || 'U')[0].toUpperCase()}</div>
                    </div>
                </div>

                <div style={{ padding: 32 }}>
                    <div className="grid gap-20 g-stats" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 28 }}>
                        <Stat label="Total interviews" value={sessions ? sessions.length : '—'} />
                        <Stat label="Average score" value={scored.length ? avg : '—'} gold={false} />
                        <Stat label="Best score" value={scored.length ? best : '—'} gold />
                        <Stat label="Roles practiced" value={sessions ? roles : '—'} />
                    </div>

                    {err && <p className="sm" style={{ color: 'var(--rose)', marginBottom: 16 }}>{err}</p>}

                    {sessions && sessions.length === 0 ? (
                        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                            <h3 className="h3" style={{ marginBottom: 8 }}>No interviews yet</h3>
                            <p className="body-t" style={{ marginBottom: 24 }}>Run your first AI interview and your scored reports will appear here.</p>
                            <button className="btn btn-gold" onClick={() => nav('/coach/new')}>Start an interview</button>
                        </div>
                    ) : (
                        <div className="card" style={{ padding: '14px 4px' }}>
                            <div className="grid" style={{ gridTemplateColumns: COLS, padding: '0 16px 14px', gap: 12 }}>
                                {['Interview', 'Type · mode', 'Date', 'Score', ''].map((h, i) => <span key={i} className="label" style={i === 4 ? { textAlign: 'right' } : undefined}>{h}</span>)}
                            </div>
                            {shown.length === 0 && <p className="sm" style={{ padding: '18px 16px' }}>No interviews match “{query}”.</p>}
                            {shown.map(s => {
                                const hot = s.overall_score >= 70;
                                return (
                                    <div key={s.id} className="grid ac" style={{ gridTemplateColumns: COLS, gap: 12, padding: '16px', borderTop: '1px solid var(--line)' }}>
                                        <div className="row ac gap-14">
                                            <div style={{ width: 40, height: 40, borderRadius: 10, display: 'grid', placeItems: 'center', flex: 'none', fontWeight: 600, ...(hot ? { background: 'var(--gold-soft)', color: 'var(--gold)', border: '1px solid var(--gold-line)' } : { background: 'var(--surface-3)', color: 'var(--text-2)' }) }}>{s.overall_score ?? '–'}</div>
                                            <div><div className="sm" style={{ color: 'var(--text)', fontWeight: 600 }}>{[s.job_title, s.company].filter(Boolean).join(' · ') || 'Interview'}</div><div className="xs">{s.status === 'scored' ? 'Scored' : 'In progress'}</div></div>
                                        </div>
                                        <div className="row ac gap-6 wrap-f"><Badge>{s.interview_type}</Badge>{s.mode === 'voice' ? <Badge variant="blue">Voice</Badge> : <Badge>Text</Badge>}</div>
                                        <span className="sm">{fmtDate(s.created_at)}</span>
                                        <span className={'h4' + (hot ? ' gold' : '')}>{s.overall_score ?? '–'}</span>
                                        <div className="row gap-8 je">
                                            {s.status === 'scored'
                                                ? <button className="btn btn-ghost btn-sm" onClick={() => nav(`/coach/report/${s.id}`)}>View report</button>
                                                : <button className="btn btn-ghost btn-sm" onClick={() => nav(`/coach/session/${s.id}${s.mode === 'text' ? '?mode=text' : ''}`)}>Resume</button>}
                                            <button className="btn btn-outline btn-sm" onClick={() => nav('/coach/new')}>Retake</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value, gold }) {
    return <div className="card" style={{ padding: '20px 24px' }}><div className="label">{label}</div><div className={'h2' + (gold ? ' gold' : '')} style={{ fontSize: 32, marginTop: 8 }}>{value}</div></div>;
}
function fmtDate(d) { try { const dt = new Date(d); const days = Math.round((Date.now() - dt) / 86400000); return days <= 0 ? 'Today' : days === 1 ? 'Yesterday' : days < 7 ? `${days} days ago` : dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch { return ''; } }
