import { FileText, Mail, MessageSquareText, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";

export const metadata = { title: "Communications" };

const templates = [
  ["lead-follow-up", "Lead follow-up", "Email", "Draft", "Lead name, facility, requested unit, follow-up link"],
  ["payment-receipt", "Payment receipt", "Email", "Draft", "Receipt number, amount, payment date, account balance"],
  ["past-due-reminder", "Past-due reminder", "Email / SMS", "Draft", "Balance, due date, facility contact, payment link"],
  ["move-in-welcome", "Move-in welcome", "Email", "Draft", "Unit, access guidance, agreement link, facility hours"],
] as const;

export default function CommunicationsPage() {
  return <div className="page-stack">
    <PageHeader eyebrow="Customer engagement" title="Communications" description="Versioned templates and privacy-safe delivery logs for email and SMS. Delivery remains disabled until an approved provider and sender identity are configured." />
    <section className="summary-strip"><div className="summary-cell"><span>Active templates</span><strong>0</strong></div><div className="summary-cell"><span>Draft templates</span><strong>4</strong></div><div className="summary-cell"><span>Queued</span><strong>0</strong></div><div className="summary-cell"><span>Failed</span><strong>0</strong></div></section>
    <section className="panel"><div className="panel-heading panel-spacious"><div><h2>Template library</h2><p className="panel-subtitle">Template variables are explicit and versions are immutable after use.</p></div><FileText className="muted-icon" /></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Key</th><th>Template</th><th>Channel</th><th>Status</th><th>Variables</th></tr></thead><tbody>{templates.map(([key, name, channel, status, variables]) => <tr key={key}><td><code>{key}</code></td><td className="primary-cell">{name}</td><td>{channel === "Email" ? <><Mail size={14} /> {channel}</> : <><MessageSquareText size={14} /> {channel}</>}</td><td><StatusPill tone="warning">{status}</StatusPill></td><td>{variables}</td></tr>)}</tbody></table></div></section>
    <section className="panel panel-spacious"><div className="panel-heading"><div><h2>Delivery log</h2><p className="panel-subtitle">Recipient values are stored as hashes; provider references and failures are auditable.</p></div><ShieldCheck className="positive-icon" /></div><div className="empty-state"><strong>No delivery attempts</strong><p>This is honest configuration state—not a successful provider connection.</p></div></section>
  </div>;
}
