# Lease e-signature (in-house, simple e-signature + audit trail)

## Decision

Brett decided (18 Aug 2026) to build lease e-signature in-house rather than integrate a third-party
provider (DocuSign, etc.). Scope, confirmed via three explicit choices:

- Evidentiary standard: **simple e-signature + audit trail** — not an "advanced electronic signature"
  under South Africa's ECT Act (no accredited authentication product). Sufficient for most commercial
  storage licence agreements; not appropriate for documents that legally require an advanced signature.
- Timing: **blocking step inside move-in** — a tenancy cannot be created via `moveIn()` without an
  accepted, signed lease.
- Priority: build now, v1.

> **18 Aug 2026 — v2 shipped.** Brett flagged the original v1 (typed-name + single checkbox against a
> short summary) as insufficient — there needs to be an actual agreement the customer initials
> clause-by-clause and signs. This has now been built (see "What 'signed' means here" below); the
> remaining blocking gap is that the clause wording itself is still placeholder text pending
> attorney/Brett review — see "Outstanding before this is done".

## What "signed" means here (v2)

At `moveIn()`, the system builds the lease as a **structured list of clauses** (`src/lib/lease-agreement-content.ts`
— premises & use, term & rent, access & security, insurance & liability, prohibited items, default &
termination, data & privacy), renders the full document text from them, hashes it (SHA-256), and stores
content + hash + signer identity + per-clause initials in a `Document` row, all inside the same DB
transaction as the tenancy creation. In the move-in UI, every clause is displayed with its own required
"I have read and initial this clause" checkbox — the customer must tick all of them — plus a final typed
full legal name as signature. `moveIn()`/`moveInSchema` reject the request (`422 VALIDATION_ERROR`, or
`CONFLICT` if it somehow reaches the service layer without all clauses) unless every clause key in
`LEASE_CLAUSE_KEYS` is present in `initials`.

Audit trail captured per signature:

- `signerName` — typed full name (final signature)
- `initials` — JSON array of `{ clauseKey, initialedAt }` for every clause, so which clauses were
  affirmatively initialled (and when) is recoverable per signature
- `clauseVersion` — the `LEASE_VERSION` string from `lease-agreement-content.ts` at the time of signing,
  so future clause wording changes don't retroactively change what a historical signer is deemed to have agreed to
- `signerIp` / `signerUserAgent` — from request headers, read server-side, never trusted from the client body
- `signedAt` — server timestamp
- `content` — the exact, full rendered agreement text (all clauses) shown to the signer
- `sha256` — hash of `content`

## Outstanding before this is fully done

1. **Real, attorney-reviewed clause text.** `src/lib/lease-agreement-content.ts` currently contains
   drafted-but-not-approved boilerplate for each clause (marked `DRAFT` in the file header and on
   screen). Brett or STOR 24's attorney needs to review and approve the actual wording — access terms,
   insurance, payment/default, termination, POPIA/data clause — before this is relied on for real
   tenants. Once approved, update the clause bodies in that file and bump `LEASE_VERSION`.
2. **PDF rendering / durable storage** — still not built; `content` lives inline in Postgres. See Known
   gaps below.
3. **Per-clause hash granularity** — currently one `sha256` covers the whole rendered document (all
   clauses together), not one hash per clause. Revisit if a dispute ever needs to isolate exactly what
   was shown for a single clause versus the document as a whole; not considered a blocker for v2 since
   `content` + `clauseVersion` already pin the exact full text shown.

## Data model

`Document` (existing model, extended additively across two migrations):

```
model Document {
  id              String    @id @default(cuid())
  tenancyId       String
  tenancy         Tenancy   @relation(fields: [tenancyId], references: [id], onDelete: Cascade)
  type            String    // "LEASE_AGREEMENT" for this flow
  storageKey      String    // "inline" for now — see Known gaps
  content         String?   // full rendered lease text, all clauses (migration 20260818120000)
  sha256          String?   // hash of content (migration 20260818120000)
  signerName      String?   // migration 20260818120000
  signerIp        String?   // migration 20260818120000
  signerUserAgent String?   // migration 20260818120000
  initials        Json?     // [{ clauseKey, initialedAt }, ...] (migration 20260818130000)
  clauseVersion   String?   // LEASE_VERSION at time of signing (migration 20260818130000)
  signedAt        DateTime?
  createdAt       DateTime  @default(now())
}
```

All new columns across both migrations are nullable — additive to existing rows, no backfill required.

## Code touched

- `src/lib/lease-agreement-content.ts` (new) — `LEASE_VERSION`, `LEASE_CLAUSE_KEYS`, `buildLeaseClauses()`
  (returns the clause list rendered with tenancy-specific context), `renderLeaseDocument()` (full document
  text for hashing/storage). This is the single place clause wording lives — edit here once real legal
  text is approved.
- `src/lib/leasing-service.ts` — `hashDocument()` (SHA-256); `moveIn()` now requires `signerName` and
  `initials: LeaseClauseKey[]` covering every clause, builds the document via `renderLeaseDocument()`,
  and creates the `Document` row (with per-clause `initials` JSON + `clauseVersion`) inside its transaction.
- `src/lib/validators.ts` — `moveInSchema` requires `signerName` (2–120 chars) and `initials` as an array
  that must include every key in `LEASE_CLAUSE_KEYS`.
- `src/app/api/v1/leasing/workflows/[action]/route.ts` — for the `move-in` action, merges
  `signerIp`/`signerUserAgent` from request headers into the validated input before calling `moveIn()`.
- `src/app/actions/leasing.ts` — `moveInAction` (server action used by the move-in page) reads one
  `initial_<clauseKey>` checkbox per clause from the submitted form into the `initials` array, and does
  the same header capture via `next/headers`.
- `src/components/move-in-workspace.tsx` — step 2 of the move-in form renders every clause (title +
  body, populated with the selected facility/unit/customer/rate) with its own required initial
  checkbox, plus the final typed-name signature field. "Complete move-in" is disabled client-side until
  every clause is initialled and a name is typed (server-side validation is the real gate).

## Known gaps / fast-follows

- **No PDF rendering or durable file storage yet.** `storageKey` is set to the literal `"inline"` and
  the full lease text lives in `content` (Postgres `TEXT`). A fast-follow should render this to PDF and
  store it in real object storage (with `storageKey` pointing at it), keeping `content`/`sha256` as the
  source of truth for what was actually signed.
- **No re-signature/amendment flow.** Transfers and rate changes do not currently re-trigger a signed
  document. Out of scope per Brett's "blocking step inside move-in" instruction.
- **No migrations deployed yet.** Both `20260818120000_lease_esignature` and
  `20260818130000_lease_clause_initials` need `npm run db:migrate:deploy` run against production before
  this can be live-tested — see `PROJECT_CONTEXT.md`.
