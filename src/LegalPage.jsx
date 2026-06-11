import React, { useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Legal / static pages (Privacy, Terms, About).
//
// IMPORTANT: The Privacy Policy and Terms of Service below are a good-faith
// DRAFT TEMPLATE for an AI resume builder operating from India. They are NOT a
// substitute for legal advice — have them reviewed by a lawyer before relying
// on them, and update the placeholders ([support email], company entity, etc.).
// ─────────────────────────────────────────────────────────────────────────────

const LAST_UPDATED = '10 June 2026';
const CONTACT_EMAIL = 'support@renonym.com';

const META = {
    privacy: { title: 'Privacy Policy', tag: 'Legal' },
    terms:   { title: 'Terms of Service', tag: 'Legal' },
    about:   { title: 'About Renonym AI', tag: 'Company' },
};

function PrivacyBody() {
    return (
        <>
            <p>This Privacy Policy explains how Renonym AI ("Renonym", "we", "us") collects, uses, and protects your information when you use our resume-building service (the "Service").</p>

            <h2>1. Information we collect</h2>
            <ul>
                <li><strong>Account data</strong> — your name and email address when you sign in via Google or an email magic link.</li>
                <li><strong>Resume content</strong> — the information you enter or upload to build your resume (work history, skills, education, contact details).</li>
                <li><strong>Payment data</strong> — handled by our payment processor (Razorpay). We do not store your full card details on our servers.</li>
                <li><strong>Usage &amp; device data</strong> — basic logs, an anonymous client identifier, and standard request metadata used for security and rate limiting.</li>
            </ul>

            <h2>2. How we use it</h2>
            <ul>
                <li>To generate, format, and export your resume, including AI-assisted features.</li>
                <li>To authenticate you, maintain your account, and process subscriptions.</li>
                <li>To secure the Service (abuse prevention, rate limiting) and to improve it.</li>
            </ul>

            <h2>3. AI processing &amp; third parties</h2>
            <p>To provide AI features (resume parsing, style generation, review, job-match analysis) we send the relevant resume text to our AI provider (OpenAI) for processing. We also rely on infrastructure and service providers including our hosting provider (Railway) and payment processor (Razorpay). These providers process data on our behalf under their own terms.</p>

            <h2>4. Storage &amp; retention</h2>
            <p>Saved resumes and account information are retained while your account is active. Some data is stored locally in your browser (e.g. session token, draft state). You may request deletion of your account and associated data by contacting us.</p>

            <h2>5. Your rights</h2>
            <p>Subject to applicable law (including India's Digital Personal Data Protection Act and the IT Act, 2000), you may request access to, correction of, or deletion of your personal data. To exercise these rights, contact us at {CONTACT_EMAIL}.</p>

            <h2>6. Cookies &amp; local storage</h2>
            <p>We use browser local storage for authentication and to remember your in-progress work. We do not use third-party advertising cookies.</p>

            <h2>7. Changes</h2>
            <p>We may update this policy from time to time. Material changes will be reflected by updating the "Last updated" date above.</p>

            <h2>8. Contact</h2>
            <p>Questions about privacy? Email {CONTACT_EMAIL}.</p>
        </>
    );
}

function TermsBody() {
    return (
        <>
            <p>These Terms of Service ("Terms") govern your use of Renonym AI (the "Service"). By using the Service, you agree to these Terms.</p>

            <h2>1. The Service</h2>
            <p>Renonym AI provides resume creation, AI-assisted styling and review, job-match analysis, and PDF export. Features available on free and paid plans are described on our pricing page and may change.</p>

            <h2>2. Accounts</h2>
            <p>You are responsible for activity under your account and for keeping your login secure. You must provide accurate information and be old enough to form a binding contract in your jurisdiction.</p>

            <h2>3. Plans, billing &amp; refunds</h2>
            <ul>
                <li>Paid plans are billed via Razorpay on the cadence shown at checkout (monthly or yearly).</li>
                <li>Free-plan usage is subject to limits (including daily quotas and watermarked, non-downloadable previews).</li>
                <li>Refund eligibility, if any, is described at checkout or on request.</li>
            </ul>

            <h2>4. Acceptable use</h2>
            <p>You agree not to misuse the Service, including: attempting to bypass security or usage limits, scraping or reselling access, uploading unlawful content, or submitting another person's information without authorisation.</p>

            <h2>5. Your content</h2>
            <p>You retain ownership of the resume content you provide. You grant us a limited licence to process it solely to operate the Service (including sending it to our AI provider to generate results for you).</p>

            <h2>6. Intellectual property</h2>
            <p>The Service, including its software, templates, and branding, is owned by Renonym AI and protected by applicable laws. The generated resume document is yours to use.</p>

            <h2>7. Disclaimers</h2>
            <p>The Service is provided "as is". AI-generated suggestions and scores are aids, not guarantees of interview or job outcomes. We do not warrant uninterrupted or error-free operation.</p>

            <h2>8. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, Renonym AI is not liable for indirect, incidental, or consequential damages, and our total liability is limited to the amount you paid us in the 12 months preceding the claim.</p>

            <h2>9. Governing law</h2>
            <p>These Terms are governed by the laws of India, and disputes are subject to the courts of Chandigarh, India, unless otherwise required by applicable law.</p>

            <h2>10. Contact</h2>
            <p>Questions about these Terms? Email {CONTACT_EMAIL}.</p>
        </>
    );
}

function AboutBody() {
    return (
        <>
            <p>Renonym AI is an AI-powered resume builder. Upload your existing resume and our AI helps you rebuild it into a cleaner, more professional document — with multiple templates, AI styling, an ATS / job-match analyzer, and one-click PDF export.</p>
            <p>Our goal is simple: help you get past the filters and in front of a human. We pair a fast, distraction-free editor with AI that suggests improvements grounded in your actual experience.</p>
            <p>Have feedback or need help? Reach us at {CONTACT_EMAIL}.</p>
        </>
    );
}

export default function LegalPage({ page, onHome }) {
    const meta = META[page] || META.about;

    useEffect(() => { document.title = `${meta.title} — Renonym AI`; }, [meta.title]);

    return (
        <div className="lg-page">
            <style>{`
                .lg-page { min-height: 100vh; background: #fff; color: #1f2937; font-family: 'Inter', -apple-system, sans-serif; }
                .lg-topbar { display: flex; align-items: center; justify-content: space-between; max-width: 760px; margin: 0 auto; padding: 24px 24px 0; }
                .lg-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; }
                .lg-brand__mark { width: 30px; height: 30px; border-radius: 8px; background: #0b0c1a; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; }
                .lg-brand__name { font-weight: 800; letter-spacing: -0.02em; }
                .lg-home { font-size: 14px; color: #2563eb; cursor: pointer; background: none; border: none; }
                .lg-home:hover { text-decoration: underline; }
                .lg-wrap { max-width: 760px; margin: 0 auto; padding: 32px 24px 80px; }
                .lg-tag { display: inline-block; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.06em; }
                .lg-h1 { font-size: 34px; font-weight: 800; letter-spacing: -0.03em; margin: 6px 0 4px; }
                .lg-updated { color: #6b7280; font-size: 13px; margin: 0 0 28px; }
                .lg-wrap h2 { font-size: 18px; font-weight: 700; margin: 28px 0 8px; }
                .lg-wrap p, .lg-wrap li { font-size: 15px; line-height: 1.7; color: #374151; }
                .lg-wrap ul { padding-left: 20px; margin: 8px 0; }
                .lg-wrap li { margin-bottom: 6px; }
            `}</style>

            <div className="lg-topbar">
                <div className="lg-brand" onClick={onHome}>
                    <div className="lg-brand__mark">R</div>
                    <span className="lg-brand__name">Renonym AI</span>
                </div>
                <button className="lg-home" onClick={onHome}>← Back to home</button>
            </div>

            <div className="lg-wrap">
                <span className="lg-tag">{meta.tag}</span>
                <h1 className="lg-h1">{meta.title}</h1>
                {page !== 'about' && <p className="lg-updated">Last updated: {LAST_UPDATED}</p>}
                {page === 'privacy' && <PrivacyBody />}
                {page === 'terms'   && <TermsBody />}
                {page === 'about'   && <AboutBody />}
            </div>
        </div>
    );
}
