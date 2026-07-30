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

