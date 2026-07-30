import { CalendarDays, Clock3 } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Calendar" };

const days = [
  ["Mon 03", "4", "Move-outs · 2", "Lead follow-ups · 2"],
  ["Tue 04", "6", "Rate reviews · 3", "Collections · 3"],
  ["Wed 05", "3", "Move-ins · 2", "Inspection · 1"],
  ["Thu 06", "8", "Autopay retry · 5", "Viewings · 3"],
  ["Fri 07", "5", "Daily close · 1", "Tenant tasks · 4"],
];

export default function CalendarPage() {
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Work scheduling" title="Calendar" description="One facility-aware calendar for move activity, lead follow-ups, collections, rates and operational tasks." />
      <section className="calendar-grid">
        {days.map(([day, count, first, second]) => (
          <article className="calendar-day" key={day}>
            <div><CalendarDays size={18} /><strong>{day}</strong><span>{count} items</span></div>
            <p><Clock3 size={14} /> {first}</p>
            <p><Clock3 size={14} /> {second}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

