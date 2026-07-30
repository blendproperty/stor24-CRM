import { Plus, Search, ShieldCheck, UserCog, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";

export const metadata = { title: "Users & permissions" };

const users = [
  { name: "Brett Dovey", email: "brett@example.test", role: "Organisation owner", scope: "All facilities", status: "Active", tone: "positive" as const },
  { name: "Synthetic Manager", email: "manager@example.test", role: "Facility manager", scope: "Stor24 Randburg", status: "Active", tone: "positive" as const },
  { name: "Synthetic Finance", email: "finance@example.test", role: "Finance", scope: "All facilities", status: "Active", tone: "positive" as const },
  { name: "Synthetic Auditor", email: "auditor@example.test", role: "Auditor / read only", scope: "All facilities", status: "Invited", tone: "warning" as const },
];

const roles = [
  ["Organisation owner", "Full portfolio control", "2"],
  ["Facility manager", "Facility operations and approvals", "5"],
  ["Sales / leasing", "Leads, reservations and move-ins", "7"],
  ["Collections", "Past-due workflows and access actions", "3"],
  ["Finance", "Ledger, payments, close and reports", "2"],
  ["Auditor / read only", "Governed view and export access", "1"],
];

export default function UsersPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Access administration"
        title="Users & permissions"
        description="Manage employees, facility scope, security levels, approval thresholds and service accounts."
        action={<button className="button button-primary"><Plus size={16} /> Invite user</button>}
      />
      <section className="summary-strip">
        {[["Active users", "17"], ["Pending invites", "1"], ["Security roles", "9"], ["MFA adoption", "94%"]].map(([label, value]) => (
          <div className="summary-cell" key={label}><span>{label}</span><strong>{value}</strong></div>
        ))}
      </section>
      <section className="panel">
        <div className="toolbar">
          <label className="toolbar-search"><Search size={16} /><input placeholder="Search users, roles or facilities…" /></label>
          <button className="button button-secondary"><UserCog size={16} /> Manage roles</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>User</th><th>Role</th><th>Facility scope</th><th>Status</th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email}>
                  <td className="primary-cell">{user.name}<span className="secondary-cell">{user.email}</span></td>
                  <td>{user.role}</td><td>{user.scope}</td><td><StatusPill tone={user.tone}>{user.status}</StatusPill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel panel-spacious">
        <div className="panel-heading"><div><h2>Security roles</h2><p className="panel-subtitle">Role-based permissions with facility scope and approval limits.</p></div><ShieldCheck className="positive-icon" /></div>
        <div className="role-grid">
          {roles.map(([role, description, count]) => (
            <article className="role-card" key={role}><UsersRound size={18} /><div><strong>{role}</strong><p>{description}</p></div><span>{count} users</span></article>
          ))}
        </div>
      </section>
    </div>
  );
}

