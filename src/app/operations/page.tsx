import { ArrowRightLeft, CalendarCheck, DoorClosed, DoorOpen, KeyRound, PackageOpen } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Operations" };

const modules = [
  [DoorOpen, "Move in", "Convert a lead or walk-in to an active, paid and access-enabled occupancy."],
  [ArrowRightLeft, "Transfer", "Move a tenant between units with proration, agreements and access changes."],
  [DoorClosed, "Move out", "Settle the account, revoke access and route the unit through its turn process."],
  [KeyRound, "Access control", "Reconcile access permissions, provider commands and facility exceptions."],
  [PackageOpen, "Merchandise", "Sell locks and packing stock with inventory movement and payment posting."],
  [CalendarCheck, "Daily close", "Reconcile receipts, settlements and operator totals before period lock."],
] as const;

export default function OperationsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Facility workflows"
        title="Operations"
        description="Execute the complete storage lifecycle from move-in through transfer, move-out and close."
      />
      <section className="module-grid">
        {modules.map(([Icon, title, copy]) => (
          <article className="module-card" key={title}><Icon size={22} /><h3>{title}</h3><p>{copy}</p></article>
        ))}
      </section>
    </div>
  );
}
