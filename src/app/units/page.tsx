import { addFacilityAction, addUnitAction, addUnitTypeAction } from "@/app/actions/leasing";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { listLeasing } from "@/lib/leasing-service";
import { requireScope } from "@/lib/scope";

export const metadata = { title: "Units & rates" };

export default async function UnitsPage() {
  const { facilities } = await listLeasing(await requireScope());
  const units = facilities.flatMap((facility) => facility.units);
  const types = facilities.flatMap((facility) => facility.unitTypes);
  const summaries = [
    ["Rentable units", units.length],
    ["Available now", units.filter((unit) => unit.status === "AVAILABLE").length],
    ["Reserved", units.filter((unit) => unit.status === "RESERVED").length],
    ["Occupied", units.filter((unit) => unit.status === "OCCUPIED").length],
  ];

  return <div className="page-stack">
    <PageHeader eyebrow="Inventory" title="Facilities, units & rates" description="Database-backed facility inventory, physical attributes, availability and current pricing." />
    <section className="summary-strip">{summaries.map(([label, value]) => <div className="summary-cell" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>
    <section className="panel panel-spacious">
      <h2>Add facility</h2>
      <form action={addFacilityAction} className="leasing-form"><input name="name" placeholder="Facility name" required /><input name="code" placeholder="Code" required /><button className="button button-secondary">Add facility</button></form>
      <h2>Add unit type</h2>
      <form action={addUnitTypeAction} className="leasing-form"><select name="facilityId" required>{facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}</select><input name="name" placeholder="Type name" required /><input name="widthMetres" type="number" step=".01" placeholder="Width m" /><input name="lengthMetres" type="number" step=".01" placeholder="Length m" /><button className="button button-secondary">Add type</button></form>
      <h2>Add unit</h2>
      <form action={addUnitAction} className="leasing-form"><select name="facilityId" required>{facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}</select><select name="unitTypeId" required>{types.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select><input name="number" placeholder="Unit number" required /><input name="monthlyRate" type="number" step=".01" placeholder="Monthly rate" required /><input name="taxRate" type="number" step=".01" defaultValue="0.15" /><button className="button button-primary">Add unit</button></form>
    </section>
    <section className="panel"><div className="table-wrap"><table className="data-table"><thead><tr><th>Facility</th><th>Unit</th><th>Type</th><th>Status</th><th>Monthly rate</th></tr></thead><tbody>{facilities.flatMap((facility) => facility.units.map((unit) => <tr key={unit.id}><td>{facility.name}</td><td className="primary-cell">{unit.number}</td><td>{unit.unitType.name}</td><td><StatusPill>{unit.status}</StatusPill></td><td>R {Number(unit.monthlyRate).toFixed(2)}</td></tr>))}</tbody></table></div></section>
  </div>;
}
