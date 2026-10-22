import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronRight, LayoutDashboard, Menu, PanelLeftClose, PanelLeftOpen, Search, UserRound, Users } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getResearcher, getTeam } from "@/modules/data/queries";
import { useData, type DemoRole } from "@/modules/data/store";
import { Wordmark } from "./Logo";
import { Avatar, selectClass } from "./ui-bits";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/researchers", label: "Researchers", icon: UserRound },
  { to: "/teams", label: "Teams", icon: Users },
] as const;

function NavList({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Main" className="flex flex-col gap-1 px-3">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? path === "/" : path.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-sidebar-primary")} aria-hidden />
            {!collapsed && <span>{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function ProfileFooter({ collapsed }: { collapsed?: boolean }) {
  const { data, actingId, role } = useData();
  const me = actingId ? getResearcher(data, actingId) : undefined;
  const name = me?.name ?? "Guest visitor";
  const inner = (
    <>
      <Avatar name={name} size="sm" className="ring-sidebar" />
      {!collapsed && (
        <span className="min-w-0 text-left">
          <span className="block truncate text-sm font-medium text-sidebar-accent-foreground">{name}</span>
          <span className="block text-xs capitalize text-sidebar-foreground/70">{role} · demo</span>
        </span>
      )}
    </>
  );
  return (
    <div className="border-t border-sidebar-border p-3">
      {me ? (
        <Link to="/researchers/$id" params={{ id: me.id }} className={cn("flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent/60", collapsed && "justify-center")}>{inner}</Link>
      ) : (
        <div className={cn("flex items-center gap-3 p-2", collapsed && "justify-center")}>{inner}</div>
      )}
    </div>
  );
}

function useCrumbs() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data } = useData();
  const parts = path.split("/").filter(Boolean);
  const crumbs: { label: string; to?: string }[] = [{ label: "Overview", to: "/" }];
  if (parts[0] === "researchers") {
    crumbs.push({ label: "Researchers", to: "/researchers" });
    if (parts[1]) crumbs.push({ label: getResearcher(data, parts[1])?.name ?? "Unknown" });
  } else if (parts[0] === "teams") {
    crumbs.push({ label: "Teams", to: "/teams" });
    if (parts[1]) crumbs.push({ label: getTeam(data, parts[1])?.name ?? "Unknown" });
  }
  return crumbs;
}

function Header({ onMenu }: { onMenu: () => void }) {
  const crumbs = useCrumbs();
  const { role, setRole } = useData();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/researchers", search: { q: q.trim() || undefined } });
  };
  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur md:px-8">
      <button onClick={onMenu} className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden" aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </button>
      <nav aria-label="Breadcrumb" className="hidden min-w-0 flex-1 lg:block">
        <ol className="flex items-center gap-1.5 text-sm">
          {crumbs.map((c, i) => (
            <li key={i} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" aria-hidden />}
              {c.to && i < crumbs.length - 1 ? (
                <Link to={c.to} className="text-muted-foreground hover:text-foreground">{c.label}</Link>
              ) : (
                <span className="truncate font-medium text-foreground" aria-current="page">{c.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <form onSubmit={submit} role="search" className="relative min-w-0 flex-1 lg:max-w-xs">
        <label htmlFor="global-search" className="sr-only">Search researchers by name or competence</label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input id="global-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or competence…" className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring" />
      </form>
      <div className="flex items-center gap-2">
        <label htmlFor="demo-role" className="hidden text-xs font-medium uppercase tracking-wide text-muted-foreground sm:block">Demo role</label>
        <select id="demo-role" aria-label="Demo role" value={role} onChange={(e) => setRole(e.target.value as DemoRole)} className={cn(selectClass, "h-9 bg-muted")}>
          <option value="visitor">Visitor</option>
          <option value="researcher">Researcher</option>
          <option value="coordinator">Coordinator</option>
        </select>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col bg-sidebar transition-[width] duration-200 md:flex", collapsed ? "w-[72px]" : "w-[240px]")}>
        <div className={cn("flex h-[72px] items-center px-5", collapsed && "justify-center px-0")}>
          <Link to="/" aria-label="HumanISE.info home"><Wordmark collapsed={collapsed} /></Link>
        </div>
        <div className="flex-1 overflow-y-auto pt-2"><NavList collapsed={collapsed} /></div>
        <button onClick={() => setCollapsed((c) => !c)} className={cn("mx-3 mb-2 flex h-9 items-center gap-2 rounded-lg px-3 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground", collapsed && "justify-center px-0")} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /> Collapse</>}
        </button>
        <ProfileFooter collapsed={collapsed} />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-[260px] flex-col border-sidebar-border bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-[72px] items-center px-5"><Wordmark /></div>
          <div className="flex-1"><NavList onNavigate={() => setMobileOpen(false)} /></div>
          <ProfileFooter />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-6 lg:p-8">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
        <footer className="px-4 pb-6 text-xs text-muted-foreground md:px-8">
          HumanISE.info prototype · team 1MEIC05-t4 · all records are fictitious demo data.
        </footer>
      </div>
    </div>
  );
}
