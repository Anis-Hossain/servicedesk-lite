"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Button, Card, Input, Label, PageHeader, Select, Textarea } from "@/components/ui";
import { useToast } from "@/lib/toast-context";
import { createTicket, listCustomers, listStaff } from "@/lib/api";
import type { Customer, Staff, TicketPriority } from "@/lib/types";

export default function NewTicketPage() {
  const router = useRouter();
  const { show } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [customerId, setCustomerId] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listCustomers().then(setCustomers).catch(() => show("Couldn't load customers", "error"));
    listStaff().then(setStaff).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validate() {
    const next: Record<string, string> = {};
    if (!subject.trim()) next.subject = "Subject is required";
    else if (subject.length > 200) next.subject = "Subject must be under 200 characters";
    if (!description.trim()) next.description = "Description is required";
    if (!customerId) next.customerId = "Select a customer";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const ticket = await createTicket({
        subject: subject.trim(),
        description: description.trim(),
        priority,
        customerId: Number(customerId),
        assignedToId: assignedToId ? Number(assignedToId) : null,
      });
      show("Ticket created", "success");
      router.push(`/tickets/${ticket.id}`);
    } catch {
      show("Couldn't create the ticket. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <PageHeader title="Create Ticket" description="Log a new customer support issue" />

      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} error={errors.subject} />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              placeholder="What is the customer experiencing? Include any relevant details."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Customer</Label>
              <Select id="customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Select a customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} — {c.company || c.email}
                  </option>
                ))}
              </Select>
              {errors.customerId && <p className="mt-1 text-xs text-accent">{errors.customerId}</p>}
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="assignee">Assign to (optional)</Label>
            <Select id="assignee" value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)}>
              <option value="">Unassigned</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create Ticket"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
