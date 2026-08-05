# Leasing core

The leasing core is database-backed and derives organisation/facility access from the authenticated user's current role assignments. Client payloads never select an organisation.

## Schema and lifecycle

- `Facility -> UnitType -> Unit` models rentable inventory.
- `Customer` is organisation-owned and may have leads, reservations and tenancies.
- Reservation atomically changes an available unit to `RESERVED`.
- Move-in atomically creates the account, active tenancy and occupancy, optional opening charge, reservation conversion, unit status and audit event.
- Transfer closes and revokes the current occupancy, releases its unit, and opens the replacement occupancy.
- Notice records notice/planned end dates and transitions active occupancy to `NOTICE_GIVEN`.
- Move-out closes occupancies and tenancy, revokes access, releases units, and may add a final ledger charge.
- Every lifecycle command writes an `AuditEvent` in the same transaction as its domain changes.

## API

All endpoints require the secure session cookie.

- `GET /api/v1/leasing` returns the scoped leasing workspace.
- `GET|POST|PATCH|DELETE /api/v1/leasing/{facilities|unit-types|units|customers|leads|reservations}` provides scoped CRUD. Facility and unit deletion are safe state transitions where history matters.
- `POST /api/v1/leasing/workflows/{move-in|transfer|notice|move-out}` executes validated transactional commands.
- `GET|POST /api/v1/leads` remains as a compatibility API, now database-backed and scoped.

Invalid input returns `422`; cross-facility access returns `403`; unavailable inventory/lifecycle conflicts return `409`.

## UI integration

`/units`, `/leads`, `/tenants`, and `/operations/move-in` are async server-rendered workspaces backed by Prisma. Forms use validated server actions and revalidate their owning route after mutation.

## Demo data boundary

Run `npm run db:seed:demo` only with `ALLOW_SYNTHETIC_DEMO_SEED=true` and a non-production `NODE_ENV`. The seed refuses production and uses `.example.test` contacts and a `synthetic-demo` organisation. It is never run automatically by migrations or deployment.
