# Monetization Migration Plan — credits + pass ladder (Phase 0 output)
*Status: AWAITING APPROVAL. No code written. Current-state map verified against both repos June 11, 2026.*

## 0. Corrections to the brief (must be acknowledged before Phase 1)

1. **The "assembly script" rule is FALSE.** There is no Python assembler, no `class_body.js`, no `render_jsx.txt` in either repo — verified by filesystem search and git history. `ResumeBuilder.jsx` is a plain source file, edited directly throughout this project (CLAUDE.md documents this). I will NOT add that rule to CLAUDE.md. → **Confirm: drop this instruction.**
2. **There are no Razorpay mandates/subscriptions to cancel.** Every existing payment is a ONE-TIME order; "Coach Unlimited ₹1,599/mo" is implemented as a one-time grant that expires 30 days after purchase (`coach_expires`). Nothing auto-renews. Your manual TODO "cancel mandates" is unnecessary — existing Unlimited users simply expire naturally. The grandfather script still grants +20 credits + flag and prints the list.
3. **PaymentModal.jsx is dead code** (zero imports; its sibling PaymentButton would even 401 as-is). "Rewrite PaymentModal" in Phase 3 = revive it as the ladder modal and wire it in for the first time.
4. **Security hole the new model must close:** `/optimize-for-job` (tailoring — a 1-credit action) and `/improve-summary` are **reachable anonymously today** (no auth at all). Phase 2 adds `requireAuth` + credits to them.
5. **A LinkedIn OAuth callback exists server-side** (no frontend button). The signup-grant hook must cover all three creation flows: Google, LinkedIn, magic-link — all funnel through the single `upsertUser()` (server.js:1769), which is the one place to add an `isNew` signal.

## 1. Current state (anchors the phases below)

- **Entitlement flags today:** `rn_users.plan` ('free'/'pro'), `coach_plan`/`coach_expires`, `session_passes`. Quota: `daily_premium_count/date`, FREE_DAILY_QUOTA=2/day on template-gen, job-match, review. PDF export Pro-gated (`requirePro`). Replay table `rn_payments` exists.
- **AI routes + current gates:** `/generate-template` (auth+quota) · `/analyze-job-match` (auth+quota) · `/review-resume` (auth+quota) · `/optimize-for-job` (ANONYMOUS — bug) · `/improve-summary` (ANONYMOUS) · `/extract-resume` (anonymous, stays free) · coach create (entitlement in-handler, pass consumed AFTER generation, refunded on insert failure) · coach score/tts/stt (no charge).
- **Payments:** `/create-order` validates SKU, writes `notes.plan`; `/verify-payment` derives plan from the fetched order, replay-protected via `rn_payments` ON CONFLICT, self-healing release on failed grants. Client `payAndVerify()` in coach/api.js is the only live purchase path.
- **Pricing copy inventory:** 30+ strings across LandingPage, CoachLanding, CoachCheckout, InterviewSetup, InterviewHistory, Dashboard, AuthModal (CreditGate), server error strings, LegalPage — full grep list captured in the Phase-0 map.
- **PDF payload has no template identity** — client sends `{html, css}` only; template travels implicitly as the `rb-resume--{key}` class.
- **`upsertUser` has no created-vs-updated signal** — needed for idempotent signup grants.
- **No scheduler exists** (no cron) — affects the "credits idle 7 days" email.

## 2. Decisions I need from you (numbered — answer inline)

D1. **Which 3 templates are free?** Proposal: `sf-classic`, `sf-minimal`, `nordic-clean` (one per filter category; the flashiest 7 get crowns).
D2. **Free first interview shape:** text-only, 5 questions, partial report. OK?
D3. **Partial report contents:** overall score + verdict headline + ONE top strength + ONE top weakness visible; dimensions grid, remaining strengths/weaknesses, all quote→rewrite fixes, and recommendations blurred. Enforced SERVER-side (partial JSON), not CSS-blur-only. OK?
D4. **Pass interview counters:** Season=6, Pro=25 full interviews; stored as `pass_interviews_remaining`, decremented like passes today (after successful generation, refunded on insert failure). Audio+text both count 1. OK?
D5. **Existing `session_passes` holders** (bought ₹599 under old model): honored as `interview_credits` 1:1 in the migration script. OK?
D6. **Active Coach Unlimited users**: keep their unlimited until `coach_expires` (they paid for 30 days) AND grant +20 credits + `grandfathered` flag now. OK?
D7. **"Credits idle 7 days" email without a scheduler:** trigger check on any authenticated request (cheap, once per user via `idle_nudge_sent_at`), instead of cron. OK, or skip this email for v1?
D8. **Referral redemption UX:** referral code auto-captured from `?ref=` into localStorage on landing, claimed automatically right after first sign-in via `POST /referral/claim` (idempotent, self-referral blocked). OK?
D9. **Clean PDF export on free templates** — still requires sign-in (account identity prevents abuse), just no payment. Confirm.
D10. **Old SKUs** (`pro_*`, `team_*`, `coach_unlimited*`, `session_pass`) stay in PLANS marked `retired: true` (verify-payment replays stay safe) but `/create-order` rejects them. OK?

## 3. Phase-by-phase implementation map

### Phase 1 — Data model + migration (backend repo, 1 commit)
`server.js` schema block: ALTERs on `rn_users` → `credit_balance INT DEFAULT 0`, `pass_type VARCHAR(20)`, `pass_expires_at TIMESTAMPTZ`, `pass_interviews_remaining INT DEFAULT 0`, `interview_credits INT DEFAULT 0`, `free_interview_used BOOL DEFAULT FALSE`, `signup_credits_granted BOOL DEFAULT FALSE`, `grandfathered BOOL DEFAULT FALSE`, `referral_code VARCHAR(16) UNIQUE`, `referred_by UUID`, `idle_nudge_sent_at TIMESTAMPTZ`. New tables: `rn_credit_ledger(id, user_id, delta, reason, ref_id, created_at)` + index; `rn_jd_corpus(id, user_hash, raw_text, tags JSONB, created_at)` (Phase 7); `rn_interview_sessions` += `is_free_session BOOL`, `report_unlocked BOOL DEFAULT TRUE→FALSE-for-free` (per-session unlock — deviation from "user field report_unlocks", cleaner). Migration script `scripts/grandfather.js`: ledger +20 to active unlimited users, `grandfathered=true`, session_passes→interview_credits, prints affected list. `creditGrant(userId, delta, reason, refId)` helper writes ledger + updates cached balance atomically (single SQL with CTE).

### Phase 2 — Entitlement layer (backend, 1 commit)
- `hasActivePass(u)` helper; `requireCredits(n)` middleware factory: pass bypass → else balance check (402 `CREDITS_REQUIRED` with `{balance, needed, tailorCount}`); debit ONLY on `res.on('finish')` 2xx && !`res.locals.aiFallback`, atomic `UPDATE ... SET credit_balance = credit_balance - n WHERE credit_balance >= n` + ledger row.
- Apply: `/generate-template`(1), `/review-resume`(1), `/optimize-for-job`(requireAuth + 1 — closes the anon hole), `/improve-summary`(requireAuth + 1). Remove `enforceDailyQuota` from these. `/extract-resume`, `/analyze-job-match`, `/generate-pdf`, tracker: 0 credits.
- Interview start rewrite in `/coach/sessions`: order = pass(decrement `pass_interviews_remaining`) → `interview_credits` → free text interview (`!free_interview_used && mode==='text'`, marks session `is_free_session`, 5-question cap) → 402 ladder message. Audio mode rejected unless pass/interview_credit. Same generate-first/refund-on-failure discipline as today.
- Report gating: score endpoint stores full report but the session GET + score response return partial JSON when `is_free_session && !report_unlocked`.
- PLANS: add `boost_299` (+10 credits, ledger reason notes 6-mo expiry — see note), `single_499` (+1 interview_credit), `season_1499` (pass_type='season', 90d, +6 interviews, all templates, audio), `pro_2999` (pass_type='placement_pro', 90d, +25), `report_unlock_299` (order notes carry `sessionId`; verify sets `report_unlocked`). Old SKUs retired per D10. Credit-expiry note: ledger rows carry `expires_at` for boost grants; balance recompute ignores expired grants (FIFO consumption) — slightly more SQL, fully auditable.
- `/generate-pdf`: replace `requirePro` with template check — client adds `templateStyle` to payload; server allows FREE_TEMPLATES for any signed-in user, others need active pass. Server cross-checks the `rb-resume--{key}` class inside the submitted HTML.
- `/auth/me` returns `{credits, passType, passExpiresAt, passInterviewsRemaining, interviewCredits, freeInterviewUsed, referralCode}`.

### Phase 3 — Payment + paywall UI (frontend, 1 commit)
Revive `PaymentModal.jsx` as the ladder modal (order: Placement Pro → Season Pass "MOST POPULAR" pre-selected → Boost; uses coach/api `payAndVerify` so JWT flows). Credit pill in Dashboard sidebar (+ Tracker/History sidebars for consistency). Out-of-credits modal (the 402 `CREDITS_REQUIRED` handler in `_isGated`) with the "You've tailored X… 15+" copy (X from the 402 payload). Template picker: crown badges on 7 premium tiles (tile JSX ~line 2851), selection of crowned tile by non-pass user opens PaymentModal; same for topbar select + quick-grid. Landing pricing section → new 3-card ladder (Free / Season Pass featured / Placement Pro, with Boost+Single mentioned in footnote). Update ALL strings from the grep inventory. Remove blur from free-template previews (preview gating becomes template-based, matching export).

### Phase 4 — Interview funnel (frontend + small backend, 1 commit each repo if needed)
Setup screen: entitlement panel shows pass status / interview credits / free-interview-available; audio ModeCard locked with "Audio needs a pass or Single Interview" when unentitled. CoachCheckout: replace with ladder-aware purchase (Single ₹499 default when arriving from setup; Season upsell side-by-side). Report page: partial-render from server's partial JSON; blurred sections behind "Unlock your full report — ₹299. Or get 6 complete interviews with the Season Pass." Unlock purchase → `report_unlock_299` with sessionId in notes → reload.

### Phase 5 — Match gate + signup grant (both repos, 1 commit each)
`/analyze-job-match`: remove auth+quota; anonymous gets `{atsScore, jdMatch, missingKeywords.slice(0,3), locked:true}`; signed-in gets full. FE: Job Match usable logged-out (remove `_requireLogin` from analyze), results panel renders teaser + "Sign up free to see the full report (+2 free credits)". `upsertUser` returns `isNew`; all 3 auth flows pass it through token-poll/safeUser → on first sign-in server grants +2 credits (ledger, guarded by `signup_credits_granted`) and FE shows the explainer toast.

### Phase 6 — Tracker triggers + referrals (frontend + referral endpoints, 1 commit each)
Stage→`interviewing` inline card on JobDetail/Tracker ("Practice this exact interview — JD and résumé already loaded" [₹499 / included in Pass] → existing practice bridge or PaymentModal). Insight trigger: ≥10 applied & 0 interviewing → "résumé may be the bottleneck — run an AI review" card. Stage→`offer` → celebration overlay + referral share (code from /auth/me, link `renonym.com/?ref=CODE`, give-5-get-5). Backend: `POST /referral/claim` (idempotent both sides, ledger reason 'referral'); landing captures `?ref=` to localStorage. **Zero tracker functionality gated — additive cards only.**

### Phase 7 — JD corpus (backend, 1 commit)
Fire-and-forget inserts into `rn_jd_corpus` from `/analyze-job-match` and tracker job create/edit when `jd` present (`setImmediate`, errors swallowed, user ref = sha256(user_id) or 'anon'). Tags only from what the existing parse already returns (no extra AI call).

### Phase 8 — Lifecycle emails (backend, 1 commit)
Reuse the existing Resend/nodemailer transporter (magic-link mailer). `sendLifecycleEmail(user, type)` with 3 triggers from Phase 6 events + idle-credits nudge per D7. Missing key → log + skip. Simple HTML matching the magic-link template style.

### Testing per phase
`test-tracker.js`-style additions: `test-credits.js` (ledger math, pass bypass, no-charge-on-AI-failure, idempotent signup grant, replay-safe SKU grants, report unlock). Frontend: build + the Chrome-extension regression prompt re-run after Phases 3/4/5. Verification fleet on each phase's diff before push (same QA discipline as the tracker build).

## 4. Your manual TODOs (corrected)
- ~~Cancel Razorpay mandates~~ — none exist; nothing to cancel. Just FYI existing Unlimited users keep access until their 30-day expiry.
- Resend account + `RESEND_API_KEY` on Railway (already used for magic links — confirm it's set; Phase 8 reuses it).
- Razorpay international application (geo-pricing next sprint).
- Final copy review of every paywall string (I'll produce the full before/after copy table at end of Phase 3).
