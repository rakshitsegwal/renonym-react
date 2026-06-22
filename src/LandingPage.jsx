import React, { useState, useEffect } from 'react';
import { AuthModal, UserPill } from './AuthModal.jsx';
import { FileText, Mic, BarChart3, MessageSquare, BarChart2, Check, ShieldCheck, Lock, ChevronDown } from 'lucide-react';
import { ScoreRing, Meter, Badge } from './coach/primitives.jsx';
import './coach.css';
import DemoInterview from './DemoInterview.jsx';
import { track } from './analytics.js';

// S1 — Landing (dark/gold reskin). Rebuilt for conversion of Indian Meta-ad
// traffic: ONE dominant CTA (free résumé builder, no card), mobile-first,
// India-relevant personas/proof, risk reversal + FAQ. The paid Coach is the
// secondary, de-emphasised path — never the loudest pixel on a cold visit.
export default function LandingPage({ onGetStarted, onStartAi, onOpenJobMatch, onGoToDashboard, onNavigate, onNavigateLegal, onLogin, onLogout, currentUser }) {
    const [showLogin, setShowLogin] = useState(false);
    const go = (p) => () => (onNavigate ? onNavigate(p) : onGetStarted());

    const scrollTo = (id) => (e) => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        try { history.replaceState(null, '', '#' + id); } catch {}   // deep-linkable sections
    };

    // funnel step 1 — a visitor reached the landing (fires once)
    useEffect(() => { track('landing_view'); }, []);

    // deep link: /#pricing etc. scrolls on first load
    useEffect(() => {
        const id = (window.location.hash || '').slice(1);
        if (!id) return;
        const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 120);
        return () => clearTimeout(t);
    }, []);

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
                            <a href="#resume" onClick={scrollTo('resume')}>Résumé Builder</a>
                            <a href="/coach" onClick={(e) => { e.preventDefault(); go('/coach')(); }}>Interview Coach</a>
                            <a href="#how" onClick={scrollTo('how')}>How it works</a>
                            <a href="#pricing" onClick={scrollTo('pricing')}>Pricing</a>
                        </div>
                    </div>
                    <div className="row ac gap-16">
                        {currentUser
                            ? <div className="row ac gap-12">
                                <button className="btn btn-ghost btn-sm" onClick={onGoToDashboard}>Dashboard →</button>
                                <UserPill user={currentUser} onLogout={onLogout} />
                              </div>
                            : <>
                                <button className="sm t2" style={{ fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => (onLogin ? setShowLogin(true) : onGetStarted())}>Sign in</button>
                                <button className="btn btn-gold" onClick={go('/coach/new')}>Start free</button>
                              </>}
                    </div>
                </div>
            </nav>

            {/* HERO — the page OPENS AS the interview: pill + one-line instruction, then the LIVE demo above the fold */}
            <header className="rel" style={{ overflow: 'hidden' }}>
                <div className="glow-gold" style={{ width: 700, height: 520, right: -120, top: -180 }} />
                <div className="wrap tc" style={{ maxWidth: 680, padding: '34px 18px 10px' }}>
                    <div className="pill" style={{ marginBottom: 16 }}><span className="dot" />AI Interview Coach · Made in India</div>
                    <h1 style={{ fontFamily: 'var(--rn-serif)', fontWeight: 400, fontSize: 'clamp(21px,5.4vw,34px)', lineHeight: 1.25, color: 'var(--text)' }}>
                        Answer one real interview question.<br /><span className="italic gold">Get your AI scorecard — free, now.</span>
                    </h1>
                </div>
                {/* the LIVE interview — question + answer box above the fold; scores render in place, no navigation */}
                <DemoInterview heroMode onStartFull={go('/coach/new')} />
            </header>

            {/* RISK-REVERSAL STRIP — neutralise the first-timer fears immediately */}
            <div className="wrap-wide" style={{ padding: '0 48px 10px' }}>
                <div className="grid g-3 gap-16" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                    {[
                        [Check, 'Start free', 'No card, no signup to build your résumé.'],
                        [ShieldCheck, 'One-time payments', 'No subscription. No auto-renew. Ever.'],
                        [Lock, 'Your résumé stays private', 'We never share it. Delete it anytime.'],
                    ].map(([Icon, t, d]) => (
                        <div key={t} className="row ac gap-12 card-glass" style={{ padding: '14px 18px', borderRadius: 'var(--r-l)', borderColor: 'var(--line-2)' }}>
                            <span style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--gold-soft)', border: '1px solid var(--gold-line)', display: 'grid', placeItems: 'center', flex: 'none' }}><Icon size={16} color="var(--gold)" /></span>
                            <div style={{ minWidth: 0 }}><div className="sm" style={{ color: 'var(--text)', fontWeight: 600 }}>{t}</div><div className="xs">{d}</div></div>
                        </div>
                    ))}
                </div>
                <div className="xs tc" style={{ marginTop: 14 }}>₹ pricing · pay with UPI &amp; cards via <b style={{ color: 'var(--text-2)' }}>Razorpay</b></div>
            </div>

            {/* TRUST STRIP — India-relevant, replaces aspirational US logos */}
            <div className="wrap-wide" style={{ padding: '26px 48px 40px' }}>
                <div className="label tc" style={{ marginBottom: 18 }}>Built for the interviews Indian job seekers actually face</div>
                <div className="row jc wrap-f gap-32" style={{ opacity: 0.62 }}>
                    {['TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 'Deloitte', 'Amazon', 'Flipkart'].map(b => (
                        <span key={b} className="h5" style={{ color: 'var(--muted)' }}>{b}</span>
                    ))}
                </div>
                <div className="xs tc" style={{ marginTop: 16 }}>Campus drives · walk-ins · lateral switches — freshers to experienced.</div>
            </div>

            {/* HOW IT WORKS — 3 steps, blank page to ready */}
            <section id="how" style={{ padding: '64px 0' }}>
                <div className="wrap-wide">
                    <div className="tc" style={{ marginBottom: 48 }}>
                        <span className="eyebrow">How it works</span>
                        <h2 className="h1" style={{ marginTop: 16 }}>How Renonym gets you ready</h2>
                    </div>
                    <div className="grid gap-24 g-3" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                        {[
                            ['1', FileText, 'Build & tailor', 'Make an ATS-clean résumé, then paste any job description. The AI rewrites your bullets to match the role in one click.'],
                            ['2', Mic, 'Practise the real interview', 'A mock built from your résumé and that exact job. Voice or text. The AI asks follow-ups — just like a real panel.'],
                            ['3', BarChart3, 'Fix what’s weak', 'A scored report — clarity, structure, confidence & fit — with the exact lines to rewrite before you face the real one.'],
                        ].map(([n, Icon, title, body]) => (
                            <div key={n} className="card" style={{ padding: 30, borderRadius: 'var(--r-xl)' }}>
                                <div className="row ac jsb" style={{ marginBottom: 18 }}>
                                    <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gold-soft)', border: '1px solid var(--gold-line)', display: 'grid', placeItems: 'center' }}><Icon size={20} color="var(--gold)" /></span>
                                    <span className="display" style={{ fontSize: 40, lineHeight: 1, color: 'var(--line-3)' }}>{n}</span>
                                </div>
                                <h3 className="h4">{title}</h3>
                                <p className="body-t" style={{ marginTop: 10 }}>{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* INTERVIEW COACH — the LEAD section (ads sell the coach; first interview free) */}
            <section id="coach" style={{ padding: '40px 0 84px' }}>
                <div className="wrap-wide">
                    <div className="card-gold rel" style={{ borderRadius: 'var(--r-2xl)', overflow: 'hidden' }}>
                        <div className="glow-gold" style={{ width: 520, height: 520, right: -120, top: -160 }} />
                        <div className="grid rel g-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div style={{ padding: 64 }}>
                                <Badge variant="gold" dot>The Interview Coach</Badge>
                                <h2 className="h1" style={{ marginTop: 24 }}>Most people lose the offer in the <span className="italic gold">interview</span> — not the résumé.</h2>
                                <p className="lead" style={{ marginTop: 22, maxWidth: '42ch' }}>You get one shot in the room. Renonym’s AI Coach runs a realistic mock for your exact role, asks the tough follow-ups, and scores every answer — so the real interview isn’t the first time you say it out loud.</p>
                                <div className="col gap-16" style={{ marginTop: 34 }}>
                                    {['Adaptive follow-ups that probe like a real interviewer', 'Scored report across clarity, structure, confidence & fit', 'Track every session and watch your score climb'].map(t => (
                                        <div key={t} className="row ac gap-12"><span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 18, height: 18 }}><Check size={13} color="var(--green)" /></span><span className="body-t" style={{ color: 'var(--text-2)' }}>{t}</span></div>
                                    ))}
                                </div>
                                <div className="row ac gap-16 wrap-f" style={{ marginTop: 38 }}>
                                    <button className="btn btn-gold btn-lg" onClick={go('/coach/new')}>Start a free mock interview</button>
                                    <button className="btn btn-outline btn-lg" onClick={scrollTo('pricing')}>One-time · no subscription</button>
                                </div>
                            </div>
                            <div style={{ padding: '48px 64px 48px 0', display: 'flex', alignItems: 'center' }}>
                                <div className="card-2" style={{ width: '100%', borderRadius: 'var(--r-xl)', padding: 28, boxShadow: 'var(--shadow-l)' }}>
                                    <div className="row ac jsb" style={{ marginBottom: 22 }}>
                                        <div><div className="label">Session report</div><div className="h4" style={{ marginTop: 4 }}>Backend Engineer · Flipkart</div></div>
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

            {/* RÉSUMÉ BUILDER — secondary free tool */}
            <section id="resume" style={{ padding: '40px 0 84px' }}>
                <div className="wrap-wide grid lp-split" style={{ gridTemplateColumns: '0.92fr 1.08fr', gap: 64, alignItems: 'center' }}>
                    <div>
                        <Badge>Also free</Badge>
                        <h2 className="h1" style={{ marginTop: 22 }}>And a résumé built to clear<br />ATS — and earn the call.</h2>
                        <p className="lead" style={{ marginTop: 20, maxWidth: '40ch' }}>10 templates, 4 clean layouts, AI that rewrites weak bullets, and 1-click tailoring to any job description. Export an ATS-friendly PDF free — no design skills needed.</p>
                        <div className="row gap-32 wrap-f" style={{ marginTop: 34 }}>
                            {[['10', 'polished templates'], ['4', 'designer layouts'], ['1-click', 'JD tailoring']].map(([v, l]) => (
                                <div key={l}><div className="h2" style={{ fontSize: 34 }}>{v}</div><div className="sm" style={{ marginTop: 4 }}>{l}</div></div>
                            ))}
                        </div>
                        <div className="row gap-12 wrap-f" style={{ marginTop: 34 }}>
                            <button className="btn btn-outline btn-lg" onClick={onGetStarted}>Build my résumé — free</button>
                            <button className="btn btn-outline btn-lg" onClick={onOpenJobMatch}>Check my job-match score</button>
                        </div>
                    </div>
                    <div className="card" style={{ padding: 22, borderRadius: 'var(--r-2xl)' }}>
                        <div className="row ac jsb" style={{ padding: '0 6px 16px' }}>
                            <span className="label">Live preview · tailored to Flipkart</span>
                            <Badge variant="green" dot>ATS 94</Badge>
                        </div>
                        {/* the one light surface — résumé paper */}
                        <div style={{ background: '#F3F1EB', color: '#1a1a1a', borderRadius: 14, padding: '38px 42px' }}>
                            <div style={{ fontFamily: 'var(--rn-serif)', fontSize: 30, color: '#111' }}>Priya Sharma</div>
                            <div style={{ fontSize: 13, color: '#666', marginTop: 3, letterSpacing: '.02em' }}>Software Engineer · Pune · B.Tech CSE · priya.sharma@email.com</div>
                            <div style={{ height: 1, background: '#d4cfc2', margin: '18px 0' }} />
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#8a8474' }}>Experience</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginTop: 10 }}>Software Engineer · Flipkart</div>
                            <div style={{ fontSize: 13, color: '#444', lineHeight: 1.6, marginTop: 5 }}>Built a payments feature used by <b style={{ background: '#e8d9b0', padding: '0 3px', borderRadius: 3 }}>2L+ users</b>, working across backend, QA &amp; design.</div>
                            <div style={{ fontSize: 13, color: '#444', lineHeight: 1.6, marginTop: 7 }}>Cut checkout API latency 38% via caching and query optimisation.</div>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#8a8474', marginTop: 18 }}>Skills</div>
                            <div style={{ fontSize: 13, color: '#444', marginTop: 6 }}>Java · Spring Boot · React · SQL · System Design</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" style={{ padding: '40px 0 60px' }}>
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
                            [BarChart2, 'Application tracker', 'Every job, stage, recruiter note and follow-up in one pipeline — wired straight into your résumé and interview prep.', false],
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

            {/* PRICING — numbers in sync with the server PLANS (reprice 2026-06) */}
            <section id="pricing" style={{ padding: '64px 0' }}>
                <div className="wrap-wide">
                    <div className="tc" style={{ marginBottom: 32 }}>
                        <span className="eyebrow">Pricing</span>
                        <h2 className="h1" style={{ marginTop: 16 }}>Free to build. <span className="italic gold">₹49</span> to practise.</h2>
                        <p className="lead" style={{ marginTop: 14 }}>One-time payments. No subscription, no auto-renew — ever.</p>
                    </div>
                    {/* tripwire callout — the smallest first 'yes' */}
                    <div className="card-gold tc" style={{ maxWidth: 660, margin: '0 auto 30px', padding: '18px 24px', borderColor: 'var(--gold-line)' }}>
                        <span className="body-t">Just want to try it? Your first interview is <b className="gold">₹49</b> — full scored report, one-time. Or the <b style={{ color: 'var(--text)' }}>Prep Pack: 3 interviews for ₹199</b>.</span>
                    </div>
                    <div className="grid gap-24 g-3" style={{ gridTemplateColumns: 'repeat(3,1fr)', alignItems: 'stretch' }}>
                        <PriceCard name="Free" price="₹0" sub="Forever" feats={['Résumé builder + 3 templates', 'Free ATS PDF export', 'Unlimited JD match scores', '1 free interview + full report', '2 AI credits at signup', 'Full application tracker']} cta="Start free" onClick={onGetStarted} />
                        <PriceCard featured name="Season Pass" price="₹699" per="/90 days" sub="MOST POPULAR · one-time" feats={['8 full interviews (audio + text)', 'Unlimited AI actions', 'All 10 templates', 'Full scored reports']} cta="Get the Season Pass" onClick={go('/coach/new')} />
                        <PriceCard name="Placement Pro" price="₹1,499" per="/90 days" sub="For an all-out search" feats={['25 full interviews', 'Everything in Season Pass', 'Priority support']} cta="Go Pro" onClick={go('/coach/new')} />
                    </div>
                    <p className="xs tc" style={{ marginTop: 20 }}>Also one-time: Single Interview ₹49 · Prep Pack ₹199 (3 interviews) · Boost Pack ₹299 (+10 AI credits). No subscriptions, ever.</p>
                </div>
            </section>

            {/* FAQ — answers the four first-timer fears */}
            <section id="faq" style={{ padding: '40px 0 80px' }}>
                <div className="wrap" style={{ maxWidth: 760 }}>
                    <div className="tc" style={{ marginBottom: 40 }}>
                        <span className="eyebrow">FAQ</span>
                        <h2 className="h1" style={{ marginTop: 16 }}>Questions, answered</h2>
                    </div>
                    <div className="col gap-12">
                        {[
                            ['Is Renonym really free to start?', 'Yes. Build an ATS-ready résumé, export a clean PDF, and run unlimited job-match scores without paying — or even adding a card. You only pay if you want full AI mock interviews.'],
                            ['Do I have to pay to try a mock interview?', 'No — your first practice interview is on us. After that, interviews are simple one-time purchases. There is no subscription and nothing auto-renews.'],
                            ['Will this actually help me get hired?', 'Your mock is built from your own résumé and the exact job you’re targeting. The AI asks real follow-ups and scores every answer, so you walk into the real interview already rehearsed — not winging it for the first time.'],
                            ['Is my résumé and data safe?', 'Your résumé is private. We never sell or share it, and you can delete it from your account at any time.'],
                            ['How do payments work?', 'Securely through Razorpay — UPI, cards and net-banking. Every paid plan is a one-time payment, and we never store your card details.'],
                            ['What if I run into a problem?', 'A real person — not a bot — will help you. Reach out any time and we’ll sort it out.'],
                        ].map(([q, a]) => <FaqItem key={q} q={q} a={a} />)}
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section style={{ padding: '20px 0 84px' }}>
                <div className="wrap tc" style={{ maxWidth: 720 }}>
                    <h2 className="h1">Walk in already knowing<br />what they'll <span className="italic gold">ask</span>.</h2>
                    <div className="row jc" style={{ marginTop: 28 }}>
                        <button className="btn btn-gold btn-lg" onClick={go('/coach/new')}>Start my free mock interview</button>
                    </div>
                    <p className="sm" style={{ marginTop: 14 }}>First interview free · no card needed.</p>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ borderTop: '1px solid var(--line)', padding: '48px 0 40px' }}>
                <div className="wrap-wide row jsb wrap-f gap-32">
                    <div style={{ maxWidth: 280 }}>
                        <div className="brand" style={{ marginBottom: 14 }}><div className="mark">R</div><div className="wm">Re<b>nonym</b></div></div>
                        <p className="sm">Build your résumé. Practise your interview. Get hired.</p>
                    </div>
                    <div className="row gap-48 wrap-f">
                        <FootCol head="Product" links={[['Résumé Builder', onGetStarted], ['Interview Coach', go('/coach')], ['Pricing', scrollTo('pricing')]]} />
                        <FootCol head="Company" links={[['About', () => onNavigateLegal && onNavigateLegal('about')], ['Privacy', () => onNavigateLegal && onNavigateLegal('privacy')], ['Terms', () => onNavigateLegal && onNavigateLegal('terms')]]} />
                    </div>
                </div>
                <div className="wrap-wide xs" style={{ marginTop: 36 }}>© 2026 Renonym AI. All rights reserved.</div>
            </footer>

            {/* spacer + mobile sticky CTA — keeps the one action in thumb reach */}
            <div className="lp-foot-pad" />
            <div className="lp-stick">
                <button className="btn btn-gold" onClick={() => {
                    const ta = document.querySelector('#demo textarea');
                    if (ta) { ta.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => ta.focus(), 300); }
                    else go('/coach/new')();
                }}>Answer the question — it's free →</button>
            </div>
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
function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="card" style={{ padding: 0, borderRadius: 'var(--r-l)', overflow: 'hidden' }}>
            <button className="row ac jsb" onClick={() => setOpen(o => !o)}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '18px 22px', gap: 16 }}>
                <span className="h5" style={{ color: 'var(--text)' }}>{q}</span>
                <ChevronDown size={18} color="var(--muted)" style={{ flex: 'none', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
            </button>
            {open && <p className="body-t" style={{ padding: '0 22px 20px' }}>{a}</p>}
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
