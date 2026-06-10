#!/usr/bin/env node
/**
 * Renonym AI — PDF render + guardrail test
 * Renders 5 saved themes to real PDFs via the live /generate-pdf, saves them
 * locally, then fires a 6th request to confirm the export rate-limit guardrail.
 *
 * Faithfully mirrors the frontend: token values applied as inline --rn-*
 * custom properties on the resume root + the real app.css.
 *
 * Usage:
 *   VITE_API_SECRET=rn_live_... node test-pdf.js
 */

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const RAILWAY_URL = (process.env.RAILWAY_URL || 'https://salesforce-resume-pdf-server-production.up.railway.app').replace(/\/$/, '');
const API_SECRET  = process.env.API_SECRET || process.env.VITE_API_SECRET || '';
const CLIENT_ID   = 'pdf-test-' + Date.now();
const TPL_DIR     = path.join(process.cwd(), 'test-output', 'templates');
const PDF_DIR     = path.join(process.cwd(), 'test-output', 'pdfs');
const APP_CSS     = path.join(process.cwd(), 'src', 'app.css');

const c = { reset:'\x1b[0m', bold:'\x1b[1m', dim:'\x1b[2m', green:'\x1b[32m', red:'\x1b[31m', yellow:'\x1b[33m', cyan:'\x1b[36m' };
const ok = `${c.green}✓${c.reset}`, bad = `${c.red}✗${c.reset}`, warn = `${c.yellow}⚠${c.reset}`;

// Fixed resume content (matches the live builder shape)
const RESUME = {
    fullName:'Rakshit Segwal', title:'Lead Salesforce Engineer', initials:'RS',
    email:'rakshit@example.com', phone:'+91 930-787-3547', location:'Chandigarh, India',
    linkedIn:'linkedin.com/in/rakshit-segwal',
    summary:'Lead Salesforce Engineer with 8+ years building scalable CRM solutions across diverse industries. Proven ability to lead end-to-end implementations and improve platform security and performance.',
    skills:['Salesforce Apex','Lightning Web Components','Aura','SLDS','Sales Cloud','Service Cloud','Integrations','REST APIs','AWS','Data Modeling','Mulesoft','CI/CD','SOQL','Flow'],
    certifications:['Salesforce Certified Platform Developer II','Salesforce Certified Administrator','AWS Certified Solutions Architect'],
    experiences:[
        { company:'Infosys', title:'Senior Consultant', dateRange:'Jan 2025 – Present', bullets:['Led a team of 15 Salesforce developers delivering enterprise-scale CRM solutions.','Designed and implemented a job-monitoring system improving reliability and observability.','Spearheaded a global elevator-enterprise rollout end to end.'] },
        { company:'Deliveroo', title:'Salesforce Developer', dateRange:'Dec 2023 – Jan 2025', bullets:['Improved security posture by 50% via role-based access control.','Automated integrations fetching real-time data, reducing manual work.','Built secure AWS S3-based document management.'] },
        { company:'Samsung Data Systems', title:'Engineer II', dateRange:'Dec 2021 – Dec 2023', bullets:['Built a partner portal on Experience Cloud, improving response time by 25%.','Optimised LWC and Aura components enhancing performance and UX.'] },
    ],
    education:[{ degree:'Bachelor of Engineering', field:'Computer Science', school:'Chandigarh University', years:'2014 – 2018' }],
};

const TOKEN_VARS = [
    ['--rn-hbg','headerBg'],['--rn-htx','headerText'],['--rn-hsub','headerSub'],
    ['--rn-sbg','sidebarBg'],['--rn-stx','sidebarText'],['--rn-stitle','sidebarTitle'],
    ['--rn-accent','accent'],['--rn-mbg','mainBg'],['--rn-mtx','mainText'],
    ['--rn-mtitle','mainTitle'],['--rn-mrole','mainRole'],['--rn-skillbg','skillBg'],
    ['--rn-skilltx','skillText'],['--rn-certbg','certBg'],['--rn-certtx','certText'],
    ['--rn-font','fontBody'],['--rn-font-h','fontHeading'],
];

function tokenStyle(t) {
    return TOKEN_VARS.filter(([,k]) => t[k]).map(([v,k]) => `${v}:${t[k]}`).join(';');
}

const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function headerHtml() {
    const r = RESUME;
    return `<div class="rb-resume__header">
      <div class="rb-resume__photo-wrap"><div class="rb-resume__photo-placeholder">${r.initials}</div></div>
      <div class="rb-resume__id">
        <h1 class="rb-resume__name">${esc(r.fullName)}</h1>
        <p class="rb-resume__title-line">${esc(r.title)}</p>
        <div class="rb-resume__contact">
          <span class="rb-resume__contact-item">${esc(r.email)}</span>
          <span class="rb-resume__contact-item">${esc(r.phone)}</span>
          <span class="rb-resume__contact-item">${esc(r.location)}</span>
          <span class="rb-resume__contact-item">${esc(r.linkedIn)}</span>
        </div>
      </div>
    </div>`;
}
function summaryHtml() { return `<section class="rb-resume__section"><h3 class="rb-section-title">About</h3><p class="rb-summary">${esc(RESUME.summary)}</p></section>`; }
function skillsHtml()  { return `<section class="rb-resume__section"><h3 class="rb-section-title">Skills</h3><div class="rb-skills">${RESUME.skills.map(s=>`<span class="rb-skill-pill">${esc(s)}</span>`).join('')}</div></section>`; }
function certsHtml()   { return `<section class="rb-resume__section"><h3 class="rb-section-title">Certifications</h3>${RESUME.certifications.map(x=>`<div class="rb-cert">${esc(x)}</div>`).join('')}</section>`; }
function expHtml()     { return `<section class="rb-resume__section"><h3 class="rb-section-title">Experience</h3>${RESUME.experiences.map(e=>`<div class="rb-exp-item"><div class="rb-exp-head"><span class="rb-exp-company">${esc(e.company)}</span><span class="rb-exp-date">${esc(e.dateRange)}</span></div><div class="rb-exp-role">${esc(e.title)}</div><ul class="rb-exp-bullets">${e.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul></div>`).join('')}</section>`; }
function eduHtml()     { return `<section class="rb-resume__section"><h3 class="rb-section-title">Education</h3>${RESUME.education.map(e=>`<div class="rb-edu-item"><div class="rb-edu-head"><span class="rb-edu-degree">${esc(e.degree)}, ${esc(e.field)}</span><span class="rb-edu-years">${esc(e.years)}</span></div><div class="rb-edu-school">${esc(e.school)}</div></div>`).join('')}</section>`; }

function buildHtml(theme) {
    const cls = ['rb-resume','rb-resume--ai-generated','rb-resume--ai-tokens'];
    const style = tokenStyle(theme.tokens);
    if (theme.layout === 'single') {
        cls.push('rb-resume--layout-single');
        return `<div class="${cls.join(' ')}" data-id="resume-preview" data-font="Inter" data-font-size="medium" style="${style}">
          <div class="rb-resume__top-deco"></div>${headerHtml()}
          <div class="rb-resume__body rb-resume__body--single">${summaryHtml()}${skillsHtml()}${certsHtml()}${expHtml()}${eduHtml()}</div>
        </div>`;
    }
    // default: two-col
    return `<div class="${cls.join(' ')}" data-id="resume-preview" data-font="Inter" data-font-size="medium" style="${style}">
      <div class="rb-resume__top-deco"></div>${headerHtml()}
      <div class="rb-resume__body">
        <aside class="rb-resume__sidebar">${summaryHtml()}${skillsHtml()}${certsHtml()}</aside>
        <main class="rb-resume__main">${expHtml()}${eduHtml()}</main>
      </div>
    </div>`;
}

function buildCss() {
    const appCss = fs.readFileSync(APP_CSS, 'utf8');
    const fontImport = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');\n";
    const fontOverride = ".rb-resume { font-family: 'Inter', -apple-system, sans-serif !important; font-size: 10px !important; }\n";
    return fontImport + fontOverride + appCss;
}

function validatePdf(buf) {
    if (!buf || buf.length < 100) return { ok:false, reason:'empty' };
    if (buf.slice(0,5).toString('ascii') !== '%PDF-') return { ok:false, reason:'bad header' };
    const str = buf.toString('binary');
    const pages = (str.match(/\/Type\s*\/Page[^s]/g) || []).length;
    const kb = Math.round(buf.length/1024);
    return { ok: kb >= 10, pages, kb, reason: kb < 10 ? 'too small (blank?)' : '' };
}

function post(p, body, timeoutMs=90000) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const url = new URL(RAILWAY_URL + p);
        const lib = url.protocol === 'https:' ? https : http;
        const req = lib.request({ hostname:url.hostname, port:url.port||443, path:url.pathname, method:'POST',
            headers:{ 'Content-Type':'application/json','Content-Length':Buffer.byteLength(payload),'x-client-id':CLIENT_ID, ...(API_SECRET?{'x-api-secret':API_SECRET}:{}) } },
            res => { const ch=[]; res.on('data',d=>ch.push(d)); res.on('end',()=>resolve({status:res.statusCode, buf:Buffer.concat(ch)})); });
        req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('TIMEOUT')); });
        req.on('error', reject);
        req.write(payload); req.end();
    });
}

function getVersion() {
    return new Promise(res => {
        https.get(RAILWAY_URL + '/version', r => { let b=''; r.on('data',d=>b+=d); r.on('end',()=>{ try{res(JSON.parse(b).version);}catch(e){res('?');} }); }).on('error',()=>res('?'));
    });
}

async function main() {
    fs.mkdirSync(PDF_DIR, { recursive: true });

    // Pick 6 saved themes with supported layouts (two-col / single)
    const files = fs.readdirSync(TPL_DIR).filter(f => f.endsWith('.json')).sort();
    const themes = [];
    for (const f of files) {
        const t = JSON.parse(fs.readFileSync(path.join(TPL_DIR, f), 'utf8'));
        if (t.ok && ['two-col','single'].includes(t.layout)) themes.push({ file:f, ...t });
        if (themes.length === 6) break;
    }

    const version = await getVersion();
    console.log(`\n${c.bold}${c.cyan}Renonym — PDF render + guardrail test${c.reset}`);
    console.log(`  Server:  ${c.yellow}${RAILWAY_URL}${c.reset}`);
    console.log(`  Version: ${version === 'v10.1-tokens-2026' ? c.green : c.yellow}${version}${c.reset}${version!=='v10.1-tokens-2026' ? c.yellow+'  (expected v10.1 — PDFs may show old bugs)'+c.reset : ''}`);
    console.log(`  Themes:  ${themes.length} (rendering 5, 6th = guardrail check)\n`);

    const css = buildCss();
    const results = [];

    for (let i = 0; i < themes.length; i++) {
        const theme = themes[i];
        const label = `${String(i+1).padStart(2,'0')}. ${theme.prompt.slice(0,42).padEnd(42)}`;
        const html = buildHtml(theme);
        const t0 = Date.now();
        const isGuardrail = i === 5; // 6th
        try {
            const { status, buf } = await post('/generate-pdf', { html, css });
            const ms = Date.now() - t0;
            if (status === 429) {
                const msg = isGuardrail ? `${ok} ${c.green}GUARDRAIL OK${c.reset} — 6th request blocked (429)` : `${warn} RATE-LIMITED early (429)`;
                console.log(`  ${label} ${msg} ${c.dim}${ms}ms${c.reset}`);
                results.push({ i:i+1, prompt:theme.prompt, status:429, guardrail:isGuardrail });
                continue;
            }
            if (status !== 200) { console.log(`  ${bad} ${label} ${c.red}HTTP ${status}${c.reset}`); results.push({ i:i+1, prompt:theme.prompt, status }); continue; }
            const v = validatePdf(buf);
            const fname = path.join(PDF_DIR, `${String(i+1).padStart(2,'0')}-${theme.file.replace(/^\d+-/,'').replace('.json','')}.pdf`);
            fs.writeFileSync(fname, buf);
            const flag = isGuardrail ? c.yellow+' (expected 429 but went through — limiter budget not exhausted)'+c.reset : '';
            console.log(`  ${v.ok?ok:warn} ${label} ${c.cyan}${theme.layout.padEnd(8)}${c.reset} ${c.dim}${v.pages}p ${v.kb}KB ${ms}ms${c.reset} → ${path.basename(fname)}${flag}`);
            results.push({ i:i+1, prompt:theme.prompt, status:200, layout:theme.layout, pages:v.pages, kb:v.kb, file:fname });
        } catch (e) {
            console.log(`  ${bad} ${label} ${c.red}${e.message}${c.reset}`);
            results.push({ i:i+1, prompt:theme.prompt, error:e.message });
        }
        await new Promise(r => setTimeout(r, 600));
    }

    const saved = results.filter(r => r.status === 200);
    const blocked = results.find(r => r.status === 429);
    console.log(`\n${c.cyan}──────────────────────────────────────────────${c.reset}`);
    console.log(`  ${c.bold}PDFs saved:${c.reset} ${saved.length} → ${c.dim}test-output/pdfs/${c.reset}`);
    console.log(`  ${c.bold}Guardrail:${c.reset} ${blocked ? c.green+'confirmed (got a 429)'+c.reset : c.yellow+'not triggered (export budget not exhausted)'+c.reset}`);
    if (saved.length) {
        const kbs = saved.map(r=>r.kb);
        console.log(`  ${c.bold}Sizes:${c.reset} ${Math.min(...kbs)}–${Math.max(...kbs)}KB, pages: ${[...new Set(saved.map(r=>r.pages))].join('/')}`);
    }
    console.log(`${c.cyan}──────────────────────────────────────────────${c.reset}\n`);
}

main().catch(e => { console.error(c.red+'Fatal: '+e.message+c.reset); process.exit(1); });
