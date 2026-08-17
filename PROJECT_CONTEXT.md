# STOR 24 CRM and Operations Platform — Project Context

> Last reviewed: 17 August 2026. Read this file before planning or changing the repository. Update it whenever a material capability, decision, deployment state, or cross-repository contract changes.

## Product identity and non-negotiable boundary

This is **STOR 24**, not SiteLink. It is a purpose-built CRM, operations, leasing, reservation, reporting and integration platform. Other products supplied research evidence only and must not appear as the product identity.

Official CI is documented in `docs/STOR24_BRAND_CI.md`. Use the approved logo files in `public/brand/`, ink `#071411`, cream `#F5F3EA`, orange `#FF5A0A`, and Satoshi typography.

## Repository role

This repository is the internal STOR 24 CRM and operations portal. Despite the GitHub repository name `stor24-portal`, it is not the public marketing website. It owns staff-facing operational truth and exposes a narrowly sanitised public-booking API to the website.

- Repository: `blendproperty/stor24-portal`
- Primary branch: `main` (verified 17 August 2026 via GitHub)
- Stack: Next.js 16, React 19, TypeScript, Prisma 7 and PostgreSQL
- Canonical transactional schema: `prisma/schema.prisma`
- Architecture: multi-organisation, multi-facility modular monolith

## Branching policy

Branches exist only as short-lived rollback/review points before merging into `main`. Open a branch, get it reviewed and merged, then delete it immediately — do not let feature branches accumulate. On 17 August 2026, all 10 `codex/*` branches (`fix-facility-patch-validation`, `fix-public-booking-setup`, `fix-company-inputs`, `public-booking-api`, `fix-company-site-setup`, `reporting-integrations`, `operations-setup`, `finance`, `leasing-core`, `auth-security`) were confirmed at zero commits ahead of `main` and deleted. `main` is now the complete picture of this repository; keep it that way going forward.

## Implemented foundations

- Database-backed authentication, password recovery, invitation flow, sessions, RBAC and security audit events.
- Organisation and facility scoping with permission checks on protected server routes.
- Facility, inventory, unit, map and configuration foundations.
- Customer, lead, reservation and leasing foundations, including scoped service logic.
- Operations tasking and company-setup workspaces.
- Report catalogue, exports and scheduled-report persistence.
- Provider-neutral integration contracts, health records, webhook inbox and transactional outbox foundations.
- Versioned communication templates and privacy-aware delivery logs.
- Public booking API for customer-safe facility, map, unit and availability reads plus secured reservation submission.
- Transactional unit claiming, idempotency, rate limiting, consent/audit capture, honeypot and reCAPTCHA support in the booking boundary.
- Docker production configuration and documented deployment procedure.

Use `README.md`, `docs/LEASING_CORE.md`, `docs/OPERATIONS_SETUP.md`, `docs/REPORTING_INTEGRATIONS.md` and `docs/EVIDENCE_TO_BUILD_MATRIX.md` for implementation detail.

## Partially built or not production-complete

The presence of screens, schema, interfaces or provider-neutral foundations does not mean an external integration is live.

- Remaining labelled scaffold/demo modules still need database-backed completion.
- MRI Property Central is the approved finance system of record (see Ownership decision below); the connector, master-data mapping, transaction ownership, reconciliation, exception handling, sandbox access and acceptance evidence are not complete.
- South African payment/debit-order provider selection and implementation are outstanding. Do not assume MRI RentPayment is the local solution. This is now a hard blocker for the approved pilot scope — see Pilot facility and first-release scope below.
- Hikvision access control, communications providers, e-signature, insurance and other external providers require selection, credentials, implementation and end-to-end proof. Hikvision selection is now a hard blocker for the approved pilot scope — see below.
- **Customer-facing reservation confirmation does not exist.** `createPublicReservation()` never calls a notification step, and the email provider is disabled by default (see Current status and evidence limits). A customer who completes a reservation today receives nothing — no email, SMS or WhatsApp.
- Migration, production data validation, UAT, training, support ownership, monitoring and go-live readiness remain gated work.
- Operational policies—including onboarding evidence, arrears, move-in, access, insurance and move-out—must be confirmed by accountable business owners rather than inferred.
- No finance/MRI implementation work exists on any branch as of 17 August 2026 (the old `codex/finance` branch, now deleted, was stale and non-finance-specific).

## Current status and evidence limits

- `main` (commit `04ef342`) includes the facility-patch-validation fix (PR #8), the public-booking-setup persistence fix (PR #7), the company-setup-inputs fix (PR #6) and the public-booking API feature (PR #5) — all confirmed merged.
- All other `codex/*` branches were triaged and deleted 17 August 2026 (see Branching policy above). `main` is current.
- Health and unauthenticated-security checks were previously demonstrated, but current production configuration must be reverified before reporting it as live.
- **Live-tested 17 August 2026 (Brett Dovey):** the public reservation flow at Midpoint works end to end on the write side — two live reservations were created through the public site (`John Wayne`, unit 103; `Blend Group`, unit 360) and both appear correctly on the CRM's Reservations & holds screen with the right store, unit, quoted rate, hold-expiry and status. This is real evidence the unit-claiming/reservation/hold pipeline works, not just that the API responds.
- **Gap found in the same test: no customer notification is sent on reservation.** `createPublicReservation()` in `src/lib/public-booking-service.ts` has no notification step at all — it claims the unit, writes the customer/lead/reservation/audit records, and returns. This is not a regression from the recent booking-UI merge in `stor24`; confirmation was never built into this flow. Even if a call were added, `src/lib/email.ts` defaults to a `DisabledEmailProvider` unless `EMAIL_PROVIDER=resend` is configured, and there is no SMS/WhatsApp sender wired in. Do not report the booking lifecycle as "proven" for the pilot until this is closed — a customer who reserves currently gets no confirmation of any kind. Tracked under Priority next work and the "Complete communications provider design" work.
- The public website previously returned HTTP 404 for `/book`; CRM health alone does not prove the customer journey.
- Do not claim providers, finance sync or customer lifecycle automation are operational without current configuration plus end-to-end evidence.

## Ownership decision — APPROVED 17 August 2026

**Approved by:** Brett Dovey, Blend Property Group.

The boundary below is now the confirmed architecture decision across all three STOR 24 repositories (this repository, `stor24` and `stor24-cms`), not a proposal:

```text
STOR 24 CRM (this repository) — operational system of record
  operational customers, facilities, units, reservations, leases,
  workflows, communications, access intent and operational audit

STOR 24 public portal — customer presentation
  public marketing, browsing, quote capture and the booking experience

STOR 24 CMS — editorial only
  editorial pages, storage insights, FAQs, campaign content,
  SEO fields, approved media and publication state

MRI Property Central — approved finance system of record
  debtor accounting, general ledger, VAT, financial controls
  and statutory reporting
```

Approving this boundary settles which system owns which domain in principle. It does not by itself complete the detailed work still open beneath it:

- The MRI decision pack (system mapping, posting model, reconciliation, exception ownership, sandbox access — see Priority next work item 3) is still to be closed.
- The CMS currently holds live CRM-shaped collections (`contacts`, `deals`, `activities`, `units`) that fall outside its approved boundary; bringing that repository in line with this decision is tracked in `stor24-cms/PROJECT_CONTEXT.md`.

## Pilot facility and first-release scope — APPROVED 17 August 2026

**Approved by:** Brett Dovey, Blend Property Group.

- **Pilot facility:** Midpoint. It is also the only facility with a dedicated public-portal build today (`stor24` repository, `app/storage/midpoint`), so existing work there can be reused rather than rebuilt.
- **First-release scope:** full self-serve — a customer can browse, book, pay and receive working access, end to end, for the Midpoint facility. Concretely this means the release is not "done" until it includes:
  1. Public browsing and quote capture for Midpoint (largely built; see Implemented foundations).
  2. A live, provable reserve/cancel booking lifecycle for Midpoint (Task 3 — the reserve side is now live-tested, see Current status and evidence limits; cancel is not yet tested, and customer notification is a confirmed gap).
  3. Tokenised payment capture, settlement and reconciliation tied to a Midpoint reservation (Task 5 and Task 6 — requires the South African payment provider decision, which is not yet made).
  4. Live Hikvision access provisioning tied to a paid, confirmed reservation at Midpoint (Task 6 and Task 7 — requires Hikvision provider selection and implementation, not yet started).

**This scope choice creates two hard, unresolved prerequisites** that block first release regardless of other progress:

- South African payment/debit-order provider selection (no provider is selected as of 17 August 2026).
- Hikvision access-control provider selection, credentials and end-to-end access-provisioning proof (not started as of 17 August 2026).

Both must be closed under Task 6 ("Select external providers") before the payments and access portions of this scope can be built, let alone proven. Until then, treat "booking works" and "payment/access works" as two separate, independently gated claims — do not infer the latter from the former.

## Finance and MRI design boundary

Approved responsibility split (see Ownership decision above for the full three-repository picture):

```text
STOR 24 CRM
  operational customers, facilities, units, reservations, leases,
  workflows, communications, access intent and operational audit

MRI Property Central
  approved accounting system of record, debtor accounting,
  general ledger, VAT, financial controls and statutory reporting

Payment provider
  payment/debit-order execution and settlement evidence

Reconciliation
  STOR 24 operational event <-> payment result <-> MRI posting
```

The system-ownership boundary itself is approved. Detailed mappings, timing, reconciliation controls and exception ownership are not yet defined and remain the subject of the MRI decision pack in Priority next work.

## Cross-repository contract

- Public portal: consumes `/api/public/v1/...` through a server-side proxy. Keep the public response allowlisted and backward compatible.
- CMS: owns approved content/media, not operational records, booking inventory, ledgers or provider credentials.
- CRM: remains authoritative for operational availability, leads, reservations and staff workflows per the approved ownership decision above.

Coordinate API/schema changes across all three repositories. Never silently duplicate ownership.

## Priority next work

1. Reverify public-booking configuration and the deployed API contract for Midpoint specifically.
2. With explicit approval, prove the reservation cancel path (reserve side is now live-tested — see Current status and evidence limits) and close the customer-notification gap: wire a confirmation step into `createPublicReservation()` and configure a real email provider (`EMAIL_PROVIDER=resend` plus API key) at minimum, ahead of the full communications provider decision if needed for pilot.
3. Close the MRI decision pack: system ownership, mapping, posting model, reconciliation, exception owner and sandbox access.
4. Select and implement payment and Hikvision access providers — both are now hard blockers for the approved pilot scope (see Pilot facility and first-release scope above) — plus communication, e-signature and insurance providers through the existing provider boundaries.
5. Replace remaining scaffold/demo repositories with scoped database-backed behaviour.
6. Complete migration planning, UAT, training, monitoring, recovery and production readiness gates.

## Working rules for any AI assistant

1. Inspect branch, status, recent commits, schema, relevant tests and route/service code before making claims or changes.
2. Do not deploy, migrate production data, enable providers or create real customer records without explicit authority.
3. Every protected handler must enforce server-side session/permission and organisation/facility scope. Proxy redirects are not security controls.
4. Keep secrets server-side; never log or commit tokens, reset links, signing keys, customer data, PAN or CVV.
5. Prefer idempotent commands, signed inbound events, durable audit/outbox records and explicit reconciliation.
6. Read the relevant Next.js 16 guides under `node_modules/next/dist/docs/` before changing framework behaviour.
7. Before validation run Prisma generation and Next type generation where required, then targeted tests and the relevant `npm run check` components.
8. Separate pre-existing repository-wide failures from failures caused by the change, but never hide either.
9. Update this file after material changes and include evidence, not optimistic status language.
10. Follow the branching policy above: short-lived branches only, deleted promptly after merge.

## Definition of done

A CRM capability is complete only when it is database-backed, scoped, permission-enforced, audited, tested, operationally owned and—where an external provider or deployment is involved—configured and proven end to end with reconciliation and exception handling.
