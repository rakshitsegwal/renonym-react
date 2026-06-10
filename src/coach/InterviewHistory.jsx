import React from 'react';
import { Plus, LayoutGrid, Mic, FileText, AppWindow, History, Search, SlidersHorizontal } from 'lucide-react';
import { Badge } from './primitives.jsx';

// S11 — Interview History (recreated from designs/screens/11-interview-history.html)
const ROWS = [
    { id: 's1', role: 'Senior PM · Stripe', meta: '6 questions · 14 min', type: 'Behavioral', mode: 'Voice', date: 'Today', score: 72, trend: '▲ +14', trendV: 'green', hot: true },
    { id: 's2', role: 'PM II · Figma', meta: '6 questions · 18 min', type: 'Mixed', mode: 'Voice', date: '2 days ago', score: 69, trend: '▲ +6', trendV: 'green', hot: true },
    { id: 's3', role: 'Product Lead · Linear', meta: '10 questions · 22 min', type: 'System design', mode: 'Text', date: '4 days ago', score: 63, trend: '▲ +3', trendV: 'default' },
    { id: 's4', role: 'Senior PM · Stripe', meta: '6 questions · 15 min', type: 'Behavioral', mode: 'Text', date: '5 days ago', score: 58, trend: 'first rep', trendV: 'faint' },
    { id: 's5', role: 'PM II · Figma', meta: '6 questions · 16 min', type: 'Behavioral', mode: 'Voice', date: '1 week ago', score: 55, trend: '—', trendV: 'faint' },
];

export default function InterviewHistory({ nav, currentUser }) {
    const COLS = '2.2fr 1.4fr 1fr 0.7fr 0.9fr 1.4fr';
    return (
        <div className="rn-dark appshell">
            {/* sidebar */}
            <aside className="sidebar">
                <div className="brand" style={{ padding: '6px 8px 18px' }}><div className="mark">R</div><div className="wm">Re<b>nonym</b></div></div>
                <button className="btn btn-gold btn-block" style={{ marginBottom: 16 }} onClick={() => nav('/coach/new')}><Plus size={16} />Start an interview</button>
                <a className="navitem" onClick={() => nav('/')}><LayoutGrid className="ic" size={18} />Dashboard</a>
                <a className="navitem" onClick={() => nav('/coach')}><Mic className="ic" size={18} />Interview Coach<Badge variant="gold">Premium</Badge></a>
                <a className="navitem" onClick={() => nav('/')}><FileText className="ic" size={18} />Résumé Studio</a>
                <a className="navitem"><AppWindow className="ic" size={18} />Applications</a>
                <a className="navitem on"><History className="ic" size={18} />Reports</a>
                <div style={{ marginTop: 'auto' }}>
                    <div className="card-gold" style={{ padding: 16, borderRadius: 14, marginBottom: 12 }}>
                        <div style={{ marginBottom: 8 }}><Badge variant="gold" dot>Coach</Badge></div>
                        <p className="xs" style={{ color: 'var(--text-2)' }}>Unlimited interviews &amp; reports.</p>
                        <button className="btn btn-gold btn-sm btn-block" style={{ marginTop: 12 }} onClick={() => nav('/pricing')}>Upgrade · ₹1,599/mo</button>
                    </div>
                    <div className="navitem"><div className="av" style={{ width: 26, height: 26, fontSize: 11, background: '#3a3320', color: 'var(--gold)' }}>{(currentUser?.name || 'M')[0]}</div>{currentUser?.name || 'Maya Chen'}</div>
                </div>
            </aside>

            {/* main */}
            <div className="fill" style={{ minWidth: 0 }}>
                <div className="row jsb ac" style={{ height: 68, padding: '0 32px', borderBottom: '1px solid var(--line)' }}>
                    <div className="h4" style={{ fontFamily: 'var(--rn-serif)', fontWeight: 400, fontSize: 22 }}>Interview history</div>
                    <div className="row ac gap-14">
                        <div className="input" style={{ width: 260, height: 40, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)' }}><Search size={15} color="var(--faint)" /><span className="sm" style={{ color: 'var(--faint)' }}>Search interviews</span></div>
                        <div className="av" style={{ width: 38, height: 38, background: '#3a3320', color: 'var(--gold)' }}>{(currentUser?.name || 'M')[0]}</div>
                    </div>
                </div>

                <div style={{ padding: 32 }}>
                    {/* stats */}
                    <div className="grid gap-20" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 28 }}>
                        <Stat label="Total interviews" value="9" />
                        <div className="card" style={{ padding: '20px 24px' }}><div className="label">Average score</div><div className="row ae gap-8" style={{ marginTop: 8 }}><span className="h2" style={{ fontSize: 32 }}>66</span><Badge variant="green" style={{ marginBottom: 5 }}>▲ 23</Badge></div></div>
                        <div className="card" style={{ padding: '20px 24px' }}><div className="label">Best score</div><div className="h2 gold" style={{ fontSize: 32, marginTop: 8 }}>72</div></div>
                        <Stat label="Roles practiced" value="3" />
                    </div>

                    {/* toolbar */}
                    <div className="row ac gap-10" style={{ marginBottom: 20 }}>
                        <span className="chip on">All</span><span className="chip">Stripe</span><span className="chip">Figma</span><span className="chip">Linear</span>
                        <div className="fill" />
                        <button className="btn btn-ghost btn-sm"><SlidersHorizontal size={14} />Sort: Recent</button>
                        <button className="btn btn-ghost btn-sm">Mode: All</button>
                    </div>

                    {/* list */}
                    <div className="card" style={{ padding: '14px 4px' }}>
                        <div className="grid" style={{ gridTemplateColumns: COLS, padding: '0 16px 14px', gap: 12 }}>
                            {['Interview', 'Type · mode', 'Date', 'Score', 'Trend', ''].map((h, i) => <span key={i} className="label" style={i === 5 ? { textAlign: 'right' } : undefined}>{h}</span>)}
                        </div>
                        {ROWS.map((r, idx) => (
                            <div key={r.id} className="grid ac" style={{ gridTemplateColumns: COLS, gap: 12, padding: '16px', borderTop: '1px solid var(--line)' }}>
                                <div className="row ac gap-14">
                                    <div style={{ width: 40, height: 40, borderRadius: 10, display: 'grid', placeItems: 'center', flex: 'none', fontWeight: 600, ...(r.hot ? { background: 'var(--gold-soft)', color: 'var(--gold)', border: '1px solid var(--gold-line)' } : { background: 'var(--surface-3)', color: 'var(--text-2)' }) }}>{r.score}</div>
                                    <div><div className="sm" style={{ color: 'var(--text)', fontWeight: 600 }}>{r.role}</div><div className="xs">{r.meta}</div></div>
                                </div>
                                <div className="row ac gap-6 wrap-f"><Badge>{r.type}</Badge>{r.mode === 'Voice' ? <Badge variant="blue">Voice</Badge> : <Badge>Text</Badge>}</div>
                                <span className="sm">{r.date}</span>
                                <span className={'h4' + (r.hot ? ' gold' : '')}>{r.score}</span>
                                <span><Badge variant={r.trendV === 'green' ? 'green' : 'default'} style={r.trendV === 'faint' ? { color: 'var(--faint)' } : undefined}>{r.trend}</Badge></span>
                                <div className="row gap-8 je">
                                    <button className="btn btn-ghost btn-sm" onClick={() => nav(`/coach/report/${r.id}`)}>View report</button>
                                    <button className="btn btn-outline btn-sm" onClick={() => nav('/coach/new')}>Retake</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value }) {
    return <div className="card" style={{ padding: '20px 24px' }}><div className="label">{label}</div><div className="h2" style={{ fontSize: 32, marginTop: 8 }}>{value}</div></div>;
}
