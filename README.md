# Stor24 CRM

Cloud-first self-storage operations platform for Stor24, scaffolded from the observed SiteLink workflows and the product blueprint in [`docs/SITELINK_CLOUD_SOLUTION_ANALYSIS.md`](docs/SITELINK_CLOUD_SOLUTION_ANALYSIS.md).

## Included in this scaffold

- Next.js App Router, React, TypeScript and Tailwind CSS
- Responsive Stor24 operations shell
- Dashboard, tenants, lead-to-lease, units, billing, collections, operations, reports and settings routes
- Guided move-in workflow shell
- Versioned lead API with Zod validation
- Health endpoint
- PostgreSQL/Prisma domain model
- Multi-organisation and facility scoping
- Tenant lifecycle, financial ledger, payments, tasking, integrations, RBAC and audit entities
- Synthetic demo data only

## Run locally

```bash
npm install
Copy-Item .env.example .env
npm run db:validate
npm run dev
```

Open `http://localhost:3000`.

The current UI uses synthetic in-memory data so it runs before a database is connected. Prisma is the intended persistence boundary. Do not use customer data until authentication, authorisation, encryption, retention and audit controls have been implemented and reviewed.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
npm run db:validate
```

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

Route handlers are public HTTP boundaries. Authentication, facility-scoped authorisation, rate limiting, audit logging and idempotency must be added before production use.

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
