"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Cable, CheckCircle2, Settings2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";

type Profile = { id: string; domain: string; name: string; status: string; config: Record<string, unknown> };
type Integration = { id: string; category: string; provider: string; status: string; config: Record<string, unknown>; lastHealthAt: string | null };
type SetupData = { profiles: Profile[]; integrations: Integration[]; charges: unknown[]; discounts: unknown[]; facilities: unknown[]; roles: unknown[]; users: unknown[] };
const domains = [
  ["FACILITY", "Company & facilities", "Addresses, operating hours, locale, tax and facility contacts."],
  ["PROGRAM_DEFAULTS", "Program defaults", "Proration, invoicing, tenders, refunds, close, late fees and reservations."],
  ["TENANT_DEFAULTS", "Tenant defaults", "Required identity, address, notice, communication and account fields."],
  ["BANKING_ACCOUNTING", "Banking & accounting", "Non-secret bank references, chart mappings and export controls."],
  ["MARKETING", "Marketing settings", "Lead sources, campaigns, customer types, storage and loss reasons."],
  ["PRICE_OPTIMIZER", "Price optimizer", "Draft rate rules, guardrails, approval thresholds and effective dates."],
  ["FACILITY_MAP", "Facility map", "Zones, layout metadata and unit display configuration."],
  ["PHONE", "Phone integration", "Caller matching and activity capture configuration shell."],
  ["MARKETPLACE", "Marketplace", "Vendor-neutral connector catalogue and mappings."],
] as const;

export function CompanyWorkspace() {
  const [data, setData] = useState<SetupData | null>(null);
  const [selected, setSelected] = useState<(typeof domains)[number]>(domains[0]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { const response = await fetch("/api/v1/configuration", { cache: "no-store" }); const payload = await response.json(); if (!response.ok) setError(payload.error?.message ?? "Setup data could not be loaded."); else { setData(payload.data); setError(""); } }, []);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/configuration", { cache: "no-store" }).then(async (response) => ({ response, payload: await response.json() })).then(({ response, payload }) => {
      if (cancelled) return;
      if (!response.ok) setError(payload.error?.message ?? "Setup data could not be loaded.");
      else setData(payload.data);
    });
    return () => { cancelled = true; };
  }, []);

  async function saveProfile(formData: FormData) {
    setBusy(true);
    const config = { summary: String(formData.get("summary") ?? ""), enabled: formData.get("enabled") === "on" };
    const response = await fetch("/api/v1/configuration", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "profile", payload: { domain: selected[0], name: "Default", status: "DRAFT", config } }) });
    const payload = await response.json(); setBusy(false);
    if (!response.ok) { setError(payload.error?.message ?? "Configuration could not be saved."); return; }
    await load();
  }
  const configured = new Set(data?.profiles.map((profile) => profile.domain));
  return <div className="page-stack">
    <PageHeader eyebrow="Administration" title="Company & setup" description="Governed Stor24 defaults, security, finance settings and explicit connector configuration." action={<button className="button button-primary" onClick={() => setSelected(domains[0])}><Building2 size={16}/> Facility setup</button>}/>
    {error ? <p className="form-error">{error}</p> : null}
    <section className="summary-strip">{[["Facilities", data?.facilities.length ?? 0], ["Employees", data?.users.length ?? 0], ["Security levels", data?.roles.length ?? 0], ["Connected services", data?.integrations.filter((item) => item.status === "CONNECTED").length ?? 0]].map(([label, value]) => <div className="summary-cell" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>
    <section className="setup-layout">
      <div className="panel setup-nav">{domains.map((domain) => <button className={selected[0] === domain[0] ? "setup-nav-active" : ""} key={domain[0]} onClick={() => setSelected(domain)}><span><Settings2 size={17}/><strong>{domain[1]}</strong></span><StatusPill tone={configured.has(domain[0]) ? "positive" : "warning"}>{configured.has(domain[0]) ? "Draft saved" : "Configure"}</StatusPill></button>)}</div>
      <article className="panel panel-spacious"><div className="panel-heading"><div><p className="eyebrow">{selected[0].replaceAll("_", " ")}</p><h2>{selected[1]}</h2><p className="panel-subtitle">{selected[2]}</p></div><ShieldCheck className="positive-icon"/></div>
        <form action={saveProfile} className="invite-form"><label>Configuration summary<textarea name="summary" rows={7} defaultValue={String(data?.profiles.find((profile) => profile.domain === selected[0])?.config.summary ?? "")}/></label><label className="check-label"><input type="checkbox" name="enabled" defaultChecked={Boolean(data?.profiles.find((profile) => profile.domain === selected[0])?.config.enabled)}/><span>Enable this draft default for operational review</span></label><p className="safe-config-note"><CheckCircle2 size={16}/>Only non-secret operational values belong here. Credentials and payment data must be stored in an approved secret vault/provider.</p><button className="button button-primary" disabled={busy}>{busy ? "Saving…" : "Save draft configuration"}</button></form>
      </article>
    </section>
    <section className="panel"><div className="hub-heading"><div><h2>Marketplace & integration connections</h2><p>Configuration shells only. No service is presented as live without a verified health result.</p></div><Cable size={20}/></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Category</th><th>Provider</th><th>Connection status</th><th>Last verified</th></tr></thead><tbody>{data?.integrations.length ? data.integrations.map((item) => <tr key={item.id}><td>{item.category}</td><td className="primary-cell">{item.provider}</td><td><StatusPill tone={item.status === "CONNECTED" ? "positive" : "warning"}>{item.status}</StatusPill></td><td>{item.lastHealthAt ? new Date(item.lastHealthAt).toLocaleString("en-ZA") : "Never"}</td></tr>) : <tr><td colSpan={4} className="empty-cell">No connectors configured. All external services are disconnected.</td></tr>}</tbody></table></div></section>
  </div>;
}
