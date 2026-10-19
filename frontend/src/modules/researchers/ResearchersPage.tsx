import { Link } from "@tanstack/react-router";
import { ArrowDownAZ, ChevronLeft, ChevronRight, Download, LayoutGrid, Rows3, Search, SearchX, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, EmptyState, PageHeader, StatusBadge, Tag, fmtDate, selectClass } from "@/components/shared/ui-bits";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AREAS } from "@/modules/data/seed";
import { areaName, filterResearchers, getTeam, membershipsOf, researchersToCsv, sortTeamsByName, type ResearcherFilters } from "@/modules/data/queries";
import { useData } from "@/modules/data/store";
import { CATEGORIES, type Researcher } from "@/modules/data/types";

export interface ResearchersSearch extends ResearcherFilters {
  view?: "cards" | undefined;
  page?: number | undefined;
}

const PAGE_SIZE = 10;

export function ResearchersPage({ search, setSearch }: { search: ResearchersSearch; setSearch: (p: Partial<ResearchersSearch>) => void }) {
  const { data, hydrated } = useData();
  const list = filterResearchers(data, search);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(search.page ?? 1, pages);
  const visible = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = !!(search.q || search.team || search.area || search.category || search.status);
  const view = search.view ?? "table";

  const exportCsv = () => {
    const blob = new Blob([researchersToCsv(data, list)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `humanise-researchers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${list.length} researcher${list.length === 1 ? "" : "s"} to CSV`);
  };

  const sel = (id: keyof ResearchersSearch, label: string, options: { value: string; label: string }[]) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={`f-${id}`} className="text-xs font-medium text-muted-foreground">{label}</label>
      <select id={`f-${id}`} value={(search[id] as string) ?? ""} onChange={(e) => setSearch({ [id]: e.target.value || undefined })} className={cn(selectClass, "w-full")}>
        <option value="">All</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Researchers"
        description="People integrating HumanISE, their teams, research areas and competences."
        actions={<Button onClick={exportCsv} disabled={list.length === 0}><Download className="h-4 w-4" /> Export CSV</Button>}
      />

      <div className="surface mb-4 p-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-[minmax(220px,1.6fr)_repeat(4,minmax(0,1fr))_auto]">
          <div className="col-span-2 flex flex-col gap-1 md:col-span-3 xl:col-span-1">
            <label htmlFor="f-q" className="text-xs font-medium text-muted-foreground">Name or competence</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input id="f-q" value={search.q ?? ""} onChange={(e) => setSearch({ q: e.target.value || undefined })} placeholder="e.g. Accessibility" className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm focus-visible:outline-2 focus-visible:outline-ring" />
            </div>
          </div>
          {sel("team", "Team", sortTeamsByName(data.teams).map((t) => ({ value: t.id, label: t.name })))}
          {sel("area", "Research area", AREAS.map((a) => ({ value: a.id, label: a.name })))}
          {sel("category", "Category", CATEGORIES.map((c) => ({ value: c, label: c })))}
          {sel("status", "Status", [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }])}
          <div className="col-span-2 flex items-end gap-2 md:col-span-1">
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="f-sort" className="flex items-center gap-1 text-xs font-medium text-muted-foreground"><ArrowDownAZ className="h-3.5 w-3.5" /> Sort</label>
              <select id="f-sort" value={search.sort ?? "name"} onChange={(e) => setSearch({ sort: e.target.value === "name" ? undefined : (e.target.value as ResearchersSearch["sort"]) })} className={selectClass}>
                <option value="name">Name A–Z</option>
                <option value="-name">Name Z–A</option>
                <option value="category">Category</option>
                <option value="updated">Recently updated</option>
              </select>
            </div>
            <div className="flex rounded-lg border border-input p-0.5" role="group" aria-label="View">
              <button aria-pressed={view === "table"} aria-label="Table view" onClick={() => setSearch({ view: undefined })} className={cn("rounded-md p-2", view === "table" ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground")}><Rows3 className="h-4 w-4" /></button>
              <button aria-pressed={view === "cards"} aria-label="Cards view" onClick={() => setSearch({ view: "cards" })} className={cn("rounded-md p-2", view === "cards" ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground")}><LayoutGrid className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
        {hasFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground"><span className="font-semibold text-foreground tabular">{list.length}</span> result{list.length === 1 ? "" : "s"}</span>
            <Button variant="ghost" size="sm" onClick={() => setSearch({ q: undefined, team: undefined, area: undefined, category: undefined, status: undefined })}><X className="h-3.5 w-3.5" /> Clear filters</Button>
          </div>
        )}
      </div>

      {!hydrated ? (
        <div className="surface space-y-3 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : list.length === 0 ? (
        <div className="surface">
          <EmptyState icon={SearchX} title="No researchers match these filters" description="Try another name or competence, or remove a filter to widen the search." action={<Button variant="outline" onClick={() => setSearch({ q: undefined, team: undefined, area: undefined, category: undefined, status: undefined })}>Clear filters</Button>} />
        </div>
      ) : view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visible.map((r) => <ResearcherCard key={r.id} r={r} />)}</div>
      ) : (
        <ResearcherTable list={visible} />
      )}

      {list.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span className="tabular">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, list.length)} of {list.length}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setSearch({ page: page - 1 > 1 ? page - 1 : undefined })} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="tabular">Page {page} / {pages}</span>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setSearch({ page: page + 1 })} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </>
  );
}

function TeamsCell({ r }: { r: Researcher }) {
  const { data } = useData();
  const ms = membershipsOf(data, r.id);
  if (!ms.length) return <span className="text-xs text-muted-foreground">No team</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {ms.map((m) => <Tag key={m.teamId} tone="teal">{getTeam(data, m.teamId)?.acronym}{m.role === "Coordinator" ? " · Coord." : ""}</Tag>)}
    </div>
  );
}

function ResearcherTable({ list }: { list: Researcher[] }) {
  return (
    <div className="surface overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Researcher</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Category</th>
            <th className="px-4 py-3 font-medium">Teams</th>
            <th className="hidden px-4 py-3 font-medium lg:table-cell">Competences</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {list.map((r) => (
            <tr key={r.id} className="group h-14 transition-colors hover:bg-accent/40">
              <td className="px-4 py-2">
                <Link to="/researchers/$id" params={{ id: r.id }} className="flex items-center gap-3 rounded-md focus-visible:outline-2">
                  <Avatar name={r.name} />
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground group-hover:text-primary">{r.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{r.affiliation}</span>
                  </span>
                </Link>
              </td>
              <td className="hidden px-4 py-2 text-muted-foreground md:table-cell">{r.category}</td>
              <td className="px-4 py-2"><TeamsCell r={r} /></td>
              <td className="hidden px-4 py-2 lg:table-cell">
                <div className="flex flex-wrap gap-1">
                  {r.skills.slice(0, 3).map((s) => <Tag key={s}>{s}</Tag>)}
                  {r.skills.length > 3 && <span className="text-xs text-muted-foreground">+{r.skills.length - 3}</span>}
                  {r.skills.length === 0 && <span className="text-xs text-warning">None listed</span>}
                </div>
              </td>
              <td className="hidden px-4 py-2 sm:table-cell"><StatusBadge status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResearcherCard({ r }: { r: Researcher }) {
  return (
    <Link to="/researchers/$id" params={{ id: r.id }} className="surface interactive flex h-full min-h-[220px] flex-col p-5">
      <div className="flex items-start gap-3">
        <Avatar name={r.name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.category}</p>
        </div>
        <StatusBadge status={r.status} />
      </div>
      <div className="mt-4"><TeamsCell r={r} /></div>
      <p className="mt-3 line-clamp-1 text-xs text-muted-foreground">{r.areaIds.map(areaName).join(" · ")}</p>
      <div className="mt-auto flex flex-wrap gap-1 pt-4">
        {r.skills.slice(0, 3).map((s) => <Tag key={s}>{s}</Tag>)}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">Updated {fmtDate(r.updatedAt)}</p>
    </Link>
  );
}
