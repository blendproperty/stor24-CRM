# Reporting and integration foundation

This workstream implements a safe cloud foundation without connecting a live vendor. It intentionally distinguishes a compiled feature, a configured connection and a verified external success.

## Reporting

- `src/lib/reporting.ts` is the governed catalogue and parameter contract.
- `/api/v1/reports` returns only definitions allowed for the signed-in role.
- `/api/v1/reports/export` validates date range, format and report permission, then requires `reports.export`.
- Current export rows are synthetic and carry `x-stor24-data-classification: synthetic-demo`.
- `ReportSchedule` and `ReportRun` preserve requested parameters, the permission required at creation time, run status, row count, storage reference and explicit failure details.
- A future worker must re-check the schedule owner's current permissions and facility scope at execution time. Stored permission text is audit context, not authorisation by itself.

## Communications

Templates are organisation-scoped and versioned. Delivery logs store a recipient hash, not the address/number, and include idempotency, provider reference and failure timestamps. Creating templates does not enable sending: an approved email/SMS provider, verified sender, consent/suppression rules and retention policy are still required.

## Webhooks and idempotency

Inbound events require source, event ID, event type, organisation ID and a preconfigured SHA-256 webhook-key hash. The unique `(organisationId, provider, externalEventId)` constraint makes retries deterministic. The example authentication boundary is suitable as a foundation but production sources should use per-connection secrets or provider-native signatures with rotation.

Outbound events use a transactional outbox record. Business workflows should insert the domain change and outbox record in the same database transaction. A worker may claim pending rows, increment attempts, use exponential backoff, and move exhausted rows to `DEAD_LETTER`; failures must never be reported as delivery success.

## Provider adapters

`src/lib/integrations/providers.ts` defines narrow contracts for:

- tokenised payments;
- occupancy-driven access-control commands;
- email and SMS;
- accounting close exports;
- website-lead acknowledgements.

`ConfigurationRequiredProvider` is the safe default. It returns `CONFIG_REQUIRED` and never simulates a successful health check.

## Configuration checklist

1. Select vendors and complete security/commercial review.
2. Store credentials in the approved secret manager; never in `IntegrationConnection.config` or Git.
3. Add provider-specific signature verification and contract tests.
4. Map each facility and accounting code explicitly.
5. Run a sandbox health check and retain the result timestamp.
6. Exercise duplicate inbound events and outbound retry/dead-letter paths.
7. Verify a fresh website lead with a unique external ID and confirm source attribution.
8. Enable schedules or communications only after recipient, consent and retention controls are approved.

## Operational signals

Connection state, last health check, last success/failure, failure code/message, consecutive failures, backlog, retry time, attempts, response status and dead-letter counts are first-class fields. Alert thresholds and a worker runtime remain deployment-specific and are not enabled by this branch.
