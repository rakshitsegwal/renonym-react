import React, { useState } from 'react';

export default function Dashboard({ user, onOpenBuilder, onLogout }) {
    const [activeSection, setActiveSection] = useState('resumes');

    const nav = [
        { id:'resumes',  icon:'📄', label:'Resume Builder', action: 'builder' },
        { id:'ats',      icon:'📊', label:'ATS Analysis' },
        { id:'jobmatch', icon:'🎯', label:'Job Match' },
        { id:'rewrite',  icon:'✦',  label:'AI Rewrite', pro: true },
        { id:'coach',    icon:'🎤', label:'Interview Coach', soon: true },
    ];

    return (
        <div className="db">
            {/* ── SIDEBAR ── */}
            <aside className="db-sidebar">
                <div className="db-sidebar__logo">Renonym</div>
                <nav className="db-sidebar__nav">
                    {nav.map(n => (
                        <button
                            key={n.id}
                            className={`db-nav-item${activeSection===n.id?' db-nav-item--active':''}`}
                            onClick={() => {
                            if (n.soon) return;
                            if (n.id === 'ats' || n.id === 'jobmatch') {
                                onOpenBuilder(n.id === 'ats' ? 'gallery' : 'jobmatch');
                            } else if (n.id === 'rewrite') {
                                onOpenBuilder('gallery');
                            } else {
                                setActiveSection(n.id);
                            }
                        }}
                        >
                            <span className="db-nav-item__icon">{n.icon}</span>
                            <span className="db-nav-item__label">{n.label}</span>
                            {n.soon && <span className="db-nav-item__soon">Soon</span>}
                            {n.pro && !n.soon && <span className="db-nav-item__pro">Pro</span>}
                        </button>
                    ))}
                </nav>
                <div className="db-sidebar__user">
                    <div className="db-sidebar__avatar">
                        {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="db-sidebar__user-info">
                        <div className="db-sidebar__user-name">{user?.name || user?.email?.split('@')[0] || 'User'}</div>
                        <div className="db-sidebar__user-plan">Pro plan</div>
                    </div>
                    <button className="db-sidebar__logout" onClick={onLogout} title="Log out">↩</button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="db-main">

                {/* Welcome header */}
                <div className="db-header">
                    <div>
                        <h1 className="db-header__h1">Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
                        <p className="db-header__sub">Your career tools are ready.</p>
                    </div>
                    <button className="db-header__btn" onClick={() => onOpenBuilder('gallery')}>
                        + New Resume
                    </button>
                </div>

                {/* Stats row */}
                <div className="db-stats">
                    {[
                        { n:'1', l:'Resume created' },
                        { n:'89', l:'ATS score (avg)' },
                        { n:'0', l:'Jobs matched' },
                        { n:'Pro', l:'Current plan' },
                    ].map(s => (
                        <div key={s.l} className="db-stat">
                            <div className="db-stat__n">{s.n}</div>
                            <div className="db-stat__l">{s.l}</div>
                        </div>
                    ))}
                </div>

                {/* Quick actions */}
                <div className="db-quick">
                    <h2 className="db-section-h2">Quick actions</h2>
                    <div className="db-quick__grid">
                        {[
                            { icon:'📄', t:'Build resume', d:'Start a new resume from scratch or a template', action: () => onOpenBuilder('gallery') },
                            { icon:'✦',  t:'AI design', d:'Generate a unique AI-designed resume', action: () => onOpenBuilder('ai') },
                            { icon:'🎯', t:'Job match', d:'Paste a job description and see your match score', action: () => onOpenBuilder('jobmatch') },
                            { icon:'📊', t:'ATS check', d:'Upload your resume and get an instant ATS score', action: () => onOpenBuilder('gallery') },
                        ].map(q => (
                            <button key={q.t} className="db-quick-card" onClick={q.action}>
                                <div className="db-quick-card__icon">{q.icon}</div>
                                <div className="db-quick-card__t">{q.t}</div>
                                <div className="db-quick-card__d">{q.d}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent resumes */}
                <div className="db-recent">
                    <div className="db-recent__hd">
                        <h2 className="db-section-h2">Your resumes</h2>
                        <button className="db-recent__new" onClick={() => onOpenBuilder('gallery')}>+ New</button>
                    </div>
                    <div className="db-recent__empty">
                        <div className="db-recent__empty-icon">📄</div>
                        <div className="db-recent__empty-t">No resumes yet</div>
                        <div className="db-recent__empty-d">Create your first resume to see it here.</div>
                        <button className="db-recent__empty-btn" onClick={() => onOpenBuilder('gallery')}>Build your first resume →</button>
                    </div>
                </div>

            </main>
        </div>
    );
}
