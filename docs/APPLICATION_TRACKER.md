# Renonym Application Tracker — Job Search CRM
*Design + implementation record. Owner: product/eng. Shipped June 2026 (backend v13.0).*

---

## 1. Product Requirements

### Personas
- **The Active Hunter (primary)** — applying to 5–30 roles/week (e.g. Salesforce dev, PM). Pain: chaos — which jobs did I apply to, who replied, when do I follow up? Today they use a spreadsheet they stop updating after week one.
- **The Passive Upgrader** — employed, 2–5 carefully chosen applications running. Pain: long multi-round processes with recruiters, salary threads, and weeks between touches; details get lost.
- **The Final-Rounder** — 1–3 live offers/late processes. Pain: comparing offers, tracking deadlines, prepping for each round.

### User goals
1. Never lose track of a live application, contact, or deadline.
2. Know **what to do today** without thinking.
3. Walk into every round prepared (this is where Renonym is unbeatable — prep is one click away).
4. See whether their search is actually working (response rate, velocity), not just feel busy.

### Why this isn't a spreadsheet clone
A spreadsheet stores state. This system **drives action**:
- The tracker's home is an **agenda** ("3 follow-ups due, interview tomorrow"), not a table.
- Every job carries one-click bridges into existing Renonym features: **Practice interview for this job** (JD + company pre-fill the Coach) and **Tailor résumé for this job** (JD pre-fills Job Match).
- **Suggested follow-ups are computed**: any applied job silent for 7+ days surfaces automatically. Spreadsheets never tap you on the shoulder.

### Retention & daily engagement loops
1. **Daily action loop**: open `/tracker` → Today strip shows overdue/today/suggested items → complete them (one tap "done") → next-action emptiness prompts setting the next one. Closing the loop *requires* setting the next step, which guarantees a future visit.
2. **Prep loop**: interview round logged with a date → it appears in the agenda → "Practice this round" deep-links into the Coach with this job's JD → the scored report motivates a re-run.
3. **Momentum loop**: weekly insight strip ("This week: 6 applied · 2 responses · response rate 24% ↑") rewards consistency and exposes a stalled search early.

### Success metrics
- **Activation**: % of signed-in users who add ≥1 job within first session of seeing the tracker.
- **Daily return**: DAU/WAU of /tracker; % of due items marked done within 24h.
- **Cross-feature pull-through**: % of tracked jobs that trigger a Coach session or Job-Match run (the moat metric).
- **Retention**: users with ≥1 pending next-action (a scheduled future visit) / all tracker users.

---

## 2. UX Design

### Information architecture
```
/tracker                 Pipeline home: Today agenda → insights → stage board → add job
/tracker/job/:id         Job CRM record: header, action bridges, next action, timeline
```
Both screens live in the existing app shell (sidebar identical to Dashboard/History) and the dark/gold system.

### Navigation
- Sidebar (Dashboard, Interview History): new **Applications** item.
- Coach landing navlinks + landing-page feature card.
- Job detail back → board; board breadcrumbs in topbar pattern as other screens.

### Desktop flow
1. `/tracker`: left sidebar · main column = **Today strip** (horizontal cards: overdue=rose, today=gold, suggested follow-ups=blue) → **insights strip** (4 stat cards) → **board**: five stage columns (Saved → Applied → Interviewing → Offer → Rejected), cards show company initial, title, days-in-stage, next-action chip, excitement dots. Stage changes via the select on each card (works identically on touch — no fragile drag-drop).
2. Card click → `/tracker/job/:id`: stage pill row (click to move), action row (**Practice interview** / **Tailor résumé** / posting link / archive), facts grid (salary, location, source, applied date, excitement), **Next action** editor (text + due), **Timeline**: composer with type chips (Note · Interview round · Recruiter · Salary · Follow-up) + reverse-chron events; due-bearing events have a done checkbox.

### Mobile flow
Same two screens, mobile-first: board columns become horizontally swipeable; Today strip wraps; the composer fields stack; all inputs ≥16px (iOS), tap targets ≥44px; the sidebar collapses per the existing ≤760px appshell rules.

### Wireframe notes
- Today strip card: `[⚠ OVERDUE] Follow up — Infosys · Senior SF Dev · due 2d ago [Done ✓]`.
- Board card: avatar-letter, `Senior Salesforce Developer`, `Infosys · 12d in stage`, next-action chip (`↻ Follow up · Jun 14`), stage select.
- Timeline event: icon by type, title, body, relative time; rounds/follow-ups show due date + done state.

---

## 3. Technical Design

### Database (idempotent, in the existing schema block)
```sql
rn_jobs(id uuid pk, user_id fk→rn_users, company, title, location, url, source,
        jd text, salary_min int, salary_max int, salary_currency, salary_notes,
        stage in saved|applied|interviewing|offer|rejected, excitement 1-5,
        next_action, next_action_due timestamptz, applied_at, archived bool,
        created_at, updated_at)
rn_job_events(id uuid pk, job_id fk→rn_jobs cascade, user_id, type in
        note|stage|round|contact|salary|followup|task|offer|rejection,
        title, body, due_at, done bool, meta jsonb, created_at)
idx: rn_jobs(user_id, archived, stage) · rn_job_events(job_id, created_at desc)
     · rn_job_events(user_id, done, due_at)
```
One events table is deliberately the whole CRM: notes, rounds, recruiter contacts, salary threads, follow-ups, rejections — a uniform timeline with `type` + optional `due_at/done`, matching the codebase's single-file pragmatism.

### API (all `validateApiSecret` + `requireAuth`; UUID-validated; length-capped)
```
GET    /tracker/jobs?stage=&q=&archived=    → { jobs:[...] }   (counts via /insights)
POST   /tracker/jobs                        → job              (logs a 'stage' event)
GET    /tracker/jobs/:id                    → { job, events }
PATCH  /tracker/jobs/:id                    → job              (stage move logs event, sets applied_at)
DELETE /tracker/jobs/:id                    → archive (soft)
POST   /tracker/jobs/:id/events             → event
PATCH  /tracker/events/:id                  → event            (done/edit)
DELETE /tracker/events/:id                  → { ok }
GET    /tracker/agenda                      → { overdue, today, upcoming, suggested }
GET    /tracker/insights                    → { stages, week, responseRate, offers, active }
```
No AI calls in v1 → no aiLimiter cost; ownership enforced on every query (`user_id=$n`).

### Frontend
`src/tracker/api.js` (same client pattern as coach), `src/tracker/Tracker.jsx`, `src/tracker/JobDetail.jsx`; routes in `main.jsx` (`/tracker`, `/tracker/job/:id`) following the coach pattern. **Bridges**: Practice interview → `saveDraft({company, jobTitle, jobDescription:jd,...})` → `/coach/new` (Setup already prefills from the draft); Tailor résumé → `localStorage['rn-jd-handoff']=jd` → builder `jobmatch` mode reads it on mount.

### Security & performance
- Per-user row ownership on every statement; UUID regex on params; text caps (company/title 255, jd 12k, body 6k); soft archive (no destructive deletes from the UI); JSONB meta never rendered as HTML (React text nodes only).
- List queries are single indexed selects; agenda is two indexed queries + one 7-day-silence query; no N+1 (events fetched only on detail). Caps: 500 jobs per list response, 200 events per job (paginate later if exceeded).

---

## 4. Growth Hooks (shipped in v1 unless noted)
- **Daily agenda** (overdue/today/upcoming) — the reason to open the app every morning.
- **Computed follow-up suggestions** — applied + 7 days of silence + no pending follow-up ⇒ suggested card with one-tap "Schedule follow-up".
- **Interview reminders** — any `round` event with a date appears in the agenda with a "Practice this round" bridge.
- **Weekly momentum strip** — applied/responses this week vs last, response rate, live offers.
- *Next (documented, not in v1):* email/push digests of the agenda; auto-parse job postings from a pasted URL; offer-comparison view.

## 5. Competitive Advantage
- **vs Excel/Sheets**: no schema to invent, no formulas to maintain — and a spreadsheet can never say "you're due to follow up with Infosys" or launch a mock interview from a row.
- **vs Notion**: Notion templates are static documents; this is connected to the user's actual résumé, JD analysis, and interview engine — the artifacts they need for each job are one click from the job itself.
- **vs Trello**: kanban without CRM (no contacts/salary/timeline) and zero domain intelligence. Renonym's board *knows* what a job application is.
- **vs LinkedIn "Saved jobs"**: locked to LinkedIn postings, no stages beyond saved/applied, no notes/contacts/salary, no prep. Renonym tracks any job from any source and preps you for it.
- The structural moat: **the tracker sits next to the only tools that act on a job** (tailored résumé, JD-aware mock interview, scored reports). Every competitor stops at storage.
