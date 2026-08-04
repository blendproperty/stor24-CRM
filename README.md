# Stor24 CRM

Cloud-first self-storage operations platform for Stor24, scaffolded from the observed SiteLink workflows and the product blueprint in [`docs/SITELINK_CLOUD_SOLUTION_ANALYSIS.md`](docs/SITELINK_CLOUD_SOLUTION_ANALYSIS.md).

## Included in this scaffold

- Next.js App Router, React, TypeScript and Tailwind CSS
- Responsive Stor24 operations shell
- Dashboard, tenants, lead-to-lease, units, billing, collections, operations, adjustments, company setup, reports, graphs, calendar, proration, facility map, phone integration and settings routes
- Guided move-in workflow shell
- Interactive status-coloured facility map derived from the observed SiteLink map
- Evidence-backed catalogue covering Program Defaults, security, marketing and all thirteen Marketplace sections
- Versioned lead API with Zod validation
- Health endpoint
- PostgreSQL/Prisma domain model
- Multi-organisation and facility scoping
- Tenant lifecycle, financial ledger, payments, tasking, integrations, RBAC and audit entities
- Database-backed authentication, user administration, invitations, RBAC and security audit events
- Docker standalone production image and VPS Compose configuration
- GitHub Actions validation workflow

## Run locally

```bash
npm install
Copy-Item .env.example .env
npm run db:validate
npm run dev
```

Open `http://localhost:3000`.

Authentication and user administration use PostgreSQL through Prisma. Other operational modules still contain synthetic scaffold data and must not be treated as production records.

## Authentication and email

Apply migrations before starting the updated application. `AUTH_SECRET` must contain at least 32 random characters. Account recovery uses hashed, 30-minute, single-use tokens and never returns whether an account exists. Configure `EMAIL_PROVIDER=resend`, `EMAIL_FROM`, and `RESEND_API_KEY` for delivery; provider credentials remain server-only. Password changes and resets increment `sessionVersion`, invalidating every existing session for that user.

See [`docs/OWNER_RECOVERY_RUNBOOK.md`](docs/OWNER_RECOVERY_RUNBOOK.md) for the controlled owner-recovery procedure. Do not place reset or bootstrap tokens in tickets, logs, screenshots, or source control.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
npm run db:validate
```

## Evidence

[`docs/EVIDENCE_TO_BUILD_MATRIX.md`](docs/EVIDENCE_TO_BUILD_MATRIX.md) maps the curated SiteLink screenshots and supplied manuals to each scaffolded route and module. Source screenshots remain local and are ignored by Git because they are research evidence, not public application assets.

## VPS

[`docs/VPS_DEPLOYMENT.md`](docs/VPS_DEPLOYMENT.md) contains the safe Docker deployment and update runbook. The application binds to `127.0.0.1:3014` by default so the VPS reverse proxy can provide the approved hostname and TLS.

## API scaffold

- `GET /api/health`
- `GET /api/v1/leads`
- `POST /api/v1/leads`

Example lead payload:

```json
{
  "firstName": "Synthetic",
  "lastName": "Customer",
  "email": "synthetic@example.test",
  "phone": "+27 10 000 0000",
  "facilityId": "demo-facility",
  "source": "Website",
  "notes": "Synthetic development data"
}
```

Route handlers are security boundaries. Protected handlers must call `requirePermission` or `requireSession`; Proxy redirects are an optimistic user-experience check only.

## Architecture

The scaffold follows a modular-monolith path:

- `src/app` — UI routes and versioned route handlers
- `src/components` — shared presentation and navigation
- `src/lib` — validation, demo repositories and domain helpers
- `prisma/schema.prisma` — canonical transactional model
- `docs` — product analysis and architecture decisions

Recommended next implementation slices:

1. Auth.js or an enterprise OIDC provider with MFA and scoped RBAC.
2. Repository layer backed by Prisma and PostgreSQL.
3. Transactional lead/reservation/move-in service.
4. Immutable subledger and payment-provider adapter.
5. Access-control command outbox and reconciliation worker.
6. Test suite, seeded synthetic database and CI pipeline.

## Safety boundaries

- Never commit `.env` or provider secrets.
- Store payment provider tokens only; never store PAN or CVV.
- Do not connect to SiteLink customer data without approved exports or licensed API access.
- Use an explicit allowlist when staging production configuration or migration files.
