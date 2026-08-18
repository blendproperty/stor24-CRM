# STOR 24 CRM and Operations Platform — Project Context

> Last reviewed: 18 August 2026. Read this file before planning or changing the repository. Update it whenever a material capability, decision, deployment state, or cross-repository contract changes.

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
- **Reservation-to-tenancy lifecycle (`src/lib/leasing-service.ts`) is real and database-backed, not a stub.** `createReservation` claims a unit and moves its lead to `RESERVED`. `moveIn` runs a single transaction that creates the `Account`, an `ACTIVE` `Tenancy` with its first `Occupancy`, sets the unit `OCCUPIED`, posts an optional move-in `LedgerEntry`, and — when started from a reservation — marks that reservation `CONVERTED`. `transfer`, `giveNotice` and `moveOut` cover the rest of the tenant lifecycle, all scoped and audited. Wired to real routes (`/api/v1/leasing/workflows`) and real staff screens (Reservations, Customers & tenants, Move in) — not the demo-mock pattern `/communications` still has. **Not yet live-tested end-to-end**: nobody has run a real `moveIn()` against one of the two live Midpoint reservations to confirm the Tenancy/Occupancy/Account chain and reservation `CONVERTED` flip actually happen correctly in production. Downstream legs (payment capture on the `initialCharge`, lease e-signature, Hikvision access activation from `accessState`) are not implemented — see Partially built below.
- Operations tasking and company-setup workspaces.
- Report catalogue, exports and scheduled-report persistence.
- Provider-neutral integration contracts, health records, webhook inbox and transactional outbox foundations. `MessageProvider` now covers `EMAIL`, `SMS` and `WHATSAPP`.
- Versioned communication templates (`CommunicationTemplate`) and privacy-aware delivery logs (`CommunicationLog`, recipient stored as a hash) — real Prisma models, though the staff-facing `/communications` screen is still a static mock and does not read from them yet.
- Reservation-confirmation notification pipeline (`src/lib/notifications.ts`): on a successful public reservation, sends email (via Resend or SendGrid), SMS and WhatsApp (via Twilio) to whichever channels the customer consented to, using an active `CommunicationTemplate` if one exists or a built-in default otherwise. Every attempt is logged to `CommunicationLog`. Never fails the reservation itself. **Email leg live-tested 17–18 August 2026** with `EMAIL_PROVIDER=sendgrid` and a real SendGrid API key + verified single sender — confirmed `SUCCEEDED` in `CommunicationLog`. SMS/WhatsApp legs still not provable in production; see Partially built below.
- Automated monthly rent billing (`src/lib/billing-service.ts`, `POST /api/v1/billing/run-monthly`): idempotent per-period charge generation for every `ACTIVE` `Occupancy` on an `ACTIVE` `Tenancy`, reusing the existing `LedgerEntry.externalRef` unique constraint (`RENT-<period>`) so re-runs never double-charge. Cron-authenticated via a hashed shared secret (`BILLING_CRON_SECRET_SHA256` compared against an `x-cron-key` header with timing-safe compare), matching the pre-existing webhook auth pattern; the route is exempted from the session-auth gate in `src/proxy.ts`. `/billing` and `/collections` staff screens were rewritten to read real `Account`/`Payment`/`Tenancy` aggregates instead of hardcoded demo numbers. **Live-tested 18 August 2026:** endpoint reachable in production over `x-cron-key` auth and returns a real JSON summary — `{"period":"2026-08","charged":0,"skipped":0,"totalAmount":"0.00","occupanciesConsidered":0}`. The zero counts reflect no `ACTIVE` occupancies in the current environment, not a defect; idempotent re-run behaviour has not yet been exercised against real occupancy data, and the recurring cron schedule (crontab entry on the VPS) still needs final confirmation. This billing engine has not yet been tested against a tenancy created by a real `moveIn()` — the two features should be proven together once move-in is live-tested.
- Public booking API for customer-safe facility, map, unit and availability reads plus secured reservation submission.
- Transactional unit claiming, idempotency, rate limiting, consent/audit capture, honeypot and reCAPTCHA support in the booking boundary. The public booking form now has real per-channel consent checkboxes again (email/SMS+WhatsApp/phone) instead of hardcoded values.
- Docker production configuration and documented deployment procedure.
- **Move-in unit selector filtering (`move-in-workspace.tsx`), 18 August 2026:** the `/operations/move-in` unit table previously only supported store selection, free-text search, and a type+size/area breakdown panel — no way to filter by floor or status. Added a Floor dropdown (populated from the units actually available at the selected store) and a Status dropdown (Vacant/Reserved), plus a "Clear filters" control that shows an active-filter count and resets store-independent filters in one click. All filters compose (AND'd together with search and the existing type/size grouping). Code-only, not yet deployed/visually verified.
- **Take payment reference auto-generation (`accounts-workspace.tsx`), 18 August 2026:** the "Take payment" dialog on `/operations/accounts` required staff to type a reference manually. The reference field now pre-fills with `<accountNumber>-<YYYYMMDD>-<random4>` the moment the dialog opens, generated client-side, still fully editable so staff can overwrite it with the customer's actual bank/EFT reference when one exists (kept editable deliberately — an invented reference should not silently replace a real bank reference needed for reconciliation). Code-only, not yet deployed/visually verified.

Use `README.md`, `docs/LEASING_CORE.md`, `docs/OPERATIONS_SETUP.md`, `docs/REPORTING_INTEGRATIONS.md` and `docs/EVIDENCE_TO_BUILD_MATRIX.md` for implementation detail.

## Partially built or not production-complete

The presence of screens, schema, interfaces or provider-neutral foundations does not mean an external integration is live.

- Remaining labelled scaffold/demo modules still need database-backed completion.
- MRI Property Central is the approved finance system of record (see Ownership decision below); the connector, master-data mapping, transaction ownership, reconciliation, exception handling, sandbox access and acceptance evidence are not complete.
- South African payment/debit-order provider selection and implementation are outstanding. Do not assume MRI RentPayment is the local solution. This is now a hard blocker for the approved pilot scope — see Pilot facility and first-release scope below. `moveIn()` posts an `initialCharge` ledger entry but nothing actually collects that charge from the customer yet.
- Hikvision access control, e-signature, insurance and other external providers require selection, credentials, implementation and end-to-end proof. Hikvision selection is now a hard blocker for the approved pilot scope — see below. `moveIn()` accepts an `accessState` field but nothing activates physical access on move-in yet.
- **Email notification leg is now proven live; SMS and WhatsApp are not.** `EMAIL_PROVIDER=sendgrid` with a real SendGrid API key and a verified single sender is live in production and confirmed delivering (see Implemented foundations). SMS and WhatsApp remain blocked purely on Twilio account-level restrictions, not code: the Twilio account is still on a **trial** plan, which (a) does not allow custom message body content on SMS or WhatsApp — only pre-approved Twilio template messages — (b) requires the destination number to be individually verified in the Twilio console for SMS, and (c) no longer issues a free trial phone number, so there is currently no real SMS-capable sending number at all. WhatsApp additionally requires full WhatsApp Business API registration (Meta Business Manager account + Business Verification with a CIPC document + Twilio WhatsApp Sender registration + template approval) before it can message arbitrary customers outside the sandbox opt-in flow. None of this can be fixed in code; it requires Brett to purchase a real Twilio number and upgrade the account (SMS), and separately complete Meta Business verification (WhatsApp). See Priority next work.
- Migration, production data validation, UAT, training, support ownership, monitoring and go-live readiness remain gated work.
- Operational policies—including onboarding evidence, arrears, move-in, access, insurance and move-out—must be confirmed by accountable business owners rather than inferred.
- No finance/MRI implementation work exists on any branch as of 17 August 2026 (the old `codex/finance` branch, now deleted, was stale and non-finance-specific).

## Current status and evidence limits

- `main` includes the facility-patch-validation fix (PR #8), the public-booking-setup persistence fix (PR #7), the company-setup-inputs fix (PR #6), the public-booking API feature (PR #5), the SendGrid email path, and the recurring monthly billing feature (`billing-service.ts`, `/api/v1/billing/run-monthly`, real `/billing` and `/collections` screens) — all confirmed merged and deployed as of 18 August 2026.
- All other `codex/*` branches were triaged and deleted 17 August 2026 (see Branching policy above). `main` is current.
- Health and unauthenticated-security checks were previously demonstrated, but current production configuration must be reverified before reporting it as live.
- **Live-tested 17 August 2026 (Brett Dovey):** the public reservation flow at Midpoint works end to end on the write side — two live reservations were created through the public site (`John Wayne`, unit 103; `Blend Group`, unit 360) and both appear correctly on the CRM's Reservations & holds screen with the right store, unit, quoted rate, hold-expiry and status. This is real evidence the unit-claiming/reservation/hold pipeline works, not just that the API responds.
- **Email notification leg proven live 17–18 August 2026** (see Implemented foundations). **SMS/WhatsApp notification legs remain unproven** — blocked on Twilio account restrictions, not code (see Partially built above). Task tracking note: the "prove and fix the public booking lifecycle" work item is explicitly kept open until an SMS (or WhatsApp) notification has been observed to arrive in production — do not report it as fully done on the strength of the email leg alone.
- **Reservation-cancel path has not yet been live-tested.** The `cancelReservation()` service logic exists and appears correct (validates `ACTIVE` status, sets `CANCELLED`, releases the unit to `AVAILABLE` if no other holds), but has not been exercised against a live reservation in production.
- **Recurring billing endpoint proven live 18 August 2026** (see Implemented foundations) — reachable, authenticated correctly, returns a real (zero-count, expected) summary. Not yet proven against real occupancy data with a nonzero charge, and the crontab schedule on the VPS still needs final confirmation.
- **Reservation-to-tenancy move-in engine (`moveIn()`) reviewed 18 August 2026 and confirmed code-complete and correctly wired to real routes/screens (see Implemented foundations), but not yet live-tested.** This is the main remaining gap on "complete core customer-to-reservation-to-lease lifecycle": the engine looks solid on inspection, but nobody has run it live.
- **Move-in unit-status colour fix, 18 August 2026:** the `/operations/move-in` unit table was rendering "Vacant"/"Reserved" as plain text with no visual distinction. Fixed by reusing the existing `StatusPill` component and `.status-positive`/`.status-warning` design tokens (green/amber, already used in `unit-inventory-workspace.tsx`) instead of inventing new styling — Vacant is now `positive` (green), Reserved is now `warning` (amber). Code-only change, not yet deployed/visually verified in production; needs a rebuild and a look at `/operations/move-in` to confirm the badges render as expected.
- **Move-in Floor/Status filtering added, 18 August 2026** (see Implemented foundations) — same deploy/visual-verification caveat as the status-pill fix above: pushed to `main`, not yet confirmed live on `/operations/move-in`.
- **Take payment reference auto-generation added, 18 August 2026** (see Implemented foundations) — same deploy/visual-verification caveat: pushed to `main`, not yet confirmed live on `/operations/accounts`.
- The public website previously returned HTTP 404 for `/book`; CRM health alone does not prove the customer journey.
- Do not claim providers, finance sync or customer lifecycle automation are operational without current configuration plus end-to-end evidence.

## Known deployment gotchas

- **Docker build-cache staleness can silently deploy old code even when the correct commit is checked out.** On 17–18 August 2026, a sequence of real, distinct fixes (missing `proxy.ts` public-route exemption → a `proxy.ts` syntax error from an automated rewrite → a `.env` secret-vs-hash mix-up) was each fixed correctly, yet the running container kept serving stale behaviour. The eventual root cause: `docker compose --env-file .env -f compose.prod.yml build app` reused Docker's build cache for **every layer**, including `COPY . .` and `RUN npm run db:generate && npm run build`, even though `git log` confirmed the correct new commit was checked out on disk. A `docker compose build` where the `COPY . .`/`npm run build` layers show `CACHED` is *not* evidence the image contains current code.
- **Standing rule:** whenever a fix isn't taking effect in production despite a confirmed-correct git checkout, don't just re-run `docker compose build` — check whether the build layers are cached, and if there's any doubt, force `docker compose --env-file .env -f compose.prod.yml build --no-cache app` before redeploying. Verify the fix actually landed by `docker exec`-ing into the running container and grepping the compiled `.next` output for a string unique to the new code (e.g. `docker exec <container> grep -r "some-new-route" /app/.next`) *before* re-testing the endpoint — an empty grep result means the deploy did not actually ship the fix, regardless of what the build log or `git log` says.
- The automated `deploy-vps.yml` GitHub Actions workflow triggers via `workflow_run` after a separate `CI` workflow completes on `main`. Whether it properly gates on `workflow_run.conclusion == 'success'` was flagged as a possible secondary contributor to the above incident but not conclusively confirmed or fixed — worth auditing if similar "fix isn't live" symptoms recur.

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
  2. A live, provable reserve/cancel booking lifecycle for Midpoint (Task 3 — the reserve side is live-tested; cancel is not yet tested; email notification is now proven live, SMS/WhatsApp are not yet, see Current status and evidence limits).
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

1. Purchase a real Twilio phone number and upgrade the Twilio account off the trial plan to unlock SMS with custom message content; separately, complete Meta Business Manager setup and Business Verification (CIPC document) as a prerequisite for later WhatsApp Business API sender registration. Email is already proven live via SendGrid — this item now only covers SMS/WhatsApp. Live-test at least one of SMS or WhatsApp end to end once unblocked.
2. With explicit approval, prove the reservation cancel path (reserve side is already live-tested — see Current status and evidence limits).
3. Confirm the monthly billing cron schedule is correctly installed on the VPS (`crontab -e`, hitting the production domain with the correct hashed secret) and, once real ACTIVE occupancies exist, prove a nonzero idempotent charge run.
4. Live-test the `moveIn()` reservation-to-tenancy conversion against one of the two live Midpoint reservations, and confirm the billing engine correctly picks up the resulting occupancy in its next run.
5. Deploy and visually verify the accumulated `/operations/move-in` and `/operations/accounts` UI changes (status pill, Floor/Status filters, auto-generated payment reference).
6. Close the MRI decision pack: system ownership, mapping, posting model, reconciliation, exception owner and sandbox access.
7. Select and implement payment and Hikvision access providers — both are hard blockers for the approved pilot scope (see Pilot facility and first-release scope above) — plus e-signature and insurance providers through the existing provider boundaries.
8. Replace remaining scaffold/demo repositories with scoped database-backed behaviour.
9. Complete migration planning, UAT, training, monitoring, recovery and production readiness gates.

## Working rules for any AI assistant

1. Inspect branch, status, recent commits, schema, relevant tests and route/service code before making claims or changes.
2. Do not deploy, migrate production data, enable providers or create real customer records without explicit authority.
3. Every protected handler must enforce server-side session/permission and organisation/facility scope. Proxy redirects are not security controls.
4. Keep secrets server-side; never log or commit tokens, reset links, signing keys, customer data, PAN or CVV.
5. Prefer idempotent commands, signed inbound events, durable audit/outbox records and explicit reconciliation.
6. Read the relevant Next.js 16 guides under `node_modules/next/dist/docs/` before changing framework behaviour.
7. Before validation run Prisma generation and Next type generation where required, then targeted tests and the relevant `npm run check` components.
8. Separate pre-existing repository-wide failures from failures caused by the change, but never hide either.
9. **Update this file after every material change — including work that is complete but not yet proven live, or proven partially.** Update it the moment a task is finished, deployed, or live-tested, not just at the end of a session. Include evidence (what was actually observed, with a date), not optimistic status language. If something is still pending verification, say so explicitly rather than omitting it.
10. Follow the branching policy above: short-lived branches only, deleted promptly after merge.
11. **Reuse existing design tokens and components before styling anything new.** This codebase already has a real design system (`StatusPill` with `positive`/`warning`/`danger`/`neutral` tones, `--green`/`--amber`/`--red` CSS variables, `.data-table`/`.panel` conventions in `globals.css`). Check for an existing pattern (e.g. `unit-inventory-workspace.tsx`'s use of `StatusPill`) before inventing new colours or components — most "missing polish" issues are a wiring gap, not a design gap.

## Definition of done

A CRM capability is complete only when it is database-backed, scoped, permission-enforced, audited, tested, operationally owned and—where an external provider or deployment is involved—configured and proven end to end with reconciliation and exception handling.
