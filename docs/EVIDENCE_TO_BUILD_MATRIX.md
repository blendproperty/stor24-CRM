# Evidence-to-build matrix

This scaffold is derived from SiteLink Web Edition 25.2.0.0 DEMO observations, 132 curated screenshots (160 files including raw hover attempts), the 2006 SiteLink user manual, and the 2017 StandAlone PC Edition manual. No live customer data or credentials are used.

The local screenshots remain outside Git because they contain vendor UI and synthetic demo records. They are design evidence, not application assets.

| Observed evidence | Cloud route | Scaffold coverage |
|---|---|---|
| Main Operations dashboard and reminders | `/` | Metrics, work queues, recent activity and platform readiness |
| Move In, Payments, Transfer, Move Out | `/operations`, `/operations/move-in` | Lifecycle module map and guided move-in shell |
| Tenants, Lead to Lease and CRM prompts | `/tenants`, `/leads` | Customer and lead workspaces |
| Invoice, Cards and ACH Bank Debit | `/billing` | Billing, recurring payment, invoice, refund and close modules |
| Collection Calls, Tasks and Letters | `/collections` | Delinquency queue and collection-state model |
| Merchandise Purchase and stock screens | `/operations` | POS/inventory workflow definition |
| Daily Close and Receipt Audit | `/operations`, `/billing` | Reconciliation and audit workflow modules |
| Six Adjustment screens | `/adjustments` | Ledger, NSF, moved-out, refund, return and stock correction modules |
| Site Setup, Price Optimizer, Units and Tenants | `/company` | Facility, inventory and pricing configuration |
| Twenty-two Program Defaults screens | `/company` | Defaults grouped by lifecycle, finance, communications and controls |
| Security Levels, Employees and IP restrictions | `/company`, `/settings` | Scoped RBAC, employees, approval thresholds and conditional access |
| Banking, Accounting, Charges, Merchandise and Discounts | `/company` | Finance and product configuration catalogue |
| Forms, eFiles, eSign, CRM and past-due schedules | `/company` | Document, signature, campaign and collection policy modules |
| Seven Marketing screens | `/company` | Sources, customer types, storage reasons and loss reasons |
| Thirteen Marketplace screens | `/company` | Vendor-neutral integration catalogue |
| Reports dashboard | `/reports` | Operations, finance, products and integration report catalogue |
| Monthly Graphs | `/graphs` | Responsive performance dashboards |
| Prorate Calculator | `/prorate` | Interactive, transparent proration tool |
| Facility Map and colour/status details | `/map` | Interactive status legend, plan, unit selection and detail panel |
| TeleTracker Phone Integration | `/phone` | Caller matching and activity-log shell |

## Manual-derived workflows

Both supplied manuals confirm the legacy navigation and operational sequences for payments, move-ins, batch payments, transfers, scheduled and immediate move-outs, collections, tenant information, gate control and end of day. The newer screenshots take precedence where terminology or behavior differs.

## Production boundary

This release is a feature-complete scaffold and synthetic prototype. Authentication, database-backed repositories, payment processing, access-control commands and real communications remain disabled until provider choices, security review and migration permissions are approved.

## Reporting, communications and integration capture-to-feature gap matrix

Status meanings: **Implemented** means code and/or durable schema exists in this repository; **Partial** means the foundation or synthetic UI exists but not the full production workflow; **Config required** means a provider, credentials, mappings, approval or live data source is intentionally absent. These labels do not assert SiteLink API compatibility or vendor success.

| Requirement ID | Traceable evidence | Requirement | Cloud implementation | Status | Remaining boundary |
|---|---|---|---|---|---|
| SL-RPT-001 | Curated capture set: Reports dashboard; analysis §3.9 | Report catalogue grouped by operations, finance, sales and integrations | Permission-filtered catalogue in `src/lib/reporting.ts` and `/reports` | Implemented | Live repository queries are required |
| SL-RPT-002 | Curated capture set: report parameter dialogs; 2006 manual reporting chapters | Date, facility and grouping parameters | Validated parameter schema and interactive controls | Implemented | Additional report-specific parameters remain iterative |
| SL-RPT-003 | SiteLink manuals: printing/export workflows | Governed exports | Role-gated CSV/JSON export route with content classification | Partial | Object storage, retention and large async jobs are not connected |
| SL-RPT-004 | Analysis §3.9 and §5 reporting model | Scheduled reporting | `ReportSchedule` and `ReportRun` models with explicit statuses/failures | Partial | Scheduler worker and approved delivery recipients are not configured |
| SL-GRF-001 | Curated capture set: Monthly Graphs | Monthly occupancy/performance graphs | Responsive occupancy/revenue views, filters and decision signals | Partial | Values remain clearly labelled synthetic until reporting read models exist |
| SL-PERM-001 | Security Levels and report-access observations; analysis §6 | Report permissions independent of screen access | Permission matcher and role-specific catalogue/export gates | Implemented | Custom role editor and DB-loaded permissions remain separate security work |
| SL-COM-001 | Company defaults: CRM, forms, email/texting; manuals: letters | Versioned communication templates | Template and communication-log models plus draft library UI | Partial | Template editor/approval workflow remains |
| SL-COM-002 | Collection calls, tasks and letters captures | Delivery evidence and failures | Privacy-safe recipient hash, provider reference, delivery/failure timestamps | Implemented | Live email/SMS providers are not selected |
| SL-INT-001 | Thirteen Marketplace sections; analysis §7 | Vendor-neutral provider boundaries | Typed payment, access, email, SMS, accounting and website-lead interfaces | Implemented | Each real adapter requires vendor selection and contract tests |
| SL-INT-002 | Footer connectivity/service status; SiteLink status evidence | Connection health and observable failures | Health status enum, last success/failure, consecutive failures and operator UI | Implemented | Health values remain config-required until live checks run |
| SL-WHK-001 | Analysis §7 signed webhook requirement | Authenticated, idempotent inbound events | Signed-key boundary and unique organisation/provider/event ID inbox | Implemented | Per-source secret storage/rotation and worker processing remain |
| SL-WHK-002 | Analysis §3.6 access eventual consistency and §7 webhooks | Durable outbound delivery | Transactional outbox model with attempts, retry time, response and dead-letter state | Implemented | Dispatcher worker and signed destinations are config-required |
| SL-ACC-001 | Access screen and manuals: gate-control lifecycle | Provider-neutral access commands | Adapter contract separates occupancy state from provider results | Partial | No access provider or device reconciliation is connected |
| SL-PAY-001 | Cards, ACH and Payments captures | Provider-neutral tokenised payment calls | Adapter contract accepts tokens only and carries idempotency | Partial | No gateway, merchant account or settlement feed is connected |
| SL-ACCNT-001 | Marketplace accounting screens; analysis §3.9 | Accounting export interface | Adapter contract and explicit degraded mapping state | Partial | Chart/tax mapping approval and vendor transport required |
| SL-WEB-001 | Marketplace website/listing captures | Website lead intake with deduplication | Signed webhook inbox and website-lead acknowledgement interface | Partial | Source registration, payload mapping and end-to-end source test required |

### Evidence handling

- The 132 curated screenshots (160 files including raw hover attempts) and the 2006/2017 manuals remain local research evidence and are intentionally not copied into the public application.
- Requirement IDs above link each implemented slice back to the named capture group or analysis/manual section. Where a screenshot shows only a legacy screen, the cloud behaviour is labelled proposed/partial rather than vendor-equivalent.
- Synthetic demonstration records are labelled in the UI and export response. No captured customer information, credentials or vendor secrets are included.

