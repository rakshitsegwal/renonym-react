// Application Tracker — backend integration smoke test (plain Node script,
// same style as test-resumes.js). Hits the LIVE backend, so it needs a real
// signed-in user's JWT:
//
//   TOKEN=<rn-auth-token from localStorage> API_SECRET=rn_live_... node test-tracker.js
//   RAILWAY_URL=https://... to target a specific backend (defaults to prod)
//
// Exercises the full CRM lifecycle: create → read → events (note/round/
// followup) → agenda → stage moves → insights → archive. Cleans up after
// itself (archives the test job).

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://salesforce-resume-pdf-server-production.up.railway.app';
const TOKEN = process.env.TOKEN;
const API_SECRET = process.env.API_SECRET;

if (!TOKEN) { console.error('Set TOKEN (your rn-auth-token JWT).'); process.exit(1); }

let passed = 0, failed = 0;
function ok(name, cond, extra) {
    if (cond) { passed++; console.log(`  ✓ ${name}`); }
    else { failed++; console.error(`  ✗ ${name}${extra ? ' — ' + extra : ''}`); }
}

async function req(path, method = 'GET', body) {
    const res = await fetch(RAILWAY_URL + path, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-client-id': 'test-tracker',
            ...(API_SECRET ? { 'x-api-secret': API_SECRET } : {}),
            Authorization: `Bearer ${TOKEN}`,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
    let data = null;
    try { data = await res.json(); } catch {}
    return { status: res.status, data };
}

(async () => {
    console.log(`Tracker smoke test → ${RAILWAY_URL}\n`);

    // 1. create
    console.log('CREATE');
    const create = await req('/tracker/jobs', 'POST', {
        company: 'TestCo (smoke)', title: 'Staff Engineer', location: 'Remote',
        url: 'https://example.com/job', source: 'smoke-test', stage: 'saved',
        jd: 'We need a Staff Engineer with deep Postgres and Node experience.',
        salaryMin: 4000000, salaryMax: 5500000,
    });
    ok('creates a job', create.status === 200 && create.data?.id, JSON.stringify(create.data));
    const jobId = create.data?.id;
    if (!jobId) { console.error('Cannot continue without a job id.'); process.exit(1); }

    const noFields = await req('/tracker/jobs', 'POST', { company: '  ', title: '' });
    ok('rejects empty company/title (400)', noFields.status === 400);

    // 2. read
    console.log('READ');
    const got = await req(`/tracker/jobs/${jobId}`);
    ok('fetches job + events', got.status === 200 && got.data?.job?.company === 'TestCo (smoke)' && Array.isArray(got.data?.events));
    ok('initial stage event logged', got.data?.events?.some(e => e.type === 'stage'));
    const list = await req('/tracker/jobs?q=TestCo');
    ok('search finds it', list.status === 200 && list.data?.jobs?.some(j => j.id === jobId));
    const bad = await req('/tracker/jobs/not-a-uuid');
    ok('non-UUID id → 404', bad.status === 404);

    // 3. events
    console.log('EVENTS');
    const note = await req(`/tracker/jobs/${jobId}/events`, 'POST', { type: 'note', body: 'Spoke to the recruiter, sounds promising.' });
    ok('adds a note', note.status === 200 && note.data?.id);
    const due = new Date(Date.now() + 3600_000).toISOString();
    const round = await req(`/tracker/jobs/${jobId}/events`, 'POST', { type: 'round', title: 'Tech round 1', dueAt: due });
    ok('adds a dated interview round', round.status === 200 && round.data?.due_at);
    const fup = await req(`/tracker/jobs/${jobId}/events`, 'POST', { type: 'followup', title: 'Nudge recruiter', dueAt: due });
    ok('adds a follow-up', fup.status === 200);
    const empty = await req(`/tracker/jobs/${jobId}/events`, 'POST', { type: 'note' });
    ok('rejects empty event (400)', empty.status === 400);

    // 4. agenda
    console.log('AGENDA');
    const agenda = await req('/tracker/agenda');
    const inAgenda = [...(agenda.data?.today || []), ...(agenda.data?.upcoming || [])];
    ok('agenda lists the dated round', agenda.status === 200 && inAgenda.some(i => i.title === 'Tech round 1'));
    const doneRes = await req(`/tracker/events/${round.data.id}`, 'PATCH', { done: true });
    ok('marks the round done', doneRes.status === 200 && doneRes.data?.done === true);

    // 5. stage moves + insights
    console.log('PIPELINE');
    const applied = await req(`/tracker/jobs/${jobId}`, 'PATCH', { stage: 'applied' });
    ok('moves to applied + stamps applied_at', applied.status === 200 && applied.data?.applied_at);
    const interviewing = await req(`/tracker/jobs/${jobId}`, 'PATCH', { stage: 'interviewing', nextAction: 'Prep system design', nextActionDue: due });
    ok('moves to interviewing + sets next action', interviewing.status === 200 && interviewing.data?.next_action === 'Prep system design');
    const after = await req(`/tracker/jobs/${jobId}`);
    ok('stage changes logged in timeline', (after.data?.events || []).filter(e => e.type === 'stage').length >= 3);
    const insights = await req('/tracker/insights');
    ok('insights respond with stage counts', insights.status === 200 && typeof insights.data?.active === 'number');

    // 6. cleanup
    console.log('CLEANUP');
    const del = await req(`/tracker/events/${note.data.id}`, 'DELETE');
    ok('deletes an event', del.status === 200);
    const arch = await req(`/tracker/jobs/${jobId}`, 'DELETE');
    ok('archives the job', arch.status === 200);
    const listAfter = await req('/tracker/jobs?q=TestCo');
    ok('archived job hidden from board', !(listAfter.data?.jobs || []).some(j => j.id === jobId));

    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
})().catch(e => { console.error('FATAL:', e); process.exit(1); });
