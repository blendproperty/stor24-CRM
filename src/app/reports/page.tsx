import { PageHeader } from "@/components/page-header";
import { ReportsWorkspace } from "@/components/reports-workspace";
import { requireSession } from "@/lib/auth-guards";
import { availableReports } from "@/lib/reporting";
import { hasPermission } from "@/lib/permissions";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const session = await requireSession();
  const permissions = session.permissions;
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="Governed operational and financial reporting for individual facilities and the portfolio."
      />
      <ReportsWorkspace reports={availableReports(permissions)} canExport={hasPermission(permissions, "reports.export")} canSchedule={hasPermission(permissions, "reports.schedule")} />
    </div>
  );
}
