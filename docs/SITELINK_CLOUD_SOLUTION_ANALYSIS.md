# SiteLink Web Edition Analysis and Cloud Solution Blueprint

Date: 29 July 2026  
Observed build: SiteLink Web Edition 25.2.0.0, updated successfully through SiteLink LiveUpdate 2.0.2.6  
Environment: SiteLink `DEMO / DEMO` only; no live customer data used

## 1. Executive summary

SiteLink is a mature self-storage property-management platform centred on the tenant and unit lifecycle. Its operational core combines availability and rentals, tenant accounts, recurring billing, collections, payments, access control, merchandise, daily close, reporting, CRM, reminders, and multi-site administration.

The installed Windows client is not a purely local system. It is a rich desktop client backed by SiteLink-hosted services: the login downloads current facility data, SiteLink publicly describes centrally hosted data and APIs, and separate service-status components exist for Web Edition, servers, APIs, payments, Corporate Control Center, myHub, websites, access control, and SSO.

A modern replacement should therefore be designed as a multi-tenant cloud platform with an API-first transactional core, not as a browser copy of individual SiteLink screens. The best MVP boundary is:

1. facility, unit and rate management;
2. leads, reservations and move-ins;
3. tenant accounts, agreements and documents;
4. charges, invoices, payments and autopay;
5. delinquency, collections and access-state automation;
6. move-outs and transfers;
7. daily reconciliation and core reports;
8. roles, audit history and integration webhooks.

## 2. Evidence classification

- **Observed**: directly visible in the installed DEMO environment.
- **Officially corroborated**: confirmed by SiteLink/Storable product, support, status, API or marketplace material.
- **Proposed**: recommended behavior or architecture for the new cloud solution; not asserted as existing SiteLink behavior.

## 3. Observable feature inventory

### 3.1 Main navigation and operating dashboard

Directly observed:

- Primary sections: Operations, Adjustments, Company, Reports, Graphs, Calendar, Prorate Calculator, Map and Phone Integration.
- Top-level areas: StorageForum, Setup, Languages, Tools and Help.
- Facility context and connectivity status in the footer.
- A launch-time calendar, bulletin board and reminders workspace.
- A notification that a newer silent build may be available.

The reminders panel exposes operational queues with counts:

- Bulletin Board
- Reminders
- Call Past Dues
- Reorder
- Invoice
- Credit Cards
- Expired Credit Cards
- ACH Get Returns
- Move-out
- Overlock
- Cut the Lock
- Refunds Due
- Service Required

Cloud requirement:

- Role-aware home dashboard.
- Configurable operational work queues.
- Counts, ageing, ownership, priority, due dates and drill-down.
- Personal and facility-wide reminders.
- Real-time service/integration health without requiring a desktop updater.

### 3.2 Accounts and occupancy lifecycle

Directly observed:

- Move In
- Payments
- Transfer
- Move Out

Cloud workflow coverage:

- enquiry or walk-in;
- unit search and quote;
- lead or reservation;
- identity and contact capture;
- unit selection;
- rate, deposit, discount, tax and insurance/protection selection;
- agreement generation and signature;
- payment and recurring-payment mandate;
- access credentials;
- occupancy activation;
- transfer between units or facilities;
- notice and scheduled move-out;
- final charges, refund, access revocation and unit turn.

### 3.3 Customers and CRM

Directly observed:

- Tenants
- Lead to Lease
- Customer Relationship Management
- Access

Cloud requirement:

- One customer profile may represent an individual or organisation.
- A customer may have multiple contacts, leads, reservations, tenancies, units and payment methods.
- Timeline should unify calls, emails, SMS, notes, documents, payments, access events, tasks and status changes.
- Lead stages should be configurable, with source, campaign, desired unit, budget, probability, next action and loss reason.
- Duplicate detection and merge controls are essential.

### 3.4 Billing and payments

Directly observed:

- Invoice
- Credit Cards
- ACH Bank Debit
- Payments
- Expired-card, ACH-return, invoice and refund reminder queues.

Cloud requirement:

- Account ledger with immutable posted entries and reversals.
- One-off and recurring charges.
- Invoices, statements, receipts, credit notes and refunds.
- Card and bank-debit mandates represented by provider tokens only.
- Scheduled autopay runs, retries and exception queues.
- Allocation of payments and credits across charges.
- Tax configuration by facility and charge type.
- Cash, card, EFT/bank debit and configurable tender support.
- PCI scope minimised through hosted/tokenised payment fields.

### 3.5 Collections

Directly observed:

- Collection Calls
- Tasks & Letters
- Call Past Dues
- Overlock
- Cut the Lock

Cloud requirement:

- Configurable delinquency stages based on balance, ageing, due date and jurisdiction.
- Actions may create tasks, send notices, add fees, suspend access, overlock a unit, prepare lien/auction steps or escalate for approval.
- Promise-to-pay tracking and contact outcomes.
- Legal holds and manual exceptions.
- Full evidence trail of notice content, delivery channel, timestamps and actor.

### 3.6 Access control

Directly observed:

- Dedicated Access function.

Officially corroborated:

- SiteLink supports embedded/cloud access integrations.
- Published examples include creating and changing access codes, delinquency lockout, move-in activation, move-out revocation and tenant/unit transfer updates.

Cloud requirement:

- Vendor-neutral access adapter.
- Access credentials linked to people and occupancies, not stored as plain-text secrets where avoidable.
- Commands and resulting device/vendor state logged separately.
- Eventual-consistency handling, retry queue and reconciliation.
- Never allow an access-provider outage to corrupt the tenancy or ledger.

### 3.7 Merchandise and inventory

Directly observed:

- Merchandise Purchase
- Reorder reminder queue.

Cloud requirement:

- Products, categories, SKU/barcode, tax, cost, selling price and stock on hand.
- Stock receipts, adjustments, sales, returns and reorder thresholds.
- Merchandise purchases posted to the same customer/payment transaction model.

### 3.8 End of day and audit

Directly observed:

- Daily Close
- Receipt Audit

Cloud requirement:

- Tender reconciliation by till/user/facility.
- Expected versus counted cash.
- Payment-provider settlement comparison.
- Exceptions, approvals and explanatory notes.
- Close periods rather than altering historical transactions.
- Reopen only under privileged approval with a permanent audit record.

### 3.9 Reporting and analytics

Directly observed:

- Reports
- Graphs

Officially corroborated:

- SiteLink material describes single-site and consolidated reports.
- Community/support material identifies tenant, unit, merchandise, deposit, insurance and financial report groupings.
- Accounting export/interface functionality exists for selected packages.

Recommended report catalogue:

- Occupancy by unit count and rentable area
- Available units and availability forecast
- Move-ins, move-outs, transfers and net rentals
- Leads, conversion, source and lost reasons
- Scheduled versus achieved rent
- Discounts and concessions
- Rent roll and tenant ledger
- Receivables ageing and delinquency
- Collections performance
- Payments by tender and refunds
- Daily close and deposit reconciliation
- Autopay success, declines and retries
- Insurance/protection-plan participation
- Merchandise sales, margin and reorder
- Access exceptions
- Unit turns and maintenance/service requirements
- Revenue, occupancy and rate trends
- Multi-facility portfolio comparisons

### 3.10 Administration and configuration

Directly observed:

- Setup
- Company
- Adjustments
- Languages
- Tools

Cloud configuration domains:

- organisation, regions, facilities and operating hours;
- buildings, floors, zones, unit types and units;
- rate plans, taxes, deposits, fees, discounts and promotions;
- agreement, notice, invoice and receipt templates;
- insurance/protection providers and rules;
- payment gateways and merchant accounts;
- access-control providers;
- communications providers;
- lead sources and campaigns;
- collections policies;
- accounting mappings;
- numbering sequences;
- localisation, currency, date/time and language;
- users, roles, approvals and report access.

## 4. End-to-end workflows

### 4.1 Lead to lease

1. Capture enquiry and desired unit attributes.
2. Search real-time availability.
3. Quote rate, fees, taxes, deposit and protection options.
4. Create a time-limited hold or reservation.
5. Record follow-up tasks and communications.
6. Convert to move-in without re-keying customer or unit data.
7. Take payment, tokenise recurring method, sign documents and provision access.
8. Emit occupancy, ledger, access and analytics events.

### 4.2 Walk-in move-in

1. Identify or create customer.
2. Select available unit.
3. Validate unit is still rentable under a short transaction lock.
4. Apply rate plan and authorised promotion.
5. Capture required identification, emergency contact and protection choice.
6. Generate agreement.
7. Collect initial payment.
8. Activate occupancy and access.
9. Send agreement and receipt.

### 4.3 Payment

1. Open customer account and calculate current balance.
2. Select charges or use allocation rules.
3. Submit tokenised payment to provider.
4. On success, post immutable payment and allocation entries.
5. Generate receipt.
6. Re-evaluate delinquency and access state.
7. On failure, record reason and create retry/follow-up task.

### 4.4 Recurring billing

1. Generate scheduled charges idempotently.
2. Produce invoices/statements.
3. Select eligible payment mandates.
4. Run provider jobs in batches.
5. Post successes and categorise failures.
6. Retry according to policy.
7. Start or progress collections when balances age.

### 4.5 Transfer

1. Select source occupancy and target unit.
2. Reserve target during transaction.
3. Calculate prorated credit and new charges.
4. Create replacement/addendum agreement.
5. Move financial responsibility without losing ledger history.
6. Update access permissions.
7. Close source occupancy and activate target occupancy atomically.

### 4.6 Move-out

1. Capture notice and intended date.
2. Calculate final charges, credits and refundable deposit.
3. Confirm unit condition and outstanding items.
4. Revoke access.
5. Close occupancy.
6. Create refund or remaining receivable.
7. Place unit into cleaning/service/available state.

### 4.7 Collections

1. Daily ageing evaluates open balances.
2. Policy engine assigns delinquency stage.
3. Stage actions create communications, fees, tasks and access restrictions.
4. Staff record contact attempt and outcome.
5. Payment or approved arrangement can automatically restore access.
6. Escalation steps require evidence and jurisdiction-specific checks.

### 4.8 Daily close

1. Freeze reporting cut-off.
2. Aggregate tender and operator totals.
3. Reconcile cash and provider settlements.
4. Resolve or explain exceptions.
5. Approve close.
6. Export accounting batch and lock period.

## 5. Proposed data model

### 5.1 Tenancy and organisational scope

- `organisation`
- `region`
- `facility`
- `building`
- `floor_or_zone`
- `unit_type`
- `unit`
- `unit_status_history`
- `rate_plan`
- `unit_rate`

Each business table carries `organisation_id`; facility-bound records also carry `facility_id`. Database-enforced tenant scoping is required.

### 5.2 Customer and sales

- `customer`
- `customer_contact`
- `address`
- `identity_reference`
- `lead`
- `lead_activity`
- `quote`
- `reservation`
- `promotion`
- `lead_source`

### 5.3 Occupancy

- `tenancy`
- `tenancy_party`
- `occupancy`
- `occupancy_status_history`
- `move_in`
- `move_out_notice`
- `move_out`
- `transfer`
- `agreement`
- `document`
- `signature_envelope`
- `protection_selection`

Separate `tenancy` from `occupancy`: one tenancy/account can cover one or more unit occupancies and can survive a transfer.

### 5.4 Finance

- `account`
- `ledger_entry`
- `charge`
- `invoice`
- `invoice_line`
- `credit`
- `payment`
- `payment_allocation`
- `refund`
- `payment_method_token`
- `payment_mandate`
- `autopay_schedule`
- `payment_attempt`
- `tax_code`
- `daily_close`
- `reconciliation_item`
- `accounting_export_batch`

Use double-entry accounting principles or, at minimum, an immutable balanced subledger. Corrections are reversals plus replacement entries.

### 5.5 Collections and work management

- `collections_policy`
- `delinquency_case`
- `delinquency_stage`
- `collection_action`
- `promise_to_pay`
- `task`
- `reminder`
- `communication`
- `communication_template`
- `bulletin`

### 5.6 Access and integrations

- `access_credential`
- `access_permission`
- `access_command`
- `access_event`
- `integration_connection`
- `integration_mapping`
- `webhook_subscription`
- `webhook_delivery`
- `external_reference`
- `integration_job`

### 5.7 Stock and facilities

- `product`
- `inventory_location`
- `stock_movement`
- `purchase_order`
- `service_requirement`
- `unit_turn`

### 5.8 Security and governance

- `user`
- `role`
- `permission`
- `user_role_scope`
- `approval_request`
- `audit_event`
- `session`
- `data_retention_policy`

## 6. Permissions model

Use role-based access control plus scope and approval thresholds.

Recommended roles:

- Organisation Owner
- Corporate Administrator
- Regional Manager
- Facility Manager
- Assistant Manager
- Sales/Leasing
- Collections
- Finance
- Auditor/Read Only
- Integration Service Account

Permission domains:

- facility and portfolio visibility;
- view/edit customer personally identifiable information;
- create or cancel reservation;
- move in, transfer and move out;
- override rate or promotion;
- post charge, payment, credit, write-off or refund;
- manage recurring-payment mandate;
- run collections actions;
- suspend or restore access;
- perform or reopen daily close;
- view financial reports;
- export customer or financial data;
- configure templates, integrations and policies;
- manage users and roles.

Controls:

- A user can hold different roles at different facilities.
- Sensitive actions carry amount/rate thresholds.
- Refunds, write-offs, rate overrides, period reopening and bulk exports can require approval.
- Report permissions are independent of operational screen permissions.
- Service accounts receive narrowly scoped API permissions and expiry/rotation policies.
- Every privilege or role change is audited.

## 7. Integrations

### 7.1 Required adapter categories

- payment gateways and merchant acquiring;
- bank debit/ACH;
- access control;
- email, SMS and telephony;
- electronic signature;
- websites, online reservations/rentals and tenant portal;
- insurance/protection plans;
- accounting/ERP;
- identity/address verification;
- data warehouse/business intelligence;
- call centre/CRM;
- kiosks and marketplaces.

### 7.2 API design

- Versioned REST or GraphQL command/query APIs.
- Idempotency keys on all money, reservation, move-in and access commands.
- Signed outbound webhooks with replay protection.
- Cursor pagination and incremental sync timestamps.
- Stable external IDs and mapping tables.
- Per-tenant rate limits and observability.
- Sandbox tenants with synthetic data.
- Bulk reporting through asynchronous export jobs, not repeated transactional calls.

Important constraint:

SiteLink's published API licence includes contractual usage limits and restrictions, including facility polling intervals, daily call caps, overnight report windows, authorised corporate codes and restrictions on replicating the essential SiteLink experience. Any migration or coexistence plan must obtain explicit commercial/API permission and should not assume unrestricted extraction.

## 8. Proposed cloud architecture

### 8.1 Logical components

- Web application and responsive staff UI
- Customer portal/online rental UI
- API gateway
- Identity and access service
- Facility/unit/rate service
- CRM/leads service
- Tenancy/occupancy service
- Billing and ledger service
- Payments orchestration service
- Collections policy engine
- Documents/e-signature service
- Access-control orchestration service
- Inventory service
- Reporting/read-model service
- Notification service
- Integration gateway
- Audit service

### 8.2 Recommended implementation shape

Start as a modular monolith with strong domain boundaries, one transactional relational database, a job queue and an event outbox. Split services only when scale, security isolation or team ownership justifies it.

Core platform:

- Managed PostgreSQL with point-in-time recovery and row-level tenant controls.
- Object storage for signed documents and generated reports.
- Redis or managed queue for short-lived locks, jobs and caching.
- Transactional outbox feeding a durable event bus.
- Search index for fast customer, unit and document lookup.
- Columnar warehouse or replicated reporting database for analytics.
- OpenTelemetry-compatible traces, logs and metrics.

### 8.3 Availability and security

- Multi-availability-zone database and stateless application nodes.
- Facility-aware degraded mode for critical lookup if WAN service is impaired.
- Encryption in transit and at rest.
- Secrets in managed vaults.
- SSO/MFA for staff.
- Short-lived sessions and conditional access.
- Tokenised payment data; never store raw PAN/CVV.
- Fine-grained audit trail and export monitoring.
- Tested backup restore and disaster-recovery runbooks.
- Data residency, retention and deletion policies aligned to operating jurisdictions.

## 9. MVP roadmap

### Phase 0: discovery and controls (2–4 weeks)

- Confirm target countries, tax rules, payment providers and access vendors.
- Inventory SiteLink reports and exports actually used by Blend.
- Define source-of-truth and migration/coexistence permissions.
- Approve canonical data model and role matrix.
- Create synthetic test facility and acceptance scenarios.

### Phase 1: operational foundation (6–8 weeks)

- Organisation/facility/unit/rate configuration.
- Users, roles, facility scope and audit.
- Customer, lead, quote, reservation and availability.
- Basic dashboards and reminders.

Exit criterion: staff can manage inventory and convert a lead to a held reservation.

### Phase 2: tenancy and money (8–10 weeks)

- Move-in, agreement generation and occupancy.
- Charges, invoices, account ledger, payments and receipts.
- Payment-token integration and autopay.
- Core tenant/unit/occupancy/financial reports.

Exit criterion: a synthetic tenant can complete move-in and a fully reconciled payment lifecycle.

### Phase 3: lifecycle and control (6–8 weeks)

- Transfers and move-outs.
- Delinquency stages, collection tasks/notices and promises to pay.
- Access-control adapter and reconciliation.
- Refunds and daily close.

Exit criterion: complete happy-path and exception-path tenant lifecycle.

### Phase 4: digital channels and integrations (6–10 weeks)

- Online rental and tenant self-service.
- E-signature.
- Email/SMS.
- Accounting export.
- Webhooks and partner API.
- Portfolio dashboards.

### Phase 5: migration and rollout (4–8 weeks)

- Rehearsed imports using approved exports/API access.
- Parallel reporting and ledger reconciliation.
- Pilot facility, measured rollback window and staged portfolio rollout.
- Staff training and support runbook.

## 10. Gap matrix

| Capability | SiteLink evidence | Cloud target | Gap / priority |
|---|---|---|---|
| Desktop operating client | Observed Windows rich client | Responsive browser/PWA | High: remove installation and update dependency |
| Facility/unit operations | Core move-in/payment/transfer/move-out observed | Unified real-time workflow | MVP |
| Lead-to-lease | Observed | Pipeline, automation and conversion analytics | MVP |
| Customer CRM | Observed | Omnichannel timeline and deduplication | MVP |
| Billing and autopay | Card, ACH, invoice and payment functions observed | Tokenised orchestration and immutable ledger | MVP, high risk |
| Collections | Calls, tasks/letters, overlock and cut-lock queues observed | Configurable policy engine with legal evidence | MVP/Phase 3 |
| Access control | Observed and officially corroborated | Vendor-neutral adapters with reconciliation | Phase 3 |
| Daily close | Observed | Settlement-aware digital reconciliation | MVP/Phase 3 |
| Merchandise | Observed | Inventory and POS submodule | Phase 3 or later |
| Reports and graphs | Observed; consolidated reporting corroborated | Live dashboards plus governed exports | MVP, expand iteratively |
| Portfolio control | Corporate Control Center officially described | Native hierarchical tenancy and shared policy | High |
| Mobile/browser access | myHub officially described | Full responsive parity for authorised workflows | High |
| Integrations/API | SiteLink API and service status confirmed | First-class developer platform | High; contractual coexistence constraint |
| Accounting | Selected export interfaces corroborated | Configurable journal mappings and modern ERP adapters | Medium/high |
| Permissions | Report access and setup visibility indicated | Explicit scoped RBAC, thresholds and approvals | MVP |
| Auditability | Receipt audit/daily close observed | Immutable domain and security audit streams | MVP |
| Offline/degraded operations | Desktop client caches/downloads data | Controlled degraded read/queue mode | Later unless connectivity demands it |
| Updates | LiveUpdate downloaded client/database changes | Continuous server deployment with release controls | High operational improvement |
| Localisation | International build and Languages observed | Currency, tax, locale and template localisation | MVP if multi-country |

## 11. Key risks and decisions

1. **Data access and migration rights**: do not design a scraper or direct database copy. Obtain approved exports or licensed API access.
2. **Ledger correctness**: finance migration and reconciliation are the highest-risk workstream.
3. **Jurisdictional collections rules**: notices, fees, overlock, lien and auction steps must be configurable and legally reviewed.
4. **Payment compliance**: keep card data out of the application wherever possible.
5. **Access-control reliability**: treat access providers as eventually consistent external systems.
6. **Rate and discount governance**: preserve override reasons, approvals and historical effective dates.
7. **Multi-facility scope**: organisation/facility isolation must be foundational, not retrofitted.
8. **Report parity**: identify the small set of operational and statutory reports required for go-live; do not attempt every legacy report before the pilot.
9. **Customer-data privacy**: use synthetic data throughout development and user acceptance until controlled migration rehearsals.

## 12. Recommended next deliverables

1. Product requirements document with acceptance criteria for the eight MVP domains.
2. Entity-relationship diagram based on the proposed model.
3. Permission matrix by Blend job role and facility scope.
4. Screen inventory and clickable prototype.
5. SiteLink report/export catalogue used by Blend today.
6. Integration decision record for payments, access, messaging, e-signature and accounting.
7. Migration mapping workbook and reconciliation test pack.
8. Pilot release plan with rollback, support and data-validation checkpoints.

## 13. Sources

- Direct observation of the locally installed SiteLink DEMO environment on 29 July 2026.
- SiteLink/Storable support and service-status material.
- SiteLink smart management software brochure.
- SiteLink API Licence Agreement v2.9.
- SiteLink/StorageForum product announcements and support responses for access control and accounting interfaces.

External references:

- https://status.sitelink.com/
- https://www.storable.com/support/
- https://s3.sitelink.com/SiteLinkWebEdition/SiteLink_API_License_Agreement.pdf
- https://www.sitelink.com/downloads/sitelink-smart-management-software-brochure.pdf
- https://storageforum.sitelink.com/discussion/1938/sitelink-integrates-with-opentech-s-insomniac-cia-cloud-access-control-press-release
- https://storageforum.sitelink.com/discussion/3716/accounts-package-tie-in

