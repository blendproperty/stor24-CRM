"use client";

import { useState } from "react";
import { Map as MapIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";

const statusMeta = {
  Vacant: { count: 598, className: "unit-vacant" },
  Rented: { count: 21, className: "unit-rented" },
  Scheduled: { count: 1, className: "unit-scheduled" },
  Reserved: { count: 1, className: "unit-reserved" },
  Unavailable: { count: 2, className: "unit-unavailable" },
  "Future move-in": { count: 0, className: "unit-future" },
  Overlocked: { count: 0, className: "unit-overlocked" },
} as const;

type UnitStatus = keyof typeof statusMeta;

const featuredUnits: { number: string; size: string; status: UnitStatus; rate: string }[] = [
  { number: "3216", size: "5 × 5", status: "Vacant", rate: "R 740" },
  { number: "3001", size: "10 × 15", status: "Vacant", rate: "R 1,850" },
  { number: "2116", size: "10 × 20", status: "Vacant", rate: "R 2,200" },
  { number: "1017", size: "5 × 10", status: "Scheduled", rate: "R 1,050" },
  { number: "1101", size: "10 × 20", status: "Reserved", rate: "R 2,200" },
  { number: "1102", size: "5 × 10", status: "Rented", rate: "R 1,050" },
  { number: "1004", size: "5 × 10", status: "Unavailable", rate: "R 1,050" },
];

const filler = Array.from({ length: 72 }, (_, index) => ({
  number: String(2001 + index),
  size: index % 4 === 0 ? "10 × 15" : index % 3 === 0 ? "5 × 10" : "5 × 5",
  status: (index % 17 === 0 ? "Rented" : "Vacant") as UnitStatus,
  rate: index % 4 === 0 ? "R 1,850" : "R 740",
}));

export default function MapPage() {
  const [filter, setFilter] = useState<UnitStatus | "All">("All");
  const [selected, setSelected] = useState(featuredUnits[1]);
  const units = [...featuredUnits, ...filler].filter((unit) => filter === "All" || unit.status === filter);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Visual inventory" title="Facility map" description="A responsive map based on the observed SiteLink colour states, with filterable unit status and contextual details." action={<button className="button button-primary"><MapIcon size={16} /> Edit layout</button>} />
      <section className="map-layout">
        <aside className="panel map-legend">
          <button className={filter === "All" ? "legend-active" : ""} onClick={() => setFilter("All")}><span className="legend-all" />All units<strong>623</strong></button>
          {(Object.entries(statusMeta) as [UnitStatus, (typeof statusMeta)[UnitStatus]][]).map(([status, meta]) => (
            <button className={filter === status ? "legend-active" : ""} key={status} onClick={() => setFilter(status)}>
              <span className={meta.className} />{status}<strong>{meta.count}</strong>
            </button>
          ))}
        </aside>
        <div className="panel facility-plan">
          <div className="unit-grid">
            {units.map((unit, index) => (
              <button className={`map-unit ${statusMeta[unit.status].className} ${selected.number === unit.number ? "map-unit-selected" : ""}`} key={`${unit.number}-${index}`} onClick={() => setSelected(unit)} title={`${unit.number} · ${unit.status}`}>
                {unit.number}
              </button>
            ))}
          </div>
        </div>
        <aside className="panel unit-inspector">
          <p className="eyebrow">Selected unit</p>
          <h2>{selected.number}</h2>
          <span className={`unit-status-chip ${statusMeta[selected.status].className}`}>{selected.status}</span>
          <dl>
            <div><dt>Type</dt><dd>Self storage</dd></div>
            <div><dt>Size</dt><dd>{selected.size}</dd></div>
            <div><dt>Standard rate</dt><dd>{selected.rate}</dd></div>
            <div><dt>Floor</dt><dd>Ground</dd></div>
          </dl>
          <button className="button button-primary">Open unit record</button>
        </aside>
      </section>
    </div>
  );
}

