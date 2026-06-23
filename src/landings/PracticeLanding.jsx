import React, { useEffect } from 'react';
import DemoInterview from '../DemoInterview.jsx';
import { track } from '../analytics.js';

// Dedicated ad landing for the interview-anxiety angle. Single purpose: the
// visitor experiences the mock interview immediately (reuses the shared
// DemoInterview trial). No nav clutter, no feature grid.
export default function PracticeLanding({ nav }) {
    useEffect(() => { track('landing_view', { lp: 'practice' }); }, []);
    const goFull = () => nav('/coach/new');
    return (
        <div className="rn-dark">
            <div className="wrap-wide row ac jsb" style={{ height: 60 }}>
                <a href="/" className="brand" onClick={(e) => { e.preventDefault(); nav('/'); }} style={{ cursor: 'pointer' }}><div className="mark">R</div><div className="wm">Re<b>nonym</b></div></a>
                <span className="pill"><span className="dot" />AI Interview Coach</span>
            </div>
            <header className="rel" style={{ overflow: 'hidden' }}>
                <div className="glow-gold" style={{ width: 700, height: 520, right: -120, top: -180 }} />
                <div className="wrap tc" style={{ maxWidth: 680, padding: '22px 18px 8px' }}>
                    <h1 style={{ fontFamily: 'var(--rn-serif)', fontWeight: 400, fontSize: 'clamp(22px,5.8vw,36px)', lineHeight: 1.2, color: 'var(--text)' }}>
                        Nervous about your interview?<br /><span className="italic gold">Practise it first — free.</span>
                    </h1>
                    <p className="lead" style={{ marginTop: 12 }}>Answer one real question below and get instant AI feedback. No signup.</p>
                </div>
                <DemoInterview heroMode onStartFull={goFull} />
            </header>
        </div>
    );
}
