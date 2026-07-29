import { BarChart3, Boxes, CreditCard, Download, ShieldAlert, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Reports" };

const reports = [
  [TrendingUp, "Occupancy & revenue", "Physical/economic occupancy, achieved rates and revenue movement."],
  [Users, "Tenant & rent roll", "Active occupancies, contacts, rates, balances and recurring methods."],
  [ShieldAlert, "Receivables ageing", "Open balances grouped by ageing band, stage and facility."],
  [CreditCard, "Payments & deposits", "Tender, refund, settlement and daily close reconciliation."],
  [Boxes, "Unit availability", "Available, reserved, occupied, service and forecast inventory."],
  [BarChart3, "Lead conversion", "Source, stage velocity, quote, reservation and move-in conversion."],
] as const;

export default function ReportsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="Governed operational and financial reporting for individual facilities and the portfolio."
        action={<button className="button button-primary"><Download size={16} /> New export</button>}
      />
      <section className="module-grid">
        {reports.map(([Icon, title, copy]) => (
          <article className="module-card" key={title}><Icon size={22} /><h3>{title}</h3><p>{copy}</p></article>
        ))}
      </section>
    </div>
  );
}
