# STOR 24 CRM and Operations Platform — Project Context

> Last reviewed: 17 August 2026. Read this file before planning or changing the repository. Update it whenever a material capability, decision, deployment state, or cross-repository contract changes.

## Product identity and non-negotiable boundary

This is **STOR 24**, not SiteLink. It is a purpose-built CRM, operations, leasing, reservation, reporting and integration platform. Other products supplied research evidence only and must not appear as the product identity.

Official CI is documented in `docs/STOR24_BRAND_CI.md`. Use the approved logo files in `public/brand/`, ink `#071411`, cream `#F5F3EA`, orange `#FF5A0A`, and Satoshi typography.

## Repository role

This repository is the internal STOR 24 CRM and operations portal. Despite the GitHub repository name `stor24-portal`, it is not the public marketing website. It owns staff-facing operational truth and exposes a narrowly sanitised public-booking API to the website.

- Repository: `blendproperty/stor24-portal`
- Primary branch: verify against remote before work; local branch at review was `codex/fix-facility-patch-validation`
- Stack: Next.js 16, React 19, TypeScript, Prisma 7 and PostgreSQL
- Canonical transactional schema: `prisma/schema.prisma`
- Architecture: multi-organisation, multi-facility modular monolith

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
- MRI Property Central is the proposed finance system of record, subject to business approval. The connector, master-data mapping, transaction ownership, reconciliation, exception handling, sandbox access and acceptance evidence are not complete.
- South African payment/debit-order provider selection and implementation are outstanding. Do not assume MRI RentPayment is the local solution.
- Hikvision access control, communications providers, e-signature, insurance and other external providers require selection, credentials, implementation and end-to-end proof.
- Migration, production data validation, UAT, training, support ownership, monitoring and go-live readiness remain gated work.
- Operational policies—including onboarding evidence, arrears, move-in, access, insurance and move-out—must be confirmed by accountable business owners rather than inferred.

## Current status and evidence limits

- Local repository was clean on `codex/fix-facility-patch-validation` when this file was created.
- Recent work fixed public-booking setup persistence, partial facility updates and secured public-booking routing.
- Health and unauthenticated-security checks were previously demonstrated, but current production configuration must be reverified before reporting it as live.
- The public website previously returned HTTP 404 for `/book`; CRM health alone does not prove the customer journey.
- Do not claim providers, finance sync or customer lifecycle automation are operational without current configuration plus end-to-end evidence.

## Finance and MRI design boundary

Proposed responsibility split:

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

This remains a proposed architecture until owners approve system responsibilities, mappings, timing, reconciliation controls and exception ownership.

## Cross-repository contract

- Public portal: consumes `/api/public/v1/...` through a server-side proxy. Keep the public response allowlisted and backward compatible.
- CMS: owns approved content/media, not operational records, booking inventory, ledgers or provider credentials.
- CRM: remains authoritative for operational availability, leads, reservations and staff workflows unless an approved architecture decision changes this.

Coordinate API/schema changes across all three repositories. Never silently duplicate ownership.

## Priority next work

1. Merge or close the current facility-validation branch after reviewing its exact diff and checks.
2. Reverify public-booking configuration and the deployed API contract.
3. With explicit approval, prove the complete public reserve/cancel lifecycle and record evidence.
4. Close the MRI decision pack: system ownership, mapping, posting model, reconciliation, exception owner and sandbox access.
5. Select and implement payment, access, communication, e-signature and insurance providers through the existing provider boundaries.
6. Replace remaining scaffold/demo repositories with scoped database-backed behaviour.
7. Complete migration planning, UAT, training, monitoring, recovery and production readiness gates.

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

## Definition of done

A CRM capability is complete only when it is database-backed, scoped, permission-enforced, audited, tested, operationally owned and—where an external provider or deployment is involved—configured and proven end to end with reconciliation and exception handling.
