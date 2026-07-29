import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  DoorOpen,
  TrendingUp,
  Users,
} from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { dashboardMetrics, reminders, recentActivity } from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Operations centre"
        title="Good afternoon, Brett"
        description="A live view of Stor24 occupancy, collections and today’s facility workload."
        action={
          <Link className="button button-primary" href="/operations/move-in">
            <DoorOpen size={17} />
            New move-in
          </Link>
        }
      />

      <section className="metric-grid" aria-label="Portfolio metrics">
        <MetricCard
          label="Physical occupancy"
          value={dashboardMetrics.occupancy}
          detail="+1.8% this month"
          icon={DoorOpen}
          tone="orange"
        />
        <MetricCard
          label="Occupied units"
          value={dashboardMetrics.occupiedUnits}
          detail="of 486 rentable units"
          icon={TrendingUp}
        />
        <MetricCard
          label="Receivables"
          value={dashboardMetrics.receivables}
          detail="23 accounts overdue"
          icon={CreditCard}
          tone="warning"
        />
        <MetricCard
          label="Active leads"
          value={dashboardMetrics.activeLeads}
          detail="8 need follow-up today"
          icon={Users}
          tone="green"
        />
      </section>

      <section className="dashboard-grid">
        <article className="panel panel-spacious">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Today</p>
              <h2>Priority work queue</h2>
            </div>
            <Link className="text-link" href="/operations">
              View operations <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="work-list">
            {reminders.map((item) => (
              <Link className="work-row" href={item.href} key={item.label}>
                <span className={`work-icon work-icon-${item.tone}`}>
                  <item.icon size={18} />
                </span>
                <span className="work-copy">
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
                <span className="work-count">{item.count}</span>
              </Link>
            ))}
          </div>
        </article>

        <article className="panel panel-spacious">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Facility pulse</p>
              <h2>Today at Stor24 Randburg</h2>
            </div>
            <CalendarClock className="muted-icon" size={21} />
          </div>
          <div className="timeline">
            {recentActivity.map((activity) => (
              <div className="timeline-row" key={`${activity.time}-${activity.title}`}>
                <span className="timeline-dot" />
                <div>
                  <div className="timeline-meta">
                    <span>{activity.time}</span>
                    <StatusPill tone={activity.tone}>{activity.status}</StatusPill>
                  </div>
                  <strong>{activity.title}</strong>
                  <p>{activity.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel panel-spacious">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Readiness</p>
            <h2>Cloud rollout foundations</h2>
          </div>
          <StatusPill tone="positive">
            <CheckCircle2 size={13} /> Scaffold active
          </StatusPill>
        </div>
        <div className="readiness-grid">
          {[
            ["Tenant lifecycle", "Lead, reservation, move-in, transfer and move-out"],
            ["Financial subledger", "Charges, invoices, payments, allocation and reconciliation"],
            ["Scoped permissions", "Organisation, facility, role and approval boundaries"],
            ["Integration gateway", "Payments, access, communications, accounting and webhooks"],
          ].map(([title, copy]) => (
            <div className="readiness-item" key={title}>
              <CheckCircle2 size={18} />
              <div>
                <strong>{title}</strong>
                <p>{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
