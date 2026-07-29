import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusPill, type StatusTone } from "@/components/status-pill";
import { units } from "@/lib/demo-data";

export const metadata = { title: "Units & rates" };

const tone: Record<string, StatusTone> = {
  Occupied: "positive",
  Available: "neutral",
  Reserved: "warning",
  Service: "danger",
};

export default function UnitsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Inventory"
        title="Units & rates"
        description="Control unit availability, physical attributes, status history and effective-dated pricing."
        action={<button className="button button-primary"><Plus size={16} /> Add unit</button>}
      />
      <section className="summary-strip">
        {[
          ["Rentable units", "486"],
          ["Available now", "31"],
          ["Reserved", "10"],
          ["In service", "4"],
        ].map(([label, value]) => (
          <div className="summary-cell" key={label}><span>{label}</span><strong>{value}</strong></div>
        ))}
      </section>
      <section className="panel">
        <div className="toolbar">
          <label className="toolbar-search"><Search size={16} /><input placeholder="Search unit number or type…" /></label>
          <button className="button button-secondary">Map view</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Unit</th><th>Size</th><th>Location</th><th>Status</th><th>Monthly rate</th></tr></thead>
            <tbody>
              {units.map(([unit, size, location, status, rate]) => (
                <tr key={unit}>
                  <td className="primary-cell">{unit}</td><td>{size}</td><td>{location}</td>
                  <td><StatusPill tone={tone[status]}>{status}</StatusPill></td><td>{rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
