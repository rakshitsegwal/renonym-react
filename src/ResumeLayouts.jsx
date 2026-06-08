import React from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// TOKEN SYSTEM — AI sets COLORS only. Structure is 100% hardcoded.
// ═══════════════════════════════════════════════════════════════════════════════

// The 16 CSS variables we expose. AI returns JSON with these keys.
// We apply them as inline CSS vars on the root element.
// CSS rules in app.css use var(--rn-*) — completely replacing AI-generated CSS.

export const DEFAULT_TOKENS = {
    headerBg:    '#2d1b69',
    headerText:  '#ffffff',
    headerSub:   'rgba(255,255,255,0.72)',
    sidebarBg:   '#f0ebff',
    sidebarText: '#1a1a2e',
    sidebarTitle:'#6d28d9',
    accent:      '#6d28d9',
    mainBg:      '#ffffff',
    mainText:    '#1a1a2e',
    mainTitle:   '#1a1a2e',
    mainRole:    '#6d28d9',
    skillBg:     '#6d28d9',
    skillText:   '#ffffff',
    certBg:      '#ede9fe',
    certText:    '#4c1d95',
    fontBody:    'system-ui,-apple-system,sans-serif',
    fontHeading: 'system-ui,-apple-system,sans-serif',
};

// Convert token object → CSS custom property map (applied via style={{...}})
export function tokensToVars(tokens) {
    const t = { ...DEFAULT_TOKENS, ...tokens };
    return {
        '--rn-hbg':      t.headerBg,
        '--rn-htx':      t.headerText,
        '--rn-hsub':     t.headerSub,
        '--rn-sbg':      t.sidebarBg,
        '--rn-stx':      t.sidebarText,
        '--rn-stitle':   t.sidebarTitle,
        '--rn-accent':   t.accent,
        '--rn-mbg':      t.mainBg,
        '--rn-mtx':      t.mainText,
        '--rn-mtitle':   t.mainTitle,
        '--rn-mrole':    t.mainRole,
        '--rn-skillbg':  t.skillBg,
        '--rn-skilltx':  t.skillText,
        '--rn-certbg':   t.certBg,
        '--rn-certtx':   t.certText,
        '--rn-font':     t.fontBody,
        '--rn-font-h':   t.fontHeading,
    };
}


// ─── Shared sub-components ────────────────────────────────────────────────────

function ResumeHeader({ data, hasPhoto, initials, displayName, displayTitle }) {
    return (
        <div className="rb-resume__header">
            <div className="rb-resume__photo-wrap">
                {hasPhoto
                    ? <img src={data.photoUrl} className="rb-resume__photo-img" alt="Profile photo" />
                    : <div className="rb-resume__photo-placeholder">{initials}</div>
                }
            </div>
            <div className="rb-resume__id">
                <h1 className="rb-resume__name">{displayName}</h1>
                <p className="rb-resume__title-line">{displayTitle}</p>
                <div className="rb-resume__contact">
                    {data.email    && <span className="rb-resume__contact-item">{data.email}</span>}
                    {data.phone    && <span className="rb-resume__contact-item">{data.phone}</span>}
                    {data.location && <span className="rb-resume__contact-item">{data.location}</span>}
                    {data.linkedIn && <span className="rb-resume__contact-item">{data.linkedIn}</span>}
                </div>
            </div>
        </div>
    );
}

function SummarySection({ data }) {
    if (!data.summary) return null;
    return (
        <section className="rb-resume__section">
            <h3 className="rb-section-title">About</h3>
            <p className="rb-summary">{data.summary}</p>
        </section>
    );
}

function SkillsSection({ data, hasSkills }) {
    if (!hasSkills) return null;
    return (
        <section className="rb-resume__section">
            <h3 className="rb-section-title">Skills</h3>
            <div className="rb-skills">
                {(data.skills || []).map((s, i) => (
                    <span key={i} className="rb-skill-pill">{s}</span>
                ))}
            </div>
        </section>
    );
}

function CertsSection({ data, hasCertifications }) {
    if (!hasCertifications) return null;
    return (
        <section className="rb-resume__section">
            <h3 className="rb-section-title">Certifications</h3>
            {(data.certifications || []).map((cert, i) => (
                <div key={i} className="rb-cert">{cert}</div>
            ))}
        </section>
    );
}

function ExperienceSection({ data, hasExperience }) {
    if (!hasExperience) return null;
    return (
        <section className="rb-resume__section">
            <h3 className="rb-section-title">Experience</h3>
            {(data.experiences || []).map((exp, i) => (
                <div key={i} className="rb-exp-item">
                    <div className="rb-exp-head">
                        <span className="rb-exp-company">{exp.company}</span>
                        <span className="rb-exp-date">{exp.dateRange}</span>
                    </div>
                    <div className="rb-exp-role">{exp.title}</div>
                    {exp.bullets?.filter(b => b && String(b).trim()).length > 0 && (
                        <ul className="rb-exp-bullets">
                            {exp.bullets.filter(b => b && String(b).trim()).map((b, j) => <li key={j}>{String(b).trim()}</li>)}
                        </ul>
                    )}
                </div>
            ))}
        </section>
    );
}

function EducationSection({ data, hasEducation }) {
    if (!hasEducation) return null;
    return (
        <section className="rb-resume__section">
            <h3 className="rb-section-title">Education</h3>
            {(data.education || []).map((edu, i) => (
                <div key={i} className="rb-edu-item">
                    <div className="rb-edu-head">
                        <span className="rb-edu-degree">
                            {edu.degree}{edu.field ? `, ${edu.field}` : ''}
                        </span>
                        <span className="rb-edu-years">{edu.years}</span>
                    </div>
                    <div className="rb-edu-school">{edu.school}</div>
                </div>
            ))}
        </section>
    );
}

// ─── Layout 1: Two-column (default / sidebar) ─────────────────────────────────
// Left sidebar: About + Skills + Certs
// Right main: Experience + Education

export function TwoColLayout(props) {
    const { data, resumeClass, resumeFont, resumeFontSize,
            hasPhoto, initials, displayName, displayTitle,
            hasSkills, hasCertifications, hasExperience, hasEducation,
            tokens } = props;
    const tokenVars = tokens ? tokensToVars(tokens) : {};
    const cls = tokens
        ? `${resumeClass} rb-resume--ai-tokens rb-resume--layout-two-col-ai`
        : resumeClass;
    return (
        <div className={cls} data-id="resume-preview"
             data-font={resumeFont} data-font-size={resumeFontSize}
             style={tokenVars}>
            <div className="rb-resume__top-deco"></div>
            <ResumeHeader data={data} hasPhoto={hasPhoto} initials={initials}
                          displayName={displayName} displayTitle={displayTitle} />
            <div className="rb-resume__body">
                <aside className="rb-resume__sidebar">
                    <SummarySection data={data} />
                    <SkillsSection data={data} hasSkills={hasSkills} />
                    <CertsSection data={data} hasCertifications={hasCertifications} />
                </aside>
                <main className="rb-resume__main">
                    <ExperienceSection data={data} hasExperience={hasExperience} />
                    <EducationSection data={data} hasEducation={hasEducation} />
                </main>
            </div>
        </div>
    );
}

// ─── Layout 2: Single column ──────────────────────────────────────────────────
// Full-width stacked sections — classic ATS-safe layout

export function SingleLayout(props) {
    const { data, resumeClass, resumeFont, resumeFontSize,
            hasPhoto, initials, displayName, displayTitle,
            hasSkills, hasCertifications, hasExperience, hasEducation,
            tokens } = props;
    const tokenVars = tokens ? tokensToVars(tokens) : {};
    return (
        <div className={tokens ? `${resumeClass} rb-resume--ai-tokens rb-resume--layout-single-ai` : `${resumeClass} rb-resume--layout-single`}
             data-id="resume-preview" data-font={resumeFont} data-font-size={resumeFontSize} style={tokenVars}>
            <div className="rb-resume__top-deco"></div>
            <ResumeHeader data={data} hasPhoto={hasPhoto} initials={initials}
                          displayName={displayName} displayTitle={displayTitle} />
            <div className="rb-resume__body rb-resume__body--single">
                <SummarySection data={data} />
                <ExperienceSection data={data} hasExperience={hasExperience} />
                <EducationSection data={data} hasEducation={hasEducation} />
                <SkillsSection data={data} hasSkills={hasSkills} />
                <CertsSection data={data} hasCertifications={hasCertifications} />
            </div>
        </div>
    );
}

// ─── Layout 3: Top banner ─────────────────────────────────────────────────────
// Full-width coloured banner header, single-column content below
// Skills + Certs shown inline as pills in a 2-col grid below

export function TopBannerLayout(props) {
    const { data, resumeClass, resumeFont, resumeFontSize,
            hasPhoto, initials, displayName, displayTitle,
            hasSkills, hasCertifications, hasExperience, hasEducation,
            tokens } = props;
    const tokenVars = tokens ? tokensToVars(tokens) : {};
    return (
        <div className={tokens ? `${resumeClass} rb-resume--ai-tokens rb-resume--layout-banner-ai` : `${resumeClass} rb-resume--layout-banner`}
             data-id="resume-preview" data-font={resumeFont} data-font-size={resumeFontSize} style={tokenVars}>
            {/* Full-width banner header */}
            <div className="rb-resume__banner">
                <div className="rb-resume__banner-photo">
                    {hasPhoto
                        ? <img src={data.photoUrl} className="rb-resume__photo-img" alt="Profile photo" />
                        : <div className="rb-resume__photo-placeholder">{initials}</div>
                    }
                </div>
                <div className="rb-resume__banner-id">
                    <h1 className="rb-resume__name">{displayName}</h1>
                    <p className="rb-resume__title-line">{displayTitle}</p>
                </div>
                <div className="rb-resume__banner-contact">
                    {data.email    && <span className="rb-resume__contact-item">{data.email}</span>}
                    {data.phone    && <span className="rb-resume__contact-item">{data.phone}</span>}
                    {data.location && <span className="rb-resume__contact-item">{data.location}</span>}
                    {data.linkedIn && <span className="rb-resume__contact-item">{data.linkedIn}</span>}
                </div>
            </div>
            {/* Two-panel skills row */}
            <div className="rb-resume__body rb-resume__body--banner">
                <div className="rb-resume__banner-cols">
                    <div className="rb-resume__banner-left">
                        <SummarySection data={data} />
                        <SkillsSection data={data} hasSkills={hasSkills} />
                        <CertsSection data={data} hasCertifications={hasCertifications} />
                    </div>
                    <div className="rb-resume__banner-right">
                        <ExperienceSection data={data} hasExperience={hasExperience} />
                        <EducationSection data={data} hasEducation={hasEducation} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Layout 4: Asymmetric ─────────────────────────────────────────────────────
// Left column (35%) holds name + contact + skills + certs
// Right column (65%) holds summary + experience + education
// No separate header row — name lives inside the left column

export function AsymmetricLayout(props) {
    const { data, resumeClass, resumeFont, resumeFontSize,
            hasPhoto, initials, displayName, displayTitle,
            hasSkills, hasCertifications, hasExperience, hasEducation,
            tokens } = props;
    const tokenVars = tokens ? tokensToVars(tokens) : {};
    return (
        <div className={`${resumeClass} rb-resume--layout-asymmetric`}
             data-id="resume-preview" data-font={resumeFont} data-font-size={resumeFontSize}>
            <div className="rb-resume__body rb-resume__body--asymmetric">
                {/* Left accent column */}
                <aside className="rb-resume__sidebar rb-resume__sidebar--accent">
                    <div className="rb-resume__asym-identity">
                        <div className="rb-resume__photo-wrap">
                            {hasPhoto
                                ? <img src={data.photoUrl} className="rb-resume__photo-img" alt="Profile photo" />
                                : <div className="rb-resume__photo-placeholder">{initials}</div>
                            }
                        </div>
                        <h1 className="rb-resume__name">{displayName}</h1>
                        <p className="rb-resume__title-line">{displayTitle}</p>
                        <div className="rb-resume__contact">
                            {data.email    && <span className="rb-resume__contact-item">{data.email}</span>}
                            {data.phone    && <span className="rb-resume__contact-item">{data.phone}</span>}
                            {data.location && <span className="rb-resume__contact-item">{data.location}</span>}
                            {data.linkedIn && <span className="rb-resume__contact-item">{data.linkedIn}</span>}
                        </div>
                    </div>
                    <SkillsSection data={data} hasSkills={hasSkills} />
                    <CertsSection data={data} hasCertifications={hasCertifications} />
                </aside>
                {/* Right content column */}
                <main className="rb-resume__main">
                    <SummarySection data={data} />
                    <ExperienceSection data={data} hasExperience={hasExperience} />
                    <EducationSection data={data} hasEducation={hasEducation} />
                </main>
            </div>
        </div>
    );
}

// ─── Layout registry ──────────────────────────────────────────────────────────
export const LAYOUTS = {
    'two-col':    TwoColLayout,
    'single':     SingleLayout,
    'top-banner': TopBannerLayout,
    'asymmetric': AsymmetricLayout,
};

export function getLayout(name) {
    return LAYOUTS[name] || TwoColLayout;
}
