"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Button, Card, EmptyState, ErrorState, Input, Label, LoadingState, PageHeader } from "@/components/ui";
import { useToast } from "@/lib/toast-context";
import { createCustomer, listCustomers } from "@/lib/api";
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
  const { show } = useToast();
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setCustomers(await listCustomers(search));
    } catch {
      setError("Couldn't load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <AppShell>
      <PageHeader
        title="Customers"
        description="Everyone you provide support to"
        actions={
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus size={15} /> New Customer
          </Button>
        }
      />

      {showForm && (
        <NewCustomerForm
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      <Card className="p-4 mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search by name, email, or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {loading && <LoadingState label="Loading customers…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && customers && customers.length === 0 && (
        <EmptyState title="No customers found" description="Try a different search, or add a new customer." />
      )}

      {!loading && !error && customers && customers.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <Link key={c.id} href={`/customers/${c.id}`}>
              <Card className="p-4 h-full hover:border-primary/40 transition-colors">
                <p className="font-medium text-ink">{c.fullName}</p>
                <p className="text-sm text-muted">{c.company || "—"}</p>
                <p className="text-xs text-muted mt-1">{c.email}</p>
                <div className="flex items-center gap-3 mt-3 text-xs">
                  <span className="text-ink">{c.totalTickets} ticket{c.totalTickets === 1 ? "" : "s"}</span>
                  {c.openTickets > 0 && <span className="text-primary">{c.openTickets} open</span>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function NewCustomerForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { show } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Full name is required";
    if (!email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createCustomer({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), company: company.trim() });
      show("Customer created", "success");
      onCreated();
    } catch (err: any) {
      show(err?.message || "Couldn't create the customer.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink">New Customer</h2>
        <button onClick={onClose} className="text-muted hover:text-ink">
          <X size={16} />
        </button>
      </div>
      <form onSubmit={handleSubmit} noValidate className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} error={errors.fullName} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create Customer"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
