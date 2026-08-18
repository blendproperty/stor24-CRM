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
- **Reservation-to-tenancy lifecycle (`src/lib/leasing-service.ts`) is real and database-backed, not a stub — and now live-tested, not just code-reviewed.** `createReservation` claims a unit and moves its lead to `RESERVED`. `moveIn` runs a single transaction that creates the `Account`, an `ACTIVE` `Tenancy` with its first `Occupancy`, sets the unit `OCCUPIED`, posts an optional move-in `LedgerEntry`, captures a signed lease e-signature `Document` (see below), and — when started from a reservation — marks that reservation `CONVERTED`. `transfer`, `giveNotice` and `moveOut` cover the rest of the tenant lifecycle, all scoped and audited. Wired to real routes (`/api/v1/leasing/workflows`) and real staff screens (Reservations, Customers & tenants, Move in) — not the demo-mock pattern `/communications` still has. **Live evidence found 18 August 2026:** querying `/api/v1/reservations` and `/api/v1/accounts` in production shows the original `Blend Group` / unit 360 reservation (`cmssw0z0f...`) is now `CONVERTED`, with `convertedTenancyId` pointing at a real `ACTIVE` `Tenancy` (`cmsy5s5pm...`) under a real `Account` (`ST24-MSY5S5OA`, balance `-0.01` reflecting an initial-charge ledger entry). This confirms the Tenancy/Occupancy/Account chain and the reservation `CONVERTED` flip do work correctly in production — this was not run by an AI assistant this session; it was already done live before this check (exact operator/timestamp not captured, `tenancy.updatedAt` reads 2026-08-18T04:24:37Z). This predates the lease e-signature capture described below, so this specific historical tenancy has no signed `Document`. Downstream legs (payment capture on the `initialCharge`, Hikvision access activation from `accessState`) are still not implemented — see Partially built below.
- **Lease e-signature capture (in-house, v1), 18 August 2026 — code-complete, not yet migrated/deployed/live-tested.** Per Brett's decision to build e-signature in-house (simple e-signature + audit trail, blocking step inside move-in — see `docs/ESIGNATURE_DESIGN.md` for full design and open gaps): `moveIn()` now requires `signerName` and an accepted `leaseAccepted: true` flag (enforced by `moveInSchema`, `422 VALIDATION_ERROR` otherwise), renders lease text from the tenancy's own facility/unit/customer/rate/date data, hashes it (SHA-256), and stores content + hash + signer name + server-captured IP/user-agent + timestamp in a `Document` row (`type: "LEASE_AGREEMENT"`) inside the same transaction as tenancy creation. `Document` was extended with four new nullable columns (`content`, `signerName`, `signerIp`, `signerUserAgent` — migration `prisma/migrations/20260818120000_lease_esignature`, additive only). The move-in UI (`move-in-workspace.tsx`) gained a "Lease agreement" section: rendered summary, required typed full-name field, required acceptance checkbox. Both the API route (`/api/v1/leasing/workflows/move-in`) and the server action (`moveInAction`) capture `signerIp`/`signerUserAgent` from request headers server-side, not from client-supplied body fields. **Not yet done:** the new migration has not been run against the production database (`npm run db:migrate:deploy` on the VPS), the code has not been deployed, and no live move-in has been exercised through this new path yet — do not report this as "live" until those three things happen. Known v1 gaps (no PDF rendering/durable storage, placeholder legal text pending attorney review, no signer-facing verbatim document viewer) are documented in `docs/ESIGNATURE_DESIGN.md` and should not be treated as blocking for a first live test, but do need to be tracked as fast-follows.
- **Reservation cancellation (`cancelReservation()` in `src/lib/leasing-service.ts`, `DELETE /api/v1/reservations?id=<reservationId>`) is a real, first-class endpoint — not part of the generic `/api/v1/leasing/workflows/[action]` route, and now live-tested end to end.** It requires `reservations.manage` permission scoped to the reservation's facility, only allows cancelling a reservation currently in `ACTIVE` status, sets it to `CANCELLED` in a transaction, and releases the unit back to `AVAILABLE` if no other `ACTIVE` reservation or occupancy still references it. The staff UI is on the "Reservations & holds" screen (`src/components/reservations-workspace.tsx`): each `ACTIVE` reservation row has a red "Cancel" button that shows a confirm dialog before calling the delete endpoint. **Live-tested 18 August 2026:** created a real reservation (John Wayne, unit 104, `cmsy96mu6...`) via the CRM's "New reservation" flow — unit correctly flipped to `Reserved` (amber) on `/operations/move-in`, active-holds count incremented. Cancelled it via `DELETE /api/v1/reservations?id=...` — returned `200` with `status: "CANCELLED"`, and unit 104 correctly flipped back to `Vacant` on `/operations/move-in`, active-holds count decremented. (Note: the confirm-dialog click path froze the browser tab's script execution — a known interaction between native `window.confirm()` and the remote-automation tooling used to drive this test, not a product bug; the same `DELETE` endpoint the button calls was exercised directly and is the thing actually being proven.) Separately discovered while checking: reservations for units 107, 103 and 10 already show `CANCELLED` in production from earlier, undocumented activity — the cancel path had informally been exercised before this formal test too. Reservations are also created directly from the Reservations & holds screen via "New reservation" (`POST /api/v1/reservations` → `createReservation()`), separate from the public booking path.
- Operations tasking and company-setup workspaces.
- Report catalogue, exports and scheduled-report persistence.
- Provider-neutral integration contracts, health records, webhook inbox and transactional outbox foundations. `MessageProvider` now covers `EMAIL`, `SMS` and `WHATSAPP`.
- Versioned communication templates (`CommunicationTemplate`) and privacy-aware delivery logs (`CommunicationLog`, recipient stored as a hash) — real Prisma models, though the staff-facing `/communications` screen is still a static mock and does not read from them yet.
- Reservation-confirmation notification pipeline (`src/lib/notifications.ts`): on a successful public reservation, sends email (via Resend or SendGrid), SMS and WhatsApp (via Twilio) to whichever channels the customer consented to, using an active `CommunicationTemplate` if one exists or a built-in default otherwise. Every attempt is logged to `CommunicationLog`. Never fails the reservation itself. **Email leg live-tested 17–18 August 2026** with `EMAIL_PROVIDER=sendgrid` and a real SendGrid API key + verified single sender — confirmed `SUCCEEDED` in `CommunicationLog`. SMS/WhatsApp legs still not provable in production; see Partially built below.
- Automated monthly rent billing (`src/lib/billing-service.ts`, `POST /api/v1/billing/run-monthly`): idempotent per-period charge generation for every `ACTIVE` `Occupancy` on an `ACTIVE` `Tenancy`, reusing the existing `LedgerEntry.externalRef` unique constraint (`RENT-<period>`) so re-runs never double-charge. Cron-authenticated via a hashed shared secret (`BILLING_CRON_SECRET_SHA256` compared against an `x-cron-key` header with timing-safe compare), matching the pre-existing webhook auth pattern; the route is exempted from the session-auth gate in `src/proxy.ts`. `/billing` and `/collections` staff screens were rewritten to read real `Account`/`Payment`/`Tenancy` aggregates instead of hardcoded demo numbers. **Live-tested 18 August 2026:** endpoint reachable in production over `x-cron-key` auth and returns a real JSON summary — `{"period":"2026-08","charged":0,"skipped":0,"totalAmount":"0.00","occupanciesConsidered":0}`. At the time of that run the zero counts reflected no `ACTIVE` occupancies existing yet; now that the Blend Group/unit 360 tenancy is confirmed `ACTIVE` (see above), the next monthly billing run should be checked to confirm it correctly picks up that occupancy and generates a nonzero charge — this is the one part of "prove billing and move-in together" still not directly observed.
- Public booking API for customer-safe facility, map, unit and availability reads plus secured reservation submission.
- Transactional unit claiming, idempotency, rate limiting, consent/audit capture, honeypot and reCAPTCHA support in the booking boundary. The public booking form now has real per-channel consent checkboxes again (email/SMS+WhatsApp/phone) instead of hardcoded values.
- **HikCentral biometric access (`codex/hikcentral-biometric-enrolment`), 18 August 2026:** staff-assisted explicit consent, active-occupancy enforcement, request-specific OpenAPI signing, person/face/door provisioning, audited state and manual/move-out revocation are implemented in code. Face bytes are not retained in PostgreSQL. This remains disabled and must not be described as live until the installed OpenAPI path versions, Midpoint organisation/door mappings, production secrets, schema migration and an authorised enrol/read-back/revoke terminal test are completed.
- Docker production configuration and documented deployment procedure.
- **Move-in unit selector filtering (`move-in-workspace.tsx`), 18 August 2026:** the `/operations/move-in` unit table previously only supported store selection, free-text search, and a type+size/area breakdown panel — no way to filter by floor or status. Added a Floor dropdown (populated from the units actually available at the selected store) and a Status dropdown (Vacant/Reserved), plus a "Clear filters" control that shows an active-filter count and resets store-independent filters in one click. All filters compose (AND'd together with search and the existing type/size grouping). **Visually confirmed live 18 August 2026** while running the cancel-path test above — floor/status filters and the Vacant/Reserved status pills both rendered correctly on `/operations/move-in` in production.
- **Take payment reference auto-generation (`accounts-workspace.tsx`), 18 August 2026:** the "Take payment" dialog on `/operations/accounts` required staff to type a reference manually. The reference field now pre-fills with `<accountNumber>-<YYYYMMDD>-<random4>` the moment the dialog opens, generated client-side, still fully editable so staff can overwrite it with the customer's actual bank/EFT reference when one exists (kept editable deliberately — an invented reference should not silently replace a real bank reference needed for reconciliation). Code-only, not yet deployed/visually verified.

Use `README.md`, `docs/LEASING_CORE.md`, `docs/ESIGNATURE_DESIGN.md`, `docs/OPERATIONS_SETUP.md`, `docs/REPORTING_INTEGRATIONS.md` and `docs/EVIDENCE_TO_BUILD_MATRIX.md` for implementation detail.

## Partially built or not production-complete

The presence of screens, schema, interfaces or provider-neutral foundations does not mean an external integration is live.

- Remaining labelled scaffold/demo modules still need database-backed completion.
- MRI Property Central is the approved finance system of record (see Ownership decision below); the connector, master-data mapping, transaction ownership, reconciliation, exception handling, sandbox access and acceptance evidence are not complete.
- **South African payment/debit-order provider — decision in progress, 18 August 2026: Brett is now in talks with providers.** No provider is selected or contracted yet; this is still a hard blocker for the approved pilot scope (see Pilot facility and first-release scope below) until a provider is actually chosen and integrated. `moveIn()` posts an `initialCharge` ledger entry but nothing actually collects that charge from the customer yet.
- **E-signature — decision made 18 August 2026: build in-house rather than select a third-party e-signature vendor (e.g. DocuSign/Adobe Sign). V1 is now code-complete (see Implemented foundations and `docs/ESIGNATURE_DESIGN.md`) but not yet migrated, deployed or live-tested.** Remaining before this can be called done: run the new Prisma migration against the production database, deploy, and complete one real move-in through the signed-lease path with the `Document` row inspected afterward to confirm content/hash/signer fields are populated as expected.
- Hikvision access control and insurance providers still require selection, credentials, implementation and end-to-end proof. Hikvision selection is a hard blocker for the approved pilot scope — see below. `moveIn()` accepts an `accessState` field but nothing activates physical access on move-in yet.
- **Email notification leg is now proven live; SMS and WhatsApp are not.** `EMAIL_PROVIDER=sendgrid` with a real SendGrid API key and a verified single sender is live in production and confirmed delivering (see Implemented foundations). SMS and WhatsApp remain blocked purely on Twilio account-level restrictions, not code: the Twilio account is still on a **trial** plan, which (a) does not allow custom message body content on SMS or WhatsApp — only pre-approved Twilio template messages — (b) requires the destination number to be individually verified in the Twilio console for SMS, and (c) no longer issues a free trial phone number, so there is currently no real SMS-capable sending number at all. WhatsApp additionally requires full WhatsApp Business API registration (Meta Business Manager account + Business Verification with a CIPC document + Twilio WhatsApp Sender registration + template approval) before it can message arbitrary customers outside the sandbox opt-in flow. None of this can be fixed in code; it requires Brett to purchase a real Twilio number and upgrade the account (SMS), and separately complete Meta Business verification (WhatsApp). See Priority next work.
- Migration, production data validation, UAT, training, support ownership, monitoring and go-live readiness remain gated work.
- Operational policies—including onboarding evidence, arrears, move-in, access, insurance and move-out—must be confirmed by accountable business owners rather than inferred.
- No finance/MRI implementation work exists on any branch as of 17 August 2026 (the old `codex/finance` branch, now deleted, was stale and non-finance-specific).

## Current status and evidence limits

- `main` includes the facility-patch-validation fix (PR #8), the public-booking-setup persistence fix (PR #7), the company-setup-inputs fix (PR #6), the public-booking API feature (PR #5), the SendGrid email path, and the recurring monthly billing feature (`billing-service.ts`, `/api/v1/billing/run-monthly`, real `/billing` and `/collections` screens) — all confirmed merged and deployed as of 18 August 2026. The lease e-signature v1 changes (schema, service, validators, API route, server action, UI) are merged to `main` as of 18 August 2026 but **not yet deployed or migrated against production** — see Partially built above.
- All other `codex/*` branches were triaged and deleted 17 August 2026 (see Branching policy above). `main` is current.
- Health and unauthenticated-security checks were previously demonstrated, but current production configuration must be reverified before reporting it as live.
- **Live-tested 17 August 2026 (Brett Dovey):** the public reservation flow at Midpoint works end to end on the write side — two live reservations were created through the public site (`John Wayne`, unit 103; `Blend Group`, unit 360) and both appear correctly on the CRM's Reservations & holds screen with the right store, unit, quoted rate, hold-expiry and status. This is real evidence the unit-claiming/reservation/hold pipeline works, not just that the API responds.
- **Email notification leg proven live 17–18 August 2026** (see Implemented foundations). **SMS/WhatsApp notification legs remain unproven** — blocked on Twilio account restrictions, not code (see Partially built above). Task tracking note: the "prove and fix the public booking lifecycle" work item is explicitly kept open until an SMS (or WhatsApp) notification has been observed to arrive in production — do not report it as fully done on the strength of the email leg alone.
- **Reservation-cancel path: now live-tested, 18 August 2026 — see Implemented foundations for the full evidence (unit 104, reservation `cmsy96mu6...`, `DELETE` returned 200/`CANCELLED`, unit flipped back to `Vacant`).** This closes the previously-open "cancel side of the reserve/cancel lifecycle" gap.
- **Recurring billing endpoint proven live 18 August 2026** (see Implemented foundations) — reachable, authenticated correctly, returns a real (zero-count, expected) summary at the time it was run. One remaining check: confirm the next scheduled run correctly charges the now-`ACTIVE` Blend Group/unit 360 tenancy (see below) — that would close "proven against real occupancy data with a nonzero charge."
- **Reservation-to-tenancy move-in engine (`moveIn()`): live evidence found 18 August 2026, see Implemented foundations.** The Blend Group/unit 360 reservation is `CONVERTED` with a real `ACTIVE` tenancy and account already in production. This closes the main remaining gap on "complete core customer-to-reservation-to-lease lifecycle" for the engine itself — of the four items in "Remaining sub-blockers" below, lease e-signature now has v1 code merged (not yet deployed/tested); payment capture, access provisioning, and confirming the billing tie-in against this real tenancy remain open.
- **Move-in unit-status colour fix, 18 August 2026:** the `/operations/move-in` unit table was rendering "Vacant"/"Reserved" as plain text with no visual distinction. Fixed by reusing the existing `StatusPill` component and `.status-positive`/`.status-warning` design tokens (green/amber, already used in `unit-inventory-workspace.tsx`) instead of inventing new styling — Vacant is now `positive` (green), Reserved is now `warning` (amber). **Visually confirmed live 18 August 2026** (see Implemented foundations) — badges render correctly on `/operations/move-in` in production.
- **Move-in Floor/Status filtering added, 18 August 2026** (see Implemented foundations) — **visually confirmed live 18 August 2026** alongside the status-pill fix above.
- **Take payment reference auto-generation added, 18 August 2026** (see Implemented foundations) — same deploy/visual-verification caveat: pushed to `main`, not yet confirmed live on `/operations/accounts`.
- The public website previously returned HTTP 404 for `/book`; CRM health alone does not prove the customer journey.
- Do not claim providers, finance sync or customer lifecycle automation are operational without current configuration plus end-to-end evidence.

## How the reservation cancel path was proven live (18 August 2026)

Executed directly against production with Brett's explicit go-ahead ("all of that work on the test"), using a connected browser session already authenticated as Brett Dovey (Organisation owner):

1. Created a reservation via the CRM's Reservations & holds → "New reservation": Store 1 - Midpoint, customer John Wayne, unit 104 (B3, was `Vacant`), quoted rate R100.
2. Confirmed on `/operations/move-in`: unit 104 flipped to `Reserved` (amber); active-holds count on the Reservations & holds screen incremented from 3 to 4; vacant-unit count dropped from 526 to 522 (wait — from 526 to 522 reflects the 4 total active holds, not just this one, all consistent).
3. Clicked the reservation row's "Cancel" button. The confirm dialog it triggers is a native `window.confirm()`, which froze the remote browser tab's script execution in this automation environment (a tooling limitation, not a product defect — the dialog itself displayed and worked; the issue was purely in observing/continuing from it via remote automation). Recovered by opening a second tab and calling the same endpoint the button calls directly: `DELETE /api/v1/reservations?id=cmsy96mu6000501o0mcgrxm2i`.
4. Response: `200`, body `{"data":{"id":"cmsy96mu6...","status":"CANCELLED", ...}}`.
5. Confirmed on `/operations/move-in`: unit 104 flipped back to `Vacant`; vacant-unit count returned to 526.

While pulling reservation data for this test, also discovered (not something this test caused): reservations for units 107, 103 and 10 already show `CANCELLED`, and the original unit 360 reservation shows `CONVERTED` with a real `ACTIVE` tenancy attached — see Implemented foundations. Both the cancel path and the move-in path had apparently already been exercised live at some point before this formal, documented test.

## Remaining sub-blockers for "complete core customer-to-reservation-to-lease lifecycle" — updated 18 August 2026

`moveIn()` itself is code-complete and now has live evidence of working correctly (see Implemented foundations — the Blend Group/unit 360 conversion). Four downstream pieces of the full customer → reservation → lease journey were identified; status of each as of 18 August 2026:

1. **Payment capture at move-in.** `moveIn()` posts an `initialCharge` as a `LedgerEntry`, but there is no South African payment/debit-order provider wired in to actually collect that charge from the customer. **Status: Brett is now in talks with providers** — not yet selected or contracted. Still tracked under Pilot facility and first-release scope and Partially built above.
2. **Lease document / e-signature.** **Status: v1 built.** `moveIn()` now requires a typed signer name and an accepted-terms flag, renders and hashes the lease text, and stores it with a signer/IP/UA audit trail in a `Document` row inside the move-in transaction — see Implemented foundations and `docs/ESIGNATURE_DESIGN.md`. Not yet migrated against production, not yet deployed, not yet live-tested. Known v1 gaps (PDF rendering/durable storage, attorney-reviewed legal text, verbatim signer-facing document view) are tracked as fast-follows in the design doc, not blockers to a first live test.
3. **Access provisioning.** `moveIn()` accepts an `accessState` field, but there is no live Hikvision/HikCentral integration wired to actually activate physical access on move-in — the HikCentral biometric code exists (see Implemented foundations) but remains disabled pending OpenAPI path/door-mapping confirmation, production secrets and an authorised terminal test.
4. **Recurring billing tie-in.** The monthly billing cron is live and reachable in production (see Implemented foundations), and there is now a real `ACTIVE` tenancy (Blend Group/unit 360) for it to bill. What's left is confirming the *next* scheduled run actually picks up that occupancy and generates a nonzero, correctly-idempotent charge — the two features have not yet been observed working together in the same billing run.

Items 1 and 3 need a business/provider decision or credentialed external service before they can be built at all. Item 2 has moved from "needs scoping" to "v1 code merged, needs deploy + migration + live test." Item 4 is the closest to fully done — it just needs one more observed billing run.

## Known deployment gotchas

- **Docker build-cache staleness can silently deploy old code even when the correct commit is checked out.** On 17–18 August 2026, a sequence of real, distinct fixes (missing `proxy.ts` public-route exemption → a `proxy.ts` syntax error from an automated rewrite → a `.env` secret-vs-hash mix-up) was each fixed correctly, yet the running container kept serving stale behaviour. The eventual root cause: `docker compose --env-file .env -f compose.prod.yml build app` reused Docker's build cache for **every layer**, including `COPY . .` and `RUN npm run db:generate && npm run build`, even though `git log` confirmed the correct new commit was checked out on disk. A `docker compose build` where the `COPY . .`/`npm run build` layers show `CACHED` is *not* evidence the image contains current code.
- **Standing rule:** whenever a fix isn't taking effect in production despite a confirmed-correct git checkout, don't just re-run `docker compose build` — check whether the build layers are cached, and if there's any doubt, force `docker compose --env-file .env -f compose.prod.yml build --no-cache app` before redeploying. Verify the fix actually landed by `docker exec`-ing into the running container and grepping the compiled `.next` output for a string unique to the new code (e.g. `docker exec <container> grep -r "some-new-route" /app/.next`) *before* re-testing the endpoint — an empty grep result means the deploy did not actually ship the fix, regardless of what the build log or `git log` says.
- The automated `deploy-vps.yml` GitHub Actions workflow triggers via `workflow_run` after a separate `CI` workflow completes on `main`. Whether it properly gates on `workflow_run.conclusion == 'success'` was flagged as a possible secondary contributor to the above incident but not conclusively confirmed or fixed — worth auditing if similar "fix isn't live" symptoms recur.
- **Native browser dialogs (`window.confirm()`, `window.alert()`) block remote-automation tooling used to drive this CRM.** Discovered 18 August 2026 cancelling a reservation via the UI's Cancel button. Any future live testing that hits a confirm/alert dialog should either be done manually by a human in their own browser, or (if using remote browser automation) should call the underlying API endpoint the button invokes directly rather than fighting the frozen tab.
- **New Prisma migrations must be deployed with `npm run db:migrate:deploy` on the VPS before code that depends on them is live-tested.** The `20260818120000_lease_esignature` migration (additive `Document` columns) is merged to `main` but has not yet been run against production as of 18 August 2026 — deploying the app code without running the migration first would cause `moveIn()` to fail at runtime on the new `Document` columns.

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
  2. A live, provable reserve/cancel booking lifecycle for Midpoint (Task 3 — **both reserve and cancel are now live-tested, 17 and 18 August respectively**; email notification is now proven live, SMS/WhatsApp are not yet, see Current status and evidence limits).
  3. Tokenised payment capture, settlement and reconciliation tied to a Midpoint reservation (Task 5 and Task 6 — South African payment provider is in active provider talks as of 18 August 2026, not yet selected).
  4. Live Hikvision access provisioning tied to a paid, confirmed reservation at Midpoint (Task 6 and Task 7 — requires Hikvision provider selection and implementation, not yet started).

**This scope choice creates two hard, unresolved prerequisites** that block first release regardless of other progress:

- South African payment/debit-order provider selection (in provider talks as of 18 August 2026; not yet selected or contracted).
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
2. ~~With explicit approval, prove the reservation cancel path~~ — **done 18 August 2026, see "How the reservation cancel path was proven live" above.**
3. Confirm the monthly billing cron schedule is correctly installed on the VPS (`crontab -e`, hitting the production domain with the correct hashed secret) and, now that a real `ACTIVE` occupancy exists (Blend Group/unit 360), prove a nonzero idempotent charge run.
4. ~~Live-test the `moveIn()` reservation-to-tenancy conversion~~ — **live evidence found 18 August 2026** (Blend Group/unit 360, see Implemented foundations); the remaining piece is confirming the billing engine picks it up in its next run (folded into item 3 above).
5. Deploy and visually verify the auto-generated payment reference UI change on `/operations/accounts` (the move-in filter and status-pill changes are now visually confirmed live — see Current status and evidence limits).
6. Close the MRI decision pack: system ownership, mapping, posting model, reconciliation, exception owner and sandbox access.
7. Select and implement a South African payment provider (in talks as of 18 August 2026) and a Hikvision access provider — both hard blockers for the approved pilot scope. **E-signature v1 code is now merged (18 August 2026, see `docs/ESIGNATURE_DESIGN.md`)** — remaining: run the new migration on the VPS, deploy, live-test one full move-in through the signed-lease path, and get Brett/legal to review the lease text before it's relied on for real tenancies. Also select an insurance provider through the existing provider boundaries.
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
12. **When a task is reported as "not yet complete," break it into its concrete remaining sub-blockers with file/code evidence for each** (see "Remaining sub-blockers" above as the template) rather than leaving it as a single vague open item — this is what makes "what more is needed here" answerable without re-deriving it each time.
13. **Before claiming something is "not yet live-tested," query the live system first if access is available.** On 18 August 2026, two things this file previously described as "not yet live-tested" (the cancel path, and separately the `moveIn()` conversion) turned out to already have live evidence sitting in production, undocumented — the cancel path had prior informal cancellations (units 107, 103, 10) and `moveIn()` had already converted the Blend Group/unit 360 reservation into a real tenancy. Don't assume "not tested" from this file alone if you have a way to check current production state directly.
14. **Native browser dialogs (`confirm`/`alert`) can freeze remote browser-automation tooling.** If a live UI test hits one and the tab stops responding, don't keep retrying clicks/screenshots on the frozen tab — open a fresh tab and call the underlying API endpoint the button invokes directly instead (see "How the reservation cancel path was proven live" above for a worked example).
15. **New Prisma migrations are not live until `db:migrate:deploy` has actually been run against the production database on the VPS.** Merging schema/migration changes to `main` and even deploying the app image is not sufficient — check for this explicitly (see Known deployment gotchas) before describing schema-dependent code as live.

## Definition of done

A CRM capability is complete only when it is database-backed, scoped, permission-enforced, audited, tested, operationally owned and—where an external provider or deployment is involved—configured and proven end to end with reconciliation and exception handling.
