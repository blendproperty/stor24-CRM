import { Download, PhoneCall } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { db } from "@/lib/db";

export const metadata = { title: "Collections" };
export const dynamic = "force-dynamic";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value);
}

function accountDisplayName(customer: { companyName: string | null; firstName: string | null; lastName: string | null }) {
  return customer.companyName || [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Unknown customer";
}

export default async function CollectionsPage() {
  const overdueAccounts = await db.account.findMany({
    where: { balance: { gt: 0 } },
    include: { customer: true, tenancy: { include: { facility: true } } },
    orderBy: { balance: "desc" },
    take: 100,
  });

  const totalOutstanding = overdueAccounts.reduce((sum, account) => sum + Number(account.balance), 0);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Receivables"
        title="Collections"
        description="A policy-driven queue for overdue accounts, notices, access restrictions and promises to pay."
        action={<button className="button button-primary"><PhoneCall size={16} /> Start call queue</button>}
      />
      <section className="summary-strip">
        {[
          ["Outstanding", formatCurrency(totalOutstanding)],
          ["Overdue accounts", String(overdueAccounts.length)],
        ].map(([label, value]) => (
          <div className="summary-cell" key={label}><span>{label}</span><strong>{value}</strong></div>
        ))}
      </section>
      <section className="panel">
        <div className="toolbar">
          <strong>Overdue accounts by balance</strong>
          <button className="button button-secondary"><Download size={15} /> Export</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Account</th><th>Tenant</th><th>Facility</th><th>Balance</th></tr></thead>
            <tbody>
              {overdueAccounts.map((account) => (
                <tr key={account.id}>
                  <td className="primary-cell">{account.accountNumber}</td>
                  <td>{accountDisplayName(account.customer)}</td>
                  <td>{account.tenancy?.facility?.name ?? "—"}</td>
                  <td>{formatCurrency(Number(account.balance))}</td>
                </tr>
              ))}
              {overdueAccounts.length === 0 && (
                <tr><td colSpan={4}>No overdue accounts.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
