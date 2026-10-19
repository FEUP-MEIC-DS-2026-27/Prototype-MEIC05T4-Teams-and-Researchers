import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <g className="stroke-primary-foreground" strokeWidth="1.6" fill="none">
        <path d="M9 10 L16 16 L23 10 M16 16 L16 23 M9 10 L9 21 L16 23 L23 21 L23 10" opacity="0.7" />
      </g>
      <g className="fill-primary-foreground">
        <circle cx="9" cy="10" r="2.4" /><circle cx="23" cy="10" r="2.4" /><circle cx="16" cy="16" r="2.8" />
        <circle cx="9" cy="21" r="2" /><circle cx="23" cy="21" r="2" /><circle cx="16" cy="23" r="2" />
      </g>
    </svg>
  );
}

export function Wordmark({ collapsed }: { collapsed?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      {!collapsed && (
        <span className="text-[17px] font-semibold tracking-tight text-sidebar-accent-foreground">
          HumanISE<span className="text-sidebar-primary">.info</span>
        </span>
      )}
    </span>
  );
}
