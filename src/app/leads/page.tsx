import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { leads } from "@/lib/demo-data";

export const metadata = { title: "Lead to lease" };

export default function LeadsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Sales pipeline"
        title="Lead to lease"
        description="Track every enquiry from first contact through quote, reservation and move-in."
        action={<button className="button button-primary"><Plus size={16} /> Add lead</button>}
      />
      <section className="summary-strip">
        {[
          ["Open pipeline", "34"],
          ["Follow-ups today", "8"],
          ["Reservations", "11"],
          ["30-day conversion", "42%"],
        ].map(([label, value]) => (
          <div className="summary-cell" key={label}><span>{label}</span><strong>{value}</strong></div>
        ))}
      </section>
      <section className="panel">
        <div className="toolbar">
          <label className="toolbar-search"><Search size={16} /><input placeholder="Search leads…" /></label>
          <button className="button button-secondary">Pipeline view</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Prospect</th><th>Source</th><th>Requirement</th><th>Stage</th><th>Next action</th></tr></thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.name}>
                  <td className="primary-cell">{lead.name}</td>
                  <td>{lead.source}</td>
                  <td>{lead.requirement}</td>
                  <td><StatusPill tone={lead.tone}>{lead.stage}</StatusPill></td>
                  <td>{lead.next}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
