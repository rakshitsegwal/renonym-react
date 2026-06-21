import React from 'react';
import { FileText, Target, Mic, Briefcase } from 'lucide-react';

// Shown right after sign-in so people pick where to start instead of landing
// in the résumé builder by default. Each choice routes into that tool's normal flow.
const CHOICES = [
    { key: 'builder',  icon: FileText,  title: 'Build a résumé',       desc: 'Start from a template and craft an ATS-ready résumé.' },
    { key: 'jobmatch', icon: Target,    title: 'Optimize for a job',   desc: 'Paste a job description and see exactly what to fix.' },
    { key: 'coach',    icon: Mic,       title: 'Practice an interview', desc: 'Rehearse a realistic AI mock interview — voice or text.' },
    { key: 'tracker',  icon: Briefcase, title: 'Track applications',    desc: 'Keep every application, recruiter and follow-up in one place.' },
];

export default function WelcomeChooser({ name, onPick, onSkip }) {
    const first = (name || '').split(' ')[0];
    return (
        <div className="rn-dark" style={{ position: 'fixed', inset: 0, zIndex: 9500, background: 'rgba(6,7,10,0.94)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
            <div style={{ width: '100%', maxWidth: 720, textAlign: 'center' }}>
                <h1 style={{ fontFamily: 'var(--rn-serif)', fontWeight: 400, fontSize: 32, color: 'var(--text)', marginBottom: 6 }}>
                    Welcome{first ? `, ${first}` : ''} 👋
                </h1>
                <p className="lead" style={{ marginBottom: 30 }}>What would you like to do first?</p>
                <div className="grid g-2 gap-16" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 22 }}>
                    {CHOICES.map((c) => (
                        <button key={c.key} className="card" onClick={() => onPick(c.key)}
                                style={{ padding: '22px 20px', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: 15, alignItems: 'flex-start', borderColor: 'var(--line)' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gold-soft)', display: 'grid', placeItems: 'center', flex: 'none', color: 'var(--gold)' }}><c.icon size={20} /></div>
                            <div style={{ minWidth: 0 }}>
                                <div className="h5" style={{ marginBottom: 4 }}>{c.title}</div>
                                <div className="xs" style={{ color: 'var(--text-2)' }}>{c.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={onSkip}>Skip to dashboard →</button>
            </div>
        </div>
    );
}
