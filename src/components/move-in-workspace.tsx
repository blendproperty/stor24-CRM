"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";

type Unit = { id: string; facilityId: string; number: string; floor: string; zone: string; status: string; monthlyRate: number; typeName: string; width: number | null; length: number | null; area: number | null; features: string[] };
type Facility = { id: string; name: string };
type Customer = { id: string; name: string };
type Reservation = { id: string; facilityId: string; unitId: string; label: string };

export function MoveInWorkspace({ facilities, units, customers, reservations, action }: { facilities: Facility[]; units: Unit[]; customers: Customer[]; reservations: Reservation[]; action: (data: FormData) => void | Promise<void> }) {
  const [facilityId, setFacilityId] = useState(facilities[0]?.id ?? "");
  const [selectedId, setSelectedId] = useState("");
  const [filterMode, setFilterMode] = useState<"size" | "area">("size");
  const [filterKey, setFilterKey] = useState("ALL");
  const [find, setFind] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const available = useMemo(() => units.filter((unit) => unit.facilityId === facilityId && ["AVAILABLE", "RESERVED"].includes(unit.status)), [units, facilityId]);
  const groups = useMemo(() => {
    const counts = new Map<string, { type: string; measure: string; count: number }>();
    available.forEach((unit) => {
      const measure = filterMode === "area" ? (unit.area?.toFixed(1) ?? "Not set") : unit.width && unit.length ? `${unit.width.toFixed(1)} × ${unit.length.toFixed(1)} m` : "Not set";
      const key = `${unit.typeName}|${measure}`;
      const current = counts.get(key); counts.set(key, { type: unit.typeName, measure, count: (current?.count ?? 0) + 1 });
    });
    return [...counts.entries()].map(([key, value]) => ({ key, ...value }));
  }, [available, filterMode]);
  const visible = available.filter((unit) => {
    const measure = filterMode === "area" ? (unit.area?.toFixed(1) ?? "Not set") : unit.width && unit.length ? `${unit.width.toFixed(1)} × ${unit.length.toFixed(1)} m` : "Not set";
    return (filterKey === "ALL" || filterKey === `${unit.typeName}|${measure}`) && (!find || unit.number.toLowerCase().includes(find.toLowerCase()));
  });
  const selected = units.find((unit) => unit.id === selectedId);

  return <div className="page-stack">
    <PageHeader eyebrow="Operations centre · Accounts" title="Move in" description={step === 1 ? "Select an available unit using size or floor-area availability." : "Complete the customer and account details for the selected unit."}/>
    <div className="move-in-steps"><span className="active">1 Select unit</span><span className={step === 2 ? "active" : ""}>2 Account details</span></div>
    {step === 1 ? <section className="unit-selector-layout">
      <article className="panel unit-results"><div className="unit-toolbar"><label>Store<select value={facilityId} onChange={(event) => { setFacilityId(event.target.value); setSelectedId(""); setFilterKey("ALL"); }}>{facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}</select></label><label className="unit-find"><Search size={16}/><input value={find} onChange={(event) => setFind(event.target.value)} placeholder="Find unit number"/></label><strong>{visible.length} units</strong></div>
        <div className="table-wrap"><table className="data-table unit-table"><thead><tr><th>Unit</th><th>Type</th><th>Size</th><th>Area</th><th>Rent</th><th>Floor</th><th>Features</th><th>Status</th></tr></thead><tbody>{visible.map((unit) => <tr key={unit.id} className={selectedId === unit.id ? "selected" : ""} onClick={() => setSelectedId(unit.id)}><td><input aria-label={`Select unit ${unit.number}`} type="radio" checked={selectedId === unit.id} onChange={() => setSelectedId(unit.id)}/> <strong>{unit.number}</strong></td><td>{unit.typeName}</td><td>{unit.width && unit.length ? `${unit.width.toFixed(1)} × ${unit.length.toFixed(1)} m` : "—"}</td><td>{unit.area?.toFixed(1) ?? "—"} m²</td><td>R {unit.monthlyRate.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</td><td>{unit.floor || "—"}</td><td>{unit.features.join(", ") || unit.zone || "—"}</td><td>{unit.status === "AVAILABLE" ? "Vacant" : "Reserved"}</td></tr>)}</tbody></table></div>
      </article>
      <aside className="unit-filter-panel"><section className="panel"><h3>Selected unit</h3><strong className="selected-unit-number">{selected?.number ?? "None"}</strong></section><section className="panel"><h3>Filter</h3><div className="filter-toggle"><label><input type="radio" checked={filterMode === "size"} onChange={() => { setFilterMode("size"); setFilterKey("ALL"); }}/>Size</label><label><input type="radio" checked={filterMode === "area"} onChange={() => { setFilterMode("area"); setFilterKey("ALL"); }}/>Area</label></div><button type="button" className={filterKey === "ALL" ? "filter-row active" : "filter-row"} onClick={() => setFilterKey("ALL")}><span>Vacant units</span><strong>{available.length}</strong></button>{groups.map((group) => <button type="button" className={filterKey === group.key ? "filter-row active" : "filter-row"} onClick={() => setFilterKey(group.key)} key={group.key}><span>{group.type}<small>{group.measure}</small></span><strong>{group.count}</strong></button>)}</section><section className="panel"><h3>Note</h3><p>{selected ? `${selected.typeName}, ${selected.area?.toFixed(1) ?? "area not set"} m² at R ${selected.monthlyRate.toLocaleString("en-ZA")} per month.` : "Select a unit to continue."}</p></section></aside>
    </section> : <section className="panel panel-spacious"><form action={action} className="move-in-form"><input type="hidden" name="facilityId" value={selected?.facilityId ?? facilityId}/><input type="hidden" name="unitId" value={selectedId}/><label>Selected unit<input value={selected ? `${selected.number} · ${selected.typeName} · R ${selected.monthlyRate.toLocaleString("en-ZA")}` : ""} readOnly/></label><label>Customer<select name="customerId" required><option value="">Select customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label><label>Reservation (optional)<select name="reservationId"><option value="">Direct move-in</option>{reservations.filter((item) => item.unitId === selectedId).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Start date<input name="startDate" type="date" defaultValue={new Date().toISOString().slice(0,10)} required/></label><label>Monthly rent<input name="monthlyRate" type="number" step=".01" defaultValue={selected?.monthlyRate}/></label><label>Initial charge<input name="initialCharge" type="number" step=".01" defaultValue="0"/></label><div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setStep(1)}><ArrowLeft size={16}/>Back</button><button className="button button-primary">Complete move-in</button></div></form></section>}
    {step === 1 ? <div className="form-footer"><button className="button button-secondary" type="button" onClick={() => history.back()}><ArrowLeft size={16}/>Back</button><button className="button button-primary" type="button" disabled={!selectedId} onClick={() => setStep(2)}>Next<ArrowRight size={16}/></button></div> : null}
  </div>;
}
