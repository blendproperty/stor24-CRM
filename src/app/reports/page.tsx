import { Download } from "lucide-react";
import { ModuleHub } from "@/components/module-hub";
import { PageHeader } from "@/components/page-header";
import { reportGroups } from "@/lib/module-catalog";

export const metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="Governed operational and financial reporting for individual facilities and the portfolio."
        action={<button className="button button-primary"><Download size={16} /> New export</button>}
      />
      <ModuleHub groups={reportGroups} />
    </div>
  );
}
