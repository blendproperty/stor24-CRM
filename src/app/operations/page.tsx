import { DoorOpen } from "lucide-react";
import { ModuleHub } from "@/components/module-hub";
import { PageHeader } from "@/components/page-header";
import { workflowGroups } from "@/lib/module-catalog";

export const metadata = { title: "Operations" };

export default function OperationsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Facility workflows"
        title="Operations"
        description="Execute the complete storage lifecycle from move-in through transfer, move-out and close."
        action={<button className="button button-primary"><DoorOpen size={16} /> Start move-in</button>}
      />
      <ModuleHub groups={workflowGroups} />
    </div>
  );
}
