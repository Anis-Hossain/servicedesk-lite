import type { TicketStatus } from "@/lib/types";

const STYLES: Record<TicketStatus, string> = {
  OPEN: "bg-primary-light text-primary-dark",
  IN_PROGRESS: "bg-warn-light text-warn",
  WAITING_FOR_CUSTOMER: "bg-accent-light text-accent",
  RESOLVED: "bg-success-light text-success",
};

const LABELS: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  WAITING_FOR_CUSTOMER: "Waiting for Customer",
  RESOLVED: "Resolved",
};

export default function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium whitespace-nowrap ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
