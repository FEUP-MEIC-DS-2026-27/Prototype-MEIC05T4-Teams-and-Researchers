import { createFileRoute, Link } from "@tanstack/react-router";
import { AvatarStack, PageHeader } from "@/components/shared/ui-bits";
import { AREAS } from "@/modules/data/seed";
import { teamAreaIds } from "@/modules/data/queries";
import { useData } from "@/modules/data/store";

export const Route = createFileRoute("/areas/")({
  head: () => ({
    meta: [
      { title: "Research Areas - HumanISE.info" },
      { name: "description", content: "Research areas represented in HumanISE and the researchers and teams working on each." },
      { property: "og:title", content: "Research Areas - HumanISE.info" },
      { property: "og:description", content: "Research areas represented in HumanISE." },
    ],
  }),
  component: AreasPage,
});

function AreasPage() {
  const { data } = useData();
  return (
    <>
      <PageHeader title="Research Areas" description="Lines of investigation represented across HumanISE. A researcher can declare more than one area." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 lg:gap-6">
        {AREAS.map((a) => {
          const people = data.researchers.filter((r) => r.areaIds.includes(a.id));
          const teams = data.teams.filter((t) => teamAreaIds(data, t.id).includes(a.id));
          return (
            <Link key={a.id} to="/areas/$id" params={{ id: a.id }} className="surface interactive flex flex-col p-6">
              <h2 className="text-lg font-semibold text-foreground">{a.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
              <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                <AvatarStack names={people.map((p) => p.name)} max={4} />
                <span className="text-xs text-muted-foreground tabular">{teams.length} team{teams.length === 1 ? "" : "s"}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
