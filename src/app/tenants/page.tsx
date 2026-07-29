import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { tenants } from "@/lib/demo-data";

export const metadata = { title: "Tenants" };

export default function TenantsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Customer accounts"
        title="Tenants"
        description="Manage tenant profiles, occupancies, balances, documents and account history."
        action={
          <Link className="button button-primary" href="/operations/move-in">
            <Plus size={16} /> New move-in
          </Link>
        }
      />
      <section className="summary-strip">
        {[
          ["Active tenants", "421"],
          ["Business accounts", "68"],
          ["Autopay enabled", "76%"],
          ["Accounts overdue", "23"],
        ].map(([label, value]) => (
          <div className="summary-cell" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>
      <section className="panel">
        <div className="toolbar">
          <label className="toolbar-search">
            <Search size={16} />
            <input placeholder="Search by name, account, unit or contact…" />
          </label>
          <button className="button button-secondary" type="button">Filters</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Account</th>
                <th>Unit</th>
                <th>Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.account}>
                  <td className="primary-cell">
                    {tenant.name}
                    <span className="secondary-cell">{tenant.contact}</span>
                  </td>
                  <td>{tenant.account}</td>
                  <td>{tenant.unit}</td>
                  <td>{tenant.balance}</td>
                  <td><StatusPill tone={tenant.tone}>{tenant.status}</StatusPill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
