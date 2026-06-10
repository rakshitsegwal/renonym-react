import React from 'react';
import { LayoutGrid, Mic, FileText, Target, History, Plus, Sparkles, ArrowRight } from 'lucide-react';
import { Badge } from './coach/primitives.jsx';
import './coach.css';

// Dashboard — dark/gold reskin (per designs/screens/03). Keeps all existing
// résumé actions (onOpenBuilder modes) and adds Interview Coach entry points.
export default function Dashboard({ user, onOpenBuilder, onLogout, onNavigate }) {
    const go = (p) => () => (onNavigate ? onNavigate(p) : onOpenBuilder('gallery'));
    const first = (user?.name || user?.email?.split('@')[0] || 'there').split(' ')[0];
    const isPro = user?.plan === 'pro';

    return (
        <div className="rn-dark appshell">
            <aside className="sidebar">
                <div className="brand" style={{ padding: '6px 8px 18px' }}><div className="mark">R</div><div className="wm">Re<b>nonym</b></div></div>
                <button className="btn btn-gold btn-block" style={{ marginBottom: 16 }} onClick={go('/coach/new')}><Plus size={16} />Start an interview</button>
                <a className="navitem on"><LayoutGrid className="ic" size={18} />Dashboard</a>
                <a className="navitem" onClick={go('/coach')}><Mic className="ic" size={18} />Interview Coach<Badge variant="gold">Premium</Badge></a>
                <a className="navitem" onClick={() => onOpenBuilder('gallery')}><FileText className="ic" size={18} />Résumé Studio</a>
                <a className="navitem" onClick={() => onOpenBuilder('jobmatch')}><Target className="ic" size={18} />Job Match</a>
                <a className="navitem" onClick={go('/coach/reports')}><History className="ic" size={18} />Interview Reports</a>
                <div style={{ marginTop: 'auto' }}>
                    <div className="navitem" style={{ justifyContent: 'space-between' }}>
                        <div className="row ac gap-10">
                            <div className="av" style={{ width: 28, height: 28, fontSize: 12, background: '#3a3320', color: 'var(--gold)' }}>{(user?.name || user?.email || 'U')[0].toUpperCase()}</div>
                            <div>
                                <div className="sm" style={{ color: 'var(--text)' }}>{first}</div>
                                <div className="xs">{isPro ? '★ Pro' : 'Free plan'}</div>
                            </div>
                        </div>
                        <button onClick={onLogout} title="Log out" className="sm faint" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>↩</button>
                    </div>
                </div>
            </aside>

            <div className="fill" style={{ minWidth: 0 }}>
                <div className="row jsb ac" style={{ height: 68, padding: '0 32px', borderBottom: '1px solid var(--line)' }}>
                    <div className="h4" style={{ fontFamily: 'var(--rn-serif)', fontWeight: 400, fontSize: 22 }}>Welcome back, {first}.</div>
                    <button className="btn btn-ghost btn-sm" onClick={() => onOpenBuilder('gallery')}><Plus size={14} />New résumé</button>
                </div>

                <div style={{ padding: 32, maxWidth: 1100 }}>
                    {/* Up next — Coach prep (gold) */}
                    <div className="card-gold rel" style={{ borderColor: 'var(--gold-line)', borderRadius: 'var(--r-xl)', padding: 32, marginBottom: 28, overflow: 'hidden' }}>
                        <div className="glow-gold" style={{ width: 320, height: 320, right: -80, top: -120 }} />
                        <div className="row jsb ac wrap-f gap-20 rel">
                            <div style={{ maxWidth: '52ch' }}>
                                <Badge variant="gold" dot style={{ marginBottom: 14 }}>Up next</Badge>
                                <h2 className="h2" style={{ marginBottom: 8 }}>Rehearse before the real thing.</h2>
                                <p className="body-t">Run an AI mock interview built from your résumé and the exact role — voice or text — and get a scored report with the precise lines to fix.</p>
                            </div>
                            <button className="btn btn-gold btn-lg none" onClick={go('/coach/new')}>Practice an interview <ArrowRight size={16} /></button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid gap-20" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 28 }}>
                        {[['Résumés', '—'], ['Avg ATS', '—'], ['Interviews', '—'], ['Plan', isPro ? 'Pro' : 'Free']].map(([l, v]) => (
                            <div key={l} className="card" style={{ padding: '20px 24px' }}><div className="label">{l}</div><div className="h2" style={{ fontSize: 30, marginTop: 8 }}>{v}</div></div>
                        ))}
                    </div>

                    {/* Quick actions */}
                    <h2 className="h4" style={{ marginBottom: 16 }}>Quick actions</h2>
                    <div className="grid gap-16" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 32 }}>
                        {[
                            [FileText, 'Build résumé', 'From scratch or a template', () => onOpenBuilder('gallery')],
                            [Sparkles, 'AI design', 'Generate an AI-styled résumé', () => onOpenBuilder('ai')],
                            [Target, 'Job match', 'Score your résumé vs a JD', () => onOpenBuilder('jobmatch')],
                            [Mic, 'Start interview', 'Practice with the AI Coach', go('/coach/new')],
                        ].map(([Icon, t, d, action]) => (
                            <button key={t} className="card card-int" style={{ padding: 22, textAlign: 'left', cursor: 'pointer' }} onClick={action}>
                                <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--gold-soft)', border: '1px solid var(--gold-line)', display: 'grid', placeItems: 'center', marginBottom: 16 }}><Icon size={18} color="var(--gold)" /></div>
                                <div className="h5">{t}</div>
                                <div className="xs" style={{ marginTop: 4 }}>{d}</div>
                            </button>
                        ))}
                    </div>

                    {/* Recent résumés */}
                    <div className="row jsb ac" style={{ marginBottom: 14 }}>
                        <h2 className="h4">Your résumés</h2>
                        <button className="btn btn-ghost btn-sm" onClick={() => onOpenBuilder('gallery')}><Plus size={14} />New</button>
                    </div>
                    <div className="card" style={{ padding: 48, textAlign: 'center' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--surface-3)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}><FileText size={22} color="var(--muted)" /></div>
                        <div className="h5" style={{ marginBottom: 6 }}>No résumés yet</div>
                        <p className="sm" style={{ marginBottom: 20 }}>Create your first résumé to see it here.</p>
                        <button className="btn btn-gold" onClick={() => onOpenBuilder('gallery')}>Build your first résumé →</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
