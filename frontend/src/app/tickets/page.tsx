"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Button, Card, EmptyState, ErrorState, Input, LoadingState, PageHeader, Select } from "@/components/ui";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { listTickets } from "@/lib/api";
import type { Ticket, TicketPriority, TicketStatus } from "@/lib/types";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [priority, setPriority] = useState<TicketPriority | "">("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listTickets({ search, status, priority });
      setTickets(data);
    } catch {
      setError("Couldn't load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, priority]);

  return (
    <AppShell>
      <PageHeader
        title="Tickets"
        description="Search and manage all customer support tickets"
        actions={
          <Link href="/tickets/new">
            <Button>New Ticket</Button>
          </Link>
        }
      />

      <Card className="p-4 mb-4">
        <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Search by subject or customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value as TicketStatus | "")}>
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_FOR_CUSTOMER">Waiting for Customer</option>
            <option value="RESOLVED">Resolved</option>
          </Select>
          <Select value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority | "")}>
            <option value="">All priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </Select>
        </div>
      </Card>

      {loading && <LoadingState label="Loading tickets…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && tickets && tickets.length === 0 && (
        <EmptyState
          title="No tickets match your filters"
          description="Try adjusting your search or filters, or create a new ticket."
          action={
            <Link href="/tickets/new" className="mt-2">
              <Button variant="secondary">New Ticket</Button>
            </Link>
          }
        />
      )}

      {!loading && !error && tickets && tickets.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-bg cursor-pointer">
                    <td className="px-4 py-3">
                      <Link href={`/tickets/${t.id}`} className="font-medium text-ink hover:text-primary">
                        {t.subject}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{t.customerName}</td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {new Date(t.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AppShell>
  );
}
