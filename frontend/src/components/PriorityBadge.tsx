import type { TicketPriority } from "@/lib/types";

const STYLES: Record<TicketPriority, string> = {
  LOW: "border-border text-muted",
  MEDIUM: "border-warn/40 text-warn",
  HIGH: "border-accent/50 text-accent",
};

export default function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs font-medium whitespace-nowrap ${STYLES[priority]}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          priority === "HIGH" ? "bg-accent" : priority === "MEDIUM" ? "bg-warn" : "bg-muted"
        }`}
      />
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}
