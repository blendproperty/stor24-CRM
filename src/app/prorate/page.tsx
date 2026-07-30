"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function ProratePage() {
  const [rate, setRate] = useState(1850);
  const [day, setDay] = useState(17);
  const daysInMonth = 31;
  const result = useMemo(() => (rate / daysInMonth) * (daysInMonth - day + 1), [rate, day]);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Utility" title="Prorate calculator" description="Preview a transparent daily proration before applying it to a move-in, transfer or move-out." />
      <section className="calculator-card panel">
        <div className="calculator-icon"><Calculator size={28} /></div>
        <label>Monthly rate (ZAR)<input type="number" min="0" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></label>
        <label>Effective day<input type="number" min="1" max={daysInMonth} value={day} onChange={(event) => setDay(Number(event.target.value))} /></label>
        <div className="calculation-result"><span>Prorated charge</span><strong>R {result.toFixed(2)}</strong><small>{daysInMonth - day + 1} of {daysInMonth} days · R {(rate / daysInMonth).toFixed(2)} per day</small></div>
      </section>
    </div>
  );
}

