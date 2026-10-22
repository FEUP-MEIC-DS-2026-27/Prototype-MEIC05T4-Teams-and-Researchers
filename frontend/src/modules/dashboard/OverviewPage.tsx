import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Layers, RefreshCw, UserCheck, Users } from "lucide-react";
import { HBarChart } from "@/components/shared/HBarChart";
import { AvatarStack, PageHeader, Section, SeverityIcon, StatCard } from "@/components/shared/ui-bits";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  compositionByCategory,
  compositionByTeam,
  coordinatorOf,
  membersOf,
  multiTeamCount,
  overviewMetrics,
  qualityAlerts,
} from "@/modules/data/queries";
import { useData } from "@/modules/data/store";

export function OverviewPage() {
  const { data, lastUpdated, refresh, refreshing, hydrated } = useData();
  const navigate = useNavigate();
  const m = overviewMetrics(data);
  const alerts = qualityAlerts(data);
  const loading = refreshing || !hydrated;

  return (
    <>
      <PageHeader
        title="People & teams"
        description="Who integrates HumanISE, how teams are organised and which records need attention."
        meta={<span aria-live="polite">Last updated {lastUpdated.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} · demo data</span>}
        actions={
          <Button variant="outline" onClick={refresh} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} /> {refreshing ? "Refreshing…" : "Refresh data"}
          </Button>
        }
      />

      <div className="grid grid-cols-12 gap-4 lg:gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="col-span-12 h-[132px] rounded-xl sm:col-span-6 xl:col-span-4" />)
        ) : (
          <>
            <StatCard label="Researchers" value={m.total} icon={Users} hint="View all" to="/researchers" />
            <StatCard label="Active researchers" value={m.active} icon={UserCheck} hint="View active" to="/researchers" search={{ status: "active" }} />
            <StatCard label="Teams" value={m.teams} icon={Layers} hint="View teams" to="/teams" />
          </>
        )}

        <Section
          className="col-span-12 lg:col-span-8"
          title="Researchers per team"
          description={`Unique people per team. ${multiTeamCount(data)} researchers belong to more than one team, so bars add up to more than ${m.total}.`}
        >
          {loading ? <Skeleton className="h-56" /> : (
            <HBarChart data={compositionByTeam(data)} labelWidth={56} onSelect={(d) => navigate({ to: "/teams/$id", params: { id: d.id } })} />
          )}
          <p className="mt-2 text-xs text-muted-foreground">Click a bar to open the team.</p>
        </Section>

        <Section className="col-span-12 lg:col-span-4" title="Academic category" description="Each researcher counted once.">
          {loading ? <Skeleton className="h-56" /> : (
            <HBarChart data={compositionByCategory(data).map((d) => ({ ...d, label: d.label.replace("Postdoctoral", "Postdoc").replace(" Professor", " Prof.") }))} labelWidth={118} onSelect={(d) => navigate({ to: "/researchers", search: { category: d.id } })} />
          )}
        </Section>

        <Section className="col-span-12 lg:col-span-8" title="Teams" description="Coordinator, members and research areas." actions={<Link to="/teams" className="text-sm font-medium text-primary hover:underline">All teams</Link>}>
          <ul className="divide-y divide-border">
            {data.teams.map((t) => {
              const members = membersOf(data, t.id);
              const coord = coordinatorOf(data, t.id);
              return (
                <li key={t.id}>
                  <Link to="/teams/$id" params={{ id: t.id }} className="-mx-2 flex flex-col gap-2 rounded-lg px-2 py-3 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:gap-4">
                    <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-semibold text-accent-foreground">{t.acronym}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{t.name}</span>
                      <span className="block text-xs text-muted-foreground">Coordinator: {coord?.name ?? "- not assigned"}</span>
                    </span>
                    <AvatarStack names={members.map((x) => x.researcher.name)} max={4} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section className="col-span-12 lg:col-span-4" title="Data quality" description={`${alerts.length} record${alerts.length === 1 ? "" : "s"} need attention.`}>
          {alerts.length === 0 ? (
            <p className="flex items-center gap-2 rounded-lg bg-success-soft p-3 text-sm text-success"><CheckCircle2 className="h-4 w-4" /> All records look complete and up to date.</p>
          ) : (
            <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {alerts.map((a) => (
                <li key={a.id}>
                  <Link
                    to={a.target.type === "team" ? "/teams/$id" : "/researchers/$id"}
                    params={{ id: a.target.id }}
                    className="flex gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/40 hover:bg-accent/50"
                  >
                    <SeverityIcon severity={a.severity} />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">{a.title} · <span className="font-normal">{a.target.name}</span></span>
                      <span className="block text-xs text-muted-foreground">{a.reason}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </>
  );
}
