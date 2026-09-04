"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Headset, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { Button, Input, Label } from "@/components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("agent@servicedesk.local");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ form: err.message });
      } else {
        setErrors({ form: "Something went wrong. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-9 w-9 rounded bg-primary-dark flex items-center justify-center">
            <Headset size={18} className="text-white" />
          </div>
          <span className="text-lg font-semibold text-ink">ServiceDesk Lite</span>
        </div>

        <div className="bg-surface border border-border rounded p-6">
          <h1 className="text-lg font-semibold text-ink mb-1">Support staff sign in</h1>
          <p className="text-sm text-muted mb-6">Sign in to manage customer support tickets.</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />
            </div>

            {errors.form && (
              <div className="rounded border border-accent/40 bg-accent-light text-accent text-sm px-3 py-2">
                {errors.form}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting && <Loader2 size={15} className="animate-spin" />}
              Sign in
            </Button>
          </form>
        </div>

        <div className="mt-4 bg-surface border border-border rounded p-4 text-xs text-muted">
          <p className="font-medium text-ink mb-1">Demo accounts</p>
          <p>agent@servicedesk.local / Agent123!</p>
          <p>admin@servicedesk.local / Admin123!</p>
        </div>
      </div>
    </div>
  );
}
