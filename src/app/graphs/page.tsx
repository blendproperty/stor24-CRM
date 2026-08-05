import { Activity, BarChart3, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Graphs" };

const bars = [58, 66, 71, 76, 73, 81, 84, 88, 90, 89, 92, 94];
const revenue = [72, 78, 75, 82, 84, 87, 85, 91, 93, 94, 96, 98];

export default function GraphsPage() {
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Performance" title="Graphs" description="Modern replacements for the observed monthly graphs, with facility and portfolio comparisons." />
      <section className="analytics-toolbar panel"><label>Facility<select><option>Stor24 Randburg</option><option>All permitted facilities</option></select></label><label>Period<select><option>Rolling 12 months</option><option>Year to date</option><option>Previous calendar year</option></select></label><span>Synthetic demonstration data</span></section>
      <section className="dashboard-grid">
        <article className="panel panel-spacious">
          <div className="panel-heading"><div><h2>Occupancy trend</h2><p className="panel-subtitle">Rolling 12 months</p></div><TrendingUp className="positive-icon" /></div>
          <div className="bar-chart" aria-label="Synthetic occupancy trend">
            {bars.map((height, index) => <span key={index} style={{ height: `${height}%` }}><i>{height}%</i></span>)}
          </div>
        </article>
        <article className="panel panel-spacious">
          <div className="panel-heading"><h2>Portfolio snapshot</h2><BarChart3 className="muted-icon" /></div>
          <div className="score-list">
            {[["Physical occupancy", "91.6%", 92], ["Economic occupancy", "88.4%", 88], ["Autopay adoption", "76.0%", 76], ["Lead conversion", "34.2%", 34]].map(([label, value, width]) => (
              <div key={label as string}><span><strong>{label}</strong><b>{value}</b></span><i><em style={{ width: `${width}%` }} /></i></div>
            ))}
          </div>
        </article>
      </section>
      <section className="dashboard-grid">
        <article className="panel panel-spacious"><div className="panel-heading"><div><h2>Revenue index</h2><p className="panel-subtitle">Normalised trend; May 2026 = 72</p></div><Activity className="positive-icon" /></div><div className="bar-chart revenue-chart" aria-label="Synthetic revenue index">{revenue.map((height, index) => <span key={index} style={{ height: `${height}%` }}><i>{height}</i></span>)}</div></article>
        <article className="panel panel-spacious"><div className="panel-heading"><div><h2>Decision signals</h2><p className="panel-subtitle">Visible thresholds with no unsupported prediction claims</p></div><TrendingUp className="muted-icon" /></div><div className="signal-list"><div><span className="signal-dot positive"/><p><strong>Occupancy above target</strong><small>91.6% against a synthetic 90% target</small></p></div><div><span className="signal-dot warning"/><p><strong>Economic gap requires review</strong><small>3.2 percentage points below physical occupancy</small></p></div><div><span className="signal-dot neutral"/><p><strong>Provider metrics unavailable</strong><small>Autopay and delivery analytics require live connections</small></p></div></div></article>
      </section>
    </div>
  );
}

