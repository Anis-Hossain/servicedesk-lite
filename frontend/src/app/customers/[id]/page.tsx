"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Button, Card, ErrorState, Input, Label, LoadingState, PageHeader } from "@/components/ui";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { useToast } from "@/lib/toast-context";
import { getCustomer, getCustomerTickets, updateCustomer } from "@/lib/api";
import type { Customer, Ticket } from "@/lib/types";

export default function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { show } = useToast();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [c, t] = await Promise.all([getCustomer(Number(id)), getCustomerTickets(Number(id))]);
      setCustomer(c);
      setTickets(t);
    } catch {
      setError("Couldn't load this customer. They may have been deleted.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <AppShell>
      <Link href="/customers" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft size={15} /> Back to customers
      </Link>

      {loading && <LoadingState label="Loading customer…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && customer && (
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <div className="space-y-6">
            <Card className="p-5">
              {editing ? (
                <EditCustomerForm
                  customer={customer}
                  onCancel={() => setEditing(false)}
                  onSaved={(updated) => {
                    setCustomer(updated);
                    setEditing(false);
                    show("Customer updated", "success");
                  }}
                />
              ) : (
                <>
                  <PageHeader
                    title={customer.fullName}
                    actions={
                      <Button variant="secondary" onClick={() => setEditing(true)}>
                        Edit
                      </Button>
                    }
                  />
                  <dl className="space-y-3 text-sm -mt-4">
                    {customer.company && (
                      <div className="flex items-center gap-2 text-ink">
                        <Building2 size={15} className="text-muted shrink-0" />
                        {customer.company}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-ink">
                      <Mail size={15} className="text-muted shrink-0" />
                      {customer.email}
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-ink">
                        <Phone size={15} className="text-muted shrink-0" />
                        {customer.phone}
                      </div>
                    )}
                  </dl>
                </>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold text-ink mb-3">Support Summary</h2>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-2xl font-semibold text-ink">{customer.totalTickets}</p>
                  <p className="text-xs text-muted">Total Tickets</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-primary">{customer.openTickets}</p>
                  <p className="text-xs text-muted">Open</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-ink">Ticket History</h2>
              <Link href={`/tickets/new`} className="text-xs text-primary hover:underline">
                New ticket for this customer
              </Link>
            </div>

            {tickets.length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">No tickets from this customer yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {tickets.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/tickets/${t.id}`}
                      className="flex items-center justify-between gap-3 py-3 hover:bg-bg -mx-1 px-1 rounded"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{t.subject}</p>
                        <p className="text-xs text-muted">
                          {new Date(t.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </p>
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
      )}
    </AppShell>
  );
}

function EditCustomerForm({
  customer,
  onCancel,
  onSaved,
}: {
  customer: Customer;
  onCancel: () => void;
  onSaved: (c: Customer) => void;
}) {
  const { show } = useToast();
  const [fullName, setFullName] = useState(customer.fullName);
  const [email, setEmail] = useState(customer.email);
  const [phone, setPhone] = useState(customer.phone || "");
  const [company, setCompany] = useState(customer.company || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Full name is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const updated = await updateCustomer(customer.id, {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
      });
      onSaved(updated);
    } catch {
      show("Couldn't save changes. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <Label htmlFor="edit-fullName">Full name</Label>
        <Input id="edit-fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} error={errors.fullName} />
      </div>
      <div>
        <Label htmlFor="edit-email">Email</Label>
        <Input id="edit-email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
      </div>
      <div>
        <Label htmlFor="edit-phone">Phone</Label>
        <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="edit-company">Company</Label>
        <Input id="edit-company" value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
