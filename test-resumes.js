#!/usr/bin/env node
/**
 * Renonym AI — Automated Resume Generation Test Suite
 * Tests /generate-template (tokens) and /generate-pdf across 50 scenarios
 *
 * Usage:
 *   node test-resumes.js
 *   RAILWAY_URL=https://... API_SECRET=rn_live_... node test-resumes.js
 *   node test-resumes.js --pdf-only
 *   node test-resumes.js --tokens-only
 *   node test-resumes.js --count 10
 */

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const RAILWAY_URL = (process.env.RAILWAY_URL || 'https://salesforce-resume-pdf-server-production.up.railway.app').replace(/\/$/, '');
const API_SECRET  = process.env.API_SECRET  || process.env.VITE_API_SECRET || '';
const CLIENT_ID   = 'test-runner-' + Date.now();
const ARGS        = process.argv.slice(2);
const PDF_ONLY    = ARGS.includes('--pdf-only');
const TOKENS_ONLY = ARGS.includes('--tokens-only');
const COUNT       = parseInt((ARGS.find(a => a.startsWith('--count='))|| '').replace('--count=','')) || 50;
const SAVE_PDFS   = ARGS.includes('--save-pdfs');
const OUT_DIR     = path.join(process.cwd(), 'test-output');

// ── ANSI colours ──────────────────────────────────────────────────────────────
const c = {
    reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
    green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m',
    cyan: '\x1b[36m', blue: '\x1b[34m', white: '\x1b[37m',
    bgGreen: '\x1b[42m', bgRed: '\x1b[41m',
};
const ok   = `${c.green}✓${c.reset}`;
const fail = `${c.red}✗${c.reset}`;
const warn = `${c.yellow}⚠${c.reset}`;

// ── Test data ─────────────────────────────────────────────────────────────────

const PROMPTS = [
    // Clean/Professional
    'Clean minimal white resume with navy blue accents and serif typography',
    'Dark professional resume with charcoal header and gold accent lines',
    'Google-inspired clean white resume with blue and green accents',
    'Apple-style ultra-minimal resume, pure white, thin dividers, grey typography',
    'Microsoft corporate resume, blue header, clean sans-serif, structured layout',
    // Creative/Bold
    'Bold creative designer resume, deep purple sidebar, white main, vibrant accents',
    'Netflix dark mode resume, black and red, cinematic editorial spacing',
    'Spotify green and black resume, music industry creative layout',
    'Adobe creative cloud resume, red accent, dark sidebar, modern typography',
    'Figma-inspired resume, pastel purple, clean whitespace, modern layout',
    // Industry-specific
    'Conservative banking and finance resume, navy and white, formal serif font',
    'Tech startup engineer resume, dark background, monospace font, terminal vibes',
    'Healthcare professional resume, clean white, soft blue, trustworthy styling',
    'Legal professional resume, dark green, cream background, formal classic design',
    'Marketing creative resume, coral and white, bold typography, energetic feel',
    // Geographic aesthetics
    'Scandinavian minimal resume, white and light grey, clean lines, lots of space',
    'Japanese-inspired clean resume, white space, thin borders, elegant simplicity',
    'European professional resume, dark teal header, white body, classic structure',
    // Color-specific
    'Deep burgundy and cream elegant resume with gold accent details',
    'Electric blue and white modern resume with clean geometric borders',
    'Forest green and white resume, nature-inspired, clean professional',
    'Rose gold and charcoal luxury resume for senior executive',
    'Slate grey and orange modern tech resume with bold section headers',
    'Teal and white fresh resume, coastal inspired, airy and spacious',
    'Emerald green sidebar, white main content, sophisticated professional look',
    // Layout-triggering prompts
    'Single column clean resume, full width sections, no sidebar, plenty whitespace',
    'Top banner layout with prominent name header across full width',
    'Asymmetric layout with wide left identity column and narrow right experience',
    'Two column layout with dark left sidebar for skills and contact info',
    // Mood-based
    'Confident senior executive resume, powerful dark colours, authoritative typography',
    'Fresh graduate resume, light and energetic, modern sans-serif, approachable',
    'Creative director portfolio resume, editorial feel, unconventional spacing',
    'Data scientist resume, clean structured, monochrome with one blue accent',
    'Product manager resume, clean modern, lots of whitespace, corporate but fresh',
    // More color combos
    'Deep navy and coral resume with clean divider lines',
    'Warm amber and brown resume, earthy tones, organic feel',
    'Black and gold premium resume for senior leadership roles',
    'Ice white and arctic blue clean minimal resume',
    'Soft lavender and white delicate professional resume',
    'Dark forest green and cream classic academic resume',
    'Cobalt blue and light grey modern enterprise resume',
    'Terracotta and warm white creative professional resume',
    'Indigo and white clean developer resume with modern styling',
    'Charcoal and lime green dark mode tech resume',
    // Edge case prompts
    'Make it red',
    'Very dark and moody',
    'Bright and colourful',
    'Luxury premium gold',
    'Simple and clean',
    'FC Barcelona style blue and red with yellow accents',
    'Salesforce brand blue and white corporate resume',
];

function makeResume(size = 'medium') {
    const sizes = {
        minimal: {
            experiences: 1,
            bullets:     2,
            skills:      6,
            certs:       0,
        },
        medium: {
            experiences: 3,
            bullets:     3,
            skills:      14,
            certs:       2,
        },
        heavy: {
            experiences: 6,
            bullets:     4,
            skills:      24,
            certs:       4,
        },
    };
    const cfg = sizes[size] || sizes.medium;

    const companies = ['Google','Amazon','Microsoft','Meta','Apple','Infosys','TCS','Wipro','Salesforce','IBM','Oracle','SAP','Accenture','Deloitte','McKinsey'];
    const roles = ['Senior Engineer','Product Manager','Tech Lead','Consultant','Architect','Developer','Analyst','Director','VP Engineering','CTO'];
    const skillSets = {
        tech:    ['JavaScript','TypeScript','React','Node.js','Python','Java','Apex','Salesforce','AWS','Docker','Kubernetes','PostgreSQL','MongoDB','Git','REST APIs','GraphQL','CI/CD','Terraform','Redis','Kafka'],
        soft:    ['Leadership','Communication','Project Management','Agile','Scrum','Problem Solving','Team Building','Strategic Planning','Stakeholder Management','Mentoring'],
        salesforce: ['Salesforce LWC','Apex','Integrations','SOQL','Flow','Process Builder','Sales Cloud','Service Cloud','Experience Cloud','Tableau CRM','CPQ','Mulesoft'],
    };
    const allSkills = [...skillSets.tech, ...skillSets.salesforce];

    const experiences = [];
    for (let i = 0; i < cfg.experiences; i++) {
        const company   = companies[i % companies.length];
        const startYear = 2024 - (i * 2);
        const endYear   = i === 0 ? 'Present' : String(startYear + 1);
        const bullets   = [];
        for (let b = 0; b < cfg.bullets; b++) {
            const achivements = [
                `Led team of ${10 + b * 5} engineers delivering ${company} platform improvements`,
                `Reduced system latency by ${20 + b * 10}% through architecture optimisation`,
                `Implemented CI/CD pipeline cutting deployment time by ${30 + b * 5}%`,
                `Mentored ${3 + b} junior developers improving team velocity by ${25 + b * 8}%`,
                `Delivered ${company} integration project ${2 + b} weeks ahead of schedule`,
            ];
            bullets.push(achivements[b % achivements.length]);
        }
        experiences.push({
            company, bullets,
            title:     roles[i % roles.length],
            startDate: `Jan ${startYear - 1}`,
            endDate:   endYear,
            dateRange: `Jan ${startYear - 1} – ${endYear}`,
        });
    }

    const skills = allSkills.slice(0, cfg.skills);
    const certs  = [
        'Salesforce Certified Platform Developer II',
        'Salesforce Certified Administrator',
        'AWS Certified Solutions Architect',
        'Google Cloud Professional Data Engineer',
    ].slice(0, cfg.certs);

    return {
        fullName:       'Rakshit Segwal',
        title:          'Senior Salesforce Developer/Consultant',
        email:          'rakshit@example.com',
        phone:          '+91 930-787-3547',
        location:       'Chandigarh, India',
        linkedIn:       'linkedin.com/in/rakshit-segwal',
        summary:        'Senior Salesforce Developer with 8+ years of experience leading teams and delivering high-quality solutions across diverse industries. Skilled in optimising development workflows and collaborating with cross-functional teams.',
        skills,
        certifications: certs,
        experiences,
        education: [{
            degree: 'Bachelor of Engineering',
            field:  'Computer Science',
            school: 'Chandigarh University',
            years:  'Aug 2014 – Aug 2018',
        }],
    };
}

// ── HTTP helper ───────────────────────────────────────────────────────────────
function apiPost(path, body, timeoutMs = 60000) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const url     = new URL(RAILWAY_URL + path);
        const lib     = url.protocol === 'https:' ? https : http;
        const opts    = {
            hostname: url.hostname,
            port:     url.port || (url.protocol === 'https:' ? 443 : 80),
            path:     url.pathname,
            method:   'POST',
            headers:  {
                'Content-Type':   'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'x-client-id':    CLIENT_ID,
                ...(API_SECRET ? { 'x-api-secret': API_SECRET } : {}),
            },
        };

        const req = lib.request(opts, res => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const buf    = Buffer.concat(chunks);
                resolve({ status: res.statusCode, buf, headers: res.headers });
            });
        });

        req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('TIMEOUT')); });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

// ── PDF validation ────────────────────────────────────────────────────────────
function validatePdf(buf) {
    if (!buf || buf.length < 100) return { ok: false, reason: 'Empty buffer' };
    const header = buf.slice(0, 5).toString('ascii');
    if (header !== '%PDF-')          return { ok: false, reason: 'Not a valid PDF (bad header)' };

    // Count pages by counting /Type /Page dictionary entries
    const str   = buf.toString('binary');
    const pages = (str.match(/\/Type\s*\/Page[^s]/g) || []).length;

    const kb = Math.round(buf.length / 1024);

    if (pages === 0) return { ok: false, reason: `No pages detected (${kb}KB)` };
    if (kb < 15)     return { ok: false, reason: `Too small — likely blank (${kb}KB)` };
    if (kb > 2000)   return { ok: false, reason: `Suspiciously large (${kb}KB)` };

    return { ok: true, pages, kb };
}

// ── Token validation ──────────────────────────────────────────────────────────
const VALID_LAYOUTS = ['two-col', 'single', 'top-banner', 'asymmetric'];
const TOKEN_KEYS    = ['headerBg','headerText','sidebarBg','sidebarText','accent','mainBg','mainText','skillBg','skillText'];

function validateTokens(result) {
    if (!result)              return { ok: false, reason: 'Null result' };
    if (!result.layout)       return { ok: false, reason: 'Missing layout' };
    if (!VALID_LAYOUTS.includes(result.layout))
                              return { ok: false, reason: `Invalid layout: ${result.layout}` };
    if (!result.tokens)       return { ok: false, reason: 'Missing tokens' };

    const missing = TOKEN_KEYS.filter(k => !result.tokens[k]);
    if (missing.length > 3)   return { ok: false, reason: `Missing tokens: ${missing.join(', ')}` };

    // Validate hex colours
    const badColor = Object.entries(result.tokens).find(([k, v]) => {
        if (!v) return false;
        if (typeof v !== 'string') return true;
        return !v.match(/^(#[0-9a-fA-F]{3,8}|rgba?\(.*\)|[a-zA-Z-]+,.*san.*|system-ui.*)$/);
    });

    return { ok: true, layout: result.layout, tokens: result.tokens };
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function progress(done, total, label = '') {
    const pct  = Math.round((done / total) * 100);
    const bars = Math.round((done / total) * 30);
    const bar  = '█'.repeat(bars) + '░'.repeat(30 - bars);
    process.stdout.write(`\r${c.cyan}[${bar}]${c.reset} ${pct}% (${done}/${total}) ${c.dim}${label.slice(0,40)}${c.reset}    `);
}

// ── Run tests ─────────────────────────────────────────────────────────────────
async function runTests() {
    if (SAVE_PDFS && !fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    console.log(`\n${c.bold}${c.cyan}═══════════════════════════════════════════════════════════════${c.reset}`);
    console.log(`${c.bold}  Renonym AI — Automated Test Suite${c.reset}`);
    console.log(`${c.cyan}═══════════════════════════════════════════════════════════════${c.reset}`);
    console.log(`  Server:   ${c.yellow}${RAILWAY_URL}${c.reset}`);
    console.log(`  Secret:   ${API_SECRET ? c.green + '✓ Set' : c.red + '✗ Not set'}${c.reset}`);
    console.log(`  Tests:    ${COUNT}`);
    console.log(`  Modes:    ${PDF_ONLY ? 'PDF only' : TOKENS_ONLY ? 'Tokens only' : 'All'}`);
    console.log(`${c.cyan}═══════════════════════════════════════════════════════════════${c.reset}\n`);

    // Quick server health check
    try {
        const health = await apiPost('/../version', {}, 5000).catch(() => null);
        // Try GET instead
        const r = await new Promise((res, rej) => {
            const url = new URL(RAILWAY_URL + '/version');
            const lib = url.protocol === 'https:' ? https : http;
            const req = lib.get(RAILWAY_URL + '/version', r => {
                let body = '';
                r.on('data', d => body += d);
                r.on('end', () => res({ status: r.statusCode, body }));
            });
            req.setTimeout(8000, () => { req.destroy(); rej(new Error('TIMEOUT')); });
            req.on('error', rej);
        });
        const v = JSON.parse(r.body);
        console.log(`  ${ok} Server alive — ${c.dim}${v.version} (booted ${new Date(v.bootTime).toLocaleTimeString()})${c.reset}\n`);
    } catch (e) {
        console.log(`  ${warn} Health check failed: ${e.message} — continuing anyway\n`);
    }

    const results  = { tokens: [], pdf: [] };
    const start    = Date.now();

    // ── TOKEN TESTS ─────────────────────────────────────────────────────────
    if (!PDF_ONLY) {
        const tokenCount = Math.min(COUNT, PROMPTS.length);
        console.log(`${c.bold}▶ Token generation tests (${tokenCount})${c.reset}`);
        console.log(`  Testing /generate-template — verifying layout + color tokens\n`);

        const sizes = ['minimal','medium','heavy'];

        for (let i = 0; i < tokenCount; i++) {
            const prompt  = PROMPTS[i % PROMPTS.length];
            const size    = sizes[i % sizes.length];
            const resume  = makeResume(size);
            progress(i, tokenCount, prompt);

            const t0 = Date.now();
            let result;
            try {
                const { status, buf } = await apiPost('/generate-template', {
                    prompt,
                    resumeData: resume,
                    metadata: {
                        hasPhoto:           false,
                        experienceCount:    resume.experiences.length,
                        skillCount:         resume.skills.length,
                        certificationCount: resume.certifications.length,
                        educationCount:     resume.education.length,
                        summaryLength:      resume.summary.length,
                        totalBullets:       resume.experiences.reduce((s,e) => s + e.bullets.length, 0),
                    }
                }, 60000);

                const ms = Date.now() - t0;

                if (status === 429) {
                    results.tokens.push({ i, prompt, ok: false, reason: 'RATE_LIMITED', ms });
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }

                if (status !== 200) {
                    results.tokens.push({ i, prompt, ok: false, reason: `HTTP ${status}`, ms });
                    continue;
                }

                const data       = JSON.parse(buf.toString());
                const validation = validateTokens(data);

                results.tokens.push({
                    i, prompt, ms,
                    ok:      validation.ok,
                    reason:  validation.reason,
                    layout:  data.layout,
                    size,
                });

            } catch (e) {
                results.tokens.push({ i, prompt, ok: false, reason: e.message, ms: Date.now() - t0 });
            }

            // Gentle rate-limit buffer between requests
            if (i < tokenCount - 1) await new Promise(r => setTimeout(r, 400));
        }

        process.stdout.write('\r' + ' '.repeat(80) + '\r');

        // Print token results
        const tPass = results.tokens.filter(r => r.ok).length;
        const tFail = results.tokens.filter(r => !r.ok).length;
        const tAvg  = Math.round(results.tokens.reduce((s,r) => s + r.ms, 0) / results.tokens.length);

        results.tokens.forEach(r => {
            const icon     = r.ok ? ok : fail;
            const layout   = r.ok ? c.cyan + r.layout + c.reset : '';
            const timing   = c.dim + r.ms + 'ms' + c.reset;
            const size     = c.dim + '[' + (r.size||'') + ']' + c.reset;
            const reason   = r.ok ? '' : c.red + ' → ' + r.reason + c.reset;
            const prompt   = r.prompt.length > 45 ? r.prompt.slice(0,42) + '...' : r.prompt.padEnd(45);
            console.log(`  ${icon} ${prompt} ${layout} ${size} ${timing}${reason}`);
        });

        console.log(`\n  ${c.bold}Token tests: ${c.green}${tPass} passed${c.reset}, ${tFail > 0 ? c.red : c.dim}${tFail} failed${c.reset}, avg ${tAvg}ms${c.reset}\n`);
    }

    // ── PDF TESTS ──────────────────────────────────────────────────────────
    if (!TOKENS_ONLY) {
        const pdfScenarios = [
            // [label, resume size, extra CSS notes]
            { label: 'Minimal resume — default template',     size: 'minimal'  },
            { label: 'Medium resume — default template',      size: 'medium'   },
            { label: 'Heavy resume — 6 exp, 24 skills',       size: 'heavy'    },
            { label: 'Minimal + custom font Inter',           size: 'minimal',  fontSize: 'small'  },
            { label: 'Medium + font size small',              size: 'medium',   fontSize: 'small'  },
            { label: 'Medium + font size medium',             size: 'medium',   fontSize: 'medium' },
            { label: 'Medium + font size large',              size: 'medium',   fontSize: 'large'  },
            { label: 'Heavy + font size small',               size: 'heavy',    fontSize: 'small'  },
            { label: 'Heavy + font size large',               size: 'heavy',    fontSize: 'large'  },
            { label: 'Heavy resume — no sidebar content',     size: 'heavy'    },
        ].slice(0, Math.min(COUNT, 10));

        const pdfCount = pdfScenarios.length;
        console.log(`${c.bold}▶ PDF generation tests (${pdfCount})${c.reset}`);
        console.log(`  Testing /generate-pdf — verifying single page, valid content\n`);

        for (let i = 0; i < pdfScenarios.length; i++) {
            const scenario = pdfScenarios[i];
            const resume   = makeResume(scenario.size);
            progress(i, pdfCount, scenario.label);

            const fSize = scenario.fontSize || 'medium';
            const fStack = { small: '9px', medium: '10px', large: '11px' };

            // Minimal CSS — just the structural base needed for PDF render
            const css = `
                .rb-resume { font-family: system-ui, sans-serif; font-size: ${fStack[fSize]}; width: 794px; }
                .rb-resume__header { background: #2d1b69; color: #fff; padding: 24px; display: flex; align-items: center; gap: 16px; }
                .rb-resume__name { font-size: 26px; font-weight: 800; color: #fff; }
                .rb-resume__title-line { font-size: 13px; color: rgba(255,255,255,0.7); }
                .rb-resume__contact { display: flex; gap: 12px; margin-top: 6px; flex-wrap: wrap; }
                .rb-resume__contact-item { font-size: 11px; color: rgba(255,255,255,0.6); }
                .rb-resume__body { display: grid; grid-template-columns: 210px 1fr; }
                .rb-resume__sidebar { background: #f0ebff; padding: 20px; }
                .rb-resume__main { background: #fff; padding: 20px; }
                .rb-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6d28d9; border-bottom: 1px solid #6d28d9; padding-bottom: 4px; margin-bottom: 10px; }
                .rb-summary { font-size: 11px; line-height: 1.5; color: #374151; }
                .rb-skills { display: flex; flex-wrap: wrap; gap: 5px; }
                .rb-skill-pill { background: #6d28d9; color: #fff; border-radius: 12px; padding: 3px 8px; font-size: 10px; }
                .rb-cert { background: #ede9fe; color: #4c1d95; border-radius: 6px; padding: 5px 10px; font-size: 10px; margin-bottom: 4px; }
                .rb-exp-company { font-weight: 700; font-size: 13px; color: #1a1a2e; }
                .rb-exp-role { font-size: 11px; color: #6d28d9; font-style: italic; }
                .rb-exp-date { font-size: 10px; color: #6d28d9; }
                .rb-exp-bullets { padding-left: 16px; margin: 6px 0; }
                .rb-exp-bullets li { font-size: 11px; line-height: 1.5; margin-bottom: 2px; }
                .rb-edu-degree { font-weight: 700; font-size: 12px; }
                .rb-edu-school, .rb-edu-years { font-size: 11px; color: #64748b; }
                .rb-resume__section { margin-bottom: 14px; }
                .rb-exp-item { margin-bottom: 14px; }
            `;

            // Build HTML representing the resume (minimal but realistic)
            const expHtml = resume.experiences.map(e => `
                <div class="rb-exp-item">
                    <div style="display:flex;justify-content:space-between;align-items:baseline">
                        <div>
                            <div class="rb-exp-company">${e.company}</div>
                            <div class="rb-exp-role">${e.title}</div>
                        </div>
                        <div class="rb-exp-date">${e.dateRange}</div>
                    </div>
                    <ul class="rb-exp-bullets">${e.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
                </div>
            `).join('');

            const html = `
                <div class="rb-resume rb-resume--sf-classic" data-id="resume-preview"
                     data-font="Inter" data-font-size="${fSize}">
                    <div class="rb-resume__header">
                        <div>
                            <div class="rb-resume__name">${resume.fullName}</div>
                            <div class="rb-resume__title-line">${resume.title}</div>
                            <div class="rb-resume__contact">
                                <span class="rb-resume__contact-item">${resume.email}</span>
                                <span class="rb-resume__contact-item">${resume.phone}</span>
                                <span class="rb-resume__contact-item">${resume.location}</span>
                            </div>
                        </div>
                    </div>
                    <div class="rb-resume__body">
                        <aside class="rb-resume__sidebar">
                            <div class="rb-resume__section">
                                <div class="rb-section-title">About</div>
                                <div class="rb-summary">${resume.summary}</div>
                            </div>
                            <div class="rb-resume__section">
                                <div class="rb-section-title">Skills</div>
                                <div class="rb-skills">${resume.skills.map(s => `<span class="rb-skill-pill">${s}</span>`).join('')}</div>
                            </div>
                            ${resume.certifications.length ? `
                            <div class="rb-resume__section">
                                <div class="rb-section-title">Certifications</div>
                                ${resume.certifications.map(c => `<div class="rb-cert">${c}</div>`).join('')}
                            </div>` : ''}
                        </aside>
                        <main class="rb-resume__main">
                            <div class="rb-resume__section">
                                <div class="rb-section-title">Experience</div>
                                ${expHtml}
                            </div>
                            <div class="rb-resume__section">
                                <div class="rb-section-title">Education</div>
                                ${resume.education.map(e => `
                                    <div class="rb-edu-item">
                                        <div class="rb-edu-degree">${e.degree}, ${e.field}</div>
                                        <div class="rb-edu-school">${e.school}</div>
                                        <div class="rb-edu-years">${e.years}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </main>
                    </div>
                </div>
            `;

            const t0 = Date.now();
            try {
                const { status, buf } = await apiPost('/generate-pdf', { html, css }, 90000);
                const ms       = Date.now() - t0;
                const pdfCheck = validatePdf(buf);

                const result = {
                    i, ms,
                    label:    scenario.label,
                    size:     scenario.size,
                    fontSize: fSize,
                    ok:       status === 200 && pdfCheck.ok,
                    reason:   status !== 200 ? `HTTP ${status}` : pdfCheck.reason,
                    pages:    pdfCheck.pages,
                    kb:       pdfCheck.kb,
                };
                results.pdf.push(result);

                if (SAVE_PDFS && result.ok && buf) {
                    const fname = path.join(OUT_DIR, `pdf-test-${i+1}-${scenario.size}-${fSize}.pdf`);
                    fs.writeFileSync(fname, buf);
                }

            } catch (e) {
                results.pdf.push({ i, label: scenario.label, ok: false, reason: e.message, ms: Date.now() - t0 });
            }

            await new Promise(r => setTimeout(r, 300));
        }

        process.stdout.write('\r' + ' '.repeat(80) + '\r');

        const pPass = results.pdf.filter(r => r.ok).length;
        const pFail = results.pdf.filter(r => !r.ok).length;
        const pAvg  = Math.round(results.pdf.reduce((s,r) => s + (r.ms||0), 0) / results.pdf.length);

        results.pdf.forEach(r => {
            const icon   = r.ok ? ok : fail;
            const pages  = r.ok ? c.dim + `${r.pages}p ${r.kb}KB` + c.reset : '';
            const reason = r.ok ? '' : c.red + ' → ' + r.reason + c.reset;
            const timing = c.dim + (r.ms||0) + 'ms' + c.reset;
            const label  = r.label.length > 45 ? r.label.slice(0,42) + '...' : r.label.padEnd(45);
            console.log(`  ${icon} ${label} ${pages} ${timing}${reason}`);
        });

        console.log(`\n  ${c.bold}PDF tests: ${c.green}${pPass} passed${c.reset}, ${pFail > 0 ? c.red : c.dim}${pFail} failed${c.reset}, avg ${pAvg}ms${c.reset}\n`);
    }

    // ── FINAL REPORT ──────────────────────────────────────────────────────
    const totalMs   = Date.now() - start;
    const allTests  = [...results.tokens, ...results.pdf];
    const allPass   = allTests.filter(r => r.ok).length;
    const allFail   = allTests.filter(r => !r.ok).length;
    const allRated  = allTests.filter(r => r.reason === 'RATE_LIMITED').length;

    console.log(`${c.cyan}═══════════════════════════════════════════════════════════════${c.reset}`);
    console.log(`${c.bold}  FINAL RESULTS${c.reset}`);
    console.log(`${c.cyan}═══════════════════════════════════════════════════════════════${c.reset}`);
    console.log(`  Total tests:    ${allTests.length}`);
    console.log(`  ${c.green}Passed:${c.reset}         ${allPass}`);
    console.log(`  ${allFail > 0 ? c.red : c.dim}Failed:${c.reset}         ${allFail}`);
    if (allRated) console.log(`  ${c.yellow}Rate limited:${c.reset}   ${allRated} (try again in 15 min)`);
    console.log(`  Time:           ${(totalMs/1000).toFixed(1)}s`);

    const score = Math.round((allPass / allTests.length) * 100);
    const scoreColor = score === 100 ? c.green : score >= 80 ? c.yellow : c.red;
    console.log(`\n  ${c.bold}Score: ${scoreColor}${score}%${c.reset}`);

    if (allFail === 0) {
        console.log(`\n  ${c.green}${c.bold}✓ All tests passed — system is bulletproof${c.reset}`);
    } else {
        console.log(`\n  ${c.red}Failures:${c.reset}`);
        allTests.filter(r => !r.ok).forEach(r => {
            console.log(`    • ${(r.prompt || r.label || '').slice(0,50)} → ${r.reason}`);
        });
    }

    // Save JSON report
    const reportPath = path.join(process.cwd(), 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({ timestamp: new Date().toISOString(), score, results, totalMs }, null, 2));
    console.log(`\n  Report saved → ${c.dim}${reportPath}${c.reset}`);
    console.log(`${c.cyan}═══════════════════════════════════════════════════════════════${c.reset}\n`);

    process.exit(allFail > 0 ? 1 : 0);
}

runTests().catch(e => {
    console.error(c.red + 'Fatal error: ' + e.message + c.reset);
    process.exit(1);
});
