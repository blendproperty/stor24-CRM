# Operations and company setup

This workstream replaces the presentation-only Operations, Company, Facility Map and Phone pages with persisted, permission-checked foundations derived from the captured SiteLink evidence.

## Included domains

- Operational tasks and facility work queues with assignment, priority, due date and completion audit.
- Unit notes and maintenance/service requests.
- Merchandise products, reorder thresholds and atomic stock movements.
- End-of-day checks, cash reconciliation, variance and closed-period records.
- Organisation/facility setup profiles, program defaults and tenant defaults.
- Existing role/security-level and employee administration, with permissions extended for operations.
- Charge definitions and discount plans.
- Banking/accounting, marketing, price optimiser and facility-map configuration profiles.
- Marketplace and phone integration shells with explicit status and last-health timestamps.

## API boundaries

- `GET /api/v1/operations` returns scoped tasks, notes, maintenance, stock and daily closes.
- `POST /api/v1/operations` accepts `task`, `unitNote`, `maintenance`, `product`, `stockMovement` or `dailyClose`.
- `PATCH /api/v1/operations/tasks/:id` changes task state after an organisation-scope lookup.
- `GET /api/v1/configuration` returns profiles, connectors, charges, discounts, facilities, roles and employees.
- `PUT /api/v1/configuration` accepts `profile`, `integration`, `charge` or `discount`.

All mutations authenticate the session, resolve the user's organisation from the database, evaluate role permissions, validate payloads with Zod and append an `AuditEvent`. Client-supplied organisation identifiers are never trusted.

## Connector safety

The integration model is a configuration shell, not a live adapter. The public schema permits only `DISCONNECTED`, `CONFIGURED` and `DISABLED`; it intentionally cannot claim `CONNECTED`. Config accepts only a non-secret endpoint, account reference and notes. Provider credentials belong in an approved secret manager and a future server-side adapter.

The Phone page reports a connector as verified only when a separately managed record is `CONNECTED` and has `lastHealthAt`. This branch does not create those records or perform external health checks.

## Migration and integration

Apply `20260805070000_operations_setup` after the existing migrations:

```bash
npm run db:generate
npm run db:migrate:deploy
```

The migration is additive. After merging parallel workstreams, regenerate Prisma from the combined schema. If another branch also expands `User`, `Facility`, `Unit` or `Organisation`, preserve all independent reverse relation fields.

## Verification

```bash
npm run test
npm run db:validate
npm run typecheck
npm run lint
npm run build
```

Tests cover wildcard permission matching, refusal of false live connector status, rejection of arbitrary secret fields and non-zero stock movements.
