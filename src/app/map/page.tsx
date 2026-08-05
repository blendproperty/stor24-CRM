import { Map as MapIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { requirePermission } from "@/lib/auth-guards";
import { db } from "@/lib/db";

export const metadata = { title: "Facility map" };

export default async function MapPage() {
  const { organisationId, allowedFacilityIds } = await requirePermission("facility_map.view");
  const units = await db.unit.findMany({ where: { facility: { organisationId }, ...(allowedFacilityIds ? { facilityId: { in: allowedFacilityIds } } : {}) }, include: { unitType: true, facility: true }, orderBy: [{ facilityId: "asc" }, { number: "asc" }], take: 500 });
  const statuses = Object.entries(units.reduce<Record<string, number>>((result, unit) => { result[unit.status] = (result[unit.status] ?? 0) + 1; return result; }, {}));
  return <div className="page-stack">
    <PageHeader eyebrow="Visual inventory" title="Facility map" description="Database-backed unit status and layout metadata. Drag-and-drop plan editing remains a configuration shell." action={<button className="button button-secondary" disabled><MapIcon size={16}/> Layout editor not connected</button>}/>
    <section className="summary-strip">{statuses.length ? statuses.slice(0, 4).map(([status, count]) => <div className="summary-cell" key={status}><span>{status.replaceAll("_", " ")}</span><strong>{count}</strong></div>) : <div className="summary-cell"><span>Units</span><strong>0</strong></div>}</section>
    <section className="panel facility-plan"><div className="unit-grid">{units.length ? units.map((unit) => <div className={`map-unit unit-${unit.status.toLowerCase()}`} key={unit.id} title={`${unit.facility.name} · ${unit.unitType.name} · R ${unit.monthlyRate}`}><strong>{unit.number}</strong><small>{unit.status}</small></div>) : <div className="empty-state"><MapIcon size={36}/><strong>No units configured</strong><p>Add facility units before configuring the visual plan.</p></div>}</div></section>
  </div>;
}
