import { Download, PhoneCall } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { collectionCases } from "@/lib/demo-data";

export const metadata = { title: "Collections" };

export default function CollectionsPage() {
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
          ["Outstanding", "R 42,680"],
          ["Overdue accounts", "23"],
          ["Promises to pay", "6"],
          ["Access suspended", "9"],
        ].map(([label, value]) => (
          <div className="summary-cell" key={label}><span>{label}</span><strong>{value}</strong></div>
        ))}
      </section>
      <section className="panel">
        <div className="toolbar">
          <strong>Prioritised case queue</strong>
          <button className="button button-secondary"><Download size={15} /> Export</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Account</th><th>Tenant</th><th>Balance</th><th>Age</th><th>Current action</th></tr></thead>
            <tbody>
              {collectionCases.map(([account, tenant, balance, age, action]) => (
                <tr key={account}>
                  <td className="primary-cell">{account}</td><td>{tenant}</td><td>{balance}</td><td>{age}</td>
                  <td><StatusPill tone={action.includes("suspended") ? "danger" : "warning"}>{action}</StatusPill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
