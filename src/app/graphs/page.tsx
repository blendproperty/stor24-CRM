import { BarChart3, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Graphs" };

const bars = [58, 66, 71, 76, 73, 81, 84, 88, 90, 89, 92, 94];

export default function GraphsPage() {
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Performance" title="Graphs" description="Modern replacements for the observed monthly graphs, with facility and portfolio comparisons." />
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
    </div>
  );
}

