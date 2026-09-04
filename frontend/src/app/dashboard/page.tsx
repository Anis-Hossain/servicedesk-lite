"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Inbox, Clock, PauseCircle, CheckCircle2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Card, ErrorState, LoadingState, PageHeader, Button } from "@/components/ui";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { getDashboard } from "@/lib/api";
import type { DashboardSummary } from "@/lib/types";

const STAT_CARDS = [
  { key: "totalTickets", label: "Total Tickets", icon: Inbox, tone: "text-primary" },
  { key: "openTickets", label: "Open", icon: Inbox, tone: "text-primary" },
  { key: "inProgressTickets", label: "In Progress", icon: Clock, tone: "text-warn" },
  { key: "waitingForCustomerTickets", label: "Waiting for Customer", icon: PauseCircle, tone: "text-accent" },
  { key: "resolvedTickets", label: "Resolved", icon: CheckCircle2, tone: "text-success" },
] as const;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const summary = await getDashboard();
      setData(summary);
    } catch {
      setError("Couldn't load the dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Live overview of support activity"
        actions={
          <Link href="/tickets/new">
            <Button>New Ticket</Button>
          </Link>
        }
      />

      {loading && <LoadingState label="Loading dashboard…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && data && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {STAT_CARDS.map((stat) => (
              <Card key={stat.key} className="p-4">
                <stat.icon size={18} className={stat.tone} />
                <p className="text-2xl font-semibold text-ink mt-3">{data[stat.key]}</p>
                <p className="text-xs text-muted mt-0.5">{stat.label}</p>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-5 md:col-span-1">
              <h2 className="text-sm font-semibold text-ink mb-4">Tickets by Priority</h2>
              <div className="space-y-3">
                {(["HIGH", "MEDIUM", "LOW"] as const).map((p) => {
                  const count = data.ticketsByPriority[p] ?? 0;
                  const max = Math.max(1, data.totalTickets);
                  return (
                    <div key={p}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <PriorityBadge priority={p} />
                        <span className="text-muted">{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-bg overflow-hidden">
                        <div
                          className={`h-full ${p === "HIGH" ? "bg-accent" : p === "MEDIUM" ? "bg-warn" : "bg-muted"}`}
                          style={{ width: `${(count / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-5 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-ink">Recent Tickets</h2>
                <Link href="/tickets" className="text-xs text-primary hover:underline">
                  View all
                </Link>
              </div>

              {data.recentTickets.length === 0 ? (
                <p className="text-sm text-muted py-6 text-center">No tickets yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.recentTickets.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/tickets/${t.id}`}
                        className="flex items-center justify-between gap-3 py-3 hover:bg-bg -mx-1 px-1 rounded"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{t.subject}</p>
                          <p className="text-xs text-muted truncate">{t.customerName}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <PriorityBadge priority={t.priority} />
                          <StatusBadge status={t.status} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}
