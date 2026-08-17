import { Banknote, CreditCard, FileText, Receipt, RefreshCcw, WalletCards } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { db } from "@/lib/db";

export const metadata = { title: "Billing & payments" };
export const dynamic = "force-dynamic";

const modules = [
  [CreditCard, "Take payment", "Post a card, bank, cash or EFT payment and allocate it to open charges."],
  [RefreshCcw, "Autopay runs", "Schedule tokenised recurring payments, retries and exception handling."],
  [FileText, "Invoices & statements", "Generate, deliver and track account documents by billing cycle."],
  [Receipt, "Receipt audit", "Trace posted payments, reversals, refunds and operator activity."],
  [Banknote, "Refund approvals", "Route refunds and write-offs through configured approval thresholds."],
  [WalletCards, "Daily close", "Reconcile tenders and provider settlements before locking the period."],
] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value);
}

export default async function BillingPage() {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [balanceAgg, paymentsAgg, activeTenancyCount] = await Promise.all([
    db.account.aggregate({ _sum: { balance: true } }),
    db.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCEEDED", processedAt: { gte: monthStart } } }),
    db.tenancy.count({ where: { status: "ACTIVE" } }),
  ]);

  const outstandingBalance = Number(balanceAgg._sum.balance ?? 0);
  const collectedThisMonth = Number(paymentsAgg._sum.amount ?? 0);

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
          ["Collected this month", formatCurrency(collectedThisMonth)],
          ["Outstanding balance", formatCurrency(outstandingBalance)],
          ["Active tenancies billed", String(activeTenancyCount)],
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
