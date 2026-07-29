import { Banknote, CreditCard, FileText, Receipt, RefreshCcw, WalletCards } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Billing & payments" };

const modules = [
  [CreditCard, "Take payment", "Post a card, bank, cash or EFT payment and allocate it to open charges."],
  [RefreshCcw, "Autopay runs", "Schedule tokenised recurring payments, retries and exception handling."],
  [FileText, "Invoices & statements", "Generate, deliver and track account documents by billing cycle."],
  [Receipt, "Receipt audit", "Trace posted payments, reversals, refunds and operator activity."],
  [Banknote, "Refund approvals", "Route refunds and write-offs through configured approval thresholds."],
  [WalletCards, "Daily close", "Reconcile tenders and provider settlements before locking the period."],
] as const;

export default function BillingPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Financial operations"
        title="Billing & payments"
        description="Operate the tenant subledger, recurring billing, payments, refunds and daily reconciliation."
        action={<button className="button button-primary"><CreditCard size={16} /> Take payment</button>}
      />
      <section className="summary-strip">
        {[
          ["Collected today", "R 86,450"],
          ["Autopay success", "94.8%"],
          ["Unallocated cash", "R 0"],
          ["Refunds pending", "2"],
        ].map(([label, value]) => (
          <div className="summary-cell" key={label}><span>{label}</span><strong>{value}</strong></div>
        ))}
      </section>
      <section className="module-grid">
        {modules.map(([Icon, title, copy]) => (
          <article className="module-card" key={title}><Icon size={22} /><h3>{title}</h3><p>{copy}</p></article>
        ))}
      </section>
    </div>
  );
}
