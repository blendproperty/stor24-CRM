import { ReservationsWorkspace } from "@/components/reservations-workspace";
import { requirePermission } from "@/lib/auth-guards";

export const metadata = { title: "Reservations" };
export default async function ReservationsPage() { await requirePermission("reservations.manage"); return <ReservationsWorkspace/>; }
