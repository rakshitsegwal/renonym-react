#!/usr/bin/env node
/**
 * Renonym AI — Template (design-token) quality scorer
 * Fires N random style prompts at /generate-template, scores each returned
 * theme, and saves per-template files + a consolidated report.
 *
 * Score (0–100) per template:
 *   - Completeness  (all 17 token keys present)        30
 *   - Hex validity  (every colour a real hex value)    25
 *   - Contrast      (every text/bg pair >= WCAG 4.5)   35
 *   - Layout valid  (one of the four known layouts)    10
 *   (latency is reported, not scored)
 *
 * Usage:
 *   VITE_API_SECRET=rn_live_... node test-templates.js
 *   node test-templates.js --count=20
 */

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const RAILWAY_URL = (process.env.RAILWAY_URL || 'https://salesforce-resume-pdf-server-production.up.railway.app').replace(/\/$/, '');
const API_SECRET  = process.env.API_SECRET || process.env.VITE_API_SECRET || '';
const ARGS        = process.argv.slice(2);
const COUNT       = parseInt((ARGS.find(a => a.startsWith('--count=')) || '').replace('--count=', '')) || 20;
const OUT_DIR     = path.join(process.cwd(), 'test-output', 'templates');

const c = { reset:'\x1b[0m', bold:'\x1b[1m', dim:'\x1b[2m', green:'\x1b[32m', red:'\x1b[31m', yellow:'\x1b[33m', cyan:'\x1b[36m' };
const ok = `${c.green}✓${c.reset}`, bad = `${c.red}✗${c.reset}`, warn = `${c.yellow}⚠${c.reset}`;

// ── Prompt pool (shuffled, first COUNT used) ───────────────────────────────────
const PROMPT_POOL = [
    'FC Barcelona style — deep blue and garnet with gold accents',
    'Real Madrid inspired — clean white with navy and gold',
    'Manchester United red and black bold sporty resume',
    'Apple-style ultra minimal, pure white, thin grey dividers',
    'Netflix dark mode — black and red cinematic editorial',
    'Spotify green and black creative music-industry layout',
    'Google clean white with blue, red, yellow, green accents',
    'Conservative investment banking — navy and white formal serif',
    'Tech startup engineer — dark terminal vibe, monospace, cyan',
    'Healthcare professional — soft blue, white, trustworthy',
    'Legal classic — dark green, cream background, formal',
    'Scandinavian minimal — white and light grey, airy',
    'Deep burgundy and cream elegant with gold details',
    'Forest green and white, nature-inspired professional',
    'Rose gold and charcoal luxury executive',
    'Slate grey and orange modern tech with bold headers',
    'Single column clean, full-width sections, lots of whitespace',
    'Top banner layout with a prominent full-width name header',
    'Asymmetric — wide left identity column, narrow right experience',
    'Confident senior executive — powerful dark, authoritative',
    'Fresh graduate — light, energetic, approachable sans-serif',
    'Data scientist — monochrome with one electric blue accent',
    'Cobalt blue and light grey modern enterprise',
    'Terracotta and warm white creative professional',
    'Charcoal and lime green dark-mode tech',
    'Make it red',
    'Very dark and moody',
    'Luxury premium black and gold',
    'Soft lavender and white delicate professional',
    'Ice white and arctic blue clean minimal',
];

function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function makeResume() {
    return {
        fullName: 'Rakshit Segwal',
        title:    'Lead Salesforce Engineer',
        email:    'rakshit@example.com',
        phone:    '+91 930-787-3547',
        location: 'Chandigarh, India',
        linkedIn: 'linkedin.com/in/rakshit-segwal',
        summary:  'Lead Salesforce Engineer with 8+ years building scalable CRM solutions across diverse industries.',
        skills:   ['Apex','LWC','Aura','SLDS','Sales Cloud','Service Cloud','Integrations','REST APIs','AWS','Data Modeling','Mulesoft','CI/CD'],
        certifications: ['Salesforce Platform Developer II','Salesforce Administrator'],
        experiences: [
            { company:'Infosys', title:'Senior Consultant', dateRange:'Jan 2025 – Present', bullets:['Led a team of 15 developers delivering enterprise CRM.','Designed a job-monitoring system improving reliability.'] },
            { company:'Deliveroo', title:'Salesforce Developer', dateRange:'Dec 2023 – Jan 2025', bullets:['Improved security posture by 50% via role-based access.','Automated integrations reducing manual work.'] },
            { company:'Samsung', title:'Engineer II', dateRange:'Dec 2021 – Dec 2023', bullets:['Built partner portal improving response time by 25%.'] },
        ],
        education: [{ degree:'Bachelor of Engineering', field:'Computer Science', school:'Chandigarh University', years:'2014 – 2018' }],
    };
}

// ── WCAG helpers (mirror server) ───────────────────────────────────────────────
const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const isHex = v => typeof v === 'string' && HEX.test(v.trim());
const toHex6 = h => { h = String(h||'').replace(/^#/,''); if (h.length===4) h=h.slice(0,3); else if (h.length===8) h=h.slice(0,6); return '#'+h; };
const isTransparent = h => { h = String(h||'').replace(/^#/,''); if (h.length===8) return h.slice(6).toLowerCase()==='00'; if (h.length===4) return h.slice(3).toLowerCase()==='0'; return false; };
function rgb(hex){ hex=hex.replace(/^#/,''); if(hex.length===3)hex=hex.split('').map(x=>x+x).join(''); const n=parseInt(hex,16); return {r:(n>>16)&255,g:(n>>8)&255,b:n&255}; }
function lum({r,g,b}){ return [r,g,b].reduce((s,v,i)=>{v/=255;v=v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);return s+v*[0.2126,0.7152,0.0722][i];},0); }
function contrast(a,b){ try{ const l1=lum(rgb(toHex6(a))), l2=lum(rgb(toHex6(b))); const hi=Math.max(l1,l2), lo=Math.min(l1,l2); return (hi+0.05)/(lo+0.05);}catch(e){return 0;} }

const COLOR_KEYS = ['headerBg','headerText','headerSub','sidebarBg','sidebarText','sidebarTitle','accent','mainBg','mainText','mainTitle','mainRole','skillBg','skillText','certBg','certText'];
const ALL_KEYS   = [...COLOR_KEYS, 'fontBody', 'fontHeading'];
const ALLOWED_FONTS = ['Inter','Helvetica','Georgia','Times New Roman','Poppins','Roboto','system-ui'];
const VALID_LAYOUTS = ['two-col','single','top-banner','asymmetric'];

function scoreTemplate(data) {
    const out = { score: 0, breakdown: {}, issues: [], contrast: {} };
    if (!data || !data.tokens) { out.issues.push('no tokens'); return out; }
    const t = data.tokens;

    // Completeness (30)
    const missing = ALL_KEYS.filter(k => t[k] == null || t[k] === '');
    out.breakdown.completeness = Math.round(30 * (1 - missing.length / ALL_KEYS.length));
    if (missing.length) out.issues.push('missing: ' + missing.join(','));

    // Hex validity (25)
    const badHex = COLOR_KEYS.filter(k => t[k] != null && !isHex(t[k]));
    out.breakdown.hex = Math.round(25 * (1 - badHex.length / COLOR_KEYS.length));
    if (badHex.length) out.issues.push('bad hex: ' + badHex.join(','));
    const badFont = ['fontBody','fontHeading'].filter(k => t[k] && !ALLOWED_FONTS.includes(t[k]));
    if (badFont.length) out.issues.push('non-whitelist font: ' + badFont.map(k => `${k}=${t[k]}`).join(','));

    // Contrast (35) — every text/bg pair must clear WCAG AA 4.5:1
    const pairs = [
        ['headerText','headerBg'], ['headerSub','headerBg'],
        ['sidebarText','sidebarBg'], ['sidebarTitle','sidebarBg'],
        ['mainText','mainBg'], ['mainTitle','mainBg'],
        ['skillText','skillBg'],
        ['certText', isTransparent(t.certBg) ? 'sidebarBg' : 'certBg'],
    ];
    let passed = 0;
    pairs.forEach(([tk, bk]) => {
        const r = +contrast(t[tk], t[bk]).toFixed(2);
        out.contrast[`${tk}/${bk}`] = r;
        if (r >= 4.5) passed++; else out.issues.push(`low contrast ${tk}/${bk}=${r}`);
    });
    out.breakdown.contrast = Math.round(35 * (passed / pairs.length));
    out.minContrast = Math.min(...Object.values(out.contrast));

    // Layout (10)
    out.breakdown.layout = VALID_LAYOUTS.includes(data.layout) ? 10 : 0;
    if (!VALID_LAYOUTS.includes(data.layout)) out.issues.push('bad layout: ' + data.layout);

    out.score = Object.values(out.breakdown).reduce((a, b) => a + b, 0);
    return out;
}

function apiPost(p, body, clientId, timeoutMs = 60000) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const url = new URL(RAILWAY_URL + p);
        const lib = url.protocol === 'https:' ? https : http;
        const req = lib.request({
            hostname: url.hostname, port: url.port || 443, path: url.pathname, method: 'POST',
            headers: { 'Content-Type':'application/json', 'Content-Length':Buffer.byteLength(payload), 'x-client-id':clientId, ...(API_SECRET?{'x-api-secret':API_SECRET}:{}) },
        }, res => { const ch=[]; res.on('data',d=>ch.push(d)); res.on('end',()=>resolve({status:res.statusCode, buf:Buffer.concat(ch)})); });
        req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('TIMEOUT')); });
        req.on('error', reject);
        req.write(payload); req.end();
    });
}

function slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40); }

async function main() {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const prompts = shuffle(PROMPT_POOL).slice(0, COUNT);
    const resume  = makeResume();

    console.log(`\n${c.bold}${c.cyan}Renonym — Template quality scorer${c.reset}`);
    console.log(`  Server: ${c.yellow}${RAILWAY_URL}${c.reset}`);
    console.log(`  Secret: ${API_SECRET ? c.green+'set' : c.red+'MISSING'}${c.reset}`);
    console.log(`  Templates: ${prompts.length}\n`);

    const rows = [];
    for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        const clientId = 'tpl-' + Date.now() + '-' + i;   // rotate to dodge per-client limit
        const label = (i+1).toString().padStart(2,'0') + '. ' + prompt.slice(0, 46).padEnd(46);
        const t0 = Date.now();
        try {
            const { status, buf } = await apiPost('/generate-template', {
                prompt, resumeData: resume,
                metadata: { hasPhoto:false, experienceCount:resume.experiences.length, skillCount:resume.skills.length, certificationCount:resume.certifications.length, educationCount:1, summaryLength:resume.summary.length, totalBullets:resume.experiences.reduce((s,e)=>s+e.bullets.length,0) },
            }, clientId);
            const ms = Date.now() - t0;

            if (status === 429) { console.log(`  ${warn} ${label} ${c.yellow}RATE-LIMITED${c.reset}`); rows.push({ i:i+1, prompt, ok:false, rateLimited:true, ms }); await new Promise(r=>setTimeout(r,1500)); continue; }
            if (status !== 200) { console.log(`  ${bad} ${label} ${c.red}HTTP ${status}${c.reset}`); rows.push({ i:i+1, prompt, ok:false, reason:'HTTP '+status, ms }); continue; }

            const data  = JSON.parse(buf.toString());
            const sc    = scoreTemplate(data);
            const color = sc.score >= 90 ? c.green : sc.score >= 75 ? c.yellow : c.red;
            const t     = data.tokens || {};
            console.log(`  ${sc.score>=90?ok:warn} ${label} ${color}${String(sc.score).padStart(3)}/100${c.reset} ${c.dim}${(data.layout||'?').padEnd(10)} hdr=${t.headerBg||'?'} acc=${t.accent||'?'} minC=${sc.minContrast||'?'} ${ms}ms${c.reset}${sc.issues.length?c.red+' · '+sc.issues[0]+c.reset:''}`);

            const record = { i:i+1, prompt, ok:true, ms, layout:data.layout, score:sc.score, breakdown:sc.breakdown, minContrast:sc.minContrast, contrast:sc.contrast, issues:sc.issues, tokens:data.tokens };
            rows.push(record);
            fs.writeFileSync(path.join(OUT_DIR, `${String(i+1).padStart(2,'0')}-${slug(prompt)}.json`), JSON.stringify(record, null, 2));
        } catch (e) {
            console.log(`  ${bad} ${label} ${c.red}${e.message}${c.reset}`);
            rows.push({ i:i+1, prompt, ok:false, reason:e.message, ms:Date.now()-t0 });
        }
        await new Promise(r => setTimeout(r, 500));
    }

    // ── Summary ────────────────────────────────────────────────────────────────
    const scored = rows.filter(r => r.ok);
    const avg = scored.length ? Math.round(scored.reduce((s,r)=>s+r.score,0)/scored.length) : 0;
    const perfect = scored.filter(r => r.score === 100).length;
    const rl = rows.filter(r => r.rateLimited).length;
    const failed = rows.filter(r => !r.ok && !r.rateLimited).length;

    console.log(`\n${c.cyan}──────────────────────────────────────────────${c.reset}`);
    console.log(`  ${c.bold}Scored:${c.reset} ${scored.length}/${rows.length}   ${c.bold}Avg:${c.reset} ${avg>=90?c.green:c.yellow}${avg}/100${c.reset}   ${c.bold}Perfect:${c.reset} ${perfect}   ${rl?c.yellow+'Rate-limited: '+rl+c.reset+'   ':''}${failed?c.red+'Failed: '+failed+c.reset:''}`);
    if (scored.length) {
        const worstContrast = Math.min(...scored.map(r => r.minContrast));
        console.log(`  ${c.bold}Worst contrast across all themes:${c.reset} ${worstContrast>=4.5?c.green:c.red}${worstContrast}:1${c.reset} ${c.dim}(WCAG AA needs 4.5)${c.reset}`);
    }

    // Markdown report
    const md = [
        '# Template quality report',
        '',
        `- Server: \`${RAILWAY_URL}\``,
        `- Templates scored: ${scored.length}/${rows.length}`,
        `- Average score: **${avg}/100**`,
        `- Perfect (100): ${perfect}`,
        rl ? `- Rate-limited (re-run later): ${rl}` : null,
        '',
        '| # | Prompt | Score | Layout | Header | Accent | Min contrast |',
        '|---|--------|-------|--------|--------|--------|--------------|',
        ...rows.map(r => r.ok
            ? `| ${r.i} | ${r.prompt} | ${r.score} | ${r.layout} | \`${r.tokens.headerBg}\` | \`${r.tokens.accent}\` | ${r.minContrast} |`
            : `| ${r.i} | ${r.prompt} | — | ${r.rateLimited?'rate-limited':r.reason} | | | |`),
    ].filter(Boolean).join('\n');

    fs.writeFileSync(path.join(process.cwd(), 'test-output', 'TEMPLATE-REPORT.md'), md + '\n');
    fs.writeFileSync(path.join(process.cwd(), 'test-output', 'template-report.json'), JSON.stringify({ timestamp:new Date().toISOString(), server:RAILWAY_URL, avg, perfect, rows }, null, 2));

    console.log(`\n  Saved: ${c.dim}test-output/templates/*.json${c.reset} (${scored.length} files)`);
    console.log(`  Saved: ${c.dim}test-output/TEMPLATE-REPORT.md${c.reset} + ${c.dim}template-report.json${c.reset}`);
    console.log(`${c.cyan}──────────────────────────────────────────────${c.reset}\n`);
}

main().catch(e => { console.error(c.red + 'Fatal: ' + e.message + c.reset); process.exit(1); });
