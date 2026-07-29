import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "New move-in" };

export default function MoveInPage() {
  const steps = [
    ["1", "Customer", "Identify an existing customer or capture a new person or organisation."],
    ["2", "Unit & rate", "Select real-time availability, rate plan, promotion and intended start date."],
    ["3", "Agreement", "Capture required details, protection choice and generate documents."],
    ["4", "Payment", "Collect initial charges and tokenise the recurring payment mandate."],
    ["5", "Access", "Provision credentials and activate occupancy after transactional checks pass."],
  ];
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Guided workflow"
        title="New move-in"
        description="A transaction-safe wizard that keeps unit, agreement, ledger and access state aligned."
      />
      <section className="panel panel-spacious">
        <div className="work-list">
          {steps.map(([number, title, copy], index) => (
            <div className="work-row" key={title}>
              <span className="work-icon work-icon-positive">{index === 0 ? <CheckCircle2 size={18} /> : number}</span>
              <span className="work-copy"><strong>{title}</strong><small>{copy}</small></span>
              <span className="status-pill">{index === 0 ? "Ready" : "Pending"}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
