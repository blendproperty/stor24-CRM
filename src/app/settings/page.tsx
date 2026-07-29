import { BadgePercent, Building2, Cable, FileSignature, KeyRound, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Settings" };

const modules = [
  [Building2, "Organisation & facilities", "Portfolio hierarchy, facilities, buildings, zones and operating hours."],
  [ShieldCheck, "Users & permissions", "Scoped roles, approval thresholds and report access."],
  [BadgePercent, "Rates & billing rules", "Rate plans, fees, deposits, tax, discounts and collection policies."],
  [FileSignature, "Documents & templates", "Agreements, notices, invoices, receipts and communication templates."],
  [KeyRound, "Access control", "Vendor connections, facility mapping and access lifecycle rules."],
  [Cable, "Integrations & webhooks", "Payments, messaging, accounting, e-signature and partner APIs."],
] as const;

export default function SettingsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Administration"
        title="Settings"
        description="Configure the shared policies and integrations that drive every facility workflow."
      />
      <section className="module-grid">
        {modules.map(([Icon, title, copy]) => (
          <article className="module-card" key={title}><Icon size={22} /><h3>{title}</h3><p>{copy}</p></article>
        ))}
      </section>
    </div>
  );
}
