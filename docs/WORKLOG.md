# Renonym — Work Log

Running log of changes during the dark/gold reskin + audit/hardening pass.
Branch: `audit-hardening` (off `master`). Existing résumé/optimizer/payment functionality must not break.

| Timestamp | File(s) | Reason | Outcome |
|-----------|---------|--------|---------|
| 2026-06-10 | `docs/WORKLOG.md` | Start work log | Created |
| 2026-06-10 | `src/LandingPage.jsx` | Phase 2 reskin: rebuild homepage in dark/gold, Coach-led hero, surface the Interview Coach in nav + CTAs (per `designs/screens/01`) | In progress |
| 2026-06-10 | `src/LandingPage.jsx`, `src/main.jsx` | Phase 2: dark/gold Coach-led homepage; surface Coach in nav/hero/pricing | Done — built green, committed, **deployed to renonym.com** (verified live) |
| 2026-06-10 | `src/Dashboard.jsx` | Phase 2: reskin dashboard to dark/gold + add Coach quick-action / interview reports | In progress |
| 2026-06-10 | `src/Dashboard.jsx`, `src/main.jsx` | Phase 2: dark/gold dashboard + Coach entry points | Done — built green, committed, deployed |
| 2026-06-10 | `src/app.css` (builder `--rp-*`) | Phase 2: dark retone of résumé builder | DEFERRED — builder is variable-driven, but 8 rules use `--rp-text` as a *background* (e.g. `.rp-btn--primary` line 275). Flipping blind risks invisible buttons in the live editor; needs a 2-min visual QA before flipping. Not pushed (protects "don't break builder"). |
| 2026-06-10 | `src/landing.css` | AUDIT (dead code): orphaned after landing reskin — no longer imported anywhere | Flagged for safe removal |
