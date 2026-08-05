"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Link2, Plus, Search, ShieldCheck, UserCog, UsersRound, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";

type Invitation = {
  id: string;
  name: string;
  email: string;
  roleName: string;
  facilityCode: string | null;
  status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
  expiresAt: string;
  createdAt: string;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  scope: string;
  active?: boolean;
};

const roles = [
  ["Organisation owner", "Full portfolio control"],
  ["Facility manager", "Facility operations and approvals"],
  ["Sales / leasing", "Leads, reservations and move-ins"],
  ["Collections", "Past-due workflows and access actions"],
  ["Finance", "Ledger, payments, close and reports"],
  ["Auditor / read only", "Governed view and export access"],
];

export function UsersWorkspace() {
  const [open, setOpen] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [persistedUsers, setPersistedUsers] = useState<UserRow[]>([]);
  const [invitationSent, setInvitationSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/v1/invitations", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    setInvitations(payload.data);
    setPersistedUsers(payload.users);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/invitations", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!cancelled && payload) {
          setInvitations(payload.data);
          setPersistedUsers(payload.users);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function submitInvitation(formData: FormData) {
    setBusy(true);
    setError("");
    setInvitationSent(false);
    const response = await fetch("/api/v1/invitations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        roleName: formData.get("roleName"),
        facilityCode: formData.get("facilityCode"),
      }),
    });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(payload.error?.message ?? "The invitation could not be created.");
      return;
    }
    setInvitationSent(payload.data.delivery === "SENT");
    await load();
  }

  async function revoke(id: string) {
    const response = await fetch(`/api/v1/invitations/${id}`, { method: "DELETE" });
    if (response.ok) await load();
  }

  async function updateUser(id: string, changes: { active?: boolean; roleName?: string }) {
    setError("");
    const response = await fetch(`/api/v1/users/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(changes) });
    if (!response.ok) { const payload = await response.json(); setError(payload.error?.message ?? "The user could not be updated."); return; }
    await load();
  }

  const users = persistedUsers;
  const pending = invitations.filter((invitation) => invitation.status === "PENDING");

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Access administration"
        title="Users & permissions"
        description="Manage employees, facility scope, security levels, approval thresholds and service accounts."
        action={<button className="button button-primary" onClick={() => { setOpen(true); setInvitationSent(false); setError(""); }}><Plus size={16} /> Invite user</button>}
      />
      <section className="summary-strip">
        {[["Active users", String(users.filter((user) => user.active !== false).length)], ["Pending invites", String(pending.length)], ["Security roles", "6"], ["MFA adoption", "Planned"]].map(([label, value]) => (
          <div className="summary-cell" key={label}><span>{label}</span><strong>{value}</strong></div>
        ))}
      </section>
      {pending.length > 0 ? (
        <section className="panel">
          <div className="hub-heading"><div><h2>Pending invitations</h2><p>Links expire automatically after seven days.</p></div><span>{pending.length} pending</span></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Invitee</th><th>Role</th><th>Expires</th><th /></tr></thead>
              <tbody>{pending.map((invitation) => (
                <tr key={invitation.id}>
                  <td className="primary-cell">{invitation.name}<span className="secondary-cell">{invitation.email}</span></td>
                  <td>{invitation.roleName}</td>
                  <td>{new Date(invitation.expiresAt).toLocaleDateString("en-ZA")}</td>
                  <td><button className="text-button text-button-danger" onClick={() => revoke(invitation.id)}>Revoke</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>
      ) : null}
      <section className="panel">
        <div className="toolbar">
          <label className="toolbar-search"><Search size={16} /><input placeholder="Search users, roles or facilities…" /></label>
          <span><UserCog size={16} /> Database-backed access</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>User</th><th>Role</th><th>Facility scope</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{users.map((user) => (
              <tr key={user.email}>
                <td className="primary-cell">{user.name}<span className="secondary-cell">{user.email}</span></td>
                <td><select aria-label={`Role for ${user.name}`} value={user.role} onChange={(event) => updateUser(user.id, { roleName: event.target.value })}>{roles.map(([role]) => <option key={role}>{role}</option>)}</select></td><td>{user.scope}</td><td><StatusPill tone={user.active === false ? "neutral" : "positive"}>{user.active === false ? "Inactive" : "Active"}</StatusPill></td><td><button className={user.active === false ? "text-button" : "text-button text-button-danger"} onClick={() => updateUser(user.id, { active: user.active === false })}>{user.active === false ? "Reactivate" : "Deactivate"}</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>
      <section className="panel panel-spacious">
        <div className="panel-heading"><div><h2>Security roles</h2><p className="panel-subtitle">Role-based permissions with facility scope and approval limits.</p></div><ShieldCheck className="positive-icon" /></div>
        <div className="role-grid">{roles.map(([role, description]) => (
          <article className="role-card" key={role}><UsersRound size={18} /><div><strong>{role}</strong><p>{description}</p></div></article>
        ))}</div>
      </section>

      {open ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="invite-title">
            <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close invitation dialog"><X size={18} /></button>
            <p className="eyebrow">Secure invitation</p>
            <h2 id="invite-title">Invite a user</h2>
            <p className="modal-copy">Send a single-use invitation that expires in seven days.</p>
            {invitationSent ? (
              <div className="invite-success">
                <span><Check size={18} /> Invitation created</span>
                <p>The secure invitation was sent to the recipient by the configured email provider.</p>
                <button className="button button-secondary" onClick={() => { setInvitationSent(false); setError(""); }}>Invite another user</button>
              </div>
            ) : (
              <form action={submitInvitation} className="invite-form">
                <label>Full name<input name="name" required minLength={2} autoComplete="name" /></label>
                <label>Email address<input name="email" required type="email" autoComplete="email" /></label>
                <label>Security role<select name="roleName" defaultValue="Facility manager">{roles.map(([role]) => <option key={role}>{role}</option>)}</select></label>
                <label>Facility scope<select name="facilityCode" defaultValue="RANDBURG"><option value="">All facilities</option><option value="RANDBURG">Stor24 Randburg</option></select></label>
                {error ? <p className="form-error">{error}</p> : null}
                <button className="button button-primary" disabled={busy} type="submit"><Link2 size={16} />{busy ? "Creating…" : "Create invitation"}</button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
