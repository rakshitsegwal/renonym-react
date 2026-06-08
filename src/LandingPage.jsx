import React, { useState, useEffect } from 'react';
import { AuthModal } from './AuthModal.jsx';
import PaymentButton from './PaymentButton.jsx';
import './landing.css';

export default function LandingPage({ onGetStarted, onLogin, currentUser }) {
    const [pricingPeriod, setPricingPeriod] = useState('yearly');
    const [scrolled, setScrolled] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const prices = { monthly: { pro: 599, team: 1799 }, yearly: { pro: 499, team: 1499 } };

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

            {/* ── Navbar ── */}
            <nav className={`lp-nav${scrolled ? ' lp-nav--scrolled' : ''}`}>
                <div className="lp-nav__inner">
                    <div className="lp-nav__logo">
                        <div className="lp-nav__logo-mark">R</div>
                        <span>Renonym AI</span>
                    </div>
                    <div className="lp-nav__links">
                        <a href="#features">Features</a>
                        <a href="#templates">Templates</a>
                        <a href="#how">How it works</a>
                        <a href="#pricing">Pricing</a>
                    </div>
                    <div className="lp-nav__actions">
                        {currentUser
                            ? <button className="lp-btn lp-btn--primary" onClick={onGetStarted}>Open Builder →</button>
                            : <>
                                <button className="lp-btn lp-btn--ghost" onClick={() => setShowLoginModal(true)}>Log in</button>
                                <button className="lp-btn lp-btn--primary" onClick={onGetStarted}>Get Started Free →</button>
                              </>
                        }
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="lp-hero">
                <div className="lp-hero__left">
                    <div className="lp-hero__badge">✦ AI-Powered Resume Builder</div>
                    <h1 className="lp-hero__headline">
                        Your career.<br />
                        <span className="lp-hero__highlight">Supercharged.</span>
                    </h1>
                    <p className="lp-hero__sub">
                        Build a standout resume, match better jobs, and land more interviews — with AI that understands your career.
                    </p>
                    <div className="lp-hero__ctas">
                        <button className="lp-btn lp-btn--primary lp-btn--lg" onClick={onGetStarted}>Get Started Free →</button>
                        <button className="lp-btn lp-btn--outline lp-btn--lg" onClick={onGetStarted}>See Example Resume</button>
                    </div>
                    <div className="lp-hero__trust">
                        <div className="lp-hero__avatars">
                            <div className="lp-hero__avatar">👩‍💼</div>
                            <div className="lp-hero__avatar">👨‍💻</div>
                            <div className="lp-hero__avatar">👩‍🔬</div>
                            <div className="lp-hero__avatar">👨‍🎨</div>
                        </div>
                        <div>
                            <div className="lp-hero__stars">★★★★★</div>
                            <div className="lp-hero__trust-text">Trusted by <strong>250,000+</strong> professionals</div>
                        </div>
                    </div>
                    <div className="lp-hero__fine">No credit card required · Free forever</div>
                </div>
                <div className="lp-hero__right">
                    <div className="lp-mockup">
                        <div className="lp-mockup__bar">
                            <div className="lp-mockup__dot" style={{background:'#ff5f57'}}/>
                            <div className="lp-mockup__dot" style={{background:'#febc2e'}}/>
                            <div className="lp-mockup__dot" style={{background:'#28c840'}}/>
                            <span className="lp-mockup__url">app.renonym.ai</span>
                        </div>
                        <div className="lp-mockup__body">
                            <div className="lp-mockup__sidebar">
                                <div className="lp-mockup__logo">R</div>
                                {['Dashboard','My Resumes','AI Tools','Job Match','Templates'].map((item, i) => (
                                    <div key={i} className={`lp-mockup__nav-item${i===0?' lp-mockup__nav-item--active':''}`}>{item}</div>
                                ))}
                            </div>
                            <div className="lp-mockup__main">
                                <div className="lp-mockup__welcome">Welcome back, Alex 👋</div>
                                <div className="lp-mockup__sub">Here's your career overview</div>
                                <div className="lp-mockup__stats">
                                    <div className="lp-mockup__stat"><div className="lp-mockup__stat-val">12</div><div className="lp-mockup__stat-label">Resumes</div><div className="lp-mockup__stat-delta">+2 this week</div></div>
                                    <div className="lp-mockup__stat"><div className="lp-mockup__stat-val">87%</div><div className="lp-mockup__stat-label">ATS Score</div><div className="lp-mockup__stat-delta">+5 this week</div></div>
                                    <div className="lp-mockup__stat"><div className="lp-mockup__stat-val">24</div><div className="lp-mockup__stat-label">Applications</div><div className="lp-mockup__stat-delta">+6 this week</div></div>
                                </div>
                                <div className="lp-mockup__card">
                                    <div className="lp-mockup__card-title">Senior Product Designer</div>
                                    <div className="lp-mockup__card-sub">Updated 2 days ago · ATS Score: 92</div>
                                    <div className="lp-mockup__bars">
                                        <div className="lp-mockup__bar-row"><span>Keywords</span><div className="lp-mockup__bar-track"><div className="lp-mockup__bar-fill" style={{width:'94%'}}/></div><span>94%</span></div>
                                        <div className="lp-mockup__bar-row"><span>Skills Match</span><div className="lp-mockup__bar-track"><div className="lp-mockup__bar-fill" style={{width:'89%'}}/></div><span>89%</span></div>
                                        <div className="lp-mockup__bar-row"><span>Readability</span><div className="lp-mockup__bar-track"><div className="lp-mockup__bar-fill" style={{width:'96%'}}/></div><span>96%</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Feature strip ── */}
            <section className="lp-features-strip" id="features">
                <div className="lp-features-strip__inner">
                    {[
                        { icon:'📄', title:'AI Resume Builder',  desc:'Create ATS-friendly resumes in minutes.' },
                        { icon:'🎯', title:'Job Match',           desc:'Find roles that match your skills.' },
                        { icon:'📊', title:'ATS Score Checker',  desc:'Get instant feedback on your resume.' },
                        { icon:'💬', title:'AI Review',          desc:'AI-powered resume feedback instantly.' },
                        { icon:'✦',  title:'AI Style Generator', desc:'Unique AI-designed resume themes.' },
                    ].map((f, i) => (
                        <div key={i} className="lp-feat">
                            <div className="lp-feat__icon">{f.icon}</div>
                            <div className="lp-feat__title">{f.title}</div>
                            <div className="lp-feat__desc">{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="lp-how" id="how">
                <div className="lp-section-tag">HOW IT WORKS</div>
                <h2 className="lp-section-title">Everything you need to land your dream job</h2>
                <div className="lp-how__steps">
                    {[
                        { icon:'📝', step:'Create',   desc:'Build your resume with AI in minutes.' },
                        { icon:'⚡', step:'Optimise', desc:'Improve your ATS score and content.' },
                        { icon:'🎙', step:'Practice', desc:'Ace interviews with AI mock practice.' },
                        { icon:'🚀', step:'Apply',    desc:'Find the right jobs and apply smarter.' },
                        { icon:'📈', step:'Track',    desc:'Monitor applications, get more offers.' },
                    ].map((s, i) => (
                        <React.Fragment key={i}>
                            <div className="lp-step">
                                <div className="lp-step__icon">{s.icon}</div>
                                <div className="lp-step__name">{s.step}</div>
                                <div className="lp-step__desc">{s.desc}</div>
                            </div>
                            {i < 4 && <div className="lp-step__arrow">→</div>}
                        </React.Fragment>
                    ))}
                </div>
            </section>

            {/* ── Templates ── */}
            <section className="lp-templates-section" id="templates">
                <div className="lp-templates-section__left">
                    <div className="lp-section-tag">PROFESSIONAL TEMPLATES</div>
                    <h2 className="lp-section-title lp-section-title--left">Designed by recruiters.<br />Loved by professionals.</h2>
                    <p className="lp-templates-section__desc">Choose from 10+ modern templates proven to pass ATS and impress recruiters. Or let AI generate a unique design.</p>
                    <button className="lp-btn lp-btn--link" onClick={onGetStarted}>Browse all templates →</button>
                </div>
                <div className="lp-templates-section__right">
                    {[
                        { name:'Classic Pro',  color:'#032d60', text:'#fff' },
                        { name:'Dark Tech',    color:'#0f172a', text:'#38bdf8' },
                        { name:'Executive',    color:'#b8860b', text:'#fff' },
                        { name:'Nordic Clean', color:'#2e7d9a', text:'#fff' },
                        { name:'Emerald Pro',  color:'#064e3b', text:'#6ee7b7' },
                    ].map((t, i) => (
                        <div key={i} className="lp-tpl-card" onClick={onGetStarted}>
                            <div className="lp-tpl-card__header" style={{background: t.color}}>
                                <div className="lp-tpl-card__avatar" style={{color: t.text, border: `1px solid ${t.text}44`}}>RS</div>
                                <div>
                                    <div className="lp-tpl-card__name" style={{color: t.text}}>Rakshit S.</div>
                                    <div className="lp-tpl-card__role" style={{color: t.text, opacity:.7}}>Engineer</div>
                                </div>
                            </div>
                            <div className="lp-tpl-card__lines">
                                {[70,55,80,45,65,50].map((w,j) => <div key={j} className="lp-tpl-card__line" style={{width:w+'%'}}/>)}
                            </div>
                            <div className="lp-tpl-card__label">{t.name}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="lp-stats">
                {[
                    { val:'250,000+', label:'Resumes created' },
                    { val:'82%',      label:'Average ATS improvement' },
                    { val:'3.2x',     label:'More interview callbacks' },
                    { val:'98%',      label:'Customer satisfaction' },
                ].map((s, i) => (
                    <div key={i} className="lp-stat-item">
                        <div className="lp-stat-item__val">{s.val}</div>
                        <div className="lp-stat-item__label">{s.label}</div>
                    </div>
                ))}
            </section>

            {/* ── Testimonials ── */}
            <section className="lp-testimonials">
                <div className="lp-section-tag">TESTIMONIALS</div>
                <h2 className="lp-section-title">Loved by professionals worldwide</h2>
                <div className="lp-testimonials__grid">
                    {[
                        { name:'Priya S.',  role:'UX Designer at Google',      avatar:'👩‍🎨', quote:'"Renonym helped me redesign my resume in 20 minutes. Landed 3 interviews in a week. The AI style generator is insane."' },
                        { name:'James L.',  role:'Software Engineer at Amazon', avatar:'👨‍💻', quote:'"The ATS score checker told me exactly what was wrong. Fixed it, applied, got callbacks. Simple as that."' },
                        { name:'Sarah M.',  role:'Product Manager at Stripe',   avatar:'👩‍💼', quote:'"Beautiful templates and the Job Match feature helped me find roles I didn\'t even know existed. Highly recommended."' },
                    ].map((t, i) => (
                        <div key={i} className="lp-testimonial">
                            <div className="lp-testimonial__quote">{t.quote}</div>
                            <div className="lp-testimonial__author">
                                <div className="lp-testimonial__avatar">{t.avatar}</div>
                                <div>
                                    <div className="lp-testimonial__name">{t.name}</div>
                                    <div className="lp-testimonial__role">{t.role}</div>
                                </div>
                            </div>
                            <div className="lp-testimonial__stars">★★★★★</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Pricing ── */}
            <section className="lp-pricing" id="pricing">
                <div className="lp-section-tag">PRICING</div>
                <h2 className="lp-section-title">Simple pricing. Maximum value.</h2>
                <div className="lp-pricing__toggle">
                    <button className={pricingPeriod==='monthly'?'active':''} onClick={()=>setPricingPeriod('monthly')}>Monthly</button>
                    <button className={pricingPeriod==='yearly'?'active':''} onClick={()=>setPricingPeriod('yearly')}>
                        Yearly <span className="lp-pricing__save">Save 25%</span>
                    </button>
                </div>
                <div className="lp-pricing__cards">
                    <div className="lp-plan">
                        <div className="lp-plan__name">Free</div>
                        <div className="lp-plan__price">₹0<span>/month</span></div>
                        <div className="lp-plan__desc">Perfect for getting started</div>
                        <ul className="lp-plan__features">
                            {['1 Resume','Basic Templates','ATS Score Check','Export PDF (watermarked)'].map((f,i)=>(
                                <li key={i}><span className="lp-plan__check">✓</span>{f}</li>
                            ))}
                        </ul>
                        <button className="lp-btn lp-btn--outline lp-btn--full" onClick={onGetStarted}>Get Started</button>
                    </div>
                    <div className="lp-plan lp-plan--featured">
                        <div className="lp-plan__badge">MOST POPULAR</div>
                        <div className="lp-plan__name">Pro</div>
                        <div className="lp-plan__price">₹{prices[pricingPeriod].pro}<span>/month</span></div>
                        <div className="lp-plan__desc">Everything you need to grow</div>
                        <ul className="lp-plan__features">
                            {['Unlimited Resumes','All 10+ Premium Templates','AI Style Generator','AI Resume Review','Job Match Optimizer','No watermark on exports'].map((f,i)=>(
                                <li key={i}><span className="lp-plan__check">✓</span>{f}</li>
                            ))}
                        </ul>
                        <PaymentButton
                            planId={pricingPeriod === 'yearly' ? 'pro_yearly' : 'pro_monthly'}
                            label="Start 7-Day Free Trial"
                            className="lp-btn lp-btn--primary lp-btn--full"
                            user={currentUser}
                            onSuccess={(result) => {
                                alert('Payment successful! Welcome to Pro. Refresh to activate your plan.');
                            }}
                            onError={(msg) => alert('Payment failed: ' + msg)}
                        />
                    </div>
                    <div className="lp-plan">
                        <div className="lp-plan__name">Team</div>
                        <div className="lp-plan__price">₹{prices[pricingPeriod].team}<span>/month</span></div>
                        <div className="lp-plan__desc">For teams and career coaches</div>
                        <ul className="lp-plan__features">
                            {['Everything in Pro','Up to 10 members','Shared Templates','Priority Support','Team analytics'].map((f,i)=>(
                                <li key={i}><span className="lp-plan__check">✓</span>{f}</li>
                            ))}
                        </ul>
                        <PaymentButton
                            planId={pricingPeriod === 'yearly' ? 'team_yearly' : 'team_monthly'}
                            label="Get Team Plan"
                            className="lp-btn lp-btn--outline lp-btn--full"
                            user={currentUser}
                            onSuccess={(result) => {
                                alert('Payment successful! Team plan activated.');
                            }}
                            onError={(msg) => alert('Payment failed: ' + msg)}
                        />
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="lp-cta-banner">
                <h2>Ready to supercharge your career?</h2>
                <p>Join 250,000+ professionals already using Renonym AI</p>
                <button className="lp-btn lp-btn--lg lp-btn--white" onClick={onGetStarted}>Get Started Free →</button>
            </section>

            {/* ── Footer ── */}
            <footer className="lp-footer">
                <div className="lp-footer__inner">
                    <div className="lp-footer__brand">
                        <div className="lp-nav__logo-mark" style={{marginBottom:8}}>R</div>
                        <span>Renonym AI</span>
                        <p>Build resumes that get you hired.</p>
                    </div>
                    <div className="lp-footer__links">
                        <div><strong>Product</strong><a href="#features">Features</a><a href="#templates">Templates</a><a href="#pricing">Pricing</a></div>
                        <div><strong>Company</strong><a href="#">About</a><a href="#">Blog</a><a href="#">Careers</a></div>
                        <div><strong>Legal</strong><a href="#">Privacy</a><a href="#">Terms</a></div>
                    </div>
                </div>
                <div className="lp-footer__bottom">
                    <span>© 2026 Renonym AI. All rights reserved.</span>
                    <span>Made with ✦ for job seekers everywhere</span>
                </div>
            </footer>

        </div>
    );
}
