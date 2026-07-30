import { Building2 } from "lucide-react";
import { ModuleHub } from "@/components/module-hub";
import { PageHeader } from "@/components/page-header";
import { companyGroups } from "@/lib/module-catalog";

export const metadata = { title: "Company setup" };

export default function CompanyPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Configuration"
        title="Company & setup"
        description="A cloud-native configuration centre covering every observed Site Setup, Program Defaults, Security and Marketplace section."
        action={<button className="button button-primary"><Building2 size={16} /> Add facility</button>}
      />
      <section className="summary-strip">
        {[["Facilities", "3"], ["Users", "18"], ["Configured connectors", "7"], ["Setup checks", "92%"]].map(([label, value]) => (
          <div className="summary-cell" key={label}><span>{label}</span><strong>{value}</strong></div>
        ))}
      </section>
      <ModuleHub groups={companyGroups} />
    </div>
  );
}

