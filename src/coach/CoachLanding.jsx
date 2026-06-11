import React, { useState } from 'react';
import { VoiceOrb, Waveform, Badge } from './primitives.jsx';
import { AuthModal } from '../AuthModal.jsx';

// S4 — Interview Coach landing (recreated from designs/screens/04-coach-landing.html)
// Prices in INR per the Razorpay decision (Coach Unlimited ₹1,599/mo · Session Pass ₹599).
export default function CoachLanding({ nav, currentUser }) {
    const go = (p) => (e) => { e?.preventDefault?.(); nav(p); };
    const [showAuth, setShowAuth] = useState(false);

    return (
        <div className="rn-dark">
            {showAuth && (
                <AuthModal
                    reason="continue"
                    onClose={() => setShowAuth(false)}
                    onAuth={(token, user) => {
                        localStorage.setItem('rn-auth-token', token);
                        localStorage.setItem('rn-auth-user', JSON.stringify(user));
                        window.location.reload();   // stay on /coach, now signed in
                    }}
                />
            )}
            {/* NAV */}
            <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,11,13,0.72)', backdropFilter: 'blur(18px)', borderBottom: '1px solid var(--line)' }}>
                <div className="wrap-wide topnav">
                    <div className="row ac gap-40">
                        <a href="/" onClick={go('/')} className="brand"><div className="mark">R</div><div className="wm">Re<b>nonym</b></div></a>
                        <div className="navlinks">
                            <a href="/coach" onClick={go('/coach')} className="on">Interview Coach</a>
                            <a href="/builder" onClick={go('/builder')}>Résumé Builder</a>
                            <a href="/tracker" onClick={go('/tracker')}>Applications</a>
                            <a href="/dashboard" onClick={go('/dashboard')}>Dashboard</a>
                            <a href="/coach/checkout" onClick={go('/coach/checkout')}>Pricing</a>
                        </div>
                    </div>
                    <div className="row ac gap-16">
                        {currentUser
                            ? <a href="/coach/reports" onClick={go('/coach/reports')} className="row ac gap-8" title={currentUser.email} style={{ fontWeight: 500 }}>
                                <span className="av" style={{ width: 26, height: 26, fontSize: 11, background: '#3a3320', color: 'var(--gold)' }}>{(currentUser.name || currentUser.email || 'U')[0].toUpperCase()}</span>
                                <span className="sm t2">{(currentUser.name || '').split(' ')[0] || 'My interviews'}</span>
                              </a>
                            : <a href="#" onClick={(e) => { e.preventDefault(); setShowAuth(true); }} className="sm t2" style={{ fontWeight: 500 }}>Sign in</a>}
                        <a href="/coach/new" onClick={go('/coach/new')} className="btn btn-gold">Start an interview</a>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <header className="rel" style={{ padding: '90px 0 70px', textAlign: 'center', overflow: 'hidden' }}>
                <div className="glow-gold" style={{ width: 760, height: 520, left: '50%', top: -160, transform: 'translateX(-50%)' }} />
                <div className="wrap rel">
                    <div className="pill" style={{ margin: '0 auto 26px' }}><span className="dot" />Premium feature · the AI Interview Coach</div>
                    <h1 className="display" style={{ maxWidth: '16ch', margin: '0 auto' }}>Rehearse the interview before it <span className="italic gold">happens</span>.</h1>
                    <p className="lead" style={{ maxWidth: '56ch', margin: '26px auto 0' }}>A realistic AI interviewer built from your résumé and the exact role. It asks, follows up, and scores every answer — by voice or by text — so you walk in already warmed up.</p>
                    <div className="row ac jc gap-16" style={{ marginTop: 36 }}>
                        <a href="/coach/new" onClick={go('/coach/new')} className="btn btn-gold btn-lg">Start an interview</a>
                        <a href="/coach/checkout" onClick={go('/coach/checkout')} className="btn btn-outline btn-lg">See plans · from ₹1,599/mo</a>
                    </div>
                    <p className="xs" style={{ marginTop: 18 }}>Included with Coach Unlimited · or a single Session Pass</p>
                </div>
            </header>

            {/* VOICE vs TEXT */}
            <section style={{ padding: '70px 0' }}>
                <div className="wrap-wide">
                    <div className="tc" style={{ marginBottom: 46 }}>
                        <span className="eyebrow">Two ways to practice</span>
                        <h2 className="h1" style={{ marginTop: 16 }}>Speak it, or type it</h2>
                    </div>
                    <div className="grid gap-24" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        {/* voice */}
                        <div className="card-gold rel" style={{ padding: 38, borderRadius: 'var(--r-2xl)', overflow: 'hidden', borderColor: 'var(--gold-line)' }}>
                            <div className="glow-gold" style={{ width: 300, height: 300, right: -60, top: -100 }} />
                            <div className="row ac jsb rel"><Badge variant="gold" dot>Voice mode</Badge><Badge>Recommended</Badge></div>
                            <div className="col ac" style={{ margin: '30px 0' }}>
                                <VoiceOrb size={96} state="listening" />
                                <Waveform bars={7} live height={34} style={{ marginTop: 20 }} />
                            </div>
                            <h3 className="h3 rel">Answer out loud</h3>
                            <p className="body-t rel" style={{ marginTop: 10 }}>Speak naturally to a coach that listens, transcribes, and reacts in real time. The closest thing to the pressure of the real room — where nerves actually live.</p>
                            <div className="col gap-12 rel" style={{ marginTop: 22 }}>
                                {['Real-time speech & live transcript', 'Reads pacing, filler words & confidence', 'Adaptive spoken follow-ups'].map((t) => (
                                    <div key={t} className="row ac gap-10 sm" style={{ color: 'var(--text-2)' }}><span className="gold">›</span>{t}</div>
                                ))}
                            </div>
                        </div>
                        {/* text */}
                        <div className="card" style={{ padding: 38, borderRadius: 'var(--r-2xl)', overflow: 'hidden' }}>
                            <div className="row ac jsb"><Badge variant="blue" dot>Text mode</Badge><Badge>Lower pressure</Badge></div>
                            <div className="col ac jc" style={{ margin: '30px 0', height: 136 }}>
                                <div className="card-2" style={{ width: '100%', padding: 16, borderRadius: 14 }}>
                                    <div className="xs" style={{ color: 'var(--faint)' }}>You</div>
                                    <p className="sm" style={{ marginTop: 6, color: 'var(--text-2)' }}>I start by separating urgency from importance, then map each request to a measurable outcome<span className="blue-t">▍</span></p>
                                </div>
                            </div>
                            <h3 className="h3">Type your answers</h3>
                            <p className="body-t" style={{ marginTop: 10 }}>Run the same adaptive interview in writing. Perfect for structuring your thinking, refining your stories, and practicing anywhere quietly.</p>
                            <div className="col gap-12" style={{ marginTop: 22 }}>
                                {['Composed, considered responses', 'Same scoring & follow-up engine', 'Word count & structure hints'].map((t) => (
                                    <div key={t} className="row ac gap-10 sm" style={{ color: 'var(--text-2)' }}><span className="blue-t">›</span>{t}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PROCESS */}
            <section style={{ padding: '60px 0' }}>
                <div className="wrap-wide">
                    <div className="row ae jsb" style={{ marginBottom: 42 }}>
                        <div><span className="eyebrow">The interview process</span><h2 className="h1" style={{ marginTop: 16 }}>How a session runs</h2></div>
                        <p className="sm" style={{ maxWidth: '34ch', textAlign: 'right' }}>Every interview is generated fresh from your résumé and the job — never a generic question bank.</p>
                    </div>
                    <div className="grid gap-20" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                        {[['01', 'Set up', 'Add the role, job description, type & difficulty.'],
                          ['02', 'Interview', 'Answer 6–10 tailored questions with live follow-ups.'],
                          ['03', 'Score', 'Get graded on clarity, structure, confidence & fit.'],
                          ['04', 'Improve', 'Apply the rewrites, re-run, and watch your score climb.']].map(([n, t, d]) => (
                            <div key={n} className="card" style={{ padding: 26, borderRadius: 'var(--r-l)' }}>
                                <div className="label" style={{ color: 'var(--gold)' }}>{n}</div>
                                <h3 className="h4" style={{ marginTop: 14 }}>{t}</h3>
                                <p className="sm" style={{ marginTop: 8 }}>{d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BENEFITS */}
            <section style={{ padding: '60px 0' }}>
                <div className="wrap-wide">
                    <div className="grid gap-20" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                        {[['Built from your résumé', 'Questions reference your actual experience and the exact job — so prep transfers directly to the real interview.'],
                          ['Brutally specific feedback', 'Not a vague grade. Quotable notes tied to what you said, plus the precise lines to rewrite.'],
                          ['Progress you can feel', "A score that climbs session over session, with history per role — proof you're getting ready."]].map(([t, d]) => (
                            <div key={t} className="card-glass" style={{ padding: 28, borderRadius: 'var(--r-xl)' }}>
                                <h3 className="h4">{t}</h3>
                                <p className="body-t" style={{ marginTop: 10 }}>{d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PREMIUM CTA */}
            <section style={{ padding: '60px 0 100px' }}>
                <div className="wrap-wide">
                    <div className="card-gold rel tc" style={{ borderRadius: 'var(--r-2xl)', padding: '72px 40px', overflow: 'hidden' }}>
                        <div className="glow-gold" style={{ width: 560, height: 360, left: '50%', top: -100, transform: 'translateX(-50%)' }} />
                        <div className="rel">
                            <Badge variant="gold" dot style={{ margin: '0 auto 22px' }}>Premium</Badge>
                            <h2 className="h1" style={{ maxWidth: '20ch', margin: '0 auto' }}>The cost of one under-prepared interview is the job.</h2>
                            <p className="lead" style={{ margin: '18px auto 0', maxWidth: '42ch' }}>Unlimited mock interviews and scored reports for less than a coffee a week.</p>
                            <div className="row ac jc gap-16" style={{ marginTop: 34 }}>
                                <a href="/coach/checkout" onClick={go('/coach/checkout')} className="btn btn-gold btn-lg">Get Coach Unlimited · ₹1,599/mo</a>
                                <a href="/coach/checkout?plan=session" onClick={go('/coach/checkout?plan=session')} className="btn btn-outline btn-lg">Single session · ₹599</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
