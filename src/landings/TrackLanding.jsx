import React, { useEffect } from 'react';
import { Check } from 'lucide-react';
import { track } from '../analytics.js';

// Dedicated ad landing for the "100 applications" / application-tracking angle.
// Single purpose, single CTA into the free tracker. No feature grid.
export default function TrackLanding({ nav }) {
    useEffect(() => { track('landing_view', { lp: 'track' }); }, []);
    return (
        <div className="rn-dark">
            <div className="wrap-wide row ac jsb" style={{ height: 60 }}>
                <a href="/" className="brand" onClick={(e) => { e.preventDefault(); nav('/'); }} style={{ cursor: 'pointer' }}><div className="mark">R</div><div className="wm">Re<b>nonym</b></div></a>
            </div>
            <header className="rel" style={{ overflow: 'hidden' }}>
                <div className="glow-gold" style={{ width: 700, height: 520, right: -120, top: -180 }} />
                <div className="wrap tc" style={{ maxWidth: 640, padding: '40px 18px 32px' }}>
                    <div className="pill" style={{ marginBottom: 16 }}><span className="dot" />Free application tracker</div>
                    <h1 style={{ fontFamily: 'var(--rn-serif)', fontWeight: 400, fontSize: 'clamp(26px,7vw,42px)', lineHeight: 1.15, color: 'var(--text)' }}>
                        100 applications.<br /><span className="italic gold">Zero chaos.</span>
                    </h1>
                    <p className="lead" style={{ marginTop: 14, maxWidth: '40ch', marginLeft: 'auto', marginRight: 'auto' }}>Track every job, recruiter, stage and follow-up in one place — wired straight into your résumé and interview prep.</p>
                    <div className="col gap-12" style={{ maxWidth: 380, margin: '22px auto 0', textAlign: 'left' }}>
                        {['Every application and its stage at a glance', 'Recruiter notes and follow-up reminders', 'One tap to prep the interview for any role'].map(t => (
                            <div key={t} className="row ac gap-10"><Check size={15} color="var(--green)" style={{ flex: 'none' }} /><span className="body-t">{t}</span></div>
                        ))}
                    </div>
                    <button className="btn btn-gold btn-lg" style={{ marginTop: 26 }} onClick={() => nav('/tracker')}>Start tracking — free →</button>
                    <p className="sm" style={{ marginTop: 12 }}>No card needed.</p>
                </div>
            </header>
        </div>
    );
}
