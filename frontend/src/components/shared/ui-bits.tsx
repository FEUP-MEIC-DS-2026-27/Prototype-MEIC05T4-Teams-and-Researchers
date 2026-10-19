import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Inbox, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/modules/data/queries";

export function PageHeader({ title, description, actions, meta }: { title: string; description?: ReactNode; actions?: ReactNode; meta?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-[30px] md:leading-9">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground md:text-[15px]">{description}</p>}
        {meta && <div className="mt-2 text-xs text-muted-foreground">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Section({ title, description, actions, children, className }: { title: string; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("surface p-5 md:p-6", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

const AVATAR_TONES = ["bg-accent text-accent-foreground", "bg-secondary text-foreground", "bg-primary text-primary-foreground", "bg-sidebar text-sidebar-accent-foreground"];

export function Avatar({ name, size = "md", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const tone = AVATAR_TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONES.length];
  const s = size === "sm" ? "h-7 w-7 text-[11px]" : size === "lg" ? "h-16 w-16 text-xl" : "h-9 w-9 text-xs";
  return (
    <span aria-hidden className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-card", s, tone, className)}>
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ names, max = 5 }: { names: string[]; max?: number }) {
  return (
    <div className="flex shrink-0 items-center">
      <div className="flex -space-x-1">
        {names.slice(0, max).map((n) => (
          <Avatar key={n} name={n} size="sm" />
        ))}
      </div>
      <span className="ml-2 whitespace-nowrap text-xs text-muted-foreground tabular">
        {names.length} member{names.length === 1 ? "" : "s"}
      </span>
    </div>
  );
}

export function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "teal" }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs", tone === "teal" ? "border-primary/20 bg-accent text-accent-foreground" : "border-border bg-muted text-muted-foreground")}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: "active" | "inactive" }) {
  return status === "active" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      <XCircle className="h-3.5 w-3.5" aria-hidden /> Inactive
    </span>
  );
}

export function SeverityIcon({ severity }: { severity: "warning" | "error" }) {
  return severity === "error" ? (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive-soft text-destructive"><XCircle className="h-4 w-4" aria-label="Error" /></span>
  ) : (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning"><AlertTriangle className="h-4 w-4" aria-label="Warning" /></span>
  );
}

export function StatCard({ label, value, icon: Icon, hint, to, search }: { label: string; value: number; icon: LucideIcon; hint?: string; to: string; search?: Record<string, string> }) {
  return (
    <Link
      to={to}
      search={search as never}
      className="surface interactive group col-span-12 flex flex-col gap-3 p-5 sm:col-span-6 xl:col-span-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary"><Icon className="h-4 w-4" aria-hidden /></span>
      </div>
      <span className="text-3xl font-semibold tracking-tight text-foreground tabular md:text-[34px]">{value}</span>
      {hint && <span className="text-xs text-muted-foreground group-hover:text-primary">{hint} →</span>}
    </Link>
  );
}

export function EmptyState({ title, description, action, icon: Icon = Inbox }: { title: string; description: string; action?: ReactNode; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-primary"><Icon className="h-5 w-5" aria-hidden /></span>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Field({ label, htmlFor, help, error, children }: { label: string; htmlFor: string; help?: string; error?: string | null; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">{label}</label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="flex items-center gap-1 text-xs text-destructive"><XCircle className="h-3.5 w-3.5" aria-hidden />{error}</p>
      ) : help ? (
        <p id={`${htmlFor}-help`} className="text-xs text-muted-foreground">{help}</p>
      ) : null}
    </div>
  );
}

export const selectClass =
  "h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-ring";

export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
