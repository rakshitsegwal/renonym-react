import React, { useState, useEffect } from 'react';
import { AuthModal } from './AuthModal.jsx';
import PaymentButton from './PaymentButton.jsx';
import './landing.css';

export default function LandingPage({ onGetStarted, onStartAi, onOpenJobMatch, onLogin, onGoToDashboard, currentUser }) {
    const [pricingPeriod, setPricingPeriod] = useState('yearly');
    const [scrolled, setScrolled] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', h, { passive: true });
        return () => window.removeEventListener('scroll', h);
    }, []);

    const price = { monthly: { pro: 599 }, yearly: { pro: 499 } }[pricingPeriod];

    return (
        <div className="lp">
            {showLoginModal && (
                <AuthModal
                    onAuth={(token, user) => {
                        localStorage.setItem('rn-auth-token', token);
                        localStorage.setItem('rn-auth-user', JSON.stringify(user));
                        setShowLoginModal(false);
                        if (onLogin) onLogin();
                    }}
                    onClose={() => setShowLoginModal(false)}
                    reason="general"
                />
            )}

            {/* ── NAVBAR ────────────────────────────────────────────────── */}
            <nav className={`lp-nav${scrolled ? ' lp-nav--scrolled' : ''}`}>
                <div className="lp-nav__inner">
                    <div className="lp-nav__logo">Renonym</div>
                    <div className="lp-nav__links">
                        <a href="#features" className="lp-nav__link">Features</a>
                        <a href="#templates" className="lp-nav__link">Templates</a>
                        <a href="#pricing" className="lp-nav__link">Pricing</a>
                    </div>
                    <div className="lp-nav__actions">
                        {currentUser
                            ? <button className="lp-nav__cta" onClick={onGoToDashboard || onGetStarted}>Dashboard →</button>
                            : <>
                                <button className="lp-nav__login" onClick={() => setShowLoginModal(true)}>Log in</button>
                                <button className="lp-nav__cta" onClick={onGetStarted}>Get started free</button>
                              </>
                        }
                    </div>
                </div>
            </nav>

            {/* ── HERO ──────────────────────────────────────────────────── */}
            <section className="lp-hero">
                <div className="lp-hero__grid-bg" />
                <div className="lp-hero__glow" />
                <div className="lp-hero__inner">
                    <div className="lp-hero__content">
                        <div className="lp-hero__tag">AI-Powered Career Platform</div>
                        <h1 className="lp-hero__h1">
                            Get hired<br /><span className="lp-hero__accent">faster.</span>
                        </h1>
                        <p className="lp-hero__sub">
                            AI-crafted resumes that pass ATS filters and impress hiring managers.
                            Used by professionals at top companies worldwide.
                        </p>
                        <div className="lp-hero__ctas">
                            <button className="lp-btn lp-btn--primary" onClick={onGetStarted}>Build your resume free →</button>
                            <button className="lp-btn lp-btn--ghost" onClick={onStartAi}>✦ Try AI design</button>
                        </div>
                        <p className="lp-hero__note">Free to build · No sign-up required · Cancel anytime</p>
                    </div>
                    <div className="lp-hero__visual">
                        <div className="lp-mock-resume">
                            <div className="lp-mock-resume__header">
                                <div className="lp-mock-resume__avatar">RS</div>
                                <div>
                                    <div className="lp-mock-resume__name">Rakshit Segwal</div>
                                    <div className="lp-mock-resume__role">Senior Salesforce Developer</div>
                                </div>
                            </div>
                            <div className="lp-mock-resume__lines">
                                {[100,80,60,90,70,50].map((w,i) => <div key={i} className="lp-mock-resume__line" style={{width:w+'%'}} />)}
                            </div>
                            <div className="lp-mock-resume__ats-badge">
                                <div className="lp-ats-badge">
                                    <div className="lp-ats-badge__score">92</div>
                                    <div className="lp-ats-badge__label">ATS Score</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TRUST BAR ─────────────────────────────────────────────── */}
            <div className="lp-trust">
                <div className="lp-trust__inner">
                    <span className="lp-trust__label">Trusted by professionals at</span>
                    {['Google','Amazon','Infosys','Microsoft','TCS','Accenture'].map(c => (
                        <span key={c} className="lp-trust__co">{c}</span>
                    ))}
                </div>
            </div>

            {/* ── FEATURES ──────────────────────────────────────────────── */}
            <section className="lp-features" id="features">
                <div className="lp-section">
                    <div className="lp-section__tag">Everything you need</div>
                    <h2 className="lp-section__h2">One platform.<br />Three powerful tools.</h2>
                    <div className="lp-feat-grid">
                        <div className="lp-feat-card">
                            <div className="lp-feat-card__icon">📄</div>
                            <h3 className="lp-feat-card__h3">Professional Templates</h3>
                            <p className="lp-feat-card__p">10 handcrafted, ATS-optimised layouts. Visual gallery — see exactly what you get before you pick.</p>
                            <ul className="lp-feat-card__ul">
                                <li>10 premium templates</li><li>ATS-optimised layouts</li><li>Live preview as you type</li>
                            </ul>
                            <button className="lp-feat-card__link" onClick={onGetStarted}>Browse templates →</button>
                        </div>
                        <div className="lp-feat-card lp-feat-card--ai">
                            <div className="lp-feat-card__badge">AI</div>
                            <div className="lp-feat-card__icon lp-feat-card__icon--ai">✦</div>
                            <h3 className="lp-feat-card__h3">AI Generated Resume</h3>
                            <p className="lp-feat-card__p">Describe your style in plain English. Upload style inspiration. AI creates a completely unique design.</p>
                            <ul className="lp-feat-card__ul">
                                <li>Unique AI-generated design</li><li>Plain English prompts</li><li>Upload style inspiration</li>
                            </ul>
                            <button className="lp-feat-card__link lp-feat-card__link--ai" onClick={onStartAi}>Try AI design →</button>
                        </div>
                        <div className="lp-feat-card">
                            <div className="lp-feat-card__icon">🎯</div>
                            <h3 className="lp-feat-card__h3">Job Match Optimizer</h3>
                            <p className="lp-feat-card__p">Paste a job description. Instantly see missing keywords, ATS gaps, and exactly what to change.</p>
                            <ul className="lp-feat-card__ul">
                                <li>ATS compatibility scoring</li><li>Keyword gap analysis</li><li>AI-powered suggestions</li>
                            </ul>
                            <button className="lp-feat-card__link" onClick={onOpenJobMatch}>Open optimizer →</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
            <section className="lp-how" id="how">
                <div className="lp-section">
                    <div className="lp-section__tag">Simple process</div>
                    <h2 className="lp-section__h2">From blank page to<br />interview in minutes.</h2>
                    <div className="lp-how__steps">
                        {[
                            { n:'01', t:'Build or upload', d:'Start from scratch, upload your existing resume, or let AI generate one from your description.' },
                            { n:'02', t:'AI analyses and improves', d:'Get your ATS score, see which keywords are missing, and get specific improvement suggestions.' },
                            { n:'03', t:'Download and apply', d:'Export a pixel-perfect PDF. No watermarks, no formatting issues. Ready for any ATS or hiring portal.' },
                        ].map(s => (
                            <div key={s.n} className="lp-how__step">
                                <div className="lp-how__step-n">{s.n}</div>
                                <h3 className="lp-how__step-t">{s.t}</h3>
                                <p className="lp-how__step-d">{s.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── ATS SHOWCASE ──────────────────────────────────────────── */}
            <section className="lp-ats">
                <div className="lp-section lp-ats__inner">
                    <div className="lp-ats__content">
                        <div className="lp-section__tag lp-section__tag--light">AI Analysis</div>
                        <h2 className="lp-section__h2 lp-section__h2--light">See exactly why you're<br />not getting callbacks.</h2>
                        <p className="lp-ats__desc">Most resumes fail before a human reads them. Our AI scores your resume against real ATS criteria and tells you exactly what to fix.</p>
                        <button className="lp-btn lp-btn--white" onClick={onGetStarted}>Get your ATS score free →</button>
                    </div>
                    <div className="lp-ats__visual">
                        <div className="lp-score-card">
                            <div className="lp-score-card__dial">
                                <svg viewBox="0 0 80 80">
                                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7"/>
                                    <circle cx="40" cy="40" r="32" fill="none" stroke="#7c3aed" strokeWidth="7"
                                        strokeDasharray="201" strokeDashoffset="41"
                                        strokeLinecap="round" transform="rotate(-90 40 40)"/>
                                </svg>
                                <div className="lp-score-card__num">79</div>
                            </div>
                            <div className="lp-score-card__title">ATS Score</div>
                            <div className="lp-score-card__subtitle">Good — room to improve</div>
                            <div className="lp-score-card__gaps">
                                <div className="lp-score-card__gap">Missing: "Salesforce CPQ"</div>
                                <div className="lp-score-card__gap">Missing: "REST APIs"</div>
                                <div className="lp-score-card__gap lp-score-card__gap--blur">+ 6 more keywords...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TEMPLATES ─────────────────────────────────────────────── */}
            <section className="lp-templates" id="templates">
                <div className="lp-section">
                    <div className="lp-section__tag">Templates</div>
                    <h2 className="lp-section__h2">10 premium templates.<br />All ATS-ready.</h2>
                    <div className="lp-tmpl-grid">
                        {[
                            { n:'Classic Pro', c:'#6d28d9' },
                            { n:'Modern Clean', c:'#0ea5e9' },
                            { n:'Minimal ATS', c:'#374151' },
                            { n:'Dark Tech', c:'#1e293b' },
                            { n:'Nordic Clean', c:'#0891b2' },
                            { n:'Emerald Pro', c:'#059669' },
                        ].map((t, i) => (
                            <div key={t.n} className={`lp-tmpl${i===0?' lp-tmpl--active':''}`} onClick={onGetStarted}>
                                <div className="lp-tmpl__preview" style={{'--tc': t.c}}>
                                    <div className="lp-tmpl__preview-hdr" />
                                    <div className="lp-tmpl__preview-lines">
                                        {[85,65,90,50,75].map((w,j) => <div key={j} className="lp-tmpl__preview-line" style={{width:w+'%'}} />)}
                                    </div>
                                </div>
                                <div className="lp-tmpl__name">{t.n}</div>
                            </div>
                        ))}
                    </div>
                    <div className="lp-section__center">
                        <button className="lp-btn lp-btn--outline" onClick={onGetStarted}>Browse all 10 templates →</button>
                    </div>
                </div>
            </section>

            {/* ── STATS ─────────────────────────────────────────────────── */}
            <div className="lp-stats">
                <div className="lp-stats__inner">
                    {[{n:'250K+',l:'Professionals'},{n:'95%',l:'ATS pass rate'},{n:'10+',l:'Templates'},{n:'3 min',l:'Average build time'}].map(s => (
                        <div key={s.l} className="lp-stat">
                            <div className="lp-stat__n">{s.n}</div>
                            <div className="lp-stat__l">{s.l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── PRICING ───────────────────────────────────────────────── */}
            <section className="lp-pricing" id="pricing">
                <div className="lp-section">
                    <div className="lp-section__tag">Pricing</div>
                    <h2 className="lp-section__h2">Simple, transparent pricing.<br />No hidden fees.</h2>
                    <div className="lp-pricing__toggle">
                        <button className={`lp-ptoggle${pricingPeriod==='monthly'?' lp-ptoggle--on':''}`} onClick={() => setPricingPeriod('monthly')}>Monthly</button>
                        <button className={`lp-ptoggle${pricingPeriod==='yearly'?' lp-ptoggle--on':''}`} onClick={() => setPricingPeriod('yearly')}>
                            Yearly <span className="lp-ptoggle__save">Save 16%</span>
                        </button>
                    </div>
                    <div className="lp-plans">
                        <div className="lp-plan">
                            <div className="lp-plan__name">Free</div>
                            <div className="lp-plan__price">₹0</div>
                            <div className="lp-plan__desc">Build and preview. See your ATS score.</div>
                            <ul className="lp-plan__feats">
                                {['Unlimited building & editing','Live resume preview','1 ATS analysis','1 job match','Watermarked PDF preview'].map(f =>
                                    <li key={f} className="lp-plan__feat"><span className="lp-plan__ck">✓</span>{f}</li>
                                )}
                                {['PDF/DOCX download','AI style generator','AI resume rewrite','Priority support'].map(f =>
                                    <li key={f} className="lp-plan__feat lp-plan__feat--off"><span className="lp-plan__x">×</span>{f}</li>
                                )}
                            </ul>
                            <button className="lp-plan__btn lp-plan__btn--outline" onClick={onGetStarted}>Get started free</button>
                        </div>
                        <div className="lp-plan lp-plan--pro">
                            <div className="lp-plan__popular">Most popular</div>
                            <div className="lp-plan__name">Pro</div>
                            <div className="lp-plan__price">₹{price.pro}<span className="lp-plan__per">/{pricingPeriod==='yearly'?'yr':'mo'}</span></div>
                            {pricingPeriod==='yearly' && <div className="lp-plan__equiv">That's just ₹41/month</div>}
                            <div className="lp-plan__desc">Everything you need to land your next job.</div>
                            <ul className="lp-plan__feats">
                                {['Everything in Free','Unlimited PDF & DOCX export','No watermarks','AI style generator','AI resume rewrite','Job match optimizer','Priority support','All future features'].map(f =>
                                    <li key={f} className="lp-plan__feat"><span className="lp-plan__ck">✓</span>{f}</li>
                                )}
                            </ul>
                            <PaymentButton
                                planId={pricingPeriod==='yearly'?'pro_yearly':'pro_monthly'}
                                label={`Start Pro — ₹${price.pro}/${pricingPeriod==='yearly'?'yr':'mo'}`}
                                className="lp-plan__btn lp-plan__btn--pro"
                                user={currentUser}
                                onSuccess={() => alert('Welcome to Pro! Refresh to activate your plan.')}
                                onError={msg => alert('Payment failed: '+msg)}
                            />
                            <div className="lp-plan__trust">7-day money-back · Cancel anytime · Secured by Razorpay</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ────────────────────────────────────────────── */}
            <section className="lp-cta-banner">
                <div className="lp-section lp-cta-banner__inner">
                    <h2 className="lp-cta-banner__h2">Start building your<br />career today.</h2>
                    <p className="lp-cta-banner__sub">Free to build. No sign-up until you're ready. Takes 3 minutes.</p>
                    <div className="lp-hero__ctas lp-cta-banner__ctas">
                        <button className="lp-btn lp-btn--primary" onClick={onGetStarted}>Build your resume free →</button>
                        <button className="lp-btn lp-btn--ghost-light" onClick={onStartAi}>✦ Generate with AI</button>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ────────────────────────────────────────────────── */}
            <footer className="lp-footer">
                <div className="lp-footer__inner">
                    <div>
                        <div className="lp-footer__logo">Renonym</div>
                        <div className="lp-footer__tagline">AI-powered career platform</div>
                    </div>
                    <div className="lp-footer__links">
                        <div className="lp-footer__col">
                            <div className="lp-footer__col-hd">Product</div>
                            <a className="lp-footer__a" href="#features">Features</a>
                            <a className="lp-footer__a" href="#templates">Templates</a>
                            <a className="lp-footer__a" href="#pricing">Pricing</a>
                        </div>
                        <div className="lp-footer__col">
                            <div className="lp-footer__col-hd">Company</div>
                            <a className="lp-footer__a" href="#" onClick={e => e.preventDefault()}>About</a>
                            <a className="lp-footer__a" href="#" onClick={e => e.preventDefault()}>Privacy</a>
                            <a className="lp-footer__a" href="#" onClick={e => e.preventDefault()}>Terms</a>
                        </div>
                    </div>
                </div>
                <div className="lp-footer__bottom">© 2026 Renonym AI. All rights reserved.</div>
            </footer>
        </div>
    );
}
