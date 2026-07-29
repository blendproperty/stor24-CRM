import { clsx } from "clsx";

export type StatusTone = "neutral" | "positive" | "warning" | "danger";

export function StatusPill({
  tone = "neutral",
  children,
}: {
  tone?: StatusTone;
  children: React.ReactNode;
}) {
  return (
    <span className={clsx("status-pill", `status-${tone}`)}>{children}</span>
  );
}
