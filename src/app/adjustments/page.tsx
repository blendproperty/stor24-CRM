import { SlidersHorizontal } from "lucide-react";
import { ModuleHub } from "@/components/module-hub";
import { PageHeader } from "@/components/page-header";
import { adjustmentsGroups } from "@/lib/module-catalog";

export const metadata = { title: "Adjustments" };

export default function AdjustmentsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Controlled corrections"
        title="Adjustments"
        description="Correct financial and inventory exceptions through reason-coded reversals, approvals and permanent audit history."
        action={<button className="button button-primary"><SlidersHorizontal size={16} /> New adjustment</button>}
      />
      <ModuleHub groups={adjustmentsGroups} />
    </div>
  );
}

