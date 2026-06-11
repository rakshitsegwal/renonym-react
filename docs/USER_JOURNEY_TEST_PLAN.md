# Renonym — User Journey Test Plan

> **Generated:** 11 June 2026 · from the code actually deployed (frontend through Phase 6, backend **v14.4-credits-2026** on Railway).
> **Scope:** 159 journeys across 15 areas. Every *Expect* line was extracted from the source, not from memory — exact copy, prices, and redirects are what the code does today.
> **How to use:** tick the `[ ]` per step. A step whose observed behavior differs from **Expect** is a finding — note the journey ID (e.g. `J-042`, step 3) and what you saw instead.

## Before you start — environment facts that change expected results

These are true **today** and several journeys depend on them:

1. **`LADDER_LIVE` is NOT set on Railway.** Old SKUs (₹599/₹1,599) are still *purchasable* server-side; the new-SKU-only rejection is dormant. Any journey that says "retired SKU rejected" will NOT reject until you flip `LADDER_LIVE=true`.
2. **The grandfather script has NOT been run.** Existing accounts may have 0 starter credits and legacy `session_passes` not yet converted to interview credits. New accounts are unaffected (signup grant is live: +2 credits).
3. **Referral codes for pre-v14 accounts are minted lazily** — the account must load `/auth/me` once (any page load while signed in) before its code exists.
4. **Payments are LIVE Razorpay — real money.** Cheapest real purchase is ₹299. Test purchase journeys last, and prefer one SKU per account state.
5. **Free first interview is text-mode only, 5 questions**, and yields a **partial** report until unlocked.
6. Backend version check: `https://salesforce-resume-pdf-server-production.up.railway.app/version` must say `v14.4-credits-2026`.

## Test accounts you need (prepare tonight)

| # | State | How to get it | Used by |
|---|-------|---------------|---------|
| A | Anonymous (incognito) | Fresh incognito window | Landing, JD-match teaser, signed-out gates |
| B | Brand-new free account | Sign up fresh during testing (gets +2 credits) | Signup grant, free interview, referral claim (receiver) |
| C | Free account, 0 credits | Account B after burning both credits, or an old account | 402 → ladder modal journeys |
| D | Season Pass holder | Buy ₹1,499 on a test account (or your main if already entitled) | Pass entitlements, premium export, full reports |
| E | Legacy unlimited (your main) | rakshit1352@gmail.com — confirmed `coach unlimited` | Legacy bypass paths, grandfathered behavior |
| F | Second account for referrals | Any second Google account | Referral E2E (giver) |

**Devices:** desktop Chrome (primary), one real phone (~390 px — the Mobile Pass section), and Safari for the audio-interview fallback paths.

## Suggested order for the day

1. Sections 1–3 (no money, no state pollution) → 2. Section 4–5 (burns credits on account B) → 3. Section 6 (export gates — needs C and D/E) → 4. Sections 8–10 (coach; free interview burns account B's one freebie — do it deliberately) → 5. Section 11 (tracker — zero paywalls; any account) → 6. Section 12 referral E2E (uses B + F) → 7. Section 7 purchases LAST (real money) → 8. Section 13 mobile pass re-running the P0 flows on the phone.

## Sections

| # | Area | Journeys |
|---|------|----------|
| 1 | [Landing Page & Navigation](#landing-page--navigation) | 17 |
| 2 | [Authentication & Sessions](#authentication--sessions) | 16 |
| 3 | [Résumé Builder — Core](#résumé-builder-core) | 12 |
| 4 | [Builder AI Actions, Import & AI Design Studio](#builder-ai-actions-import--ai-design-studio) | 12 |
| 5 | [Job Match & Optimize for Job](#job-match--optimize-for-job) | 6 |
| 6 | [PDF Export & Template Gating](#pdf-export--template-gating) | 7 |
| 7 | [Payments & the Credit Ladder](#payments--the-credit-ladder) | 20 |
| 8 | [Interview Coach — Setup, Entitlements & Checkout](#interview-coach--setup-entitlements--checkout) | 12 |
| 9 | [Interview Coach — The Session (Text & Audio)](#interview-coach--the-session-text--audio) | 7 |
| 10 | [Interview Coach — Scoring, Reports & ₹299 Unlock](#interview-coach--scoring-reports--299-unlock) | 7 |
| 11 | [Application Tracker](#application-tracker) | 15 |
| 12 | [Dashboard, Referral E2E & Cross-Navigation](#dashboard-referral-e2e--cross-navigation) | 9 |
| 13 | [Mobile Pass (Cross-Cutting)](#mobile-pass-cross-cutting) | 11 |
| 14 | [Rate Limits & Abuse Guards](#rate-limits--abuse-guards) | 4 |
| 15 | [Appendix A — Endpoint Hygiene (informational)](#appendix-a--endpoint-hygiene-informational) | 4 |

<details>
<summary><b>Full journey index (159 journeys — click to expand)</b></summary>

| ID | Journey | Area |
|----|---------|------|
| J-001 | Hero CTAs and signed-out top nav | Landing Page & Navigation |
| J-002 | Top-nav section anchors and hash deep links | Landing Page & Navigation |
| J-003 | Section hash anchor typed while inside an app view returns to landing | Landing Page & Navigation |
| J-004 | Coach hero, features grid, and résumé section CTAs | Landing Page & Navigation |
| J-005 | Pricing cards and footnote SKUs | Landing Page & Navigation |
| J-006 | Footer links and legal pages | Landing Page & Navigation |
| J-007 | Browser Back/Forward across landing, builder, dashboard, legal | Landing Page & Navigation |
| J-008 | Deep links: /builder?mode=, /dashboard, /tracker, /coach/*, unknown paths | Landing Page & Navigation |
| J-009 | Referral capture via ?ref= and claim on sign-in (give 5 / get 5) | Landing Page & Navigation |
| J-010 | rn-return-to post-sign-in redirect from Tracker and Dashboard gates | Landing Page & Navigation |
| J-011 | Signed-in landing state and logout routing | Landing Page & Navigation |
| J-012 | Coach report deep link with bogus or foreign session ID (signed in) | Landing Page & Navigation |
| J-013 | Coach report deep link while signed out (401 redirect) | Landing Page & Navigation |
| J-014 | Live session deep link with bad ID — voice (default) and text modes | Landing Page & Navigation |
| J-015 | Session-complete deep link after sign-out (/coach/session/<id>/complete) | Landing Page & Navigation |
| J-016 | Tracker job deep link with non-UUID / foreign ID, plus signed-out gate with return-to | Landing Page & Navigation |
| J-017 | Legal pages survive hard refresh as deep links (/privacy, /terms, /about) | Landing Page & Navigation |
| J-018 | Google sign-in via popup + polling (export gate context) | Authentication & Sessions |
| J-019 | Magic-link email sign-in, end to end | Authentication & Sessions |
| J-020 | Sign-out (builder UserPill and Dashboard) | Authentication & Sessions |
| J-021 | Session restore on page reload | Authentication & Sessions |
| J-022 | Expired or invalid token → automatic clean sign-out | Authentication & Sessions |
| J-023 | Sign in on a SECOND device — premium entitlements follow the account | Authentication & Sessions |
| J-024 | UserPill display & menu | Authentication & Sessions |
| J-025 | New-account signup grant: exactly +2 credits, once | Authentication & Sessions |
| J-026 | Post-auth destination per entry context | Authentication & Sessions |
| J-027 | Referral capture & claim on sign-in (give 5 / get 5) | Authentication & Sessions |
| J-028 | Cross-device magic-link sign-in: desktop requests, phone clicks, desktop tab signs in via polling | Authentication & Sessions |
| J-029 | 15-minute expiry: link, server polling slot, and client polling all time out together | Authentication & Sessions |
| J-030 | Used / invalid magic link: authErrorPage rendering on the backend domain | Authentication & Sessions |
| J-031 | Purchase on device B silently corrects device A's stale rn-auth-user cache on next mount | Authentication & Sessions |
| J-032 | Sign-out on device A does NOT invalidate device B (stateless JWT; /auth/logout is client-side only) | Authentication & Sessions |
| J-033 | Referral claim raced from two devices for the same new account (give 5 / get 5, atomic once-only) | Authentication & Sessions |
| J-034 | Browse template gallery and select a FREE template (no sign-in required) | Résumé Builder — Core |
| J-035 | Select a 👑 premium template as a non-paid user → 'Unlock all 10 templates' ladder modal | Résumé Builder — Core |
| J-036 | Method step — Build from Scratch | Résumé Builder — Core |
| J-037 | Method step — Import Resume (PDF/DOCX parsed by AI, no login needed) | Résumé Builder — Core |
| J-038 | Build — Profile section with live preview | Résumé Builder — Core |
| J-039 | Build — Skills & Certifications | Résumé Builder — Core |
| J-040 | Build — Work Experience with live bullet parsing | Résumé Builder — Core |
| J-041 | Build — Education | Résumé Builder — Core |
| J-042 | Switch templates mid-edit — Design quick grid and topbar select (with premium gating) | Résumé Builder — Core |
| J-043 | Back-navigation between steps | Résumé Builder — Core |
| J-044 | Draft persistence across reload (rb-draft in localStorage) | Résumé Builder — Core |
| J-045 | Calorie-calculator easter egg step (currently UNREACHABLE from the UI) | Résumé Builder — Core |
| J-046 | Import a PDF resume via the AI flow | Builder AI Actions, Import & AI Design Studio |
| J-047 | Import a DOCX resume | Builder AI Actions, Import & AI Design Studio |
| J-048 | Import a TXT resume | Builder AI Actions, Import & AI Design Studio |
| J-049 | Import an unreadable / corrupt file | Builder AI Actions, Import & AI Design Studio |
| J-050 | Import an oversized file (>5 MB) | Builder AI Actions, Import & AI Design Studio |
| J-051 | AI Design Studio — describe a style prompt, theme applied as tokens on a hardcoded layout | Builder AI Actions, Import & AI Design Studio |
| J-052 | Reference-image (inspiration) based generation | Builder AI Actions, Import & AI Design Studio |
| J-053 | Regenerating the AI theme from the Build editor | Builder AI Actions, Import & AI Design Studio |
| J-054 | 0-credit user hits 402 CREDITS_REQUIRED → ladder modal | Builder AI Actions, Import & AI Design Studio |
| J-055 | Long-running parse — 90 s timeout friendly message | Builder AI Actions, Import & AI Design Studio |
| J-056 | Improve with AI — summary rewrite (success path) | Builder AI Actions, Import & AI Design Studio |
| J-057 | AI Review — full-resume critique modal (/review-resume) | Builder AI Actions, Import & AI Design Studio |
| J-058 | Anonymous JD-match teaser (locked report) | Job Match & Optimize for Job |
| J-059 | Sign up from the teaser → welcome toast + auto re-run of FULL analysis | Job Match & Optimize for Job |
| J-060 | Signed-in full analysis (free — no credit debit) | Job Match & Optimize for Job |
| J-061 | Optimize for Job → review modal → Apply to Resume (1 credit) | Job Match & Optimize for Job |
| J-062 | Optimize with 0 credits → 402 → ladder modal with actions-used banner | Job Match & Optimize for Job |
| J-063 | Tracker → 'Tailor résumé to this JD' bridge into Job Match | Job Match & Optimize for Job |
| J-064 | Export each of the 3 free templates as a signed-in free user (hard guarantee: never watermarked, never locked) | PDF Export & Template Gating |
| J-065 | Premium template without a pass — client gate at selection, ladder with reason 'template' (Boost ₹299 hidden) | PDF Export & Template Gating |
| J-066 | Server-side PASS_REQUIRED enforcement at export time (stale/forged client entitlement) | PDF Export & Template Gating |
| J-067 | Export with an AI-generated token theme — allowed for ANY signed-in user, including free (generation itself costs 1 credit) | PDF Export & Template Gating |
| J-068 | Export premium templates as each paid persona (season / placement_pro / legacy pro / legacy Coach Unlimited) | PDF Export & Template Gating |
| J-069 | Export while signed out → auth modal → automatic export after sign-in | PDF Export & Template Gating |
| J-070 | Client-side PDF fallback when the server render fails (the ONLY watermark in the system) | PDF Export & Template Gating |
| J-071 | Ladder modal opens with reason 'credits' (out-of-credits 402 on an AI action) | Payments & the Credit Ladder |
| J-072 | Ladder modal opens with reason 'template' (premium template pick or export) — Boost Pack hidden | Payments & the Credit Ladder |
| J-073 | Ladder modal opens with reason 'interview' from a locked free-interview report | Payments & the Credit Ladder |
| J-074 | Ladder modal opens with reason 'generic' from the Dashboard credit pill | Payments & the Credit Ladder |
| J-075 | Buy Boost Pack ₹299 end-to-end → +10 credits, 6-month expiry | Payments & the Credit Ladder |
| J-076 | Buy Season Pass ₹1,499 end-to-end → pass_type 'season', 6 interviews, 90 days | Payments & the Credit Ladder |
| J-077 | Buy Placement Pro ₹2,999 end-to-end → pass_type 'placement_pro', 25 interviews, 90 days | Payments & the Credit Ladder |
| J-078 | Buy Single Interview ₹499 at Coach Checkout (the SKU not in the ladder modal) | Payments & the Credit Ladder |
| J-079 | Report Unlock ₹299 — session-bound one-off purchase | Payments & the Credit Ladder |
| J-080 | Cancel Razorpay checkout mid-purchase | Payments & the Credit Ladder |
| J-081 | Payment failure and verify failure paths | Payments & the Credit Ladder |
| J-082 | Anonymous user buys from the ladder — in-modal sign-in, session survives the purchase | Payments & the Credit Ladder |
| J-083 | Dashboard credit pill + plan label permutations | Payments & the Credit Ladder |
| J-084 | Double-payment idempotency — one payment grants exactly once | Payments & the Credit Ladder |
| J-085 | LADDER_LIVE=true flip — retired SKUs rejected at create-order | Payments & the Credit Ladder |
| J-086 | Landing pricing cards while signed in — CTA routing map | Payments & the Credit Ladder |
| J-087 | Full purchase via landing 'Get the Season Pass' (signed-in free user → /coach/new → /coach/checkout → Razorpay) | Payments & the Credit Ladder |
| J-088 | Entitled user (Season Pass) clicks landing pass CTAs — must never see payment | Payments & the Credit Ladder |
| J-089 | Ladder modal (PaymentModal) from Dashboard credit pill — the real signed-in purchase surface reachable from landing | Payments & the Credit Ladder |
| J-090 | PaymentButton.jsx orphan audit — confirm dead code ships nowhere and document live purchase surfaces | Payments & the Credit Ladder |
| J-091 | Coach landing CTAs route to setup and checkout | Interview Coach — Setup, Entitlements & Checkout |
| J-092 | Interview setup: résumé upload + JD + role config | Interview Coach — Setup, Entitlements & Checkout |
| J-093 | Free first interview (text-only, 5 questions) | Interview Coach — Setup, Entitlements & Checkout |
| J-094 | Start interview as legacy unlimited (Coach Unlimited) | Interview Coach — Setup, Entitlements & Checkout |
| J-095 | Start interview as Season Pass holder (N remaining) | Interview Coach — Setup, Entitlements & Checkout |
| J-096 | Start interview as Placement Pro holder | Interview Coach — Setup, Entitlements & Checkout |
| J-097 | Start interview with a Single Interview credit | Interview Coach — Setup, Entitlements & Checkout |
| J-098 | Start interview with a legacy Session Pass | Interview Coach — Setup, Entitlements & Checkout |
| J-099 | Exhausted pass: setup routes to checkout; 402 top-up message | Interview Coach — Setup, Entitlements & Checkout |
| J-100 | Checkout: plan ladder, payment, and post-purchase return to interview | Interview Coach — Setup, Entitlements & Checkout |
| J-101 | Checkout while already entitled / stale session | Interview Coach — Setup, Entitlements & Checkout |
| J-102 | Deep-link /coach/new while signed out | Interview Coach — Setup, Entitlements & Checkout |
| J-103 | TEXT interview: full run from first question to scored report | Interview Coach — The Session (Text & Audio) |
| J-104 | AUDIO interview: spoken questions, hidden text, recording → Whisper → score | Interview Coach — The Session (Text & Audio) |
| J-105 | AUDIO: microphone permission DENIED | Interview Coach — The Session (Text & Audio) |
| J-106 | Resume an in-progress session from Interview History | Interview Coach — The Session (Text & Audio) |
| J-107 | Abandon mid-session — entitlement is NOT refunded | Interview Coach — The Session (Text & Audio) |
| J-108 | Question variety: re-running the same JD + résumé yields different questions | Interview Coach — The Session (Text & Audio) |
| J-109 | Network drop mid-session (text and voice) | Interview Coach — The Session (Text & Audio) |
| J-110 | Score a PAID interview and view the FULL report | Interview Coach — Scoring, Reports & ₹299 Unlock |
| J-111 | Score the FREE interview and see the PARTIAL (locked) report | Interview Coach — Scoring, Reports & ₹299 Unlock |
| J-112 | Pay ₹299 to unlock the full report (end-to-end) | Interview Coach — Scoring, Reports & ₹299 Unlock |
| J-113 | Buying a Season Pass (or any interview product) also unlocks the locked free report | Interview Coach — Scoring, Reports & ₹299 Unlock |
| J-114 | Attempt to unlock an ALREADY-unlocked report (server blocks before money moves) | Interview Coach — Scoring, Reports & ₹299 Unlock |
| J-115 | Export the report as PDF | Interview Coach — Scoring, Reports & ₹299 Unlock |
| J-116 | Interview history: stats, search, resume, retake | Interview Coach — Scoring, Reports & ₹299 Unlock |
| J-117 | Signed-out gate → sign in → land back on tracker | Application Tracker |
| J-118 | Add a job with all fields + JD | Application Tracker |
| J-119 | Board: stage movement saved → applied → interviewing → offer → rejected | Application Tracker |
| J-120 | Job detail: edit, archive, delete-as-archive, excitement, next action | Application Tracker |
| J-121 | Timeline: log note / round / contact / salary / follow-up, complete and delete events | Application Tracker |
| J-122 | 'Today' agenda strip: overdue / today / upcoming, mark done, practice a round, suggested follow-ups | Application Tracker |
| J-123 | PHASE 6: stage → Interviewing with JD shows the gold 'practice this exact one' card → coach setup preloaded | Application Tracker |
| J-124 | PHASE 6: stage → Offer fires the 🎉 Celebrate overlay with give-5/get-5 referral | Application Tracker |
| J-125 | Bottleneck insight card at ≥10 applied with 0 interviewing / 0 offers | Application Tracker |
| J-126 | Archived toggle | Application Tracker |
| J-127 | Tailor-résumé bridge: job detail → Job Match with the JD preloaded | Application Tracker |
| J-128 | Zero-paywall sweep + error handling across the tracker | Application Tracker |
| J-129 | First-ever visit to the tracker with zero jobs: empty board, no Today strip, no momentum stats, no insight banner | Application Tracker |
| J-130 | Archived toggle with zero archived jobs: 'No archived jobs' empty state | Application Tracker |
| J-131 | Exit from the empty state: add the first job and watch the board + momentum strip appear | Application Tracker |
| J-132 | Dashboard signed-out gate and return-to after sign-in | Dashboard, Referral E2E & Cross-Navigation |
| J-133 | Dashboard tiles, stats, draft card and empty state | Dashboard, Referral E2E & Cross-Navigation |
| J-134 | Credit pill states and plan label permutations | Dashboard, Referral E2E & Cross-Navigation |
| J-135 | Credit pill opens the v14 ladder (PaymentModal) — incl. cancel path | Dashboard, Referral E2E & Cross-Navigation |
| J-136 | REFERRAL E2E — give 5 / get 5 happy path | Dashboard, Referral E2E & Cross-Navigation |
| J-137 | Referral failure paths — own code (400), invalid code (404), repeat claim ({already:true}) | Dashboard, Referral E2E & Cross-Navigation |
| J-138 | Pre-v14 account — referral code lazily minted on first /auth/me | Dashboard, Referral E2E & Cross-Navigation |
| J-139 | Dashboard sidebar + quick-action navigation to Builder / Coach / Tracker | Dashboard, Referral E2E & Cross-Navigation |
| J-140 | Sidebar/topnav consistency sweep across coach + tracker screens | Dashboard, Referral E2E & Cross-Navigation |
| J-141 | Full builder run on a 390px phone: gallery → method → build → export | Mobile Pass (Cross-Cutting) |
| J-142 | Application Tracker on phone: agenda strip, kanban board, job detail | Mobile Pass (Cross-Cutting) |
| J-143 | Interview Coach on phone: setup → checkout → voice session | Mobile Pass (Cross-Cutting) |
| J-144 | Razorpay checkout sheet on mobile via the builder ladder (PaymentModal) | Mobile Pass (Cross-Cutting) |
| J-145 | PDF blob download on iOS Safari and Android Chrome | Mobile Pass (Cross-Cutting) |
| J-146 | AuthModal Google popup flow under mobile popup blockers | Mobile Pass (Cross-Cutting) |
| J-147 | Landing page nav and section anchors on mobile | Mobile Pass (Cross-Cutting) |
| J-148 | Audio interview on Android Chrome — full feature path (server TTS voice, one mic prompt, live transcript, webm transcription) | Mobile Pass (Cross-Cutting) |
| J-149 | Audio interview on iPhone Safari — degradation path (autoplay block, audio/mp4 recording, NO live transcript) | Mobile Pass (Cross-Cutting) |
| J-150 | Mic permission denied on mobile — 'Microphone blocked' card and recovery paths | Mobile Pass (Cross-Cutting) |
| J-151 | Browser without any audio capture — auto-handoff to text mode | Mobile Pass (Cross-Cutting) |
| J-152 | Builder AI actions hit the 15-call/15-min rate limit (improve-summary, review-resume, generate-template, optimize-for-job) | Rate Limits & Abuse Guards |
| J-153 | Magic-link email form rate limit (5 sends per 15 min per IP) | Rate Limits & Abuse Guards |
| J-154 | Voice interview audio rate limit (question-audio + transcribe, 120 per 15 min per IP) degrades gracefully | Rate Limits & Abuse Guards |
| J-155 | Application Tracker write limit (120 non-GET requests per 15 min per IP) | Rate Limits & Abuse Guards |
| J-156 | DEAD ENDPOINT AUDIT: POST /auth/save-resume (server-side resume save — no UI caller) | Appendix A — Endpoint Hygiene (informational) |
| J-157 | DEAD ENDPOINT AUDIT: GET /auth/resumes (list saved resumes — no UI caller) | Appendix A — Endpoint Hygiene (informational) |
| J-158 | DEAD ENDPOINT AUDIT: POST /auth/save-ats-report (persist job-match analysis — no UI caller) | Appendix A — Endpoint Hygiene (informational) |
| J-159 | DEAD FLOW AUDIT: LinkedIn OAuth (/auth/linkedin + /auth/linkedin/callback) — server-side only, not exposed in AuthModal, cannot complete even manually | Appendix A — Endpoint Hygiene (informational) |

</details>


---

## Landing Page & Navigation

### J-001 · Hero CTAs and signed-out top nav

**Account state:** Signed out (localStorage has no rn-auth-token / rn-auth-user)  
**Start at:** https://renonym.com/

- [ ] **1.** Load /. Inspect the sticky top nav (dark, blurred).
      **Expect:** Left: R mark + 'Renonym' brand and links 'Interview Coach', 'Résumé Builder', 'Pricing', 'How it works'. Right: text button 'Sign in' and gold button 'Get started'. No 'Dashboard →' button when signed out.
- [ ] **2.** Read the hero.
      **Expect:** Pill 'Your AI job-preparation platform'; headline 'Build your résumé. Practice your interview. Get hired.' (with gold italic 'Practice'); buttons 'Practice an interview' (gold) and 'Build a résumé free' (outline); checkmarks 'Free résumé builder — no card needed' and 'Every interview returns a scored report'.
- [ ] **3.** Click 'Get started' in the nav.
      **Expect:** View switches to the Resume Builder at the template gallery step. URL stays '/' (history.pushState with state {view:'builder'}); page scrolls to top.
- [ ] **4.** Browser Back, then click hero 'Build a résumé free'.
      **Expect:** Back returns to landing. 'Build a résumé free' opens the builder gallery (same as Get started).
- [ ] **5.** Back to landing; click hero 'Practice an interview'.
      **Expect:** URL changes to /coach/new and the Interview Setup screen renders (path-based navPath route).
- [ ] **6.** Back to landing; click 'Sign in' in the nav.
      **Expect:** AuthModal opens with title 'Sign in to continue' and subtitle 'Sign in to save your work and access all features.', with a 'Continue with Google' button and a magic-link email fallback.
- [ ] **7.** Complete Google sign-in in the popup.
      **Expect:** Modal closes; with no rn-return-to stored, handleLogin defaults to goToBuilder('gallery') — you land in the builder gallery. Token+user are in localStorage (rn-auth-token, rn-auth-user).

  **Edge cases**
  - [ ] Click overlay backdrop or × on the AuthModal → Modal closes, stay on landing, still signed out.
  - [ ] Signed in but server token expired: load / → refreshUserFromServer gets 401 → rn-auth-token/rn-auth-user are removed silently; nav reverts to 'Sign in' + 'Get started' (no error shown).

  > ⚠️ Landing/builder/dashboard all live at path '/'; only legal and coach/tracker routes get real paths. App views are restored via history state.

### J-002 · Top-nav section anchors and hash deep links

**Account state:** Signed out, on the landing page  
**Start at:** https://renonym.com/

- [ ] **1.** Click nav 'Résumé Builder'.
      **Expect:** Smooth-scroll to the #resume section ('A résumé that earns the interview.'); URL becomes /#resume via history.replaceState (no new history entry).
- [ ] **2.** Click nav 'Pricing'.
      **Expect:** Smooth-scroll to #pricing ('Free to build. Pay to practice.'); URL becomes /#pricing.
- [ ] **3.** Click nav 'How it works'.
      **Expect:** Smooth-scroll to #how ('One platform, blank page to signed offer'); URL becomes /#how.
- [ ] **4.** Click nav 'Interview Coach'.
      **Expect:** Not a scroll — navigates to path /coach (CoachLanding view).
- [ ] **5.** Open a new tab directly at https://renonym.com/#pricing.
      **Expect:** Landing loads, then after ~120ms auto-scrolls smoothly to the pricing section (LandingPage mount effect reads location.hash).

  **Edge cases**
  - [ ] Deep link with an unknown hash, e.g. /#nonexistent → Landing loads at top; getElementById returns null, no scroll, no error.
  - [ ] Anchor clicks do not pollute history → After clicking all three section links, one Back press leaves the landing page entirely (replaceState, not pushState).

  > ⚠️ Recognized section hashes for cross-view handling are exactly #resume, #pricing, #how, #coach (SECTION_HASHES in main.jsx).

### J-003 · Section hash anchor typed while inside an app view returns to landing

**Account state:** Any auth state; currently inside the builder (URL is '/', view = builder)  
**Start at:** Landing → 'Get started' → builder gallery, then edit the address bar

- [ ] **1.** With the builder on screen, append '#pricing' to the URL in the address bar and press Enter (hashchange, no reload).
      **Expect:** The hashchange handler detects a SECTION_HASHES match while view !== 'landing': view switches back to the landing page and after ~60ms smooth-scrolls to the pricing section.
- [ ] **2.** Repeat from the Dashboard view with '#coach'.
      **Expect:** Returns to landing and scrolls to the Interview Coach premium section ('The interview is where offers are won or lost.').

  **Edge cases**
  - [ ] Hash not in the whitelist (e.g. #foo) typed while in builder → Nothing happens — view stays on the builder.
  - [ ] Same hash set while already on landing → Handler skips (viewRef is 'landing'); only native browser anchor behavior applies.

  > ⚠️ This was an explicit bug fix ('fixes hash-ignored bug' comment in main.jsx onHash).

### J-004 · Coach hero, features grid, and résumé section CTAs

**Account state:** Signed out, on the landing page  
**Start at:** https://renonym.com/ scrolled to the #coach section

- [ ] **1.** In the gold Coach card, click 'Explore the Coach'.
      **Expect:** Navigates to /coach (CoachLanding).
- [ ] **2.** Back; click the outline button 'From ₹499 — no subscription'.
      **Expect:** Does NOT navigate — smooth-scrolls down to #pricing and URL becomes /#pricing.
- [ ] **3.** In the session-report demo card, click 'Open report →'.
      **Expect:** Navigates to /coach (not to a real report).
- [ ] **4.** Back; scroll to #resume section; click 'Build your résumé →'.
      **Expect:** Opens the builder at the template gallery (onGetStarted).
- [ ] **5.** Back; click 'Job-match optimizer'.
      **Expect:** Opens the builder in jobmatch mode: BUILD step with the Job Match section active (ResumeBuilder componentDidMount, initialMode 'jobmatch').
- [ ] **6.** Back; verify the #how features grid.
      **Expect:** Six cards: 'Résumé tailoring', 'Voice mock interviews' (gold border + 'Premium' badge), 'Scored reports', 'Text interviews', 'Application tracker', 'Import & restyle'. Cards are informational — no click handlers.

  **Edge cases**
  - [ ] rn-jd-handoff present in localStorage when entering jobmatch mode → Builder pre-fills the job description from localStorage['rn-jd-handoff'] and removes the key (Tracker → 'Tailor résumé to this JD' handoff).

  > ⚠️ Resume section stats copy: '10 polished templates', '4 designer layouts', '1-click JD tailoring'. Live-preview card shows 'ATS 94' badge — static demo content.

### J-005 · Pricing cards and footnote SKUs

**Account state:** Signed out, on the landing page  
**Start at:** https://renonym.com/#pricing

- [ ] **1.** Verify the Free card.
      **Expect:** Name 'Free', price '₹0', sub 'Forever', features exactly: 'Résumé builder + 3 templates', 'Clean PDF export (free templates)', 'Unlimited JD match scores', '2 credits at signup', '1 free text interview', 'Full application tracker'. CTA 'Start building'.
- [ ] **2.** Click 'Start building'.
      **Expect:** Opens the builder gallery (same handler as Get started).
- [ ] **3.** Back; verify the Season Pass card (center, gold/featured).
      **Expect:** 'Most popular' gold badge, name 'Season Pass', price '₹1,499' with '/90 days', sub 'MOST POPULAR · one-time', features: '6 full interviews (audio + text)', 'Unlimited AI actions', 'All 10 templates', 'Full scored reports'. CTA 'Get the Season Pass' (gold).
- [ ] **4.** Click 'Get the Season Pass'.
      **Expect:** Navigates to /coach/new (Interview Setup) — NOT directly to checkout. Signed-out users get pushed to /coach/checkout only when they hit Continue there (401/402 path in InterviewSetup).
- [ ] **5.** Back; verify the Placement Pro card.
      **Expect:** Name 'Placement Pro', price '₹2,999' with '/90 days', sub 'For an all-out search', features: '25 full interviews', 'Everything in Season Pass', 'Priority support'. CTA 'Go Pro' (outline).
- [ ] **6.** Click 'Go Pro'.
      **Expect:** Also navigates to /coach/new (same go('/coach/new') handler as Season Pass).
- [ ] **7.** Read the footnote under the cards.
      **Expect:** Exact copy: 'Also available: Boost Pack ₹299 (+10 AI credits) · Single Interview ₹499 · Report Unlock ₹299. One-time payments — no subscriptions, ever.' The footnote SKUs are plain text, not clickable.

  **Edge cases**
  - [ ] Season Pass vs Placement Pro CTA differentiation → Both go to the same /coach/new page; plan choice happens later at /coach/checkout. If tester expects card-specific checkout preselection, the landing code does not pass any plan parameter.

  > ⚠️ Section heading: eyebrow 'Pricing', h1 'Free to build. Pay to practice.'

### J-006 · Footer links and legal pages

**Account state:** Any auth state, on the landing page  
**Start at:** https://renonym.com/ scrolled to footer

- [ ] **1.** Verify footer contents.
      **Expect:** Brand + tagline 'Build your résumé. Practice your interview. Get hired.'; 'Product' column: Interview Coach / Résumé Builder / Pricing; 'Company' column: About / Privacy / Terms; bottom line '© 2026 Renonym AI. All rights reserved.'
- [ ] **2.** Click Product → 'Interview Coach'.
      **Expect:** Navigates to /coach.
- [ ] **3.** Back; click Product → 'Résumé Builder'.
      **Expect:** Opens the builder gallery (onGetStarted, URL stays '/').
- [ ] **4.** Back; click Product → 'Pricing'.
      **Expect:** Smooth-scrolls to #pricing on the landing page.
- [ ] **5.** Click Company → 'Privacy'.
      **Expect:** URL becomes /privacy; a white (light-theme) legal page renders: tag 'Legal', h1 'Privacy Policy', 'Last updated: 10 June 2026', sections 1-8 (mentions Razorpay, Railway, OpenAI as AI provider, DPDP Act, contact support@renonym.com). Document title becomes 'Privacy Policy — Renonym AI'.
- [ ] **6.** Click '← Back to home' (top right) or the brand mark.
      **Expect:** Returns to the landing page; URL becomes '/'.
- [ ] **7.** Click Company → 'Terms'.
      **Expect:** URL /terms, h1 'Terms of Service', 'Last updated: 10 June 2026', 10 sections; governing law India, courts of Chandigarh; doc title 'Terms of Service — Renonym AI'.
- [ ] **8.** Click Company → 'About'.
      **Expect:** URL /about, tag 'Company', h1 'About Renonym AI', NO 'Last updated' line; doc title 'About Renonym AI — Renonym AI'.

  **Edge cases**
  - [ ] Hard refresh while on /privacy, /terms or /about → Page reloads to the same legal page (vercel.json rewrites all paths to /index.html; parseLocation maps the path).
  - [ ] Browser Back from a legal page → Returns to the landing page (popstate: '/' falls back to history state or 'landing').

  > ⚠️ Terms section 3 says paid plans billed 'monthly or yearly' — this contradicts the landing's 'no subscriptions, ever' footnote and the one-time pricing model; flag as a copy bug to fix, not a routing issue.

### J-007 · Browser Back/Forward across landing, builder, dashboard, legal

**Account state:** Signed in (so /dashboard renders content rather than the sign-in gate)  
**Start at:** https://renonym.com/

- [ ] **1.** Landing → click 'Get started' (builder) → click nav 'Dashboard →' is not visible inside builder, so instead use builder's dashboard link, or: from landing click 'Dashboard →', then from dashboard open the builder.
      **Expect:** Each navigate() pushes a history entry with state {view, entryMode} at path '/'.
- [ ] **2.** Press Back once.
      **Expect:** Previous app view restores from history state (e.g. dashboard → builder or builder → landing) without a page reload; URL stays '/'.
- [ ] **3.** Press Forward.
      **Expect:** Returns to the later view; entryMode is also restored from state (e.g. builder reopens in the same mode it was entered with).
- [ ] **4.** From landing go to /privacy, then Back.
      **Expect:** Back returns from the /privacy path to the landing view at '/'.
- [ ] **5.** From builder (entered via 'Job-match optimizer'), press Back then Forward.
      **Expect:** Forward re-enters the builder in jobmatch entry mode (state.entryMode preserved); navigate() also clears stale params so a previous /builder?mode= URL param cannot leak into state-driven views.

  **Edge cases**
  - [ ] Back past the first entry (initial load had null history state) → popstate with no state at '/' falls back to the landing view.
  - [ ] Back from a coach path (e.g. /coach/new) to '/' → Path-based parseLocation says 'landing', then state fallback applies — you return to whichever app view pushed that '/' entry (landing if you started there).

  > ⚠️ navigate() also calls window.scrollTo(0,0) — every view switch starts at the top. Coach/tracker navigation (navPath) pushes empty state {} on real paths.

### J-008 · Deep links: /builder?mode=, /dashboard, /tracker, /coach/*, unknown paths

**Account state:** Signed out (to verify gates); repeat /builder links signed in for full builder behavior  
**Start at:** Type each URL directly in the address bar (hard load)

- [ ] **1.** Open /builder
      **Expect:** Resume Builder at the template gallery step (mode undefined → entryMode default 'gallery').
- [ ] **2.** Open /builder?mode=ai
      **Expect:** Builder opens directly in the AI flow, step 1 (selectedMode 'ai', STEPS.AI_FLOW).
- [ ] **3.** Open /builder?mode=jobmatch
      **Expect:** Builder opens at the BUILD step with the Job Match section active.
- [ ] **4.** Open /dashboard while signed out
      **Expect:** Signed-out gate: eyebrow 'Dashboard', h1 'Sign in to see your dashboard.', lead 'Your résumés, interview reports and application pipeline live here.', gold 'Sign in' button.
- [ ] **5.** Open /tracker while signed out
      **Expect:** Gate: eyebrow 'Application Tracker', h1 'Every job, one pipeline.', lead 'Sign in to track applications, recruiters, salaries and follow-ups — wired straight into your résumé and interview prep.', gold button 'Sign in to start'.
- [ ] **6.** Open /coach, /coach/new, /coach/checkout, /coach/reports
      **Expect:** CoachLanding, InterviewSetup, CoachCheckout, InterviewHistory respectively — each survives hard refresh (vercel rewrite to index.html).
- [ ] **7.** Open /coach/session/abc123, /coach/session/abc123?mode=text, /coach/session/abc123/complete, /coach/report/abc123
      **Expect:** VoiceInterview, TextInterview, InterviewComplete, InterviewReport with id param 'abc123' (the views themselves will then 404/handle the fake id server-side).
- [ ] **8.** Open /tracker/job/xyz
      **Expect:** JobDetail view with id 'xyz'.
- [ ] **9.** Open an unknown path, e.g. /foo or /coach/session/abc/extra
      **Expect:** Falls through parseLocation → landing page renders (no 404 screen).

  **Edge cases**
  - [ ] /builder?mode=gibberish → Any unrecognized mode hits the else branch → gallery step.
  - [ ] Hard refresh on any deep link in production → Always serves the SPA (vercel.json: source '/(.*)' → '/index.html').

  > ⚠️ In `npm run dev`, Vite's SPA fallback gives the same behavior. ?mode is only read for /builder; coach session mode defaults to 'voice' unless ?mode=text.

### J-009 · Referral capture via ?ref= and claim on sign-in (give 5 / get 5)

**Account state:** Signed out, fresh account that has never been referred (server rn_users.referred_by IS NULL); a second account's valid referral code (read it from /auth/me → referralCode — codes are minted lazily on first profile load)  
**Start at:** https://renonym.com/?ref=THEIRCODE

- [ ] **1.** Load the landing page with ?ref=THEIRCODE (try lowercase, e.g. ?ref=theircode).
      **Expect:** Silently stored: localStorage['rn-ref-code'] = code trimmed, UPPERCASED, truncated to 16 chars. No UI change on landing.
- [ ] **2.** Without signing in, browse around and even close/reopen the tab.
      **Expect:** rn-ref-code persists in localStorage; no claim is attempted while signed out (tryClaimReferral requires rn-auth-token).
- [ ] **3.** Sign in (nav 'Sign in' → Google or magic link).
      **Expect:** handleLogin fires tryClaimReferral: POST /referral/claim with the stored code. On success the server grants +5 credits to you ('referral:received') and +5 to the referrer ('referral:given') atomically, and rn-ref-code is removed from localStorage.
- [ ] **4.** Verify the grant.
      **Expect:** No toast is shown (claim is silent). Check your credit balance went up by 5 (e.g. in dashboard/user pill after refreshUserFromServer) and the referrer's balance by 5.

  **Edge cases**
  - [ ] ?ref= with your OWN code, then sign in → Server returns 400 "You can't refer yourself — share the link instead!"; frontend silently drops rn-ref-code (no retry, no credits).
  - [ ] ?ref=UNKNOWNCODE → Server 404 'Unknown referral code.'; code dropped from localStorage, no credits.
  - [ ] Account already referred once (referred_by set), claims a second code → Server responds {ok:true, already:true} — a no-op; no new credits; the code is still cleared client-side.
  - [ ] Network failure during claim → rn-ref-code is KEPT (only 400/404 drop it) and the claim retries on the next sign-in / page load while signed in.
  - [ ] More than 20 claim attempts in 15 min from one client → Rate limited: 'Too many attempts — try again later.' (server /referral rate limit, max 20/15min).
  - [ ] Backend DB not configured → 503 'Referrals not configured.'

  > ⚠️ Claim is also attempted on every app mount if already signed in and a code is stored (useEffect → tryClaimReferral). The referrer must have loaded /auth/me at least once or their code won't exist yet (codes minted on first profile load for pre-v14 accounts, server.js ~line 2163).

### J-010 · rn-return-to post-sign-in redirect from Tracker and Dashboard gates

**Account state:** Signed out  
**Start at:** https://renonym.com/tracker

- [ ] **1.** On the /tracker signed-out gate, click 'Sign in to start'.
      **Expect:** localStorage['rn-return-to'] = '/tracker' is set and you are navigated to '/' (the landing page). The auth modal does NOT auto-open — you must click 'Sign in' yourself.
- [ ] **2.** Click 'Sign in' in the landing nav and complete authentication.
      **Expect:** handleLogin reads and deletes rn-return-to, then navPath('/tracker'): you land back on the Application Tracker, now signed in and loading your jobs.
- [ ] **3.** Sign out (Dashboard → logout), then open /dashboard and click its gate's 'Sign in' button.
      **Expect:** rn-return-to = '/dashboard' is set, you go to '/'; after signing in you are returned to /dashboard with your data.
- [ ] **4.** Sign out again; sign in directly from the landing page with no stored rn-return-to.
      **Expect:** Default redirect: builder gallery (goToBuilder('gallery')).

  **Edge cases**
  - [ ] Set rn-return-to but abandon sign-in, then sign in much later from landing → The stale rn-return-to still wins — you'll be redirected to the old target (it is only cleared when consumed by handleLogin).
  - [ ] Sign in from a coach page's own AuthModal instead of the landing one → Coach surfaces handle auth locally; the landing handleLogin (and thus rn-return-to consumption) only runs for the landing page's modal — verify the tracker gate path specifically through the landing modal.

  > ⚠️ rn-return-to is written in exactly two places: src/tracker/Tracker.jsx:45 and src/Dashboard.jsx:52; consumed only in main.jsx handleLogin (line ~187).

### J-011 · Signed-in landing state and logout routing

**Account state:** Signed in (any plan)  
**Start at:** https://renonym.com/

- [ ] **1.** Load the landing page while signed in.
      **Expect:** Top nav right side shows a single ghost button 'Dashboard →' instead of 'Sign in' + 'Get started'. (Hero/pricing CTAs are unchanged and still work.)
- [ ] **2.** Click 'Dashboard →'.
      **Expect:** Dashboard view renders at '/' with your cached user, then refreshes from /auth/me (plan, credits, passType, referralCode merge).
- [ ] **3.** Log out from the Dashboard.
      **Expect:** rn-auth-token and rn-auth-user are removed; you are navigated to the landing page, which now shows 'Sign in' + 'Get started' again.

  **Edge cases**
  - [ ] Purchase made on another device, then revisit landing → dashboard → refreshUserFromServer on mount overwrites the slim cached user with the full server state (credits/passType/passExpiresAt/interviewCredits/freeInterviewUsed/referralCode), so entitlements shown are current.
  - [ ] rn-auth-user present but rn-auth-token missing (or vice versa) → Session restore on mount is skipped entirely (requires both keys) — treated as signed out.

  > ⚠️ The cached popup user is only {id,email,name,plan}; anything entitlement-dependent on landing/dashboard relies on the /auth/me refresh, so a brief flash of stale plan state is possible before the merge lands.

### J-012 · Coach report deep link with bogus or foreign session ID (signed in)

**Account state:** Signed in as any user (free is fine; rn-auth-token present in localStorage). The session ID in the URL must NOT belong to this user — use either a non-UUID string or another account's real session UUID.  
**Start at:** Paste https://renonym.com/coach/report/not-a-real-id directly into the address bar (hard load)

- [ ] **1.** Load /coach/report/not-a-real-id (non-UUID).
      **Expect:** Vercel rewrites to index.html; matchCoach maps the path to the coach-report view. InterviewReport mounts and briefly shows the dark centered loading state: pulsing orb + 'Generating your report…' with a 'Back to history' button.
- [ ] **2.** Wait for GET /coach/sessions/not-a-real-id to return.
      **Expect:** Server: UUID_RE fails → 404 {"error":"Session not found."}. Client renders the centered error screen with the exact text 'Session not found.' and an outline button 'Back to history'. No report hero, no score ring, no unlock CTA.
- [ ] **3.** Click 'Back to history'.
      **Expect:** Navigates to /coach/reports (InterviewHistory) showing only YOUR sessions.
- [ ] **4.** Repeat with a syntactically valid but foreign/non-existent UUID, e.g. /coach/report/00000000-0000-0000-0000-000000000000.
      **Expect:** UUID_RE passes but the SELECT ... WHERE id=$1 AND user_id=$2 finds 0 rows → identical 404 'Session not found.' screen. Ownership is enforced server-side: a foreign ID is indistinguishable from a missing one (no 403, no data leak).

  **Edge cases**
  - [ ] Backend DB unavailable (server started without db) → 503 {"error":"Coach not configured."} → centered screen shows 'Coach not configured.' with the same 'Back to history' button.
  - [ ] Network timeout (coach client AbortController fires at 90s) → fetch aborts with an AbortError (no .status); the abort error's message is rendered in the centered error screen (browser wording, e.g. 'The user aborted a request.') — not a friendly custom string. Known rough edge.
  - [ ] Own session ID but report not yet generated → Not an error: getSession succeeds with no report, client calls POST /coach/sessions/:id/score on the fly and renders the report (locked/partial if reportIsLocked applies).

  > ⚠️ InterviewReport.jsx: catch → e.status===401 redirects to /coach, anything else renders setErr(e.message || 'Report unavailable.') in the Centered component. Server handler at server.js:2924. Both bad-format and foreign IDs return the same 404 body.

### J-013 · Coach report deep link while signed out (401 redirect)

**Account state:** Signed out — localStorage has no rn-auth-token (use a private window or sign out first). Any session ID, even a real one you own in another browser.  
**Start at:** Paste https://renonym.com/coach/report/<any-id> into the address bar

- [ ] **1.** Load the URL.
      **Expect:** Brief 'Generating your report…' loading state, then GET /coach/sessions/:id hits requireAuth with no Bearer token → 401 {"error":"Authentication required.","code":"AUTH_REQUIRED"}.
- [ ] **2.** Observe the redirect.
      **Expect:** Client checks e.status===401 and silently calls nav('/coach') — you land on the Interview Coach landing page. No error toast or message is shown; the 401 body text is never rendered. URL bar reads /coach.

  **Edge cases**
  - [ ] Expired/garbage rn-auth-token still in localStorage → Server returns 401 'Session expired. Please log in again.' — same silent redirect to /coach (message not displayed). Separately, the app-mount /auth/me refresh in main.jsx clears rn-auth-token/rn-auth-user on its own 401.
  - [ ] Signed out on /coach/session/<id>/complete or /coach/session/<id> → Same pattern — InterviewComplete, VoiceInterview and TextInterview all redirect to /coach on 401 (see dedicated journeys).

  > ⚠️ There is no 'return-to-after-login' for coach deep links (unlike /tracker's rn-return-to). After signing in from /coach the user must re-open the report link manually — by design today.

### J-014 · Live session deep link with bad ID — voice (default) and text modes

**Account state:** Signed in as any user. Use a bogus ID (non-UUID) or another user's session UUID.  
**Start at:** Paste https://renonym.com/coach/session/garbage-id into the address bar (no ?mode → voice mode)

- [ ] **1.** Load /coach/session/garbage-id.
      **Expect:** VoiceInterview mounts (mode defaults to 'voice' when ?mode is absent). Brief centered 'Loading your interview…' with pulsing orb.
- [ ] **2.** Wait for GET /coach/sessions/garbage-id.
      **Expect:** 404 {"error":"Session not found."} → fatal state renders the centered screen: text 'Session not found.' + outline button 'Back to Coach'. No mic permission prompt should ever appear (session never loaded).
- [ ] **3.** Click 'Back to Coach'.
      **Expect:** Navigates to /coach (CoachLanding).
- [ ] **4.** Now load /coach/session/garbage-id?mode=text.
      **Expect:** TextInterview mounts instead; same 404 → centered 'Session not found.' with 'Back to Coach' button.

  **Edge cases**
  - [ ] Signed out on the same URL → 401 → silent nav('/coach'); lands on the Coach landing page with no error shown.
  - [ ] Browser without MediaRecorder AND SpeechRecognition (voice mode) → Before any fetch resolves, shows 'Your browser doesn't support audio interviews — switching you to text mode…' with a 'Continue in text mode →' gold button, and auto-redirects to ?mode=text after ~2.6s. The bad-ID 404 then surfaces in TextInterview.
  - [ ] Valid own session whose questions are all answered → Not an error: client computes firstOpen === -1 and immediately redirects to /coach/session/<id>/complete.
  - [ ] Own session row with empty questions array → Voice mode renders centered 'No questions found for this session.'

  > ⚠️ Route regex /^\/coach\/session\/([^/]+)$/ in main.jsx accepts any non-slash segment, so validation is entirely server-side (UUID_RE → 404 'Session not found.'). Foreign UUIDs return the same 404 as malformed IDs.

### J-015 · Session-complete deep link after sign-out (/coach/session/<id>/complete)

**Account state:** Have a real completed/in-progress session ID (copy the URL from the complete screen while signed in), then SIGN OUT (or open the URL in a private window).  
**Start at:** Paste https://renonym.com/coach/session/<your-real-session-id>/complete into the address bar while signed out

- [ ] **1.** Load the URL.
      **Expect:** InterviewComplete mounts; brief pulsing-orb 'Loading…' state inside the shell (Renonym brand top-left, 'Close' link top-right).
- [ ] **2.** Wait for GET /coach/sessions/:id.
      **Expect:** 401 'Authentication required.' (AUTH_REQUIRED) → client silently nav('/coach'). You land on the Coach landing page; no stats, no 'Generate my report' button, no error text rendered.
- [ ] **3.** Sign back in, then re-open the same /complete URL.
      **Expect:** Real session loads. With ≥1 real answer: green 'Interview complete' badge, headline 'Nicely done, <firstname>.' (all answered) or 'Good work, <firstname>.' (partial), copy 'You answered N of M questions…', 4 stat tiles (Questions answered / Duration / Mode / Words written|spoken), and 'Generate my report' (or 'View my report' if already scored).

  **Edge cases**
  - [ ] Signed in, but session has zero real answers → Amber 'Interview ended early' badge, headline 'No answers recorded.', copy '…there's nothing to score yet…', buttons 'Resume interview →' (back to /coach/session/<id> with ?mode=text preserved for text sessions) and 'My interviews' (/coach/reports). No report generation offered.
  - [ ] Signed in with bogus/foreign ID on /complete → 404 'Session not found.' rendered as lead text in the shell with a 'Back to Coach' outline button.
  - [ ] Scoring fails when clicking 'Generate my report' → Button reverts from 'Scoring your answers…'; rose error text shows the server message or 'Could not generate the report. Please try again.'

  > ⚠️ 401 handling here loses the deep link — there is no return-to capture for coach paths. '[Spoken answer …]' placeholder answers are excluded from the 'real answer' count (isRealAnswer in InterviewComplete.jsx).

### J-016 · Tracker job deep link with non-UUID / foreign ID, plus signed-out gate with return-to

**Account state:** Part A: signed in (any plan). Part B: signed out / expired token. Use /tracker/job/abc123 (non-UUID) and optionally a foreign UUID.  
**Start at:** Paste https://renonym.com/tracker/job/abc123 into the address bar

- [ ] **1.** PART A (signed in): load /tracker/job/abc123.
      **Expect:** JobDetail mounts inside the tracker shell (← back button, Renonym brand, 'Applications' and 'Dashboard' links); briefly shows 'Loading…'.
- [ ] **2.** Wait for GET /tracker/jobs/abc123.
      **Expect:** Server: UUID_RE fails → 404 {"error":"Job not found."}. Client renders 'Job not found.' as lead text with a 'Back to applications' outline button. No job card, no timeline, no composer.
- [ ] **3.** Click 'Back to applications'.
      **Expect:** Navigates to /tracker showing your real pipeline.
- [ ] **4.** PART B (signed out): load /tracker/job/abc123 in a private window.
      **Expect:** GET returns 401 → JobDetail's fail() removes rn-auth-token and rn-auth-user from localStorage and nav('/tracker'). The Tracker sign-in gate renders: eyebrow 'Application Tracker', heading 'Every job, one pipeline.', copy 'Sign in to track applications, recruiters, salaries and follow-ups — wired straight into your résumé and interview prep.', gold button 'Sign in to start'.
- [ ] **5.** Click 'Sign in to start' and complete sign-in from the landing page.
      **Expect:** The button stored rn-return-to='/tracker' before navigating to '/'. After successful login, handleLogin in main.jsx reads rn-return-to, clears it, and navPath('/tracker') — you return to the Tracker (NOT the specific job; the deep job URL is not preserved).

  **Edge cases**
  - [ ] Foreign but valid UUID (another account's job) → Ownership clause WHERE id=$1 AND user_id=$2 → same 404 'Job not found.' screen; no 403 and no cross-account leak.
  - [ ] Stale/expired token on a signed-in browser → Server 401 'Session expired. Please log in again.' → tokens wiped client-side, redirect to /tracker gate (the message itself is not displayed).
  - [ ] Tracker DB not configured server-side → 503 {"error":"Tracker not configured."} → rendered as the error lead text with 'Back to applications'.
  - [ ] Network timeout (tracker client aborts at 30s) → AbortError has no .status → falls to setErr(e.message) and renders the raw abort message — not a friendly string.

  > ⚠️ JobDetail.jsx fail() at lines 24-30; server handler at server.js:3193. Subsequent mutations (stage chips, next action, composer 'Log it') reuse the same fail() — a mid-session 401 on any of them also wipes tokens and bounces to the /tracker gate.

### J-017 · Legal pages survive hard refresh as deep links (/privacy, /terms, /about)

**Account state:** Any auth state (works signed out). Test on the deployed Vercel site — the rewrite is what makes this work in prod.  
**Start at:** Paste https://renonym.com/privacy directly into the address bar (cold load, not in-app navigation)

- [ ] **1.** Hard-load /privacy.
      **Expect:** vercel.json rewrites /(.*) → /index.html; parseLocation maps '/privacy' → privacy view. White (light-theme) page renders with topbar 'R / Renonym AI' brand + '← Back to home' link, tag 'Legal', h1 'Privacy Policy', a 'Last updated:' line, and the policy body. Browser tab title becomes 'Privacy Policy — Renonym AI'.
- [ ] **2.** Press the browser refresh button on /privacy.
      **Expect:** Identical page re-renders (no 404, no bounce to landing). URL stays /privacy.
- [ ] **3.** Hard-load /terms.
      **Expect:** Same shell; tag 'Legal', h1 'Terms of Service', 'Last updated:' line, body including 'These Terms are governed by the laws of India, and disputes are subject to the courts of Chandigarh, India…'. Tab title 'Terms of Service — Renonym AI'.
- [ ] **4.** Hard-load /about.
      **Expect:** Tag 'Company', h1 'About Renonym AI', NO 'Last updated:' line (only privacy/terms show it). Tab title 'About Renonym AI — Renonym AI'.
- [ ] **5.** Click '← Back to home' on any legal page.
      **Expect:** goToLanding pushes '/' and the landing page renders; browser Back returns to the legal page (popstate restores it because legal paths are authoritative in parseLocation).

  **Edge cases**
  - [ ] Trailing slash: /privacy/ → LEGAL_PATHS lookup is an exact string match — '/privacy/' misses and parseLocation falls through to the landing page at that URL. Same for /terms/ and /about/.
  - [ ] Wrong case: /Privacy → Exact-match miss → landing page renders.
  - [ ] Hard refresh in local dev (npm run dev) → Vite's SPA fallback serves index.html, so /privacy works there too — but the prod guarantee comes from vercel.json, which is the thing to verify on the live domain.
  - [ ] Legal link with a stray hash, e.g. /privacy#x → Path still matches; the unknown hash is ignored (SECTION_HASHES only handles #resume/#pricing/#how/#coach, and only when returning to landing).

  > ⚠️ Files: /Users/rakshitsegwal/Documents/renonym-react/vercel.json (single rewrite), /Users/rakshitsegwal/Documents/renonym-react/src/main.jsx lines 25-26 & 44-55, /Users/rakshitsegwal/Documents/renonym-react/src/LegalPage.jsx. Unknown arbitrary paths (e.g. /foo) also rewrite to index.html and render the landing page with the odd URL left in the address bar — already covered by the existing deep-links journey but worth re-checking alongside these.


---

## Authentication & Sessions

### J-018 · Google sign-in via popup + polling (export gate context)

**Account state:** Signed out (localStorage has no rn-auth-token / rn-auth-user). Backend must have GOOGLE_ID configured and DATABASE_URL set.  
**Start at:** renonym.com → Get started → /builder → pick any template → Export PDF (or topbar 'Sign in' button)

- [ ] **1.** Click 'Export PDF' while signed out
      **Expect:** AuthModal opens with title 'Sign in to export' and subtitle 'Create a free account to download your resume PDF.' Buttons: 'Continue with Google', divider 'or', '✉ Continue with email', footer 'Free forever · No credit card needed'.
- [ ] **2.** Click 'Continue with Google'
      **Expect:** A 520x620 centered popup opens at {backend}/auth/google?nonce=... and redirects to Google's account chooser (prompt=select_account). Meanwhile the SPA silently polls /auth/poll?nonce= every 1.5s.
- [ ] **3.** Pick a Google account and approve
      **Expect:** Popup shows a dark page with a purple spinner and 'Signing you in...', then self-closes after ~400ms.
- [ ] **4.** Watch the original tab (poll interval is 1.5s)
      **Expect:** Within ~1.5-3s the modal closes, rn-auth-token + rn-auth-user are written to localStorage, the UserPill replaces the 'Sign in' button, and because authReason was 'export' the PDF export flow re-runs automatically after a fresh /auth/me refresh (so a paying user is never shown the purchase ladder).
- [ ] **5.** Check the topbar after sign-in via the builder 'Sign in' button (reason 'general') instead
      **Expect:** Modal title is 'Sign in to continue' / 'Sign in to save your work and access all features.'; after auth the modal just closes — no navigation, no auto-action.

  **Edge cases**
  - [ ] Browser blocks the popup → No error is shown — the code never checks window.open()'s return value. The modal stays open and polling runs silently for 5 min. Tester should expect dead air; user must allow popups and click again.
  - [ ] User closes the popup before completing Google → No error in the SPA; polling continues silently until the 5-min setTimeout clears it. Clicking 'Continue with Google' again starts a fresh nonce + popup (old interval is cleared via pollRef).
  - [ ] User clicks 'Cancel' / denies on Google's consent screen → Popup shows red text 'Google sign-in was cancelled.' on dark background, self-closes after 3s. SPA never signs in (poll stays pending until 5-min timeout).
  - [ ] 5-minute poll timeout → Client interval is cleared by setTimeout(5 min); server deletes the nonce after 5 min too, so later polls would return 404 {error:'Invalid or expired nonce.'} — swallowed by the client's empty catch. No user-visible message; modal just sits there.
  - [ ] /auth/init-poll request fails (backend down / network) → Inline red error in the modal: 'Could not start Google sign-in. Try magic link instead.'
  - [ ] GOOGLE_ID not set on server → Popup renders error page 'Google OAuth not configured on server.' and self-closes after 3s.
  - [ ] Poll rate limit → /auth/poll + /auth/init-poll share a 250-requests-per-5-min-per-IP limit ('Too many poll requests.'). Google's 1.5s cadence (~200/5min) fits alone, but running Google and magic-link polling simultaneously from one IP can trip it.
  - [ ] postMessage path → The success popup posts {type:'RENONYM_AUTH_SUCCESS'} to window.opener, but the SPA has NO message listener — sign-in works purely via polling. Do not be surprised that nothing breaks when opener is null.

  > ⚠️ AuthModal is rendered from many hosts (ResumeBuilder, LandingPage, PaymentModal, PaymentButton, CoachLanding, CoachCheckout) — the Google flow is identical in all; only the onAuth follow-up differs (see 'Post-auth destinations' journey). JWT lifetime is 30 days (JWT_EXPIRES='30d').

### J-019 · Magic-link email sign-in, end to end

**Account state:** Signed out. Backend must have SMTP/mailer configured (else 503).  
**Start at:** Any AuthModal → '✉ Continue with email'

- [ ] **1.** Click '✉ Continue with email'
      **Expect:** Form with email input (placeholder 'you@example.com', autofocused), button 'Send magic link →', and '← Back' link.
- [ ] **2.** Submit with a valid email
      **Expect:** Button reads 'Sending…' while pending, then the modal switches to the sent state: '✉' icon, 'Check your inbox!', and 'We sent a sign-in link to {email}. Click it to sign in — the link expires in 15 minutes. Keep this tab open: you'll be signed in here automatically.' The SPA starts polling /auth/poll?nonce={clientId}_ml every 6s (for up to 15 min).
- [ ] **3.** Open the email
      **Expect:** From noreply@renonym.ai (or SMTP_FROM), subject 'Your Renonym AI sign-in link', dark card titled 'Renonym AI', body 'Click the button below to sign in. This link expires in 15 minutes.', purple button 'Sign in to Renonym AI'.
- [ ] **4.** Click the email button (opens {backend}/auth/magic-link/verify?token=...)
      **Expect:** The verify tab shows the dark 'Signing you in...' spinner page. Because mail clients open a fresh tab with no opener, this tab may NOT auto-close (window.close on a non-script-opened tab can fail) — that is expected; the session is delivered to the original tab via the polling slot.
- [ ] **5.** Return to the original SPA tab
      **Expect:** Within ~6s the modal closes and the user is signed in (token + user written to localStorage; host-specific onAuth follow-up runs).

  **Edge cases**
  - [ ] Empty email submitted → Client-side inline error 'Please enter your email.'
  - [ ] Malformed email reaching the server → 400 → inline error 'Please enter a valid email address.'
  - [ ] Mailer not configured on server → 503 → inline error 'Email not configured on server. Use Google sign-in instead.'
  - [ ] >5 magic-link requests from one IP in 15 min → Rate-limited: 'Too many email requests. Please wait 15 minutes.'
  - [ ] Link clicked after 15 min, or clicked twice → Verify page shows 'This link has expired or already been used. Please request a new one.' (token is single-use: used_at set on first click).
  - [ ] Requesting a second link for the same email → Server DELETEs the earlier unused token first — the OLD link becomes invalid ('expired or already been used'); only the newest link works.
  - [ ] Original tab closed before clicking the link → No tab is polling clientId_ml, so the user is not signed in anywhere — the verify tab only shows the spinner page. Server keeps the session in the polling slot; reopening the SPA does NOT pick it up (polling only runs while the modal's sent-state is mounted). User must request a new link.
  - [ ] Server restarts between request and click → Still works: verify sets the polling slot unconditionally (not only if pre-registered).

  > ⚠️ The polling nonce is localStorage['rb-client-id'] + '_ml' — clearing site data between request and click breaks pickup. Poll cadence 6s stays under the shared 250/5min poll limiter.

### J-020 · Sign-out (builder UserPill and Dashboard)

**Account state:** Signed in (any plan).  
**Start at:** /builder topbar UserPill, or /dashboard

- [ ] **1.** In the builder, click the UserPill
      **Expect:** Dropdown menu opens showing the account email, a plan line, and a 'Sign out' button.
- [ ] **2.** Click 'Sign out'
      **Expect:** rn-auth-token and rn-auth-user are removed from localStorage, in-component user state cleared, and the app navigates to the landing page (onGoToLanding).
- [ ] **3.** Sign out from /dashboard instead (main.jsx handleLogout)
      **Expect:** Same: localStorage cleared, currentUser null, navigate to landing ('/'). Landing nav now shows 'Sign in' + 'Get started' instead of 'Dashboard →'.
- [ ] **4.** Press browser Back after sign-out
      **Expect:** History-state navigation may return to the prior view, but it renders in signed-out state (Dashboard shows its 'Sign in to see your dashboard.' gate).

  **Edge cases**
  - [ ] Server-side session after logout → Frontend never calls POST /auth/logout — the 30-day JWT remains technically valid; sign-out is purely client-side localStorage removal. Pasting the old token back in would restore the session.

  > ⚠️ rb-client-id (rate-limit id) and rn-export-count are NOT cleared on logout — only the two rn-auth-* keys.

### J-021 · Session restore on page reload

**Account state:** Signed in earlier on this browser; valid rn-auth-token + rn-auth-user in localStorage.  
**Start at:** Hard-refresh any route (/, /builder, /dashboard, /coach, /tracker)

- [ ] **1.** Reload the page
      **Expect:** UI renders signed-in immediately from the cached rn-auth-user (no flash of 'Sign in') — main.jsx restores on mount; ResumeBuilder does the same in componentDidMount.
- [ ] **2.** Wait ~1-2s for the background /auth/me refresh
      **Expect:** GET /auth/me (Bearer token) returns the full entitlement surface — plan, credits, passType, passExpiresAt, passInterviewsRemaining, interviewCredits, freeInterviewUsed, referralCode, coach access — which is merged into rn-auth-user and React state. Any stale plan/credit display corrects itself (e.g. after a purchase on another device).
- [ ] **3.** Inspect localStorage['rn-auth-user'] after refresh
      **Expect:** Contains the merged v14 fields (credits, passType, referralCode...), not just the slim {id,email,name,plan} the auth popup wrote.

  **Edge cases**
  - [ ] Offline / backend unreachable on reload → ResumeBuilder keeps the cached snapshot silently (catch swallows); main.jsx leaves cached user in place (catch only acts on 401). No sign-out, no error toast.
  - [ ] Corrupt rn-auth-user JSON → Parse wrapped in try/catch — user appears signed out until /auth/me refresh rewrites the cache (token still present).
  - [ ] Pre-v14 account with no referral code → Server-state note: /auth/me MINTS a referral_code on first profile load (up to 3 unique-collision retries) — codes only exist after the user has hit /auth/me at least once.
  - [ ] Expired boost-pack credits → /auth/me runs expireStaleCredits first — balance shown is post-expiry (forfeit logged as a negative 'expiry' ledger row).

  > ⚠️ Two independent restore paths exist (main.jsx App and ResumeBuilder) — both read the same keys; test both / and /builder reloads.

### J-022 · Expired or invalid token → automatic clean sign-out

**Account state:** Signed in, then token invalidated (simulate: DevTools → localStorage → set rn-auth-token to garbage, or use a token older than 30 days — JWT_EXPIRES='30d').  
**Start at:** Reload renonym.com (or /builder)

- [ ] **1.** Tamper rn-auth-token in DevTools, keep rn-auth-user, reload '/'
      **Expect:** Initial paint shows signed-in (cached user), then the background /auth/me returns 401 {'error':'Session expired. Please log in again.','code':'AUTH_REQUIRED'} → main.jsx removes rn-auth-token + rn-auth-user and sets currentUser null. Nav flips to 'Sign in' / 'Get started' within a couple of seconds. No error toast.
- [ ] **2.** Same tamper, reload /builder
      **Expect:** ResumeBuilder._refreshUser hits the same 401 → clears both keys, authToken='', currentUser=null; topbar shows 'Sign in' again.
- [ ] **3.** While 'signed in' with a bad token, trigger a premium action (e.g. AI Style)
      **Expect:** Backend 401 → ResumeBuilder._isGated opens the AuthModal with reason 'feature' ('Sign in to continue') rather than erroring.

  **Edge cases**
  - [ ] Missing Bearer header entirely → Backend returns 401 {'error':'Authentication required.','code':'AUTH_REQUIRED'} — same client handling.
  - [ ] Token expires mid-session (no reload) → Nothing happens until the next /auth/me or premium call — there is no proactive expiry timer.

  > ⚠️ Auto-signout only fires on 401; 5xx/network errors deliberately keep the cached session.

### J-023 · Sign in on a SECOND device — premium entitlements follow the account

**Account state:** Account already holds paid state (e.g. season pass, or placement_pro, or purchased credits, or interview_credit) bought on device A. Device B: signed out, fresh browser.  
**Start at:** Device B: renonym.com → 'Sign in' → Continue with Google (same account)

- [ ] **1.** Complete Google sign-in on device B
      **Expect:** The popup/poll payload contains only a slim user {id,email,name,plan} — momentarily the UI may show free-tier state.
- [ ] **2.** Wait for the immediate refreshUserFromServer() that handleLogin triggers
      **Expect:** GET /auth/me merges the full surface: passType ('season' or 'placement_pro') with passExpiresAt in the future, credit balance, interviewCredits, coach access. localStorage['rn-auth-user'] now shows these fields.
- [ ] **3.** Open the UserPill menu (builder)
      **Expect:** Plan line shows '★ Season Pass' (passType==='season'), '★ Placement Pro' (passType==='placement_pro'), '★ Coach Unlimited' (coach.unlimited), '★ Pro' (plan==='pro'), else 'Free plan'.
- [ ] **4.** On device B, trigger a gated flow immediately after in-builder sign-in (e.g. Export of a premium template)
      **Expect:** handleAuthSuccess calls _refreshUser() BEFORE re-running the gated flow — a season-pass holder is NOT shown the purchase ladder for what they own.

  **Edge cases**
  - [ ] Pass expired between devices → Server hasActivePass() returns passType:null / passInterviewsRemaining:0 when pass_expires_at < now — device B correctly shows 'Free plan'.
  - [ ] Legacy 'grandfathered' account → /auth/me includes grandfathered:true (server flag); frontend merge does not surface it in the UserPill — verify via Network tab, not UI.
  - [ ] Same email via different provider (Google on A, magic-link on B) → upsertUser matches on email OR provider id — same account, same entitlements; name/avatar may be updated by the latest provider.

  > ⚠️ Entitlements are entirely server-side; localStorage is just a cache refreshed on every mount/sign-in. If device B looks free-tier, check that /auth/me succeeded (Network tab) before filing a bug.

### J-024 · UserPill display & menu

**Account state:** Signed in. Test once with a Google account (has avatar) and once with a magic-link account (no avatar).  
**Start at:** /builder topbar (right side)

- [ ] **1.** Look at the pill, Google account
      **Expect:** Round avatar image (Google profile photo) + first name or email-prefix as label.
- [ ] **2.** Look at the pill, magic-link account
      **Expect:** No avatar — an initials circle with the FIRST character of name/email uppercased; label is the part of the email before '@' (magic-link accounts get name = email prefix).
- [ ] **3.** Click the pill
      **Expect:** Menu opens: full email on top, then plan line (★ Season Pass / ★ Placement Pro / ★ Coach Unlimited / ★ Pro / 'Free plan'), then 'Sign out'.
- [ ] **4.** Click the pill again
      **Expect:** Menu toggles closed (whole pill is the click target; Sign out uses stopPropagation so it doesn't just toggle).

  **Edge cases**
  - [ ] User object has neither name nor email → Initials fall back to '?'.
  - [ ] Mobile width → Per project rules every UI change needs a mobile pass — verify pill + open menu don't overflow the builder topbar on a phone.

  > ⚠️ Plan-label precedence in code: season > placement_pro > coach.unlimited > plan==='pro' > 'Free plan'.

### J-025 · New-account signup grant: exactly +2 credits, once

**Account state:** An email address that has NEVER had a Renonym account (use a fresh alias, e.g. you+test1@gmail.com via magic link).  
**Start at:** Job Match teaser → 'Sign up free — see the full report' (or any AuthModal)

- [ ] **1.** Run an anonymous Job Match in the builder, scroll to the teaser card
      **Expect:** Card copy: 'That's the teaser — the full report is free.' and 'Sign up to see every missing keyword and skill... plus 2 free AI credits to act on them.' with button 'Sign up free — see the full report'.
- [ ] **2.** Sign up with the brand-new email
      **Expect:** Backend upsertUser INSERTs (created:true) → grantSignupCredits flips signup_credits_granted and writes a +2 ledger row with reason 'signup' (no expiry). Builder shows status 'Welcome! New accounts start with 2 free AI credits.' and auto-fetches the FULL job-match report.
- [ ] **3.** Verify the balance
      **Expect:** GET /auth/me (Network tab) returns credits: 2 — assuming no referral code was also claimed (see referral journey: that would make it 7).
- [ ] **4.** Sign out, sign back in with the same email
      **Expect:** No second grant — credits unchanged. The grant is flag-guarded (UPDATE ... WHERE signup_credits_granted = FALSE), safe even if an auth flow retries.

  **Edge cases**
  - [ ] Existing account signs in → upsertUser takes the UPDATE path (created flag absent) — grantSignupCredits is never called.
  - [ ] Same human, second alias email → Counts as a new account → another +2 (accounts are keyed by email/provider-id only).
  - [ ] DB grant failure → Swallowed server-side ('[credits] signup grant failed' log); sign-in still succeeds with 0 credits.

  > ⚠️ Grant fires from all three creation paths: Google callback, LinkedIn callback, and magic-link verify (all gated on user.created). Verify in backend: grantSignupCredits at /Users/rakshitsegwal/Documents/node server/server.js:2668, called at lines 2005, 2061, 2139.

### J-026 · Post-auth destination per entry context

**Account state:** Signed out for each sub-test.  
**Start at:** Varies — see steps

- [ ] **1.** Landing page → 'Sign in' link → complete auth
      **Expect:** main.jsx handleLogin: no rn-return-to is set, so default → navigates to /builder in gallery mode.
- [ ] **2.** /dashboard while signed out → 'Sign in' button on the 'Sign in to see your dashboard.' gate → auth on landing
      **Expect:** Button first writes rn-return-to='/dashboard' and routes to '/'; after sign-in handleLogin reads+clears rn-return-to and returns you to /dashboard.
- [ ] **3.** /tracker while signed out → 'Sign in to start' on the 'Every job, one pipeline.' gate → auth on landing
      **Expect:** rn-return-to='/tracker' → after sign-in you land back on /tracker.
- [ ] **4.** Builder topbar 'Sign in' (reason 'general')
      **Expect:** Modal 'Sign in to continue'; on success modal closes, you stay exactly where you were in the builder; no auto-action.
- [ ] **5.** Builder Export gate (reason 'export')
      **Expect:** On success: entitlements refresh, then the export re-runs automatically.
- [ ] **6.** Job-match teaser (reason 'jobmatch')
      **Expect:** Status toast 'Welcome! New accounts start with 2 free AI credits.' then the full report is fetched automatically.
- [ ] **7.** /coach landing 'Sign in'
      **Expect:** onAuth writes token+user then window.location.reload() — full page reload, you stay on /coach, now signed in (avatar chip linking to /coach/reports).
- [ ] **8.** /coach/checkout 'Sign in to upgrade' (reason 'payment')
      **Expect:** After auth it FIRST checks existing Coach access (coachMe): if you already own it → proceeds WITHOUT charging; if not → launches Razorpay; if the check fails → error 'Could not check your existing access — to avoid charging you twice, tap Pay only if you're sure you haven't bought Coach on this account.'

  **Edge cases**
  - [ ] rn-return-to left over from an abandoned attempt → It is read AND removed on the next successful sign-in — so a later, unrelated sign-in from the landing page may unexpectedly jump to /dashboard or /tracker. One-shot, then cleared.
  - [ ] Sign-in from PaymentModal / PaymentButton → Modal reason 'payment' → title 'Sign in to upgrade', subtitle 'Create a free account first, then complete your purchase.'; on success the host resumes its purchase flow in place (no navigation).

  > ⚠️ No deep-link preservation beyond the explicit rn-return-to writes (only Dashboard and Tracker set it). All other contexts either stay in place or default to /builder gallery.

### J-027 · Referral capture & claim on sign-in (give 5 / get 5)

**Account state:** User B signed out, never previously referred (referred_by NULL). User A has a referral code (mints on A's first /auth/me — A must have loaded the app signed-in at least once).  
**Start at:** Visit renonym.com/?ref=CODE (User A's code), then sign in

- [ ] **1.** Open /?ref=abcd1234
      **Expect:** Code is stored as localStorage['rn-ref-code'] uppercased and clipped to 16 chars. No visible UI change.
- [ ] **2.** Sign in (any method, any context)
      **Expect:** tryClaimReferral POSTs /referral/claim with the code. On success: +5 credits to User B ('referral:received') and +5 to User A ('referral:given') atomically; rn-ref-code removed. B's /auth/me now shows credits: 7 if B is also brand-new (2 signup + 5 referral).
- [ ] **3.** Reload while signed in
      **Expect:** tryClaimReferral runs again on mount but rn-ref-code is gone → no-op. Server side, referred_by acts as a once-only guard anyway (repeat claim returns {ok:true, already:true}).

  **Edge cases**
  - [ ] User claims their OWN code → 400 'You can't refer yourself — share the link instead!' — frontend drops rn-ref-code so it never retries.
  - [ ] Unknown/typo code → 404 'Unknown referral code.' — code dropped from localStorage.
  - [ ] Network error during claim → rn-ref-code is KEPT and retried on the next sign-in/mount.
  - [ ] >20 claim attempts per IP / 15 min → Rate-limited: 'Too many attempts — try again later.'
  - [ ] Already-referred account uses a second ref link → Server returns {ok:true, already:true} (no grant); frontend treats it as success and clears the code.

  > ⚠️ Entire flow is silent — no toast on success; verify via /auth/me credits in the Network tab or the dashboard credit display. Codes only exist after the referrer has hit /auth/me at least once (minted there for pre-v14 accounts, or at INSERT for new ones).

### J-028 · Cross-device magic-link sign-in: desktop requests, phone clicks, desktop tab signs in via polling

**Account state:** Signed out on desktop browser at renonym.com (localStorage has no rn-auth-token / rn-auth-user). Tester controls an email inbox they can open on a PHONE. For a clean run, optionally note the desktop's localStorage['rb-client-id'] value first (created automatically if missing).  
**Start at:** renonym.com → top-nav 'Sign in' → auth modal → '✉ Continue with email'

- [ ] **1.** On desktop, open renonym.com and click 'Sign in' in the top nav.
      **Expect:** Auth modal opens with title 'Sign in to continue', subtitle 'Sign in to save your work and access all features.', a 'Continue with Google' button, an 'or' divider, a '✉ Continue with email' button, and footer 'Free forever · No credit card needed'.
- [ ] **2.** Click '✉ Continue with email'.
      **Expect:** Modal switches to the email form: input with placeholder 'you@example.com' (autofocused), button 'Send magic link →', and a '← Back' link.
- [ ] **3.** Enter your email and click 'Send magic link →'.
      **Expect:** Button shows 'Sending…' while in flight. On success the modal shows the sent state: '✉' icon, 'Check your inbox!', and 'We sent a sign-in link to <your email>. Click it to sign in — the link expires in 15 minutes. Keep this tab open: you'll be signed in here automatically.' Behind the scenes the desktop starts GET /auth/poll?nonce={rb-client-id}_ml every 6 seconds (verify in Network tab: responses are {"pending":true}).
- [ ] **4.** Verify the polling slot is keyed to the REQUESTING desktop browser: in the desktop Network tab, confirm the poll nonce equals localStorage['rb-client-id'] + '_ml'.
      **Expect:** Poll URL nonce matches the desktop's rb-client-id with the '_ml' suffix. Server registered this slot at request time (server.js 2090-2096) and will hold the session for THIS browser only.
- [ ] **5.** On the PHONE, open the email.
      **Expect:** Email subject: 'Your Renonym AI sign-in link', from noreply@renonym.ai (or SMTP_FROM). Dark card with 'Renonym AI' / 'AI-Powered Resume Builder', body 'Click the button below to sign in. This link expires in 15 minutes.', purple button 'Sign in to Renonym AI', and footer 'If you didn't request this, you can safely ignore it.' The link points to the BACKEND domain: https://salesforce-resume-pdf-server-production.up.railway.app/auth/magic-link/verify?token=… (APP_URL), not renonym.com.
- [ ] **6.** Tap 'Sign in to Renonym AI' on the phone.
      **Expect:** Phone browser opens the backend-domain authSuccessPage: dark (#0b0c1a) page, purple spinner ring, text 'Signing you in...' (page <title> 'Signing in...'). The page tries window.close() after 400ms — mail-app webviews usually can't self-close, so it may just sit on 'Signing you in...'. The PHONE gets NO renonym.com session: the page only postMessages to a window.opener (none exists from a mail app) — opening renonym.com on the phone afterwards still shows signed-out.
- [ ] **7.** Look back at the still-open DESKTOP tab within ~10 seconds.
      **Expect:** On the next 6-second poll the desktop receives {pending:false, token, user}: the modal closes, rn-auth-token and rn-auth-user are written to localStorage, and handleLogin navigates to the builder gallery (or to the path saved in localStorage['rn-return-to'] if sign-in was triggered from a gate like /tracker). The user pill appears top-right showing the name (for a new email account, name = the part of the email before '@').
- [ ] **8.** If this email had never signed up before, check the account state (e.g. user-pill menu / dashboard credits).
      **Expect:** New account created with provider 'email', plan 'free' (pill menu shows 'Free plan'), and a one-time signup grant of 2 credits (grantSignupCredits → creditGrant(userId, 2, 'signup')).

  **Edge cases**
  - [ ] Desktop refreshes or a second tab polls the same nonce after the session was delivered → The session is one-shot: /auth/poll deletes the entry on the first non-pending response (server.js 2224). Subsequent polls for the same nonce return 404 {"error":"Invalid or expired nonce."}. The signed-in state persists only via the localStorage token already written.
  - [ ] Desktop tab is CLOSED before the phone click → Verify still succeeds on the phone ('Signing you in...' page) because the slot is set unconditionally on verify (server.js 2144-2146), but nobody polls it, so NO device ends up signed in to renonym.com. The unconsumed session is swept by the 5-minute cleanup interval once older than 5 min. User must reopen the modal and request a fresh link.
  - [ ] Backend restarts between request and click (in-memory slot map wiped) → Desktop polls get 404 {"error":"Invalid or expired nonce."} which the frontend silently ignores (catch/`!d.token` guard) and keeps polling. Verify re-creates the slot unconditionally on click, so the desktop still signs in on the next poll — by design (comment at server.js 2142-2143).
  - [ ] Invalid email format submitted → Server returns 400; modal error banner shows 'Please enter a valid email address.' Empty email is caught client-side: 'Please enter your email.'
  - [ ] 6th magic-link request from the same IP within 15 minutes → 429 from magicLinkLimiter (max 5 per IP per 15 min); modal error banner shows 'Too many email requests. Please wait 15 minutes.'
  - [ ] SMTP not configured on server → 503; modal shows 'Email not configured on server. Use Google sign-in instead.' Email send failure shows 'Failed to send email. Please try again.' (500). No DATABASE_URL: 503 'Auth not configured (no DATABASE_URL).'
  - [ ] Second link requested for the same email before clicking the first → Request deletes all prior unused tokens for that email (DELETE FROM rn_magic_tokens WHERE email=$1 AND used_at IS NULL), so the FIRST emailed link immediately renders the error page 'This link has expired or already been used. Please request a new one.' Only the newest link works.

  > ⚠️ Polling slot key is {clientId}_ml where clientId = localStorage['rb-client-id'] on the REQUESTING browser (created via crypto.randomUUID if absent — AuthModal.jsx 65-69). Poll interval 6s, hard-stopped client-side after 15 min (AuthModal.jsx 91-93). Server: /auth/poll rate-limited to 250 req / 5 min / IP. authSuccessPage postMessage targets FRONTEND_URL env (defaults to the old Salesforce site — must be set to renonym.com in prod for popup flows; irrelevant cross-device since there is no opener). Email link host comes from APP_URL env. Requires SMTP (mailer) + DATABASE_URL configured on Railway. Files: /Users/rakshitsegwal/Documents/node server/server.js 2073-2153, 1935-1964, 2198-2226; /Users/rakshitsegwal/Documents/renonym-react/src/AuthModal.jsx 58-99, 165-175; /Users/rakshitsegwal/Documents/renonym-react/src/LandingPage.jsx 29-30; /Users/rakshitsegwal/Documents/renonym-react/src/main.jsx 179-190.

### J-029 · 15-minute expiry: link, server polling slot, and client polling all time out together

**Account state:** Signed out on desktop; access to inbox on any device. Requires waiting >15 minutes mid-test.  
**Start at:** renonym.com → 'Sign in' → '✉ Continue with email' → send link, then wait

- [ ] **1.** Request a magic link on desktop and confirm the sent state appears, then leave the tab open WITHOUT clicking the email link.
      **Expect:** Sent state reads '…the link expires in 15 minutes. Keep this tab open: you'll be signed in here automatically.' Desktop polls /auth/poll?nonce={clientId}_ml every 6s, receiving {"pending":true} (the slot was pre-registered as null at request time).
- [ ] **2.** Wait just over 15 minutes, watching the Network tab.
      **Expect:** Three things expire on the same clock: (1) the DB token row (expires_at = now + 15 min); (2) the server slot — a 15-min setTimeout deletes the {clientId}_ml entry if still unresolved (server.js 2092-2095), after which any poll returns 404 {"error":"Invalid or expired nonce."}; (3) the client stops polling entirely (15-min setTimeout clears the interval, AuthModal.jsx 93). The modal UI does not change — it still shows 'Check your inbox!' with no error.
- [ ] **3.** Now click the emailed link (on phone or desktop).
      **Expect:** Backend renders authErrorPage: red centered text 'This link has expired or already been used. Please request a new one.' on a dark #0b0c1a page; the tab attempts to self-close after 3 seconds. Even though verify would set a slot unconditionally, the SELECT requires expires_at>NOW(), so no session is ever created — neither device signs in.
- [ ] **4.** Close and reopen the auth modal, request a fresh link, and click it within 15 minutes.
      **Expect:** Normal flow resumes: fresh token row + fresh {clientId}_ml slot; desktop signs in within ~6s of the click.

  **Edge cases**
  - [ ] Phone clicks at minute 14, but the desktop tab was navigated away and reopened at minute 16 → The resolved session sits in memory with createdAt; the 5-minute cleanup sweep deletes resolved entries older than 5 min (server.js 2201-2207), so a reopened tab cannot pick it up — reopening the modal starts a new request anyway (polling only starts after a send). Effective consumption window after click: roughly 5-10 min, normally consumed in ≤6s.
  - [ ] Polling rate-limit pressure → Magic-link polling at 6s ≈ 50 req per 5-min window, well under pollLimiter's 250/5 min/IP. Running a simultaneous Google-popup poll (1.5s ≈ 200/5 min) plus magic-link polling still fits by design (comment at server.js 333).

  > ⚠️ The client-side 15-min poll cutoff and server-side 15-min slot deletion are independent timers started at request time; the link's DB expiry starts at the same moment. No UI feedback is shown on timeout — known limitation: the 'Check your inbox!' panel persists until the modal is closed. server.js 2081-2095, 2130-2133; AuthModal.jsx 79-93.

### J-030 · Used / invalid magic link: authErrorPage rendering on the backend domain

**Account state:** Any state. Need one already-consumed magic link (complete a successful sign-in first and keep the email).  
**Start at:** Open the 'Sign in to Renonym AI' link from an ALREADY-USED magic-link email (host: salesforce-resume-pdf-server-production.up.railway.app/auth/magic-link/verify?token=…)

- [ ] **1.** Complete one successful magic-link sign-in (link consumed; used_at set in rn_magic_tokens), then open the SAME email link again on any device.
      **Expect:** Backend renders authErrorPage: dark #0b0c1a full-viewport page with red (#ef4444) centered 14px text 'This link has expired or already been used. Please request a new one.' Page <title> is 'Sign-in error'. A script posts RENONYM_AUTH_ERROR to window.opener (no-op without an opener) and the tab attempts window.close() after 3 seconds (typically blocked in a normal tab, so the message stays visible).
- [ ] **2.** Open /auth/magic-link/verify with NO token query param (delete ?token=… from the URL).
      **Expect:** Same authErrorPage style with text 'Invalid magic link.'
- [ ] **3.** Open /auth/magic-link/verify?token=<random garbage hex>.
      **Expect:** The SELECT finds no row → 'This link has expired or already been used. Please request a new one.' (garbage tokens are indistinguishable from used/expired ones by design).
- [ ] **4.** Confirm no session leaked: check localStorage on the device that opened the dead link, and the original requesting desktop tab if still polling.
      **Expect:** No rn-auth-token written anywhere. The verify error path never calls pendingAuthSessions.set, so the desktop's polls keep returning {"pending":true} (or 404 after slot expiry) and it never signs in.

  **Edge cases**
  - [ ] DB error during verify (e.g. database briefly down at click time) → authErrorPage with 'Sign-in failed. Please try again.' (catch block, server.js 2149-2152). No DATABASE_URL at all: 503 JSON 'Auth not configured (no DATABASE_URL).' instead of an HTML page.
  - [ ] Mail-client link prefetching (some providers GET links for scanning) → Risk to verify manually: a prefetch GET consumes the single-use token (used_at set) AND resolves the polling slot, so the desktop may sign in WITHOUT the user clicking — or, if the prefetch happened before the user clicks, the human click shows the used/expired error page while the desktop is already signed in. Code has no bot/prefetch guard on /auth/magic-link/verify.
  - [ ] Error page on a popup-opened window (e.g. Google OAuth errors reuse authErrorPage) → When an opener exists, RENONYM_AUTH_ERROR is posted to FRONTEND_URL and the popup closes after 3s; AuthModal has no listener for RENONYM_AUTH_ERROR (polling-based flow), so the modal simply keeps waiting.

  > ⚠️ authErrorPage HTML at server.js 1955-1964; verify error branches at 2127, 2133, 2151. All error pages render on the BACKEND (Railway) domain, never renonym.com. The postMessage target origin is FRONTEND_URL env (default 'https://developwithrax-dev-ed.my.site.com' — stale default; verify prod env sets renonym.com).

### J-031 · Purchase on device B silently corrects device A's stale rn-auth-user cache on next mount

**Account state:** One free account with 0 credits, signed in on two separate browsers/devices: Device A and Device B. Device A's localStorage rn-auth-user therefore caches credits: 0.  
**Start at:** Device A: renonym.com/dashboard (already signed in). Device B: renonym.com/dashboard (same account).

- [ ] **1.** Device A: open /dashboard and read the gold credit pill at the bottom of the left sidebar.
      **Expect:** Pill shows '⚡ 0 credits' (Dashboard.jsx line 77 renders `⚡ ${user?.credits ?? 0} credit(s)` from the cached currentUser; singular 'credit' only when the count is exactly 1).
- [ ] **2.** Device B: click the same credit pill to open the upgrade ladder (PaymentModal), select 'Boost Pack' and pay.
      **Expect:** Modal lists Placement Pro ₹2,999 / 90 days, Season Pass ₹1,499 / 90 days, Boost Pack ₹299 one-time '+10 credits … Valid 6 months'. Pay button reads 'Get Boost Pack — ₹299'. After Razorpay success, PaymentModal itself re-fetches /auth/me and rewrites Device B's rn-auth-user — Device B now shows '⚡ 10 credits'.
- [ ] **3.** Device A: WITHOUT reloading, look at the credit pill again (and switch tabs back and forth).
      **Expect:** Still '⚡ 0 credits' — there is no live sync and no focus-triggered refresh; refreshUserFromServer only runs on mount and on login (main.jsx lines 107-114 and 183).
- [ ] **4.** Device A: hard-reload the page (any view).
      **Expect:** On mount, main.jsx first restores the cached user (a brief flash of the stale '⚡ 0 credits' is possible), then refreshUserFromServer (main.jsx 88-104) calls GET /auth/me, merges the full v14 surface {plan, credits, passType, passExpiresAt, passInterviewsRemaining, interviewCredits, freeInterviewUsed, referralCode}, rewrites localStorage rn-auth-user, and setCurrentUser fires. Credit pill updates to '⚡ 10 credits' within a second or two.
- [ ] **5.** Device A: confirm gates use the fresh data — trigger a credit-spending action (e.g. an AI feature that previously showed the out-of-credits gate).
      **Expect:** The "You're out of credits" PaymentModal (reason 'credits', subtitle 'Top up, or go unlimited for the whole season.') no longer appears; the action proceeds. Note: spending is enforced server-side against the real balance regardless of the client cache — the cache only controls what the UI displays.
- [ ] **6.** Device A: inspect localStorage rn-auth-user in DevTools after the reload.
      **Expect:** JSON now contains credits: 10 plus the merged fields above — proof the slim/stale cache was silently replaced by the /auth/me payload.

  **Edge cases**
  - [ ] Device A's JWT has expired (30 days, JWT_EXPIRES='30d', server.js line 84) when /auth/me runs on mount → Server returns 401 { error: 'Session expired. Please log in again.', code: 'AUTH_REQUIRED' }; main.jsx 98-102 removes rn-auth-token and rn-auth-user and sets currentUser null — Device A lands signed-out (on /dashboard: 'Sign in to see your dashboard.' with a 'Sign in' button).
  - [ ] /auth/me fails with a network error or 5xx (not 401) on mount → Silently ignored (catch only handles 401) — Device A keeps showing the stale cached values until a later successful refresh.
  - [ ] Pass purchase (Season/Placement Pro) on Device B instead of credits → Same mechanism, but the Dashboard sidebar pill prefers the pass: after Device A's reload it shows '★ Season Pass · N left' or '★ Placement Pro · N left' (Dashboard.jsx line 76). The plan label next to the avatar comes from a separate live coachMe() call, so it shows '—' then the fresh pass label even before the rn-auth-user cache is corrected (lines 33-39).
  - [ ] /auth/me side effects on the refresh → GET /auth/me (server.js 2157) also mints a referral_code for pre-v14 accounts that lack one, and runs expireStaleCredits before reading the balance — so the refreshed credit count already reflects expiry.

  > ⚠️ The refresh is mount/login-only — opening a new tab or reloading counts, tab focus does not. The popup-auth path writes only a slim {id,email,name,plan} user, so refreshUserFromServer is also what backfills credits/passType right after sign-in. All spending/gating is additionally enforced server-side per the gating model; this journey verifies the client mirror, not the enforcement.

### J-032 · Sign-out on device A does NOT invalidate device B (stateless JWT; /auth/logout is client-side only)

**Account state:** One account signed in on Device A and Device B (any plan).  
**Start at:** Device A: /dashboard. Device B: /dashboard or /tracker, left open.

- [ ] **1.** Device A: in the Dashboard sidebar, click the '↩' button (title 'Log out') next to your name. (Inside the builder the equivalent is the user pill → 'Sign out'.)
      **Expect:** Device A is signed out and navigates to the landing page. handleLogout (main.jsx 192-197) only removes localStorage rn-auth-token / rn-auth-user and clears currentUser — verify in DevTools Network tab that NO request to /auth/logout (or any endpoint) is made.
- [ ] **2.** Device B: WITHOUT reloading, keep using authenticated features — open Interview Reports (/coach/reports), the tracker (/tracker), save a resume, or add a tracker job.
      **Expect:** Everything still works. The JWT is stateless: requireAuth (server.js 1903-1909) only does jwt.verify against JWT_SECRET — there is no session store or token blacklist, so nothing Device A did can revoke Device B's token.
- [ ] **3.** Device B: hard-reload the page.
      **Expect:** Still signed in. Mount restores the cached session and refreshUserFromServer's GET /auth/me succeeds with the still-valid token.
- [ ] **4.** Optional (curl/DevTools): POST /auth/logout with Device B's Bearer token, then call any authenticated endpoint with the same token.
      **Expect:** /auth/logout (server.js 2228-2231) just logs '[AUTH] Logout: <email>' and returns { success: true } — it invalidates nothing. The subsequent authenticated call still succeeds with the 'logged-out' token.
- [ ] **5.** Device A: sign back in.
      **Expect:** A NEW token is issued (signToken, 30-day expiry); both devices now hold independent valid tokens for the same account.

  **Edge cases**
  - [ ] Device B's token reaches its 30-day expiry (or JWT_SECRET is rotated on Railway) → Only then do authenticated calls fail with 401 { error: 'Session expired. Please log in again.', code: 'AUTH_REQUIRED' }; on the next mount refreshUserFromServer clears the local session cleanly and Device B appears signed out.
  - [ ] POST /auth/logout without a token → 401 { error: 'Authentication required.', code: 'AUTH_REQUIRED' } from requireAuth — the endpoint is auth-gated even though it does nothing.
  - [ ] Device A signs out while Device B has an interview session / payment in flight → Unaffected — the in-flight request carries Device B's own Bearer token, which remains valid.

  > ⚠️ Security caveat worth flagging to the owner: there is no server-side revocation at all. 'Sign out everywhere' is impossible today short of rotating JWT_SECRET (which kills ALL users' sessions). The frontend never calls /auth/logout — the endpoint at server.js:2228 is effectively dead code kept for API symmetry.

### J-033 · Referral claim raced from two devices for the same new account (give 5 / get 5, atomic once-only)

**Account state:** Referrer account R signed in at least once so /auth/me has minted its referralCode (codes are minted lazily on GET /auth/me, server.js 2163-2171 — note the env caveat: a code only exists after a profile load). A second, brand-new account N whose referred_by is NULL (never claimed any referral), reachable on two devices. Record R's and N's starting credit balances.  
**Start at:** Both devices: open renonym.com/?ref=<R's code> while signed out.

- [ ] **1.** On Device A and Device B, visit renonym.com/?ref=<code> (try lowercase and with whitespace).
      **Expect:** Each device stores localStorage rn-ref-code = code trimmed, uppercased, max 16 chars (main.jsx 66-71). Nothing visible happens — the claim is deferred until sign-in.
- [ ] **2.** Sign in as account N on BOTH devices as close to simultaneously as possible (or, if already signed in, hard-reload both at once — tryClaimReferral fires on mount and on login, main.jsx 112 and 182).
      **Expect:** Both devices POST /referral/claim with the code. Server (server.js 3091): inside a transaction, 'UPDATE rn_users SET referred_by=$2 ... WHERE id=$1 AND referred_by IS NULL' — exactly ONE device wins (rowCount 1), triggering creditGrant +5 'referral:received' to N and +5 'referral:given' to R, committed atomically; response { ok: true, granted: 5 }. The loser's UPDATE matches 0 rows → ROLLBACK → 200 { ok: true, already: true } with NO grants.
- [ ] **3.** Check localStorage rn-ref-code on both devices after the claims settle.
      **Expect:** Removed on BOTH devices — both responses are 2xx, so the .then() cleanup runs for winner and loser alike (main.jsx 78). Neither device will retry.
- [ ] **4.** Verify balances: reload Device A or B as N and read the Dashboard credit pill; sign in as R elsewhere and read R's pill.
      **Expect:** N gained exactly +5 (e.g. '⚡ 5 credits' if it started at 0); R gained exactly +5. NOT +10 for either — the referred_by guard makes double-granting impossible. There is no UI toast for the claim; the balance is the only observable.
- [ ] **5.** Repeat: visit ?ref=<code> again on either device while signed in as N, and reload.
      **Expect:** Claim returns { ok: true, already: true } (referred_by is now set), no credits move, and the stored code is silently dropped again.

  **Edge cases**
  - [ ] R opens its own referral link and signs in (self-referral) → 400 { error: "You can't refer yourself — share the link instead!" }; the frontend drops rn-ref-code permanently (main.jsx 81 removes it on status 400/404) — no retry loop.
  - [ ] Code does not match any user (typo / fabricated) → 404 { error: 'Unknown referral code.' } and the stored code is dropped, same as above.
  - [ ] Network failure or 5xx during the claim → rn-ref-code is KEPT (only 400/404 delete it) and the claim retries automatically on the next sign-in or page mount.
  - [ ] Hammering /referral/* more than 20 times in 15 minutes (e.g. scripted race testing) → 429 { error: 'Too many attempts — try again later.' } from the route-level rate limiter (server.js ~3085).
  - [ ] Missing code in the request body → 400 { error: 'Missing referral code.' } (only reachable via direct API call — the client never posts without a code).
  - [ ] Server has no DATABASE_URL → 503 { error: 'Referrals not configured.' }.
  - [ ] Crash mid-transaction (simulated) → By design the claim and both grants commit together; a rollback leaves referred_by NULL so the claim can be retried — the claim can never be consumed without both +5 grants landing.

  > ⚠️ Server-side atomicity is the real guard (single UPDATE with referred_by IS NULL predicate inside BEGIN/COMMIT); the client race merely exercises it. The claim is requireAuth'd, so a signed-out visit only stores the code. Both client and server normalize the code (trim/uppercase/16 chars) so case differences cannot cause a false 404. Verify R's +5 via R's own dashboard after a reload (R's cache is also stale until its next mount — same mechanism as journey 1). Frontend files: /Users/rakshitsegwal/Documents/renonym-react/src/main.jsx, src/Dashboard.jsx, src/PaymentModal.jsx, src/AuthModal.jsx; backend: /Users/rakshitsegwal/Documents/node server/server.js lines 1903-1909 (requireAuth), 2228 (/auth/logout), 2157 (/auth/me), 3091 (/referral/claim).


---

## Résumé Builder — Core

### J-034 · Browse template gallery and select a FREE template (no sign-in required)

**Account state:** Signed out (or any free user). Free templates are exactly: Classic Pro (sf-classic), Minimal ATS (sf-minimal), Nordic Clean (nordic-clean).  
**Start at:** renonym.com → landing 'Get Started' CTA, or load /builder directly — both land on the gallery step

- [ ] **1.** Land on the gallery step
      **Expect:** Topbar shows brand 'Renonym AI', a '← Back' ghost button, page title 'Choose a Template', and a pill '10 Templates'. Page header: 'Choose your template' with sub-copy 'Click a template to preview it — then hit "Use this template" to continue.' and count '10 templates'. Filter row: All / Minimal / Bold / Executive. Bottom of page: '✦ Generate with AI Design' button with hint 'Describe your style — AI builds a unique template'.
- [ ] **2.** Click the 'Minimal' filter
      **Expect:** Grid shrinks to 3 tiles (Modern Clean, Minimal ATS, Nordic Clean). BOTH counters update to the filtered count: topbar pill reads '3 Templates' and header count '3 templates'. Bold → 4 tiles, Executive → 3 tiles, All → 10.
- [ ] **3.** As a non-paid user, scan the tiles
      **Expect:** The 7 premium tiles (Modern Clean, Dark Tech, Executive, Emerald Pro, Graphite, Mauve Creative, Terracotta) each show a gold '👑 PASS' badge top-left of the thumbnail with hover tooltip 'Included with any pass'. The 3 free tiles have no badge. Each tile footer shows name + tag (e.g. 'Classic Pro' / 'Salesforce Blue').
- [ ] **4.** Click the 'Classic Pro' tile
      **Expect:** Tile gets a selected outline + ✓ check; hover label flips from 'Use Template' to '✓ Selected'. A CTA bar becomes visible at the bottom: 'Selected: Classic Pro' and button 'Use this template →'.
- [ ] **5.** Click 'Use this template →'
      **Expect:** Goes straight to the method step ('How would you like to start?'). No sign-in prompt — free template selection never requires auth.

  **Edge cases**
  - [ ] Click '← Back' in the gallery topbar → Returns to the landing page (onGoToLanding).
  - [ ] No tile selected → CTA bar is hidden (rp-gallery__cta-bar without --visible); handleGalleryConfirm returns early so nothing can be confirmed.
  - [ ] Click '✦ Generate with AI Design' → Switches to the AI flow at step 1 ('AI Design Studio', pill 'Step 1 of 2') and clears any previous templatePrompt — covered by the AI-flow agent.
  - [ ] Paid user (active pass or legacy pro) views gallery → NO '👑 PASS' badges render at all (badge condition is isPremium && !isPaid).

  > ⚠️ isPaid = plan==='pro' OR coach.unlimited OR (passType set AND passExpiresAt in the future). Badge/gating is purely client-side here; export is separately server-enforced via 402 PASS_REQUIRED.

### J-035 · Select a 👑 premium template as a non-paid user → 'Unlock all 10 templates' ladder modal

**Account state:** Signed out, OR signed-in free user, OR user whose passExpiresAt is in the past (expired pass behaves as free)  
**Start at:** /builder → gallery step → click a crowned tile (e.g. Dark Tech)

- [ ] **1.** Select 'Dark Tech' and click 'Use this template →'
      **Expect:** Does NOT advance to the method step. PaymentModal opens over the gallery: title 'Unlock all 10 templates', sub 'Premium templates are included with any pass.'
- [ ] **2.** Inspect the plan cards
      **Expect:** Only TWO cards (Boost Pack ₹299 is hidden for the template reason): 'Placement Pro' ₹2,999 / 90 days (25 full interviews (audio + text), Unlimited AI actions, All 10 templates, Priority support) and 'Season Pass' ₹1,499 / 90 days with 'MOST POPULAR' badge, pre-selected (6 full interviews (audio + text), Unlimited AI actions, All 10 templates, Full scored reports). CTA button reads 'Get Season Pass — ₹1,499'. Footer: 'One-time payment via Razorpay (card / UPI / netbanking). Need just one interview? Single Interview ₹499 is available at interview setup.'
- [ ] **3.** Click the Placement Pro card
      **Expect:** Selection moves (gold ring); CTA changes to 'Get Placement Pro — ₹2,999'.
- [ ] **4.** Close the modal (X or click the dark backdrop)
      **Expect:** Modal closes; you are still on the gallery with the premium tile selected; templateStyle is unchanged — nothing was applied.
- [ ] **5.** (Signed out) Click the pay CTA
      **Expect:** AuthModal opens first (reason 'payment'). After successful sign-in, payment flow continues automatically (token+user written to localStorage, then Razorpay checkout opens).
- [ ] **6.** Complete payment successfully
      **Expect:** Modal shows 'Opening secure checkout…' then 'Activating…', closes, user is refreshed from /auth/me, and a green status toast shows 'Purchase active — you're all set.' (auto-clears after 5 s). NOTE: the template is NOT auto-applied — click 'Use this template →' again; now isPaid is true so it proceeds to the method step.

  **Edge cases**
  - [ ] Dismiss the Razorpay checkout window → Error 'CANCELLED' is swallowed — no red error banner; modal returns to the plan cards with the button re-enabled.
  - [ ] Payment verification fails → Red error card inside the modal with the error message (fallback copy 'Payment failed — try again.').
  - [ ] Season-pass / placement_pro / legacy-unlimited user selects a premium tile → No modal; 'Use this template →' goes straight to the method step.

  > ⚠️ Same ladder modal (reason='template') is reused by the topbar template select and the Design-section quick grid. Backdrop-click close is blocked while busy. Razorpay flow uses /create-order → checkout → /verify-payment on the Railway backend.

### J-036 · Method step — Build from Scratch

**Account state:** Any user; arrived at the method step by confirming a usable template  
**Start at:** Gallery → free template → 'Use this template →'

- [ ] **1.** View the method step
      **Expect:** Topbar has only '← Back'. Hero: 'How would you like to start?' / 'Import your existing resume for instant AI-parsing, or build from scratch with live preview.' Two cards: 'Import Resume' ('Upload PDF or DOCX — AI extracts your details in seconds. No manual typing needed.', tag 'PDF, DOC, DOCX') and 'Build from Scratch' ('Fill in your details step-by-step with live preview updating as you type.', tag 'Guided flow').
- [ ] **2.** Click '← Back'
      **Expect:** Returns to the gallery; your previous tile is still selected (selectedGalleryTemplate is kept).
- [ ] **3.** Return and click 'Build from Scratch'
      **Expect:** Enters the build step on the Profile section with a COMPLETELY BLANK form — including ZERO experience and education cards (startManualBuild resets everything). The right-hand Live Preview shows the placeholder persona 'Alex Morgan — Senior Product Designer' (Stripe/Notion experience, RISD education) because no real data exists yet.

  **Edge cases**
  - [ ] User had a saved draft (rb-draft) before clicking 'Build from Scratch' → Draft content is DESTROYED: formData is reset to blank and the debounced auto-save (400 ms) overwrites rb-draft with the blank form. There is no confirmation prompt.

  > ⚠️ On a fresh page load with no draft, connectedCallback seeds ONE empty experience + education card — but startManualBuild leaves both lists empty until '+ Add role' / '+ Add education' is clicked.

### J-037 · Method step — Import Resume (PDF/DOCX parsed by AI, no login needed)

**Account state:** Any user (works signed out); have a text-based PDF or DOCX resume under 5 MB  
**Start at:** Method step → 'Import Resume' card (file picker accepts .pdf,.doc,.docx)

- [ ] **1.** Pick a normal PDF resume
      **Expect:** Status banner 'Extracting text from file…' (info), then 'AI is parsing your resume…'. Full-screen overlay shows 'Importing resume...' and the method step shows an inline spinner row 'Parsing your resume with AI…'. Text extraction is client-side (pdf.js / mammoth from CDN); parsing hits POST /extract-resume (90 s timeout).
- [ ] **2.** Wait for success
      **Expect:** Jumps to the build step, Profile section active (templates mode). All parsed fields are merged in: name/title/email/phone/location/linkedIn/summary, skills, certifications, experiences (bullets joined into the textarea, dateRange 'start – end'), education. Green status: 'Resume imported successfully! Review and adjust your details.' (auto-clears after 5 s). Live preview shows the imported resume in the chosen template.

  **Edge cases**
  - [ ] Select a legacy .doc file → Rejected with 'Please upload a PDF, DOCX, or TXT file. Images are not supported here.' — even though the picker's accept attribute lists .doc. (.txt is accepted by the handler but filtered out by the picker — a mismatch worth noting.)
  - [ ] File over 5 MB → 'Resume file must be under 5 MB.' (error status).
  - [ ] Scanned/image-only PDF (no extractable text, <10 chars) → 'Could not extract text from this file. Try a different format.'
  - [ ] Backend returns 429 (IP limit: 20 AI calls / 15 min, or per-client-id limit) → 'Too many AI requests. Please wait a few minutes.'
  - [ ] AI takes longer than 90 s (AbortError) → 'The AI took too long to parse that résumé — please try again (it usually works on the second attempt).'
  - [ ] Any other server error → 'Failed to parse resume. Please try again.'
  - [ ] Re-select the same file after a failure → Works — the input value is reset in finally so onChange fires again.

  > ⚠️ /extract-resume requires x-api-secret + a UUID x-client-id (localStorage rb-client-id) but NOT a login. If the import was started from the AI flow instead, success lands on the AI Style section and pre-fills templatePrompt with 'Create the best modern ATS-friendly resume template for this imported resume. Keep it single-page, premium, elegant and compact.'

### J-038 · Build — Profile section with live preview

**Account state:** In the build step after 'Build from Scratch' (blank form, preview shows Alex Morgan placeholder)  
**Start at:** Build step → Profile section (👤 in left sidenav / 'Profile' in topbar trail)

- [ ] **1.** Inspect the build chrome
      **Expect:** Left icon sidenav: Profile 👤, Skills ⚡, Work 💼, Edu 🎓, Design 🎨, separator, Job Match 🎯 ('AI Style ✦' appears only in AI mode). Topbar trail: Profile · Skills · Experience · Education · Design, plus font-family select, S/M/L buttons, template select, 'AI Review', 'Export PDF', and 'Sign in' (signed out) or the user pill. Right panel: 'Live Preview' with 'A4' badge.
- [ ] **2.** Type one character into 'Full Name'
      **Expect:** CRITICAL: the entire Alex Morgan placeholder vanishes from the preview at once (activeResumeData switches to real formData as soon as ANY meaningful data exists) — the preview now shows only your single character; everything else is empty.
- [ ] **3.** Fill Full Name 'Priya Sharma', Professional Title, Email, Phone, Location, LinkedIn URL
      **Expect:** Each keystroke updates the preview live. The photo placeholder circle shows initials 'PS' (first letters of first two words; symbols/emoji are ignored).
- [ ] **4.** Upload a profile photo under 2 MB via 'Change photo'
      **Expect:** Photo replaces the initials in the editor and in the preview (where the layout shows a photo).
- [ ] **5.** Type a Professional Summary
      **Expect:** Preview summary updates live. ('✦ Improve with AI' button sits next to the label — AI agent's scope.)
- [ ] **6.** Click 'Next: Skills →' in the section footer
      **Expect:** Skills section becomes active; sidenav + topbar trail highlight moves.

  **Edge cases**
  - [ ] Photo file over 2 MB → 'Photo must be under 2 MB.' error status; photo unchanged.
  - [ ] Paste an oversized value → Hard caps enforced on input/paste: fullName 100, title 120, email 254, phone 40, location 120, linkedIn 200, summary 2000 chars — excess is silently truncated.
  - [ ] Name like '🚀 <b>Test</b>' → Initials avatar only matches Unicode letters — no symbols/tags leak in.

  > ⚠️ Summary and bullet textareas are uncontrolled and synced by _syncTextareas() after each render — verify imported/restored values actually appear in them.

### J-039 · Build — Skills & Certifications

**Account state:** In the build step  
**Start at:** Sidenav ⚡ Skills or footer 'Next: Skills →'

- [ ] **1.** View the section
      **Expect:** Title 'Skills', hint 'Add skills one at a time. Press Enter or click Add.', input with placeholder 'e.g. Apex, LWC, Salesforce CPQ' + 'Add' button. Below: 'Certifications' subsection with placeholder 'e.g. Salesforce Admin, AWS Solutions Architect'.
- [ ] **2.** Type 'Apex' and press Enter
      **Expect:** Pill 'Apex ×' appears; input clears; skill appears in the live preview's skills area immediately.
- [ ] **3.** Type 'Apex' again and click Add
      **Expect:** Nothing is added (exact-duplicate guard); input just clears — no error message.
- [ ] **4.** Click × on a pill
      **Expect:** Pill removed; preview updates instantly.
- [ ] **5.** Add a certification the same way
      **Expect:** Cert pill appears (distinct rp-pill--cert styling) and shows in the preview's certifications block.
- [ ] **6.** Footer buttons
      **Expect:** '← Back' → Profile; 'Next: Experience →' → Experience.

  **Edge cases**
  - [ ] Add with empty/whitespace-only input → No pill added, input cleared, no error.

  > ⚠️ Preview only renders the skills/certifications blocks when at least one entry exists (hasSkills/hasCertifications).

### J-040 · Build — Work Experience with live bullet parsing

**Account state:** In the build step (after 'Build from Scratch' this section starts with ZERO cards)  
**Start at:** Sidenav 💼 Work or 'Next: Experience →'

- [ ] **1.** Click '+ Add role'
      **Expect:** Empty experience card appears with header initials placeholder '—', fields Company / Job Title / Start ('Jan 2021' placeholder) / End ('Present' placeholder) and textarea 'Key responsibilities (one per line)'.
- [ ] **2.** Type Company 'Deloitte'
      **Expect:** Card header initials become 'DE' (first 2 chars uppercased) and company name shows in the card header AND the preview immediately.
- [ ] **3.** Enter Start 'Jan 2021' and End 'Present'
      **Expect:** Preview date reads exactly 'Jan 2021 – Present' (joined with ' – '; a single value shows alone with no dash).
- [ ] **4.** In the bullets textarea type three lines, prefixing them with '• ', '- ' and '* '
      **Expect:** Preview shows 3 clean bullets — leading bullet characters (•, ·, -, *) are stripped and blank lines dropped, live on each keystroke.
- [ ] **5.** Click '+ Add role' again, then × on the first card
      **Expect:** Second card appends below; × removes the targeted card and the preview drops that role.
- [ ] **6.** Footer
      **Expect:** '← Back' → Skills; 'Next: Education →' → Education.

  **Edge cases**
  - [ ] Company field cleared → Card initials fall back to '—'.
  - [ ] Card with no company/title/bullets → Preview's experience block hides entirely if NO experience has any content (hasExperience check).

  > ⚠️ Bullet textareas are uncontrolled; values are pushed back by _syncTextareas — check restored drafts populate them correctly.

### J-041 · Build — Education

**Account state:** In the build step  
**Start at:** Sidenav 🎓 Edu or 'Next: Education →'

- [ ] **1.** Click '+ Add education' and fill Degree 'Bachelor of Science', Field of Study, Institution, Years '2016 – 2020'
      **Expect:** Card header echoes degree + school; preview education block updates live.
- [ ] **2.** Click × on a card
      **Expect:** Entry removed from editor and preview.
- [ ] **3.** Check the footer
      **Expect:** '← Back' → Experience. Forward button is 'Next: Design →' in templates mode, but 'Next: AI Style →' if you entered via the AI flow (isAiMode).

  **Edge cases**
  - [ ] All education entries empty → Preview hides the education block (hasEducation requires degree or school on at least one entry).

### J-042 · Switch templates mid-edit — Design quick grid and topbar select (with premium gating)

**Account state:** Free/signed-out user mid-edit in the build step with data entered; currently on a free template  
**Start at:** Sidenav 🎨 Design, or the template <select> in the build topbar

- [ ] **1.** Open the Design section
      **Expect:** Header 'Design' with a 'Live' badge; hint 'Changes apply instantly to the preview and PDF export.' Three groups: Font Family grid (Inter, Helvetica, Georgia, Times NR, Poppins, Roboto, System), Font Size (S Small / M Medium / L Large), and a Template quick grid of all 10 named swatches. An extra 'AI Style' gold swatch appears ONLY after an AI theme has been generated (tokens present).
- [ ] **2.** Click the 'Nordic Clean' quick swatch (free)
      **Expect:** Preview restyles instantly; ALL entered data is retained; the active swatch highlights.
- [ ] **3.** Click the 'Graphite' quick swatch (premium) as a non-paid user
      **Expect:** PaymentModal opens ('Unlock all 10 templates' / 'Premium templates are included with any pass.', 2 cards: Placement Pro ₹2,999, Season Pass ₹1,499 pre-selected). Template does NOT change.
- [ ] **4.** Close the modal, then use the topbar template select to choose 'Executive'
      **Expect:** Same ladder modal; on re-render the select SNAPS BACK to the current template (its value is bound to templateStyle, which was never changed).
- [ ] **5.** Switch font family to Georgia and size to L
      **Expect:** Preview re-renders in Georgia at the large scale immediately (data-font / data-font-size attributes). Topbar S/M/L and Design-section S/M/L stay in sync (same state).
- [ ] **6.** Click 'Profile' / 'Skills' etc. in the topbar trail and the left sidenav
      **Expect:** Both navigate sections; active highlight follows in both places.

  **Edge cases**
  - [ ] Paid user clicks any premium swatch / select option → Applies instantly, no modal.
  - [ ] '✦ AI Generated' option in the topbar select → Only listed when an AI theme exists (aiGeneratedTokens or legacy CSS); selecting it never triggers the pass gate ('ai-generated' is exempt).
  - [ ] Template/font choices after a page reload → NOT persisted — only resume content (formData) is saved in rb-draft; template resets to the gallery default flow and fonts to Inter/medium.

  > ⚠️ Client-side gating only; a free user who force-sets a premium template via devtools would still hit the server's 402 PASS_REQUIRED on export.

### J-043 · Back-navigation between steps

**Account state:** Any user  
**Start at:** Each step's '← Back' button (topbar)

- [ ] **1.** Gallery → '← Back'
      **Expect:** Landing page.
- [ ] **2.** Method → '← Back'
      **Expect:** Gallery (previous tile still selected; CTA bar still visible).
- [ ] **3.** Build step — look for a Back-to-method button
      **Expect:** There is NONE in the build topbar — only the section trail, font/template controls, AI Review, Export PDF, Sign in/user pill. goBack() supports BUILD→METHOD (templates mode) / BUILD→AI-flow-step-2 (AI mode) but no rendered build-step element calls it.
- [ ] **4.** Press the browser Back button while in the build step
      **Expect:** Leaves the builder entirely and returns to the previous app view (usually the landing page) — builder-internal steps are NOT pushed to browser history (history state only tracks landing/builder/dashboard views in main.jsx).

  **Edge cases**
  - [ ] Browser Back exits builder mid-edit → No warning prompt; work survives only via the rb-draft auto-save (see draft journey).

  > ⚠️ Verify whether the missing in-build Back affordance is intentional — users can only leave build via browser Back.

### J-044 · Draft persistence across reload (rb-draft in localStorage)

**Account state:** Any user (works signed out — the draft is the ONLY protection for anonymous work)  
**Start at:** Build step with real data entered

- [ ] **1.** Type resume content, wait ~1 second
      **Expect:** formData auto-saves to localStorage key 'rb-draft' (debounced 400 ms after every render). Verify in devtools: Application → Local Storage → rb-draft contains your JSON.
- [ ] **2.** Hard-reload the page
      **Expect:** App restarts at the landing page (in-app builder navigation keeps URL at '/') or at the gallery if you loaded /builder directly. The builder mounts with formData restored from rb-draft (merged over defaults; one empty experience/education card is seeded if the draft had none).
- [ ] **3.** Verify restoration WITHOUT wiping it: open /builder?mode=jobmatch (or landing 'Optimize for a Job' CTA), then click 'Profile' in the left sidenav
      **Expect:** All previously entered fields, skills, experiences and education reappear, including the uncontrolled summary/bullet textareas. The live preview shows your restored resume.
- [ ] **4.** Alternative path: gallery → template → 'Build from Scratch'
      **Expect:** WARNING: this WIPES the draft (blank reset is auto-saved over rb-draft within ~0.5 s) with no confirmation. The 'Import Resume' path instead MERGES the parsed file over the draft.

  **Edge cases**
  - [ ] Corrupt JSON in rb-draft → Silently ignored; builder starts blank.
  - [ ] localStorage full / quota error during save → Save fails silently (try/catch); no user-facing error.
  - [ ] What is NOT persisted → currentStep, activeSection, selectedGalleryTemplate, templateStyle, fontFamily/fontSize, AI tokens/layout — all reset on reload. Only formData (profile/skills/experiences/education/certs/photo data-URL) survives.

  > ⚠️ Drafts are per-browser only — nothing is saved server-side, even for signed-in users. The photo is stored as a base64 data-URL inside rb-draft, so a large photo plus quota pressure is a realistic failure mode to try.

### J-045 · Calorie-calculator easter egg step (currently UNREACHABLE from the UI)

**Account state:** None reachable normally — dead code. Force entry via devtools/React internals (set currentStep='calorie-calc' on the ResumeBuilder instance, e.g. by calling its goToCalorieCalc()).  
**Start at:** No UI entry exists: goToCalorieCalc() is defined but never wired to any element; handleSelectMode has a 'calorie-calc' branch but nothing renders data-mode buttons; /builder?mode=calorie-calc falls into the else branch of componentDidMount and lands on the GALLERY

- [ ] **1.** Force currentStep to 'calorie-calc'
      **Expect:** Topbar disappears entirely (showTopbar is false for this step). Page header: 🍕 'Calorie Calculator' with badge 'AI-Powered' and a '← Back' button.
- [ ] **2.** View the upload panel
      **Expect:** Drop area: 'Upload a photo of your meal' / 'JPEG, PNG, HEIC — up to 10 MB' / 'Choose Photo' button. Tips card '💡 Tips for best accuracy' (photo from above, good lighting, full plate, estimates approximate).
- [ ] **3.** Upload a food photo and analyse
      **Expect:** Global overlay text reads 'Analysing your meal with GPT-4o...' (note: copy says GPT-4o; backend is /analyze-food on Railway). Results show per-item kcal, totals, protein/carbs/fat bars and a confidence chip.
- [ ] **4.** Click '← Back'
      **Expect:** BUG: nothing happens — goBack() has no CALORIE_CALC branch (only METHOD/GALLERY/AI_FLOW/BUILD), so the button is a no-op and the user is stranded without a reload.

  **Edge cases**
  - [ ] Visit /builder?mode=calorie-calc expecting the easter egg → Lands on the normal template gallery — only 'ai' and 'jobmatch' modes are special-cased in componentDidMount.

  > ⚠️ Recommend either deleting this step or wiring an entry + fixing goBack. File: /Users/rakshitsegwal/Documents/renonym-react/src/ResumeBuilder.jsx (STEPS.CALORIE_CALC line 20, goToCalorieCalc line 2364, dead handleSelectMode branch lines 871-879, render from line 4120; goBack without a calorie branch at lines 1132-1146).


---

## Builder AI Actions, Import & AI Design Studio

### J-046 · Import a PDF resume via the AI flow

**Account state:** Any state — signed out works. /extract-resume has NO auth gate and NO credit charge (backend mounts only api-secret + rate limiters + client-session on it; requireCredits is NOT mounted). Have a normal text-based PDF resume under 5 MB.  
**Start at:** https://renonym.com/builder?mode=ai (or LandingPage CTA wired to goToBuilder('ai')) — lands on AI flow Step 1 'Resume Details'

- [ ] **1.** Observe the Step 1 panel
      **Expect:** Topbar pill reads 'Step 1 of 2'. Panel title 'Start with your resume', sub 'Import your existing resume and let AI pre-fill your details, or build from scratch step by step.' Two cards: 'Import Resume' (tag 'PDF, DOC, DOCX') and 'Fill Manually' (tag 'Guided flow').
- [ ] **2.** Click 'Import Resume' and pick a .pdf under 5 MB
      **Expect:** Status banner 'Extracting text from file…' (pdf.js loads from CDN), then 'AI is parsing your resume…'. Inline spinner row 'Parsing your resume with AI…' shows while isParsingResume.
- [ ] **3.** Wait for the parse to finish (server runs gpt-4.1-mini extraction)
      **Expect:** Status 'Resume imported successfully! Review and adjust your details.' (success, auto-clears after 5 s). Because this is the AI flow, you land on Step 2 'Your Style' ('Step 2 of 2' pill), NOT the build editor.
- [ ] **4.** Check pre-filled data later in the Build editor
      **Expect:** Name/title/email/phone/location/linkedIn/summary, skills (max 20), certifications (max 8), experiences with MAX 4 bullets per role (server-enforced slice), education rows. AI prompt is pre-filled with 'Create the best modern ATS-friendly resume template for this imported resume. Keep it single-page, premium, elegant and compact.'

  **Edge cases**
  - [ ] Two-column PDF → Client splits text at 45% page width into LEFT/RIGHT column blocks before sending; sidebar skills/certs should still land in the right fields (prompt instructs the parser about interleaved columns).
  - [ ] Very long resume → Server truncates input text to 12,000 chars (truncateText) — content beyond that is silently dropped.
  - [ ] Re-selecting the same file after a failure → Works — the file input value is reset in finally, so onChange fires again.
  - [ ] Server 500 ('AI extraction failed') → Client status: 'Failed to parse resume. Please try again.'

  > ⚠️ Import path is free and anonymous by design — the credit ladder only gates /generate-template. Same handler is reused on the template-gallery Method screen (mode 'gallery' → 'Import Resume' card), which instead lands you in BUILD → Profile section.

### J-047 · Import a DOCX resume

**Account state:** Any state (signed out OK). A .docx resume under 5 MB.  
**Start at:** https://renonym.com/builder?mode=ai → Step 1 → 'Import Resume'

- [ ] **1.** Select a .docx file
      **Expect:** Status 'Extracting text from file…' — mammoth.js is lazy-loaded from CDN and extractRawText runs client-side.
- [ ] **2.** Wait for parse
      **Expect:** Same as PDF: 'AI is parsing your resume…' then 'Resume imported successfully! Review and adjust your details.' and AI flow advances to Step 2.

  **Edge cases**
  - [ ] Legacy .doc file (the card and file picker advertise 'PDF, DOC, DOCX' and accept='.pdf,.doc,.docx') → REJECTED: handler only allows pdf/docx/txt (mime allowlist + /\.(pdf|docx|txt)$/i name check). Error status: 'Please upload a PDF, DOCX, or TXT file. Images are not supported here.' — UI copy vs validation mismatch, worth confirming.
  - [ ] DOCX whose extracted text is under 10 chars (e.g. image-only document) → 'Could not extract text from this file. Try a different format.' — no server call made.

### J-048 · Import a TXT resume

**Account state:** Any state. A .txt resume under 5 MB.  
**Start at:** https://renonym.com/builder?mode=ai → Step 1 → 'Import Resume' (or /builder gallery → choose template → Method screen → 'Import Resume')

- [ ] **1.** Open the file picker
      **Expect:** CAVEAT: input accept='.pdf,.doc,.docx' does not include .txt — on most OS dialogs you must switch the filter to 'All Files' to select the .txt (or drag is unavailable; this is a plain hidden input).
- [ ] **2.** Force-select the .txt file
      **Expect:** Code path accepts it (text/plain is in the allowlist and .txt passes the name regex). FileReader.readAsText runs, then 'AI is parsing your resume…' → 'Resume imported successfully! Review and adjust your details.'

  **Edge cases**
  - [ ] TXT with fewer than 10 characters → 'Could not extract text from this file. Try a different format.'

  > ⚠️ TXT is supported by validation but effectively hidden by the picker filter — decide whether to add .txt to accept or drop it from the allowlist.

### J-049 · Import an unreadable / corrupt file

**Account state:** Any state. Prepare: (a) a corrupt/truncated PDF, (b) a scanned image-only PDF with no text layer, (c) a JPG renamed to .pdf.  
**Start at:** https://renonym.com/builder?mode=ai → Step 1 → 'Import Resume'

- [ ] **1.** Upload the corrupt PDF (or the renamed JPG)
      **Expect:** pdf.js getDocument throws → caught → status (error kind): 'Failed to parse resume. Please try again.' isParsingResume spinner clears; you stay on Step 1.
- [ ] **2.** Upload the scanned image-only PDF
      **Expect:** Text extraction succeeds but yields <10 chars → 'Could not extract text from this file. Try a different format.' No /extract-resume call, nothing charged.
- [ ] **3.** Upload an actual image (e.g. .png) without renaming
      **Expect:** Type check fails first: 'Please upload a PDF, DOCX, or TXT file. Images are not supported here.'

  **Edge cases**
  - [ ] /extract-resume takes longer than 90 s (apiFetch timeout 90000 ms aborts) → AbortError branch shows the friendly copy: 'The AI took too long to parse that résumé — please try again (it usually works on the second attempt).'
  - [ ] Rate limited (HTTP 429: >20 AI calls/IP/15 min or >15 calls per x-client-id/15 min) → Status: 'Too many AI requests. Please wait a few minutes.'

  > ⚠️ All status banners auto-clear after 5 seconds (_setStatus timer) — watch quickly.

### J-050 · Import an oversized file (>5 MB)

**Account state:** Any state. A valid .pdf or .docx larger than 5 MB (5 * 1024 * 1024 bytes).  
**Start at:** https://renonym.com/builder?mode=ai → Step 1 → 'Import Resume'

- [ ] **1.** Select the >5 MB file
      **Expect:** Immediate error status 'Resume file must be under 5 MB.' — no extraction starts, no network call.
- [ ] **2.** Re-open the picker and select a valid smaller file
      **Expect:** Normal import proceeds (input was reset, so the same dialog works again).

  **Edge cases**
  - [ ] Oversized INSPIRATION file in the AI style step (also 5 MB cap) → 'Inspiration file must be under 5 MB.'

  > ⚠️ Size check runs after the type check, so a 6 MB .png shows the type error, not the size error.

### J-051 · AI Design Studio — describe a style prompt, theme applied as tokens on a hardcoded layout

**Account state:** Signed in, free account with ≥1 credit (new accounts get +2 on signup — flag-guarded grantSignupCredits, granted once on account creation via Google/magic-link; client toast on first sign-in: 'Welcome! New accounts start with 2 free AI credits.')  
**Start at:** https://renonym.com/builder?mode=ai → Step 1 → import a resume or 'Fill Manually' → Step 2 'How do you want to style it?'

- [ ] **1.** On Step 2 pick the 'Describe in words' card ('Tell AI exactly what style you want')
      **Expect:** A textarea appears (placeholder 'e.g. Minimal Apple-style resume with generous whitespace, elegant sans-serif typography, subtle grey accent lines...') plus 'Try an example' chips: Apple Minimal, Dark Tech, Consulting, Google PM, Creative Director, Netflix BnW.
- [ ] **2.** Click a chip or type a prompt
      **Expect:** Generate button label changes to '✦ Generate with my description' (empty prompt: '✦ Generate resume').
- [ ] **3.** Click Generate while SIGNED OUT (to verify the gate)
      **Expect:** _requireLogin fires: AuthModal opens (reason 'feature'); NO API call is made. Server independently enforces this — direct call without Bearer token returns 401 {error:'Please sign in to use this feature.', code:'AUTH_REQUIRED'}.
- [ ] **4.** Sign in, click Generate
      **Expect:** Status 'Generating AI theme…' (45 s client timeout for prompt-only). You are moved to the Build editor (AI section) regardless of outcome (_launchAiBuild always lands in BUILD → AI).
- [ ] **5.** Wait for success
      **Expect:** Status 'AI theme applied! 🎨'. Server returned {tokens, layout, fallback:false}: layout is one of two-col | single | top-banner | asymmetric (hardcoded React layouts — AI never authors CSS); tokens are 15 hex colours + 2 whitelisted fonts (Inter/Helvetica/Georgia/Times New Roman/Poppins/Roboto/system-ui), server-sanitized to ≥4.5:1 WCAG AA contrast. Preview recolours; templateStyle becomes 'ai-generated'; an 'AI Style' gold swatch appears in the Design tab's Template grid.
- [ ] **6.** Verify the credit debit
      **Expect:** Exactly 1 credit gone — check the Dashboard sidebar pill '⚡ N credits'. Backend debits in res.on('finish') ONLY for 2xx responses AND only when res.locals.aiFallback is false; ledger reason 'spend:/generate-template'.

  **Edge cases**
  - [ ] Empty prompt and no inspiration image → Error status 'Please describe your ideal style — or pick one of the examples above.' — no API call, no charge.
  - [ ] AI hiccup server-side (token model call fails) → Server NEVER 500s the theming path: returns default Salesforce-navy tokens (#032d60 header) with fallback:true. Client status: 'The AI couldn't build a custom theme this time — a clean default was applied. Try again in a moment.' NOT charged (aiFallback skips both credit debit and legacy quota increment).
  - [ ] 429 rate limit → 'Too many AI requests. Please wait a few minutes.' Not charged.
  - [ ] 45 s client timeout (AbortError) or network error → Generic copy 'AI generation failed. Check your connection and try again.' — note: no timeout-specific message on this path, and the request may still complete server-side and charge a credit (debit happens on server finish). Flag if observed.
  - [ ] Season Pass / Placement Pro / legacy pro / Coach Unlimited user generates → requireCredits bypassed entirely (hasActivePass || plan==='pro' || coach unlimited) — unlimited generations, balance untouched.
  - [ ] Back button on Step 2 ('← Back') → Returns to Step 1 and clears the style-method choice; Back on Step 1 exits to the template gallery.

  > ⚠️ Token application is inline CSS vars (--rn-*) on the .rb-resume--ai-tokens root — server-side PDF export of AI styles is always allowed (the rb-resume--ai-(tokens|generated) marker bypasses the premium-template PASS_REQUIRED gate, since generating already cost a credit). If Railway has no DB configured (dev), requireCredits/auth quota fail OPEN.

### J-052 · Reference-image (inspiration) based generation

**Account state:** Signed in with ≥1 credit. Have: a PNG/JPG screenshot of a resume design, a designed PDF, a .webp image, and a .docx.  
**Start at:** https://renonym.com/builder?mode=ai → Step 2 → 'Upload Reference Resume' card ('Copy layout, typography and visual style')

- [ ] **1.** Pick the 'Upload Reference Resume' card
      **Expect:** Info note: 'AI extracts visual style only — layout, typography, colours, spacing. Your content and the inspiration content are never mixed.' Dropzone: 'Drop a file or click to browse' / 'AI extracts layout, colours, typography — not content' with type pills PDF, PNG, JPG, DOCX. Switching to this card CLEARS any typed prompt (and switching back to 'Describe in words' clears the uploaded inspiration).
- [ ] **2.** Upload a PNG/JPG
      **Expect:** Image is downscaled client-side to ≤1600 px JPEG (so the vision payload stays under the server's 7.2 M base64 gate). Status 'Inspiration file ready ✓'. Preview chip shows filename + '✓ Style will be extracted by AI' with an × remove button.
- [ ] **3.** Upload a PDF instead
      **Expect:** Status 'Reading your PDF reference…' — page 1 is rasterized to PNG locally (vision can't read PDFs), then 'Inspiration file ready ✓'.
- [ ] **4.** Click Generate with image only (no prompt)
      **Expect:** Allowed — client auto-fills the prompt 'Create a professional resume style inspired by the uploaded reference. Match its color palette, typography, and overall aesthetic.' Button label was '✦ Generate from inspiration' (with prompt too: '✦ Generate with description + inspiration'). Status: 'Analysing inspiration image… (up to 60s)'; client timeout is 90 s for inspiration runs.
- [ ] **5.** Wait for success
      **Expect:** Server runs gpt-4o vision to extract style signals, classifies one of the 4 layouts, then generates tokens. 'AI theme applied! 🎨', 1 credit debited on success only.

  **Edge cases**
  - [ ] .webp selected (the accept attr '.pdf,.png,.jpg,.jpeg,.webp' allows it!) → Handler allowlist lacks image/webp... actually isImage is true but allowedTypes check rejects it → 'Please upload a PNG, JPG, or PDF file as inspiration.' Accept-attr vs validation mismatch — verify and decide.
  - [ ] .docx uploaded as inspiration (pill shows DOCX) → Honest rejection: 'DOCX can't be used as visual inspiration — upload a PNG/JPG screenshot or a PDF instead.'
  - [ ] Corrupt/unreadable image or PDF → 'Could not read that file — try a PNG or JPG screenshot of the design instead.'
  - [ ] >5 MB inspiration file → 'Inspiration file must be under 5 MB.'
  - [ ] Vision step fails server-side → Non-fatal: theme still generated from the prompt alone (no error surfaced; layout may default to two-col).
  - [ ] 90 s client timeout (AbortError) → 'AI generation failed. Check your connection and try again.' — generic message; server may still finish and debit.

  > ⚠️ Server only accepts inspiration when mime starts with image/ or is application/pdf AND base64 length < 7,200,000; the client downscale exists precisely so big phone photos aren't silently dropped server-side.

### J-053 · Regenerating the AI theme from the Build editor

**Account state:** Signed in, ≥2 credits, an AI theme already applied (from the previous journey).  
**Start at:** Build editor → left sidebar → AI section (badge '✦ AI', hint 'Describe your ideal resume style in plain English.')

- [ ] **1.** Edit the prompt (or click another example chip — same 6 chips as the flow) and click '✦ Generate AI Resume Style'
      **Expect:** Status 'Generating AI theme…' (or 'Analysing inspiration image… (up to 60s)' if an inspiration file is still held in state from the flow — it persists!). On success 'AI theme applied! 🎨' and the preview recolours/changes layout.
- [ ] **2.** Verify another 1-credit debit
      **Expect:** Every successful non-fallback regenerate costs 1 credit (no caching/dedupe). Dashboard pill drops by 1 after refresh.
- [ ] **3.** Switch to a gallery template via Design tab, then click the 'AI Style' swatch
      **Expect:** Previous tokens/layout re-apply instantly with NO new API call and NO charge (tokens are stored client-side in aiGeneratedTokens/aiGeneratedLayout).

  **Edge cases**
  - [ ] Regenerate result is fallback:true → Default theme replaces your custom one with copy 'The AI couldn't build a custom theme this time — a clean default was applied. Try again in a moment.' — and the PREVIOUS custom tokens are overwritten (lost). Not charged. Worth confirming whether overwriting is acceptable.
  - [ ] Response missing both tokens and layout → Client throws 'Invalid response from server' → 'AI generation failed. Check your connection and try again.'

  > ⚠️ aiGeneratedCss is legacy and always emptied on new generations; an old #rp-ai-template-style tag is removed if present.

### J-054 · 0-credit user hits 402 CREDITS_REQUIRED → ladder modal

**Account state:** Signed in FREE user with 0 credit balance, no active pass, plan != 'pro', no Coach Unlimited. (Burn the 2 signup credits first, or use a stale account — note boost credits expire after 6 months via lazy expiry sweep.)  
**Start at:** Build editor → AI section → '✦ Generate AI Resume Style' (or AI flow Step 2 → Generate)

- [ ] **1.** Click Generate
      **Expect:** Backend requireCredits(1) returns 402 {error: "You're out of credits — this needs 1.", code:'CREDITS_REQUIRED', balance:0, needed:1, actionsUsed:N} BEFORE any AI runs — nothing generated, nothing charged.
- [ ] **2.** Observe the client
      **Expect:** _isGated opens the ladder PaymentModal (reason 'credits'). Title: "You're out of credits". Sub: 'Top up, or go unlimited for the whole season.' Gold nudge card: "You've used N AI actions. Candidates who land interviews tailor their résumé 15+ times." (N = actionsUsed from the 402 body — count of spend:* ledger rows).
- [ ] **3.** Review the 3 plan cards
      **Expect:** Placement Pro ₹2,999 / 90 days (25 full interviews, Unlimited AI actions, All 10 templates, Priority support); Season Pass ₹1,499 / 90 days — PRE-SELECTED with 'MOST POPULAR' badge (6 full interviews, Unlimited AI actions, All 10 templates, Full scored reports); Boost Pack ₹299 one-time (+10 credits, Tailoring/AI review/AI styles, Valid 6 months). CTA button: 'Get Season Pass — ₹1,499' (changes with selection). Footer: 'One-time payment via Razorpay (card / UPI / netbanking). Need just one interview? Single Interview ₹499 is available at interview setup.'
- [ ] **4.** Cancel the Razorpay checkout
      **Expect:** Modal stays usable, no error shown for CANCELLED (error only for real failures: 'Payment failed — try again.'), busy state clears.
- [ ] **5.** Buy Boost Pack ₹299 and retry Generate
      **Expect:** On verify: +10 credits granted (replay-protected, expires in 6 months). Modal closes via onSuccess → builder toast 'Purchase active — you're all set.' and user refresh; Generate now succeeds and debits 1 (balance 10→9).

  **Edge cases**
  - [ ] Two parallel generates racing the last credit → Conditional debit (WHERE credit_balance >= 1): the loser is delivered uncharged with server log '[credits] raced to zero' — never negative balance, no user-facing error.
  - [ ] 402 with legacy codes (QUOTA_EXCEEDED / PRO_REQUIRED) from older deploys → Client falls back to the old CreditGateModal instead of the ladder ('See plans — from ₹299' option).
  - [ ] Clicking Pay while signed out inside the modal → Nested AuthModal (reason 'payment') opens; after auth, payment proceeds automatically.

  > ⚠️ Enforcement is fully server-side (requirePremiumAuth + requireCredits(1) mounted on /generate-template, /review-resume, /improve-summary, /optimize-for-job). The old FREE_DAILY_QUOTA (env, default 2/day) middleware still exists in code but is NOT mounted on these routes — retired by the v14 ladder. If the server has no DB (db falsy), all gates fail open (dev-only).

### J-055 · Long-running parse — 90 s timeout friendly message

**Account state:** Any state. Best simulated with a very large/dense text resume, or by throttling the network (DevTools) so /extract-resume exceeds 90 s.  
**Start at:** https://renonym.com/builder?mode=ai → Step 1 → 'Import Resume'

- [ ] **1.** Upload the resume and let the request exceed 90 s
      **Expect:** apiFetch's AbortController fires at 90,000 ms; fetch rejects with AbortError.
- [ ] **2.** Observe the status banner
      **Expect:** Exact friendly copy: 'The AI took too long to parse that résumé — please try again (it usually works on the second attempt).' (error kind, auto-clears in 5 s). Spinner stops; file input resets so the same file can be retried immediately.
- [ ] **3.** Retry the same file
      **Expect:** Usually succeeds (per the message); on success the normal import flow continues to Step 2.

  **Edge cases**
  - [ ] Same timeout on /generate-template (45 s prompt-only / 90 s with inspiration) → Different, generic copy: 'AI generation failed. Check your connection and try again.' — the parse-specific friendly message exists ONLY on the import path.
  - [ ] Other apiFetch calls → Default timeout is 30 s; only extract-resume (90 s) and generate-template (45/90 s) get extended budgets.

  > ⚠️ Client aborting does not cancel the server-side work; for generate-template a post-abort server success could still debit a credit on finish. Import is uncharged either way.

### J-056 · Improve with AI — summary rewrite (success path)

**Account state:** Signed in as a free user with at least 1 AI credit remaining (new accounts get exactly +2 credits on signup, granted once via the signup hook; balance is NOT shown in the UserPill, so track spends manually). Resume builder draft has a Full Name and/or some Summary text.  
**Start at:** https://renonym.com/builder → pick a free template (Classic Pro, Minimal ATS, or Nordic Clean) → 'Use this template →' → on 'How would you like to start?' choose 'Build from Scratch' → lands in Build step, Profile section

- [ ] **1.** In the Profile section, type a name in 'Full Name' and a rough draft in the 'Professional Summary' textarea (e.g. 'I do salesforce stuff for 5 years').
      **Expect:** Live preview on the right updates as you type.
- [ ] **2.** Click the small '✦ Improve with AI' button (class rp-ai-inline-btn) on the right side of the 'Professional Summary' label row.
      **Expect:** Blue info toast appears at the top of the editor column: 'AI is improving your summary…' (rp-status--info). Toasts auto-dismiss after 5 seconds.
- [ ] **3.** Wait for the call to /improve-summary to finish (model gpt-4.1, max 200 tokens, so typically a few seconds; client timeout is 90s).
      **Expect:** The Summary textarea content is REPLACED in place with the AI text (3-4 sentences; server prompt forbids clichés like 'results-driven', 'passionate', 'dynamic', 'team player', 'go-getter'). Green success toast: 'Summary improved! ✦'. Live preview shows the new summary. Note: the textarea is uncontrolled and synced by _syncTextareas — verify the visible textarea text actually changed, not just the preview.
- [ ] **4.** Verify the 1-credit debit: repeat the action until credits run out (a new account has 2). On the 3rd output-improving AI action (improve-summary / AI style / AI review / optimize-for-job all share the same credit pool).
      **Expect:** HTTP 402 with code CREDITS_REQUIRED → the purchase ladder modal (PaymentModal) opens — see edge cases for exact copy. This confirms each successful call debited exactly 1 credit (ledger reason 'spend:/improve-summary'). Debit happens only on 2xx responses; failed calls must not consume a credit.

  **Edge cases**
  - [ ] Both Full Name AND Summary are empty when clicking '✦ Improve with AI' (any sign-in state). → Red error toast: 'Add your name and some summary text first.' No network call, no auth modal. NOTE the guard is && — filling EITHER field alone (e.g. only a name, empty summary) bypasses this guard and the request goes through; verify whether that is intended.
  - [ ] Signed out, name/summary filled, click '✦ Improve with AI'. → No request fires; AuthModal opens with heading 'Sign in to continue' and sub 'Sign in to save your work and access all features.' (reason 'feature'). After signing in, the modal closes but the improve action is NOT auto-retried (handleAuthSuccess only re-runs 'export' and 'jobmatch') — the user must click the button again.
  - [ ] Stale/expired JWT in localStorage (rn-auth-token) — server returns 401 ('Please sign in to use this feature.' or 'Session expired. Please sign in again.', code AUTH_REQUIRED). → _isGated catches the 401: AuthModal opens (reason 'feature' → 'Sign in to continue') and the 'AI is improving your summary…' toast is cleared immediately (status set to empty).
  - [ ] Free user with 0 credits (server 402, code CREDITS_REQUIRED, body error "You're out of credits — this needs 1." with balance/needed/actionsUsed). → Purchase ladder modal opens: title "You're out of credits", sub 'Top up, or go unlimited for the whole season.', gold callout "You've used N AI action(s). Candidates who land interviews tailor their résumé 15+ times." (N = actionsUsed from server), 3 plan cards: Placement Pro ₹2,999 / 90 days, Season Pass ₹1,499 / 90 days, Boost Pack ₹299 one-time (+10 credits, valid 6 months). CTA reads 'Get {plan} — {price}'. Footer mentions 'Single Interview ₹499'. The in-progress toast is cleared. Closing the modal returns to the builder unchanged.
  - [ ] Season Pass / Placement Pro / legacy pro / unexpired Coach Unlimited holder with 0 credits. → No 402: requireCredits bypasses entirely for hasActivePass(u) || plan==='pro' || coachAccess.unlimited. Summary improves and nothing is debited.
  - [ ] Rate limited: >20 AI calls per IP per 15 min (aiLimiter) or >15 per clientId per 15 min (perClientIdLimiter). Note these limiters run BEFORE auth, so even unauthenticated spam counts. → Server returns 429; client shows red toast 'Too many AI requests. Please wait a few minutes.' No credit consumed.
  - [ ] Server/OpenAI failure (backend responds 500 {error:'Summary improvement failed'}) or network drop or 90-second timeout (apiFetch AbortController, timeoutMs=90000). → Red toast: 'AI summary generation failed. Check server connection.' Existing summary text untouched. No credit debit (debit only fires on 2xx via res.on('finish')).
  - [ ] Boost Pack credits past their 6-month expiry (expires_at on the grant ledger row). → expireStaleCredits runs lazily before the balance check — leftover expired credits are forfeited with a compensating 'expiry' ledger entry, so the user may hit the CREDITS_REQUIRED ladder even though they 'had' credits.

  > ⚠️ Server middleware chain on /improve-summary: validateApiSecret → aiLimiter → validateClientSession → perClientIdLimiter → requirePremiumAuth → requireCredits(1) ('was reachable anonymously — closed' per server comment). Gating fail-opens if the DB is down or unconfigured (dev mode without db: no auth-credit enforcement beyond JWT check). The frontend toast lives inside the build-step editor column only. Mobile: the '✦ Improve with AI' button is NOT hidden on mobile (it is rp-ai-inline-btn, not a topbar ghost button) — it should remain usable at <=760px.

### J-057 · AI Review — full-resume critique modal (/review-resume)

**Account state:** Signed in as a free user with at least 1 AI credit; builder in Build step with some resume content filled (no client-side content guard exists — it will run even on an empty form). Test on a desktop viewport >760px wide first.  
**Start at:** https://renonym.com/builder → free template → 'Use this template →' → 'Build from Scratch' → Build step. The 'AI Review' button is a ghost button (.rp-btn--ghost) in the top bar's right action cluster, between the template dropdown and the 'Export PDF' primary button.

- [ ] **1.** Click the 'AI Review' ghost button in the topbar.
      **Expect:** Blue info toast in the editor column: 'Analysing your resume…'. POST /review-resume sends the whole formData.
- [ ] **2.** Wait for the response (gpt-4.1, max 400 tokens; client timeout 90s).
      **Expect:** A full-screen modal opens (rp-review-modal-bg backdrop + rp-review-modal card): badge '✦ AI Review', heading 'Resume Analysis', sub 'Here is what AI found about your resume.', body is a single paragraph of feedback text (server prompt asks for: overall score /10, top 3 strengths, top 3 improvements, 2-3 ATS tips, 1 key recommendation, under 250 words). Green toast behind the modal: 'Review complete.'
- [ ] **3.** Close the modal three ways: (a) click the '×' button top-right, (b) click 'Got it' in the footer, (c) click the dark backdrop outside the card.
      **Expect:** All three close the modal (closeAnalysisModal sets showAnalysisModal=false). Clicking INSIDE the modal card does NOT close it (stopPropagation). Builder state is unchanged underneath.
- [ ] **4.** Verify the 1-credit debit by exhausting credits: with a fresh 2-credit account, run AI Review (or any mix of improve-summary/AI style) until the 3rd action.
      **Expect:** Purchase ladder modal opens with title "You're out of credits" (402 CREDITS_REQUIRED) — confirms each successful review debited 1 credit (ledger reason 'spend:/review-resume').
- [ ] **5.** MOBILE CHECK: narrow the browser to <=760px (or open on a phone) while in Build step and look for the AI Review button.
      **Expect:** The button DISAPPEARS: app.css @media (max-width: 760px) rule '.rp-topbar__actions .rp-btn--ghost { display: none; }' hides it, and there is no alternate entry point to AI Review anywhere else in the UI. The feature is therefore completely unreachable on mobile. DECISION NEEDED: given the mobile-first launch requirement, assert whether hiding AI Review on mobile is intended; if not, this is a bug to fix (e.g. move it into the section editor or a mobile menu).

  **Edge cases**
  - [ ] Signed out, click 'AI Review'. → No request; AuthModal opens with 'Sign in to continue' / 'Sign in to save your work and access all features.' (reason 'feature'). After sign-in the review is NOT auto-retried — user must click again. New-account sign-ins should land with 2 signup credits (granted once, flag-guarded).
  - [ ] Expired session token → server 401 AUTH_REQUIRED. → AuthModal opens (reason 'feature'). NOTE a small inconsistency vs improve-summary: handleResumeAnalysis does NOT clear the status toast on gate, so 'Analysing your resume…' lingers up to 5s behind the auth modal.
  - [ ] 0 credits (free user) → 402 {code:'CREDITS_REQUIRED', error:"You're out of credits — this needs 1."}. → Ladder modal: "You're out of credits" / 'Top up, or go unlimited for the whole season.' / actionsUsed callout / Placement Pro ₹2,999, Season Pass ₹1,499, Boost Pack ₹299 cards. No feedback modal, no debit.
  - [ ] Pass/pro/Coach-Unlimited holder with 0 credits. → Review succeeds, nothing debited (requireCredits bypass).
  - [ ] 429 from aiLimiter (20/IP/15min) or perClientIdLimiter (15/clientId/15min). → Red toast 'Too many AI requests. Please wait a few minutes.' No modal, no debit.
  - [ ] Server 500 ({error:'Resume review failed'}), network failure, or 90s AbortController timeout. → Red toast: 'Resume analysis failed.' No modal opens; no credit debit (2xx-only debit).
  - [ ] Completely empty resume form. → No client-side guard (unlike Improve with AI) — the request still fires, costs 1 credit, and the modal shows feedback about an empty resume (server prompt receives 'N/A' / 0-counts). Assert whether burning a credit on an empty form is acceptable.
  - [ ] Run review after a successful payment from the ladder. → On Razorpay success the ladder closes, user entitlements refresh (_refreshUser) and green toast shows: "Purchase active — you're all set." Re-clicking 'AI Review' should now succeed.

  > ⚠️ Server chain identical to improve-summary: validateApiSecret → aiLimiter → validateClientSession → perClientIdLimiter → requirePremiumAuth → requireCredits(1); debit only on 2xx via res.on('finish'); fail-open if DB unavailable. Key file refs: button src/ResumeBuilder.jsx:2886, handler :1676, modal :2721-2740, gate helpers _requireLogin :2462 / _isGated :2471; CSS hide rule src/app.css:1684 inside @media (max-width:760px) at :1674 (an earlier breakpoint at ~:1671 also hides .rp-topbar__center step nav). Backend: server.js /review-resume :1532, gating :594. The same 760px rule also hides the other topbar ghost buttons ('← Back' on gallery/AI-flow/method screens) — check those too while testing mobile.


---

## Job Match & Optimize for Job

### J-058 · Anonymous JD-match teaser (locked report)

**Account state:** Signed out (no rn-auth-token in localStorage). No resume draft needed — will upload one in-flow.  
**Start at:** renonym.com landing page → 'Job-match optimizer' button (outline button in the resume section) → builder opens directly on the Job Match section (initialMode 'jobmatch' → STEPS.BUILD + SECTIONS.JOB_MATCH, gallery is skipped)

- [ ] **1.** Look at the Job Match screen before doing anything
      **Expect:** Step 1 'Your Resume' shows the upload dropzone ('Upload your resume' / 'Drop a file or click to browse — PDF, DOCX or DOC') unless a builder draft exists (then green state 'Profile data loaded — ready to analyse' with an 'Upload different' link). Step 2 'Job Description' textarea has placeholder 'Paste the full job description here...'. Right panel shows the empty state: 'See exactly what to change' with 3 steps and feature chips (ATS Score, JD Match %, Missing Keywords, Specific Fixes, AI Rewrite). 'Analyse Match →' button is disabled.
- [ ] **2.** Upload a PDF/DOCX resume
      **Expect:** Spinner state 'AI is reading and parsing your resume...' then green check state showing the filename and 'Profile & preview updated', with an × remove button. Uploading also populates the builder profile/preview.
- [ ] **3.** Paste a JD shorter than ~50 chars
      **Expect:** Hint under textarea reads 'Paste at least 50 characters'; button stays disabled with validation hint 'Paste a job description (min 50 characters)'. (Frontend requires trim length > 50, i.e. 51+; backend min is 30.)
- [ ] **4.** Paste a full JD (51+ chars) and click 'Analyse Match →'
      **Expect:** Button shows spinner + 'Analysing...'; status 'Analysing job match...'; right panel shows 'Analysing your resume against the JD...' / 'Scoring ATS compatibility, keyword overlap, and skill gaps'. Request goes to /analyze-job-match WITHOUT Authorization header → optionalAuth leaves req.user unset → server returns ONLY { atsScore, jdMatch, missingKeywords (max 3), locked: true }.
- [ ] **5.** Inspect the teaser result
      **Expect:** Exactly TWO score rings render — 'ATS Score' and 'JD Match' (conic rings via jmAtsRingStyle/jmJdMatchRingStyle) — no Keywords or Skills rings. Below: amber group 'Top missing keywords' with at most 3 keyword tags. Then the signup card: bold 'That's the teaser — the full report is free.' and body 'Sign up to see every missing keyword and skill, your strengths and weaknesses, and line-by-line fix suggestions — plus 2 free AI credits to act on them.' with primary button 'Sign up free — see the full report'. Status banner shows 'Analysis complete!'.

  **Edge cases**
  - [ ] Click Analyse with resume parsed but JD field then cleared → Clearing the textarea resets jobMatchResult/optimizedResume; guard message 'Paste a job description (at least 50 characters).' if forced
  - [ ] JD over 6000 chars → Server 400; status shows 'Job description is too long. Please paste a maximum of 6000 characters.'
  - [ ] Pasted resumeText over 10000 chars (huge upload) → Server 400: 'Resume text is too long. Maximum 10000 characters accepted.'
  - [ ] Resume effectively empty (<20 chars after build) → Server 400: 'Resume is empty. Please upload a resume or fill in the builder first.'
  - [ ] More than 20 AI calls per IP in 15 min (or 15 per clientId) → 429 → status 'Too many requests. Please wait a minute.' (server message is 'Too many AI requests. Please try again in 15 minutes.')
  - [ ] Network drop / request exceeds the 60s AbortController timeout → Status 'Analysis failed. Check your connection and try again.' (error kind)
  - [ ] Signed-in user whose JWT has EXPIRED runs analysis → optionalAuth never rejects — expired token is treated as anonymous, so the user silently gets the locked teaser + signup card despite appearing signed in (known quirk, no 401)

  > ⚠️ Teaser shaping is server-side (server.js ~line 1755: anonymous response is sliced to top-3 keywords + locked:true), so devtools can't unlock it. x-api-secret must match RENONYM_API_SECRET or every call 401s ('Unauthorised.'). If the server has no DATABASE_URL, credit/auth gates fail open.

### J-059 · Sign up from the teaser → welcome toast + auto re-run of FULL analysis

**Account state:** Anonymous user currently viewing the locked teaser (previous journey, step 5). Use a Google account / email with NO existing Renonym account to verify the 2-credit grant.  
**Start at:** Teaser card → 'Sign up free — see the full report' (sets authReason='jobmatch' and opens AuthModal)

- [ ] **1.** Click 'Sign up free — see the full report'
      **Expect:** Auth modal opens titled 'Sign in to continue' with sub 'Sign in to save your work and access all features.', offering 'Continue with Google' (popup + polling) and magic-link email fallback.
- [ ] **2.** Complete Google sign-in in the popup
      **Expect:** Modal closes; token+user written to localStorage (rn-auth-token / rn-auth-user). Because authReason==='jobmatch': status banner shows 'Welcome! New accounts start with 2 free AI credits.' (success), then the app calls /auth/me to refresh entitlements and AUTOMATICALLY re-runs the analysis — no extra click.
- [ ] **3.** Wait for the re-run to finish
      **Expect:** Full (unlocked) report replaces the teaser: FOUR rings (ATS Score, JD Match, Keywords, Skills) plus groups 'What you are doing right', 'Changes needed', 'Missing keywords' (hint: 'These keywords appear in the JD but not in your resume.'), 'Skills gap', 'Fix your summary', 'Fix your experience bullets', and the AI CTA card.
- [ ] **4.** Check the credit balance (Dashboard credit pill or /auth/me)
      **Expect:** Brand-new account has 2 credits (server grants +2 exactly once via grantSignupCredits, flag-guarded by signup_credits_granted; ledger reason 'signup'). The full JD-match analysis itself did NOT debit anything — /analyze-job-match has no requireCredits.

  **Edge cases**
  - [ ] Sign in with an EXISTING account from the teaser → Toast still says 'Welcome! New accounts start with 2 free AI credits.' (copy is unconditional in handleAuthSuccess), but no credits are granted server-side — balance stays whatever it was
  - [ ] Sign-in popup left open >5 minutes → Polling auto-stops after 5 min; user must retry
  - [ ] Auth flow retried / double-fires → Grant is idempotent — signup_credits_granted flag prevents a second +2

  > ⚠️ Grant fires at account creation inside the OAuth/magic-link callbacks (server.js lines 2005/2061/2139 — only when upsertUser returns created:true), NOT on /auth/me. The auto re-run happens in ResumeBuilder.handleAuthSuccess (line ~1725): _refreshUser().then(() => handleAnalyzeJobMatch()).

### J-060 · Signed-in full analysis (free — no credit debit)

**Account state:** Signed-in free user (any credit balance, including 0 — analysis is free for signed-in users by design).  
**Start at:** Dashboard left nav 'Job Match' (or quick action 'Job match — Score your résumé vs a JD') → builder Job Match section; or builder sidenav 'Job Match' tab

- [ ] **1.** With a builder resume or uploaded file ready, paste a 51+ char JD and click 'Analyse Match →'
      **Expect:** Request carries Authorization: Bearer <jwt>; server returns the FULL JSON (atsScore, jdMatch, keywordCoverage, skillsCoverage all clamped 0-100, plus up to 8 missingKeywords, 6 missingSkills, 3-4 strengths, 3-5 weaknesses, 2-3 summarySuggestions, 2-3 experienceSuggestions). No 'locked' flag.
- [ ] **2.** Verify all result sections render
      **Expect:** 4 rings; green group 'What you are doing right' with count badge; red group 'Changes needed'; amber 'Missing keywords' and 'Skills gap' tag grids; blue 'Fix your summary' (cards tagged 'Action') and 'Fix your experience bullets' (cards tagged 'Rewrite'); bottom CTA card 'Let AI fix it all for you' / 'AI rewrites your summary and bullets to naturally incorporate all missing keywords — without inventing anything.' with '✦ Optimize Resume' button.
- [ ] **3.** Check credits before vs after
      **Expect:** Identical — /analyze-job-match is mounted with optionalAuth only (server.js line 597 comment: 'JD match stays free for signed-in users'). No ledger row.
- [ ] **4.** If Skills ring reads 0
      **Expect:** Hint 'Add skills to profile' shows under the Skills ring (jmSkillsIsZero)

  **Edge cases**
  - [ ] AI returns malformed JSON → Server 500 'Failed to parse AI response.' → frontend shows that error text in the status banner
  - [ ] Generic server failure → 500 'Job match analysis failed. Please try again.' surfaced verbatim
  - [ ] Re-running analysis clears previous state → jobMatchResult and optimizedResume are nulled at the start of every run — old report disappears while loading
  - [ ] Remove uploaded resume via × → jmResumeText/fileName/jobMatchResult reset; dropzone returns (unless builder draft still satisfies jmResumeReady)

  > ⚠️ Structured formData is preferred over raw resumeText when the builder has fullName/summary/experiences — both are sent when available. Backend model: gpt-4.1-mini, temperature 0.2.

### J-061 · Optimize for Job → review modal → Apply to Resume (1 credit)

**Account state:** Signed-in free user with ≥1 credit AND a completed full analysis on screen (previous journey). Note their exact credit balance first.  
**Start at:** Bottom of the full report → '✦ Optimize Resume' button in the 'Let AI fix it all for you' card

- [ ] **1.** Click '✦ Optimize Resume'
      **Expect:** Button shows 'Optimising...' with spinner; status 'Optimising for this role...'. POST /optimize-for-job (90s timeout) passes requirePremiumAuth + requireCredits(1).
- [ ] **2.** Wait for completion
      **Expect:** Status 'Done — review the changes.'; modal opens: badge '✦ AI Optimized', title 'Review Your Optimized Resume', sub 'AI has rephrased your content to better target this role. Review and apply if happy.' Sections: 'Professional Summary' with Before / '✦ After' blocks; 'Experience Bullets (optimised)' — company/title/dates EXACTLY unchanged (server merges originals back, bullets capped at 6); 'Skills (reordered by relevance)'. Footer buttons: 'Discard' and '✦ Apply to Resume'.
- [ ] **3.** Check credit balance
      **Expect:** Exactly 1 credit gone (debited only after a successful 2xx response; ledger reason 'spend:/optimize-for-job'). Pass holders / pro / Coach-Unlimited are never debited.
- [ ] **4.** Click '✦ Apply to Resume'
      **Expect:** Modal closes, merged data lands in the builder (summary/skills replaced, bullets merged onto original experiences preserving company/title/dates; extra original experiences kept), view jumps to the Profile section, status 'Resume fully optimised. Review each section.'

  **Edge cases**
  - [ ] Click Optimize while signed out (token cleared mid-session) → _requireLogin intercepts BEFORE the network call → auth modal 'Sign in to continue'; nothing is sent
  - [ ] Expired JWT reaches the server → 401 { error: 'Session expired. Please sign in again.', code: 'AUTH_REQUIRED' } → _isGated opens the auth modal
  - [ ] Click 'Discard' (or ×, or click the overlay) instead of Apply → Modal closes and optimizedResume is thrown away — but the credit was ALREADY debited server-side on response success; discarding does not refund
  - [ ] Optimization request fails / times out (90s) → Status 'Optimisation failed.' (error); no debit — server only debits on 2xx
  - [ ] Optimize clicked with no analysis present → Status 'Run analysis first.' (button is normally hidden without results)
  - [ ] Season Pass / Placement Pro / legacy pro / Coach Unlimited user optimizes → Works with 0 credits and debits nothing — requireCredits bypasses on hasActivePass || plan==='pro' || coach unlimited

  > ⚠️ Two parallel requests racing the last credit can both succeed — server logs '[credits] raced to zero — action delivered uncharged' rather than failing the second. Debit also skipped when res.locals.aiFallback is set.

### J-062 · Optimize with 0 credits → 402 → ladder modal with actions-used banner

**Account state:** Signed-in FREE user with credit_balance = 0, no active pass, not pro/Coach-Unlimited, with a full analysis on screen. (Burn the 2 signup credits first, e.g. via 2 optimize runs or AI style generations.)  
**Start at:** Full report → '✦ Optimize Resume'

- [ ] **1.** Click '✦ Optimize Resume' with 0 credits
      **Expect:** Server responds 402 { error: "You're out of credits — this needs 1.", code: 'CREDITS_REQUIRED', balance: 0, needed: 1, actionsUsed: <count of ledger 'spend:%' rows> } BEFORE any AI spend. No optimization happens, no debit.
- [ ] **2.** Observe the frontend reaction
      **Expect:** _isGated catches code CREDITS_REQUIRED → opens the ladder PaymentModal (reason 'credits', meta { actionsUsed, balance }). Spinner clears; status banner is cleared (set to '').
- [ ] **3.** Read the ladder modal
      **Expect:** Title "You're out of credits", sub 'Top up, or go unlimited for the whole season.' Gold banner: 'You've used N AI action(s). Candidates who land interviews tailor their résumé 15+ times.' (N = actionsUsed, singular/plural handled). Three cards: Placement Pro ₹2,999 / 90 days; Season Pass ₹1,499 / 90 days with 'MOST POPULAR' tag, pre-selected (hero); Boost Pack ₹299 one-time ('+10 credits', 'Tailoring, AI review, AI styles', 'Valid 6 months'). CTA reads 'Get Season Pass — ₹1,499' until another card is picked. Footer: 'One-time payment via Razorpay (card / UPI / netbanking). Need just one interview? Single Interview ₹499 is available at interview setup.'
- [ ] **4.** Buy Boost Pack ₹299 (or close and retest)
      **Expect:** Razorpay checkout → on verify, +10 credits (server adds credit_balance + 10 with a 6-month expiry grant), modal closes, status 'Purchase active — you're all set.', user refreshed. Re-clicking Optimize now succeeds and debits 1 (balance → 9).

  **Edge cases**
  - [ ] Cancel/dismiss the Razorpay sheet → Modal stays open, no error toast for CANCELLED, button re-enabled; no charge, no credits
  - [ ] Boost-pack credits older than 6 months → Lazy expiry sweep (expireStaleCredits, run on every credit check and /auth/me) forfeits the unused remainder with a compensating ledger entry — the next optimize attempt can 402 even though credits 'were' there
  - [ ] Close the ladder modal without buying → showLadder=false; report remains usable; analysis (free) still works — only optimize is blocked
  - [ ] actionsUsed = 1 → Banner reads "You've used 1 AI action." (no plural s)

  > ⚠️ actionsUsed is computed live from rn_credit_ledger (COUNT of delta<0 rows with reason LIKE 'spend:%') — it counts ALL credit-spending actions (AI styles, reviews, optimize), not just job-match. Ladder products are frontend-defined in PaymentModal.jsx LADDER const; verify server price agreement via /create-order.

### J-063 · Tracker → 'Tailor résumé to this JD' bridge into Job Match

**Account state:** Signed-in user with at least one tracked application whose job has a saved JD of ≥30 characters. Also test one job with NO JD.  
**Start at:** Dashboard → Application Tracker → open a job's detail page (/tracker/...) → right-side action buttons

- [ ] **1.** On a job WITH a JD, click the ghost button '🎯 Tailor résumé to this JD' (tooltip: 'Job Match with this JD')
      **Expect:** job.jd is written to localStorage['rn-jd-handoff'] and the app navigates to /builder?mode=jobmatch.
- [ ] **2.** Builder loads
      **Expect:** Lands directly on the Job Match section (initialMode 'jobmatch'). componentDidMount reads rn-jd-handoff, sets jobDescription, and DELETES the key. The JD textarea is pre-filled with the job's description (synced into the DOM by componentDidUpdate) and shows '✓ Job description ready' if >50 chars.
- [ ] **3.** Confirm resume side
      **Expect:** If a builder draft (rb-draft) exists it shows 'Profile data loaded — ready to analyse' and 'Analyse Match →' is already enabled; otherwise upload a file first.
- [ ] **4.** Click 'Analyse Match →'
      **Expect:** Full signed-in report for THIS job's JD (free, no debit). From here the optimize journey applies.

  **Edge cases**
  - [ ] Job whose JD is missing or <30 chars → 'Tailor résumé to this JD' button is DISABLED with title 'Add the job description (Edit job) to enable'
  - [ ] Refresh /builder?mode=jobmatch after arrival → Handoff key was consumed (removed) on first mount — JD persists only via component state; after a hard refresh the textarea may be empty and must be re-pasted (main.jsx also clears stale ?mode params from state-driven views)
  - [ ] Tracker job JD between 30 and 50 chars → Handoff fills the textarea but frontend gate needs >50 chars — hint 'Paste at least 50 characters' and disabled Analyse button despite the bridge

  > ⚠️ Bridge code: /Users/rakshitsegwal/Documents/renonym-react/src/tracker/JobDetail.jsx tailorResume() (line ~59) and ResumeBuilder.jsx componentDidMount jobmatch branch (line ~342). The sibling gold button 'Practice this interview' goes to the coach, not job match.


---

## PDF Export & Template Gating

### J-064 · Export each of the 3 free templates as a signed-in free user (hard guarantee: never watermarked, never locked)

**Account state:** Signed in, plan='free', no pass, 0 credits is fine (export costs no credits). Resume has at least Full Name filled.  
**Start at:** renonym.com → builder → template gallery; the 3 free templates are 'Classic Pro' (sf-classic), 'Minimal ATS' (sf-minimal), 'Nordic Clean' (nordic-clean)

- [ ] **1.** In the gallery, select 'Classic Pro' and confirm. Note it has NO gold '👑 PASS' badge (badge only renders on premium tiles for non-paid users).
      **Expect:** Selection proceeds straight to the method step — no ladder modal, no upsell.
- [ ] **2.** Build/load a resume with Full Name set, then click the topbar 'Export PDF' button.
      **Expect:** Status shows 'Generating PDF…'. No paywall of any kind.
- [ ] **3.** Wait for the download (server render has a 120s timeout budget).
      **Expect:** A file named '<FullName_with_non-word_chars_as_underscores>.pdf' downloads; status shows 'PDF downloaded successfully.'
- [ ] **4.** Open the PDF and inspect every page.
      **Expect:** NO watermark, NO blur, full content. The server /generate-pdf path contains no watermark code at all — any watermark on a free-template export is a release blocker.
- [ ] **5.** Repeat steps 1-4 with 'Minimal ATS' and 'Nordic Clean' (switch via the Design tab quick tiles or the topbar template <select>).
      **Expect:** Identical clean exports for both. These three keys match the backend FREE_TEMPLATES list exactly, so the server entitlement check passes without a DB lookup.

  **Edge cases**
  - [ ] Export with empty Full Name → Blocked client-side with status 'Please fill in your Full Name before exporting.' — no network call.
  - [ ] Export from a tab where the preview isn't mounted (e.g. Job Match tab) → App auto-hops to the Design section, waits 150ms, then exports normally. If the preview still can't be found: 'Preview not found. Please wait for the page to load fully.'
  - [ ] 21st export from the same IP within 1 hour (server exportLimiter, max 20/hr, failed renders don't count) → 429 → status 'PDF export limit reached. Please try later.'
  - [ ] Payload over the 10MB express.json limit (huge photo) → 413 → status 'Your résumé is too large to export — try a smaller photo or shorter sections.' (Hard to trigger: photo upload is capped at 2MB client-side.)
  - [ ] More than 15 combined AI+PDF calls per browser (perClientIdLimiter, 15 per 15 min per x-client-id) → 429 → same 'PDF export limit reached. Please try later.' status on the export path.

  > ⚠️ localStorage export counters (rn-export-count / rn-export-date) NO LONGER EXIST anywhere in src — that part of CLAUDE.md is stale; there is nothing to test there. Exports are unlimited for free users on free templates apart from IP/client rate limits.

### J-065 · Premium template without a pass — client gate at selection, ladder with reason 'template' (Boost ₹299 hidden)

**Account state:** Signed in, plan='free', no pass (isPaid false).  
**Start at:** Builder → template gallery, or Design tab quick tiles / topbar template dropdown

- [ ] **1.** In the gallery, observe any of the 7 premium tiles (Modern Clean, Dark Tech, Executive, Emerald Pro, Graphite, Mauve Creative, Terracotta).
      **Expect:** Each shows a gold '👑 PASS' badge (tooltip 'Included with any pass').
- [ ] **2.** Select a premium tile and click the gallery confirm CTA (handleGalleryConfirm).
      **Expect:** Ladder modal opens instead of advancing. Title: 'Unlock all 10 templates'. Subtitle: 'Premium templates are included with any pass.'
- [ ] **3.** Inspect the plan cards in the ladder.
      **Expect:** Only TWO cards in a 2-column grid: 'Placement Pro' ₹2,999 / 90 days and 'Season Pass' ₹1,499 / 90 days (pre-selected, 'MOST POPULAR' badge). The Boost Pack ₹299 card is HIDDEN for reason 'template'. CTA reads 'Get Season Pass — ₹1,499'. Footer: 'One-time payment via Razorpay (card / UPI / netbanking). Need just one interview? Single Interview ₹499 is available at interview setup.'
- [ ] **4.** Close the ladder, then try the same premium template via the Design-tab quick tiles (handleQuickTemplate) and the topbar <select> (handleTemplateChange).
      **Expect:** Both open the same 'template' ladder; the <select> snaps back to the current template on re-render — templateStyle never changes to the premium key.
- [ ] **5.** Reopen the ladder, click 'Get Season Pass — ₹1,499' and complete the Razorpay test payment.
      **Expect:** Button cycles 'Opening secure checkout…' → 'Activating…'; on success the modal closes and the builder shows status "Purchase active — you're all set." Note: export does NOT auto-resume — click Export PDF again.
- [ ] **6.** Now select the premium template and export.
      **Expect:** Template selects without ladder (crown badges gone), export downloads clean — pass_type='season' with pass_expires_at 90 days out passes both the client isPaid getter and the server hasActivePass() check.

  **Edge cases**
  - [ ] Dismiss the Razorpay checkout window (cancel) → No error text appears (the 'CANCELLED' rejection is swallowed); the ladder stays open with the pay button re-enabled.
  - [ ] Payment fails for another reason → Red error card in the modal with the error message, or fallback copy 'Payment failed — try again.'
  - [ ] Pay while signed out (opened ladder from landing pricing) → AuthModal appears first with reason 'payment': title 'Sign in to upgrade', sub 'Create a free account first, then complete your purchase.', then checkout resumes automatically.

  > ⚠️ Because all three template-selection entry points gate client-side, a free user normally can never even have a premium templateStyle active — the export-time gates below are defense-in-depth. LADDER_LIVE env var on Railway only blocks the retired SKUs (pro_monthly etc.) at /create-order; it does not affect the v14 ladder or export gating.

### J-066 · Server-side PASS_REQUIRED enforcement at export time (stale/forged client entitlement)

**Account state:** Account whose pass has EXPIRED on the server (pass_expires_at in the past) but whose cached localStorage 'rn-auth-user' still claims a future passExpiresAt — edit localStorage by hand to simulate, then reload is NOT needed (currentUser reads cache).  
**Start at:** Builder with a premium template (e.g. Dark Tech) active from the prior paid session

- [ ] **1.** With the stale-paid client state, click 'Export PDF'.
      **Expect:** Client gate passes (isPaid reads the stale cache), 'Generating PDF…' shows, and the request hits POST /generate-pdf.
- [ ] **2.** Observe the server response handling.
      **Expect:** Server sniffs the template from the HTML class 'rb-resume--sf-tech', finds no active pass / plan!=='pro' / no unexpired Coach Unlimited, and returns 402 {code:'PASS_REQUIRED', error:'This premium template needs a Season Pass — free templates export clean, forever.'}. The frontend does NOT show that text — _isGated opens the ladder modal with reason 'template' (Boost hidden, same as journey 2) and clears the status line.
- [ ] **3.** Switch the template to 'Nordic Clean' and export again with the same stale state.
      **Expect:** Clean PDF downloads — free templates skip the DB entitlement check entirely ('free templates export clean, forever').

  **Edge cases**
  - [ ] Auth token expired/invalid at export time → Server requirePremiumAuth returns 401 ('Session expired. Please sign in again.', code AUTH_REQUIRED) → frontend opens the AuthModal (generic 'Sign in to continue' variant, since _isGated sets reason 'feature').
  - [ ] Backend DB down / DATABASE_URL unset (local dev) → requireTemplateEntitlement is fail-open ('[pdf-gate] failed (fail-open)') — premium exports SUCCEED. Don't mistake a dev-without-DB pass for working gating; verify against production Railway.
  - [ ] Empty preview HTML reaches the server (<50 chars) → 400 'Nothing to export — the resume preview was empty.' — frontend treats any !ok as a server failure and falls into the local client fallback.

  > ⚠️ Server checks, in order: AI marker class regex rb-resume--ai-(tokens|generated) → allow; first rb-resume--<key> class (or body.templateStyle) in FREE_TEMPLATES ['sf-classic','sf-minimal','nordic-clean'] → allow; else DB row must satisfy hasActivePass() OR plan='pro' OR coach unlimited. Frontend file: /Users/rakshitsegwal/Documents/renonym-react/src/ResumeBuilder.jsx (_isGated ~line 2471); backend: '/Users/rakshitsegwal/Documents/node server/server.js' lines 544-567.

### J-067 · Export with an AI-generated token theme — allowed for ANY signed-in user, including free (generation itself costs 1 credit)

**Account state:** Signed in, free plan, at least 1 credit (new accounts get +2 signup credits).  
**Start at:** Builder → AI section ('ai' tab) or AI flow from landing → describe a style → Generate

- [ ] **1.** Generate an AI theme (e.g. prompt example 'Apple Minimal').
      **Expect:** On success: status 'AI theme applied! 🎨', templateStyle becomes 'ai-generated', preview root gains class 'rb-resume--ai-tokens', and 1 credit is debited server-side (debit only on a successful, non-fallback response).
- [ ] **2.** Click 'Export PDF' as the same free user.
      **Expect:** Export succeeds CLEAN — no ladder, no watermark. Client side: templateIsFree includes 'ai-generated'. Server side: the rb-resume--ai-(tokens|generated) marker bypasses the entitlement check entirely ('AI-styled exports are always allowed — generating the style already cost a credit').
- [ ] **3.** Check the topbar template <select>.
      **Expect:** An '✦ AI Generated' option now appears; switching back to it never opens the ladder (handleQuickTemplate/handleTemplateChange both whitelist 'ai-generated').
- [ ] **4.** If the AI returned the safe fallback (result.fallback true), note the status.
      **Expect:** 'The AI couldn't build a custom theme this time — a clean default was applied. Try again in a moment.' — and no credit is charged (res.locals.aiFallback skips the debit).

  **Edge cases**
  - [ ] Generate an AI theme with 0 credits (free user) → 402 CREDITS_REQUIRED ('You're out of credits — this needs 1.') → ladder opens with reason 'credits': title "You're out of credits", gold info card 'You've used N AI actions…', and ALL THREE cards including Boost Pack ₹299 (+10 credits, valid 6 months).
  - [ ] Export an AI theme generated in a previous session after credits hit 0 → Still exports clean — export of an existing AI theme costs nothing and bypasses the pass check via the marker class.
  - [ ] Season/Placement/legacy-pro user generates AI themes → No credit debit at all — requireCredits bypasses for hasActivePass / plan='pro' / Coach Unlimited.

  > ⚠️ Tokens are inline CSS custom properties on the preview root, so they serialize into the outerHTML payload — the exported PDF must visually match the on-screen AI colors. Verify on mobile too per launch policy.

### J-068 · Export premium templates as each paid persona (season / placement_pro / legacy pro / legacy Coach Unlimited)

**Account state:** Four accounts: (a) pass_type='season' unexpired, (b) pass_type='placement_pro' unexpired, (c) legacy plan='pro', (d) legacy coach_plan='unlimited' with coach_expires NULL or future. All map to isPaid=true client-side.  
**Start at:** Builder → gallery or Design tab, any of the 7 premium templates

- [ ] **1.** Sign in as each persona and open the template gallery.
      **Expect:** NO '👑 PASS' crowns anywhere (badge condition is isPremium && !isPaid). All 10 templates selectable without the ladder.
- [ ] **2.** Select a premium template (e.g. 'Executive') and export.
      **Expect:** Clean PDF downloads, 'PDF downloaded successfully.' Server allows via hasActivePass (a, b) / plan==='pro' (c) / coachAccess().unlimited (d).
- [ ] **3.** For persona (a)/(b), check the entitlement source after sign-in.
      **Expect:** passType/passExpiresAt come from /auth/me via _refreshUser — the raw auth payload has no pass fields, so a paying user signing in mid-export must NOT see the ladder (see signed-out journey).

  **Edge cases**
  - [ ] Pass expires while the browser session is open (passExpiresAt rolls past now) → Client isPaid getter compares new Date(passExpiresAt) > new Date() live, so the very next select/export attempt gates client-side; even if cached state lies, the server returns 402 PASS_REQUIRED.
  - [ ] interview_credit holder (bought Single Interview ₹499 only) → NOT entitled — interview_credits is never checked by requireTemplateEntitlement or isPaid. Premium template select/export shows the 'template' ladder like a free user.

  > ⚠️ Backend grants: season = pass_type 'season' + 90 days + 6 interviews; placement = 'placement_pro' + 90 days + 25 interviews (server.js ~line 2538). Retired Coach Unlimited accounts still count as paid everywhere — keep them working.

### J-069 · Export while signed out → auth modal → automatic export after sign-in

**Account state:** Signed out (no rn-auth-token in localStorage). Resume built with Full Name filled, free template selected.  
**Start at:** Builder topbar → 'Export PDF'

- [ ] **1.** Click 'Export PDF' while signed out.
      **Expect:** No network call; AuthModal opens with title 'Sign in to export' and subtitle 'Create a free account to download your resume PDF.'
- [ ] **2.** Complete Google sign-in (popup + polling) or magic link.
      **Expect:** Modal closes; because authReason==='export', the app first calls _refreshUser() (fetches pass/credit fields from /auth/me) and THEN re-runs handleExport() automatically — the user does not need to click Export again.
- [ ] **3.** Observe the automatic export (free template case).
      **Expect:** 'Generating PDF…' → '<Name>.pdf' downloads → 'PDF downloaded successfully.' Clean, unwatermarked.
- [ ] **4.** Repeat with a PAYING account signing in at this gate (premium template active).
      **Expect:** Because entitlements are refreshed BEFORE re-running export, the paying user must NOT be shown the purchase ladder — export proceeds directly. (This ordering is an explicit code comment in handleAuthSuccess.)

  **Edge cases**
  - [ ] Signed-out user had somehow staged a premium template, signs in to a FREE account → Re-run of handleExport hits the !templateIsFree && !isPaid gate → 'template' ladder opens instead of exporting.
  - [ ] Close the auth modal without signing in → Modal dismisses, nothing exports, no error.
  - [ ] Brand-new account created at this gate → Server grants +2 signup credits exactly once (flag-guarded); export itself needs none.

  > ⚠️ The topbar 'Sign in' button uses reason 'general' and does NOT auto-export — only the export-gated path resumes the action.

### J-070 · Client-side PDF fallback when the server render fails (the ONLY watermark in the system)

**Account state:** Signed in; resume with Full Name. To force the fallback: load the app, then block/offline the network to the Railway host (DevTools request blocking on */generate-pdf) — html2canvas/jsPDF CDNs must stay reachable, or test against a server returning 5xx.  
**Start at:** Builder → 'Export PDF' with /generate-pdf unreachable or returning 5xx

- [ ] **1.** Click 'Export PDF' (free template, free user).
      **Expect:** After the server call fails (network error, !ok status like 503 'Export queue is full…', or a non-%PDF body), status switches to 'Server busy — rendering your PDF locally…'
- [ ] **2.** Wait for html2canvas + jsPDF to lazy-load from CDN and render.
      **Expect:** A rasterized (lower-fidelity, JPEG-based) '<Name>.pdf' downloads, sliced into A4 pages (max 12); status 'PDF downloaded (rendered locally).'
- [ ] **3.** Inspect the local PDF for the watermark (free user + free or AI template).
      **Expect:** NO watermark — isProUser = isPaid || templateIsFree, and free/AI templates set templateIsFree true. The free-template clean guarantee holds even on the fallback path.
- [ ] **4.** Repeat as any paid persona with a premium template.
      **Expect:** Also NO watermark (isPaid true).
- [ ] **5.** (Defense-in-depth only) Force the unreachable combination: unpaid user + premium templateStyle reaching the fallback (requires bypassing the handleExport gate in DevTools).
      **Expect:** Every page carries a diagonal grey watermark: text 'Renonym — upgrade to remove', 46pt, color rgb(190,190,190), centered, 30° angle. Normal users can never hit this — handleExport gates unpaid+premium before any download path.

  **Edge cases**
  - [ ] CDN libraries also fail to load (fully offline) → Status 'Failed to generate PDF. Check your connection and try again.'
  - [ ] Server returns 429 or 413 → These do NOT fall back locally — they show their specific messages ('PDF export limit reached. Please try later.' / 'Your résumé is too large to export — try a smaller photo or shorter sections.') and stop.
  - [ ] Server returns 401/402 → No fallback — _isGated intercepts first and shows the auth modal or ladder, status cleared.
  - [ ] Scaled preview (mobile / zoomed) → Fallback neutralizes the transform:scale wrapper in the cloned DOM (onclone) — the local PDF must not be garbled or cropped.

  > ⚠️ Fallback fidelity is lower than the server render (rasterized at scale 2, JPEG 0.95, 794x1123px pages) — text won't be selectable. The exportLimiter has skipFailedRequests:true, so failed server attempts that triggered the fallback don't consume export slots. Failure-path ordering in handleDownload: network throw → fallback; _isGated(401/402) → modal; 429/413 → message; other !ok → fallback; non-PDF magic bytes → fallback.


---

## Payments & the Credit Ladder

### J-071 · Ladder modal opens with reason 'credits' (out-of-credits 402 on an AI action)

**Account state:** Signed-in FREE user with 0 credits and no active pass (new accounts get +2 signup credits — burn them with 2 AI actions first, e.g. two 'Improve summary' runs)  
**Start at:** renonym.com/builder → build a resume → trigger any 1-credit AI action (AI style generate, AI review, Improve summary, or Tailor/optimize-for-job)

- [ ] **1.** Trigger the AI action with 0 credit balance
      **Expect:** Backend returns 402 {code:'CREDITS_REQUIRED', error:"You're out of credits — this needs 1."} and the ladder modal opens instead of the action running
- [ ] **2.** Read the modal header
      **Expect:** Title: "You're out of credits" — subtitle: "Top up, or go unlimited for the whole season."
- [ ] **3.** Check the gold banner under the subtitle
      **Expect:** "You've used N AI actions. Candidates who land interviews tailor their résumé 15+ times." where N = count of past 'spend:' ledger rows (singular 'action' when N=1)
- [ ] **4.** Count the SKU cards and their order
      **Expect:** ALL 3 SKUs in 3 columns, left→right: Placement Pro ₹2,999 / 90 days → Season Pass ₹1,499 / 90 days (gold card, 'MOST POPULAR' badge) → Boost Pack ₹299 / one-time ('+10 credits', 'Tailoring, AI review, AI styles', 'Valid 6 months')
- [ ] **5.** Check preselection and CTA
      **Expect:** Season Pass is preselected (filled gold radio); CTA reads "Get Season Pass — ₹1,499". Footer: "One-time payment via Razorpay (card / UPI / netbanking). Need just one interview? Single Interview ₹499 is available at interview setup."
- [ ] **6.** Click a different card
      **Expect:** Radio + gold border move; CTA updates to "Get Boost Pack — ₹299" or "Get Placement Pro — ₹2,999"
- [ ] **7.** Click the dark overlay or the X
      **Expect:** Modal closes (only when not mid-payment; while busy the X is disabled and overlay clicks are ignored)

  **Edge cases**
  - [ ] User holds an active Season/Placement pass or plan='pro' or unexpired Coach Unlimited → requireCredits is bypassed entirely — the AI action runs, no modal, no debit
  - [ ] AI action fails server-side or falls back to default tokens (res.locals.aiFallback) → No credit is debited — only 2xx non-fallback responses charge 1 credit (ledger reason 'spend:/<endpoint>')
  - [ ] Boost credits older than 182 days → Lazily forfeited on next /auth/me or credit check ('expiry' ledger row); balance drops without a purchase

  > ⚠️ 402 routing lives in ResumeBuilder._isGated(): CREDITS_REQUIRED→reason 'credits' with meta {actionsUsed, balance}; PASS_REQUIRED→'template'; any other 402 code falls back to the legacy CreditGateModal. Gated endpoints: /generate-template, /review-resume, /improve-summary, /optimize-for-job (all requirePremiumAuth + requireCredits(1)). /analyze-job-match is free for signed-in users.

### J-072 · Ladder modal opens with reason 'template' (premium template pick or export) — Boost Pack hidden

**Account state:** Signed-in free user (no pass, not pro). Free templates are only sf-classic, sf-minimal, nordic-clean  
**Start at:** renonym.com/builder → template gallery, pick any of the 7 premium templates → Continue; or in Design tab switch the quick-template/dropdown to a premium one; or Export with a premium template active

- [ ] **1.** Confirm a premium gallery template (or switch to one in Design, or hit Export on one)
      **Expect:** Ladder opens client-side (no network call). Title: "Unlock all 10 templates" — subtitle: "Premium templates are included with any pass."
- [ ] **2.** Count SKU cards
      **Expect:** Only 2 cards in 2 columns: Placement Pro ₹2,999 and Season Pass ₹1,499 (hero, preselected). Boost Pack ₹299 is hidden for 'template' and 'interview' reasons
- [ ] **3.** Close the modal after opening it from the Design dropdown
      **Expect:** The select snaps back to the previous template — templateStyle never changed
- [ ] **4.** (Server check) Force an export of a premium template via devtools anyway
      **Expect:** /generate-pdf returns 402 {code:'PASS_REQUIRED', error:'This premium template needs a Season Pass — free templates export clean, forever.'} and the same 'template' ladder opens

  **Edge cases**
  - [ ] Template is 'ai-generated' (AI-styled resume) → Never gated — AI styles export clean for any signed-in user (generation already cost a credit); server allows any html containing class rb-resume--ai-tokens/ai-generated
  - [ ] Free template export while signed out → Auth modal first (export requires an account), not the ladder
  - [ ] Pass expires between page load and export → Server-side gate still returns the PASS_REQUIRED 402 — client isPaid check is cosmetic only

  > ⚠️ Client gate: ResumeBuilder.isPaid = plan==='pro' || coach.unlimited || (passType && passExpiresAt in future). Server gate requireTemplateEntitlement sniffs the rb-resume--<name> class from the posted HTML, falls back to body.templateStyle.

### J-073 · Ladder modal opens with reason 'interview' from a locked free-interview report

**Account state:** Signed-in free user who completed their one free TEXT interview (report is partial/locked: is_free_session=TRUE, report_unlocked=FALSE)  
**Start at:** renonym.com/coach/report/<sessionId> (or Dashboard → Interview Reports → the free session)

- [ ] **1.** Open the locked report
      **Expect:** Partial report renders: overall score + verdict + exactly 1 strength + 1 weakness; gold card "Your full report is ready — and locked." with a blurred 4-dimension skeleton
- [ ] **2.** Click "Or 6 complete interviews — Season Pass ₹1,499"
      **Expect:** Ladder opens with reason 'interview': title "Keep interviewing", subtitle "Pick the pass that matches your search."; only Placement Pro + Season Pass cards (no Boost Pack), Season preselected
- [ ] **3.** Buy the Season Pass (test mode)
      **Expect:** Modal closes, report refetches; verify-payment also flips report_unlocked=TRUE for the free session, so the FULL report (4 dimensions, 3 strengths/weaknesses, fixes, recommendations) now renders

  **Edge cases**
  - [ ] Buying Single Interview ₹499 instead (at coach checkout) → Also unlocks the locked free report (any interview product purchase sets report_unlocked=TRUE on free sessions)
  - [ ] Report already fully unlocked → Locked card never renders; no ladder entry on this page

  > ⚠️ Partial report is enforced server-side (partialReport() trims the response); the full report is stored, only the response is cut. Locked detection: report.locked or session.report_locked.

### J-074 · Ladder modal opens with reason 'generic' from the Dashboard credit pill

**Account state:** Signed-in user (any free/credit state)  
**Start at:** renonym.com/dashboard → gold pill at the bottom of the left sidebar (tooltip: 'Credits power tailoring, AI review and AI styles')

- [ ] **1.** Click the credit pill (shows '⚡ N credits' or '★ <Pass> · N left', with a '+' on the right)
      **Expect:** Ladder opens: title "Upgrade your job hunt", subtitle "One-time payments. No subscriptions. No surprises."; all 3 SKUs visible, Season Pass preselected/hero
- [ ] **2.** Complete any purchase
      **Expect:** onSuccess closes the modal and the WHOLE PAGE RELOADS (window.location.reload()) so the pill re-reads the refreshed cached user
- [ ] **3.** Close without buying
      **Expect:** Modal closes, dashboard untouched

  **Edge cases**
  - [ ] Legacy CreditGateModal 'Upgrade' CTA inside the builder → Also opens reason 'generic' (handleUpgrade) — purchase happens in-place, no redirect to pricing
  - [ ] Landing page pricing cards (#pricing) → They do NOT open the ladder — Season/Placement cards route to /coach/new; only the small print mentions 'Boost Pack ₹299 (+10 AI credits) · Single Interview ₹499 · Report Unlock ₹299'

  > ⚠️ Pill credit count comes from the cached localStorage user (main.jsx prop), pass info from live /coach/me — they can briefly disagree until reload.

### J-075 · Buy Boost Pack ₹299 end-to-end → +10 credits, 6-month expiry

**Account state:** Signed-in free user, no pass. Razorpay must be in TEST mode (Railway RAZORPAY_KEY_ID = rzp_test_…) to use test instruments  
**Start at:** Any ladder modal with Boost visible (reasons 'credits'/'generic') → select Boost Pack → "Get Boost Pack — ₹299"

- [ ] **1.** Click the CTA
      **Expect:** Button shows 'Opening secure checkout…'; POST /create-order {planId:'boost_299'} returns order for 29900 paise; Razorpay hosted modal opens — name 'Renonym AI', description 'Boost Pack', gold theme #E8C994, name/email prefilled
- [ ] **2.** Pay with test card 4111 1111 1111 1111 (any future expiry/CVV) or UPI success@razorpay
      **Expect:** Razorpay succeeds; client POSTs /verify-payment; button shows 'Activating…' then the modal closes. In the builder a green status appears: "Purchase active — you're all set."
- [ ] **3.** Check the Dashboard credit pill (reload /dashboard)
      **Expect:** Balance is exactly +10 (e.g. '⚡ 10 credits'); plan label still 'Free plan' (Boost is credits, not a pass)
- [ ] **4.** Run a 1-credit AI action
      **Expect:** Succeeds; balance drops to 9 on next refresh

  **Edge cases**
  - [ ] verify-payment response inspected in devtools → {success:true, plan:'boost_299', grant:{user:<id>, rows:1}}; ledger row reason 'purchase:boost', delta +10, expires_at = now + 182 days
  - [ ] More than 10 order creations from one IP within an hour → 429 'Too many payment requests. Please try again later.' (paymentLimiter on /create-order and /verify-payment)
  - [ ] Request missing x-client-id header (curl) → 400 'Missing client session.'; missing/wrong x-api-secret → 401 'Unauthorised.'

  > ⚠️ Amounts live only in backend PLANS map (boost_299 = 29900 paise). The grant goes to the JWT user (Authorization header), not the body userId.

### J-076 · Buy Season Pass ₹1,499 end-to-end → pass_type 'season', 6 interviews, 90 days

**Account state:** Signed-in free user (Razorpay test mode)  
**Start at:** Any ladder modal → Season Pass is already preselected → "Get Season Pass — ₹1,499"

- [ ] **1.** Pay through Razorpay test checkout (order amount 149900 paise)
      **Expect:** verify-payment grants: pass_type='season', pass_expires_at = now + 90 days, pass_interviews_remaining += 6; any locked free-interview report is unlocked
- [ ] **2.** Open /dashboard
      **Expect:** Credit pill: "★ Season Pass · 6 left"; sidebar plan label under the avatar: "★ Season Pass"
- [ ] **3.** Run any AI action in the builder with 0 credits
      **Expect:** Works without the ladder — active pass bypasses requireCredits entirely ('Unlimited AI actions')
- [ ] **4.** Export a premium template
      **Expect:** Clean PDF — hasActivePass passes requireTemplateEntitlement
- [ ] **5.** Start an interview at /coach/new
      **Expect:** Allowed; pass_interviews_remaining decrements to 5 after the session is created (consumed after question generation succeeds)

  **Edge cases**
  - [ ] Buying Season while another pass is still active → Interviews STACK: remaining = max(old remaining,0) + 6; pass_type overwritten to 'season'; expiry reset to now+90d
  - [ ] Pass interviews exhausted (0 left) but pass not expired → Pill shows '★ Season Pass · 0 left'; starting an interview returns 402 INTERVIEW_REQUIRED: "You've used all the interviews in your pass — add a Single Interview (₹499) to keep going." — never a degraded free session
  - [ ] Pass expired (90 days passed) → /auth/me returns passType:null; user reverts to credit gating and 'Free plan' label

  > ⚠️ Dashboard's 4-stat 'Plan' card reads coach.unlimited/isPro only — a Season Pass holder sees 'Free' there while the pill and plan label correctly show the pass (known display quirk worth verifying).

### J-077 · Buy Placement Pro ₹2,999 end-to-end → pass_type 'placement_pro', 25 interviews, 90 days

**Account state:** Signed-in free user (Razorpay test mode)  
**Start at:** Any ladder modal → select Placement Pro → "Get Placement Pro — ₹2,999"

- [ ] **1.** Pay through Razorpay test checkout (order amount 299900 paise)
      **Expect:** Grant: pass_type='placement_pro', +25 pass_interviews_remaining, pass_expires_at now+90d; locked free report unlocked
- [ ] **2.** Open /dashboard
      **Expect:** Pill: "★ Placement Pro · 25 left"; plan label: "★ Placement Pro" (placement_pro outranks season in the label chain)
- [ ] **3.** Use AI actions / premium templates / start interviews
      **Expect:** Same unlimited behavior as Season Pass, with 25 interview consumptions available

  **Edge cases**
  - [ ] Placement Pro bought on top of an active Season Pass with 3 interviews left → remaining = 3 + 25 = 28; pass_type becomes 'placement_pro'; pill shows '★ Placement Pro · 28 left'

  > ⚠️ Modal card feats: '25 full interviews (audio + text)', 'Unlimited AI actions', 'All 10 templates', 'Priority support'.

### J-078 · Buy Single Interview ₹499 at Coach Checkout (the SKU not in the ladder modal)

**Account state:** Signed-in free user whose free interview is used (or who wants audio); interview draft saved from Setup  
**Start at:** renonym.com/coach/new → configure interview → gated to /coach/checkout (also reachable directly; ?plan=session preselects Single Interview)

- [ ] **1.** Open /coach/checkout
      **Expect:** 3 plan rows: Season Pass ₹1,499 (preselected, 'MOST POPULAR'), Placement Pro ₹2,999, Single Interview ₹499 ('This one interview (audio or text) + full scored report'); right rail shows YOUR draft (role · company, type, mode, question count) and 'Due today'
- [ ] **2.** Select Single Interview and click "Pay ₹499 & start interview"
      **Expect:** Razorpay opens for 49900 paise (planId single_499); on success status walks 'Confirming your payment…' → 'Activating your access…'
- [ ] **3.** Wait for activation
      **Expect:** interview_credits += 1; client re-checks /coach/me; if me.has, it auto-creates the session from the draft ('Generating your interview…') and navigates to /coach/session/<id>
- [ ] **4.** If you abandoned before creating the session, check /dashboard
      **Expect:** Plan label: "1 interview ready" (interviewCredits branch); pill still shows credits since there is no pass

  **Edge cases**
  - [ ] Already-entitled user (pass/unlimited/legacy) visits checkout → Pay button never shown — headline "You already have Coach access", copy 'No payment needed — your plan is active…', button 'Start my interview →' / 'Set up your interview →'
  - [ ] Payment captured but /coach/me still shows no access → Error card: "Your payment was received, but access hasn't activated yet. Don't pay again — wait a few seconds, reload this page, and tap \"Set up interview\"."
  - [ ] Signed-out visitor on /coach/checkout → AuthModal opens immediately ('Sign in to upgrade' / 'Create a free account first, then complete your purchase.'); after auth it FIRST checks coachMe — if already entitled it proceeds WITHOUT charging; if that check fails: 'Could not check your existing access — to avoid charging you twice, tap Pay only if you're sure you haven't bought Coach on this account.'
  - [ ] Stale token (coachMe 401) → Token+user wiped from localStorage and AuthModal forced — prevents an entitled-but-expired session from paying twice
  - [ ] 402 from /coach/sessions for a free-user audio attempt → "Audio interviews need a Single Interview (₹499) or a Season Pass — your first TEXT interview is free."

  > ⚠️ single_499 is intentionally absent from PaymentModal (footer points here). Buying it also unlocks any locked free-session report.

### J-079 · Report Unlock ₹299 — session-bound one-off purchase

**Account state:** Signed-in owner of a free, still-locked interview session  
**Start at:** renonym.com/coach/report/<id> → locked gold card → "Unlock your full report — ₹299"

- [ ] **1.** Click the unlock button
      **Expect:** Button flips to 'Unlocking…'; /create-order is called with planId report_unlock_299 + sessionId; server validates ownership BEFORE charging
- [ ] **2.** Pay via Razorpay test mode (29900 paise)
      **Expect:** verify-payment sets report_unlocked=TRUE for that one session (sessionId read from order notes, never the client); page refetches and the full report replaces the locked card

  **Edge cases**
  - [ ] Signed out → Inline error 'Sign in to unlock your report.' (server also enforces: 401 code AUTH_REQUIRED on create-order)
  - [ ] Session already unlocked or not owned → create-order rejects with 400 'That report is already unlocked (or the session was not found).' — ₹299 can never be captured with nothing to grant
  - [ ] Payment captured but grant matched 0 rows (verify response grant.rows===0) → UI shows: "Payment received but the unlock didn't apply — do NOT pay again; reload in a moment or contact support."; server deletes the rn_payments row so a verify retry can re-grant
  - [ ] Missing sessionId → 400 'Missing interview session for this unlock.'

  > ⚠️ Cancel (dismiss Razorpay) shows no error — CANCELLED is swallowed, button returns to normal.

### J-080 · Cancel Razorpay checkout mid-purchase

**Account state:** Signed-in user, any ladder modal  
**Start at:** Ladder modal → CTA → Razorpay opens

- [ ] **1.** Close the Razorpay window (X / back) without paying
      **Expect:** ondismiss rejects with 'CANCELLED'; the ladder modal stays open, NO red error card appears (CANCELLED is explicitly not surfaced), button returns to "Get <plan> — <price>" and is clickable again
- [ ] **2.** Verify no entitlement changed
      **Expect:** Credits/pass unchanged; an unpaid Razorpay order exists server-side but verify-payment was never called, so nothing was granted
- [ ] **3.** While Razorpay is open, try clicking the modal overlay or X
      **Expect:** Modal cannot be closed while busy (overlay click guarded by !busy, X disabled)

  **Edge cases**
  - [ ] Razorpay script blocked → Error: 'Could not load Razorpay. Check your connection.'
  - [ ] Cancel then immediately retry → New order created; works normally (each attempt consumes one of 10/hr limiter slots)

### J-081 · Payment failure and verify failure paths

**Account state:** Signed-in user, Razorpay TEST mode  
**Start at:** Any ladder modal → CTA → Razorpay checkout

- [ ] **1.** Pay with a declining test card (e.g. Razorpay's failure card 4000 0000 0000 0002)
      **Expect:** rzp 'payment.failed' fires; ladder modal shows a red error card containing Razorpay's failure description; busy resets, modal stays open for retry
- [ ] **2.** (Devtools) Replay /verify-payment with a tampered razorpay_signature
      **Expect:** 400 {error:'Invalid payment signature'} — HMAC-SHA256(order_id|payment_id) checked server-side; modal would show 'Invalid payment signature' in the red card
- [ ] **3.** (Devtools) Send a bogus planId to /create-order
      **Expect:** 400 'Invalid plan ID'
- [ ] **4.** (Devtools) Send verify-payment with a mismatched planId in the body
      **Expect:** Server ignores body planId and uses order.notes.plan from the Razorpay order ('planId mismatch … using order' in logs) — a ₹299 payment can never claim a ₹2,999 grant

  **Edge cases**
  - [ ] Grant DB write fails or matches 0 rows after a real capture → Response still success:true but grant:{rows:0|error}; server releases the rn_payments redemption so retrying verify-payment can grant — payment is never stranded
  - [ ] verify-payment throws → 500 'Payment verification failed'; PaymentModal shows that message

  > ⚠️ There is no client retry of verify — if verify fails after capture, the user sees the error and support must replay verify (safe due to idempotency + redemption release).

### J-082 · Anonymous user buys from the ladder — in-modal sign-in, session survives the purchase

**Account state:** SIGNED OUT (no rn-auth-token / rn-auth-user in localStorage). Easiest entry while signed out: not possible from the builder gates (they require login earlier), so test by opening the ladder while signed in, then clearing localStorage auth keys in devtools before clicking the CTA — or use /coach/checkout signed out  
**Start at:** Ladder modal → "Get Season Pass — ₹1,499" while getUser() is null

- [ ] **1.** Click the pay CTA signed out
      **Expect:** Razorpay does NOT open; AuthModal appears over the ladder: title "Sign in to upgrade", subtitle "Create a free account first, then complete your purchase." (Google popup or magic link)
- [ ] **2.** Complete Google sign-in
      **Expect:** Token+user written to localStorage (rn-auth-token / rn-auth-user); AuthModal closes and payment starts AUTOMATICALLY for the still-selected SKU — Razorpay opens prefilled with the new account's name/email
- [ ] **3.** Pay (test mode)
      **Expect:** verify-payment grants to the JWT user (Authorization header preferred over body userId); 'Activating…' → /auth/me refreshes the cached user with credits/pass fields
- [ ] **4.** After the modal closes, check you are still signed in
      **Expect:** Session SURVIVES: UserPill/dashboard show the account; in the builder, onSuccess calls _refreshUser() which explicitly adopts the token written by the in-modal sign-in ('pick up a session created outside this component') and shows "Purchase active — you're all set."
- [ ] **5.** Open /dashboard
      **Expect:** New entitlement visible (pill '★ Season Pass · 6 left' or '⚡ N credits') without re-login

  **Edge cases**
  - [ ] User closes the AuthModal without signing in → Back to the ladder, nothing charged
  - [ ] Brand-new account created during this flow → Gets +2 signup credits in addition to the purchase grant (flag-guarded, exactly once)
  - [ ] Sign-in succeeds but user already owns the entitlement (CoachCheckout variant) → coachMe is checked first and payment is skipped — never double-charges

  > ⚠️ PaymentModal itself never blocks an anonymous open — only the pay click triggers auth. The grant targets the JWT, so even if body userId is null/stale the purchase lands on the signed-in account.

### J-083 · Dashboard credit pill + plan label permutations

**Account state:** One account per state to verify: free 0 credits / free with credits / season / placement_pro / legacy coach_unlimited / legacy plan='pro' / legacy session_passes>0 / interview_credit holder / signed out  
**Start at:** renonym.com/dashboard

- [ ] **1.** Load signed out
      **Expect:** No shell renders — centered "Sign in to see your dashboard." with a gold 'Sign in' button that stores rn-return-to='/dashboard' and routes to '/'
- [ ] **2.** Load signed in, watch the plan label under your avatar during the first second
      **Expect:** Shows '—' until /coach/me responds — never flashes 'Free' at a paying user
- [ ] **3.** Verify the label per account state (priority order)
      **Expect:** placement_pro → '★ Placement Pro'; season → '★ Season Pass'; coach unlimited → '★ Coach Unlimited' (gold text); plan='pro' → '★ Pro' (gold); legacy passes>0 → 'N session pass(es)'; interviewCredits>0 → 'N interview(s) ready' (e.g. '1 interview ready'); else → 'Free plan'
- [ ] **4.** Verify the gold pill per state
      **Expect:** Active pass: '★ Season Pass · N left' / '★ Placement Pro · N left' (N = passInterviewsRemaining, shows '· 0 left' when exhausted-but-unexpired); no pass: '⚡ N credits' ('1 credit' singular); always a '+' on the right; click opens the generic ladder
- [ ] **5.** Buy a Boost Pack via the pill and let onSuccess run
      **Expect:** Full page reload; pill shows the +10 balance read from the refreshed rn-auth-user

  **Edge cases**
  - [ ] Stats grid 'Plan' card for a pass holder → Shows 'Free' (it only checks unlimited/pro) while pill+label show the pass — confirm this known mismatch
  - [ ] coach/me request fails → Label stays '—' indefinitely (catch is silent); pill falls back to the credits branch
  - [ ] Pre-v14 account first load → /auth/me mints a referral_code on first profile load — only happens once /auth/me is hit (Dashboard does call it via main.jsx refresh)

  > ⚠️ Pill credits come from the cached user prop; pass numbers from live /coach/me — a just-expired pass shows passType null from the server even if localStorage is stale.

### J-084 · Double-payment idempotency — one payment grants exactly once

**Account state:** Signed-in free user, completed a real Boost Pack test purchase; devtools Network tab open  
**Start at:** Devtools → Network → the successful POST /verify-payment row

- [ ] **1.** Right-click the verify-payment request → Replay/Resend with identical body
      **Expect:** Response: {success:true, plan:'boost_299', replay:true} — no grant block; server log: 'Replay blocked: payment <id> already redeemed' (rn_payments ON CONFLICT(payment_id) DO NOTHING)
- [ ] **2.** Refresh /auth/me (reload dashboard)
      **Expect:** Credit balance is still +10 from the original purchase — NOT +20
- [ ] **3.** Replay a Season verify the same way
      **Expect:** replay:true; pass_interviews_remaining unchanged (no extra +6), expiry not re-extended

  **Edge cases**
  - [ ] Second idempotency layer (if the rn_payments check ever errors and continues) → v14 ledger marker keyed by payment id (partial unique index on ref_id WHERE reason LIKE 'purchase:%') makes the grant a no-op: log 'v14 grant retry detected … side effects skipped', rc forced to 1 so the redemption is NOT released
  - [ ] Original grant failed (rows 0) → Redemption row deleted ('redemption released'), so a replay DOES re-attempt the grant — this is the intended recovery path, not a double grant

  > ⚠️ Both layers are server-side; the UI shows success on replay so a flaky-network retry never errors at the user.

### J-085 · LADDER_LIVE=true flip — retired SKUs rejected at create-order

**Account state:** Access to Railway env vars. Retired SKUs: pro_monthly ₹599, pro_yearly ₹5,988, team_monthly ₹1,799, team_yearly ₹17,988, coach_unlimited ₹1,599, coach_unlimited_yearly ₹13,188, session_pass ₹599  
**Start at:** curl -X POST <railway>/create-order -H 'x-api-secret: …' -H 'x-client-id: test-cid-12345678' -H 'Content-Type: application/json' -d '{"planId":"pro_monthly"}'

- [ ] **1.** With LADDER_LIVE unset/false, POST create-order for a retired SKU (e.g. pro_monthly)
      **Expect:** 200 with a real Razorpay order (59900 paise) — bridge behavior: old SKUs stay purchasable until the flag flips
- [ ] **2.** Set LADDER_LIVE=true on Railway and redeploy, then repeat
      **Expect:** 400 {error:'This plan is no longer available — see the new plans.'} for every retired SKU
- [ ] **3.** POST create-order for each live SKU (boost_299, single_499, season_1499, pro_2999, report_unlock_299) with the flag on
      **Expect:** All still return orders normally — the flag only blocks plans marked retired:true
- [ ] **4.** In the browser, run every purchase journey above with the flag on
      **Expect:** Zero behavior change — the current UI only ever sends the 5 live SKUs

  **Edge cases**
  - [ ] Historical verify-payment replay for an old retired-SKU payment → Still succeeds — retired PLANS entries are kept exactly so verify replays and refund lookups stay safe; coach_unlimited replays still grant coach_plan='unlimited', generic retired plans grant plan='pro'
  - [ ] Old cached frontend bundle posting session_pass after the flip → User sees the 'no longer available' message as the payment error in whatever UI made the call

  > ⚠️ Flag read at request time (process.env.LADDER_LIVE === 'true') — exact string 'true' required. /create-order also requires the shared x-api-secret (else 401 'Unauthorised.') and a valid x-client-id (8-72 chars [a-zA-Z0-9-_], else 400 'Invalid client session format.').

### J-086 · Landing pricing cards while signed in — CTA routing map

**Account state:** Signed in as a FREE user (rn-auth-token + rn-auth-user present in localStorage; no pass, plan='free')  
**Start at:** https://renonym.com/ then click 'Pricing' in the top nav (or load https://renonym.com/#pricing directly)

- [ ] **1.** Load the landing page while signed in
      **Expect:** Top-nav right side shows a single ghost button 'Dashboard →'. The signed-out 'Sign in' / 'Get started' buttons are NOT rendered (LandingPage.jsx renders them only when currentUser is null).
- [ ] **2.** Click 'Pricing' in the nav
      **Expect:** Page smooth-scrolls to the #pricing section and the URL hash becomes '#pricing' (history.replaceState). Section heading: eyebrow 'Pricing', H2 'Free to build. Pay to practice.'
- [ ] **3.** Read the three pricing cards
      **Expect:** Card 1: 'Free' ₹0 'Forever', CTA 'Start building' (outline). Card 2 (gold, 'Most popular' badge): 'Season Pass' ₹1,499 '/90 days', sub 'MOST POPULAR · one-time', CTA 'Get the Season Pass'. Card 3: 'Placement Pro' ₹2,999 '/90 days', sub 'For an all-out search', CTA 'Go Pro'. Below the grid, footnote: 'Also available: Boost Pack ₹299 (+10 AI credits) · Single Interview ₹499 · Report Unlock ₹299. One-time payments — no subscriptions, ever.'
- [ ] **4.** Click 'Start building' on the Free card
      **Expect:** View switches to the Résumé Studio template gallery (ResumeBuilder, entryMode 'gallery'). URL stays '/' (navigate() pushes '/' for the builder view — PATH_FOR_VIEW has no builder entry). No auth modal, no payment modal — works identically signed in or out.
- [ ] **5.** Browser Back, then click 'Get the Season Pass'
      **Expect:** URL changes to /coach/new and the Interview Setup screen renders ('Set up your interview'). The ladder modal (PaymentModal) does NOT open on the landing page — onClick is go('/coach/new'), not a modal.
- [ ] **6.** Browser Back, then click 'Go Pro'
      **Expect:** Also routes to /coach/new — identical destination to the Season Pass CTA (LandingPage.jsx line 221 uses the same go('/coach/new')). Plan differentiation only happens later at /coach/checkout, which always preselects Season Pass; the buyer must manually re-select Placement Pro there.
- [ ] **7.** Try clicking the footnote SKUs (Boost Pack ₹299 / Single Interview ₹499 / Report Unlock ₹299)
      **Expect:** Nothing happens — it is a plain <p>, not a link or button. These SKUs are only purchasable elsewhere (ladder modal, interview setup/checkout, report page).

  **Edge cases**
  - [ ] Deep link https://renonym.com/#pricing in a fresh tab → After a ~120ms timeout the page auto-scrolls to the pricing section (LandingPage useEffect reading window.location.hash).
  - [ ] Click a '#pricing' anchor while inside the builder or dashboard view → hashchange handler in main.jsx returns to the landing view, then smooth-scrolls to #pricing after 60ms (SECTION_HASHES includes '#pricing').
  - [ ] Hero CTA 'Practice an interview' and coach-section CTA 'From ₹499 — no subscription' → 'Practice an interview' → /coach/new (same as pass CTAs). 'From ₹499 — no subscription' only scrolls to #pricing — it is not a checkout link.

  > ⚠️ KEY FINDING: no landing-page element opens the ladder modal. The comment in PaymentModal.jsx (lines 6-9) claiming the ladder is 'Opened from: … the landing pricing cards' is STALE — landing pass CTAs route to /coach/new. Ladder modal entry points are actually: Dashboard sidebar credit pill, builder out-of-credits gate (402 INSUFFICIENT_CREDITS), builder premium-template crowns/export gate, and CreditGateModal 'Upgrade'.

### J-087 · Full purchase via landing 'Get the Season Pass' (signed-in free user → /coach/new → /coach/checkout → Razorpay)

**Account state:** Signed in as FREE user. To force the checkout route, either keep Audio mode selected, or use an account whose free text interview is already used (freeInterviewUsed=true) — otherwise text mode skips checkout entirely  
**Start at:** https://renonym.com/#pricing → click 'Get the Season Pass'

- [ ] **1.** Land on /coach/new and inspect the right rail with Audio mode selected (default)
      **Expect:** Gold card: badge 'Premium', label 'Single Interview', price '₹499' with 'one interview + full report', and line 'Or 6 interviews + unlimited AI with the Season Pass — ₹1,499 / 90 days.' If the free interview is still unused, a green tip shows: 'Tip: switch to Text mode and your first interview is free.' Audio ModeCard description reads 'Needs a pass or Single Interview (₹499) — your free interview is text'. Stepper reads Set up → Checkout → Interview. Below the CTA: 'You won't be charged until the next step.'
- [ ] **2.** Paste a job description of at least 30 characters and click 'Continue to checkout →'
      **Expect:** Setup calls /coach/me; since the user is not entitled, it routes to /coach/checkout (no charge yet). The draft is saved to sessionStorage so going Back keeps the form.
- [ ] **3.** Inspect /coach/checkout
      **Expect:** Heading 'Unlock your interview', sub 'Choose how you'd like to pay. The AI Interview Coach is a premium feature.' Three radio rows in order: Season Pass ₹1,499/90 days (PRESELECTED, 'MOST POPULAR' badge, note '6 full interviews (audio + text) · unlimited AI · all templates'), Placement Pro ₹2,999/90 days ('25 interviews · everything in Season Pass · priority support'), Single Interview ₹499 ('This one interview (audio or text) + full scored report'). Pay button: 'Pay ₹1,499 & start interview'. Right rail shows YOUR draft (jobTitle · company; type · Voice/Text · N questions) and 'Due today ₹1,499' with 'One-time payment · 90 days · no subscription.'
- [ ] **4.** Select Placement Pro, then re-select Season Pass
      **Expect:** Pay button label tracks the selection: 'Pay ₹2,999 & start interview' / 'Pay ₹1,499 & start interview'; 'Due today' updates likewise. Single Interview shows 'One-time charge for this interview + report.'
- [ ] **5.** Click the pay button
      **Expect:** Status 'Confirming your payment…' appears; Razorpay hosted modal opens (card / UPI / netbanking). Server creates the order via POST /create-order with planId season_1499 (149900 paise; pro_2999=299900, single_499=49900).
- [ ] **6.** Complete the payment
      **Expect:** Status 'Activating your access…' then /coach/me is re-checked; on success status 'Generating your interview…' and redirect to /coach/session/{id} (with ?mode=text if the draft mode was text). Cached user is refreshed so Dashboard/topbar show the new pass without re-login.

  **Edge cases**
  - [ ] JD under 30 characters at setup → Inline error: 'Add a job description (at least 30 characters) so we can tailor the interview.' — no navigation.
  - [ ] /coach/me returns 401 or 402 at setup 'Continue' → Routes straight to /coach/checkout (definitive not-entitled).
  - [ ] /coach/me network error or 500 at setup 'Continue' → Error card: 'Could not verify your access — check your connection and try again.' — deliberately does NOT route to checkout (protects paid users from double-charging).
  - [ ] Dismiss the Razorpay modal (cancel) → No error is shown (Error('CANCELLED') is swallowed in CoachCheckout); the pay button re-enables with its normal label.
  - [ ] Payment captured but entitlement not yet visible on /coach/me → Exact copy: 'Your payment was received, but access hasn't activated yet. Don't pay again — wait a few seconds, reload this page, and tap "Set up interview".' Page flips to paid state; button reads 'Start my interview →' (draft ready) or 'Set up your interview →'. NOTE: the error copy says tap 'Set up interview' but the actual button label differs — minor copy mismatch.
  - [ ] Razorpay checkout.js blocked / offline → Error: 'Could not load Razorpay. Check your connection.' (coach/api.js payAndVerify).
  - [ ] Visit /coach/checkout while signed out → AuthModal (reason 'payment') opens immediately. After auth it re-checks /coach/me first; if entitled → no payment, proceeds; if the check itself fails: 'Could not check your existing access — to avoid charging you twice, tap Pay only if you're sure you haven't bought Coach on this account.'
  - [ ] Free user, Text mode, free interview unused → Setup shows green card 'First interview FREE' ('Your first text interview is on us — 5 questions, real scoring, partial report (full report ₹299 or included with a pass).'), summary forces '5 questions (free)', CTA 'Start your free interview →' — checkout is SKIPPED entirely (backend enforces independently via freeInterviewAvailable).

  > ⚠️ verify-payment trusts order.notes.plan over the body planId (server.js ~2450) — plan swapping client-side cannot upgrade the grant. /coach/checkout?plan=session preselects Single Interview (used by /coach CTAs; a stale comment says '₹599 CTA' but the live price is ₹499).

### J-088 · Entitled user (Season Pass) clicks landing pass CTAs — must never see payment

**Account state:** Signed in with an ACTIVE Season Pass (passType='season', passInterviewsRemaining > 0, not expired). Variant: Placement Pro (passType='placement_pro') or legacy Coach Unlimited (unlimited=true)  
**Start at:** https://renonym.com/#pricing → 'Get the Season Pass' (or 'Go Pro')

- [ ] **1.** Land on /coach/new and wait for /coach/me to resolve
      **Expect:** Stepper labels switch to Set up → Interview → Report (the 'Checkout' label only appears when access.has is false). Right rail shows a gold entitlement card: badge 'Season Pass' (or 'Placement Pro' / 'Coach Unlimited') with a green check and copy 'Your pass is active — N interviews left. This one is included.' (Unlimited: 'Your plan is active — this interview is included. No payment needed.'; Single-Interview credit holder: 'You have N interviews ready — this uses one.')
- [ ] **2.** Check the CTA and footer
      **Expect:** Button reads 'Start interview →'. The 'You won't be charged until the next step.' footnote is absent (only rendered when !access.has). For legacy Unlimited users a gold 'Unlimited' badge shows next to the username in the topbar.
- [ ] **3.** Fill a JD ≥ 30 chars and click 'Start interview →'
      **Expect:** Session is created directly (POST /coach/sessions) and you are redirected to /coach/session/{id} — checkout is never shown. Button shows 'Preparing…' while busy.
- [ ] **4.** Deep-link to /coach/checkout while entitled
      **Expect:** Heading 'You already have Coach access' with body 'No payment needed — your plan is active. Start your interview whenever you're ready.' Plan list, Razorpay info card, and pay button are all hidden. Single button: 'Start my interview →' (if a draft with JD ≥ 30 chars exists in sessionStorage) or 'Set up your interview →' (routes back to /coach/new keeping any partial draft).

  **Edge cases**
  - [ ] Stored token expired — /coach/me returns 401 on /coach/checkout → rn-auth-token and rn-auth-user are removed from localStorage and the AuthModal is shown — an entitled-but-expired user is forced to re-auth instead of being offered payment a second time.
  - [ ] Signed in but /coach/me still in flight on /coach/new (access === null) → No pay card and no free-interview card render; CTA temporarily reads 'Continue →' until the entitlement resolves.
  - [ ] Session creation fails AFTER entitlement confirmed (500/network) → Error shown in place ('Could not start the interview. Please try again.' or server message) — the user is NOT bounced to checkout (entitlement check is deliberately separate from session creation).

  > ⚠️ Backend /coach/me: has = unlimited || passes > 0 || active pass with interviews remaining || interview_credits > 0 (server.js ~2801). Landing itself never changes for entitled users — pricing cards and CTAs render identically regardless of plan; entitlement only surfaces at /coach/new and /coach/checkout.

### J-089 · Ladder modal (PaymentModal) from Dashboard credit pill — the real signed-in purchase surface reachable from landing

**Account state:** Signed in as FREE user with a known credit balance (e.g. 2 signup credits)  
**Start at:** https://renonym.com/ → top-nav 'Dashboard →' → sidebar bottom credit pill

- [ ] **1.** Click 'Dashboard →' on the landing nav
      **Expect:** Dashboard renders (URL stays '/' — navigate() pushes '/'). Sidebar bottom shows the gold credit pill: '⚡ 2 credits' for a free user, or '★ Season Pass · N left' / '★ Placement Pro · N left' for pass holders, with a '+' on the right. Tooltip: 'Credits power tailoring, AI review and AI styles'.
- [ ] **2.** Click the credit pill
      **Expect:** PaymentModal opens (reason 'generic'): title 'Upgrade your job hunt', sub 'One-time payments. No subscriptions. No surprises.' Three selectable cards in display order: Placement Pro ₹2,999 / 90 days, Season Pass ₹1,499 / 90 days (gold hero, floating 'MOST POPULAR' tag, PRESELECTED), Boost Pack ₹299 one-time ('+10 credits', 'Tailoring, AI review, AI styles', 'Valid 6 months'). Footer: 'One-time payment via Razorpay (card / UPI / netbanking). Need just one interview? Single Interview ₹499 is available at interview setup.'
- [ ] **3.** Click the Boost Pack card
      **Expect:** Selection moves (radio dot + gold ring); the pay button re-labels live: 'Get Boost Pack — ₹299' (default was 'Get Season Pass — ₹1,499').
- [ ] **4.** Click the pay button
      **Expect:** Button shows 'Opening secure checkout…'; Razorpay hosted modal opens with order from planId boost_299 (29900 paise).
- [ ] **5.** Complete the payment
      **Expect:** Button shows 'Activating…', the cached user is refreshed via /auth/me, then onSuccess fires: the modal closes and the Dashboard does window.location.reload() — credit pill should now read '⚡ 12 credits' (2 + 10).

  **Edge cases**
  - [ ] Dismiss the Razorpay modal → CANCELLED is suppressed — no error card; the ladder modal stays open and the pay button re-enables.
  - [ ] Payment fails (declined card) → Red error card with the Razorpay failure description, or fallback 'Payment failed — try again.'
  - [ ] Click the dark backdrop while a payment is in flight → Modal does NOT close (backdrop close is guarded by !busy); when idle, backdrop click closes it.
  - [ ] Ladder opened from a builder out-of-credits 402 → Same modal with reason 'credits': title "You're out of credits", sub 'Top up, or go unlimited for the whole season.', plus a gold banner 'You've used N AI actions. Candidates who land interviews tailor their résumé 15+ times.'
  - [ ] Ladder opened from a premium-template crown / gated export in the builder → Reason 'template': title 'Unlock all 10 templates', sub 'Premium templates are included with any pass.' — Boost Pack is HIDDEN (2-column grid, passes only).
  - [ ] Pay clicked with no signed-in user (builder surfaces) → AuthModal (reason 'payment') opens first; on auth success, payment starts automatically with the new user.

  > ⚠️ This modal — not the landing pricing cards — is the only place Boost Pack ₹299 can be bought. Single Interview ₹499 is intentionally NOT in the ladder; it is only at /coach/checkout. Dashboard's onSuccess hard-reloads the page; builder's ladder instead refreshes in place.

### J-090 · PaymentButton.jsx orphan audit — confirm dead code ships nowhere and document live purchase surfaces

**Account state:** None (code + build inspection, plus a browser sweep of the deployed site)  
**Start at:** Repo: /Users/rakshitsegwal/Documents/renonym-react/src/PaymentButton.jsx; then https://renonym.com/

- [ ] **1.** grep -rn "PaymentButton" src/
      **Expect:** Exactly one hit: the component definition at src/PaymentButton.jsx:29. Zero imports anywhere in src/ — the component has NO consumers and is orphaned dead code.
- [ ] **2.** Run npm run build, then grep the dist/assets JS bundles for a string unique to PaymentButton, e.g. 'Failed to load Razorpay. Check your internet connection.'
      **Expect:** No match — Vite tree-shakes the unimported module out of the production bundle. (PaymentModal's distinct copy 'Could not load Razorpay. Check your connection.' WILL be present.)
- [ ] **3.** Sweep the live site for purchase surfaces
      **Expect:** Exactly these and no others: (1) PaymentModal ladder — Dashboard credit pill, builder credit/template gates, CreditGateModal upgrade; (2) /coach/checkout — Season ₹1,499 / Pro ₹2,999 / Single ₹499; (3) report unlock ₹299 on a locked free-session report (planId report_unlock_299). No standalone pay button styled like PaymentButton ('Processing…' label while loading) exists on the landing page or anywhere else.
- [ ] **4.** (Optional, dev only) If someone re-wires PaymentButton: trigger its createOrder call
      **Expect:** POST /create-order fails with 400 {"error":"Missing client session."} — PaymentButton sends only Content-Type + x-api-secret and omits the x-client-id header that the server's validateClientSession middleware on /create-order requires. The component is not just orphaned, it is broken against the current backend.

  **Edge cases**
  - [ ] Re-wired PaymentButton with a retired planId (pro_monthly, pro_yearly, team_monthly, team_yearly, coach_unlimited, coach_unlimited_yearly, session_pass) → Only blocked when LADDER_LIVE=true on Railway → 400 'This plan is no longer available — see the new plans.' Without that env var, retired SKUs would still mint orders (after fixing the x-client-id gap). Verify LADDER_LIVE is set to 'true' in Railway env.
  - [ ] Unknown planId on /create-order → 400 {"error":"Invalid plan ID"}.
  - [ ] PaymentButton's verify-payment call → Sends planId from the prop, but the server uses order.notes.plan as authoritative when they differ (logged as 'planId mismatch'), so no privilege escalation path even if revived.

  > ⚠️ Recommendation surfaced by this audit: delete src/PaymentButton.jsx. It duplicates payAndVerify with stale headers (no x-client-id, verify-payment without x-api-secret), would 400 on /create-order today, and its existence invites accidental reuse. Live purchase plumbing is exclusively coach/api.js payAndVerify, consumed by PaymentModal.jsx and CoachCheckout.jsx.


---

## Interview Coach — Setup, Entitlements & Checkout

### J-091 · Coach landing CTAs route to setup and checkout

**Account state:** Signed out (any browser)  
**Start at:** https://renonym.com/coach

- [ ] **1.** Load /coach
      **Expect:** Dark landing page. Hero pill 'Premium feature · the AI Interview Coach', H1 'Rehearse the interview before it happens.'. Nav links: Interview Coach (active), Résumé Builder (/builder), Applications (/tracker), Dashboard, Pricing (→ /coach/checkout). Right side shows 'Sign in' link (signed out) and gold 'Start an interview' button.
- [ ] **2.** Click hero gold button 'Start an interview'
      **Expect:** Client-side nav to /coach/new (Interview Setup) — no auth wall; setup renders even signed out.
- [ ] **3.** Go back; click hero outline button 'See plans · from ₹499'
      **Expect:** Nav to /coach/checkout with Season Pass preselected (default).
- [ ] **4.** Scroll to bottom premium CTA card
      **Expect:** Two buttons: 'Season Pass · ₹1,499 / 90 days' → /coach/checkout, and 'Single interview · ₹499' → /coach/checkout?plan=session (Single Interview ₹499 preselected).
- [ ] **5.** Click 'Sign in' in the nav
      **Expect:** AuthModal opens (reason='continue'). On successful auth the page does window.location.reload() and stays on /coach; nav now shows avatar + first name linking to /coach/reports.

  **Edge cases**
  - [ ] Signed-in user loads /coach → No 'Sign in' link; avatar pill (first letter, gold) + first name (or 'My interviews') linking to /coach/reports.

  > ⚠️ All CTAs are client-side nav (no full reload) except post-auth reload. The '?plan=session' query is the only deep-link param checkout reads.

### J-092 · Interview setup: résumé upload + JD + role config

**Account state:** Signed in, any entitlement state  
**Start at:** https://renonym.com/coach/new

- [ ] **1.** Load /coach/new
      **Expect:** Topbar: ← back (→ /coach), brand (→ /), 'Dashboard', 'Résumé Studio' (→ /builder), avatar + first name, 'Save & exit'. H1 'Set up your interview', sub 'We'll generate questions from your résumé and this exact role.'. 3-step stepper: '1 Set up' active; step 2/3 read 'Checkout'/'Interview' for non-entitled users, 'Interview'/'Report' for entitled (coachMe.has) users.
- [ ] **2.** Check résumé section with a saved Résumé Studio draft (localStorage rb-draft has fullName)
      **Expect:** Gold card pre-filled: '{fullName} · {title}', 'Using this résumé to tailor your interview', 'Replace' button. Otherwise dashed upload card: 'Upload your résumé' / 'PDF, DOCX or TXT · up to 5 MB. Or skip — we'll tailor from the role.' with 'Browse'.
- [ ] **3.** Upload a valid PDF/DOCX/TXT résumé
      **Expect:** Card shows 'Reading your résumé…' while parsing (client-side pdf.js/mammoth then POST /extract-resume), then the gold confirmed card. Parsed data is also written to localStorage rb-draft. Summary 'Résumé' row switches from 'From the role' to the parsed name.
- [ ] **4.** Fill Company (placeholder 'e.g. Infosys'), Job title (placeholder 'e.g. Senior Salesforce Developer'), paste a JD ≥ 30 chars
      **Expect:** Summary card title becomes '{Job title} · {Company}'. JD hint: 'Paste the full job description — the AI builds questions from it.'
- [ ] **5.** Toggle config chips
      **Expect:** Type: Behavioral (default) / Technical / Mixed / System design / Case. Difficulty: Warm-up(35) / Realistic(66, default) / Brutal(90) with meter bar width = value%. Length: '5 Q' / '6 Q · ~15 min' (default) / '10 Q'. Mode cards: Audio (default, voice orb) / Text. Est. length in summary: 5→'~12 min', 6→'~15 min', 10→'~24 min'. Summary always shows Report: 'Full scored'.
- [ ] **6.** Click 'Save & exit'
      **Expect:** Draft saved to sessionStorage key 'coach-draft' (2-hour TTL) and nav to '/'. Returning to /coach/new within 2h restores company, title, JD, type, length, mode, difficulty.

  **Edge cases**
  - [ ] Click continue button with JD < 30 chars → Red error card: 'Add a job description (at least 30 characters) so we can tailor the interview.' No network call.
  - [ ] Upload file > 5 MB → Error: 'Résumé must be under 5 MB.'
  - [ ] Upload unreadable/empty file (< 30 chars of text) → Error: 'Could not read that file. Try a PDF, DOCX, or TXT.' (fallback copy: 'Could not read that résumé. Try a PDF, DOCX, or TXT.')
  - [ ] coachMe network failure on continue → Error: 'Could not verify your access — check your connection and try again.' User stays on setup — only definitive 401/402 routes to checkout.
  - [ ] JD > 12,000 chars reaches createSession → Backend 400: 'Job description is too long — paste the relevant part (under 12,000 characters).' shown in the red error card.
  - [ ] AI question generation fails server-side → Backend 502 'Could not generate questions. Please try again.' shown in error card; NO entitlement is consumed (consumption happens only after generation succeeds).

  > ⚠️ Résumé upload is optional. Draft survives the checkout round-trip via sessionStorage 'coach-draft'; drafts older than 2h are discarded. While busy the button reads 'Preparing…'.

### J-093 · Free first interview (text-only, 5 questions)

**Account state:** Signed-in free user: free_interview_used=FALSE, no pass (pass_type null or expired), 0 interview_credits, 0 session_passes, not legacy unlimited  
**Start at:** https://renonym.com/coach/new

- [ ] **1.** Load /coach/new and select Text mode
      **Expect:** Green-bordered banner card: badge 'Included' + bold green 'First interview FREE', body: 'Your first text interview is on us — 5 questions, real scoring, partial report (full report ₹299 or included with a pass).' Summary line shows '5 questions (free)' regardless of the selected length chip.
- [ ] **2.** Check the CTA button
      **Expect:** Gold button reads 'Start your free interview →' (only in Text mode for this user). Footnote below: 'You won't be charged until the next step.'
- [ ] **3.** Switch to Audio mode
      **Expect:** Free banner disappears; replaced by the Premium card: badge 'Premium' + 'Single Interview', '₹499' + 'one interview + full report', and 'Or 6 interviews + unlimited AI with the Season Pass — ₹1,499 / 90 days.' A green tip on top: 'Tip: switch to Text mode and your first interview is free.' Audio mode card desc reads: 'Needs a pass or Single Interview (₹499) — your free interview is text'. Button reverts to 'Continue to checkout →'.
- [ ] **4.** Back in Text mode, fill JD ≥ 30 chars and click 'Start your free interview →'
      **Expect:** POST /coach/sessions uses source='free': backend forces exactly 5 questions, marks the session is_free_session=TRUE with report locked, sets free_interview_used=TRUE. Redirect to /coach/session/{id}?mode=text.

  **Edge cases**
  - [ ] Same user tries a second free interview (free_interview_used=TRUE, text mode) → No free banner; coachMe.freeInterviewAvailable=false → setup routes to /coach/checkout on continue. If createSession is hit directly: 402 'You've used your free interview. Get a Single Interview (₹499), or 6 complete interviews with the Season Pass (₹1,499).' code INTERVIEW_REQUIRED.
  - [ ] Free-eligible user picks Audio and clicks continue → Setup treats them as not entitled (free only counts for mode==='text') → nav to /coach/checkout. Direct API call would return 402: 'Audio interviews need a Single Interview (₹499) or a Season Pass — your first TEXT interview is free.'
  - [ ] ACTIVE pass holder (even with interviews left or exhausted) → Free banner never shows — frontend requires !access.passType and backend requires !hasActivePass(u) for source='free'. An exhausted pass holder gets the top-up upsell, never a silently degraded free session.
  - [ ] Two tabs both start the free interview → Atomic consume (WHERE free_interview_used = FALSE); the loser gets 402 'That entitlement was just used up — refresh and try again.'

  > ⚠️ Free path delivers a PARTIAL report server-side (overall + verdict + 1 strength + 1 weakness, locked:true) until unlocked for ₹299 (report_unlock_299) or any interview purchase. Free consumption is also refunded if the session DB insert fails.

### J-094 · Start interview as legacy unlimited (Coach Unlimited)

**Account state:** Signed in with coach_plan='unlimited' and coach_expires null or in the future (legacy retired SKU holder)  
**Start at:** https://renonym.com/coach/new

- [ ] **1.** Load /coach/new
      **Expect:** Topbar shows a gold 'Unlimited' badge next to the user's name. Stepper steps 2/3 read 'Interview'/'Report'. Sidebar shows gold card: badge 'Coach Unlimited' + green check, text 'Your plan is active — this interview is included. No payment needed.' No pricing card, no 'You won't be charged' footnote.
- [ ] **2.** Fill JD ≥ 30 chars, click 'Start interview →'
      **Expect:** Session is created with source='legacy_unlimited' — NOTHING is consumed (no CONSUME entry). Redirect to /coach/session/{id} (voice) or ?mode=text. Works for both Audio and Text, any length (5/6/10).
- [ ] **3.** Visit /coach/checkout directly
      **Expect:** Heading 'You already have Coach access', body 'No payment needed — your plan is active. Start your interview whenever you're ready.' No plan cards, no pay button — only 'Start my interview →' (if a JD-complete draft exists) or 'Set up your interview →' (→ /coach/new).

  **Edge cases**
  - [ ] coach_expires is in the past → Treated as not unlimited (coachAccess returns false); falls down the ladder to pass/credits/legacy passes/free.

  > ⚠️ Ladder priority 1 of 5. Unlimited badge in entitled card only shows when no active pass type takes precedence in the badge logic (passType is checked first).

### J-095 · Start interview as Season Pass holder (N remaining)

**Account state:** Signed in with pass_type='season', pass_expires_at in the future, pass_interviews_remaining = N > 0 (e.g. 6 right after purchase)  
**Start at:** https://renonym.com/coach/new

- [ ] **1.** Load /coach/new
      **Expect:** Sidebar gold card: badge 'Season Pass' + green check, text 'Your pass is active — N interviews left. This one is included.' (singular 'interview' when N=1). Button: 'Start interview →'. Audio and Text both allowed, full length choice honored.
- [ ] **2.** Fill JD, click 'Start interview →'
      **Expect:** POST /coach/sessions resolves source='pass', atomically decrements pass_interviews_remaining by 1 (only after question generation succeeds). Redirect to /coach/session/{id}.
- [ ] **3.** Return to /coach/new
      **Expect:** Card now reads 'Your pass is active — N-1 interviews left. This one is included.'

  **Edge cases**
  - [ ] User also holds interview_credits → Active pass with remaining > 0 is consumed FIRST — credits untouched (ladder order: unlimited → pass → interview_credit → legacy_pass → free).
  - [ ] Session insert fails after consume → Backend refunds: pass_interviews_remaining + 1; user sees 500 'Failed to start interview.'
  - [ ] pass_expires_at lapses (90 days) → hasActivePass false → passType null in coachMe; remaining interviews are unusable; user is treated per the rest of the ladder.

  > ⚠️ Season Pass grants pass_type='season', 90-day expiry, +6 interviews on purchase (stacks onto remaining if an active pass exists).

### J-096 · Start interview as Placement Pro holder

**Account state:** Signed in with pass_type='placement_pro', pass_expires_at in the future, pass_interviews_remaining > 0 (25 on fresh purchase)  
**Start at:** https://renonym.com/coach/new

- [ ] **1.** Load /coach/new
      **Expect:** Sidebar gold card badge reads 'Placement Pro'; same copy pattern: 'Your pass is active — N interviews left. This one is included.' Button 'Start interview →'.
- [ ] **2.** Start an interview (audio or text)
      **Expect:** source='pass' (same consume SQL as Season) — pass_interviews_remaining decremented by 1. Redirect to /coach/session/{id}.

  **Edge cases**
  - [ ] Pro user on other Pro surfaces → hasActivePass also bypasses credit checks on resume-AI endpoints (server lines ~506/561) — pass holders get unlimited AI actions while the pass is active.

  > ⚠️ placement_pro and season share the identical 'pass' ladder slot; only the badge label and granted count (25 vs 6) differ. Purchase: pro_2999, ₹2,999, 90 days.

### J-097 · Start interview with a Single Interview credit

**Account state:** Signed in with interview_credits = N ≥ 1, no active pass, not legacy unlimited  
**Start at:** https://renonym.com/coach/new

- [ ] **1.** Load /coach/new
      **Expect:** Sidebar gold card: badge 'Single Interview' + green check, text 'You have N interview ready — this uses one.' ('interviews' when N > 1). Button 'Start interview →'. Audio allowed.
- [ ] **2.** Fill JD, start
      **Expect:** source='interview_credit' → interview_credits decremented by 1 (atomic, only after questions generate; refunded on insert failure). Redirect to /coach/session/{id}.
- [ ] **3.** Use the last credit, return to /coach/new
      **Expect:** Entitled card gone; if free interview already used, the Premium ₹499 card shows and button reads 'Continue to checkout →'.

  **Edge cases**
  - [ ] User has both interview_credits and legacy session_passes → interview_credit is consumed first (ladder slot 3 before legacy_pass slot 4).
  - [ ] Buying single_499 with a locked free report on file → verify-payment also flips report_unlocked=TRUE on all of the user's free sessions — past partial report becomes full.

  > ⚠️ Granted by plan single_499 (₹499, amount 49900 paise). Replay-protected: a payment_id grants exactly once (rn_payments ON CONFLICT).

### J-098 · Start interview with a legacy Session Pass

**Account state:** Signed in with session_passes = N ≥ 1 (retired ₹599 'session_pass' SKU), no active v14 pass, 0 interview_credits, not unlimited  
**Start at:** https://renonym.com/coach/new

- [ ] **1.** Load /coach/new
      **Expect:** Sidebar gold card: badge 'Session Pass', text 'You have N session pass — this interview uses one.' ('passes' when N > 1). coachMe.has=true via acc.passes > 0.
- [ ] **2.** Start the interview
      **Expect:** source='legacy_pass' → session_passes decremented by 1. Redirect to /coach/session/{id}.

  **Edge cases**
  - [ ] Trying to BUY the retired session_pass SKU via API → Only blocked when Railway env LADDER_LIVE='true': /create-order returns 400 'This plan is no longer available — see the new plans.' If LADDER_LIVE is unset/false, the retired SKU is still purchasable by direct API (the new checkout UI never offers it).

  > ⚠️ Legacy holders keep redeeming passes forever — only new purchases are gated by LADDER_LIVE.

### J-099 · Exhausted pass: setup routes to checkout; 402 top-up message

**Account state:** Signed in with ACTIVE pass (pass_expires_at future) but pass_interviews_remaining = 0  
**Start at:** https://renonym.com/coach/new

- [ ] **1.** Load /coach/new
      **Expect:** coachMe returns has=false, passType='season' (or 'placement_pro'), passInterviewsRemaining=0. NO free banner and NO 'Tip: switch to Text mode…' line (both require !passType). The Premium '₹499' card shows; button 'Continue to checkout →'; stepper step 2 = 'Checkout'.
- [ ] **2.** Fill JD ≥ 30 chars, click 'Continue to checkout →'
      **Expect:** coachMe re-check finds not entitled → nav to /coach/checkout (no charge yet — 'You won't be charged until the next step.'). Draft carried in sessionStorage.
- [ ] **3.** On checkout, select 'Single Interview ₹499' and pay
      **Expect:** After verify: interview_credits + 1; coachMe.has=true; flow proceeds to 'Generating your interview…' → /coach/session/{id}.

  **Edge cases**
  - [ ] POST /coach/sessions hit while exhausted (e.g. last interview consumed in another tab between setup's coachMe check and createSession) → 402, code INTERVIEW_REQUIRED, exact message: 'You've used all the interviews in your pass — add a Single Interview (₹499) to keep going.' In setup this surfaces in the red error card under the button; in checkout's proceed() it shows in the error card.
  - [ ] Exhausted pass holder selects Text mode with free interview never used → Still NOT offered free (backend: source 'free' requires !hasActivePass). 402 path gives the pass-exhausted top-up message, never a degraded free session.

  > ⚠️ freeAvailable in the 402 body is also false for active-pass holders. The 402 message is the backend's, surfaced verbatim by the frontend error cards.

### J-100 · Checkout: plan ladder, payment, and post-purchase return to interview

**Account state:** Signed-in user with no entitlement (has=false), JD-complete draft saved from setup  
**Start at:** https://renonym.com/coach/new → 'Continue to checkout →' (or direct /coach/checkout)

- [ ] **1.** Load /coach/checkout
      **Expect:** Topbar: ← (→ /coach/new), brand, 'Secure checkout' with green lock. H1 'Unlock your interview', sub 'Choose how you'd like to pay. The AI Interview Coach is a premium feature.' Three selectable plan cards, each marked 'one-time': (1) Season Pass — ₹1,499 /90 days, gold 'MOST POPULAR' tag, '6 full interviews (audio + text) · unlimited AI · all templates' — SELECTED by default; (2) Placement Pro — ₹2,999 /90 days, '25 interviews · everything in Season Pass · priority support'; (3) Single Interview — ₹499, 'This one interview (audio or text) + full scored report'.
- [ ] **2.** Check right sidebar
      **Expect:** 'Your interview' card shows the draft: '{jobTitle} · {company}' + '{type} · Text/Voice · N questions' (or 'Your interview' / 'Configure it after unlocking' with no draft). 'What you get' list: 'A full AI mock interview, tailored to this role', 'Voice or text — your answers, really scored', 'A scored report with specific rewrites', 'Saved to your history to re-run anytime'. Below: 'Due today' = selected plan price; Season footnote 'One-time payment · 90 days · no subscription.', other plans 'One-time charge for this interview + report.'
- [ ] **3.** Select a plan and click the pay button
      **Expect:** Button reads 'Pay ₹1,499 & start interview' (price tracks selection). Razorpay info card: 'Payment via Razorpay' / 'Card / UPI / netbanking — entered securely in Razorpay's window. We never see your card details.' Footer: 'Encrypted & secure · Powered by Razorpay · One-time payment, no subscription'. Status 'Confirming your payment…' then Razorpay hosted modal opens (name 'Renonym AI', gold theme #E8C994, email/name prefilled).
- [ ] **4.** Complete payment
      **Expect:** Statuses in order: 'Confirming your payment…' (verify-payment with HMAC signature) → 'Activating your access…' (coachMe re-check + cached user refresh) → 'Generating your interview…' (createSession from draft). Then redirect to /coach/session/{id} (+ '?mode=text' for text drafts) with the draft cleared.
- [ ] **5.** If no JD-complete draft existed
      **Expect:** After payment, button shows 'Set up your interview →' and clicking it navs to /coach/new with any partial draft prefilled.

  **Edge cases**
  - [ ] User dismisses the Razorpay modal → Rejected as 'CANCELLED' — NO error message shown; button returns to 'Pay ₹X & start interview', not charged.
  - [ ] Razorpay payment.failed event → Error card with Razorpay's description (or 'Payment failed').
  - [ ] Payment verified but coachMe still shows has=false → Error card: 'Your payment was received, but access hasn't activated yet. Don't pay again — wait a few seconds, reload this page, and tap "Set up interview".' Button switches to the paid/proceed state so they cannot double-pay.
  - [ ] createSession fails after payment (e.g. 502 AI failure) → Error card with the backend message (e.g. 'Could not generate questions. Please try again.'); button stays 'Start my interview →' for retry — never bounced back to payment.
  - [ ] Open /coach/checkout?plan=session → Single Interview ₹499 preselected instead of Season Pass.
  - [ ] Double-clicking pay → Guarded (if busy return) — only one Razorpay modal.
  - [ ] Replay of an already-redeemed payment_id → verify-payment returns success with replay:true and grants nothing twice.

  > ⚠️ Plan amounts live server-side only (single_499=49900, season_1499=149900, pro_2999=299900 paise); verify-payment derives the plan from the Razorpay ORDER notes, never the client body. Buying single/season/pro also unlocks any locked free-session report.

### J-101 · Checkout while already entitled / stale session

**Account state:** Signed in AND already entitled (unlimited, active pass with remaining, credits, or legacy passes)  
**Start at:** https://renonym.com/coach/checkout (direct or via Pricing nav link)

- [ ] **1.** Load /coach/checkout
      **Expect:** coachMe.has=true → page flips to: H1 'You already have Coach access', sub 'No payment needed — your plan is active. Start your interview whenever you're ready.' Plan cards, Razorpay card, price summary all hidden. Single gold button: 'Start my interview →' (JD-complete draft) or 'Set up your interview →'.
- [ ] **2.** Click the button
      **Expect:** With draft: 'Generating your interview…' → createSession (consumes per ladder) → /coach/session/{id}. Without draft: nav to /coach/new.

  **Edge cases**
  - [ ] Stored token expired (coachMe 401) → rn-auth-token and rn-auth-user are removed from localStorage and AuthModal opens (reason='payment') — an entitled-but-expired user is forced to re-auth instead of being allowed to pay twice.
  - [ ] After re-auth in the modal, entitlement check itself fails (network) → Error: 'Could not check your existing access — to avoid charging you twice, tap Pay only if you're sure you haven't bought Coach on this account.' Payment is NOT auto-triggered.

  > ⚠️ The 'already' state is decided once on mount; it never shows the pay button to entitled users.

### J-102 · Deep-link /coach/new while signed out

**Account state:** Signed out (no rn-auth-token in localStorage)  
**Start at:** Paste https://renonym.com/coach/new into the address bar

- [ ] **1.** Load /coach/new
      **Expect:** Setup page renders fully — no auth wall. No avatar in topbar. coachMe is never called (no token), so access stays null: stepper shows 'Checkout'/'Interview', sidebar shows the Premium ₹499 card (no free banner — that requires a signed-in coachMe response), button reads 'Continue to checkout →'.
- [ ] **2.** Fill JD ≥ 30 chars, click 'Continue to checkout →'
      **Expect:** Draft saved to sessionStorage; coachMe returns 401 ('Authentication required.', code AUTH_REQUIRED) → nav to /coach/checkout.
- [ ] **3.** Checkout mounts signed out
      **Expect:** AuthModal opens immediately (reason='payment') — checkout is a signed-in surface.
- [ ] **4.** Sign in via the modal (Google popup-poll or magic link)
      **Expect:** Token+user written to localStorage, then coachMe is checked: if the account already owns Coach → 'You already have Coach access' state and proceed() auto-creates the session from the draft; if NOT entitled → pay(user) fires IMMEDIATELY and the Razorpay modal opens for the currently selected plan (Season ₹1,499 by default).

  **Edge cases**
  - [ ] Signed-out user eligible for the free text interview signs in at checkout → The post-auth path does NOT consider the free interview (only me.has) — Razorpay opens anyway. Tester: dismiss it (no error, 'CANCELLED' is swallowed), click ← back to /coach/new; now signed in, Text mode shows the 'First interview FREE' banner and 'Start your free interview →'.
  - [ ] Signed in but token present while access still loading (access===null) → Button reads 'Continue →' and no pricing/free card is rendered until coachMe resolves.
  - [ ] Token expired mid-flow on setup continue → coachMe 401 'Session expired. Please log in again.' → routed to /coach/checkout where the 401 handler clears the stale token and opens AuthModal.

  > ⚠️ The draft survives the auth round-trip (sessionStorage, 2h TTL) so the configured interview is what gets created post-auth/post-payment.


---

## Interview Coach — The Session (Text & Audio)

### J-103 · TEXT interview: full run from first question to scored report

**Account state:** Signed in (rn-auth-token in localStorage). Free user with free_interview_used=FALSE, no pass/credits (free path = exactly 5 questions, report will come back partially locked). Any paid entitlement also works (then 5/6/10 questions per setup choice, full report).  
**Start at:** renonym.com/coach/new → fill role, company, paste JD (≥30 chars), pick 'Text' mode → click 'Start your free interview →' (free user) or 'Start interview →' (entitled). Redirects to /coach/session/{id}?mode=text

- [ ] **1.** Land on the text session screen
      **Expect:** Header: avatar initial, '{Job title} · {Company}' with subtitle 'AI interview', blue badge 'Text', pill 'No time limit', counter 'Q1 / 5' (free) and a rose-outlined 'End interview' button. Left sidebar: 'Progress' list of all questions (current row highlighted, gold number chip) plus gold 'Coaching tip' card reading exactly 'Structure with STAR: Situation, Task, Action, Result. End with a number.'
- [ ] **2.** Look at the main pane
      **Expect:** Label 'Coach asks · Question 1 of 5', the question in large serif type (font shrinks for questions >120/>200 chars), subtext 'Answer as you would in the real interview. The coach scores every answer.', textarea autofocused with placeholder 'Type your answer…'
- [ ] **3.** Type a short answer (<40 words, no digits)
      **Expect:** Footer shows '{N} words · ~1 min read', grey badge 'Structure …', and amber badge 'Add a result' (appears because the answer contains no digit)
- [ ] **4.** Extend the answer to ≥40 words and include a number
      **Expect:** Badge flips to green 'Structure ✓'; 'Add a result' badge disappears
- [ ] **5.** Press Cmd/Ctrl+Enter with the textarea EMPTY
      **Expect:** Nothing happens — empty answers are never submitted; the gold button is also disabled when empty
- [ ] **6.** Click 'Submit answer →' (or Cmd/Ctrl+Enter with text)
      **Expect:** Button shows 'Saving…' (POST /coach/sessions/{id}/answers), then Question 2 renders, sidebar Q1 chip becomes a green ✓, textarea is cleared. There are NO AI follow-up probes between questions — the set is fixed at session creation
- [ ] **7.** Answer up to the last question
      **Expect:** On the final question the gold button reads 'Finish →'; submitting it redirects to /coach/session/{id}/complete
- [ ] **8.** Inspect the complete screen (all questions answered)
      **Expect:** Gold orb with check, green badge 'Interview complete', headline 'Nicely done, {first name}.', lead 'You answered 5 of 5 questions for the {Job title · Company} interview. Your report is ready to generate.' Four stats: 'Questions answered' (5/5), 'Duration' (m:ss from created_at to last answer), 'Mode' = Text, 'Words written'
- [ ] **9.** Click 'Generate my report'
      **Expect:** Button text becomes 'Scoring your answers…', footnote appears: 'Building your scored report across clarity, structure, confidence & role fit…' (POST /coach/sessions/{id}/score, 120s client timeout). On success redirects to /coach/report/{id}
- [ ] **10.** Revisit /coach/session/{id}?mode=text after scoring
      **Expect:** All questions have answers → instantly redirected to /coach/session/{id}/complete; since status='scored' the button there is 'View my report' instead of 'Generate my report'

  **Edge cases**
  - [ ] Answer only some questions, then click 'End interview' → Generate report → Complete screen shows headline 'Good work, {name}.' (not 'Nicely done'), stat e.g. 3/5, plus link 'Answer the remaining 2 first' which returns to the session at the first unanswered question. Scoring still works with ≥1 answer; skipped questions go to the scorer as '(skipped)'
  - [ ] Submit an answer to a session that was already scored (e.g. second tab) → Server 409: 'Could not save — this interview may already be scored.' shown in rose text under the composer
  - [ ] AI scoring fails server-side → 502 with 'Could not score the interview. Please try again.' — surfaced as rose error on complete screen, button re-enabled
  - [ ] Hit /score twice (double-click / two tabs) → Idempotent — first scorer wins, second call returns the stored report; no duplicate charge or second AI run
  - [ ] More than 20 AI calls (create+score) from one IP in 15 min → 429: 'Too many AI requests. Please try again in 15 minutes.'
  - [ ] Free session report → Server returns a PARTIAL report (overall + verdict + percentile + 1 strength + 1 weakness; dimensions/fixes/recommendations stripped, locked:true) until unlocked via purchase — enforced server-side via reportIsLocked/partialReport
  - [ ] Answer over 6000 chars / >60 answers appended to one session → Text silently truncated to 6000 chars server-side; append refused once the answers array reaches 60 (409 path)

  > ⚠️ Marketing copy on /coach promises 'Adaptive spoken follow-ups' / 'live follow-ups', but TextInterview.jsx and server.js contain NO follow-up generation — the question set is fixed when POST /coach/sessions runs. Session load failure: 401 silently bounces to /coach; other errors show the message with a 'Back to Coach' button; empty question array shows 'No questions found for this session.'

### J-104 · AUDIO interview: spoken questions, hidden text, recording → Whisper → score

**Account state:** Signed in with interview_credits ≥ 1 OR an active pass with pass_interviews_remaining ≥ 1 (audio is NEVER free — free path is text-only). Use Chrome or Edge to see the live transcript preview. Mic available.  
**Start at:** renonym.com/coach/new → fill setup, pick 'Voice' mode → 'Start interview →' → /coach/session/{id} (no ?mode=text)

- [ ] **1.** Land on the voice session screen for Q1
      **Expect:** Header: '{Job title} · {Company}' / 'AI audio interview', blue badge 'Audio', a running elapsed clock pill (m:ss), 'Q1 / N', 'End interview'. Progress dots under the header. The question TEXT IS HIDDEN: you see only the gold focus-tag badge plus 'Listen carefully — the interviewer is asking your question.' and an underlined 'Show the question' link. A male AI voice (OpenAI 'onyx', MP3 from POST /question-audio) speaks the question. Pill reads 'The interviewer is asking…'. 'Finish answer' is DISABLED while speaking
- [ ] **2.** Wait for the voice to finish
      **Expect:** Browser prompts for microphone (only once per session — stream is persisted). After Allow: pill becomes 'Recording 0:0x — speak your answer' with a ticking timer, hidden-state copy changes to 'Answer out loud, just like the real room.', waveform animates, orb switches to listening state
- [ ] **3.** Speak a few sentences (Chrome/Edge)
      **Expect:** A 'Live transcript · {N} words' card appears below the waveform — finalized text in normal color, interim words in faint grey, updating live (SpeechRecognition preview)
- [ ] **4.** Click 'Show the question'
      **Expect:** Full question text is revealed in large serif; the key phrase (hint) is rendered in italic gold
- [ ] **5.** Click the circular Repeat button (tooltip 'Repeat the question')
      **Expect:** Question re-HIDES (reveal resets every ask), audio replays INSTANTLY from cache (no second /question-audio call), live transcript and recording timer reset, then the mic reopens. This is also the re-record path — previous unsubmitted take is discarded
- [ ] **6.** Speak ≥2 seconds, then click 'Finish answer'
      **Expect:** Button shows 'Transcribing…', pill 'Transcribing your answer…' — the recorded blob (if >2000 bytes) is POSTed raw to /coach/sessions/{id}/transcribe (Whisper: gpt-4o-mini-transcribe, fallback whisper-1, ≤16MB). NOTE: the Whisper transcript is NOT displayed before submit — it is submitted directly as the answer; only the live SR preview was visible. Then advances to the next question (next progress dot, new spoken question, text hidden again)
- [ ] **7.** On a later question click Skip (forward-arrow button, tooltip 'Skip this question')
      **Expect:** Immediately advances to the next question with NO answer recorded; audio/mic for the skipped question stop
- [ ] **8.** Finish/Skip the last question
      **Expect:** Redirect to /coach/session/{id}/complete. Stats show Mode = 'Voice' and 'Words spoken'. If you skipped one: 'Good work, {name}.' + 'Answer the remaining 1 first' link
- [ ] **9.** Click 'Generate my report'
      **Expect:** Same scoring flow as text: 'Scoring your answers…' → /coach/report/{id}. Paid sessions get the full report (report_unlocked=true at creation)

  **Edge cases**
  - [ ] Click 'Finish answer' under 2s of recording with no live-preview text → Rose error: "We didn't catch anything yet — answer out loud, or use Skip / text mode." — nothing submitted
  - [ ] Whisper transcription fails (server 502 'Could not transcribe your answer.' or network) → Silently falls back to the live SpeechRecognition preview text as the answer (console.warn only). If BOTH are empty: "We couldn't hear that clearly. Try answering again, or switch to text mode." and the mic automatically reopens (re-record)
  - [ ] Server TTS fails / autoplay blocked on first question → Falls back to browser speechSynthesis (rate 1.03). If a corrupt cached blob errors, it is purged so Repeat refetches. A watchdog (max 30s) catches speechSynthesis hanging: it reveals the question text and opens the mic anyway
  - [ ] Browser has no speechSynthesis either → Question text is auto-revealed and the mic opens immediately — the candidate is never left with nothing to answer
  - [ ] Browser with no MediaRecorder/getUserMedia AND no SpeechRecognition → Screen: "Your browser doesn't support audio interviews — switching you to text mode…" with a 'Continue in text mode →' button; auto-redirects to /coach/session/{id}?mode=text after ~2.6s
  - [ ] No recorder but SR available, or no usable mic device → If neither recorder nor SR is running after the question: 'No microphone available — switch to text mode to continue.'
  - [ ] >120 audio calls (TTS + transcribe) per IP in 15 min → 429: 'Too many audio requests. Please slow down a little.' (coachMediaLimiter)
  - [ ] Click the Type button ('Switch to text mode') mid-interview → All audio stops; navigates to /coach/session/{id}?mode=text, which resumes at the first unanswered question in the text composer
  - [ ] Answer the same question again after resuming → Server appends a second answer entry; scoring uses the LATEST answer per questionId; resume position is unaffected by duplicates

  > ⚠️ questionAudio has a 30s client timeout, transcribe 90s. Audio per question is cached as object URLs (revoked on unmount). Each ask resets revealQ=false — the listening test re-arms on every question and every Repeat. Generation counter (genRef) makes stale callbacks no-ops, so rapid Skip/Repeat must never double-speak or reopen a dead mic.

### J-105 · AUDIO: microphone permission DENIED

**Account state:** Signed in, audio-entitled (credit or pass). Browser mic permission not yet granted for the site (or pre-blocked).  
**Start at:** Start a Voice session from /coach/new → /coach/session/{id}; when the mic prompt appears after the question is spoken, click Block

- [ ] **1.** Block the microphone permission prompt
      **Expect:** Phase switches to 'denied': a rose-bordered card replaces the orb/waveform — MicOff icon + bold 'Microphone blocked', body: 'Allow microphone access for this site (lock icon in the address bar), then try again — or continue by typing.' Two buttons: 'Try again' (ghost) and 'Switch to text mode' (gold). 'Finish answer' is disabled
- [ ] **2.** Re-allow the mic via the browser lock icon, then click 'Try again'
      **Expect:** getUserMedia retried; on success the recording phase starts (pill 'Recording 0:00 — speak your answer')
- [ ] **3.** Alternatively click 'Switch to text mode'
      **Expect:** Navigates to /coach/session/{id}?mode=text — same session continues in the text composer at the first unanswered question; no entitlement change

  **Edge cases**
  - [ ] Browser without MediaRecorder but with SpeechRecognition (rare) denies mic → SR onerror 'not-allowed'/'service-not-allowed' also routes to the same 'Microphone blocked' card
  - [ ] Deny, then click 'Try again' without unblocking → getUserMedia throws NotAllowedError again → stays on the denied card (no crash, no loop)

  > ⚠️ The mic stream is requested once and persisted for the whole session (one prompt). Denial does not refund anything — the entitlement was consumed at session creation.

### J-106 · Resume an in-progress session from Interview History

**Account state:** Signed in. At least one session with status 'in_progress' where some but not all questions were answered (e.g. abandoned mid-run).  
**Start at:** renonym.com/coach/reports (sidebar 'Reports' from any coach screen)

- [ ] **1.** Open the history page
      **Expect:** Stats row (Total interviews / Average score / Best score / Roles practiced). Table row for the session: score chip '–', subtitle 'In progress', type badge + 'Voice' (blue) or 'Text' badge, relative date ('Today'/'Yesterday'/'N days ago'), and a 'Resume' button (scored sessions show 'View report' instead)
- [ ] **2.** Click 'Resume'
      **Expect:** Navigates to /coach/session/{id} for voice sessions or /coach/session/{id}?mode=text for text sessions
- [ ] **3.** Observe where the session resumes
      **Expect:** Positions at the FIRST question with no recorded answer (duplicates/re-answers don't shift it). Text mode: sidebar shows earlier questions with green ✓. Voice mode: that question is spoken aloud again, text hidden
- [ ] **4.** Resume a session whose questions are ALL answered but unscored
      **Expect:** Immediately redirected to /coach/session/{id}/complete — the last question is never re-shown

  **Edge cases**
  - [ ] Signed-out / expired token hitting history or a session URL → 401 from the API → silently navigated to /coach (coach landing). Direct deep-link to someone else's session id → 404 'Session not found.' shown as the load-error screen with 'Back to Coach'
  - [ ] No sessions at all → Empty state card: 'No interviews yet' / 'Run your first AI interview and your scored reports will appear here.' + 'Start an interview' button
  - [ ] Search box with no matches → 'No interviews match “{query}”.'
  - [ ] Complete screen of a zero-answer session → 'Resume interview →' button there also returns to the session path preserving ?mode=text for text sessions

  > ⚠️ History list caps at 100 sessions, newest first. Sidebar entitlement card copy depends on /coach/me: 'Coach Unlimited — active…', '{Season Pass|Placement Pro} — N interview(s) left.', 'N interview(s) ready to run.', 'N session pass(es) left.', or the upsell button 'Season Pass · ₹1,499'.

### J-107 · Abandon mid-session — entitlement is NOT refunded

**Account state:** Signed in with EXACTLY 1 interview_credit and no pass (so consumption is observable). Works the same for pass interviews and the free text interview.  
**Start at:** renonym.com/coach/reports (note sidebar says '1 interview ready to run.') → 'Start an interview' → /coach/new

- [ ] **1.** Create a session (fill setup, Start interview)
      **Expect:** Questions generate, redirect into the session. The credit is consumed AT CREATION (after question generation succeeds) — not at completion
- [ ] **2.** Without answering anything, click 'End interview' in the header
      **Expect:** Complete screen EMPTY state: amber alert icon, amber badge 'Interview ended early', headline 'No answers recorded.', lead 'You left the {role} interview before answering — there's nothing to score yet. Pick it back up whenever you're ready.' Buttons: 'Resume interview →' and 'My interviews'. NO report button is shown
- [ ] **3.** Go back to /coach/reports and check the sidebar
      **Expect:** Credit is gone — sidebar now shows the upsell 'Season Pass · ₹1,499' (interviewCredits 0). Abandoning does NOT refund: the server REFUND map only fires when the DB insert fails immediately after question generation, never on abandonment. The session remains 'in_progress' and resumable indefinitely
- [ ] **4.** Force the score call on the zero-answer session (e.g. via API or stale tab)
      **Expect:** 400: 'No answers were recorded for this interview. Resume it and answer at least one question, then generate the report.'

  **Edge cases**
  - [ ] Question generation fails at creation (AI error) → 502 'Could not generate questions. Please try again.' and NOTHING is consumed — consumption happens only after generation succeeds
  - [ ] Two tabs race the last credit → Loser gets 402 'That entitlement was just used up — refresh and try again.' (code INTERVIEW_REQUIRED)
  - [ ] No entitlement at all when creating → 402 INTERVIEW_REQUIRED with exact copy: pass exhausted → "You've used all the interviews in your pass — add a Single Interview (₹499) to keep going."; audio wanted with free still available → 'Audio interviews need a Single Interview (₹499) or a Season Pass — your first TEXT interview is free.'; otherwise → "You've used your free interview. Get a Single Interview (₹499), or 6 complete interviews with the Season Pass (₹1,499)."
  - [ ] Legacy unlimited (coach_plan='unlimited', unexpired coach_expires) → No consumption at all — sessions can be created and abandoned freely

  > ⚠️ Entitlement ladder order (server): legacy unlimited → active-pass interviews → interview_credits → legacy session_passes → one free TEXT interview (only if no active pass). Free session forces 5 questions and a server-locked partial report. Closing the tab mid-session behaves identically to 'End interview' — no refund, session stays in_progress.

### J-108 · Question variety: re-running the same JD + résumé yields different questions

**Account state:** Signed in with ≥2 entitlements (e.g. Season Pass). One completed/abandoned session already exists for a given job_title + company.  
**Start at:** renonym.com/coach/new — fill IDENTICAL job title, company, JD and résumé as the previous run

- [ ] **1.** Create the second session and read its questions (reveal them in voice mode, or use text mode)
      **Expect:** A substantially different question set. The server pulls questions from your last 3 sessions matching the SAME job_title OR company and injects up to 18 of them into a 'DO NOT REPEAT' block; the prompt forbids reuse or close paraphrase
- [ ] **2.** Compare angle/emphasis between the two runs
      **Expect:** Each session leans toward 3 randomly chosen lenses out of 8 ('delivery under deadline pressure', 'stakeholder conflict and influence', 'technical depth and trade-offs', 'failure, debugging and lessons learned', 'scale, performance and reliability', 'ownership and cross-team leadership', 'ambiguity and prioritisation', 'metrics and business impact') plus a random seed, temperature 0.85 — expect different themes, not just rewording
- [ ] **3.** Check JD grounding
      **Expect:** At least half the questions explicitly name requirements/technologies from the pasted JD (prompt-enforced); the rest connect the résumé to the role

  **Edge cases**
  - [ ] Change BOTH job title and company on the re-run → Avoid-list lookup matches on job_title OR company exact strings — change both and no prior questions are excluded; only the random lenses/seed provide variety
  - [ ] Avoid-list DB query fails → Never blocks creation — session is created without the avoid list (variety aid only)
  - [ ] Free session re-run → Not possible — free interview is once per account (free_interview_used flips TRUE on first use)

  > ⚠️ This is LLM-driven (gpt-4.1-mini), so 'different' is probabilistic, not guaranteed — flag only if the second set is a near-verbatim repeat. Questions are capped at 400 chars each, ids q1..qN.

### J-109 · Network drop mid-session (text and voice)

**Account state:** Signed in, in-progress session open (run once for a text session, once for voice). Use devtools Network → Offline to simulate.  
**Start at:** /coach/session/{id}?mode=text (text) or /coach/session/{id} (voice), mid-interview

- [ ] **1.** TEXT: type an answer, go Offline, click 'Submit answer →'
      **Expect:** Rose error under the composer (browser fetch error message, e.g. 'Failed to fetch'); the typed answer is PRESERVED in the textarea and the question position does not advance
- [ ] **2.** TEXT: go back Online and submit again
      **Expect:** Saves normally and advances — no duplicate answer for the question (only one submit succeeded)
- [ ] **3.** VOICE: go Offline before a new question loads its audio
      **Expect:** /question-audio fails → seamless fallback to the browser speechSynthesis voice (different, more robotic voice); if that also can't run, the question text is auto-revealed and the mic opens
- [ ] **4.** VOICE: record an answer Offline, click 'Finish answer'
      **Expect:** Whisper transcription fails → the live SpeechRecognition preview text is used silently as the answer; then submitAnswer also fails → rose error ('Failed to fetch' / 'Could not save your answer.') and the MIC REOPENS so you can re-record; nothing is lost server-side
- [ ] **5.** Reload the session page while Offline
      **Expect:** getSession fails → full-screen message (error text) with a 'Back to Coach' button; while loading you'd see 'Loading your interview…' with a pulsing orb
- [ ] **6.** Go Online and reload
      **Expect:** Session resumes at the first unanswered question — every successfully saved answer survived the drop

  **Edge cases**
  - [ ] Very slow network instead of hard drop → Client AbortController timeouts: 90s for answers/transcribe, 30s for question audio, 120s for scoring, 150s for session creation — abort surfaces as an error message, with the same recovery paths as above
  - [ ] Token expires mid-session (401 on load) → Silently navigated to /coach landing; answers already saved remain on the session
  - [ ] Score request drops after the server finished scoring → Re-clicking 'Generate my report' is safe — scoring is idempotent, stored report is returned

  > ⚠️ Answer saves are atomic jsonb appends server-side — a retried submit after an ambiguous failure could in theory append twice, but scoring takes the LATEST answer per questionId, so a duplicate is harmless. Voice 'transcribed securely' footer copy: 'Your answer is transcribed securely — only the text is kept for scoring.'


---

## Interview Coach — Scoring, Reports & ₹299 Unlock

### J-110 · Score a PAID interview and view the FULL report

**Account state:** Signed in with a paid entitlement (season pass / placement_pro / interview_credit / legacy unlimited / legacy session pass). Just finished answering questions in a paid interview session (session created with is_free_session=FALSE, report_unlocked=TRUE).  
**Start at:** Finish the interview → land on /coach/session/<id>/complete (InterviewComplete)

- [ ] **1.** Observe the Interview Complete screen (at least 1 question answered)
      **Expect:** Gold check orb, green badge 'Interview complete', headline 'Nicely done, <firstName>.' if all questions answered else 'Good work, <firstName>.', copy 'You answered X of Y questions for the <Job Title · Company> interview. Your report is ready to generate.' Stats row of 4: 'X/Y Questions answered', 'm:ss Duration', 'Text'/'Voice' Mode, '<n> Words written' (text) or 'Words spoken' (voice). If some questions unanswered, a faint link 'Answer the remaining N first' below the button.
- [ ] **2.** Click 'Generate my report'
      **Expect:** Button shows 'Scoring your answers…' (disabled); caption appears: 'Building your scored report across clarity, structure, confidence & role fit…'. POST /coach/sessions/:id/score runs the AI scorer (client timeout 120s).
- [ ] **3.** Wait for redirect to /coach/report/<id>
      **Expect:** Brief centered spinner 'Generating your report…' then the report renders. Sticky header: back arrow '←' (to /coach/reports), title '<Job Title · Company> — Report', subtitle '<type> · <Mon D> · Text/Voice', buttons 'Export PDF' and '↻ Run it again' (→ /coach/new).
- [ ] **4.** Inspect the hero card
      **Expect:** Animated ScoreRing counting up to overall (0–100, 'out of 100'; ring color green ≥75, gold 60–74, amber <60). Eyebrow 'Your verdict', AI headline (6–8 words), 2–3 sentence summary. If percentile present: 'Questions X/Y' and 'Percentile' e.g. 'Top 25%'.
- [ ] **5.** Inspect dimensions row
      **Expect:** Exactly 4 cards: 'Communication', 'Confidence', 'Structure', 'Technical relevance' — each with a 0–100 score, progress meter, and a ≤12-word note. Cards with score <60 get amber border and amber score.
- [ ] **6.** Inspect strengths/weaknesses
      **Expect:** Two cards side by side: green-dot badge 'Strengths' with 3 items (✓ + title + 1-sentence detail tied to an answer) and amber-dot badge 'Areas to improve' with 3 items (!). NO 'Partial report' locked card anywhere on the page.
- [ ] **7.** Inspect fixes section
      **Expect:** Heading 'The fixes that matter most' with label 'Tied to what you actually said'. 2 cards (the 2 weakest answers): tag badge like 'Q3 · topic', amber score badge, italic paraphrased quote of what you said, then 'Suggested rewrite' (sparkle icon) — the key upgrade phrase rendered in bold (server wraps it in {curly braces}, client bolds it).
- [ ] **8.** Inspect recommendations
      **Expect:** 'Recommended next steps' card with 3 numbered imperative items; item 1 has a gold 'Re-run →' button → /coach/new.
- [ ] **9.** Reload the page or re-open the report later
      **Expect:** Same stored report returns instantly (score endpoint is idempotent — 'first scorer wins'; re-POST returns the stored report, never re-scores).

  **Edge cases**
  - [ ] Leave the interview with ZERO answers, then visit /coach/session/<id>/complete → Amber alert icon, badge 'Interview ended early', headline 'No answers recorded.', copy 'You left the <role> interview before answering — there's nothing to score yet. Pick it back up whenever you're ready.' Buttons: 'Resume interview →' (back to the session, ?mode=text appended for text sessions) and 'My interviews'. No report button at all.
  - [ ] Force-score a zero-answer session (e.g. open /coach/report/<id> directly) → Server 400: 'No answers were recorded for this interview. Resume it and answer at least one question, then generate the report.' — shown centered with a 'Back to history' button.
  - [ ] AI scoring fails (OpenAI error) → 502 'Could not score the interview. Please try again.' — on the Complete screen as rose text under the button; button re-enabled.
  - [ ] Expired/invalid token (401) on load → Silently redirected to /coach (both Complete and Report pages do this).
  - [ ] Non-UUID or someone else's session id in URL → 404 'Session not found.' rendered centered with 'Back to history' button.
  - [ ] Voice-only placeholder answers ('[Spoken answer…') → Not counted as real answers — excluded from the 'X/Y answered' count and from scoring input.

  > ⚠️ Score route is behind aiLimiter — hammering it can 429. The 'View my report' button replaces 'Generate my report' when session status is already 'scored'. Report content (counts of 3/3/2/3 items) comes from the AI prompt contract — minor variation possible but section presence is guaranteed.

### J-111 · Score the FREE interview and see the PARTIAL (locked) report

**Account state:** Signed-in free user: free_interview_used=FALSE, no passes/credits. Run the one free TEXT interview (server forces 5 questions, text mode only; session stored with is_free_session=TRUE, report_unlocked=FALSE). Answer at least 1 question.  
**Start at:** Complete the free interview → 'Generate my report' → /coach/report/<id>

- [ ] **1.** Look at the hero
      **Expect:** Full hero IS shown: overall ScoreRing, verdict headline + summary, 'Questions X/5' and 'Percentile' (e.g. 'Top 40%'). These are NOT locked.
- [ ] **2.** Look for the 4 dimensions row
      **Expect:** ABSENT — server returns dimensions: [] for locked reports, so the real dims grid does not render at all.
- [ ] **3.** Look at strengths/weaknesses
      **Expect:** Exactly ONE strength under 'Strengths' and ONE weakness under 'Areas to improve' (server trims arrays to 1 each via partialReport).
- [ ] **4.** Inspect the locked teaser card (gold card)
      **Expect:** Gold-dot badge 'Partial report'; heading 'Your full report is ready — and locked.'; body: 'Waiting for you inside: scores across all four dimensions, your remaining strengths and weaknesses, your weakest answers quoted with stronger rewrites, and your next steps.' ('quoted with stronger rewrites' in bold). Two buttons: gold 'Unlock your full report — ₹299' and outline 'Or 6 complete interviews — Season Pass ₹1,499'. Below: a blurred (5px blur, 55% opacity, non-clickable) skeleton of 4 cards labelled Communication / Confidence / Structure / Technical relevance, each showing '··' for the score and a 60%-filled meter.
- [ ] **5.** Scroll past the locked card
      **Expect:** No 'The fixes that matter most' and no 'Recommended next steps' sections (server returns fixes: [] and recommendations: []).
- [ ] **6.** Open devtools → Network → reload, inspect GET /coach/sessions/<id>
      **Expect:** Response carries report_locked: true and the trimmed report (dimensions/fixes/recommendations empty, 1 strength, 1 weakness, locked: true). The full report never leaves the server — it stays stored in the DB and only the response is trimmed.

  **Edge cases**
  - [ ] Refresh / re-POST score on the locked session → Score endpoint returns { report: partial, locked: true } every time — locking cannot be bypassed client-side.
  - [ ] Legacy sessions created before the unlock feature → Column migration is 'ADD COLUMN report_unlocked BOOLEAN DEFAULT TRUE' — old free sessions default to unlocked and show FULL reports. Only newly created free sessions are locked.
  - [ ] Free user tries a VOICE interview → Session create returns 402 'Audio interviews need a Single Interview (₹499) or a Season Pass — your first TEXT interview is free.' (code INTERVIEW_REQUIRED) — there is no free voice path to a report.
  - [ ] Free interview already used, tries another → 402: "You've used your free interview. Get a Single Interview (₹499), or 6 complete interviews with the Season Pass (₹1,499)."

  > ⚠️ Lock condition is server-side: reportIsLocked = is_free_session AND NOT report_unlocked. The hero/overall/percentile being visible on the free report is intentional teaser design, not a leak.

### J-112 · Pay ₹299 to unlock the full report (end-to-end)

**Account state:** Signed-in user owning a scored, still-locked free session (Journey 2 completed).  
**Start at:** /coach/report/<id> → locked 'Partial report' card

- [ ] **1.** Click 'Unlock your full report — ₹299'
      **Expect:** Button switches to 'Unlocking…' (disabled). Client calls POST /create-order with planId=report_unlock_299 AND sessionId=<id>; server validates the Bearer JWT, that the sessionId is a UUID, and that the session is owned by you, is_free_session=TRUE and report_unlocked=FALSE — only then creates the Razorpay order with notes { plan: 'report_unlock_299', sessionId } (₹299 = 29900 paise, label 'Full Report Unlock').
- [ ] **2.** Razorpay checkout opens
      **Expect:** Merchant 'Renonym AI', description 'Full Report Unlock', amount ₹299, gold theme (#E8C994), your name/email prefilled.
- [ ] **3.** Complete payment (use a test/real card or UPI)
      **Expect:** Client POSTs /verify-payment. Server verifies the signature, derives the plan from the ORDER notes (never the client body), enforces one-grant-per-payment-id replay protection, re-fetches the order to read notes.sessionId, then runs UPDATE rn_interview_sessions SET report_unlocked=TRUE WHERE id=<sessionId> AND user_id=<you>.
- [ ] **4.** Watch the report page
      **Expect:** Button stays 'Unlocking…' while the page silently refetches. The 'Partial report' card disappears and the FULL report renders: 4 real dimension scores, 3 strengths, 3 weaknesses, 2 fixes with rewrites, 3 recommendations.

  **Edge cases**
  - [ ] Dismiss/close the Razorpay modal without paying → No error message shown (CANCELLED is swallowed); button returns to 'Unlock your full report — ₹299'; nothing charged, report stays locked.
  - [ ] Card declined (payment.failed) → Rose error text under the buttons with Razorpay's failure description, or 'Payment failed'.
  - [ ] Payment captured but grant matched 0 rows (v.grant.rows === 0) → Exact client message: "Payment received but the unlock didn't apply — do NOT pay again; reload in a moment or contact support." Server also releases the redemption row so a verify-payment retry can re-grant.
  - [ ] Not signed in (stale localStorage) when clicking unlock → Client-side: 'Sign in to unlock your report.' Server mirrors it: 401 { error: 'Sign in to unlock your report.', code: 'AUTH_REQUIRED' } at create-order.
  - [ ] sessionId missing/malformed in the unlock request → 400 'Missing interview session for this unlock.' — order is never created, so ₹299 can never be captured with nothing to grant.
  - [ ] verify-payment replayed with the same payment_id → Server answers success with replay: true and grants nothing twice (ON CONFLICT no-op on rn_payments).
  - [ ] Network drop after payment, before refetch → Reload the report URL manually — GET now returns the full report (unlock is persisted server-side).

  > ⚠️ report_unlock_299 is NOT a retired SKU, so it is unaffected by the LADDER_LIVE env flag. The sessionId travels server-to-server via Razorpay order notes — the verify step ignores any sessionId the client might send.

### J-113 · Buying a Season Pass (or any interview product) also unlocks the locked free report

**Account state:** Signed-in user with a scored, locked free-session report; no active pass.  
**Start at:** /coach/report/<id> → locked card → 'Or 6 complete interviews — Season Pass ₹1,499'

- [ ] **1.** Click 'Or 6 complete interviews — Season Pass ₹1,499'
      **Expect:** PaymentModal opens: title 'Keep interviewing', subtitle 'Pick the pass that matches your search.' Only TWO plan cards (Boost Pack is filtered out for reason='interview'): 'Placement Pro ₹2,999 / 90 days' (25 full interviews, Unlimited AI actions, All 10 templates, Priority support) and 'Season Pass ₹1,499 / 90 days' with 'MOST POPULAR' tag, pre-selected (6 full interviews, Unlimited AI actions, All 10 templates, Full scored reports). Footer: 'One-time payment via Razorpay (card / UPI / netbanking). Need just one interview? Single Interview ₹499 is available at interview setup.'
- [ ] **2.** Click 'Get Season Pass — ₹1,499' and pay via Razorpay
      **Expect:** Button cycles 'Opening secure checkout…' → 'Activating…'. On verify, server grants pass_type='season', pass_expires_at=+90 days, +6 pass_interviews_remaining, AND runs UPDATE rn_interview_sessions SET report_unlocked=TRUE WHERE user_id=<you> AND is_free_session=TRUE (ALL your free sessions unlock, not just this one). Cached user is refreshed from /auth/me.
- [ ] **3.** Modal closes; report refetches automatically (onSuccess bumps reloadKey)
      **Expect:** Locked card gone; full report (4 dims, 3 strengths, 3 weaknesses, fixes, recommendations) renders without re-paying ₹299.
- [ ] **4.** Visit /coach/reports and check the sidebar entitlement card
      **Expect:** 'Season Pass — 6 interviews left.' with a 'New interview' button.

  **Edge cases**
  - [ ] Buy Single Interview ₹499 (from interview setup) instead → Same side effect: 'buying ANY interview product unlocks a previously locked free report' — all free-session reports flip to unlocked, plus +1 interview_credits.
  - [ ] Buy Placement Pro ₹2,999 → Same free-report unlock side effect; pass_type='placement_pro', +25 interviews, 90 days.
  - [ ] Buy Boost Pack ₹299 (resume credits) from a credits gate → Does NOT unlock interview reports — boost grants +10 résumé credits only. Free report stays locked. (Boost is also hidden in this modal.)
  - [ ] Dismiss the Razorpay checkout → Modal stays open, no error (CANCELLED swallowed), can retry.
  - [ ] Payment error → Rose error card inside the modal with the failure message or 'Payment failed — try again.'

  > ⚠️ Pass-stacking: buying a pass while one is active adds interviews on top of remaining (GREATEST logic); an expired pass resets to the new count. Grant is keyed to the JWT user, falling back to body userId.

### J-114 · Attempt to unlock an ALREADY-unlocked report (server blocks before money moves)

**Account state:** Free session already unlocked (after Journey 3 or 4). Keep a STALE browser tab still showing the locked teaser card (don't refresh it).  
**Start at:** Stale /coach/report/<id> tab with the locked card visible

- [ ] **1.** Click 'Unlock your full report — ₹299' in the stale tab
      **Expect:** Razorpay NEVER opens. POST /create-order returns 400: 'That report is already unlocked (or the session was not found).' — the SELECT requires id + your user_id + is_free_session=TRUE + report_unlocked=FALSE, which now matches nothing.
- [ ] **2.** Observe the error rendering
      **Expect:** Rose text under the unlock buttons with that exact server message; button returns to normal. No charge of any kind.
- [ ] **3.** Refresh the tab
      **Expect:** Full report renders; locked card gone.

  **Edge cases**
  - [ ] Crafted request with another user's sessionId → Same 400 'That report is already unlocked (or the session was not found).' — ownership enforced in the same query.
  - [ ] Unlock attempted on a PAID session id → Also rejected (paid sessions have is_free_session=FALSE) — same 400 message.

  > ⚠️ This is the up-front guard ('reject up front so ₹299 can never be captured with nothing to grant'). The separate 'do NOT pay again' message (Journey 3) only appears in the rare case payment WAS captured but the grant UPDATE hit 0 rows.

### J-115 · Export the report as PDF

**Account state:** Any scored report open (full or partial), desktop browser.  
**Start at:** /coach/report/<id> → header 'Export PDF' button (download icon, tooltip 'Print or save as PDF')

- [ ] **1.** Click 'Export PDF'
      **Expect:** Native browser print dialog opens (window.print()) — no server call, no credit consumed, no gating.
- [ ] **2.** Check the print preview
      **Expect:** Clean LIGHT document: white background, dark text (gold accents become #8a6d3b brown), the sticky header (back / Export PDF / Run it again) is hidden via .no-print, gold glow effects hidden, cards get white background + light grey borders, and cards avoid splitting across pages (break-inside: avoid).
- [ ] **3.** Choose 'Save as PDF' and save
      **Expect:** PDF of the full report content downloads.

  **Edge cases**
  - [ ] Export a PARTIAL (locked) report → Prints exactly what's on screen: hero + 1 strength + 1 weakness + the teaser card (including the blurred skeleton). No hidden data leaks into print — dims/fixes were never sent to the client.

  > ⚠️ Unlike the résumé builder's server-side /generate-pdf, the interview report uses plain window.print() with a print stylesheet (src/coach.css @media print block). Verify on mobile too per the mobile-first rule — mobile print UX varies by browser.

### J-116 · Interview history: stats, search, resume, retake

**Account state:** Signed in with at least 2 sessions — ideally one scored (status='scored') and one in-progress. Also test once with a brand-new account (0 sessions).  
**Start at:** https://renonym.com/coach/reports (or the '←' back arrow from any report)

- [ ] **1.** Load the page
      **Expect:** Sidebar: gold 'Start an interview' button (→ /coach/new); nav items Dashboard, Applications, Interview Coach (with gold 'Premium' badge), Résumé Studio, Reports (active). Header 'Interview history' with a search input placeholder 'Search interviews'.
- [ ] **2.** Check the entitlement card at the sidebar bottom (driven by GET /coach/me)
      **Expect:** Copy depends on account state: legacy unlimited → 'Coach Unlimited — active. Interview as often as you like.'; active pass → 'Season Pass — N interviews left.' or 'Placement Pro — N interviews left.'; interview credits → 'N interview(s) ready to run.' + 'Start one'; legacy session passes → 'N session pass(es) left.' + 'Use a pass'; nothing → 'Unlimited interviews & reports.' + button 'Season Pass · ₹1,499' → /coach/checkout.
- [ ] **3.** Check the 4-stat row
      **Expect:** 'Total interviews' = session count; 'Average score' = rounded mean of scored sessions ('—' if none scored); 'Best score' = max, rendered in gold; 'Roles practiced' = count of distinct job_title·company pairs.
- [ ] **4.** Inspect a SCORED row
      **Expect:** Score chip (gold-highlighted when ≥70, grey otherwise), '<Job Title · Company>', sub-status 'Scored', type badge + 'Voice' (blue) or 'Text' badge, relative date ('Today' / 'Yesterday' / 'N days ago' / 'Mon D'), score repeated in the Score column, buttons 'View report' (→ /coach/report/<id>) and 'Retake' (→ /coach/new).
- [ ] **5.** Inspect an IN-PROGRESS row
      **Expect:** Score shows '–', sub-status 'In progress', and the action button is 'Resume' → /coach/session/<id> (with ?mode=text appended for text sessions), plus 'Retake'.
- [ ] **6.** Type in the search box
      **Expect:** Rows filter live on job title + company + interview type (case-insensitive). No match → 'No interviews match “<query>”.' Stats row does NOT change (computed from all sessions, not the filtered set).
- [ ] **7.** Click 'Resume' on the in-progress session, answer a question, finish, generate the report, return to history
      **Expect:** Row flips to 'Scored' with its score; 'View report' replaces 'Resume'; stats update.

  **Edge cases**
  - [ ] Brand-new account with zero sessions → Stats show 0 / — / — / 0 and an empty-state card: 'No interviews yet' / 'Run your first AI interview and your scored reports will appear here.' / 'Start an interview' button.
  - [ ] Expired/invalid token → Redirected to /coach (401 handler).
  - [ ] History fetch fails (non-401) → Rose error text — server message 'Failed to load history.' or fallback 'Could not load history.'; stats stay '—'. The /coach/me failure is silent (entitlement card simply doesn't render).
  - [ ] Heavy user → List is capped at the 100 most recent sessions (server LIMIT 100).
  - [ ] 'Retake' on any row → Goes to /coach/new (fresh setup) — it does NOT pre-fill from the old session in this screen. Server-side, a retake for the same role avoids repeating questions from your last 3 sessions for that role/company.

  > ⚠️ A retake consumes entitlement again (pass interview / credit / etc.) — the free interview is one-time (free_interview_used flips on first free session). Locked vs unlocked status is not visible in the list; it only surfaces on the report page.


---

## Application Tracker

### J-117 · Signed-out gate → sign in → land back on tracker

**Account state:** Signed out (no rn-auth-token in localStorage)  
**Start at:** https://renonym.com/tracker (direct URL)

- [ ] **1.** Open /tracker while signed out
      **Expect:** Full-screen dark gate, no API calls fire. Eyebrow 'Application Tracker', heading 'Every job, one pipeline.', body 'Sign in to track applications, recruiters, salaries and follow-ups — wired straight into your résumé and interview prep.', gold button 'Sign in to start'.
- [ ] **2.** Click 'Sign in to start'
      **Expect:** localStorage 'rn-return-to' is set to '/tracker' and you are navigated to '/' (the landing page). No auth modal opens automatically — sign in from the landing page.
- [ ] **3.** Sign in (Google popup or magic link) from the landing page
      **Expect:** On success, handleLogin reads and removes 'rn-return-to' and navigates you straight back to /tracker (not the builder, which is the default when no return-to is set). It also calls /auth/me to refresh the cached user (this is what mints/pulls referralCode and passType).
- [ ] **4.** Observe tracker after landing
      **Expect:** Sidebar: 'Add a job' gold button, nav items Dashboard / Applications (active) / Interview Coach with gold 'Premium' badge / Résumé Studio / Interview Reports. Header 'Applications' with 'Archived' chip, 'Search jobs' input, 'Add job' button. While jobs load: 'Loading your pipeline…'. With zero jobs: card 'Your pipeline is empty' + 'Add the first job you're eyeing — then tailor your résumé to it and rehearse the interview, all from one card.' + button 'Add your first job'.

  **Edge cases**
  - [ ] Session token expired while on /tracker (server returns 401 'Session expired. Please log in again.') → Tracker clears rn-auth-token + rn-auth-user from localStorage and re-renders the same sign-in gate in place. On a job-detail page, a 401 instead navigates back to /tracker (which then shows the gate).
  - [ ] Free user with 0 credits opens tracker → Identical experience to a paying user. No 402, no upsell modal, nothing gated — only sign-in is required.

  > ⚠️ Gate is purely client-side (renders when getToken() is null); backend enforcement is requireAuth on every route — 401 {error:'Authentication required.', code:'AUTH_REQUIRED'} without a token.

### J-118 · Add a job with all fields + JD

**Account state:** Signed in (any plan), tracker open  
**Start at:** /tracker → sidebar 'Add a job' or header 'Add job'

- [ ] **1.** Click 'Add a job'
      **Expect:** Modal 'Add a job' with fields: Company * (placeholder 'e.g. Infosys', autofocused), Job title * ('e.g. Senior Salesforce Developer'), Posting URL ('https://…'), Location ('Remote / Bengaluru…'), Source ('LinkedIn, referral…'), Stage dropdown (Saved/Applied/Interviewing/Offer/Rejected — create only), Salary min, Salary max (number inputs), Currency dropdown (INR default; INR/USD/EUR/GBP/AED/SGD), 'Salary notes (offers, ranges discussed, expectations)' textarea ('e.g. Recruiter opened at 28 LPA, I asked for 34…'), 'Job description (powers tailored résumés & mock interviews)' textarea ('Paste the JD here…').
- [ ] **2.** Click 'Save to pipeline' with Company or Job title blank
      **Expect:** Inline rose error 'Company and job title are required.' — no request is sent. (Server enforces the same with a 400 and the identical message.)
- [ ] **3.** Fill everything (e.g. salary min 2800000, max 3400000, INR, stage Saved, paste a 30+ char JD) and click 'Save to pipeline'
      **Expect:** Button shows 'Saving…' then modal closes and board reloads. Job card appears in the chosen stage column.
- [ ] **4.** Open the new job (click its card)
      **Expect:** Detail page: facts row shows Salary 'INR 28L–34L' (INR amounts ≥1 lakh render as L), Applied '—' (saved stage doesn't stamp applied_at), Added = today, Excitement = 3 gold stars (default). Salary notes line shows below facts. Timeline already contains one 'Stage' event titled 'Added to pipeline as "saved"'.

  **Edge cases**
  - [ ] Create with Stage = Applied / Interviewing / Offer → applied_at is stamped at creation — the 'Applied' fact shows today's date immediately.
  - [ ] Very long inputs → Server silently truncates: company/title/location 255, URL 2000, source 100, JD 12,000 chars, salary notes 2000. No error.
  - [ ] Non-numeric salary → Number inputs block letters; server coerces invalid values to null (salary just shows '—').
  - [ ] 120+ writes within 15 min → 429 with 'Too many changes at once — slow down a little.' shown as the form/page error.

  > ⚠️ Same modal is reused for 'Edit job' on the detail page, where the Stage dropdown is hidden and the button reads 'Save changes' (stage is stripped from the edit payload — stage moves only happen via chips/board select).

### J-119 · Board: stage movement saved → applied → interviewing → offer → rejected

**Account state:** Signed in, at least 1 job in 'Saved'  
**Start at:** /tracker pipeline board

- [ ] **1.** Inspect the board
      **Expect:** Five fixed 250px columns: Saved, Applied, Interviewing, Offer, Rejected — each with a count; empty columns show '—'. Each card: company-initial avatar, title, 'Company · Nd in stage' (or 'today'), optional '↻ {next action} · {due}' line (gold; rose if overdue), and an inline stage <select>.
- [ ] **2.** Change the card's select from Saved to Applied
      **Expect:** PATCH fires (select click doesn't open the detail page — propagation stopped), board reloads, card moves to the Applied column, 'in stage' counter resets to 'today'. applied_at is stamped (first time only). Timeline gains a Stage event 'Moved to "applied"'.
- [ ] **3.** Move Applied → Interviewing
      **Expect:** Card moves to Interviewing; Stage event 'Moved to "interviewing"' logged.
- [ ] **4.** Move Interviewing → Offer
      **Expect:** Card moves to Offer AND the 🎉 Celebrate overlay fires immediately (see the Celebrate journey). Insights 'Offers' stat increments after reload.
- [ ] **5.** Close Celebrate, move Offer → Rejected
      **Expect:** Card moves to Rejected, no overlay. 'Active applications' stat excludes rejected (active = saved+applied+interviewing+offer).
- [ ] **6.** Type in 'Search jobs'
      **Expect:** Cards filter live across all columns by company+title substring (case-insensitive, client-side); column counts reflect the filter.

  **Edge cases**
  - [ ] Stage move fails (network/500) → Rose error above the board: 'Could not move the job.' (or the server's message). 401 instead drops you to the sign-in gate.
  - [ ] Move a job back to a stage it already passed → Allowed — any-to-any moves; each logs a 'Moved to "…"' event. applied_at is never overwritten once set.
  - [ ] Momentum stats → Four cards appear only when ≥1 job and not viewing Archived: 'Active applications', 'Applied this week' with ↑/↓ vs last week (arrow only if last week > 0), 'Response rate' = round(progressed/applied_total×100)% or '—' when nothing applied, 'Offers'.

  > ⚠️ Moving to 'offer' from EITHER the board select or the detail-page stage chips fires Celebrate. Board limit: 500 jobs, ordered by updated_at DESC.

### J-120 · Job detail: edit, archive, delete-as-archive, excitement, next action

**Account state:** Signed in, one job with all fields filled  
**Start at:** /tracker → click any job card (or direct /tracker/job/{uuid})

- [ ] **1.** Inspect header
      **Expect:** Avatar, title, 'Company · Location · via Source', stage chip row (current stage highlighted). Right side: gold 'Practice this interview', ghost 'Tailor résumé to this JD' (both disabled with tooltip 'Add the job description (Edit job) to enable' unless JD ≥30 trimmed chars; hint 'Add the JD to unlock practice & tailoring' shows when disabled), 'Edit job', an external-link button (only if Posting URL set, opens in new tab), and an Archive icon button.
- [ ] **2.** Click a star under 'Excitement'
      **Expect:** Stars 1–N turn gold instantly after the PATCH+reload; value clamps 1–5.
- [ ] **3.** Click 'Edit job', change fields, 'Save changes'
      **Expect:** Same modal as Add but titled 'Edit job', no Stage dropdown; saves and the page reloads. Sending an empty Company/Title in an edit is ignored server-side (nonEmpty guard) rather than blanking the field.
- [ ] **4.** Under 'Next action — always know your next move', type text (e.g. placeholder 'e.g. Email the recruiter about timelines'), pick a datetime, click 'Save'
      **Expect:** Next action persists; the board card now shows '↻ {text} · {due}', and if due within 7 days it appears in the tracker's 'Today' strip as a task.
- [ ] **5.** Click 'Done' next to the saved next action
      **Expect:** 'Done' button (only visible when a next action exists) clears both text and due immediately.
- [ ] **6.** Click the Archive icon
      **Expect:** Browser confirm: 'Archive "{title}" at {company}? You can find it under the Archived filter.' Confirm → job is soft-archived (DELETE /tracker/jobs/:id sets archived=TRUE) and you're returned to /tracker; the job vanishes from the board.
- [ ] **7.** Toggle 'Archived' chip on /tracker, open the job, click 'Unarchive'
      **Expect:** Detail page shows amber banner 'This job is archived.' with 'Unarchive' button; clicking it clears the banner and the job returns to the normal board.

  **Edge cases**
  - [ ] Open /tracker/job/{bad-or-foreign-uuid} → 'Job not found.' message with a 'Back to applications' button (404 from server; non-UUID ids also 404).
  - [ ] 401 on any detail action → Token+user cleared, redirected to /tracker (sign-in gate).
  - [ ] There is no hard delete for jobs → DELETE archives only. Verify a 'deleted' job is recoverable under Archived. (Events DO hard-delete — see timeline journey.)

  > ⚠️ fmtSalary: 'INR 28L–34L' style for INR ≥1 lakh, plain toLocaleString otherwise; single bound renders as 'CUR amount'.

### J-121 · Timeline: log note / round / contact / salary / follow-up, complete and delete events

**Account state:** Signed in, on a job detail page with no events besides the auto Stage entries  
**Start at:** /tracker/job/{id} → composer card below 'Next action'

- [ ] **1.** Look below the composer before logging anything (fresh job)
      **Expect:** If literally no events: 'No activity yet — log your first note, round, or recruiter contact above.' (In practice the auto 'Added to pipeline…' Stage event already exists, so the list shows it.)
- [ ] **2.** Inspect the composer chips
      **Expect:** Five type chips: Note, Interview round, Recruiter contact, Salary, Follow-up. Title placeholder changes per type: round 'e.g. Technical round 2 with the hiring manager', contact 'e.g. Call with the recruiter', salary 'e.g. They opened at 28 LPA', followup 'e.g. Nudge on application status', note 'Title (optional)'. Round/Contact add a 'Who? (name · email)' input; Round/Follow-up add a datetime-local input with hint 'Add a date and it shows up in your daily agenda.' Textarea placeholder: 'Details, names, numbers — future-you will thank you.'
- [ ] **3.** Click 'Log it' with title and body both empty
      **Expect:** Error 'Write something first.' (client-side; server returns the identical 400).
- [ ] **4.** Log an Interview round with title, 'Who?', a due datetime, and body; click 'Log it'
      **Expect:** Button shows 'Saving…', form clears, event appears at the top (newest first) with a blue 'Interview round' badge, bold title, '· {who}', a checkbox+due time (rose if overdue and unchecked), the created date, a trash button, and the body text below.
- [ ] **5.** Log one of each remaining type
      **Expect:** Badge colors: round=blue, followup=gold, note/contact/salary=default grey, offer=green, rejection=amber (last two are system types). Stage events from moves appear with the 'Stage' badge.
- [ ] **6.** Tick the checkbox on the dated round
      **Expect:** PATCH done=true; the item is removed from the /tracker 'Today' agenda strip on next load.
- [ ] **7.** Click the trash icon on an event
      **Expect:** Confirm 'Delete this interview round permanently?' (label matches type, lowercased). Confirm → event is hard-deleted from the timeline.

  **Edge cases**
  - [ ] Limits → Title 255 chars (input maxLength), body 6000 (server truncates), who 200, meta JSON ≤4000 chars or dropped. Timeline shows the 200 most recent events.
  - [ ] Logging an event bumps the job → rn_jobs.updated_at is touched, so the job resorts to the top of its column and its 'gone quiet' suggestion clock resets.
  - [ ] Round due >7 days out → Still appears in the agenda — rounds use a 30-day lookahead window vs 7 days for everything else.

  > ⚠️ Events are the only hard delete in the tracker. The 'who' value renders inline next to the title; there is no edit UI for events (PATCH exists server-side but the UI only toggles done).

### J-122 · 'Today' agenda strip: overdue / today / upcoming, mark done, practice a round, suggested follow-ups

**Account state:** Signed in; one job with a round due yesterday, one with a next action due today, one with a follow-up due in 3 days; plus one job sitting in 'applied' untouched for 8+ days  
**Start at:** /tracker (strip renders above the board, never in Archived view)

- [ ] **1.** Load /tracker
      **Expect:** Section labeled 'Today' with cards bucketed in the BROWSER's timezone: overdue items get a rose border (due shown in rose, e.g. 'Jun 10 3:00 PM'), today's get gold border ('Today 2:00 PM'), upcoming get default border (max 4 upcoming shown). Each card: title (rounds prefixed '🎤 '), underlined 'Company · Job title' link to the job, due time, and a ✓ 'Mark done' ghost button. Next-action items appear here too (kind 'task').
- [ ] **2.** Click ✓ on an event item (e.g. the round)
      **Expect:** Event PATCHed done=true; strip reloads without it.
- [ ] **3.** Click ✓ on a next-action item
      **Expect:** Next action is cleared AND you are navigated to that job's detail page — deliberate 'close the loop: set the NEXT step right away'.
- [ ] **4.** Find the suggestion card for the silent applied job
      **Expect:** Blue-bordered card: 'No reply in {N}d — follow up?' (applied, quiet 7+ days) or 'Gone quiet for {N}d — nudge them?' (interviewing, quiet 14+ days), with the job link and a 'Schedule' button. Suggestions only appear if the job has no pending follow-up event.
- [ ] **5.** Click 'Schedule'
      **Expect:** Creates a follow-up event titled 'Follow up with {company}' due tomorrow 10:00 AM local. Strip reloads: the suggestion disappears (pending follow-up now exists) and the new follow-up shows under upcoming.
- [ ] **6.** Click 'Practice' on a 🎤 round item
      **Expect:** Fetches the job, writes a coach draft (company, title, the job's JD, Behavioral, difficulty 66, voice, 6 questions, résumé from localStorage rb-draft if present) and navigates to /coach/new with all of it prefilled.

  **Edge cases**
  - [ ] Agenda or insights endpoint fails → Errors are swallowed (.catch(() => {})) — the strip/stats simply don't render; the board still works.
  - [ ] No dated items and no suggestions → The entire 'Today' section is absent — no empty state.
  - [ ] Item due earlier today → Buckets as 'today' (gold), not overdue — overdue requires a different calendar date, matching the server's same logic.

  > ⚠️ Server windows: dated events due within 7 days (rounds: 30 days), next actions within 7 days, 50 each; archived jobs excluded. 'Practice' on a round does NOT check the JD length (unlike the detail-page button) — a job with an empty JD still opens coach setup, just without a JD.

### J-123 · PHASE 6: stage → Interviewing with JD shows the gold 'practice this exact one' card → coach setup preloaded

**Account state:** Signed in FREE user (no passType) with a job whose JD is ≥30 chars; repeat once as a season-pass / placement_pro holder  
**Start at:** /tracker/job/{id} → click the 'Interviewing' stage chip

- [ ] **1.** Move the job to Interviewing (chip or board select)
      **Expect:** Detail page re-renders with a gold-bordered card between the header and Next action: '🎤 Interview coming up — practice this exact one.' Subtext for a free user: 'Your JD and résumé are already loaded. From ₹499 — or free in text mode for your first.' Button: 'Practice now →'.
- [ ] **2.** Repeat as a pass holder (any passType set on the cached user)
      **Expect:** Same card but subtext ends 'Your JD and résumé are already loaded. Included in your pass.' instead of the ₹499 line.
- [ ] **3.** Click 'Practice now →' (or the header's 'Practice this interview')
      **Expect:** Coach draft saved to sessionStorage ('coach-draft') with: resumeData = localStorage rb-draft (if it has a fullName) else {}, company, jobTitle, jobDescription = the job's JD, interviewType 'Behavioral', difficulty 66, mode 'voice', length 6. Navigates to /coach/new.
- [ ] **4.** Verify the Interview Setup screen
      **Expect:** Company, Job title and the full JD are prefilled; type Behavioral, length '6 Q · ~15 min', voice mode, difficulty 66 preselected; saved résumé attached if rb-draft existed. Entitlement/payment is only evaluated when you press continue there — the tracker itself never gated anything.

  **Edge cases**
  - [ ] Interviewing but JD missing or <30 trimmed chars → Gold card does NOT render at all. Header buttons disabled with tooltip 'Add the job description (Edit job) to enable' and hint 'Add the JD to unlock practice & tailoring'.
  - [ ] Pass-holder copy uses the CACHED user → getUser() reads localStorage rn-auth-user.passType — freshly purchased pass needs the /auth/me refresh (runs on app mount / sign-in) before the copy flips to 'Included in your pass.'
  - [ ] Move away from Interviewing → Card disappears immediately on reload — it renders only for stage === 'interviewing' && hasJd.

  > ⚠️ The card is informational only — clicking through never charges; payment is enforced downstream in the coach checkout. JD threshold is trimmed length ≥30.

### J-124 · PHASE 6: stage → Offer fires the 🎉 Celebrate overlay with give-5/get-5 referral

**Account state:** Signed in user whose cached rn-auth-user contains a referralCode (any account after one /auth/me refresh — codes are minted there for pre-v14 accounts)  
**Start at:** Board select → 'Offer', or detail-page 'Offer' chip

- [ ] **1.** Move any job to Offer
      **Expect:** Full-screen overlay (zIndex 9000, gold card, glow): 🎉 emoji, gold 'Offer' badge, serif heading 'Congratulations, {FirstName}!' (just 'Congratulations!' if no name on the account), lead 'An offer from {Company}. You earned this.' with the company bolded.
- [ ] **2.** Inspect the referral block
      **Expect:** Card labeled 'Pay it forward — give 5, get 5' with copy 'Know someone still searching? Your link gives them 5 free AI credits — and you get 5 too when they sign up.' and the link 'https://renonym.com/?ref={CODE}' in a gold code box.
- [ ] **3.** Click 'Copy'
      **Expect:** Link copied to clipboard; button swaps to a green check + 'Copied' for 2 seconds, then reverts to 'Copy'.
- [ ] **4.** Click 'Share'
      **Expect:** Native share sheet (where navigator.share exists) with text 'I just landed an offer prepping with Renonym — this link gives us both 5 free AI credits:' and the link; on desktop browsers without navigator.share it falls back to copying.
- [ ] **5.** Click 'Back to the pipeline' (or X, or the backdrop)
      **Expect:** Overlay closes; job sits in the Offer column. Nothing was gated or charged at any point.

  **Edge cases**
  - [ ] No-code account (rn-auth-user has referralCode: null — simulate by deleting the key from localStorage and reloading before the move) → Overlay still fires with the full congratulations, but the entire 'Pay it forward' card is absent — only 🎉 + heading + 'Back to the pipeline'. No broken link is shown.
  - [ ] Referral link redemption (server-side) → New user landing on ?ref={CODE} gets the code stored ('rn-ref-code'); after their sign-in, claim is atomic and once-only: +5 credits to each side ('referral:received'/'referral:given'); repeat claims return {ok:true, already:true} with no extra grants; invalid/own codes 400/404 and the stored code is dropped.
  - [ ] Moving the SAME job to Offer again later (after leaving the stage) → Celebrate fires again — it triggers on every transition into 'offer'.

  > ⚠️ Celebrate is rendered by both Tracker (board moves) and JobDetail (chip moves). Per the component comment it 'Never gates anything.' referralCode availability depends on the /auth/me refresh in main.jsx (runs on mount and on sign-in) — a popup-fresh session may briefly lack it.

### J-125 · Bottleneck insight card at ≥10 applied with 0 interviewing / 0 offers

**Account state:** Signed in with ≥10 non-archived jobs in stage 'applied' and none in 'interviewing' or 'offer' (rejected/saved are fine)  
**Start at:** /tracker (card renders above the momentum stats, not in Archived view)

- [ ] **1.** Load /tracker with the qualifying pipeline
      **Expect:** Amber-bordered card: '{N} applications, no interviews yet — your résumé may be the bottleneck.' (N = applied count), subtext 'An AI review finds exactly what recruiters are skipping over.', gold button 'Run an AI review →'.
- [ ] **2.** Click 'Run an AI review →'
      **Expect:** Navigates to /builder (Résumé Studio gallery). The review itself may consume AI credits there, but the tracker card and click are free.
- [ ] **3.** Move one job to Interviewing and return to /tracker
      **Expect:** Card disappears — any interviewing or offer count suppresses it.

  **Edge cases**
  - [ ] Exactly 9 applied → No card — threshold is applied ≥ 10.
  - [ ] 10 applied but 1 offer (even with 0 interviewing) → No card.
  - [ ] Archived applied jobs → Don't count — insights query filters archived=FALSE.

  > ⚠️ Counts come from GET /tracker/insights stages map; condition in Tracker.jsx: (stages.applied||0) >= 10 && !stages.interviewing && !stages.offer.

### J-126 · Archived toggle

**Account state:** Signed in with ≥1 active and ≥1 archived job  
**Start at:** /tracker → 'Archived' chip in the header

- [ ] **1.** Click the 'Archived' chip
      **Expect:** Chip highlights ('on'), board flashes 'Loading your pipeline…' then shows ONLY archived jobs (server filters archived=TRUE) in the same 5-column layout. The 'Today' strip, bottleneck card, and momentum stats are all hidden in Archived view.
- [ ] **2.** View with no archived jobs
      **Expect:** Card 'No archived jobs' — without the add-your-first-job CTA (that's reserved for the active empty state).
- [ ] **3.** Open an archived job from this view
      **Expect:** Detail shows the amber 'This job is archived.' banner with 'Unarchive'; unarchiving returns it to the active board.
- [ ] **4.** Click the chip again
      **Expect:** Back to the active board; archived jobs hidden (default archived=FALSE filter).

  **Edge cases**
  - [ ] Stage select on an archived job's board card → Still works — stage moves are independent of archived; moving an archived job to Offer even fires Celebrate.
  - [ ] Archived jobs and the agenda → Their dated events, next actions, and follow-up suggestions are excluded server-side (j.archived=FALSE in all agenda queries).

  > ⚠️ Search box also filters within the archived list (client-side).

### J-127 · Tailor-résumé bridge: job detail → Job Match with the JD preloaded

**Account state:** Signed in, job with a JD ≥30 trimmed chars  
**Start at:** /tracker/job/{id} → 'Tailor résumé to this JD' (ghost button, Target icon)

- [ ] **1.** Click 'Tailor résumé to this JD'
      **Expect:** The job's full JD is written to localStorage 'rn-jd-handoff' and you navigate to /builder?mode=jobmatch.
- [ ] **2.** Observe the builder
      **Expect:** ResumeBuilder mounts straight into the BUILD step with the Job Match section active (skips gallery/method). The JD textarea is prefilled with the job's JD, and the 'rn-jd-handoff' key is removed from localStorage (one-shot handoff).
- [ ] **3.** Run the match analysis there
      **Expect:** Job Match analysis runs under the builder's own credit rules — the tracker handoff itself consumed nothing.

  **Edge cases**
  - [ ] JD missing or <30 chars → Button is disabled with tooltip 'Add the job description (Edit job) to enable'; clicking does nothing (guarded by hasJd).
  - [ ] Refresh /builder?mode=jobmatch after the first load → JD is gone (key already consumed) — section still opens on Job Match but the textarea is empty.
  - [ ] JD longer than 12,000 chars in the original posting → Handoff carries the stored (already-truncated-at-12,000) JD.

  > ⚠️ Handled in ResumeBuilder.componentDidMount (initialMode 'jobmatch', src/ResumeBuilder.jsx ~line 341–350).

### J-128 · Zero-paywall sweep + error handling across the tracker

**Account state:** Free user with 0 AI credits, no pass, free interview already used — the most-gated account state possible  
**Start at:** /tracker

- [ ] **1.** Do everything in one session: add 2 jobs, move stages, set/clear next actions, log all 5 event types, complete + delete events, archive/unarchive, star excitement, search, toggle Archived, open Celebrate via an Offer move
      **Expect:** Every single action succeeds. No 402, no credit modal, no 'upgrade' interstitial, no watermarks — the only gate in the whole area is being signed in. (Gates begin only AFTER leaving the tracker: coach checkout for 'Practice', builder credits for 'Run an AI review' / Job Match.)
- [ ] **2.** Kill the network mid-action (e.g. offline, then move a stage)
      **Expect:** Rose error text from the thrown message — e.g. 'Could not move the job.', 'Could not update.', 'Could not schedule.', 'Could not save the job.', 'Could not save.', or 'Could not open the coach.' depending on the action. Page stays usable; retry works once back online.
- [ ] **3.** Let a request hang >30s
      **Expect:** Client AbortController cancels at 30,000 ms; the raw abort message surfaces in the same rose error slot (browser-generic wording, not custom copy).

  **Edge cases**
  - [ ] Server DB down → Every tracker route returns 503 'Tracker not configured.' — shown as the page/board error.
  - [ ] Burst of >120 writes in 15 min (per IP/client) → 429 'Too many changes at once — slow down a little.' GETs are exempt from this limiter.
  - [ ] Tampered/expired JWT → 401 'Session expired. Please log in again.' → frontend silently signs you out and shows the /tracker gate (list view) or bounces to /tracker (detail view).

  > ⚠️ Verified against server.js 3125–3382: tracker middleware is only validateApiSecret + per-method rate limit + requireAuth. No creditCheck/passCheck middleware, no Anthropic calls, no Razorpay touchpoints anywhere in /tracker/*.

### J-129 · First-ever visit to the tracker with zero jobs: empty board, no Today strip, no momentum stats, no insight banner

**Account state:** Signed in (valid rn-auth-token + rn-auth-user in localStorage) with an account that has NEVER created a tracker job (rn_jobs has 0 rows for this user, archived or not). Easiest: brand-new Google/magic-link account.  
**Start at:** Navigate directly to https://renonym.com/tracker (dev: http://localhost:5173/tracker). main.jsx routes path '/tracker' to the Tracker view. Also reachable via in-app sidebar 'Applications'.

- [ ] **1.** Load /tracker and watch the first paint before the jobs request resolves.
      **Expect:** Dark app shell with sidebar (gold 'Add a job' button; nav items Dashboard, Applications [active], Interview Coach with gold 'Premium' badge, Résumé Studio, Interview Reports; your name/initial at bottom). Header row: title 'Applications', an 'Archived' chip, a search input with placeholder 'Search jobs', and a gold 'Add job' button. While jobs === null the FIVE stage columns render (Saved, Applied, Interviewing, Offer, Rejected), each with count 0 and a '—' placeholder, plus the text 'Loading your pipeline…' below the board.
- [ ] **2.** Wait for GET /tracker/jobs to return { jobs: [] }.
      **Expect:** The five-column board and 'Loading your pipeline…' are replaced by a single centered card: heading 'Your pipeline is empty', body text 'Add the first job you're eyeing — then tailor your résumé to it and rehearse the interview, all from one card.', and a gold button with a plus icon labeled 'Add your first job'.
- [ ] **3.** Inspect the area ABOVE the empty-state card for the 'Today' agenda strip.
      **Expect:** No 'Today' label and no agenda cards at all. GET /tracker/agenda returns { overdue: [], today: [], upcoming: [], suggested: [] } for a zero-job user, and Tracker.jsx only renders the Today section when agendaItems.length > 0 or agenda.suggested.length > 0 — so the section is absent, not empty.
- [ ] **4.** Inspect for the 4-card momentum/insights strip ('Active applications', 'Applied this week', 'Response rate', 'Offers').
      **Expect:** Absent. GET /tracker/insights succeeds and returns { stages: {}, appliedThisWeek: 0, appliedLastWeek: 0, responseRate: null, offers: 0, active: 0 }, but the strip is additionally gated on jobs.length > 0, so nothing renders. (Verify in devtools Network tab that /tracker/agenda and /tracker/insights are still called and return 200.)
- [ ] **5.** Inspect for the amber 'résumé bottleneck' banner.
      **Expect:** Absent — it only renders when insights.stages.applied >= 10 with zero interviewing/offer; a zero-job user has stages = {}.
- [ ] **6.** Type anything (e.g. 'infosys') into the 'Search jobs' input.
      **Expect:** Nothing changes — the 'Your pipeline is empty' card persists. The search query only filters board cards (jobs.length === 0 check wins over the filter), no 'no results' variant exists.

  **Edge cases**
  - [ ] Visit /tracker while SIGNED OUT (no rn-auth-token). → Full-screen centered gate instead of the app shell: eyebrow 'Application Tracker', heading 'Every job, one pipeline.', lead 'Sign in to track applications, recruiters, salaries and follow-ups — wired straight into your résumé and interview prep.', and a gold 'Sign in to start' button. Clicking it writes localStorage['rn-return-to'] = '/tracker' and navigates to '/' (landing page) — after signing in there you should be returned to /tracker.
  - [ ] Stale/expired token in localStorage (server answers 401 on /tracker/jobs). → handle401() removes rn-auth-token and rn-auth-user from localStorage and re-renders — the page falls back to the same 'Every job, one pipeline.' sign-in gate without a reload. No error toast.
  - [ ] Backend Postgres not configured / db down (server returns 503). → Red error line above the board with the server's exact message 'Tracker not configured.' (503) or 'Failed to load jobs.' (500). Note: because jobs stays null, the page keeps showing the five empty columns + 'Loading your pipeline…' under the error.
  - [ ] /tracker/agenda or /tracker/insights fails (any status). → Silently swallowed (.catch(() => {}) in Tracker.jsx reload). No error shown; the Today strip and momentum cards are simply absent — indistinguishable from the legitimate zero-job state.
  - [ ] Network hang > 30 seconds on /tracker/jobs. → api.js AbortController aborts at 30000 ms; the thrown AbortError has no .status, so its browser-default message (e.g. Chrome: 'The user aborted a request.' / 'signal is aborted without reason') is shown in the red error line — NOT a friendly copy. Known limitation worth logging if seen.

  > ⚠️ All three calls (jobs, agenda, insights) fire on mount via reload(); auth is the user JWT (Authorization: Bearer) + x-api-secret + x-client-id. In dev the base URL is the /api Vite proxy; in prod it is the hardcoded Railway URL. Loading state quirk: jobs === null renders the EMPTY BOARD COLUMNS (not the empty-state card) plus 'Loading your pipeline…' — only jobs === [] shows 'Your pipeline is empty'.

### J-130 · Archived toggle with zero archived jobs: 'No archived jobs' empty state

**Account state:** Signed in, zero jobs total (same account as journey 1) OR an account with active jobs but nothing ever archived — the archived list is queried separately (GET /tracker/jobs?archived=true).  
**Start at:** On /tracker, click the 'Archived' chip in the header bar (right of the title 'Applications').

- [ ] **1.** Click the 'Archived' chip.
      **Expect:** Chip gains the 'on' (active) style. jobs state is reset to null, so the five empty stage columns + 'Loading your pipeline…' flash briefly while GET /tracker/jobs?archived=true is in flight.
- [ ] **2.** Wait for the archived list to return { jobs: [] }.
      **Expect:** Centered card with heading 'No archived jobs' ONLY — no body paragraph and no 'Add your first job' button (both are guarded by !showArchived). The Today strip, momentum stats, and amber banner are all suppressed in archived view regardless of data (every one is gated on !showArchived).
- [ ] **3.** Click the 'Archived' chip again to toggle back.
      **Expect:** Chip deactivates, jobs resets to null ('Loading your pipeline…' flash), then GET /tracker/jobs (archived=FALSE default) returns [] and the 'Your pipeline is empty' card with 'Add your first job' button reappears.

  **Edge cases**
  - [ ] While in archived view, use the header 'Add job' button (still visible) and save a job. → Modal saves via POST /tracker/jobs (job is created NON-archived), modal closes, and reload() re-fetches with archived=true — so the archived view STILL shows 'No archived jobs'. The new job only appears after toggling the Archived chip off. Confusing but per code.
  - [ ] Search query typed while archived view is empty. → No effect — 'No archived jobs' card persists (same jobs.length === 0 short-circuit as the active board).
  - [ ] 401 on the archived fetch. → Same as journey 1: token cleared, sign-in gate shown.

  > ⚠️ Server defaults to archived=FALSE; the chip sends archived=true as a query param (api.js listJobs builds the querystring, dropping empty values). There is no count badge on the chip, so an empty archive is only discoverable by clicking.

### J-131 · Exit from the empty state: add the first job and watch the board + momentum strip appear

**Account state:** Signed in, zero jobs (fresh from journey 1, sitting on the 'Your pipeline is empty' card).  
**Start at:** Click 'Add your first job' on the empty-state card (equivalently: sidebar 'Add a job' or header 'Add job').

- [ ] **1.** Click 'Add your first job'.
      **Expect:** Modal titled 'Add a job' opens over a blurred dark backdrop. Fields: 'Company *' (placeholder 'e.g. Infosys', autofocused), 'Job title *' (placeholder 'e.g. Senior Salesforce Developer'), 'Posting URL' ('https://…'), 'Location' ('Remote / Bengaluru…'), 'Source' ('LinkedIn, referral…'), 'Stage' select defaulting to 'Saved' (options Saved/Applied/Interviewing/Offer/Rejected), 'Salary min', 'Salary max', 'Currency' defaulting to 'INR' (INR, USD, EUR, GBP, AED, SGD), 'Salary notes' (placeholder 'e.g. Recruiter opened at 28 LPA, I asked for 34…'), 'Job description' (placeholder 'Paste the JD here…'). Gold full-width button 'Save to pipeline'.
- [ ] **2.** Click 'Save to pipeline' with Company and Job title left blank.
      **Expect:** No network call; red inline error 'Company and job title are required.' appears above the button; modal stays open. (Server enforces the same: POST without them returns 400 with the identical message.)
- [ ] **3.** Fill Company = 'Infosys', Job title = 'Senior Salesforce Developer', leave Stage = 'Saved', click 'Save to pipeline'.
      **Expect:** Button shows 'Saving…' and disables. POST /tracker/jobs returns the job (server also logs a stage event titled 'Added to pipeline as "saved"'). Modal closes and the board reloads.
- [ ] **4.** Observe the board after reload.
      **Expect:** The 'Your pipeline is empty' card is GONE. Five columns render; 'Saved' shows count 1 with a card: avatar 'I', title 'Senior Salesforce Developer', subline 'Infosys · today in stage', and a stage dropdown set to 'Saved'. The other four columns show count 0 and '—'.
- [ ] **5.** Check the momentum strip and Today strip after the first job exists.
      **Expect:** Momentum strip NOW appears (jobs.length > 0): 'Active applications' = 1, 'Applied this week' = 0 (no arrow, since last week is also 0), 'Response rate' = '—' (responseRate is null because applied_at is null for a 'saved' job), 'Offers' = 0. The 'Today' strip is STILL absent — the auto-logged stage event has no due_at, and 'suggested' follow-up nudges need a job quiet for 7+ days in 'applied' (or 14+ in 'interviewing').

  **Edge cases**
  - [ ] Close the modal without saving (X button, or click the backdrop outside the card). → Modal closes, empty state unchanged. Clicking inside the card does NOT close it (backdrop close requires e.target === currentTarget).
  - [ ] Create the first job with Stage = 'Applied' instead of 'Saved'. → Server stamps applied_at = now (stages applied/interviewing/offer do this on create). Momentum strip then reads 'Active applications' 1, 'Applied this week' 1, 'Response rate' 0%, 'Offers' 0; the job card lands in the 'Applied' column.
  - [ ] Server error during save (500 / db down 503). → Modal stays open, 'Saving…' reverts to 'Save to pipeline', red inline error shows the server message — 'Failed to save the job.' (500) or 'Tracker not configured.' (503).
  - [ ] Whitespace-only Company/Title (e.g. spaces). → Client check uses .trim() — 'Company and job title are required.' shown, no request sent.

  > ⚠️ Company/title are capped at 255 chars (maxLength on inputs; server slices too), JD at 12000 chars server-side. salaryMin/Max are sent as null when empty. The empty-state-to-board transition is the single observable that proves the zero-job detection (jobs && jobs.length === 0) flips correctly. The amber 'résumé bottleneck' banner still cannot appear until insights.stages.applied >= 10.


---

## Dashboard, Referral E2E & Cross-Navigation

### J-132 · Dashboard signed-out gate and return-to after sign-in

**Account state:** Signed out (no rn-auth-token in localStorage)  
**Start at:** Direct URL: renonym.com/dashboard

- [ ] **1.** Open /dashboard while signed out
      **Expect:** Full-screen dark gate, eyebrow 'Dashboard', heading 'Sign in to see your dashboard.', body 'Your résumés, interview reports and application pipeline live here.', gold button 'Sign in'. No sidebar, no tiles.
- [ ] **2.** Click 'Sign in'
      **Expect:** Redirected to landing page ('/'). localStorage now has rn-return-to = '/dashboard'.
- [ ] **3.** Sign in from the landing page (Google popup or magic link)
      **Expect:** After auth completes, app reads rn-return-to and navigates straight back to /dashboard (not the builder default). rn-return-to is removed from localStorage.

  **Edge cases**
  - [ ] Token in localStorage is expired/invalid → Dashboard renders (token string exists), but the background /auth/me returns 401 → main.jsx clears rn-auth-token + rn-auth-user and sets user null. On next render of landing the user appears signed out.
  - [ ] Signed in but rn-auth-user missing name → Greeting falls back to email prefix: 'Welcome back, {email-before-@}.' Avatar initial falls back to first letter of email, else 'U'.

  > ⚠️ Gate checks only the EXISTENCE of localStorage['rn-auth-token'] (Dashboard.jsx line 23) — a garbage token still shows the dashboard shell until /auth/me 401s. Source: src/Dashboard.jsx 44-56, src/main.jsx 97-103, 186-189.

### J-133 · Dashboard tiles, stats, draft card and empty state

**Account state:** Signed in, free plan. Run twice: (a) with no résumé draft (clear localStorage rb-draft), (b) with a draft saved from the builder (rb-draft has fullName)  
**Start at:** renonym.com/dashboard

- [ ] **1.** Load /dashboard
      **Expect:** Topbar 'Welcome back, {firstName}.' + ghost button 'New résumé'. Gold hero card: badge 'Up next', heading 'Rehearse before the real thing.', button 'Practice an interview' (→ /coach/new).
- [ ] **2.** Read the 4 stat tiles
      **Expect:** Labels exactly: 'Résumés' (1 if rb-draft exists with fullName, else 0), 'Avg interview score' ('—' until scored sessions load; then rounded mean of overall_score), 'Interviews' ('—' while loading, then session count), 'Plan' ('Unlimited' for legacy coach-unlimited, 'Pro' if user.plan==='pro', else 'Free').
- [ ] **3.** Read Quick actions row
      **Expect:** Four cards: 'Build résumé / From scratch or a template' (→ builder gallery), 'Track applications / Your job-search pipeline' (→ /tracker), 'Job match / Score your résumé vs a JD' (→ builder jobmatch mode), 'Start interview / Practice with the AI Coach' (→ /coach/new).
- [ ] **4.** (a) No draft: read 'Your résumés' section
      **Expect:** Empty-state card: 'No résumés yet', 'Create your first résumé to see it here.', gold button 'Build your first résumé →' opening builder gallery.
- [ ] **5.** (b) With draft: read 'Your résumés' section
      **Expect:** One card: '{fullName} — {title}' (title only if set), subline 'Saved on this device · continue where you left off', button 'Open in Studio →' opening builder gallery.

  **Edge cases**
  - [ ] Season Pass holder reads the 'Plan' stat tile → Shows 'Free' — the stat tile only maps unlimited/pro (Dashboard.jsx line 119); pass holders are NOT reflected there (the sidebar pill and plan label are the correct surfaces). Known quirk to confirm, not a regression.
  - [ ] Sessions API fails (network) → Errors swallowed (.catch(() => {})): 'Interviews' and 'Avg interview score' stay '—' forever; no error banner.

  > ⚠️ Résumé count is purely local (rb-draft in this browser), not server data — different on each device. Source: src/Dashboard.jsx 8-11, 94-163.

### J-134 · Credit pill states and plan label permutations

**Account state:** Need one account per state: free with N credits; free with exactly 1 credit; Season Pass active; Placement Pro active; legacy coach-unlimited; user.plan='pro'; legacy session_passes>0; interview_credits>0  
**Start at:** renonym.com/dashboard — sidebar bottom

- [ ] **1.** Free user with N credits: read the gold pill above the avatar
      **Expect:** '⚡ N credits' (exactly '⚡ 1 credit' singular at 1, '⚡ 0 credits' at 0). Tooltip: 'Credits power tailoring, AI review and AI styles'. Plan label under name: 'Free plan' (or 'N interviews ready' if interview_credits>0, 'N session passes' if legacy passes>0).
- [ ] **2.** Season Pass holder: read pill + label
      **Expect:** Pill '★ Season Pass · N left' (N = pass_interviews_remaining; shows '· 0 left' when pass active but exhausted). Plan label '★ Season Pass' in gold-ish text.
- [ ] **3.** Placement Pro holder: read pill + label
      **Expect:** Pill '★ Placement Pro · N left'. Plan label '★ Placement Pro'.
- [ ] **4.** Legacy coach-unlimited: read pill + label
      **Expect:** Pill falls back to '⚡ N credits' (no passType). Plan label '★ Coach Unlimited' in gold. 'Plan' stat tile shows 'Unlimited'.
- [ ] **5.** Watch the label during initial load (throttle network)
      **Expect:** Label shows '—' until /coach/me responds — it must never flash 'Free plan' at a paying user (deliberate, Dashboard.jsx line 33-37).

  **Edge cases**
  - [ ] Pass expired (pass_expires_at in the past) → Server's hasActivePass() returns false → /coach/me and /auth/me both return passType null → pill reverts to '⚡ N credits', label falls through to the next matching state.
  - [ ] /coach/me fails → coach stays null → label stuck on '—' (signed-in), pill shows '⚡ N credits' from cached user. No error UI.

  > ⚠️ Pill pass data comes from /coach/me (passType only when pass is ACTIVE; passInterviewsRemaining 0 when exhausted — backend server.js 2782-2805); credit count comes from user prop refreshed via /auth/me on app mount. Plan label priority order: placement_pro > season > unlimited > pro > loading'—' > session passes > interview credits > 'Free plan'. Source: src/Dashboard.jsx 33-39, 71-90.

### J-135 · Credit pill opens the v14 ladder (PaymentModal) — incl. cancel path

**Account state:** Signed in, any plan  
**Start at:** /dashboard → click the gold credit pill in the sidebar

- [ ] **1.** Click the pill
      **Expect:** Ladder modal opens (reason 'generic'): title 'Upgrade your job hunt', sub 'One-time payments. No subscriptions. No surprises.'
- [ ] **2.** Read the three plan cards
      **Expect:** Placement Pro ₹2,999 / 90 days (25 full interviews, Unlimited AI actions, All 10 templates, Priority support); Season Pass ₹1,499 / 90 days with 'MOST POPULAR' tag and PRE-SELECTED (gold ring); Boost Pack ₹299 one-time (+10 credits, Tailoring/AI review/AI styles, Valid 6 months). CTA reads 'Get Season Pass — ₹1,499'. Footer: 'One-time payment via Razorpay (card / UPI / netbanking). Need just one interview? Single Interview ₹499 is available at interview setup.'
- [ ] **3.** Select Boost Pack
      **Expect:** CTA changes to 'Get Boost Pack — ₹299'.
- [ ] **4.** Click CTA, then dismiss the Razorpay sheet (X / back)
      **Expect:** Returns to the ladder with NO error message (CANCELLED is swallowed), button re-enabled. While opening, button text cycles 'Opening secure checkout…' → after pay 'Activating…'.
- [ ] **5.** Complete a real/test payment
      **Expect:** /verify-payment runs, cached user refreshed via /auth/me, then Dashboard's onSuccess fires window.location.reload() — page reloads and the pill reflects the new balance/pass.
- [ ] **6.** Click backdrop or X
      **Expect:** Modal closes (backdrop click ignored while busy).

  **Edge cases**
  - [ ] Payment fails (declined card) → Rose error card inside the modal with Razorpay's failure description or 'Payment failed — try again.'
  - [ ] Not signed in when pressing CTA (token cleared mid-session) → AuthModal opens (reason 'payment'); after auth, payment resumes automatically with the same selected plan.
  - [ ] Old retired SKU attempted while LADDER_LIVE=true on Railway → /create-order returns 400 'This plan is no longer available — see the new plans.' (server.js 2366-2369). The three ladder SKUs (pro_2999/season_1499/boost_299) are unaffected.

  > ⚠️ Razorpay key from order response; checkout prefills name/email. Source: src/PaymentModal.jsx (LADDER 10-26, pay 68-88), src/coach/api.js payAndVerify 169-197, src/Dashboard.jsx 60-61.

### J-136 · REFERRAL E2E — give 5 / get 5 happy path

**Account state:** User A: signed in, has referralCode (any account that has loaded the app post-v14); note A's current credit balance. User B: a brand-new email NEVER used on Renonym, tested in an incognito window  
**Start at:** A: /tracker → a job card or /tracker/job/{id} → move stage to 'Offer'

- [ ] **1.** A: set any tracked job's stage to Offer
      **Expect:** Celebrate modal: 🎉, gold 'Offer' badge, 'Congratulations, {FirstName}!', 'An offer from {company}. You earned this.', card 'Pay it forward — give 5, get 5' with copy 'Know someone still searching? Your link gives them 5 free AI credits — and you get 5 too when they sign up.' and the link 'https://renonym.com/?ref={CODE}' ({CODE} = 8 uppercase A–Z/0–9 chars).
- [ ] **2.** A: click 'Copy'
      **Expect:** Button flips to a green check + 'Copied' for 2 seconds; link is on the clipboard. ('Share' uses the native share sheet on mobile, falls back to copy.)
- [ ] **3.** B (incognito): open the copied https://renonym.com/?ref={CODE}
      **Expect:** Landing page loads normally — no visible referral UI. DevTools → localStorage: rn-ref-code = {CODE} (uppercased, max 16 chars).
- [ ] **4.** B: sign up (Google popup or magic link) with the fresh email
      **Expect:** On auth, frontend silently POSTs /referral/claim {code}. Network tab: 200 {ok:true, granted:5}. localStorage rn-ref-code is removed.
- [ ] **5.** B: open /dashboard (reload once if needed)
      **Expect:** Sidebar pill: '⚡ 7 credits' — 2 signup credits (granted once on account creation) + 5 referral credits.
- [ ] **6.** A: reload /dashboard
      **Expect:** A's pill shows previous balance + 5 (grant reason 'referral:given'). A sees nothing in real time — only after a refresh re-runs /auth/me.

  **Edge cases**
  - [ ] B checks credits immediately after the popup closes → May briefly show '⚡ 2 credits' — tryClaimReferral and refreshUserFromServer fire in parallel (main.jsx 182-183), so /auth/me can land before the claim commits. A reload shows 7. Race, not a loss: the grant is transactional server-side.
  - [ ] Network drops during the claim request → rn-ref-code is KEPT (only 400/404 delete it) — the claim retries automatically on B's next sign-in or app mount with a token.
  - [ ] B opens the link but signs up days later in the same browser → Still works — rn-ref-code persists in localStorage; claim fires on first signed-in mount.
  - [ ] B opens the link signed-out and never signs up → Nothing happens; tryClaimReferral exits when there is no rn-auth-token.

  > ⚠️ Claim is entirely silent — there is NO success toast for either side; verification is via the credit pill and the Network tab. Claim+both grants commit in one DB transaction (server.js 3103-3116). Code is minted at signup (server.js 1926-1928) or lazily on /auth/me. Frontend: src/main.jsx 65-83, src/tracker/Celebrate.jsx, src/coach/api.js line 58.

### J-137 · Referral failure paths — own code (400), invalid code (404), repeat claim ({already:true})

**Account state:** Self-claim: User A signed in, knows own code. Invalid: any signed-in user. Repeat: User B who has ALREADY been referred once (referred_by set)  
**Start at:** renonym.com/?ref={CODE} with DevTools Network tab open

- [ ] **1.** A (signed in, same browser): open renonym.com/?ref={A's-own-CODE}
      **Expect:** Page loads; claim fires on mount; Network: POST /referral/claim → 400 {error: "You can't refer yourself — share the link instead!"}. No UI error shown (silently swallowed). localStorage rn-ref-code is REMOVED (400 ⇒ drop, never retried). Credit balance unchanged.
- [ ] **2.** Any signed-in user: open renonym.com/?ref=NOTAREAL1
      **Expect:** Network: 404 {error: 'Unknown referral code.'}. Silently dropped, rn-ref-code removed, no credits, no UI.
- [ ] **3.** B (already referred): open a DIFFERENT valid user's link renonym.com/?ref={CODE2} and reload while signed in
      **Expect:** Network: 200 {ok:true, already:true} — referred_by is the atomic once-only guard, so NO credits are granted to anyone (neither B nor CODE2's owner). Frontend treats 200 as success and removes rn-ref-code.
- [ ] **4.** Send a claim with an empty code (curl only)
      **Expect:** 400 {error: 'Missing referral code.'}; server error during grant → 500 {error: 'Could not apply the referral.'}; DB down → 503 {error: 'Referrals not configured.'}

  **Edge cases**
  - [ ] 21+ POSTs to /referral/claim from one IP within 15 minutes (curl loop; needs x-api-secret + Bearer token) → Requests beyond 20 get 429 {error: 'Too many attempts — try again later.'} (limit 20/15min mounted on all of /referral). Frontend keeps rn-ref-code on 429 (not 400/404) and retries next sign-in.
  - [ ] ?ref with junk, e.g. ?ref=abc def!@#toolongvalue1234 → Frontend stores trim().toUpperCase().slice(0,16); server re-normalizes the same way before lookup — mismatched garbage just 404s and is dropped.

  > ⚠️ All referral outcomes are invisible in the UI by design — test via Network tab + credit pill before/after. Backend: server.js 3082-3124. Frontend drop rule: main.jsx 79-82.

### J-138 · Pre-v14 account — referral code lazily minted on first /auth/me

**Account state:** An account created BEFORE v14 (rn_users.referral_code IS NULL — verify in DB), signed out everywhere  
**Start at:** renonym.com → sign in with the old account

- [ ] **1.** Sign in and let the app settle (it calls /auth/me on mount/login)
      **Expect:** Server detects referral_code NULL and mints an 8-char uppercase code in the same request (up to 3 retries on unique collision); /auth/me response includes referralCode. main.jsx writes it into localStorage rn-auth-user.
- [ ] **2.** Open /tracker, move any job to Offer
      **Expect:** Celebrate modal now INCLUDES the 'Pay it forward — give 5, get 5' card with https://renonym.com/?ref={newCODE}. (If referralCode were still null, that whole card is hidden and the link falls back to plain https://renonym.com.)
- [ ] **3.** Verify in DB (optional)
      **Expect:** rn_users.referral_code is now permanently set for that user; subsequent /auth/me calls return the same code.

  **Edge cases**
  - [ ] User opens Celebrate BEFORE the /auth/me refresh has completed (very fast click after sign-in) → Cached slim user from the OAuth popup has no referralCode → referral card hidden, 'Share' would use bare https://renonym.com. Close and reopen after a second — the card appears.
  - [ ] All 3 mint attempts collide (effectively impossible) → /auth/me still returns 200 with referralCode: null; card stays hidden; next /auth/me retries.

  > ⚠️ Codes are minted ONLY inside GET /auth/me (server.js 2163-2170) — no backfill job. An old user who never reopens the app post-v14 has no code. Celebrate reads the localStorage copy (src/tracker/Celebrate.jsx 10-12), which only refreshUserFromServer / refreshCachedUser populate.

### J-139 · Dashboard sidebar + quick-action navigation to Builder / Coach / Tracker

**Account state:** Signed in  
**Start at:** renonym.com/dashboard

- [ ] **1.** Click sidebar 'Start an interview' (gold button)
      **Expect:** URL → /coach/new (Interview Setup screen).
- [ ] **2.** Back; click 'Applications'
      **Expect:** URL → /tracker (Application tracker, 'Applications' active in its sidebar).
- [ ] **3.** Back; click 'Interview Coach' (with gold 'Premium' badge)
      **Expect:** URL → /coach (Coach landing page with marketing topnav).
- [ ] **4.** Back; click 'Résumé Studio'
      **Expect:** Builder opens in gallery mode — NOTE: URL stays '/' (Dashboard uses onOpenBuilder → history-state navigation, not a path). Browser Back returns to the dashboard.
- [ ] **5.** Back; click 'Job Match'
      **Expect:** Builder opens directly in Job Match mode (jobmatch entry), URL again '/'.
- [ ] **6.** Back; click 'Interview Reports'
      **Expect:** URL → /coach/reports (Interview History, 'Reports' active).
- [ ] **7.** Click the ↩ button next to your name
      **Expect:** Logout: rn-auth-token + rn-auth-user cleared, redirected to the landing page.

  **Edge cases**
  - [ ] Hard-refresh after Dashboard→'Résumé Studio' (URL is '/') → Lands on the LANDING page, not the builder — history state is lost on refresh. By contrast, /builder reached from Tracker/Reports sidebars survives refresh. Known asymmetry.
  - [ ] Browser Back from /coach/new to dashboard → popstate restores the dashboard view (path-based coach routes are authoritative; '/' falls back to history state).

  > ⚠️ Two navigation systems coexist: onOpenBuilder(mode) (state-driven, URL '/') vs onNavigate/navPath (real paths). Source: src/Dashboard.jsx 62-92 & 126-139, src/main.jsx 149-177.

### J-140 · Sidebar/topnav consistency sweep across coach + tracker screens

**Account state:** Signed in  
**Start at:** Visit in order: /dashboard, /tracker, /coach/reports, /coach, /coach/new, /tracker/job/{id}

- [ ] **1.** /dashboard sidebar inventory
      **Expect:** Brand, gold 'Start an interview', then: Dashboard (active), Applications, Interview Coach +Premium badge, Résumé Studio, Job Match, Interview Reports. Bottom: gold credit pill + avatar/plan label + ↩ logout. (Only the dashboard has the Job Match item and the credit pill.)
- [ ] **2.** /tracker sidebar inventory
      **Expect:** Brand, gold 'Add a job', then: Dashboard, Applications (active), Interview Coach +Premium, Résumé Studio (→ /builder), Interview Reports. NO Job Match, NO credit pill, NO logout — bottom is just avatar + name.
- [ ] **3.** /coach/reports sidebar inventory
      **Expect:** Same five items; active item labelled 'Reports' (not 'Interview Reports'). Résumé Studio → /builder. NO Job Match, NO pill.
- [ ] **4.** /coach (Coach landing) topnav
      **Expect:** Horizontal marketing nav, not a sidebar: brand → '/', links Interview Coach (active), Résumé Builder (→ /builder), Applications (→ /tracker), Dashboard (→ /dashboard), Pricing (→ /coach/checkout); right side avatar→/coach/reports (or 'Sign in') + gold 'Start an interview' → /coach/new.
- [ ] **5.** /coach/new (Interview Setup) top bar
      **Expect:** Minimal bar: '←' → /coach, brand → '/', right links: Dashboard, Résumé Studio (→ /builder).
- [ ] **6.** /tracker/job/{id} top bar
      **Expect:** '←' → /tracker, brand → '/', right links: Applications (→ /tracker), Dashboard (→ /dashboard).
- [ ] **7.** From /tracker or /coach/reports click 'Résumé Studio'
      **Expect:** URL → /builder, builder opens in gallery mode; hard refresh on /builder stays in the builder (parseLocation handles the path).

  **Edge cases**
  - [ ] Click 'Dashboard' from any coach/tracker sidebar while signed in → Always lands on /dashboard with currentUser intact (navPath re-parses location; Dashboard re-fetches /coach/me + sessions fresh each mount).
  - [ ] Naming drift check → EXPECTED inconsistencies per code: 'Interview Reports' (dashboard/tracker) vs 'Reports' (history screen); 'Résumé Builder' (coach topnav) vs 'Résumé Studio' (sidebars); Job Match exists only on the dashboard sidebar. Flag anything beyond these.

  > ⚠️ Source: src/Dashboard.jsx 62-92, src/tracker/Tracker.jsx 96-108, src/coach/InterviewHistory.jsx 33-75, src/coach/CoachLanding.jsx 24-46, src/coach/InterviewSetup.jsx 103-111, src/tracker/JobDetail.jsx 270-280.


---

## Mobile Pass (Cross-Cutting)

### J-141 · Full builder run on a 390px phone: gallery → method → build → export

**Account state:** Signed-in free user (new account = 2 AI credits, no pass). Phone or DevTools device emulation at 390px width, touch enabled.  
**Start at:** https://renonym.com/builder (or landing → 'Build a résumé free')

- [ ] **1.** Open /builder at 390px
      **Expect:** Template gallery, single-column tile grid (≤480px: .rp-gallery__grid → 1fr; 481-768px: 2 columns). Title 'Choose your template' at 22px. Topbar shows '← Back' + 'Choose a Template'; the '10 Templates' step pill is HIDDEN at ≤480px (.rp-topbar__step-pill{display:none}). No horizontal scroll (overflow-x hidden guard on .rp-gallery).
- [ ] **2.** Tap a free template tile (Classic Pro, Minimal ATS, or Nordic Clean — FREE_TEMPLATES_V14 = sf-classic, sf-minimal, nordic-clean)
      **Expect:** On touch the 'Use Template' hover overlay never appears (hover:none → .rp-tpl-tile__hover-cta{display:none}); the tile gets a ✓ check. A fixed bottom CTA bar slides up, stacked vertically at ≤768px: 'Selected: <name>' above the 'Use this template →' button, with iOS safe-area bottom padding (calc(12px + env(safe-area-inset-bottom))).
- [ ] **3.** Note premium tiles
      **Expect:** All 7 non-free tiles show a gold '👑 PASS' badge top-left (title tooltip 'Included with any pass') because user has no pass.
- [ ] **4.** Tap 'Use this template →'
      **Expect:** Method screen 'How would you like to start?' with the two cards STACKED in one column (≤768px: .rp-method-grid → 1fr): 'Import Resume' (PDF, DOC, DOCX) and 'Build from Scratch'.
- [ ] **5.** Tap 'Build from Scratch'
      **Expect:** Builder loads stacked vertically (≤1024px): a horizontal, swipe-scrollable sidenav strip under the topbar (scrollbar hidden, -webkit-overflow-scrolling: touch). At ≤768px labels are hidden — icons only: 👤 ⚡ 💼 🎓 🎨 | 🎯. Tap targets ≥44px (hover:none rule min-height:44px).
- [ ] **6.** Inspect the topbar
      **Expect:** Section pills (rp-topbar__center) hidden ≤1100px; font family/size controls hidden ≤1100px; template <select> shrunk to max-width 90px at ≤768px and FULLY HIDDEN at ≤480px; 'AI Review' ghost button HIDDEN at ≤760px (.rp-topbar__actions .rp-btn--ghost{display:none}) — AI Review has no other entry point in BUILD, so it is unreachable on phones (known gap). 'Export PDF' remains, shrunk (h30/12px at ≤768, h28/11.5px at ≤480). Back button + page title stay (they live in .rp-topbar__back-title, not __actions).
- [ ] **7.** Fill Profile: Full Name, Title, Email, Phone, Location, LinkedIn, Summary
      **Expect:** Field rows collapse to one column (.rp-field-row → 1fr). Inputs are 16px font !important and min-height 44px at ≤768px — iOS must NOT zoom on focus. Tap 'Next: Skills →' to advance sections.
- [ ] **8.** Scroll down to the Live Preview
      **Expect:** Preview section below the editor, 'Live Preview' header + 'A4' badge. The A4 page is scaled: scale(0.46) at ≤768px (0.38 at ≤480px, 0.34 at ≤360px), transform-origin top center, with height-based negative margin (margin-bottom: calc(-1122px * 0.54) !important at ≤768) — there must be NO large dead gap under the preview and no horizontal scroll.
- [ ] **9.** Tap 'Export PDF' (signed in, free template, Full Name filled)
      **Expect:** Status banner 'Generating PDF…' (info) at top of editor, then a PDF named '<FullName with non-word chars→_>.pdf' downloads and status shows 'PDF downloaded successfully.'

  **Edge cases**
  - [ ] Export with empty Full Name → Status (error): 'Please fill in your Full Name before exporting.' — no network call.
  - [ ] Export while signed out → AuthModal opens: title 'Sign in to export', sub 'Create a free account to download your resume PDF.' After sign-in the export auto-retries (authReason === 'export' → _refreshUser().then(handleExport)).
  - [ ] Select a premium tile and tap 'Use this template →' without a pass → Ladder PaymentModal opens instead of advancing: title 'Unlock all 10 templates', sub 'Premium templates are included with any pass.', only 2 plans shown (Boost Pack filtered out for reason 'template'): Placement Pro ₹2,999 and Season Pass ₹1,499 (pre-selected, 'MOST POPULAR').
  - [ ] Rotate to landscape / widen past 760px → 'AI Review' ghost button reappears in the topbar (the display:none rule only applies ≤760px).
  - [ ] ≤480px template switching → Template <select> is hidden — template can only be changed via Design section or by going back to the gallery; verify Design tab still works.
  - [ ] Job Match section (🎯) on phone → rp-jm-split stacks vertically at ≤1024px (JD input panel full-width above results, border-bottom instead of border-right); JD textarea is 16px (no iOS zoom); score grids 2-up; optimize button full-width; JM/optimize modals become bottom sheets (border-radius 20px 20px 0 0, max-height 90vh/90dvh).

  > ⚠️ AI Review unreachability ≤760px is in src/app.css line 1684; the only handler entry is the topbar button (ResumeBuilder.jsx:2886). Two competing scale rules exist (scale(0.5) @760 at app.css:1686 vs scale(0.46) @768 at :4796 vs !important margin fixes at :7147) — the later 768px block + 7147 !important rules win in cascade; verify visually there is no gap/overlap. Free-tier preview blur CSS (.rp-preview--free, 'PREVIEW — UPGRADE TO DOWNLOAD') exists but is not applied by any current JSX — preview should NOT be blurred.

### J-142 · Application Tracker on phone: agenda strip, kanban board, job detail

**Account state:** Signed-in user with 2+ jobs across stages, at least one event/next-action due today or overdue, and one job in 'interviewing' with a JD ≥30 chars. Also test once signed out.  
**Start at:** https://renonym.com/tracker (on phone, Dashboard sidebar is hidden ≤900px — reach Tracker via the 'Track applications' quick-action card on /dashboard or direct URL)

- [ ] **1.** Open /tracker while signed OUT
      **Expect:** Full-screen dark gate: eyebrow 'Application Tracker', heading 'Every job, one pipeline.', lead 'Sign in to track applications, recruiters, salaries and follow-ups — wired straight into your résumé and interview prep.', gold button 'Sign in to start' → stores rn-return-to='/tracker' and navigates to landing; after sign-in you return to /tracker.
- [ ] **2.** Open /tracker signed in at 390px
      **Expect:** App shell stacks (≤760px: .rn-dark.appshell flex-direction:column): the sidebar becomes a full-width horizontal wrapping bar at top — brand, 'Add a job' gold button, nav items Dashboard / Applications (active) / Interview Coach with gold 'Premium' badge / Résumé Studio / Interview Reports, plus the account avatar item. Per code comment it is intentionally never hidden ('sidebar holds the only logout/account controls — stack it, never hide it').
- [ ] **3.** Inspect the header row
      **Expect:** 'Applications' serif title, 'Archived' chip, search input (fixed 220px wide) and 'Add job' button in one non-wrapping row with 0 32px padding — on 390px this is tight; verify no overflow/clipped controls (no wrap-f class on this row — potential squeeze to flag).
- [ ] **4.** Check the 'Today' agenda strip
      **Expect:** Label 'Today'; wrapping cards. Overdue items have rose border + rose due text, today's items gold border, up to 4 upcoming. Each card: bold title (rounds prefixed '🎤 '), underlined link '<company> · <job title>' opening the job, due via fmtDue. Round items get a gold 'Practice' button (saves a coach draft: Behavioral, difficulty 66, voice, 6 questions → /coach/new). ✓ button marks events done; for next-actions it clears them and opens the job detail. Suggested cards: 'Gone quiet for <N>d — nudge them?' (interviewing) or 'No reply in <N>d — follow up?' with 'Schedule' → creates 'Follow up with <company>' due tomorrow 10:00.
- [ ] **5.** Check momentum stats
      **Expect:** Four cards — Active applications / Applied this week (↑ or ↓) / Response rate (% or —) / Offers — in a 2×2 grid at ≤900px (g-stats repeat(2,1fr) !important), still 1fr 1fr at ≤560px.
- [ ] **6.** Use the kanban pipeline board
      **Expect:** A horizontally scrollable row; each stage column is fixed 250px (minWidth/width 250, flex:none) — on a 390px phone you see ~1.5 columns and swipe sideways. Cards: company-initial avatar, title, '<company> · <N>d in stage', optional '↻ <next action>' (rose when overdue, else gold), and a stage <select> (height 40, font-size 16 — no iOS zoom).
- [ ] **7.** Change a card's stage <select> to Offer
      **Expect:** Stage updates server-side and the Celebrate overlay appears; select taps do NOT open the card (stopPropagation).
- [ ] **8.** Tap a card body
      **Expect:** Job detail (/tracker/job/:id), max-width 880 shell: header card with stage chips, action buttons ('Practice this interview' gold, 'Tailor résumé to this JD' ghost, 'Edit job', external-link, archive) — the row has wrap-f so buttons wrap below the title block on phone. Facts row (Salary/Applied/Added/Excitement ★×5) wraps. With JD <30 chars both bridge buttons are disabled with hint 'Add the JD to unlock practice & tailoring'.
- [ ] **9.** On an 'interviewing' job with JD, check the gold trigger card
      **Expect:** '🎤 Interview coming up — practice this exact one.' + sub 'Your JD and résumé are already loaded. From ₹499 — or free in text mode for your first.' (or 'Included in your pass.' for pass holders) + 'Practice now →'.
- [ ] **10.** Use Next action + Composer
      **Expect:** Next-action input, datetime-local picker (16px font) and Save/Done wrap onto separate lines (wrap-f). Composer chips Note/Round/Contact/Salary/Follow-up; Round/Follow-up show the due picker with hint 'Add a date and it shows up in your daily agenda.'; saving nothing → 'Write something first.'; empty timeline → 'No activity yet — log your first note, round, or recruiter contact above.'
- [ ] **11.** Tap 'Add a job' / 'Add job'
      **Expect:** Bottom-aligned-center modal (padding 16, card max-width 560, max-height 92dvh, scrollable). Field grid g-2 collapses to ONE column at ≤900px (!important beats the inline '1fr 1fr'). Stage select only on create. Saving without Company+Title → 'Company and job title are required.' Save button: 'Save to pipeline' / 'Save changes', busy 'Saving…'.

  **Edge cases**
  - [ ] Empty pipeline (new account) → Card: 'Your pipeline is empty' + 'Add the first job you're eyeing — then tailor your résumé to it and rehearse the interview, all from one card.' + 'Add your first job' button. Archived filter empty → 'No archived jobs'.
  - [ ] Expired session (401) while loading or mutating → Tracker clears rn-auth-token/rn-auth-user and falls back to the 'Sign in to start' gate; JobDetail navigates back to /tracker.
  - [ ] Archive a job → window.confirm: 'Archive "<title>" at <company>? You can find it under the Archived filter.' → returns to /tracker. Archived job shows amber banner 'This job is archived.' + 'Unarchive'.
  - [ ] 'Tailor résumé to this JD' → Stores the JD in localStorage['rn-jd-handoff'] and opens /builder?mode=jobmatch — builder lands directly on the Job Match section with the JD pre-filled.
  - [ ] Delete a timeline event → window.confirm 'Delete this <type> permanently?' then the entry disappears.

  > ⚠️ Board columns have no mobile override — 250px fixed width with overflow-x:auto is the intended phone interaction (horizontal swipe). The Applications header row (Tracker.jsx:111-122) has no wrap class — check for clipping at 390px. Dashboard's sidebar (.db-sidebar) is display:none at ≤900px, so on phone the Tracker nav path is Dashboard quick-grid card or the tracker page's own stacked sidebar.

### J-143 · Interview Coach on phone: setup → checkout → voice session

**Account state:** Signed-in FREE user with no pass and free text interview unused (server: free_interview_used=false → /coach/me returns freeInterviewAvailable:true). For the paid leg use Razorpay test mode or a real ₹499/₹1,499 charge.  
**Start at:** Landing hero 'Practice an interview' → /coach/new (or /coach → 'Start an interview')

- [ ] **1.** Open /coach/new at 390px
      **Expect:** Single column (≤1024px: .rn-split → 1fr): the setup form first, 'Session summary' aside below it with a top border. Top bar: ← back, brand, Dashboard / Résumé Studio links, avatar, 'Save & exit'. Stepper '1 Set up · 2 Checkout · 3 Interview' (labels become 'Interview/Report' for entitled users).
- [ ] **2.** Tap the CTA with a JD under 30 characters
      **Expect:** Rose error card: 'Add a job description (at least 30 characters) so we can tailor the interview.'
- [ ] **3.** Compare mode cards as a free user
      **Expect:** Audio card desc: 'Needs a pass or Single Interview (₹499) — your free interview is text'. Text card: 'Read each question and type your answers'. With Text selected + free interview available: green 'First interview FREE' card ('Your first text interview is on us — 5 questions, real scoring, partial report (full report ₹299 or included with a pass).'), summary shows '5 questions (free)', CTA reads 'Start your free interview →'. With Audio selected: gold Single Interview card '₹499 / one interview + full report' + tip 'Tip: switch to Text mode and your first interview is free.' and CTA 'Continue to checkout →'.
- [ ] **4.** Pick Audio + paste a real JD, tap 'Continue to checkout →'
      **Expect:** Routed to /coach/checkout. At 390px the layout is one column: header '🔒 Secure checkout', H1 'Unlock your interview', three radio plan cards stacked — Season Pass ₹1,499 /90 days (pre-selected, 'MOST POPULAR', '6 full interviews (audio + text) · unlimited AI · all templates'), Placement Pro ₹2,999 /90 days, Single Interview ₹499 — then the Razorpay info card ('Card / UPI / netbanking — entered securely in Razorpay's window. We never see your card details.'), the pay button 'Pay ₹1,499 & start interview' (label tracks the selected plan), and the 'Your interview' order summary below (shows your draft: '<title> · <company>' and '<type> · Voice · <N> questions').
- [ ] **5.** Tap Pay and complete payment in the Razorpay mobile sheet
      **Expect:** Button shows 'Confirming your payment…' then 'Activating your access…', then 'Generating your interview…' and you land on /coach/session/<id> (voice). Draft is cleared from sessionStorage.
- [ ] **6.** Voice session on phone
      **Expect:** Full-height shell uses 100dvh (.vh-shell) so it survives the iOS/Android collapsing URL bar. Header: company avatar, 'AI audio interview', Audio badge, elapsed clock, 'Q1 / N', rose 'End interview'. The browser asks for microphone permission once (persistent stream). Question is spoken; orb/waveform animate; pill cycles 'The interviewer is asking…' → 'Recording 0:NN — speak your answer'. Bottom controls: Skip, gold 'Finish answer' (disabled while speaking), Repeat, switch-to-text.
- [ ] **7.** Deny the mic permission
      **Expect:** Card 'Microphone blocked' — 'Allow microphone access for this site (lock icon in the address bar), then try again — or continue by typing.' with 'Try again' and 'Switch to text mode' (→ same session at ?mode=text).

  **Edge cases**
  - [ ] Visit /coach/checkout signed out → AuthModal opens immediately (reason 'payment': 'Sign in to upgrade' / 'Create a free account first, then complete your purchase.'). After auth it checks coachMe() first and only then charges — if the check fails: 'Could not check your existing access — to avoid charging you twice, tap Pay only if you're sure you haven't bought Coach on this account.'
  - [ ] Already-entitled user (season/placement_pro/legacy unlimited/interview_credit) opens checkout → No plan picker or pay button: 'You already have Coach access' + 'No payment needed — your plan is active…', single button 'Start my interview →' (or 'Set up your interview →' if no draft with JD ≥30 chars, which routes back to /coach/new).
  - [ ] Dismiss the Razorpay sheet (back gesture / X) → Promise rejects with 'CANCELLED' which is swallowed — NO error card appears, button returns to 'Pay ₹… & start interview'.
  - [ ] Payment captured but entitlement not yet visible → Error card: 'Your payment was received, but access hasn't activated yet. Don't pay again — wait a few seconds, reload this page, and tap "Set up interview".' Button switches to the post-paid 'Set up your interview →' state.
  - [ ] Setup CTA when entitlement check 500s/network-fails → Stays on setup with 'Could not verify your access — check your connection and try again.' (only a definitive 401/402 routes to checkout — protects paying users from double charges).
  - [ ] ?plan=session deep link → /coach/checkout?plan=session pre-selects Single Interview ₹499.
  - [ ] Free TEXT interview path → Text mode + freeInterviewAvailable skips checkout entirely: CTA creates the session directly (server independently enforces the free allowance).

  > ⚠️ Checkout plan copy lives in CoachCheckout.jsx PLANS (note: a stale comment mentions '₹599 CTA' but all rendered prices are ₹499/₹1,499/₹2,999). Voice features degrade gracefully: server TTS/transcription falls back to browser SpeechSynthesis/SpeechRecognition; live transcript preview only on Chrome/Edge (webkitSpeechRecognition). Coach session pages print via @media print (report becomes a light document).

### J-144 · Razorpay checkout sheet on mobile via the builder ladder (PaymentModal)

**Account state:** Signed-in free user with 0 credits (to trigger the credits gate) or any free user tapping a premium template. Razorpay test keys or willingness to charge.  
**Start at:** /builder → run an AI action with 0 credits (e.g. '✦ Improve with AI') for the credits gate, or gallery premium tile → 'Use this template →' for the template gate

- [ ] **1.** Trigger the credits gate (server 402 code CREDITS_REQUIRED)
      **Expect:** Ladder modal over a dark blur: title 'You're out of credits', sub 'Top up, or go unlimited for the whole season.', gold banner 'You've used <N> AI action(s). Candidates who land interviews tailor their résumé 15+ times.' Plans: Placement Pro ₹2,999 / Season Pass ₹1,499 (pre-selected, 'MOST POPULAR' badge floats above the card) / Boost Pack ₹299 ('+10 credits', 'Valid 6 months'). Modal card scrolls within 94dvh.
- [ ] **2.** Inspect the plan grid at 390px
      **Expect:** Plans render in TWO columns (≤1024px .g-3 → repeat(2,1fr) !important; there is no single-column override) — cards are ~150px wide and cramped but tappable. Footnote: 'One-time payment via Razorpay (card / UPI / netbanking). Need just one interview? Single Interview ₹499 is available at interview setup.'
- [ ] **3.** Tap 'Get Season Pass — ₹1,499'
      **Expect:** Button shows 'Opening secure checkout…'; checkout.razorpay.com/v1/checkout.js loads; the Razorpay hosted sheet opens (name 'Renonym AI', gold theme #E8C994, name/email prefilled). On phones Razorpay renders as a full-screen sheet.
- [ ] **4.** Dismiss the sheet without paying (back button / X)
      **Expect:** ondismiss → 'CANCELLED' is swallowed: NO error appears, the ladder modal stays open, the pay button re-enables. Tapping the dark backdrop closes the modal (blocked while busy).
- [ ] **5.** Complete a payment
      **Expect:** 'Activating…' → /verify-payment grants the pass server-side → cached user refreshed via /auth/me → modal closes and the builder status shows 'Purchase active — you're all set.' Premium templates now export, '👑 PASS' badges disappear.

  **Edge cases**
  - [ ] Payment fails inside Razorpay (declined card) → rzp 'payment.failed' → rose error card inside the modal with Razorpay's error description (or 'Payment failed').
  - [ ] Razorpay script blocked / offline → Error: 'Could not load Razorpay. Check your connection.'
  - [ ] Tap pay while signed out (ladder opened from landing pricing) → AuthModal (reason 'payment') opens first; after auth the payment continues automatically with the same selected plan.
  - [ ] Template-gate variant → Title 'Unlock all 10 templates'; Boost Pack is filtered out — only the two passes, in a 1fr 1fr grid.
  - [ ] Verify server amounts → /create-order amounts are server-authoritative: boost_299=₹299.00 (29900p), single_499=₹499.00, season_1499=₹1,499.00, pro_2999=₹2,999.00; invalid planId → 400 'Invalid plan ID'.

  > ⚠️ CAVEAT found in code: app.css ~7123 has a mobile bottom-sheet block targeting .pm-overlay/.pm-modal classes that do NOT exist in the current PaymentModal.jsx (it uses inline styles + .card-2) — that mobile CSS is dead, so the only phone adaptation the ladder gets is the generic g-3 two-column override. Expect a cramped-but-usable modal, not a bottom sheet. Backend env flag: retired SKUs (pro_monthly, coach_unlimited, session_pass…) are only refused when LADDER_LIVE=true on Railway; the current ladder IDs are never retired.

### J-145 · PDF blob download on iOS Safari and Android Chrome

**Account state:** Signed-in user on a free template (sf-classic) with Full Name set to something with a space (e.g. 'Test User') to verify filename sanitisation. Test on real iOS Safari AND Android Chrome.  
**Start at:** /builder → BUILD step → topbar 'Export PDF'

- [ ] **1.** Tap 'Export PDF'
      **Expect:** Status 'Generating PDF…'. Client serializes the preview DOM + CSS and POSTs /generate-pdf with a 120s timeout (long cold-start renders are expected to succeed, not abort at 30s).
- [ ] **2.** Wait for the response
      **Expect:** Response blob is verified to start with the %PDF magic bytes, then downloaded via a programmatic <a download> click. Filename: 'Test_User.pdf' (non-word characters replaced with _). Status: 'PDF downloaded successfully.'
- [ ] **3.** Android Chrome behavior
      **Expect:** File appears in the Downloads shade/notification; page does not navigate away.
- [ ] **4.** iOS Safari behavior
      **Expect:** Safari's download manager (↓ icon) captures the blob; file lands in Files ▸ Downloads. Verify no blank tab is opened and the builder page is still live afterwards. (Code uses createObjectURL + a.download — supported on iOS 13+; older iOS would silently fail: flag if nothing happens.)
- [ ] **5.** Verify mobile scaling does NOT distort the PDF
      **Expect:** The downloaded PDF is full-size A4 regardless of the 0.38-0.46 preview scale — server re-renders the HTML; the local fallback explicitly neutralizes .rp-preview__scale-wrap transform in the cloned DOM.

  **Edge cases**
  - [ ] Server unreachable / request times out (test in airplane-mode-after-load or block the API host) → Falls to the local renderer: status 'Server busy — rendering your PDF locally…' → html2canvas + jsPDF load from CDN → multi-page A4 PDF saved client-side → 'PDF downloaded (rendered locally).' Since the export gate already passed (free template or pass), output is clean — the 'Renonym — upgrade to remove' watermark branch must NOT trigger.
  - [ ] Server 429 (export rate limit) → Status: 'PDF export limit reached. Please try later.'
  - [ ] Server 413 (payload too large, e.g. huge photo) → Status: 'Your résumé is too large to export — try a smaller photo or shorter sections.'
  - [ ] Premium template forced past the client gate → Server-side 402 {code:'PASS_REQUIRED', error:'This premium template needs a Season Pass — free templates export clean, forever.'} → ladder modal opens with the template copy (server detects template from the rb-resume--<key> class in the posted HTML; AI-token styles rb-resume--ai-* always pass).
  - [ ] Response is not a real PDF (e.g. captive portal HTML) → Magic-byte check fails → silent local fallback render, '(rendered locally)' status.
  - [ ] Local fallback also fails (CDN blocked) → Status: 'Failed to generate PDF. Check your connection and try again.'
  - [ ] Export from the Job Match tab (no preview mounted) → Builder hops to the Design section automatically (150ms wait) and exports from there instead of silently no-oping; if still not found: 'Preview not found. Please wait for the page to load fully.'

  > ⚠️ Download code: ResumeBuilder.jsx _downloadBlob (line ~1857) — anchor + createObjectURL, revoked immediately after click. There is no iOS-specific path (no window.open/navigator.share fallback); if iOS Safari shows nothing, that is a real gap to log. CLAUDE.md mentions rn-export-count/rn-export-date localStorage gating but no current code reads them — export gating is account/template-based only.

### J-146 · AuthModal Google popup flow under mobile popup blockers

**Account state:** Signed out. iOS Safari with default settings ('Block Pop-ups' ON) and Android Chrome with pop-ups blocked (default).  
**Start at:** Landing nav 'Sign in', builder topbar 'Sign in', or any gated action (Export PDF / AI action while signed out)

- [ ] **1.** Open the auth modal
      **Expect:** Title varies by trigger: 'Sign in to continue' (general), 'Sign in to export', 'Sign in to upgrade' (payment). Buttons: 'Continue with Google', divider 'or', '✉ Continue with email', footer 'Free forever · No credit card needed'. At ≤380px the modal padding tightens to 28px 20px 24px — verify nothing is clipped.
- [ ] **2.** Tap 'Continue with Google'
      **Expect:** Code first awaits POST /auth/init-poll for a nonce, THEN calls window.open — the open is outside the direct tap gesture, so mobile popup blockers may block it. KNOWN GAP: the code never checks window.open's return value, so if blocked NOTHING visible happens — no error, the modal just sits there silently polling /auth/poll every 1.5s for up to 5 minutes. Document exactly what your browser does.
- [ ] **3.** If the popup/tab DOES open (blocker off or Chrome allows as new tab)
      **Expect:** Google OAuth at <api>/auth/google?nonce=… in a 520×620 popup (mobile: usually a new tab). Complete sign-in there; the ORIGINAL tab's polling picks up the token within ~1.5s, the modal closes, and you are signed in (user pill appears; export/jobmatch flows auto-resume; jobmatch shows 'Welcome! New accounts start with 2 free AI credits.').
- [ ] **4.** Recovery path: tap '✉ Continue with email'
      **Expect:** Email field (autofocus) + 'Send magic link →'. Sending shows 'Sending…', then the sent state: '✉ Check your inbox!' / 'We sent a sign-in link to <email>. Click it to sign in — the link expires in 15 minutes. Keep this tab open: you'll be signed in here automatically.'
- [ ] **5.** Open the emailed link in the phone's mail app (separate tab/browser)
      **Expect:** The original tab polls /auth/poll?nonce=<clientId>_ml every 6s for up to 15 min and signs itself in automatically once the link is clicked — no manual return needed.

  **Edge cases**
  - [ ] /auth/init-poll fetch fails (offline / server down) → Error inside the modal: 'Could not start Google sign-in. Try magic link instead.'
  - [ ] Send magic link with empty email → 'Please enter your email.'
  - [ ] Magic-link request rejected by server → The server's error string is shown, else 'Failed to send magic link.'
  - [ ] Close the modal mid-poll → Component unmount clears the poll interval (no ghost sign-in later); tapping the dark overlay outside the card also closes.
  - [ ] User waits out the 5-min Google poll window → Polling silently stops; the modal gives no timeout message — another silent dead end to note.

  > ⚠️ The popup-blocker silent failure is the headline mobile risk in AuthModal.jsx handleGoogle (lines 18-56): window.open after an await + no null check + no popup-blocked error copy. Magic link is the designed mobile fallback. Cross-browser sign-in works because tokens are delivered via server-side polling slots, not postMessage.

### J-147 · Landing page nav and section anchors on mobile

**Account state:** Signed out (then repeat the nav check signed in). 390px viewport.  
**Start at:** https://renonym.com/ (also deep links /#pricing, /#coach, /#resume, /#how)

- [ ] **1.** Load / at 390px
      **Expect:** Sticky blurred dark nav with brand only on the left — the link row (Interview Coach / Résumé Builder / Pricing / How it works) is HIDDEN at ≤900px (.rn-dark .navlinks{display:none}) and there is NO hamburger menu. Right side: 'Sign in' text button + gold 'Get started'. KNOWN GAP: nav links are unreachable on phones except via in-page CTAs and footer.
- [ ] **2.** Check the hero
      **Expect:** Single column (≤1024px lp-hero → 1fr, padding 56px 24px 48px): pill 'Your AI job-preparation platform', display headline 'Build your résumé. Practice your interview. Get hired.', CTAs 'Practice an interview' (→ /coach/new) and 'Build a résumé free' (→ builder gallery), then the 'Live session' demo card stacked below. No horizontal scroll.
- [ ] **3.** Load the deep link /#pricing
      **Expect:** After ~120ms the page smooth-scrolls to the Pricing section automatically (useEffect hash handler).
- [ ] **4.** Tap an in-page anchor CTA (e.g. coach section's 'From ₹499 — no subscription')
      **Expect:** Smooth scroll to #pricing and the URL hash updates via history.replaceState (deep-linkable).
- [ ] **5.** Inspect Pricing on phone
      **Expect:** Three cards — Free ₹0 'Forever', Season Pass ₹1,499 /90 days (gold, 'Most popular', 'MOST POPULAR · one-time'), Placement Pro ₹2,999 /90 days — laid out TWO-up at ≤1024px (g-3 → repeat(2,1fr); no 1-column override exists, so cards are ~165px wide at 390px — verify ₹44px price type and feature lists stay readable). Footnote: 'Also available: Boost Pack ₹299 (+10 AI credits) · Single Interview ₹499 · Report Unlock ₹299. One-time payments — no subscriptions, ever.' CTAs: 'Start building' → builder, 'Get the Season Pass' / 'Go Pro' → /coach/new.
- [ ] **6.** Check remaining sections
      **Expect:** Coach hero card (g-2) collapses to one column at ≤900px; features grid (g-3) 2-up at ≤1024; résumé split (lp-split) one column at ≤1024 with the light 'paper' preview card below the copy (paper stays light — .rb/paper rules must not be dark).
- [ ] **7.** Footer
      **Expect:** Brand + tagline, then columns Product (Interview Coach, Résumé Builder, Pricing) and Company (About → /about, Privacy → /privacy, Terms → /terms) wrapping; '© 2026 Renonym AI. All rights reserved.' On mobile this footer is the only path to the hidden nav destinations.
- [ ] **8.** Repeat signed in
      **Expect:** Nav right side shows a single 'Dashboard →' ghost button instead of Sign in/Get started.

  **Edge cases**
  - [ ] Tap a section hash while inside another view (e.g. from builder history back-stack) → main.jsx hashchange handler: for #resume/#pricing/#how/#coach it returns to the landing view and smooth-scrolls to that section after 60ms.
  - [ ] 'Sign in' on landing → Opens AuthModal (reason 'continue' → title 'Sign in to continue'); after auth onLogin runs → honors rn-return-to if set, else routes to the builder gallery.
  - [ ] ?ref=CODE referral link opened on phone → Code stored in localStorage['rn-ref-code'] (uppercased, 16 chars max) and claimed automatically after the next sign-in (give 5 / get 5); a 400/404 on claim drops the code permanently.
  - [ ] Overscroll at the page top/bottom → body:has(.rn-dark) sets the dark background — no white flash on iOS rubber-banding.

  > ⚠️ The missing mobile nav (no hamburger at ≤900px) and the 2-up pricing grid at 390px are the two layout findings to confirm visually. All landing CTAs route through main.jsx navPath/goToBuilder so the browser Back button must return to the landing each time.

### J-148 · Audio interview on Android Chrome — full feature path (server TTS voice, one mic prompt, live transcript, webm transcription)

**Account state:** Signed in with an audio entitlement: interview credit (Single Interview), active Season Pass / Placement Pro with interviews remaining, or Coach Unlimited. Audio mode is NOT covered by the free first interview — Setup's Audio card reads 'Needs a pass or Single Interview (₹499) — your free interview is text' for un-entitled users and routes them to checkout. Android phone, Chrome, working mic, media volume up, mic permission for renonym.com not yet decided (Reset permissions to test the prompt).  
**Start at:** renonym.com/coach/new → fill Job title/Company → Interview mode: 'Audio' → 'Start interview →' (lands on /coach/session/{id}, no ?mode=text)

- [ ] **1.** On /coach/new select the 'Audio' mode card and confirm the summary panel.
      **Expect:** Audio card desc (entitled): 'The AI interviewer speaks — you answer out loud'. Summary shows 'Mode: Audio' and the entitlement card (e.g. 'You have N interviews ready — this uses one.' or 'Your pass is active — N interviews left. This one is included.'). CTA reads 'Start interview →'.
- [ ] **2.** Tap 'Start interview →' and wait for the session screen.
      **Expect:** URL becomes /coach/session/{uuid}. Header: company/job title, subtitle 'AI audio interview', blue 'Audio' badge, elapsed clock ticking from 0:00, 'Q1 / N' counter, red-outlined 'End interview' button. Progress dots under the header.
- [ ] **3.** Observe the first question phase (question text is deliberately hidden — listening test).
      **Expect:** Label 'Interviewer asks · Question 1', optional gold focus badge, headline 'Listen carefully — the interviewer is asking your question.', underlined link 'Show the question', status pill 'The interviewer is asking…'. Server MP3 (deep male 'onyx' voice via POST /coach/sessions/{id}/question-audio) attempts to play.
- [ ] **4.** Listen for which voice path fires (autoplay policy check).
      **Expect:** Branch A (autoplay allowed / recent tap): natural MP3 interviewer voice. Branch B (Chrome blocks play() — no transient user activation after the long session-create): silent fallback to browser speechSynthesis voice. Branch C (synthesis also blocked, error 'not-allowed'): the question TEXT auto-reveals and the mic opens immediately. Worst case a watchdog fires at min(30s, 5s + 65ms/char) and does the same — there must NEVER be a permanent silent screen with hidden text.
- [ ] **5.** When speech ends, respond to the mic permission prompt with Allow.
      **Expect:** Chrome shows the mic permission sheet exactly once for the whole session (stream is persisted across questions). After Allow: status pill switches to 'Recording 0:00 — speak your answer' counting up, headline becomes 'Answer out loud, just like the real room.', waveform bars animate.
- [ ] **6.** Immediately tap 'Finish answer' (within 2 seconds, before speaking).
      **Expect:** Red error: "We didn't catch anything yet — answer out loud, or use Skip / text mode." Recording continues.
- [ ] **7.** Speak a 15–20s answer and watch below the waveform.
      **Expect:** A 'Live transcript · N words' card appears (Chrome has SpeechRecognition): confirmed words in normal color, in-flight interim words dimmed, word count updating.
- [ ] **8.** Tap 'Finish answer'.
      **Expect:** Button text 'Transcribing…', status pill 'Transcribing your answer…'. The recorded blob (Chrome default audio/webm) POSTs raw to /coach/sessions/{id}/transcribe; answer saves via /answers; advances to Q2 with NO second mic prompt, transcript area cleared, question hidden again.
- [ ] **9.** On Q2 tap the circular 'Repeat the question' button (RotateCcw icon).
      **Expect:** Question audio replays instantly (blob is cached per question — no refetch delay), then the mic reopens. Because Repeat is a tap (user activation), the MP3 should play aloud even if Branch B/C hit earlier.
- [ ] **10.** Tap 'Show the question' on any question.
      **Expect:** Full question text in large serif type; the question's focus phrase rendered in gold italic if present in the text.
- [ ] **11.** Tap the 'Skip this question' button (SkipForward icon) on one question.
      **Expect:** Advances to the next question without saving an answer; on the last question it navigates to /coach/session/{id}/complete.
- [ ] **12.** Finish the final question.
      **Expect:** Redirect to /coach/session/{id}/complete. Also verify footer copy was present throughout: 'Your answer is transcribed securely — only the text is kept for scoring.'

  **Edge cases**
  - [ ] Refresh the page mid-interview. → Session reloads and resumes at the FIRST unanswered question (saved answers are skipped). If every question was answered, it redirects straight to /coach/session/{id}/complete — the last question is never re-shown.
  - [ ] Open the session URL while signed out (or with an expired token). → getSession returns 401 → silent redirect to /coach (Coach landing). Any other load failure shows the error message centered with a 'Back to Coach' button.
  - [ ] Hammer Repeat (>120 audio calls per 15 min from one IP — server coachMediaLimiter). → question-audio/transcribe return 429 { error: 'Too many audio requests. Please slow down a little.' }. The UI does not show this for TTS — it silently falls back to the browser speechSynthesis voice; transcription failures fall back to the live transcript.
  - [ ] Server transcription fails (502 'Could not transcribe your answer.') while a live transcript exists. → Failure is logged to console only; the live SpeechRecognition text is submitted as the answer instead. The interview continues normally.
  - [ ] Network drops while saving the answer. → Red error with the failure message (fallback copy: 'Could not save your answer.'), busy state clears, and the mic re-opens so the user can retry 'Finish answer'.
  - [ ] Tap 'End interview' (red, top right) mid-question. → All audio/mic activity stops and navigates to /coach/session/{id}/complete.

  > ⚠️ Entitlement is enforced server-side at session creation; the audio endpoints themselves only require auth + session ownership (requireAuth, user_id match) — ?mode=text vs voice is a pure client toggle on the same session. Question audio is served with 'Cache-Control: private, max-age=3600'. 'Finish answer' is disabled during the 'speaking' phase, while busy, and in the denied state.

### J-149 · Audio interview on iPhone Safari — degradation path (autoplay block, audio/mp4 recording, NO live transcript)

**Account state:** Same audio entitlement as above. iPhone with Safari (iOS 15+), ringer switch ON (not silent), mic permission not yet granted.  
**Start at:** renonym.com/coach/new on iPhone Safari → Audio mode → 'Start interview →' → /coach/session/{id}

- [ ] **1.** Land on the session screen.
      **Expect:** The 'usable' check passes (iOS Safari has MediaRecorder + getUserMedia) — you must NOT see 'Your browser doesn't support audio interviews — switching you to text mode…'. Normal audio UI loads.
- [ ] **2.** Observe the first question (autoplay policy — the critical iOS branch).
      **Expect:** Audio.play() will most likely be rejected (no transient user activation after the async session load) → falls to speechSynthesis; if Safari blocks that too, the watchdog (min(30s, 5s + 65ms/char)) fires: the question text AUTO-REVEALS and recording starts. Acceptable outcomes: (a) question spoken aloud, or (b) within ~30s the full question text appears and the status pill shows 'Recording 0:00 — speak your answer'. A silent screen stuck on 'The interviewer is asking…' past ~30s is a BUG.
- [ ] **3.** Allow the Safari mic prompt ('renonym.com Would Like to Access the Microphone').
      **Expect:** Recording starts; Safari shows its mic-in-use indicator. The stream persists so later questions in this page load don't re-prompt (Safari may still re-prompt after a reload — that is browser behavior, not app behavior).
- [ ] **4.** Speak a 15–20s answer and watch for a transcript card.
      **Expect:** NO 'Live transcript' card appears — iOS Safari's SpeechRecognition is absent/non-functional and the card only renders when live text exists. This is the designed degradation, not a bug. Only the waveform + 'Recording m:ss — speak your answer' pill show.
- [ ] **5.** Tap 'Finish answer'.
      **Expect:** 'Transcribing…' / 'Transcribing your answer…'. Safari's MediaRecorder default is audio/mp4 (AAC) — the upload's Content-Type is audio/mp4, the server maps it to answer.mp4 and transcribes via gpt-4o-mini-transcribe (whisper-1 fallback). On success the next question loads. Since there is no live preview on iOS, server transcription of mp4 is the ONLY answer path — verify your spoken words later in the report/complete page to prove the mp4 branch worked.
- [ ] **6.** On the next question, tap 'Repeat the question' right away.
      **Expect:** Because Repeat is a direct tap (user activation), the MP3 interviewer voice should now play ALOUD through the speaker — this verifies server TTS works on iOS when gesture-initiated, even if question 1 fell back to text.
- [ ] **7.** Lock the phone or switch apps mid-recording, then return.
      **Expect:** iOS suspends the page; on return the recording may have stopped. Tapping 'Finish answer' submits whatever audio chunks were captured, or shows "We couldn't hear that clearly. Try answering again, or switch to text mode." and re-opens the mic. The session must not crash.
- [ ] **8.** Complete all questions.
      **Expect:** Redirect to /coach/session/{id}/complete; spoken answers appear as text in the scored report.

  **Edge cases**
  - [ ] Transcription fails on iOS (server 502 'Could not transcribe your answer.' or 400 'No audio received.' for a <200-byte body). → Unlike Chrome there is no live-transcript fallback, so the answer resolves empty → red error "We couldn't hear that clearly. Try answering again, or switch to text mode." and the mic re-opens for a retry.
  - [ ] Record under 2 seconds then tap 'Finish answer'. → Blocked client-side with "We didn't catch anything yet — answer out loud, or use Skip / text mode." (on iOS the live-preview escape hatch never applies, so the 2-second floor is always enforced).
  - [ ] iPhone ringer switch set to silent. → The MP3/TTS question may be inaudible (browser behavior). Escape hatch must work: tap 'Show the question' to read it, answer normally.
  - [ ] Cached question blob is corrupt / play errors mid-stream (a.onerror). → The cached blob URL is purged so Repeat refetches, and the question is spoken exactly ONCE via the speechSynthesis fallback (no double-speak).
  - [ ] Tap the 'Switch to text mode' (Type icon) button mid-session. → All audio stops; navigates to /coach/session/{id}?mode=text — same session, already-saved answers preserved, text UI resumes at the first unanswered question.
  - [ ] Very long question (>240 chars) revealed on a small screen. → Reveal font scales down (40→33→28→24px by length) and the question area scrolls — text must not clip on a phone viewport (vh-shell layout).

  > ⚠️ iOS degradations are by design per the code comments ('Works on Chrome, Edge, Safari and Firefox'). The watchdog cap is 30s — a 600-char question could leave a tester staring at 'The interviewer is asking…' for up to 30s in the fully-blocked branch before text reveals; judge whether that wait is acceptable for mobile-first. Server truncates spoken question text to 600 chars and transcripts to 6000 chars; transcribe body limit is 16MB raw (accepts audio/*, video/webm, application/octet-stream).

### J-150 · Mic permission denied on mobile — 'Microphone blocked' card and recovery paths

**Account state:** Audio-entitled signed-in user; mobile browser with renonym.com mic permission undecided (to test live denial) and then set to Block (to test persistent denial).  
**Start at:** /coach/session/{id} (audio mode), reached via Setup → Audio → Start interview

- [ ] **1.** When the mic prompt appears after the first question is spoken, tap Block/Deny.
      **Expect:** getUserMedia rejects with NotAllowedError → phase 'denied'. A rose-bordered card appears: MicOff icon + 'Microphone blocked' heading and copy: 'Allow microphone access for this site (lock icon in the address bar), then try again — or continue by typing.' with two buttons: 'Try again' (ghost) and 'Switch to text mode' (gold). The orb/waveform/status pill are hidden and 'Finish answer' is disabled.
- [ ] **2.** Evaluate the copy on a phone.
      **Expect:** KNOWN COPY GAP for a mobile-first product: 'lock icon in the address bar' is desktop wording. Android Chrome uses the tune/ⓘ icon → Permissions; iOS Safari has no in-page control (Settings app → Safari → Microphone, or aA → Website Settings). Flag if testers can't find the setting from the copy.
- [ ] **3.** Re-allow the mic in the browser's site settings, return to the tab, tap 'Try again'.
      **Expect:** getUserMedia retried with the same question; on success the recording phase starts ('Recording 0:00 — speak your answer'). On iOS, where the denial is remembered for the page, 'Try again' fails instantly and the card persists until permission is changed in Settings and the page reloaded.
- [ ] **4.** Alternatively tap 'Switch to text mode'.
      **Expect:** Navigates to /coach/session/{id}?mode=text — the text interview loads on the SAME session at the first unanswered question; no progress lost, no extra charge.

  **Edge cases**
  - [ ] Device has no microphone hardware at all (error is NotFoundError, not NotAllowedError). → NOT the denied card — recording phase still starts; if the browser also lacks SpeechRecognition, a red inline error shows: 'No microphone available — switch to text mode to continue.' (Skip and the text-mode button still work).
  - [ ] Browser has SpeechRecognition but no MediaRecorder, and SR errors with 'not-allowed' / 'service-not-allowed'. → Treated as a denial too → same 'Microphone blocked' card (this branch only fires when HAS_RECORDER is false).
  - [ ] Deny on question 1, recover, then advance through remaining questions. → Only one prompt cycle — the granted stream is reused for every later question in the session (streamRef persists until unmount).
  - [ ] Tap 'Skip this question' while in the denied state. → Skip still works and moves to the next question, which re-attempts the mic — useful to confirm denied state doesn't trap the user.

  > ⚠️ The denied state is purely client-side; nothing is sent to the server while blocked. Permission denial does not refund or consume anything by itself — the interview credit/pass slot was already consumed at session creation.

### J-151 · Browser without any audio capture — auto-handoff to text mode

**Account state:** Audio-entitled signed-in user. A browser where BOTH MediaRecorder/getUserMedia AND SpeechRecognition are absent. All current mainstream mobile browsers pass the check, so simulate: open the session URL in desktop DevTools mobile emulation after running `delete window.MediaRecorder; delete window.SpeechRecognition; delete window.webkitSpeechRecognition;` via an early snippet/override, or use an old embedded WebView.  
**Start at:** Direct URL: /coach/session/{id} (voice mode is the default for session URLs without ?mode=text)

- [ ] **1.** Load the session URL in the capture-less browser.
      **Expect:** Centered dark screen with pulsing orb spinner and the message: "Your browser doesn't support audio interviews — switching you to text mode…" plus a gold button 'Continue in text mode →'. No question audio is fetched, no mic prompt.
- [ ] **2.** Wait without tapping anything.
      **Expect:** After 2.6 seconds, automatic redirect to /coach/session/{id}?mode=text — the text interview loads on the same session.
- [ ] **3.** Reload the voice URL and tap 'Continue in text mode →' before the timer.
      **Expect:** Immediate redirect to /coach/session/{id}?mode=text (same target as the auto-redirect).

  **Edge cases**
  - [ ] Only ONE of the two capabilities is missing (e.g. Firefox Android: MediaRecorder yes, SpeechRecognition no). → No handoff — the audio interview runs (usable = HAS_RECORDER || SR). Firefox records audio/ogg by default → server maps to answer.ogg and transcribes; like iOS there is no live-transcript card. Use this as the deterministic mime test for the ogg branch.
  - [ ] Capture-less browser AND user signed out. → The unsupported screen renders from state alone; the parallel session fetch 401 redirects to /coach — whichever fires first wins; no crash either way.

  > ⚠️ The 'Use Chrome or Edge' guidance from the old inventory does not exist anywhere in the code (grep confirms no such UI copy) — the actual code policy is: full experience on Chrome/Edge (live transcript), recorder-only on Safari/Firefox, auto text-mode handoff only when no capture path exists at all. Update the test inventory wording accordingly.


---

## Rate Limits & Abuse Guards

### J-152 · Builder AI actions hit the 15-call/15-min rate limit (improve-summary, review-resume, generate-template, optimize-for-job)

**Account state:** Signed in with an account that bypasses the credit ladder — active season/placement pass, legacy plan='pro', or Coach Unlimited (requireCredits bypasses these, server.js:506). Otherwise a free account needs 16+ credits, or the 402 'CREDITS_REQUIRED' ladder fires before the 429. Resume with a summary filled in. Use a fresh 15-min window (limits are in-memory and reset on Railway restart).  
**Start at:** renonym.com → builder → Profile section, 'Professional Summary' field with the '✦ Improve with AI' inline button (ResumeBuilder.jsx:3372)

- [ ] **1.** Click '✦ Improve with AI' once with a summary present.
      **Expect:** Status bar shows 'AI is improving your summary…' then 'Summary improved! ✦' (success). Network tab: POST /improve-summary → 200 with RateLimit-* headers (aiLimiter standardHeaders:true). Pass/pro accounts are not debited credits.
- [ ] **2.** Repeat the click until you have made 15 successful AI calls within 15 minutes from this browser (all AI endpoints share one counter per x-client-id: generate-template, extract-resume, review-resume, improve-summary, generate-pdf, analyze-job-match, optimize-for-job — server.js:349-374, 420-426).
      **Expect:** Calls 1-15 succeed normally.
- [ ] **3.** Click '✦ Improve with AI' a 16th time.
      **Expect:** Red status bar (rp-status--error): 'Too many AI requests. Please wait a few minutes.' (ResumeBuilder.jsx:1659-1661). Network tab: 429 with body {"error":"You have made too many requests. Please wait 15 minutes before trying again."} — the per-clientId limiter (15/15min) trips before the IP aiLimiter (20/15min). No credit is debited (debit only fires on 2xx, server.js:518-519).
- [ ] **4.** While limited, click 'AI Review' in the builder top bar (next to 'Export PDF', ResumeBuilder.jsx:2886).
      **Expect:** Status flashes 'Analysing your resume…' then red 'Too many AI requests. Please wait a few minutes.' (ResumeBuilder.jsx:1688-1690). No review modal opens.
- [ ] **5.** While limited, generate an AI theme (AI style flow: enter a prompt and click the generate button → POST /generate-template).
      **Expect:** Red status: 'Too many AI requests. Please wait a few minutes.' (ResumeBuilder.jsx:1378-1380). No theme is applied; the current template is unchanged.
- [ ] **6.** While limited, run Job Match: paste a job description and click analyze (POST /analyze-job-match).
      **Expect:** Red status: 'Too many requests. Please wait a minute.' (ResumeBuilder.jsx:2250) — note the slightly different copy from the other AI buttons.
- [ ] **7.** While limited, click the job-match Optimize action (POST /optimize-for-job).
      **Expect:** Red status: 'Optimisation failed.' — handleOptimize has NO 429-specific branch (ResumeBuilder.jsx:2273-2279: _isGated → if(!r.ok) throw → generic catch). The user gets no hint it was rate limiting. Known UX gap to confirm/fix.
- [ ] **8.** Wait 15 minutes (or restart the Railway server), then click '✦ Improve with AI' again.
      **Expect:** Call succeeds again — both limiter windows are 15 minutes; perClientId store is an in-memory Map pruned every 30 min.

  **Edge cases**
  - [ ] Distinguish the IP-level aiLimiter from the per-clientId limiter: after being blocked, clear localStorage key 'rb-client-id', reload (a new UUID is minted), and keep clicking AI buttons. → Calls work again until the IP total passes 20 in the window, then 429 body becomes {"error":"Too many AI requests. Please try again in 15 minutes."} (aiLimiter, server.js:299-305). Frontend copy is identical either way — only the Network-tab body differs.
  - [ ] Export PDF while AI-limited (generate-pdf shares the per-clientId 15-counter but uses exportLimiter not aiLimiter at IP level). → If the clientId counter is exhausted, export shows red 'PDF export limit reached. Please try later.' (ResumeBuilder.jsx:1826-1829). Pure IP exportLimiter is separate: 20/hour, skipFailedRequests:true, server body 'PDF export limit reached. Please try again later.'
  - [ ] Resume upload (extract-resume) while limited — both the normal import flow and the Job Match upload. → Import flow: red 'Too many AI requests. Please wait a few minutes.' (ResumeBuilder.jsx:1465-1467). Job Match upload: red 'Too many AI requests. Please wait a minute.' but jmResumeText is kept so a later analysis can still run on raw text (ResumeBuilder.jsx:2140-2143).
  - [ ] Free user with low credits hammers AI buttons. → 402 CREDITS_REQUIRED ('You're out of credits — this needs 1.') opens the credit ladder BEFORE any 429 is reachable — _isGated runs before the 429 check on every handler. Rate-limit testing requires a pass/pro account.
  - [ ] Calorie calculator (/analyze-food) shares aiLimiter + perClientIdLimiter with the resume AI endpoints. → While limited, food analysis shows inline error 'Too many requests. Please wait a minute and try again.' (ResumeBuilder.jsx:2407) — burning food analyses also burns the resume-AI budget and vice versa.

  > ⚠️ Limits are per public IP (app.set('trust proxy', 1)) plus per rb-client-id; office NAT/VPN users share the IP bucket. All limiter state is in-memory — a Railway redeploy resets every counter. Server route order: validateApiSecret → aiLimiter → validateClientSession → perClientIdLimiter → auth/credits → handler (server.js:387-426, 593-596), so 429s never consume credits and unauthenticated probes still count toward the IP bucket.

### J-153 · Magic-link email form rate limit (5 sends per 15 min per IP)

**Account state:** Signed out. Backend has SMTP configured (mailer present), otherwise every request returns 503 instead.  
**Start at:** renonym.com landing page → 'Sign in' (top nav) → auth modal → '✉ Continue with email'

- [ ] **1.** Enter a real email, click 'Send magic link →'.
      **Expect:** Button shows 'Sending…', then the modal switches to the sent state: '✉ Check your inbox!' / 'We sent a sign-in link to <email>. Click it to sign in — the link expires in 15 minutes. Keep this tab open: you'll be signed in here automatically.' (AuthModal.jsx:165-175). Network: POST /auth/magic-link/request → 200 with RateLimit-* headers.
- [ ] **2.** Close the modal, reopen it ('Sign in' → 'Continue with email'), and send again. Repeat until 5 total sends have been made within 15 minutes.
      **Expect:** Sends 2-5 all succeed with the same 'Check your inbox!' state. Each new send invalidates the previous unused link for that email (server deletes unused tokens, server.js:2083) — only the newest emailed link works.
- [ ] **3.** Attempt a 6th send within the same 15 minutes (same or different email — the limit is per IP, not per address).
      **Expect:** Modal stays on the email form and shows the red error box: 'Too many email requests. Please wait 15 minutes.' — the server's exact magicLinkLimiter message (server.js:323-328) surfaced verbatim via setError(e.message) into .rn-auth-modal__error (AuthModal.jsx:76, 94-95, 118). Network: 429.
- [ ] **4.** Wait 15+ minutes and send again.
      **Expect:** Send succeeds; the sent state reappears.

  **Edge cases**
  - [ ] Submit with an empty email field. → Client-side only: 'Please enter your email.' — no network request, does NOT count toward the 5.
  - [ ] Malformed email that bypasses the browser's type="email" validation (e.g. sent via DevTools). → 400 {"error":"Please enter a valid email address."} — but it STILL counts toward the 5/15min budget, because magicLinkLimiter is mounted before the handler and has no skipFailedRequests (server.js:323-328, 607).
  - [ ] SMTP not configured on the server. → 503, modal error: 'Email not configured on server. Use Google sign-in instead.' (server.js:2079).
  - [ ] Auth polling while waiting (every 6s on /auth/poll) during the limited period. → Polling is unaffected — pollLimiter is a separate bucket (250/5min, server.js:331-335); a magic-link 429 never breaks an in-flight sign-in poll.

  > ⚠️ Limit is per IP across all emails — a tester on a shared network can be limited by colleagues. The CreditGate/export-triggered auth modals ('Sign in to export' / 'Sign in to upgrade') use the same form and the same bucket.

### J-154 · Voice interview audio rate limit (question-audio + transcribe, 120 per 15 min per IP) degrades gracefully

**Account state:** Signed in with interview access (interview credit, active pass, or Coach Unlimited). Desktop Chrome or Edge with a working microphone (needed for the live SpeechRecognition fallback). An in-progress voice interview session.  
**Start at:** renonym.com/coach → set up an interview (voice mode) → /coach/session/{id} voice screen

- [ ] **1.** Start the voice interview and observe question 1.
      **Expect:** 'The interviewer is asking…' status; AI voice plays via POST /coach/sessions/{id}/question-audio (200, audio blob). The Repeat button (circular arrow) replays from a client-side cache — no new network request (VoiceInterview.jsx:38, 130-137).
- [ ] **2.** Exhaust the 120/15-min budget. Manual play won't get there (a 10-question interview is ~25-40 calls — server comment at server.js:338); fastest browser-only method: open DevTools console on the interview page and loop ~120 fetches to /coach/sessions/{id}/question-audio with the page's own headers (x-api-secret, x-client-id, Authorization from localStorage 'rn-auth-token'), or run 3-4 interviews back-to-back from the same IP.
      **Expect:** Once past 120 combined question-audio + transcribe calls in the window, further calls return 429 {"error":"Too many audio requests. Please slow down a little."} (coachMediaLimiter, server.js:339-343).
- [ ] **3.** While limited, advance to the next (uncached) question.
      **Expect:** No error message anywhere — the 429 from questionAudio is swallowed (VoiceInterview.jsx:155-158) and the question is spoken by the browser's built-in TTS instead (noticeably robotic voice). If browser TTS is unavailable, the question text is revealed on screen and answering begins immediately.
- [ ] **4.** Answer aloud (2+ seconds) and click 'Finish answer' while limited.
      **Expect:** Status 'Transcribing your answer…'; POST /transcribe → 429; console logs '[coach] transcription failed, using live preview:' (VoiceInterview.jsx:295-296); the answer silently falls back to the live SpeechRecognition transcript and is submitted via /answers (NOT rate-limited — interview proceeds to the next question normally).
- [ ] **5.** Repeat step 4 in a browser without SpeechRecognition (Firefox/Safari), or with the live preview empty.
      **Expect:** Inline error: "We couldn't hear that clearly. Try answering again, or switch to text mode." and the mic re-arms (VoiceInterview.jsx:300-305). The Type icon switches to text mode.

  **Edge cases**
  - [ ] Signed-out / expired-token requests to question-audio or transcribe. → 401 before the limiter counts anything — requireAuth runs first (server.js:3013, 3044); abuse without a valid JWT cannot burn the audio budget.
  - [ ] Answer submission and interview completion while audio-limited. → Unaffected: /answers, /coach/sessions GET, and navigation to /complete have no coachMediaLimiter. Only session CREATE and SCORE sit behind aiLimiter (20/15min IP, server.js:2807, 2961) — deliberately kept off per-answer routes so paying users aren't 429'd mid-interview (comment server.js:2775-2777).
  - [ ] Click 'Finish answer' with under 2 seconds recorded and no live preview. → Client-side only: "We didn't catch anything yet — answer out loud, or use Skip / text mode." — no network call, doesn't touch the budget (VoiceInterview.jsx:281).
  - [ ] Start a new interview while limited and /coach/sessions create also exceeds aiLimiter (20/15min). → Session creation fails with the server message 'Too many AI requests. Please try again in 15 minutes.' surfaced through CoachError — separate bucket from the 120 audio budget.

  > ⚠️ Per-IP limit shared across tabs/sessions/users behind one NAT. Both fallbacks (browser TTS, live SpeechRecognition preview) make a coachMediaLimiter 429 nearly invisible on Chrome/Edge — verify via DevTools Network tab and the robotic-voice change, not via on-screen errors. Consider a temporary lower max on staging for an end-to-end manual run.

### J-155 · Application Tracker write limit (120 non-GET requests per 15 min per IP)

**Account state:** Signed in (tracker shows 'Every job, one pipeline.' + 'Sign in to start' when signed out). At least one job on the board; backend DB configured (otherwise all tracker routes return 503 'Tracker not configured.').  
**Start at:** renonym.com/tracker

- [ ] **1.** Click 'Add a job' (gold button, sidebar) / 'Add job' (empty state), fill Company + Job title, save.
      **Expect:** Modal closes, job card appears in 'saved'. That's 1 write (POST). Leaving Company or Title blank shows in-modal error 'Company and job title are required.' with no network call (Tracker.jsx:262).
- [ ] **2.** Generate writes rapidly: every stage move, edit, note, follow-up, or done-toggle is one non-GET /tracker request. Fastest browser-only method: move one job back and forth between stage columns repeatedly, or loop ~120 PATCHes from the DevTools console with the page's headers.
      **Expect:** Writes 1-120 within 15 minutes succeed; the board updates after each (reload() on success).
- [ ] **3.** Make the 121st write (e.g. move a job to another stage).
      **Expect:** 429 {"error":"Too many changes at once — slow down a little."} (trackerWriteLimiter, server.js:3129-3135). The exact server text appears as rose-colored small text above the board (Tracker.jsx:57 → err <p> at line 125). The card does NOT move — reload() only runs on success, so the board stays consistent.
- [ ] **4.** While limited, open 'Add a job' and try to save.
      **Expect:** Same message 'Too many changes at once — slow down a little.' rendered inside the modal (Tracker.jsx:269, 309); the modal stays open with the form intact and the Save button re-enabled.
- [ ] **5.** While limited, refresh the page / search / open a job detail.
      **Expect:** All reads still work — the limiter explicitly skips GET (server.js:3135: req.method === 'GET' ? next() : trackerWriteLimiter). Board, agenda and insights load normally.
- [ ] **6.** Wait out the 15-minute window and retry the write.
      **Expect:** Write succeeds; error text clears on the next successful reload (setErr('')).

  **Edge cases**
  - [ ] Session expires (401) during a write while limited-testing. → handle401 path runs instead of the rate-limit error — auth is cleared and the signed-out tracker landing ('Sign in to start') appears; no 429 message is shown (Tracker.jsx:57).
  - [ ] 'Schedule follow-up' from the agenda while limited. → Rose error 'Too many changes at once — slow down a little.' via the addEvent catch (Tracker.jsx:73); falls back to 'Could not schedule.' only if the body had no error field.
  - [ ] Moving a job to 'offer' on exactly the blocked write. → No celebration modal — setCelebrate only fires after a successful updateJob (Tracker.jsx:53-54).
  - [ ] Tracker GETs and writes vs. other limiters. → Tracker has its own bucket only — tracker writes never consume the AI (20/15min) or audio (120/15min) budgets, and vice versa.

  > ⚠️ Per-IP, in-memory (resets on Railway redeploy); requireAuth runs per-route AFTER the limiter here, so even unauthenticated non-GET probes to /tracker count toward and can poison the IP bucket (limiter mounted at server.js:3135 before route-level requireAuth). 120 manual writes is tedious — a DevTools fetch loop or dragging one card between columns repeatedly is the practical path; consider lowering max on staging for a clean manual verification.


---

## Appendix A — Endpoint Hygiene (informational)

### J-156 · DEAD ENDPOINT AUDIT: POST /auth/save-resume (server-side resume save — no UI caller)

**Account state:** Signed-in user, any plan (need a valid JWT). Sign in via Google first so localStorage['rn-auth-token'] is populated.  
**Start at:** renonym.com → sign in → open browser DevTools (Network + Console tabs)

- [ ] **1.** Walk the entire app (Landing, Builder all sections, Dashboard) looking for any 'Save resume to account' / 'My saved resumes' affordance, with the Network tab open and filtered to 'save-resume'.
      **Expect:** No such button/menu exists anywhere and no request to /auth/save-resume is ever fired. (Code proof: grep of renonym-react/src/ has zero callers; only match is the unrelated linkedIn input field in ResumeBuilder.jsx:3365.) Resume persistence in the app is localStorage-only.
- [ ] **2.** OPTIONAL server smoke — in DevTools Console run: fetch('https://salesforce-resume-pdf-server-production.up.railway.app/auth/save-resume',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+localStorage['rn-auth-token']},body:JSON.stringify({resumeData:{fullName:'Test'},name:'Audit Test'})}).then(r=>r.json()).then(console.log)
      **Expect:** 200 {"success":true,"resume":{...}} — row inserted into rn_saved_resumes with template_style defaulting to 'sf-classic' (name defaults to 'My Resume' if omitted), and rn_users.resume_count is incremented by 1 (insert path only).
- [ ] **3.** Repeat the same fetch but add "resumeId": <id returned in step 2> to the body.
      **Expect:** 200 {"success":true,"resume":{...}} via the UPDATE path (updated_at=NOW()); resume_count NOT incremented this time.

  **Edge cases**
  - [ ] Body missing resumeData → 400 {"error":"No resume data provided."}
  - [ ] No Authorization header → 401 {"error":"Authentication required.","code":"AUTH_REQUIRED"}
  - [ ] Expired/garbage Bearer token → 401 {"error":"Session expired. Please log in again.","code":"AUTH_REQUIRED"}
  - [ ] Server started without DATABASE_URL → 503 {"error":"Auth not configured (no DATABASE_URL)."}
  - [ ] resumeId that belongs to ANOTHER user (or doesn't exist) → BUG: UPDATE matches 0 rows but the route still returns 200 {"success":true} with resume undefined/absent — a silent no-op, not a 404 (server.js:2241-2246).
  - [ ] DB query throws → 500 {"error":"Failed to save resume."}

  > ⚠️ OUT-OF-SCOPE for UI test plan / mark as dead code or unshipped 'saved resumes' product gap. SECURITY NOTE: /auth/* routes are NOT behind validateApiSecret (server.js:387-396 only guards /generate-*, /extract-resume, /review-resume, /improve-summary, /analyze-*, /create-order, /verify-payment, /coach, /referral, /tracker) — so this endpoint is reachable by any holder of a valid JWT with no x-api-secret, and writes to the production DB. Either ship the frontend feature, add the secret guard, or remove the route. Endpoint: server.js:2235-2260.

### J-157 · DEAD ENDPOINT AUDIT: GET /auth/resumes (list saved resumes — no UI caller)

**Account state:** Signed-in user who has at least one row from the /auth/save-resume smoke above (else expect an empty list).  
**Start at:** renonym.com → sign in → open Dashboard with DevTools Network tab open

- [ ] **1.** Open the Dashboard view and every panel in it; filter Network tab to 'resumes'.
      **Expect:** No GET /auth/resumes request is ever made — the Dashboard does not list server-saved resumes (zero callers in renonym-react/src/).
- [ ] **2.** OPTIONAL server smoke — in DevTools Console run: fetch('https://salesforce-resume-pdf-server-production.up.railway.app/auth/resumes',{headers:{'Authorization':'Bearer '+localStorage['rn-auth-token']}}).then(r=>r.json()).then(console.log)
      **Expect:** 200 {"resumes":[...]} — each item has exactly id, name, template_style, created_at, updated_at (no resume_data payload), ordered by updated_at DESC. Empty array if the user never hit /auth/save-resume.

  **Edge cases**
  - [ ] No Authorization header → 401 {"error":"Authentication required.","code":"AUTH_REQUIRED"}
  - [ ] Expired/invalid token → 401 {"error":"Session expired. Please log in again.","code":"AUTH_REQUIRED"}
  - [ ] Server without DATABASE_URL → 503 {"error":"Auth not configured (no DATABASE_URL)."}
  - [ ] DB query throws → 500 {"error":"Failed to load resumes."}

  > ⚠️ OUT-OF-SCOPE / dead pair with /auth/save-resume — together they are a half-built 'cloud-saved resumes' feature with no UI. Same missing-validateApiSecret caveat applies. Endpoint: server.js:2262-2271.

### J-158 · DEAD ENDPOINT AUDIT: POST /auth/save-ats-report (persist job-match analysis — no UI caller)

**Account state:** Signed-in user with a valid JWT in localStorage['rn-auth-token'].  
**Start at:** renonym.com → Builder → Job Match section, DevTools Network tab open

- [ ] **1.** Run a full job-match analysis in the app (paste a JD, click analyze) and watch the Network tab.
      **Expect:** /analyze-job-match fires, but NO request to /auth/save-ats-report ever follows — analysis results are never persisted to the account (zero callers in renonym-react/src/).
- [ ] **2.** OPTIONAL server smoke — in DevTools Console run: fetch('https://salesforce-resume-pdf-server-production.up.railway.app/auth/save-ats-report',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+localStorage['rn-auth-token']},body:JSON.stringify({analysisResult:{atsScore:78,jdMatch:64},jobDescription:'audit test'})}).then(r=>r.json()).then(console.log)
      **Expect:** 200 {"success":true} — row inserted into rn_ats_reports with ats_score=78, jd_match_score=64 (pulled from analysisResult.atsScore / analysisResult.jdMatch), and rn_users.ats_reports_count incremented by 1.

  **Edge cases**
  - [ ] Body missing analysisResult → 400 {"error":"No analysis data."}
  - [ ] No Authorization header → 401 {"error":"Authentication required.","code":"AUTH_REQUIRED"}
  - [ ] Expired/invalid token → 401 {"error":"Session expired. Please log in again.","code":"AUTH_REQUIRED"}
  - [ ] Server without DATABASE_URL → 503 {"error":"Auth not configured (no DATABASE_URL)."}
  - [ ] DB insert throws → 500 {"error":"Failed to save ATS report."}
  - [ ] analysisResult present but atsScore/jdMatch missing → Still 200 {"success":true} — score columns stored as NULL (||null fallback).

  > ⚠️ OUT-OF-SCOPE / dead — unshipped 'ATS report history' feature. resumeSnapshot and jobDescription are optional (stored NULL). Same missing-validateApiSecret caveat as the other /auth/* routes. Endpoint: server.js:2273-2287.

### J-159 · DEAD FLOW AUDIT: LinkedIn OAuth (/auth/linkedin + /auth/linkedin/callback) — server-side only, not exposed in AuthModal, cannot complete even manually

**Account state:** Signed out (no rn-auth-token in localStorage). Behavior of step 2 depends on whether LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET are set in Railway env (server.js:89-90).  
**Start at:** renonym.com → trigger the auth modal (e.g. click Export while signed out)

- [ ] **1.** Open the sign-in modal and inventory the provider options.
      **Expect:** Exactly two options render: 'Continue with Google' and '✉ Continue with email' (magic link) — AuthModal.jsx mode 'choose'. There is NO LinkedIn button anywhere in the frontend.
- [ ] **2.** Manually navigate a browser tab to https://salesforce-resume-pdf-server-production.up.railway.app/auth/linkedin
      **Expect:** If LINKEDIN_CLIENT_ID is unset: dark page (#0b0c1a) with red 14px text 'LinkedIn OAuth not configured on server.' (authErrorPage; would self-close after 3s if it were a popup). If configured: 302 redirect to https://www.linkedin.com/oauth/v2/authorization with scope 'openid profile email' and redirect_uri APP_URL+'/auth/linkedin/callback'.
- [ ] **3.** (Only if configured) Complete the LinkedIn consent screen.
      **Expect:** Callback upserts a user with provider 'linkedin' (new accounts get the 2-credit signup grant via grantSignupCredits), then renders authSuccessPage: spinner + 'Signing you in...' which self-closes after ~400ms.
- [ ] **4.** Return to the renonym.com tab and check localStorage['rn-auth-token'].
      **Expect:** STILL SIGNED OUT — the session can never reach the SPA: (a) unlike the Google callback (server.js:2009-2011), the LinkedIn callback never writes the token into pendingAuthSessions, so /auth/poll would never return it; (b) the frontend has zero listeners for the 'RENONYM_AUTH_SUCCESS' postMessage (grep of src/ finds none — Google relies purely on nonce polling). LinkedIn login is therefore unreachable AND non-functional end-to-end.

  **Edge cases**
  - [ ] User clicks Cancel/Deny on LinkedIn consent (callback receives error or no code) → authErrorPage: 'LinkedIn sign-in was cancelled.'
  - [ ] Token exchange returns no access_token, or LinkedIn API call fails → authErrorPage: 'LinkedIn sign-in failed. Please try again.' (caught at server.js:2065-2068).
  - [ ] LinkedIn profile returns no email → Account is still created with placeholder email '<sub>@linkedin.placeholder' (server.js:2057) — data-hygiene gap if this flow is ever shipped.
  - [ ] Server without DATABASE_URL → Callback returns 503 {"error":"Auth not configured (no DATABASE_URL)."} (init route /auth/linkedin itself does NOT check dbRequired and will still redirect).

  > ⚠️ OUT-OF-SCOPE as a user journey / mark as product gap: half-built provider. To ship it, three pieces are needed: (1) a LinkedIn button in AuthModal.jsx using the same init-poll nonce pattern as Google, (2) pendingAuthSessions.set(nonce, {token,user}) in the LinkedIn callback (mirror server.js:2009-2011), (3) LINKEDIN_CLIENT_ID/LINKEDIN_CLIENT_SECRET set in Railway. Until then, exclude /auth/linkedin and /auth/linkedin/callback from any 'endpoint coverage' claims. Server code: server.js:2022-2069.


---

## Appendix B — Lower-confidence journeys (verify against the app, not just this doc)

A completeness critic flagged these as under-specified — the steps are correct but thinner than the rest; trust the live app over the doc if they disagree, and note what you see:

- Report Unlock ₹299 — session-bound one-off purchase (2 steps, 4 edges): far too thin for a payment flow with three distinct server-side create-order pre-checks (401 AUTH_REQUIRED with no bearer, 400 missing/non-UUID sessionId, 400 already-unlocked/not-found at server.js:2372-2388) plus post-payment report refresh; needs explicit verify-payment grant assertions.
- Section hash anchor typed while inside an app view returns to landing (2 steps): does not specify WHICH hashes (only the 4 in SECTION_HASHES — #resume #pricing #how #coach — trigger the handler, main.jsx:27,129-140) or from which views; an untracked hash like #features should do nothing.
- Import a DOCX resume / Import a TXT resume / Import an oversized file (2 steps each): no assertions on which fields land where after /extract-resume, or on the exact client-side size-check error copy.
- Start interview as Placement Pro holder (2 steps) and Start interview with a legacy Session Pass (2 steps): neither specifies verifying the counter decrement (pass_interviews_remaining / session_passes) after the session is created.
- Checkout while already entitled / stale session (2 steps): does not specify what 'already entitled' renders (redirect? banner?) nor the stale-session reproduction steps.
- Anonymous user buys from the ladder (preconditions admit the entry is contrived — 'not possible from the builder gates... clear localStorage auth keys in devtools before clicking'): as written this tests a state real users cannot reach from the builder; should be rescoped to the genuinely reachable signed-out /coach/checkout path or dropped.
- Export the report as PDF (3 steps, 1 edge): desktop-only by its own precondition with no mobile alternative specified, and no assertion on partial-vs-full report export differences.
- Sign-out (builder UserPill and Dashboard) (4 steps): does not specify whether POST /auth/logout is called, whether rb-draft survives logout, or the second-device-still-signed-in expectation.
- Method step — Build from Scratch (3 steps, 1 edge): no assertion about starting state (zero experience cards, placeholder preview) that later journeys depend on.
