import { PhoneCall, UserRoundSearch } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Phone integration" };

export default function PhonePage() {
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Telephony" title="Phone integration" description="Cloud caller matching and shortcuts derived from the observed TeleTracker screen." />
      <section className="dashboard-grid">
        <article className="panel panel-spacious">
          <div className="panel-heading"><h2>Incoming caller</h2><PhoneCall className="positive-icon" /></div>
          <div className="empty-state"><UserRoundSearch size={36} /><strong>Waiting for a call</strong><p>A matched caller will show accounts, units, balance, paid-through date and recent activity.</p></div>
        </article>
        <article className="panel panel-spacious">
          <div className="panel-heading"><h2>Caller ID log</h2><span className="status-pill status-positive">Provider online</span></div>
          <div className="table-wrap"><table className="data-table"><thead><tr><th>Time</th><th>Number</th><th>Match</th><th>Action</th></tr></thead><tbody><tr><td colSpan={4} className="empty-cell">No synthetic calls received today.</td></tr></tbody></table></div>
        </article>
      </section>
    </div>
  );
}

