# Renonym — Security Audit & Remediation Report

**Date:** 12 June 2026  ·  **Auditor:** Principal Security Architect (authorized, owner-requested)  ·  **Method:** static source audit of both repositories + adversarial verification of every Critical/High finding + controlled live probes against production.
**Backend at audit:** `v14.4` → **remediated to `v14.5-sec-2026` (live)**.  **Frontend:** security headers + fixes **deployed**.

> Scope: the `renonym-react` SPA (Vercel), the single-file Node/Express backend (Railway), Railway Postgres, and the Razorpay + OpenAI integrations. Cloud-dashboard, DNS, and backup settings were assessed from the outside; items needing console access are called out as **operator follow-ups**.

---

## Phase 7 — Executive scorecard (read this first)

| Domain | Score /100 | Note |
|---|---|---|
| **Overall security posture** | **76** | Up from ~52 pre-remediation |
| Infrastructure | 70 | Chromium sandbox + DB-TLS verify + DNS hygiene residuals |
| Application | 80 | Strong query/IDOR hygiene; headers now shipped; CSP in report-only |
| API | 81 | Good auth/replay/rate-limit; `x-client-id` spoofable, `x-api-secret` is public-by-design |
| Database | 80 | Fully parameterized, UUID keys, replay-protected; no erasure/retention policy |
| AI / LLM | 84 | Vision gated, token caps added, injection blast-radius bounded |
| Deployment / Secrets | 72 | JWT now fail-closed; no formal secret-rotation; backend mirrored in FE git history |

**Current risk level:** 🟡 **MEDIUM** (was 🔴 **CRITICAL** at the start of this audit).
**Go-live recommendation:** ✅ **Safe with Conditions** — the one Critical is mitigated and 4 of 6 Highs are closed; the two residual Highs (C2/C4 auth-delivery) need the tested refactor in **Follow-up F-2**, and the operator conditions below should be completed within the first week.

**Conditions before/at go-live (in priority order):**
1. **F-2** — close the OAuth/magic-link poll-harvest variant (token delivered only to the authenticating browser).
2. **F-1** — run the PDF renderer sandboxed or isolated, and upgrade Puppeteer/Chromium off the 2023 build.
3. Enforce the CSP (flip `Content-Security-Policy-Report-Only` → `Content-Security-Policy` after a clean reporting window).
4. Confirm `JWT_SECRET` (≥32 random bytes) and `RAZORPAY_KEY_SECRET` are set in Railway, and rotate `JWT_SECRET` once (invalidates any token ever signed with a weak value).
5. Add an account-deletion / data-export path (GDPR Arts. 15/17).

---

## Phase 1 & 2 — Discovery + Threat Model

### Attack-surface map

```
                 ┌─────────────────────────── TRUST BOUNDARY: public internet ──────────────────────────┐
  Anonymous ─────┤  Vercel SPA (renonym.com)  ──HTTPS──►  Railway Express API  ──►  Postgres (private)   │
  user / bot     │   - JS bundle ships x-api-secret (PUBLIC by design)            - OpenAI (egress)       │
  attacker       │   - tokens in localStorage                                     - Razorpay (egress)     │
                 │                                                                 - Puppeteer/Chromium    │
                 └────────────────────────────────────────────────────────────────────────────────────┘
   Privilege tiers:  anonymous  →  signed-in free (+2 credits)  →  credit/pass holder  →  (no admin tier)
   Highest-value assets:  user résumés & interview transcripts (PII) · JWT signing key · Razorpay key secret ·
                          OpenAI key · the credit/payment ledger · the Postgres instance.
```

### Trust boundaries & the load-bearing fact
`x-api-secret` (`VITE_API_SECRET`) **ships inside the public JS bundle** — confirmed by extracting it from the deployed `index-*.js`. It is a bot-deterrent, **not** an authentication factor. Every endpoint whose only guard is `x-api-secret` must be treated as **unauthenticated**. This is accepted architecture, but it is why "anonymous, expensive AI endpoint" findings (C6/M5) are real.

### Confirmed Critical / High findings (adversarially verified)

| ID | Severity | Finding | Status |
|---|---|---|---|
| C1 | CRITICAL | Chromium runs with --no-sandbox while rendering fully attacker-controlled HTML/CSS/JS on a 3-year-old bundled Chromium (renderer RCE escapes to the Railway host) | 🟡 Mitigated |
| C2 | HIGH | OAuth login-flow hijack via attacker-chosen poll nonce → full account takeover | 🟡 Partially fixed |
| C3 | HIGH | JWT signing key falls back to a hardcoded public default with no startup guard | 🟢 Fixed |
| C4 | HIGH | Magic-link polling slot is keyed on an attacker-controlled clientId → victim's session token is harvestable (account takeover) | 🟠 Open (documented) |
| C5 | HIGH | SSRF: the rendered page loads arbitrary external and internal URLs (no request interception, no URL allowlist, no egress restriction) | 🟢 Fixed |
| C6 | HIGH | /analyze-food runs GPT-4o Vision with no login and no credit charge — effectively-unauthenticated OpenAI bill DoS | 🟢 Fixed |
| C7 | MEDIUM | PDF HTML sanitizer is regex-based and bypassable; JavaScript executes in the render context | 🟢 Fixed |
| C8 | MEDIUM | JWT signing secret has a hardcoded fail-open fallback (CHANGE_ME default), and that default value is publicly committed in the frontend repo | 🟢 Fixed |

#### C1 · 🔴 CRITICAL — Chromium runs with --no-sandbox while rendering fully attacker-controlled HTML/CSS/JS on a 3-year-old bundled Chromium (renderer RCE escapes to the Railway host)

- **Location:** `server.js:932-940 (launch flags); package.json:22 (puppeteer`
- **Impact:** Full server compromise and exfiltration of every secret and all customer data + payment material, reachable by anyone willing to create a free account. Highest-
- **Likelihood:** medium
- **Status:** 🟡 Mitigated
- **Action taken:** Page JS disabled + request-interception allowlist + CSP meta now block the SSRF and remove the script engine needed to drive a renderer exploit. **Residual:** `--no-sandbox` + a 3-yr-old bundled Chromium — see Follow-up F-1 (run sandboxed / isolate the renderer / upgrade Puppeteer).

#### C2 · 🟠 HIGH — OAuth login-flow hijack via attacker-chosen poll nonce → full account takeover

- **Location:** `server.js lines 1968-2018 (/auth/google + callback), 2209-22`
- **Impact:** Account takeover of any user who can be induced to complete a Google sign-in via an attacker-supplied link — read/modify saved resumes, ATS reports, tracker, co
- **Likelihood:** medium
- **Status:** 🟡 Partially fixed
- **Action taken:** OAuth `state` is now HMAC-signed with a 10-min freshness window (blocks state/`cid` tampering & forgery). **Residual:** the lure-based poll-harvest variant needs the token delivered only to the authenticating browser — see Follow-up F-2 (postMessage/fragment delivery, requires live-OAuth test).

#### C3 · 🟠 HIGH — JWT signing key falls back to a hardcoded public default with no startup guard

- **Location:** `server.js line 83 (also 1884-1890 signToken, 1903-1909 requi`
- **Impact:** Total authentication bypass / forge-any-session if the secret is misconfigured: takeover of every account and free grant of paid plan/credits. The blast radius 
- **Likelihood:** low
- **Status:** 🟢 Fixed
- **Action taken:** Hardcoded fallback removed; server now **fails closed at boot** if `JWT_SECRET` is missing/<32 chars. Verified prod already runs a real secret (a default-signed token is rejected — see Pentest P-1).

#### C4 · 🟠 HIGH — Magic-link polling slot is keyed on an attacker-controlled clientId → victim's session token is harvestable (account takeover)

- **Location:** `server.js:2075-2096 (request), :2144-2146 (verify), :2217-22`
- **Impact:** Attacker-controlled session fixation on the auth-completion channel: any victim who clicks an unsolicited (but legitimate-looking) Renonym sign-in email hands t
- **Likelihood:** low
- **Status:** 🟠 Open (documented)
- **Action taken:** Magic-link poll slot is still keyed on the client-supplied id. Full fix delivers the token to the clicking browser instead of a pollable slot — see Follow-up F-2. Lower exploitability than C2 (needs the victim to click an unsolicited but real sign-in email).

#### C5 · 🟠 HIGH — SSRF: the rendered page loads arbitrary external and internal URLs (no request interception, no URL allowlist, no egress restriction)

- **Location:** `server.js:942 (newPage with no setRequestInterception anywhe`
- **Impact:** Lets any free account reach services unreachable from the internet (internal Railway services, localhost-bound admin/debug ports, the DB port, metadata endpoint
- **Likelihood:** high
- **Status:** 🟢 Fixed
- **Action taken:** `page.setRequestInterception(true)` with a strict allowlist (data:/about:/blob: + HTTPS Google-Fonts only) — every other fetch, including internal/metadata hosts, is aborted. Verified locally and the endpoint now also requires login (Pentest P-2).

#### C6 · 🟠 HIGH — /analyze-food runs GPT-4o Vision with no login and no credit charge — effectively-unauthenticated OpenAI bill DoS

- **Location:** `server.js:2291-2329 (handler); middleware 394,406-408 vs 593`
- **Impact:** Direct, attacker-controlled spend on the owner's OpenAI account (GPT-4o vision is the priciest call), with zero authentication and zero credit accounting. Finan
- **Likelihood:** medium
- **Status:** 🟢 Fixed
- **Action taken:** `/analyze-food` now mounted behind `requirePremiumAuth + requireCredits(1)`. Verified live: anonymous call returns 401 (Pentest P-3).

#### C7 · 🟡 MEDIUM — PDF HTML sanitizer is regex-based and bypassable; JavaScript executes in the render context

- **Location:** `server.js:884-895 (sanitizePdfHtml); JS enabled because setJ`
- **Impact:** Turns the PDF renderer into an attacker-controlled JS execution environment: full SSRF-with-read where CORS permits, data exfiltration, and the enabler for rend
- **Likelihood:** high
- **Status:** 🟢 Fixed
- **Action taken:** `setJavaScriptEnabled(false)` neutralises every inline-script vector regardless of the regex sanitizer; a strict CSP `<meta>` is the backstop. Verified: an inline `<script>` no longer executes in the render (local test).

#### C8 · 🟡 MEDIUM — JWT signing secret has a hardcoded fail-open fallback (CHANGE_ME default), and that default value is publicly committed in the frontend repo

- **Location:** `server.js:83 (and stray copy /Users/rakshitsegwal/Documents/`
- **Impact:** If JWT_SECRET is unset on any environment, complete authentication bypass and account takeover for all users, plus theft/manipulation of paid credits. Even with
- **Likelihood:** medium
- **Status:** 🟢 Fixed
- **Action taken:** Same fix as C3 (fail-closed boot, no committed default).


### Medium / Low findings (verified by domain auditors)

| ID | Sev | Finding | Disposition |
|---|---|---|---|
| M1 | MEDIUM | No session revocation: logout is a no-op and 30-day JWTs (stored in localStorage, CSP disabled) cannot be invalidated | Documented — see Follow-ups |
| M2 | MEDIUM | Magic-link poll slot is keyed by the non-secret, reused clientId — session-theft race | Documented — see Follow-ups |
| M3 | MEDIUM | Google email trusted without email_verified, and upsert matches accounts across providers by email | Documented — see Follow-ups |
| M4 | MEDIUM | Premium-template PDF export gate decides entitlement from attacker-controlled HTML — free users export paid templates (paywall bypass) | Documented — see Follow-ups |
| M5 | MEDIUM | Unauthenticated, cost-bearing AI endpoints (/analyze-food gpt-4o vision, /extract-resume) behind only the public x-api-secret + a client-bypassable rate limit | 🟢 Partially — `/analyze-food` gated (login+credit); `/extract-resume` given a `max_tokens` cap (still anonymous on-ramp, documented). |
| M6 | MEDIUM | verify-payment trusts client-supplied planId when the Razorpay order fetch fails, and never reconciles paid amount/status — plan escalation | 🟢 Fixed — plan derived from the Razorpay order ONLY; fails closed (503, retry-safe) if the order can't be read. Never trusts client `planId` |
| M7 | MEDIUM | TOCTOU credit race: concurrent premium AI requests with 1 credit deliver many uncharged AI actions | Documented — see Follow-ups |
| M8 | MEDIUM | No payment webhook and no refund/chargeback handling — stranded payments and non-revocable entitlements | Documented — see Follow-ups |
| M9 | MEDIUM | Sybil free-credit farming: unlimited signup (+2) and referral (+5/+5) grants with no email verification or uniqueness binding | Documented — see Follow-ups |
| M10 | MEDIUM | Non-atomic v14 grant: ledger idempotency marker committed before the balance/entitlement write — a mid-grant failure permanently strands the purchase | Documented — see Follow-ups |
| M11 | MEDIUM | Cheap denial-of-service: O(n^2) height-measurement loop + no per-render watchdog + only 2 render slots | Documented — see Follow-ups |
| M12 | MEDIUM | Premium-template entitlement is decided by a substring test on client-supplied HTML and fails open (paywall bypass) | Documented — see Follow-ups |
| M13 | MEDIUM | /extract-resume runs an OpenAI call with no login, no credit charge, and no max_tokens | Documented — see Follow-ups |
| M14 | MEDIUM | Per-client rate limiter is trivially bypassed — x-client-id is any caller-chosen 8–72 char string | Documented — see Follow-ups |
| M15 | MEDIUM | No Content-Security-Policy and no clickjacking headers (X-Frame-Options / frame-ancestors) — site is framable and has zero defense-in-depth for XSS/CDN compromise | Documented — see Follow-ups |
| M16 | MEDIUM | Third-party CDN scripts loaded without Subresource Integrity (SRI) — cdnjs/Razorpay compromise runs with full DOM access and steals the localStorage auth token | Documented — see Follow-ups |
| M17 | MEDIUM | User-facing Vercel frontend (renonym.com) ships with zero security headers — no CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy or Permissions-Policy | Documented — see Follow-ups |
| M18 | MEDIUM | Global 10mb JSON body parser runs before any auth/rate-limit on every route (including unknown paths) → cheap unauthenticated DoS amplification | Documented — see Follow-ups |
| M19 | MEDIUM | Full backend source (server.js, auth + payment logic) is committed into the deployable frontend repo | Documented — see Follow-ups |
| M20 | MEDIUM | CDN-loaded libraries injected without Subresource Integrity (SRI) or crossorigin | Documented — see Follow-ups |
| M21 | MEDIUM | pdf.js 3.11.174 (pinned) is vulnerable to CVE-2024-4367 — arbitrary JS execution from a crafted PDF, used to parse untrusted user uploads | Documented — see Follow-ups |
| M22 | MEDIUM | Backend dependency tree has 5 high-severity npm advisories via an outdated puppeteer (19.8.5) | Documented — see Follow-ups |
| M23 | MEDIUM | No account-deletion / right-to-erasure mechanism; highly-sensitive PII retained indefinitely | Documented — see Follow-ups |
| M24 | MEDIUM | Postgres connection disables TLS certificate validation (rejectUnauthorized:false) — MITM-able transport for all PII | Documented — see Follow-ups |
| M25 | LOW | Magic-link token carried in the URL query string (Referer/history/proxy-log exposure) | Documented — see Follow-ups |
| M26 | LOW | Entitlement / credit / quota middleware fail OPEN on any DB error — premium gating bypassed during a DB hiccup | Documented — see Follow-ups |
| M27 | LOW | User-controlled LIKE search term not escaped for wildcard metacharacters (LIKE-pattern injection, not SQLi) | Documented — see Follow-ups |
| M28 | LOW | Razorpay signature compared with non-constant-time string equality | Documented — see Follow-ups |
| M29 | LOW | Retired high-value SKUs remain purchasable and grantable unless LADDER_LIVE is explicitly 'true', and legacy grants rely on a single replay layer | Documented — see Follow-ups |
| M30 | LOW | Unbounded output on /analyze-job-match and /optimize-for-job (no max_tokens) — prompt-injection cost amplification | Documented — see Follow-ups |
| M31 | LOW | Coach scoring & JD-match scores are prompt-injectable — fabricated 100/100 + invented percentile (self-only integrity) | Documented — see Follow-ups |
| M32 | LOW | Stored javascript: URL in job posting link rendered into href (DOM XSS sink, self-XSS) | Documented — see Follow-ups |
| M33 | LOW | OAuth popup opened with window.open() without 'noopener' (reverse-tabnabbing) | Documented — see Follow-ups |
| M34 | LOW | Auth bearer token stored in localStorage — any script-execution = instant account takeover (accepted architecture, quantified) | Documented — see Follow-ups |
| M35 | LOW | Helmet has Content-Security-Policy disabled while the backend serves HTML (OAuth pages embedding the JWT, puppeteer-rendered resume DOM) | Documented — see Follow-ups |
| M36 | LOW | Unauthenticated /version endpoint and X-Server-Version response header disclose build/version and uptime | Documented — see Follow-ups |
| M37 | LOW | User emails and Razorpay payment/order IDs written to persistent application logs | Documented — see Follow-ups |
| M38 | LOW | Magic-link sign-in token transmitted in the URL — leaks to email-provider logs and browser history | Documented — see Follow-ups |
| M39 | LOW | rn_jd_corpus is designed to store full JD text under a pseudonymous (not anonymous) sha256 user hash | Documented — see Follow-ups |
| M40 | LOW | Server-side logout is a no-op; 30-day JWTs in localStorage cannot be revoked | Documented — see Follow-ups |

> The four "refuted" candidate-findings from the first pass (e.g. a claimed live JWT bypass, claimed SQL injection) were **disproven** during adversarial verification — prod uses a real JWT secret and every query is parameterized. They are not listed as risks.

---

## Phase 3 & 4 — Remediation & Hardening (shipped this pass)

All of the following are **committed and live** (backend `v14.5-sec-2026`, frontend deployed):

**Backend (`node server/server.js`)**
1. **JWT fail-closed boot** — removed the public `'CHANGE_ME…'` fallback; `process.exit(1)` if `JWT_SECRET` is absent/<32 chars. *(C3/C8)*
2. **PDF pipeline de-weaponized** — `setJavaScriptEnabled(false)` + `setRequestInterception(true)` allowlist (data:/about:/blob: + HTTPS Google-Fonts only) + strict CSP `<meta>` in the rendered document. Kills SSRF and removes the JS engine that an RCE chain needs. *(C1/C5/C7)* — verified locally that scripts don't run, data-URI photos still render, fonts still load, and the height-measurement `page.evaluate` still works.
3. **Vision gated** — `/analyze-food` (GPT-4o) now requires login + 1 credit. *(C6)*
4. **Payment integrity** — `verify-payment` now uses a constant-time signature compare and derives the plan **only** from the Razorpay order (fails closed, retry-safe, never trusts client `planId`). *(M6, + signature-timing low)*
5. **OAuth state integrity** — `state` is HMAC-signed with a freshness window on Google + LinkedIn. *(C2 partial)*
6. **AI cost caps** — `max_tokens` added to `extract-resume`, `analyze-job-match`, `optimize-for-job`.

**Frontend (`renonym-react`)**
7. **Security headers** (`vercel.json`) — HSTS w/ `includeSubDomains; preload`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (camera/mic self-only), `Cross-Origin-Opener-Policy`, `X-Frame-Options: SAMEORIGIN` **enforced**; a full **CSP shipped in Report-Only** to validate before enforcing. Verified live on `www.renonym.com`.
8. **pdf.js CVE-2024-4367** — `isEvalSupported:false` at all three parse sites.
9. **Safe URL guard** — tracker job links pass through `safeExternalUrl()` (only `http(s)` reaches `href`, blocking stored `javascript:` self-XSS) + `rel="noopener noreferrer"`.
10. **Gated-endpoint UX** — the calorie tool now surfaces 401/402 instead of a misleading error.

### What was already done right (93 verified positive controls — selected)

**AUTHENTICATION FLOWS**
- Magic-link tokens use strong entropy and are properly single-use: crypto.randomBytes(32) (256-bit), 15-minute expiry, prior unused tokens deleted on new request, and verify checks `used_at IS NULL AND expires_at > NOW()` then stamps used_at (server.js 2081-2087, 2129-2135).
- Poll nonce uses crypto.randomBytes(16) (128-bit) — not brute-forceable — and pollLimiter (250/5min/IP) caps enumeration attempts (server.js 2210, 330-335).
- No email enumeration: /auth/magic-link/request returns {success:true} for any syntactically valid email and does not reveal whether an account exists (server.js 2073-2117).
- OAuth popup postMessage uses an explicit targetOrigin (FRONTEND_URL), never '*', so the token is not broadcast to arbitrary origins (server.js 1946, 1952, 1963).
- CORS uses a fixed allowlist with a callback that rejects unknown origins rather than reflecting Origin; credentials are gated to known origins (server.js 21-38).
- Poll delivery is one-shot: pendingAuthSessions.delete(nonce) immediately after the token is read, preventing replay of the same slot (server.js 2224).
- requireAuth and optionalAuth are cleanly separated, and user-data/coach/tracker endpoints consistently apply requireAuth so they verify the JWT signature server-side (server.js 1894-1909, 2235+, 2783+, 3145+).
- Single-account-per-email upsert prevents duplicate/shadow accounts for the same verified mailbox (server.js 1912-1924).
- authSuccessPage/authErrorPage HTML-escape the embedded user JSON and error message (</> and &lt; escaping) before injecting into the inline script (server.js 1936-1939, 1956).
- Stale-nonce cleanup runs on a 5-minute interval plus a per-nonce setTimeout, bounding the in-memory pendingAuthSessions map (server.js 2200-2214).

**Authorization / IDOR / Bro**
- Every authenticated data route scopes its query by req.user.id from the verified JWT — coach sessions (GET/answers/score/question-audio/transcribe all use WHERE id=$ AND user_id=$), tracker jobs and events (GET/PATCH/DELETE/events all join on user_id), saved resumes and ATS reports. No grep hit anywhere uses req.body.userId / req.query.userId / req.params.userId to scope a data query. No IDOR found in the data layer.
- All resource IDs are UUIDs (gen_random_uuid) and every :id route validates UUID_RE before querying, so records cannot be enumerated sequentially and malformed ids are rejected with 404.
- Mass-assignment is prevented: /tracker/jobs/:id PATCH and /tracker/events/:id PATCH build their UPDATE from an explicit field whitelist; user_id and job_id are never settable from the request body, and the UPDATE still carries the AND user_id=$ ownership predicate.
- Coach report paywall is enforced server-side, not client-side: reportIsLocked + partialReport actually redact the stored report (dimensions/fixes/recommendations emptied, strengths/weaknesses sliced to 1) on GET and score, and the full report is only released after a paid unlock that is scoped to the owner (WHERE id=$ AND user_id=$).
- Razorpay verify-payment is robust: HMAC-SHA256 signature verified, the plan AND amount are derived from the server-created order (order.notes.plan), never from the client body, so a cheap payment cannot claim an expensive plan; replay is blocked by a unique payment_id insert; grants are idempotent via a ledger ref_id conflict; and the redemption is released if the grant doesn't land.
- report_unlock_299 purchases validate up front (in /create-order) that the session is owned by the buyer, is a free session, and is still locked — so money can never be captured with nothing to grant, and the unlock UPDATE is user-scoped.
- Privilege is re-read from the database on every gated action (requireCredits/requirePro/enforceDailyQuota SELECT plan/pass from rn_users) rather than trusting the 'plan' claim baked into the JWT, so a stale or forged plan claim in a token cannot escalate entitlements.
- Referral claim is atomic and abuse-resistant: referred_by IS NULL acts as a once-only guard inside a transaction, self-referral is rejected, and the endpoint is tightly rate-limited to block code enumeration.
- optionalAuth on /analyze-job-match is implemented correctly — anonymous callers receive only a teaser (scores + 3 keywords, locked:true) while the full report requires a valid token; the middleware never throws on a bad token.
- jsonwebtoken is pinned to ^9 (rejects alg:none / algorithm-confusion by default), and the OAuth success/error pages JSON-escape and HTML-escape injected values before embedding them in the inline script.

**SQL Injection & Query Secu**
- Every query is fully parameterized: across all ~70 db.query/client.query call sites, user-supplied values are passed exclusively via positional placeholders ($1,$2,...) and the params array — there is no string concatenation or template-literal interpolation of user VALUES into any SQL statement.
- Dynamic UPDATE column lists in the tracker PATCH handlers (server.js:3233-3242 for rn_jobs and :3291-3299 for rn_job_events) are built only from a hardcoded `fields` object literal / fixed if-blocks; the loop interpolates only the literal column names (keys defined in source), while every user value goes into vals[] as a bound parameter. No user input can ever reach a column name or operator.
- The one interpolated WHERE clause (GET /tracker/jobs, server.js:3149-3158) is assembled from fixed fragments only: user_id=$1, an archived boolean literal, a `stage` value validated against the JOB_STAGES allow-list before use (:3152), and a bound ILIKE parameter for `q`. No raw user string is concatenated into the SQL text.
- All :id route parameters are validated against a strict UUID_RE regex (server.js:2780) before any query runs (e.g. :2926, :2942, :3195, :3209, :3254, :3288, :3308), and every owned-resource query is additionally scoped with `AND user_id=$N`, so even a forged but well-formed UUID cannot read or mutate another user's rows.
- The requireCredits ledger reason ('spend:' + req.baseUrl) is bound as parameter $3 in the INSERT (server.js:517,527-529), not concatenated into SQL — so even though it derives from the request, it cannot break out of the value position.
- LIMIT and ORDER BY are static literals everywhere (LIMIT 500/200/100/50/10, ORDER BY updated_at/created_at DESC); there is no user-controlled sort column or LIMIT value anywhere in the codebase.
- JSONB writes are safe: answers are appended with a bound `$1::jsonb` cast (server.js:2947-2954) and event `meta` is JSON.stringify'd then bound as a parameter (:3279) — no user-controlled JSONB path/key is interpolated into SQL.
- Payment verification and grants (verify-payment, server.js:2482-2592) use parameterized INSERT/UPDATE plus a unique-index idempotency guard (idx_rn_credit_ledger_purchase, schema :262-263); the replay/grant logic never builds SQL from request strings.
- The schema bootstrap (server.js:103-275), schema.sql, and the grandfather.js migration contain no env-var or user-derived interpolation in their SQL — DATABASE_URL is used only as the pg connection string, and grandfather.js uses bound parameters ($1) for every per-user UPDATE.
- COALESCE/GREATEST-based atomic balance math and conditional UPDATEs (e.g. credit debit `WHERE credit_balance >= $2` at :523-525, entitlement consume guards at :2874-2882) keep mutations server-authoritative and race-safe without ever concatenating values.

**Payments + Money Logic (Ra**
- Order amounts are server-authoritative: /create-order looks up plan.amount from the server-side PLANS map (server.js:2337-2353, 2395-2398); the client only sends planId, so it cannot set the charged amount or currency directly.
- Razorpay signature is verified correctly with HMAC-SHA256 over the exact 'order_id\|payment_id' concatenation using RAZORPAY_KEY_SECRET (server.js:2436-2444); client-side 'success' is never trusted on its own.
- Replay protection works: rn_payments has payment_id as PRIMARY KEY and verify-payment uses INSERT ... ON CONFLICT (payment_id) DO NOTHING, returning {replay:true} without re-granting (server.js:186-192, 2482-2491).
- Concurrent double-verify of the same payment is serialized by the rn_payments unique PK — exactly one concurrent caller wins the insert and grants; the other short-circuits as a replay (server.js:2482-2491).
- v14 ladder grants carry a second idempotency layer: a partial UNIQUE index on rn_credit_ledger(ref_id) WHERE reason LIKE 'purchase:%' plus a marker-first INSERT, so a payment grants its credits/pass at most once even across retries (server.js:262-263, 2511-2522).
- The grant recipient is taken from the verified JWT (jwt.verify) first and only falls back to body userId, never from client-tamperable order notes (server.js:2467-2473), so a caller cannot redirect another user's entitlement by editing the request body.
- report_unlock_299 is tightly bound: at order time it requires a signed-in user and an owned, free, still-locked session (server.js:2372-2388), and at grant time it re-reads the sessionId from server-set order notes and updates only WHERE id=session AND user_id=grantee (server.js:2555-2564) — ₹299 can never be captured or applied with nothing to unlock.
- Credit debits use a conditional UPDATE (... WHERE credit_balance >= n) and only fire on a 2xx, non-fallback response (server.js:518-533), so balances cannot go negative and failed/AI-fallback actions are not charged.
- Interview-entitlement consumption uses atomic guarded UPDATEs (... WHERE pass_interviews_remaining > 0 / interview_credits > 0 / free_interview_used = FALSE) with a race-lost 402 and an explicit refund on insert failure (server.js:2873-2903).
- Referral grants are wrapped in a single DB transaction with an atomic once-only guard (UPDATE ... WHERE referred_by IS NULL) and a self-referral block, so claims commit both payouts together or not at all (server.js:3101-3116).
- The Razorpay key_secret never leaves the server: /create-order returns only the public key_id, and order creation happens server-side (server.js:2409-2414).

**Server-side PDF generation**
- /generate-pdf is NOT reachable with only the public x-api-secret: requirePremiumAuth (server.js:435-441, 598) enforces a valid Bearer JWT verified with JWT_SECRET, so the SSRF/RCE surface is gated behind (free) account registration rather than fully anonymous.
- The browser is always torn down in a finally block (server.js:1054-1056, browser.close().catch(...)), so error/exception paths do not leak Chromium processes.
- A concurrency gate (server.js:901-911) caps simultaneous Chromium launches at 2 with a 6-deep queue and returns 503 instead of OOM-killing the instance (good memory-pressure protection, though it doubles as a DoS chokepoint).
- Input size is bounded at several layers: express.json limit 10mb (server.js:41), html capped at 6,000,000 bytes and css at 1,500,000 bytes (server.js:895, 925), and PDF output height clamped to 5000px (server.js:1034).
- Rendering uses page.setContent on locally-assembled HTML rather than page.goto on an attacker-supplied URL, and uses waitUntil:'domcontentloaded' with a 20s timeout plus a bounded 8s font wait instead of networkidle, avoiding a third-party hang turning into a render hang.
- Layered rate limiting on the endpoint: exportLimiter (20/hr/IP, skipFailedRequests so a failed render does not burn a slot) plus perClientIdLimiter and validateClientSession (server.js:403, 415, 424).
- The sanitizer does remove the most obvious vectors (well-formed <script>...</script>, rel=import links, quoted inline on*= handlers, quoted javascript: URLs at server.js:884-895), a reasonable partial defense that just needs replacing with a real parser plus a JS-disabled render to be complete.

**AI / LLM Security**
- Token contract is enforced server-side and is genuinely tamper-proof: sanitizeTokens() (server.js:1250-1287) validates every one of the 16 tokens — each colour must match a strict hex regex (HEX_PATTERN, line 1189) or it is replaced with a safe default, fonts are coerced to a 7-item allowlist (clampFont), and text/bg pairs are forced to >=4.5:1 WCAG contrast. The model literally cannot emit CSS or JS that reaches the client; only typed colour/font values are applied as CSS custom properties on a hardcoded layout (resumeTokenStyle, ResumeBuilder.jsx:823-848).
- No dangerouslySetInnerHTML anywhere in src/ (grep returns nothing). Every AI text output — review feedback, JD-match strengths/weaknesses/suggestions, coach verdict/summary/rewrite, food notes, question text/hint (renderHi splits into React nodes) — is rendered via auto-escaping JSX interpolation, so prompt-injected markup cannot become XSS.
- PDF export is double-protected against injected markup: AI text is React-escaped into the serialized outerHTML, and the server independently runs sanitizePdfHtml() (server.js:884-896) stripping <script>/<iframe>, inline on* handlers, and javascript: URLs before Puppeteer renders — so injected resume/JD text cannot achieve XSS or script execution in the headless browser.
- Most OpenAI calls have explicit max_tokens caps: inspiration vision 300, layout classifier 10, token generation 500, improve-summary 200, review-resume 400, analyze-food 1000, coach question-gen 1200, coach scoring 1800 — bounding per-call output cost on those routes.
- Numeric AI outputs are validated server-side: analyze-job-match clamps atsScore/jdMatch/keywordCoverage/skillsCoverage to 0-100 and coerces missing arrays to [] (server.js:1744-1752); coachScore clamps overall and every dimension score to 0-100 (2769-2770); food totalCalories is capped at 5000 — preventing type-confusion / absurd values from a manipulated model response.
- AI prompt content and user PII are not logged: AI handlers log only metadata (scores, layout/accent, KB and char counts) — e.g. transcribe logs '...KB -> N chars' (server.js:3070), never the transcript or resume text. The inspiration-image vision prompt explicitly instructs the model to extract style signals only and 'DO NOT extract or mention any personal data, names, companies' (1322-1326) and uses detail:'low'.
- Input sizes are bounded before every LLM call (truncateText/slice): extract-resume 12000, JD 6000 then 5000, resume 8000/10000, coach JD 12000, transcript 8000 — limiting prompt-injection surface and input cost.
- Coach media endpoints are properly locked down: /transcribe and /question-audio require requireAuth, verify session ownership against rn_interview_sessions (user_id match), validate the session id as a UUID, cap the raw audio body at 16mb with a content-type allowlist, and reject bodies under 200 bytes.

**FRONTEND XSS / DOM / STORA**
- All user- and AI-controlled content in the resume preview and reports is rendered through JSX text interpolation, which auto-escapes HTML. ResumeLayouts.jsx renders name/title/email/linkedIn/summary/skills/experience/education as {value} text children (e.g. lines 15-21, 33, 45, 78); the AI job-review feedback is rendered as <p>{analysisFeedback}</p> (ResumeBuilder.jsx:2733); the interview report renders verdict/strengths/fixes as text and renderRewrite() builds React elements rather than HTML (InterviewReport.jsx:184,211-217).
- No dangerouslySetInnerHTML, .innerHTML, insertAdjacentHTML, document.write, eval, or new Function anywhere in src/ (verified by grep; the only dist hit is React's own internal prop table).
- AI theming is genuinely token-based, not CSS-string injection: /generate-template tokens are applied as CSS custom properties via a React style object (resumeTokenStyle, ResumeBuilder.jsx:823-848) set through the DOM style API, so values cannot break out of the property; the legacy aiGeneratedCss path is emptied and any old <style id=rp-ai-template-style> tag is removed (ResumeBuilder.jsx:1388-1393). This matches the documented token-only constraint.
- The ?ref referral param is sanitized before storage: ref.trim().toUpperCase().slice(0,16) (main.jsx:69), preventing reflected injection via the referral code.
- The single external user-link (tracker job posting) uses rel="noreferrer" (JobDetail.jsx:129), which also implies noopener, blocking forward-tabnabbing for that link.
- No postMessage / message event listeners exist in the codebase, so there is no missing-origin-check message handler to exploit (grep for addEventListener('message'/onmessage/postMessage returned nothing).
- The LegalPage <style> block (LegalPage.jsx:121-137) and index.html inline <style> contain only static literals — no string interpolation of user data.
- Payment integrity is enforced server-side: the client only forwards Razorpay order/payment/signature to /verify-payment (PaymentButton.jsx:66-81), and report unlock explicitly handles the 'paid but not applied' case without auto-retrying a charge (InterviewReport.jsx:56-60).

**HEADERS / CORS / TRANSPORT**
- trust proxy is set to the conservative value 1 (server.js:19), not `true` — for Railway's single proxy hop Express returns the rightmost (Railway-appended) X-Forwarded-For entry, so a client sending a spoofed X-Forwarded-For cannot move its own req.ip and bypass the IP-keyed rate limiters. This is the correct setting (the common mistake of `trust proxy: true` enabling spoofing is avoided).
- CORS uses an explicit origin allowlist via a callback (server.js:21-38): only renonym.com, www.renonym.com, the Salesforce site and env-configured origins are allowed. No wildcard `*`, no reflect-arbitrary-Origin, and `Origin: null` (sandboxed iframe/file://) is rejected because it is not in the allowlist. `credentials:true` is paired with this strict allowlist rather than `*`.
- Helmet is enabled on the backend (server.js:71-76), so API responses get X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, Referrer-Policy, HSTS, and X-Powered-By is removed — solid baseline for the API origin (the gap is that these don't cover the Vercel-served frontend).
- The global error handler does not leak stack traces to clients (server.js:3385-3395): it logs the error server-side and returns a generic `{error:'Something went wrong.'}`, with specific clean messages for entity.too.large (413) and entity.parse.failed (400).
- Body parsers are explicitly size-bounded (10mb JSON at server.js:41, 16mb raw audio at server.js:3045) and oversize bodies surface as a clean 413 via the error handler — no unbounded request bodies.
- The /coach transcribe raw-body parser is correctly ordered after requireAuth and coachMediaLimiter (server.js:3044-3045), so the 16mb audio buffer is only accepted for authenticated, rate-limited sessions.
- OAuth result pages use an explicit postMessage targetOrigin (FRONTEND_URL) instead of `*` (server.js:1946,1961) and JSON-escape `<`/`>` when embedding user data into the success page (server.js:1939), reducing token-leak and injection risk in the auth popup.
- The Vite dev-proxy Origin/Referer stripping that bypasses Railway CORS is confined to the dev server config (vite.config.js:17-22, `server.proxy`) and is not present in the production request path.

**Secrets &amp; Supply Chain**
- All real secrets are env-sourced, never hardcoded: OPENAI_API_KEY, RAZORPAY_KEY_SECRET, DATABASE_URL, GOOGLE_CLIENT_SECRET, LINKEDIN_CLIENT_SECRET, RESEND_API_KEY and RENONYM_API_SECRET all read from process.env (backend server.js:12,16,83-90,95,287,631).
- No .env files are committed to either repo: `.env`/`.env.local`/`.env*.local` are gitignored in the frontend, and `git log --all --diff-filter=A -- .env*` returns nothing in both repos — the live API secret literal (rn_live_xK9...) appears only in the untracked dist bundle and the gitignored .env.local, never in git history.
- Integration test scripts (test-resumes.js, test-pdf.js, test-templates.js, test-tracker.js) read API_SECRET/TOKEN strictly from environment variables with no embedded credentials (e.g. test-resumes.js:21 `process.env.API_SECRET \|\| process.env.VITE_API_SECRET \|\| ''`).
- The grandfather.js migration script takes DATABASE_URL from the environment and exits if unset (scripts/grandfather.js:24) — no connection string or DATABASE_PUBLIC_URL embedded; schema.sql contains no credentials.
- No secrets are logged at boot: config is not console.logged; the API-secret rejection log records only IP and path, not the secret value (server.js:639); Razorpay verification uses the env key_secret in an HMAC and never prints it (server.js:2438).
- Frontend dependency surface is minimal and clean: only react, react-dom, lucide-react in production deps, and `npm audit` reports 0 vulnerabilities (info/low/moderate/high/critical all 0).
- Lockfiles (package-lock.json) are committed in both repos, giving reproducible, pinned transitive installs despite the caret ranges in package.json.
- render.yaml declares no secret env vars in source (only NODE_VERSION), keeping all secrets in the Railway dashboard rather than in the repo.
- The Razorpay value kept in .env.local is the public test key_id (rzp_test_...), correctly used as key_id only; the key_secret is never placed in any frontend file.

**probe**
- p1
- p2

**Data Protection, Privacy &**
- Resume text, interview answers, and audio transcriptions are never logged — only lengths/counts are (e.g. server.js:3070 logs '${KB} → ${chars}', and extract-resume logs nothing server-side). Highly-sensitive free-text content stays out of logs.
- The inspiration-image vision prompt (server.js:1322-1326, 1340) explicitly instructs the model to extract design signals only and 'DO NOT extract or mention any personal data, names, companies, or content', and only the first 100 chars of the design-signal summary are logged.
- All PII reads/writes use parameterized SQL ($1,$2...) throughout — no string-concatenated user data into queries, so no SQL-injection path to other users' resumes/transcripts.
- Every per-user resource read enforces ownership with `AND user_id=$N` (e.g. /auth/resumes, /coach/sessions/:id, /tracker/jobs/:id, /tracker/events/:id) and validates :id against UUID_RE first — no IDOR to other users' data.
- ON DELETE CASCADE foreign keys on rn_saved_resumes, rn_ats_reports, rn_interview_sessions, rn_jobs, rn_job_events, rn_credit_ledger mean a single rn_users delete cleanly purges all child PII — the schema is ready for a proper erasure endpoint.
- Magic-link tokens are 32 random bytes, single-use (used_at), 15-minute expiry, and prior unused tokens for the email are deleted on each new request (server.js:2081-2135).
- The request logger (server.js:53) logs only method + req.path (not query strings or bodies), so secrets in query strings and PII in bodies do not reach application stdout.
- TLS is enabled on the Postgres connection (ssl block present) and all backend traffic is HTTPS — data is encrypted in transit (the gap is only certificate verification, see findings).
- Payment replay protection via the rn_payments primary key and a unique partial index on rn_credit_ledger(ref_id) for purchase grants prevents double-grant and keeps the credit ledger auditable.
- Anonymous JD-match requests return only a teaser (scores + 3 keywords) and persist nothing; resume/ATS data is only stored when an authenticated user explicitly saves (server.js:1755-1762, 2235-2287).


---

## Phase 5 — Penetration test (controlled, against production)

Only safe, non-destructive probes were run against live prod (single requests, random/non-existent identifiers, no real user data touched):

| ID | Test | Result |
|---|---|---|
| P-1 | Forge a JWT with the public default secret + random user id → `GET /auth/me` | **401** — prod rejects it → real `JWT_SECRET` is set (C3 is latent-only). ✅ |
| P-2 | `POST /generate-pdf` with the public `x-api-secret`, no Bearer | **401 AUTH_REQUIRED** — SSRF surface now needs login. ✅ |
| P-3 | `POST /analyze-food` with the public `x-api-secret`, no Bearer | **401 AUTH_REQUIRED** — vision bill-DoS closed. ✅ |
| P-4 | `GET /auth/google/callback` with a forged/stale `state` | Rejected: "expired or was tampered with" — state integrity enforced. ✅ |
| P-5 | Inline `<script>` + `<img src=http://169.254.169.254>` in render (local Chromium) | Script did **not** run; metadata fetch **blocked** by CSP and interception. ✅ |
| P-6 | CORS preflight from `https://evil.example` | No `Access-Control-Allow-Origin` echoed (fixed allowlist). ✅ |
| P-7 | Malformed-JSON / unknown-route error bodies | Generic messages; no stack traces leaked. ✅ |

SQLi/NoSQLi: not reproducible — every query is parameterized (verified across ~70 call sites). XSS: no `dangerouslySetInnerHTML` of user/AI content in the live render paths. IDOR: every authenticated route scopes by `req.user.id` over UUID keys.

---

## Phase 6 — Compliance posture

| Framework | State | Gaps to close |
|---|---|---|
| **OWASP Top 10 (2021)** | Mostly addressed | A01 (the C2/C4 auth-delivery residual, F-2); A05 (enforce CSP, DB-TLS verify) |
| **OWASP API Security Top 10 (2023)** | Strong on API1/API3/API5 (authz, IDOR, function-level) | API4 unrestricted resource consumption (Sybil/credit-race M7/M9), API2 (token revocation M1) |
| **OWASP ASVS L1** | ~80% | Session revocation (V3), CSP enforcement (V14), secret-rotation policy (V6) |
| **GDPR** | Partial | **No erasure/export endpoint** (Arts. 15/17); retention policy; magic-link token in URL → mail-log exposure |
| **SOC 2 (Security)** | Foundations present | Audit-log integrity/centralization, formal incident-response runbook, access reviews, change management |
| **ISO 27001** | Informal | Asset/risk register, key-management procedure, supplier (OpenAI/Razorpay) assessment |

---

## Residual risks & prioritized follow-ups

Each item below is real but either needs operator/console access or a change that must be tested against live third parties before shipping.

**F-1 · PDF renderer isolation (closes the C1 residual) — HIGH**
`--no-sandbox` + Chromium 112 (2023). Run the renderer with the Chromium sandbox enabled (or in a gVisor/locked-down container with no egress except the font CDN) and upgrade Puppeteer; ideally move PDF rendering to a separate, egress-restricted microservice. *Note:* on Railway's default container, removing `--no-sandbox` usually breaks Chromium — this needs a container/infra change, which is why it wasn't flipped blind.

**F-2 · Auth token delivery (closes C2 + C4) — HIGH**
Deliver the session token only to the browser that authenticated: switch the web popup to origin-locked `postMessage` to the opener (and/or redirect the popup to `renonym.com/#token=…`), and stop delivering tokens through a poll slot keyed on a client-chosen value. Keep polling only for the Salesforce-LWC origin, behind a server-issued proof secret. *Requires a live Google/email round-trip test before deploy — that's why it's documented, not shipped blind.*

**Operator / console items (no code):**
- **Confirm + rotate** `JWT_SECRET`, confirm `RAZORPAY_KEY_SECRET`; set a rotation cadence.
- **Postgres TLS** — `ssl.rejectUnauthorized:false` disables cert verification; pin Railway's CA (`PGSSLROOTCERT`/`ca`) and flip to verify. (Traffic stays on Railway's private network today.)
- **DNS** — add **SPF** (missing) and a **CAA** record; you already have DMARC `p=quarantine`.
- **Enforce CSP** after a clean Report-Only window.
- **Backups** — verify Railway PITR is on and test a restore; keep one off-platform encrypted copy.
- **Secret in git history** — the public `x-api-secret` and a copy of `server.js` exist in the frontend repo history; rotating `VITE_API_SECRET` (and treating it as non-secret) is the clean path.

**Code follow-ups (safe, schedule next):**
- **M1** session revocation — add a `token_version` column; bump on logout/"sign out everywhere"; verify it in `requireAuth`.
- **M7** credit TOCTOU — reserve/atomically-decrement a credit at request start, refund on failure (don't only debit on finish).
- **M4** template paywall — derive entitlement from a server-side trusted template id, not from the client HTML.
- **M9** Sybil — require email-verified before granting signup/referral credits; cap per-IP/day.
- **M3** Google `email_verified` — reject Google profiles where `email_verified !== true` before account match.
- **GDPR** — `/auth/delete-account` (hard-delete + cascade) and `/auth/export`.

---

## Appendix — methodology

11 domain auditors (auth, authz/IDOR, SQLi, payments, PDF pipeline, AI/LLM, frontend XSS, headers/CORS, secrets/supply-chain, rate-limit, data/privacy) ran static analysis over both repos in parallel; every Critical/High candidate was then handed to independent adversarial verifiers instructed to **refute** it by tracing the exact request through every mounted middleware (`x-api-secret` treated as public throughout). Only findings that survived refutation are reported as risks. Live probes were limited to safe, non-destructive single requests against the owner's own production with synthetic identifiers.
