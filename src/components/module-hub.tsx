import { ArrowUpRight, CheckCircle2, CircleDashed, Settings2 } from "lucide-react";
import type { ModuleGroup } from "@/lib/module-catalog";

const statusIcon = {
  Ready: CheckCircle2,
  Configure: Settings2,
  Planned: CircleDashed,
};

export function ModuleHub({ groups }: { groups: ModuleGroup[] }) {
  return (
    <div className="hub-stack">
      {groups.map((group) => (
        <section className="panel hub-section" key={group.title}>
          <div className="hub-heading">
            <div>
              <h2>{group.title}</h2>
              <p>{group.description}</p>
            </div>
            <span>{group.items.length} modules</span>
          </div>
          <div className="hub-grid">
            {group.items.map((item) => {
              const state = item.status ?? "Ready";
              const Icon = statusIcon[state];
              return (
                <article className="hub-card" key={item.title}>
                  <div className="hub-card-top">
                    <span className={`module-state module-state-${state.toLowerCase()}`}>
                      <Icon size={14} /> {state}
                    </span>
                    <ArrowUpRight size={16} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {item.evidence ? <small>Observed: {item.evidence}</small> : null}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

