# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Renonym AI — an AI-powered resume builder (React 18 + Vite, no TypeScript). The frontend is a thin SPA; all AI, PDF rendering, auth, and payments live on a separate **Railway backend** (`salesforce-resume-pdf-server`) that this repo only calls over HTTP. There is no local server code here.

## Commands

```bash
npm run dev        # Vite dev server (proxies /api → Railway, see below)
npm run build      # production build
npm run preview    # serve the production build

# Backend integration test suite (Node, no test runner — plain script)
node test-resumes.js                 # 50 scenarios against /generate-template + /generate-pdf
node test-resumes.js --tokens-only   # only token generation
node test-resumes.js --pdf-only      # only PDF rendering
node test-resumes.js --count=10      # limit scenario count
node test-resumes.js --save-pdfs     # write rendered PDFs to ./test-output
RAILWAY_URL=https://... API_SECRET=rn_live_... node test-resumes.js   # target a specific backend
```

There is no lint/typecheck/unit-test setup. `test-resumes.js` hits the live backend over the network — it is an integration smoke test, not a unit test.

## Backend & environment

The backend base URL is resolved per-file as `RAILWAY_URL`:
- **dev**: `/api` (Vite proxy) — see `vite.config.js`. The proxy strips `Origin`/`Referer` so Railway treats requests as server-to-server and skips browser CORS checks.
- **prod**: the hardcoded `https://salesforce-resume-pdf-server-production.up.railway.app`.

Every authenticated backend call goes through `ResumeBuilder.apiFetch()`, which injects `x-api-secret: VITE_API_SECRET` (shared secret, must match `RENONYM_API_SECRET` on Railway) and an `AbortController` timeout. `x-client-id` (a per-browser UUID in `localStorage['rb-client-id']`) is sent for rate limiting. `.env.local` holds `VITE_API_SECRET` and `VITE_RAZORPAY_KEY_ID`.

Backend endpoints in use: `/generate-template`, `/extract-resume`, `/improve-summary`, `/review-resume`, `/generate-pdf`, `/analyze-job-match`, `/optimize-for-job`, `/analyze-food`, `/create-order`, `/verify-payment`, `/auth/{init-poll,poll,google,magic-link/request}`.

## Architecture

`src/main.jsx` is a hand-rolled top-level router: a `view` state string switches between three screens — `LandingPage`, `ResumeBuilder`, `Dashboard` — passing callbacks down. There is no router library. Auth session is read from `localStorage` (`rn-auth-token`, `rn-auth-user`) on mount.

### ResumeBuilder is the app (~3900 lines, one class component)

`src/ResumeBuilder.jsx` is a **React class component using a deliberately non-idiomatic state pattern** — read `makeReactive()` (top of file) before touching state. Instead of `this.setState`, every state field is a getter/setter defined via `Object.defineProperty`; assigning `this.foo = x` stores the value and calls `this.forceUpdate()`. So throughout this component you mutate state by **direct assignment** (`this.currentStep = STEPS.BUILD`), not `setState`. The full list of reactive keys is in the `makeReactive(this, [...])` call in the constructor. Computed values are plain `get` accessors (e.g. `get isStepBuild()`), and `render()` destructures a large bag of these.

Flow is driven by two enums: `STEPS` (`gallery` | `ai-flow` | `method` | `build` | `calorie-calc`) and `SECTIONS` (`profile` | `skills` | `experience` | `education` | `ai` | `design` | `jobmatch`). `componentDidMount` reads `props.initialMode` (`'ai'` | `'jobmatch'` | `'gallery'`) — set by the landing-page CTA — to pick the entry step.

### Templates & AI theming

Resume **structure** is hardcoded as four React layouts in `src/ResumeLayouts.jsx` (`TwoColLayout`, `SingleLayout`, `TopBannerLayout`, `AsymmetricLayout`), selected via `getLayout(name)` / the `LAYOUTS` map. The 10 gallery templates (`TEMPLATE_GALLERY`) are styled purely with CSS in `src/app.css`.

AI theming is **token-based, not CSS-based** (this was a deliberate change — see git history). `/generate-template` returns `{ tokens, layout }`: `tokens` are color/style variables applied to a hardcoded layout, `layout` picks one of the four layouts above. The component stores `aiGeneratedTokens` + `aiGeneratedLayout`; `aiGeneratedCss` is legacy and normally empty. When checking whether an AI theme is active, test for tokens/layout, not CSS.

### PDF export

PDF generation is **server-side**: the component serializes the rendered preview DOM (`outerHTML` of `[data-id="resume-preview"]`) plus its CSS and POSTs to `/generate-pdf`, which returns a PDF blob that's downloaded client-side. `html2canvas` and `jsPDF` are lazy-loaded from CDN (`loadFromCDN`, `CDN` map) but the primary path is the server. Other CDN libs: `pdf.js` and `mammoth` for parsing uploaded PDF/DOCX resumes client-side.

### Auth & payments

`src/AuthModal.jsx` — Google OAuth uses a **popup + polling** pattern: get a `nonce` from `/auth/init-poll`, open `/auth/google?nonce=`, then poll `/auth/poll?nonce=` until the token appears (auto-stops after 5 min). Magic-link is the email fallback. `CreditGateModal` and `UserPill` also live here. On success, token+user are written to `localStorage` and surfaced through `main.jsx`.

Payments (`src/PaymentButton.jsx`, `src/PaymentModal.jsx`) use Razorpay: `/create-order` → Razorpay checkout → `/verify-payment`. Export gating uses `localStorage` counters (`rn-export-count`, `rn-export-date`).

## Conventions

- Plain JS + JSX, React 18, no TypeScript, no CSS framework. All styling is hand-written in `src/app.css` (~7000 lines) and `src/landing.css`, BEM-ish class names prefixed `rp-` / `rb-`.
- `ResumeBuilder.jsx`'s direct-assignment reactivity is intentional — do not "fix" it to `setState`. Match the surrounding direct-mutation style when adding state (and register new fields in the `makeReactive` key list, or they won't trigger re-render).
