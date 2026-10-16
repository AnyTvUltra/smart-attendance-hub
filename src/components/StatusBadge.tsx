import { STATUS_CLASS, STATUS_LABEL, type Status } from "@/lib/attendance";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold", STATUS_CLASS[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function StatCard({ label, value, status }: { label: string; value: number | string; status?: Status }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-soft">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-display text-3xl font-bold", status && STATUS_CLASS[status].split(" ").find((c) => c.startsWith("text-")))}>
        {value}
      </div>
    </div>
  );
}
