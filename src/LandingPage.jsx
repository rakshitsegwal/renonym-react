import React, { useState, useEffect } from 'react';
import { AuthModal } from './AuthModal.jsx';
import { FileText, Mic, BarChart3, MessageSquare, BarChart2, Check } from 'lucide-react';
import { VoiceOrb, Waveform, ScoreRing, Meter, Badge } from './coach/primitives.jsx';
import './coach.css';

// S1 — Landing (dark/gold reskin, recreated from designs/screens/01-landing-desktop.html).
// Coach-led hero; the résumé builder is the free on-ramp. Existing résumé entry
// points (onGetStarted/onStartAi/onOpenJobMatch) are preserved.
export default function LandingPage({ onGetStarted, onStartAi, onOpenJobMatch, onGoToDashboard, onNavigate, onNavigateLegal, onLogin, currentUser }) {
    const [showLogin, setShowLogin] = useState(false);
    const go = (p) => () => (onNavigate ? onNavigate(p) : onGetStarted());
    const scrollTo = (id) => (e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };

    return (
        <div className="rn-dark">
            {showLogin && <AuthModal reason="continue" onClose={() => setShowLogin(false)}
                onAuth={(token, user) => { localStorage.setItem('rn-auth-token', token); localStorage.setItem('rn-auth-user', JSON.stringify(user)); setShowLogin(false); onLogin && onLogin(); }} />}

            {/* NAV */}
            <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,11,13,0.72)', backdropFilter: 'blur(18px)', borderBottom: '1px solid var(--line)' }}>
                <div className="wrap-wide topnav">
                    <div className="row ac gap-40">
                        <div className="brand"><div className="mark">R</div><div className="wm">Re<b>nonym</b></div></div>
                        <div className="navlinks">
                            <a href="/coach" onClick={(e) => { e.preventDefault(); go('/coach')(); }}>Interview Coach</a>
                            <a href="#resume" onClick={scrollTo('resume')}>Résumé Builder</a>
                            <a href="#pricing" onClick={scrollTo('pricing')}>Pricing</a>
                            <a href="#how" onClick={scrollTo('how')}>How it works</a>
                        </div>
                    </div>
                    <div className="row ac gap-16">
                        {currentUser
                            ? <button className="btn btn-ghost btn-sm" onClick={onGoToDashboard}>Dashboard →</button>
                            : <>
                                <button className="sm t2" style={{ fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => (onLogin ? setShowLogin(true) : onGetStarted())}>Sign in</button>
                                <button className="btn btn-gold" onClick={onGetStarted}>Get started</button>
                              </>}
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <header className="rel" style={{ overflow: 'hidden' }}>
                <div className="glow-gold" style={{ width: 700, height: 520, right: -120, top: -180 }} />
                <div className="wrap-wide grid lp-hero" style={{ gridTemplateColumns: '1.05fr 0.95fr', gap: 56, alignItems: 'center', padding: '80px 48px 70px' }}>
                    <div>
                        <div className="pill" style={{ marginBottom: 26 }}><span className="dot" />Your AI job-preparation platform</div>
                        <h1 className="display">Build your résumé.<br /><span className="italic gold">Practice</span> your interview.<br />Get hired.</h1>
                        <p className="lead" style={{ marginTop: 26, maxWidth: '34ch' }}>Renonym tailors your résumé to the role, then puts you through the exact interview it earns you — with an AI coach that scores every answer.</p>
                        <div className="row ac gap-16 wrap-f" style={{ marginTop: 36 }}>
                            <button className="btn btn-gold btn-lg" onClick={go('/coach/new')}>Practice an interview</button>
                            <button className="btn btn-outline btn-lg" onClick={onGetStarted}>Build a résumé free</button>
                        </div>
                        <div className="row ac gap-24 wrap-f" style={{ marginTop: 34 }}>
                            <div className="row ac gap-8"><Check size={15} color="var(--green)" /><span className="sm">Free résumé builder — no card needed</span></div>
                            <div className="row ac gap-8"><Check size={15} color="var(--green)" /><span className="sm">Every interview returns a scored report</span></div>
                        </div>
                    </div>

                    {/* product demo: voice session */}
                    <div className="card rel" style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-l)' }}>
                        <div className="row ac jsb" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', background: 'var(--bg-1)' }}>
                            <div className="row ac gap-10"><Badge variant="gold" dot>Live session</Badge><span className="label">Behavioral · Stripe</span></div>
                            <Badge variant="blue">Voice</Badge>
                        </div>
                        <div style={{ padding: 30 }}>
                            <div className="label" style={{ marginBottom: 10 }}>Coach asks · Q2 of 6</div>
                            <p className="h4" style={{ fontFamily: 'var(--rn-serif)', fontWeight: 400, fontSize: 25, lineHeight: 1.3 }}>“Tell me about a time you shipped a product with incomplete data.”</p>
                            <div className="col ac" style={{ margin: '34px 0 26px' }}>
                                <VoiceOrb size={104} state="listening" />
                                <Waveform bars={11} live height={42} style={{ marginTop: 24 }} />
                                <div className="pill" style={{ marginTop: 22 }}><span className="dot" />Listening — speak naturally</div>
                            </div>
                            <div className="divider" style={{ marginBottom: 16 }} />
                            <div className="row ac jsb">
                                <span className="xs">Answer 2 / 6 · 12:30 remaining</span>
                                <div className="row gap-8"><Badge variant="green">Clarity 84</Badge><Badge variant="amber">Add a metric</Badge></div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* TRUST MARQUEE */}
            <div className="wrap-wide" style={{ padding: '8px 48px 40px' }}>
                <div className="label tc" style={{ marginBottom: 24 }}>Practice for interviews at companies like</div>
                <div className="row jc wrap-f gap-40" style={{ opacity: 0.6 }}>
                    {['Stripe', 'Figma', 'Linear', 'Notion', 'Vercel', 'Ramp', 'Airbnb', 'Datadog'].map(b => (
                        <span key={b} className="h5" style={{ color: 'var(--muted)' }}>{b}</span>
                    ))}
                </div>
            </div>

            {/* INTERVIEW COACH — premium hero */}
            <section id="coach" style={{ padding: '96px 0' }}>
                <div className="wrap-wide">
                    <div className="card-gold rel" style={{ borderRadius: 'var(--r-2xl)', overflow: 'hidden' }}>
                        <div className="glow-gold" style={{ width: 520, height: 520, right: -120, top: -160 }} />
                        <div className="grid rel g-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div style={{ padding: 64 }}>
                                <Badge variant="gold" dot>Premium · The Interview Coach</Badge>
                                <h2 className="h1" style={{ marginTop: 24 }}>The interview is where<br />offers are <span className="italic gold">won or lost</span>.</h2>
                                <p className="lead" style={{ marginTop: 22, maxWidth: '42ch' }}>Most people walk in under-rehearsed. Renonym's AI Coach runs realistic mock interviews drawn from your résumé and the exact job — voice or text — then tells you precisely what to fix.</p>
                                <div className="col gap-16" style={{ marginTop: 34 }}>
                                    {['Adaptive follow-ups that probe like a real interviewer', 'Scored report across clarity, structure, confidence & fit', 'Track every session and watch your score climb'].map(t => (
                                        <div key={t} className="row ac gap-12"><span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 18, height: 18 }}><Check size={13} color="var(--green)" /></span><span className="body-t" style={{ color: 'var(--text-2)' }}>{t}</span></div>
                                    ))}
                                </div>
                                <div className="row ac gap-16" style={{ marginTop: 38 }}>
                                    <button className="btn btn-gold btn-lg" onClick={go('/coach')}>Explore the Coach</button>
                                    <button className="btn btn-outline btn-lg" onClick={scrollTo('pricing')}>From ₹1,599/mo</button>
                                </div>
                            </div>
                            <div style={{ padding: '48px 64px 48px 0', display: 'flex', alignItems: 'center' }}>
                                <div className="card-2" style={{ width: '100%', borderRadius: 'var(--r-xl)', padding: 28, boxShadow: 'var(--shadow-l)' }}>
                                    <div className="row ac jsb" style={{ marginBottom: 22 }}>
                                        <div><div className="label">Session report</div><div className="h4" style={{ marginTop: 4 }}>Senior PM · Stripe</div></div>
                                        <ScoreRing value={72} size={78} stroke={6} label="" />
                                    </div>
                                    <div className="col gap-14">
                                        {[['Communication', 84], ['Structure', 78], ['Specificity', 54]].map(([k, v]) => (
                                            <div key={k}><div className="row jsb xs" style={{ marginBottom: 6 }}><span style={{ color: 'var(--text-2)' }}>{k}</span><span className={v < 60 ? 'amber-t' : 'gold'}>{v}</span></div><Meter value={v} /></div>
                                        ))}
                                    </div>
                                    <div className="divider" style={{ margin: '20px 0 16px' }} />
                                    <div className="row ac jsb"><Badge variant="green">▲ +14 vs last rep</Badge><button className="sm gold" style={{ fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }} onClick={go('/coach')}>Open report →</button></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* RÉSUMÉ BUILDER (free on-ramp) */}
            <section id="resume" style={{ padding: '40px 0 96px' }}>
                <div className="wrap-wide grid lp-split" style={{ gridTemplateColumns: '0.92fr 1.08fr', gap: 64, alignItems: 'center' }}>
                    <div>
                        <Badge>Free to start</Badge>
                        <h2 className="h1" style={{ marginTop: 22 }}>A résumé that earns<br />the interview.</h2>
                        <p className="lead" style={{ marginTop: 20, maxWidth: '40ch' }}>Generate and tailor a recruiter-ready résumé to any job description in minutes. ATS-clean, beautifully typeset, and the on-ramp into your interview prep.</p>
                        <div className="row gap-32 wrap-f" style={{ marginTop: 34 }}>
                            {[['10', 'polished templates'], ['4', 'designer layouts'], ['1-click', 'JD tailoring']].map(([v, l]) => (
                                <div key={l}><div className="h2" style={{ fontSize: 34 }}>{v}</div><div className="sm" style={{ marginTop: 4 }}>{l}</div></div>
                            ))}
                        </div>
                        <div className="row gap-12 wrap-f" style={{ marginTop: 34 }}>
                            <button className="btn btn-ghost btn-lg" onClick={onGetStarted}>Build your résumé →</button>
                            <button className="btn btn-outline btn-lg" onClick={onOpenJobMatch}>Job-match optimizer</button>
                        </div>
                    </div>
                    <div className="card" style={{ padding: 22, borderRadius: 'var(--r-2xl)' }}>
                        <div className="row ac jsb" style={{ padding: '0 6px 16px' }}>
                            <span className="label">Live preview · tailored to Stripe</span>
                            <Badge variant="green" dot>ATS 94</Badge>
                        </div>
                        {/* the one light surface — résumé paper */}
                        <div style={{ background: '#F3F1EB', color: '#1a1a1a', borderRadius: 14, padding: '38px 42px' }}>
                            <div style={{ fontFamily: 'var(--rn-serif)', fontSize: 30, color: '#111' }}>Maya Chen</div>
                            <div style={{ fontSize: 13, color: '#666', marginTop: 3, letterSpacing: '.02em' }}>Senior Product Manager · San Francisco · maya@chen.co</div>
                            <div style={{ height: 1, background: '#d4cfc2', margin: '18px 0' }} />
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#8a8474' }}>Experience</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginTop: 10 }}>Product Manager · Brex</div>
                            <div style={{ fontSize: 13, color: '#444', lineHeight: 1.6, marginTop: 5 }}>Led 0→1 launch of a payments product to <b style={{ background: '#e8d9b0', padding: '0 3px', borderRadius: 3 }}>$4M ARR in 3 quarters</b>, partnering across eng, design &amp; risk.</div>
                            <div style={{ fontSize: 13, color: '#444', lineHeight: 1.6, marginTop: 7 }}>Scaled activation 38% via onboarding redesign and pricing experiments.</div>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#8a8474', marginTop: 18 }}>Skills</div>
                            <div style={{ fontSize: 13, color: '#444', marginTop: 6 }}>Payments · 0→1 · Experimentation · SQL · Roadmapping</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section id="how" style={{ padding: '60px 0' }}>
                <div className="wrap-wide">
                    <div className="tc" style={{ marginBottom: 54 }}>
                        <span className="eyebrow">Everything for the hunt</span>
                        <h2 className="h1" style={{ marginTop: 18 }}>One platform, blank page to signed offer</h2>
                    </div>
                    <div className="grid gap-24 g-3" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                        {[
                            [FileText, 'Résumé tailoring', 'Paste a job description; the AI rewrites and quantifies your bullets to match — keyword-aligned and ATS-safe.', false],
                            [Mic, 'Voice mock interviews', 'Speak your answers to a coach that listens, follows up, and reacts in real time — the closest thing to the real room.', true],
                            [BarChart3, 'Scored reports', 'Every session returns a graded breakdown with strengths, gaps, and the specific lines to rewrite before the real thing.', false],
                            [MessageSquare, 'Text interviews', 'Prefer to type? Run the same adaptive interview in writing to structure your thinking before you say it aloud.', false],
                            [BarChart2, 'Progress tracking', 'Your score trend, per-role history, and a dashboard that gives you a reason to come back until you land it.', false],
                            [Check, 'Import & restyle', 'Upload your existing PDF or DOCX résumé — Renonym parses it and re-typesets it into any template instantly.', false],
                        ].map(([Icon, title, body, premium]) => (
                            <div key={title} className="card-glass" style={{ padding: 28, borderRadius: 'var(--r-xl)', borderColor: premium ? 'var(--gold-line)' : 'var(--line-2)' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gold-soft)', border: '1px solid var(--gold-line)', display: 'grid', placeItems: 'center', marginBottom: 20 }}><Icon size={20} color="var(--gold)" /></div>
                                <div className="row ac gap-8"><h3 className="h4">{title}</h3>{premium && <Badge variant="gold">Premium</Badge>}</div>
                                <p className="body-t" style={{ marginTop: 10 }}>{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section id="pricing" style={{ padding: '80px 0' }}>
                <div className="wrap-wide">
                    <div className="tc" style={{ marginBottom: 48 }}>
                        <span className="eyebrow">Pricing</span>
                        <h2 className="h1" style={{ marginTop: 16 }}>Free to build. Pay to practice.</h2>
                    </div>
                    <div className="grid gap-24 g-3" style={{ gridTemplateColumns: 'repeat(3,1fr)', alignItems: 'stretch' }}>
                        <PriceCard name="Résumé" price="Free" sub="The on-ramp" feats={['AI résumé builder & tailoring', 'ATS score & job-match optimizer', 'Watermarked preview']} cta="Start building" onClick={onGetStarted} />
                        <PriceCard featured name="Coach Unlimited" price="₹1,599" per="/mo" sub="Best value · cancel anytime" feats={['Unlimited voice & text interviews', 'Full scored reports + history', 'Everything in Résumé']} cta="Get Coach Unlimited" onClick={go('/coach')} />
                        <PriceCard name="Session Pass" price="₹599" sub="One-time" feats={['One full interview', 'One scored report', 'No subscription']} cta="Buy a session" onClick={go('/coach/new')} />
                    </div>
                    <p className="xs tc" style={{ marginTop: 20 }}>The AI Interview Coach is a premium feature — every interview includes a full scored report.</p>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ borderTop: '1px solid var(--line)', padding: '48px 0 40px' }}>
                <div className="wrap-wide row jsb wrap-f gap-32">
                    <div style={{ maxWidth: 280 }}>
                        <div className="brand" style={{ marginBottom: 14 }}><div className="mark">R</div><div className="wm">Re<b>nonym</b></div></div>
                        <p className="sm">Build your résumé. Practice your interview. Get hired.</p>
                    </div>
                    <div className="row gap-48 wrap-f">
                        <FootCol head="Product" links={[['Interview Coach', go('/coach')], ['Résumé Builder', onGetStarted], ['Pricing', scrollTo('pricing')]]} />
                        <FootCol head="Company" links={[['About', () => onNavigateLegal && onNavigateLegal('about')], ['Privacy', () => onNavigateLegal && onNavigateLegal('privacy')], ['Terms', () => onNavigateLegal && onNavigateLegal('terms')]]} />
                    </div>
                </div>
                <div className="wrap-wide xs" style={{ marginTop: 36 }}>© 2026 Renonym AI. All rights reserved.</div>
            </footer>
        </div>
    );
}

function PriceCard({ name, price, per, sub, feats, cta, onClick, featured }) {
    return (
        <div className={featured ? 'card-gold' : 'card'} style={{ padding: 32, borderRadius: 'var(--r-xl)', borderColor: featured ? 'var(--gold-line)' : 'var(--line)', display: 'flex', flexDirection: 'column' }}>
            {featured && <Badge variant="gold" dot style={{ marginBottom: 14 }}>Most popular</Badge>}
            <div className="h4">{name}</div>
            <div className="row ae gap-6" style={{ marginTop: 10 }}><span className="h1" style={{ fontSize: 44 }}>{price}</span>{per && <span className="sm" style={{ paddingBottom: 10 }}>{per}</span>}</div>
            <div className="sm" style={{ marginTop: 4, marginBottom: 22 }}>{sub}</div>
            <div className="col gap-12" style={{ flex: 1 }}>
                {feats.map(f => <div key={f} className="row ac gap-10 sm" style={{ color: 'var(--text-2)' }}><Check size={14} color="var(--green)" />{f}</div>)}
            </div>
            <button className={'btn ' + (featured ? 'btn-gold' : 'btn-outline') + ' btn-block'} style={{ marginTop: 24 }} onClick={onClick}>{cta}</button>
        </div>
    );
}
function FootCol({ head, links }) {
    return (
        <div className="col gap-10">
            <div className="label">{head}</div>
            {links.map(([t, fn]) => <button key={t} className="sm" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--muted)' }} onClick={fn}>{t}</button>)}
        </div>
    );
}
