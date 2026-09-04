"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Button, Card, ErrorState, Label, LoadingState, Select, Textarea } from "@/components/ui";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { useToast } from "@/lib/toast-context";
import { useAuth } from "@/lib/auth-context";
import {
  addTicketComment,
  deleteTicket,
  getTicket,
  listStaff,
  updateTicketStatus,
} from "@/lib/api";
import type { Staff, Ticket, TicketStatus } from "@/lib/types";

const STATUS_OPTIONS: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED"];

export default function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { show } = useToast();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [t] = await Promise.all([getTicket(Number(id))]);
      setTicket(t);
      listStaff().then(setStaff).catch(() => {});
    } catch {
      setError("Couldn't load this ticket. It may have been deleted.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleStatusChange(status: TicketStatus) {
    if (!ticket) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateTicketStatus(ticket.id, status);
      setTicket(updated);
      show("Ticket status updated", "success");
    } catch {
      show("Couldn't update status. Please try again.", "error");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleAddComment(e: FormEvent) {
    e.preventDefault();
    if (!ticket || !comment.trim()) return;
    setSubmittingComment(true);
    try {
      const updated = await addTicketComment(ticket.id, user?.fullName || "Support Agent", comment.trim());
      setTicket(updated);
      setComment("");
      show("Note added", "success");
    } catch {
      show("Couldn't add the note. Please try again.", "error");
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleDelete() {
    if (!ticket) return;
    if (!confirm("Delete this ticket? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteTicket(ticket.id);
      show("Ticket deleted", "success");
      router.push("/tickets");
    } catch {
      show("Couldn't delete the ticket. Please try again.", "error");
      setDeleting(false);
    }
  }

  return (
    <AppShell>
      <Link href="/tickets" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft size={15} /> Back to tickets
      </Link>

      {loading && <LoadingState label="Loading ticket…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && ticket && (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                  </div>
                  <h1 className="text-xl font-semibold text-ink">{ticket.subject}</h1>
                  <p className="text-xs text-muted mt-1">
                    Ticket #{ticket.id} · Created {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
                <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                  <Trash2 size={15} />
                </Button>
              </div>
              <p className="text-sm text-ink mt-4 whitespace-pre-wrap">{ticket.description}</p>
            </Card>

            <Card className="p-6">
              <h2 className="text-sm font-semibold text-ink mb-4">Activity</h2>

              {ticket.comments.length === 0 ? (
                <p className="text-sm text-muted mb-4">No notes yet.</p>
              ) : (
                <ul className="space-y-4 mb-6">
                  {ticket.comments.map((c) => (
                    <li key={c.id} className="border-l-2 border-border pl-3">
                      <div className="flex items-center gap-2 text-xs text-muted mb-1">
                        <span className="font-medium text-ink">{c.authorName}</span>
                        <span>{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-ink whitespace-pre-wrap">{c.message}</p>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleAddComment} className="space-y-3">
                <Label htmlFor="comment">Add a note</Label>
                <Textarea
                  id="comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Log an update or internal note about this ticket…"
                />
                <Button type="submit" disabled={submittingComment || !comment.trim()}>
                  {submittingComment ? "Posting…" : "Add Note"}
                </Button>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-ink mb-4">Ticket Info</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-muted mb-1">Status</dt>
                  <dd>
                    <Select
                      value={ticket.status}
                      disabled={updatingStatus}
                      onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </option>
                      ))}
                    </Select>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted mb-1">Assigned to</dt>
                  <dd className="text-ink">{ticket.assignedToName || "Unassigned"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted mb-1">Last updated</dt>
                  <dd className="text-ink">{new Date(ticket.updatedAt).toLocaleString()}</dd>
                </div>
                {ticket.resolvedAt && (
                  <div>
                    <dt className="text-xs text-muted mb-1">Resolved</dt>
                    <dd className="text-ink">{new Date(ticket.resolvedAt).toLocaleString()}</dd>
                  </div>
                )}
              </dl>
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold text-ink mb-4">Customer</h2>
              <p className="text-sm font-medium text-ink">{ticket.customerName}</p>
              <p className="text-sm text-muted">{ticket.customerEmail}</p>
              <Link href={`/customers/${ticket.customerId}`} className="inline-block mt-3 text-sm text-primary hover:underline">
                View customer profile
              </Link>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}
