import { Activity, AlertTriangle, Cable, CheckCircle2, Clock3, Webhook } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";

export const metadata = { title: "Integrations" };

const connections = [
  ["Payments", "Provider not selected", "Configuration required", "No live credentials or payment calls", "warning"],
  ["Access control", "Provider not selected", "Configuration required", "Facility mapping and reconciliation required", "warning"],
  ["Email", "Provider not selected", "Configuration required", "Sender verification required", "warning"],
  ["SMS", "Provider not selected", "Configuration required", "Sender identity required", "warning"],
  ["Accounting", "File export", "Partial", "Chart mapping awaiting approval", "warning"],
  ["Website leads", "Signed webhook inbox", "Foundation ready", "Source registration required", "positive"],
] as const;

export default function IntegrationsPage() {
  return <div className="page-stack">
    <PageHeader eyebrow="Connection centre" title="Integrations & webhooks" description="Vendor-neutral connections with explicit configuration, health, backlog and failure states. No provider is shown as connected until a live health check succeeds." />
    <section className="summary-strip">
      <div className="summary-cell"><span>Healthy connections</span><strong>0</strong></div>
      <div className="summary-cell"><span>Configuration required</span><strong>5</strong></div>
      <div className="summary-cell"><span>Degraded</span><strong>1</strong></div>
      <div className="summary-cell"><span>Dead-letter events</span><strong>0</strong></div>
    </section>
    <section className="panel integration-table"><div className="panel-heading"><div><h2>Connection health</h2><p className="panel-subtitle">Health timestamps remain empty until a real provider check runs.</p></div><Activity className="muted-icon" /></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>Category</th><th>Provider</th><th>State</th><th>Last check</th><th>Detail</th></tr></thead><tbody>
        {connections.map(([category, provider, state, detail, tone]) => <tr key={category}><td className="primary-cell">{category}</td><td>{provider}</td><td><StatusPill tone={tone}>{state}</StatusPill></td><td>Never</td><td>{detail}</td></tr>)}
      </tbody></table></div>
    </section>
    <section className="dashboard-grid">
      <article className="panel panel-spacious"><div className="panel-heading"><div><h2>Webhook inbox</h2><p className="panel-subtitle">Authenticated, idempotent intake with retry and dead-letter states.</p></div><Webhook className="muted-icon" /></div><div className="state-list">
        <div><Clock3 /><span><strong>Pending</strong><small>0 events waiting</small></span></div><div><CheckCircle2 /><span><strong>Processed</strong><small>0 events in this environment</small></span></div><div><AlertTriangle /><span><strong>Failed / dead letter</strong><small>0 events require attention</small></span></div>
      </div></article>
      <article className="panel panel-spacious"><div className="panel-heading"><div><h2>Transactional outbox</h2><p className="panel-subtitle">Domain events are queued before provider delivery, preserving business transactions during outages.</p></div><Cable className="muted-icon" /></div><div className="empty-state"><strong>No outbound deliveries</strong><p>Configured destinations, retry attempts, response codes and failure reasons will appear here.</p></div></article>
    </section>
  </div>;
}
