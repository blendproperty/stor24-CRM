# STOR 24 CRM and Operations Platform — Project Context

> Last reviewed: 19 August 2026. Read this file before planning or changing the repository. Update it whenever a material capability, decision, deployment state, or cross-repository contract changes.

## Product identity and non-negotiable boundary

This is **STOR 24**, not SiteLink. It is a purpose-built CRM, operations, leasing, reservation, reporting and integration platform. Other products supplied research evidence only and must not appear as the product identity.

Official CI is documented in `docs/STOR24_BRAND_CI.md`. Use the approved logo files in `public/brand/`, ink `#071411`, cream `#F5F3EA`, orange `#FF5A0A`, and Satoshi typography.

## Repository role

This repository is the internal STOR 24 CRM and operations portal. Despite the GitHub repository name `stor24-portal`, it is not the public marketing website. It owns staff-facing operational truth and exposes a narrowly sanitised public-booking API to the website.

- Repository: `blendproperty/stor24-portal`
- Primary branch: `main`
- Stack: Next.js 16, React 19, TypeScript, Prisma 7 and PostgreSQL
- Canonical transactional schema: `prisma/schema.prisma`
- Architecture: multi-organisation, multi-facility modular monolith

## Branching policy

Branches exist only as short-lived rollback/review points before merging into `main`. Open a branch, get it reviewed and merged, then delete it immediately.

## Sign-in security hardening — 19 August 2026

Brett asked for a security audit of sign-in/auth across all three repositories ("harden and secure the website for sign-in and prevent hacking"). Full audit findings and fixes below; this repository (the CRM, highest-privilege sign-in surface) was already the most solidly built of the three.

**What was already solid here, confirmed by direct code review (not assumed):**
- Custom JWT auth via `jose`, not a third-party auth library; bcrypt cost-12 password hashing.
- Double-layer authorization: `src/proxy.ts` middleware verifies the session on every request *and* independently re-checks `user.active`/`sessionVersion` against the database — a stolen or stale cookie doesn't survive a password change or deactivation.
- `src/lib/auth-guards.ts` (`requireSession`, `requirePermission`) does a second, independent DB-backed check per route with facility-scoped RBAC, not just a client-side gate.
- Login route: DB-backed rate limiting (5 attempts/15 min), constant-time comparison to resist user-enumeration timing attacks, all attempts audit-logged.
- Cookies: `httpOnly`, `secure` in production, `sameSite: lax`, 8-hour expiry — no token ever stored in localStorage.
- Password policy: 12+ characters, requires mixed case, digit and special character (`src/lib/validators.ts`).
- Server-to-server endpoints authenticate via SHA-256-hashed shared secrets checked with `timingSafeEqual` (separate path from the CSRF/Origin check below, unaffected by that change).

**Fixed this session:**
- **CSRF gap in `src/lib/request-security.ts`.** `sameOrigin()` previously returned `true` when the `Origin` header was simply absent (`!origin || allowed.has(origin)`) — a real bypass, since a crafted cross-site request that omits `Origin` would sail through. Browsers always send `Origin` on same-site mutating fetch/XHR/form requests, so the fix now requires `Origin` to be present and allow-listed for any non-safe HTTP method (`POST`/`PUT`/`PATCH`/`DELETE`), while leaving safe methods (`GET`/`HEAD`/`OPTIONS`) unaffected.
- **No security headers at the app layer.** Added `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`, HSTS (`max-age=63072000; includeSubDomains; preload`) and a same-origin-only Content-Security-Policy in `next.config.ts` via `headers()`. This is the staff sign-in surface, so it got the strictest CSP of the three repositories (no external script/style/connect sources at all).

**Not fixed this session — needs follow-up:**
- **No 2FA/MFA.** Both this repository's staff login and `stor24-cms`'s admin login are password-only. Worth prioritising for owner/admin-level accounts given the operational data this system holds. Not implemented yet — flagged for a dedicated pass, not a quick patch.
- Password-reset token expiry enforcement was reviewed but not exhaustively traced end-to-end during the audit; creation/hashing (SHA-256, random 32 bytes) looked correct.
- CVE/dependency cross-check against `bcryptjs`, `jose`, `prisma`, `next` versions was not performed — versions are current-generation but not individually checked against known advisories.

## Implemented foundations

- Database-backed authentication, password recovery, invitation flow, sessions, RBAC and security audit events.
- Organisation and facility scoping with permission checks on protected server routes.
- Facility, inventory, unit, map and configuration foundations.
- Customer, lead, reservation and leasing foundations, including scoped service logic.
- **Public lead capture (`POST /api/public/v1/leads`), added 18 August 2026.** For the marketing site's general "get a quote" form (no unit selected). `src/lib/public-lead-contract.ts` + `src/lib/public-lead-service.ts` create a real `Customer` + `Lead` (`stage: "NEW"`, `source: "PUBLIC_QUOTE_FORM"`). Same auth/rate-limiting pattern as `/api/public/v1/reservations`. **Built to correct a mistake:** an earlier version wrote leads into the CMS's `contacts`/`deals` collections — reverted the same day. **Code-complete, not yet live-tested.**
- **Executive reporting dashboard (`/graphs`, rebuilt 18 August 2026) — real data, not synthetic.** Previously rendered hand-authored fake numbers labelled "Synthetic demonstration data." Rebuilt in direct response to Brett liking the visual style of `stor24-cms`'s now-removed CRM dashboards ("I liked the format so maybe some of those elements/functionality can be pulled into the portal... My dash for reporting etc should look like a Power BI dash, very powerful, slick and professional"). New `src/lib/dashboard-service.ts` runs real, facility-scoped Prisma queries (via `requireScope()`/`facilityWhere()`): KPI set (new leads this week, lead conversion rate, physical occupancy %, active tenancies, month-to-date billed, collections rate), a 12-month occupancy trend reconstructed from real `Occupancy.startDate`/`endDate` records (caveat: the unit-count denominator uses the *current* portfolio size for all 12 months — no historical inventory snapshot table exists), a lead pipeline funnel by `LeadStage` (last 90 days), a 12-month billed-vs-collected revenue chart (`LedgerEntry` CHARGE vs `Payment` SUCCEEDED, joined via `account.tenancy.facility`), a 7-day new-leads chart, and a unit-status-by-facility table. Charts are hand-built SVG/CSS — deliberately no new npm dependency, since this environment cannot safely regenerate `package-lock.json` and the Dockerfile uses `npm ci`. New styles in `src/app/graphs/dashboard.css` (page-scoped, not merged into `globals.css`). **Code-complete, pushed to `main` 18 August 2026, not yet live-tested or build-verified by the assistant** — this environment cannot run `npm run build`/`npm run check` or query the production database. Verify via the `Deploy to VPS` Actions log and a real page load before treating as proven.
- **Reservation-to-tenancy lifecycle (`src/lib/leasing-service.ts`) is real and database-backed.** `moveIn()` is now (18 August 2026) a two-phase send-and-sign flow — see Lease e-signature below.
- **Lease e-signature — DocuSign-style send-and-sign flow, pivoted 18 August 2026.** `moveIn()` creates a `DRAFT` Tenancy + `PENDING` Occupancy and emails a `/sign/[token]` link; the customer signs there; `completeLeaseSigning()` activates the tenancy. **Code-complete, not yet live-tested** — Brett is waiting on real agreement text. Explicit gap: sends a web link, not a PDF as requested.
- **Reservation cancellation (`DELETE /api/v1/reservations?id=`) — live-tested 18 August 2026** (unit 104, cancel confirmed end to end).
- Operations tasking, company-setup workspaces, report catalogue/exports/schedules, provider-neutral integration contracts, versioned communication templates, reservation-confirmation notifications (email leg live-tested via SendGrid; SMS/WhatsApp blocked on Twilio trial-plan restrictions).
- Automated monthly rent billing (`billing-service.ts`) — live-tested (reachable, authenticated, idempotent), zero-charge result at time of test since no ACTIVE occupancy existed yet.
- Public booking API, transactional unit claiming, HikCentral biometric access code (disabled pending production config), Docker deployment, move-in unit-selector filtering (visually confirmed live), take-payment reference auto-generation (code-only).

## Ownership decision — APPROVED 17 August 2026, reaffirmed 18 August 2026

**Approved by:** Brett Dovey, Blend Property Group.

```text
STOR 24 CRM (this repository) — operational system of record
  operational customers, leads, deals, facilities, units, reservations,
  leases, workflows, communications, access intent and operational audit
  — this is the ONLY place customer/lead/deal data should live

STOR 24 public portal — customer presentation, captures leads but stores
  them in the CRM

STOR 24 CMS — editorial only, nothing CRM-shaped

MRI Property Central — approved finance system of record
```

**Resolved 18 August 2026:** the CMS's live CRM-shaped collections (`contacts`, `deals`, `activities`, `units`) and their five dashboards were removed from `stor24-cms` — see that repository's `PROJECT_CONTEXT.md`. Brett liked the visual style of those now-removed dashboards; the new `/graphs` executive dashboard in this repository (see Implemented foundations) is the corrected, properly-owned version of that reporting experience.

## Priority next work

1. Unblock SMS/WhatsApp (Twilio trial-plan restrictions — needs a real number + account upgrade).
2. Confirm monthly billing cron picks up the now-`ACTIVE` Blend Group/unit 360 tenancy with a nonzero charge.
3. Close the MRI decision pack.
4. Select South African payment provider and Hikvision access provider — both hard blockers for pilot scope.
5. Once real lease agreement content is provided: finalise clause wording, live-test the full send→sign→activate path, and build actual PDF generation (current build sends a web link, not a PDF).
6. **Live-verify the new public leads API and the new `/graphs` dashboard** — check the `Deploy to VPS` Actions run for a green build, then confirm both work against real production data/traffic.
7. Consider extending `/graphs` further (facility comparisons, exportable snapshots, saved filters, a real charting library once lockfile regeneration is safe from this environment).
8. `stor24-cms`'s deploy pipeline issue (empty Actions tab) was root-caused and fixed 19 August 2026 — see `stor24-cms/PROJECT_CONTEXT.md` "Deploy pipeline root cause fixed."
9. **Implement 2FA/MFA for staff/owner accounts** — flagged 19 August 2026 during the sign-in security audit as the highest-value remaining gap; not yet implemented, needs a dedicated pass (TOTP is the natural fit given `jose`-based JWT auth already in place).
10. Confirm the 19 August 2026 CSRF fix (`sameOrigin()` in `src/lib/request-security.ts`) hasn't broken any legitimate mutating request that relied on the old missing-Origin bypass — watch for unexpected 403s on the next deploy, particularly from any non-browser client.

## Working rules for any AI assistant (selected, most relevant)

1. Inspect branch, status, recent commits, schema and route/service code before making claims or changes.
2. Never deploy, migrate production data, or create real customer records without explicit authority.
3. This environment cannot run `npm run build`/`npm run check` or query the production database directly — say so explicitly rather than implying build/live confidence from code review alone. Verify via the `Deploy to VPS` Actions log.
4. Don't add a new npm dependency to a repo whose Docker build uses `npm ci` unless the lockfile can actually be regenerated correctly — prefer dependency-free solutions (e.g. hand-rolled SVG/CSS charts) when it can't.
5. When a fix touches customer/lead/deal data, check which system is supposed to own it (see Ownership decision) before picking where to write it.
6. When making a large text-file edit via a tool requiring full replacement content, double-check the content variable actually contains the full intended file before submitting — not a placeholder.
7. Update this file after every material change, with dated evidence, not optimistic status language.
8. This environment has no tool to change GitHub repository Settings (e.g. enabling Actions, branch protection) — those changes require the user to make them directly in GitHub's web UI. Don't imply this can be automated from here.
9. **Security fixes need the same evidence discipline as feature work.** A CSRF/header fix pushed to `main` is not "secured" until it's deployed and, ideally, spot-checked live — don't let the language in this file imply otherwise.

## Definition of done

A CRM capability is complete only when it is database-backed, scoped, permission-enforced, audited, tested, operationally owned and — where an external provider or deployment is involved — configured and proven end to end with reconciliation and exception handling.

**Note on this revision:** condensed from a much longer version to reliably get through after repeated tool timeouts — full historical detail (e-signature v1/v2/v3 narrative, reservation-cancel proof steps, deployment gotchas, numbered working rules 1–23) remains in git history at commit `1f1b4393`/`09cc0a8e`/`04fead0e`/`377eb088` and should be restored/merged forward on the next substantial edit rather than left condensed indefinitely.
