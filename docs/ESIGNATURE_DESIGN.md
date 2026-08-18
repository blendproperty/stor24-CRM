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

> **18 Aug 2026 — Brett flagged v1 as insufficient.** The typed-name + single-checkbox flow below is a
> mechanism for capturing *a* signature and audit trail, but is not yet a real, bindable agreement. See
> "Outstanding before this is done" below — real agreement text with per-clause initials is required
> before this feature can be relied on for actual tenants.

## What "signed" means here (v1 — see gaps below)

At `moveIn()`, the system renders lease text from the tenancy's own data (facility, unit, customer,
rate, start date), hashes it (SHA-256), and stores the rendered text + hash + signer identity in a new
`Document` row, all inside the same DB transaction as the tenancy creation. The signer types their full
legal name into the move-in form and ticks an explicit acceptance checkbox; both are required fields
(`signerName`, `leaseAccepted: true`) enforced by the `moveInSchema` zod validator — move-in fails with
`422 VALIDATION_ERROR` if either is missing.

Audit trail captured per signature:

- `signerName` — typed full name (from the form)
- `signerIp` — from `x-forwarded-for`, read server-side from the request, never trusted from the client body
- `signerUserAgent` — from the `user-agent` header, same treatment
- `signedAt` — server timestamp
- `content` — the exact lease text shown to the signer
- `sha256` — hash of `content`, so any future edit to rendered lease text is detectable against historical signatures

## Outstanding before this is done (blocking, added 18 Aug 2026)

Brett's instruction: there needs to be an actual agreement **initialled and signed** by a prospective
unit tenant — not just a typed name against a short on-screen summary. Required before this feature can
be considered complete:

1. **Real agreement text.** Replace the placeholder summary produced by `renderLeaseAgreement()`
   (`src/lib/leasing-service.ts`) with the actual STOR 24 storage licence agreement — the full clause
   text (access, insurance, payment/default, termination, etc.), reviewed and approved by Brett or an
   attorney before go-live.
2. **Verbatim signer-facing view.** The signer must see the real, full agreement text before signing —
   not a summary. This absorbs the previously-separate "no signer-facing document viewer" gap below.
3. **Per-clause initials, not just a single signature.** The customer should affirmatively initial each
   substantive clause (not only tick one box and type a name once) before the final signature at the
   end of the document.
4. **Audit trail granularity.** Once initials are per-clause, decide whether one whole-document
   `sha256` is still sufficient evidence, or whether each initialled clause needs its own captured
   hash/timestamp.

This is a data-model and UI change beyond v1 (likely: a structured clause list instead of one
`content` string, and an `initials` record per clause per signature) — not a small tweak to the
existing typed-name flow.

## Data model

`Document` (existing model, extended additively — migration `20260818120000_lease_esignature`):

```
model Document {
  id              String    @id @default(cuid())
  tenancyId       String
  tenancy         Tenancy   @relation(fields: [tenancyId], references: [id], onDelete: Cascade)
  type            String    // "LEASE_AGREEMENT" for this flow
  storageKey      String    // "inline" for v1 — see Known gaps
  content         String?   // rendered lease text (new)
  sha256          String?   // hash of content (new)
  signerName      String?   // new
  signerIp        String?   // new
  signerUserAgent String?   // new
  signedAt        DateTime?
  createdAt       DateTime  @default(now())
}
```

All four new columns are nullable — additive to existing rows, no backfill required. This model will
likely need further extension (or a companion `DocumentInitial`-style table) once per-clause initials
are built — see "Outstanding before this is done" above.

## Code touched (v1)

- `src/lib/leasing-service.ts` — `renderLeaseAgreement()` (template-literal lease text) and
  `hashDocument()` (SHA-256 via Node's built-in `crypto`); `moveIn()` now requires `signerName` and
  creates the `Document` row inside its transaction.
- `src/lib/validators.ts` — `moveInSchema` gained `signerName` (2–120 chars) and
  `leaseAccepted: z.literal(true)`.
- `src/app/api/v1/leasing/workflows/[action]/route.ts` — for the `move-in` action, merges
  `signerIp`/`signerUserAgent` from request headers into the validated input before calling `moveIn()`.
- `src/app/actions/leasing.ts` — `moveInAction` (server action used by the move-in page) does the
  same header capture via `next/headers`.
- `src/components/move-in-workspace.tsx` — step 2 of the move-in form gained a "Lease agreement"
  section: rendered summary, required typed-name field, required acceptance checkbox. "Complete
  move-in" is disabled client-side until both are filled in (server-side validation is the real gate).

## Known gaps / fast-follows

- **No PDF rendering or durable file storage yet.** `storageKey` is set to the literal `"inline"` and
  the full lease text lives in `content` (Postgres `TEXT`). A fast-follow should render this to PDF and
  store it in real object storage (with `storageKey` pointing at it), keeping `content`/`sha256` as the
  source of truth for what was actually signed.
- **Lease legal text is placeholder boilerplate — now a blocking item, see above, not just a fast-follow.**
- **No signer-facing verbatim document viewer — now a blocking item, see above, not just a fast-follow.**
- **No re-signature/amendment flow.** Transfers and rate changes do not currently re-trigger a signed
  document. Out of scope for v1 per Brett's "blocking step inside move-in" instruction.
