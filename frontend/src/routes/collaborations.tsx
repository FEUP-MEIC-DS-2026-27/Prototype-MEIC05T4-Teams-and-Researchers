import { createFileRoute, Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { useState } from "react";
import { PageHeader, Section, selectClass } from "@/components/shared/ui-bits";
import { cn } from "@/lib/utils";
import { collaborationEdges, getResearcher, getTeam, initials } from "@/modules/data/queries";
import { useData } from "@/modules/data/store";

export const Route = createFileRoute("/collaborations")({
  head: () => ({
    meta: [
      { title: "Collaborations - HumanISE.info" },
      { name: "description", content: "Network of HumanISE researchers connected by shared team participation." },
      { property: "og:title", content: "Collaborations - HumanISE.info" },
      { property: "og:description", content: "Researchers connected by shared team participation." },
    ],
  }),
  component: CollaborationsPage,
});

const SIZE = 560;
const C = SIZE / 2;

function CollaborationsPage() {
  const { data } = useData();
  const [focus, setFocus] = useState<string>("");
  const edges = collaborationEdges(data.memberships);
  // Order nodes by their first team so team clusters sit together on the ring.
  const firstTeam = (id: string) => data.teams.findIndex((t) => data.memberships.some((m) => m.researcherId === id && m.teamId === t.id));
  const nodes = [...data.researchers].sort((a, b) => firstTeam(a.id) - firstTeam(b.id) || a.name.localeCompare(b.name));
  const pos = new Map(nodes.map((n, i) => {
    const ang = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return [n.id, { x: C + Math.cos(ang) * (C - 48), y: C + Math.sin(ang) * (C - 48) }];
  }));
  const linked = (id: string) => edges.filter((e) => e.a === id || e.b === id);
  const focusEdges = focus ? linked(focus) : [];
  const neighbours = new Set(focusEdges.flatMap((e) => [e.a, e.b]));

  return (
    <>
      <PageHeader title="Collaborations" description="Who works alongside whom, based only on shared team participation." />
      <div className="grid grid-cols-12 gap-4 lg:gap-6">
        <Section className="col-span-12 lg:col-span-8" title="Shared-team network" description="A line connects two researchers who belong to at least one common team. Thicker lines = more teams shared.">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto w-full max-w-[560px]" role="img" aria-label="Collaboration network">
            {edges.map((e) => {
              const a = pos.get(e.a)!, b = pos.get(e.b)!;
              const on = !focus || e.a === focus || e.b === focus;
              return <line key={e.a + e.b} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={e.teams.length * 1.2} className={cn("transition-opacity duration-200", on ? "stroke-primary" : "stroke-border")} opacity={focus ? (on ? 0.8 : 0.25) : 0.22} />;
            })}
            {nodes.map((n) => {
              const p = pos.get(n.id)!;
              const active = focus === n.id, near = neighbours.has(n.id);
              return (
                <g key={n.id} transform={`translate(${p.x},${p.y})`} onClick={() => setFocus(active ? "" : n.id)} className="cursor-pointer" tabIndex={0} role="button" aria-label={n.name} onKeyDown={(e) => e.key === "Enter" && setFocus(active ? "" : n.id)}>
                  <circle r={active ? 20 : 16} className={cn("stroke-card transition-all duration-150", active ? "fill-primary" : near ? "fill-chart-3" : focus ? "fill-muted" : "fill-sidebar")} strokeWidth={3} />
                  <text textAnchor="middle" dy="4" className={cn("pointer-events-none text-[10px] font-semibold", active || near || !focus ? "fill-primary-foreground" : "fill-muted-foreground")}>{initials(n.name)}</text>
                  <title>{n.name}</title>
                </g>
              );
            })}
          </svg>
        </Section>
        <Section className="col-span-12 lg:col-span-4" title="Explore a researcher">
          <label htmlFor="focus" className="mb-1 block text-xs font-medium text-muted-foreground">Researcher</label>
          <select id="focus" value={focus} onChange={(e) => setFocus(e.target.value)} className={cn(selectClass, "w-full")}>
            <option value="">- Select or click a node -</option>
            {[...data.researchers].sort((a, b) => a.name.localeCompare(b.name)).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          {focus ? (
            <ul className="mt-4 max-h-[380px] space-y-2 overflow-y-auto">
              {focusEdges.length === 0 && <li className="text-sm text-muted-foreground">No shared teams.</li>}
              {focusEdges.map((e) => {
                const other = getResearcher(data, e.a === focus ? e.b : e.a)!;
                return (
                  <li key={other.id}>
                    <Link to="/researchers/$id" params={{ id: other.id }} className="block rounded-lg border border-border p-3 hover:border-primary/40 hover:bg-accent/40">
                      <span className="block text-sm font-medium">{other.name}</span>
                      <span className="text-xs text-muted-foreground">Shared: {e.teams.map((t) => getTeam(data, t)?.acronym).join(", ")}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 flex gap-2 rounded-lg bg-accent p-3 text-xs text-accent-foreground"><Info className="h-4 w-4 shrink-0" /> Connections show organisational proximity only. They are not a measure of productivity or ranking.</p>
          )}
        </Section>
      </div>
    </>
  );
}
