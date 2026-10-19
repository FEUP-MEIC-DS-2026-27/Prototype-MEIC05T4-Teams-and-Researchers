import { createFileRoute, Link } from "@tanstack/react-router";
import { Shapes } from "lucide-react";
import { Avatar, EmptyState, PageHeader, Section, Tag } from "@/components/shared/ui-bits";
import { Button } from "@/components/ui/button";
import { AREAS } from "@/modules/data/seed";
import { teamAreaIds } from "@/modules/data/queries";
import { useData } from "@/modules/data/store";

export const Route = createFileRoute("/areas/$id")({
  head: () => ({
    meta: [
      { title: "Research area - HumanISE.info" },
      { name: "description", content: "Researchers and teams working on a HumanISE research area." },
      { property: "og:title", content: "Research area - HumanISE.info" },
      { property: "og:description", content: "Researchers and teams working on a HumanISE research area." },
    ],
  }),
  component: AreaPage,
});

function AreaPage() {
  const { id } = Route.useParams();
  const { data } = useData();
  const area = AREAS.find((a) => a.id === id);
  if (!area) return <div className="surface"><EmptyState icon={Shapes} title="Area not found" description="This research area does not exist." action={<Button asChild variant="outline"><Link to="/areas">All areas</Link></Button>} /></div>;
  const people = data.researchers.filter((r) => r.areaIds.includes(id)).sort((a, b) => a.name.localeCompare(b.name));
  const teams = data.teams.filter((t) => teamAreaIds(data, t.id).includes(id));
  return (
    <>
      <PageHeader title={area.name} description={area.description} actions={<Button asChild variant="outline"><Link to="/researchers" search={{ area: id }}>Open in Researchers</Link></Button>} />
      <div className="grid grid-cols-12 gap-4 lg:gap-6">
        <Section className="col-span-12 lg:col-span-8" title={`Researchers (${people.length})`}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {people.map((r) => (
              <li key={r.id}><Link to="/researchers/$id" params={{ id: r.id }} className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent/50"><Avatar name={r.name} size="sm" /><span><span className="block text-sm font-medium">{r.name}</span><span className="text-xs text-muted-foreground">{r.category}</span></span></Link></li>
            ))}
          </ul>
        </Section>
        <Section className="col-span-12 lg:col-span-4" title={`Teams (${teams.length})`} description="Declared by the team or present through its members.">
          <div className="flex flex-wrap gap-2">{teams.map((t) => <Link key={t.id} to="/teams/$id" params={{ id: t.id }}><Tag tone="teal">{t.name}</Tag></Link>)}</div>
        </Section>
      </div>
    </>
  );
}
