"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Download, Filter, LockKeyhole } from "lucide-react";
import type { ReportDefinition } from "@/lib/reporting";

export function ReportsWorkspace({ reports, canExport, canSchedule }: { reports: readonly ReportDefinition[]; canExport: boolean; canSchedule: boolean }) {
  const [group, setGroup] = useState("All");
  const [reportKey, setReportKey] = useState(reports[0]?.key ?? "");
  const [from, setFrom] = useState("2026-05-01");
  const [to, setTo] = useState("2026-07-31");
  const groups = useMemo(() => ["All", ...new Set(reports.map((report) => report.group))], [reports]);
  const visible = group === "All" ? reports : reports.filter((report) => report.group === group);
  const exportHref = `/api/v1/reports/export?${new URLSearchParams({ reportKey, from, to, format: "CSV", groupBy: "month" })}`;

  return (
    <div className="report-workspace">
      <section className="panel panel-spacious report-parameters">
        <div className="panel-heading"><div><h2>Report parameters</h2><p className="panel-subtitle">Date and facility scope are validated server-side for every run.</p></div><Filter className="muted-icon" /></div>
        <div className="parameter-grid">
          <label>Report<select value={reportKey} onChange={(event) => setReportKey(event.target.value)}>{reports.map((report) => <option value={report.key} key={report.key}>{report.name}</option>)}</select></label>
          <label>From<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
          <label>To<input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
          <label>Facility<select><option>All permitted facilities</option><option>Stor24 Randburg</option></select></label>
        </div>
        <div className="report-actions">
          {canExport ? <a className="button button-primary" href={exportHref}><Download size={16} /> Export CSV</a> : <span className="permission-note"><LockKeyhole size={15} /> Your role can view but not export.</span>}
          <button className="button button-secondary" disabled={!canSchedule} title={canSchedule ? "Create a scheduled report" : "Your role cannot schedule reports"}><CalendarClock size={16} /> Schedule report</button>
        </div>
      </section>
      <div className="filter-tabs">{groups.map((item) => <button className={group === item ? "active" : ""} onClick={() => setGroup(item)} key={item}>{item}</button>)}</div>
      <section className="report-card-grid">
        {visible.map((report) => <article className="panel report-card" key={report.key}><span>{report.group}</span><h3>{report.name}</h3><p>{report.description}</p><small>{report.formats.join(" / ")} · permission: {report.permission}</small></article>)}
      </section>
    </div>
  );
}
