import { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-surface border border-border rounded ${className}`}>{children}</div>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "bg-surface border border-border text-ink hover:bg-bg",
    danger: "bg-surface border border-accent/40 text-accent hover:bg-accent-light",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="block text-sm font-medium text-ink mb-1.5" {...props} />;
}

export function Input({ error, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div>
      <input
        className={`w-full rounded border px-3 py-2 text-sm bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          error ? "border-accent" : "border-border"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-accent">{error}</p>}
    </div>
  );
}

export function Textarea({ error, className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <div>
      <textarea
        className={`w-full rounded border px-3 py-2 text-sm bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          error ? "border-accent" : "border-border"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-accent">{error}</p>}
    </div>
  );
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded border border-border px-3 py-2 text-sm bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}
      {...props}
    />
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{title}</h1>
        {description && <p className="text-sm text-muted mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-muted text-sm py-16 justify-center">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center py-16">
      <AlertTriangle size={22} className="text-accent" />
      <p className="text-sm text-ink">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center py-16 border border-dashed border-border rounded">
      <Inbox size={22} className="text-muted" />
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="text-sm text-muted max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
