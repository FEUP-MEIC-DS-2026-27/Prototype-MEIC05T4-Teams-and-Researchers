import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { AvatarStack, PageHeader, Tag } from "@/components/shared/ui-bits";
import { areaName, coordinatorOf, membersOf, projectsForTeam, teamAreaIds } from "@/modules/data/queries";
import { useData } from "@/modules/data/store";

export const Route = createFileRoute("/teams/")({
  head: () => ({
    meta: [
      { title: "Teams - HumanISE.info" },
      { name: "description", content: "HumanISE research teams with coordinators, members and research areas." },
      { property: "og:title", content: "Teams - HumanISE.info" },
      { property: "og:description", content: "HumanISE research teams with coordinators, members and research areas." },
    ],
  }),
  component: TeamsPage,
});

function TeamsPage() {
  const { data } = useData();
  return (
    <>
      <PageHeader title="Teams" description="How HumanISE is organised: each team, who coordinates it and who takes part." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 lg:gap-6">
        {data.teams.map((t) => {
          const members = membersOf(data, t.id);
          const coord = coordinatorOf(data, t.id);
          return (
            <Link key={t.id} to="/teams/$id" params={{ id: t.id }} className="surface interactive flex flex-col p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-14 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-accent-foreground">{t.acronym}</span>
                <h2 className="text-lg font-semibold leading-tight text-foreground">{t.name}</h2>
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{t.description}</p>
              <p className="mt-4 flex items-center gap-1.5 text-sm text-foreground"><Crown className="h-4 w-4 text-primary" aria-hidden /> <span className="text-muted-foreground">Coordinator:</span> {coord?.name ?? "Not assigned"}</p>
              <div className="mt-3 flex flex-wrap gap-1">{teamAreaIds(data, t.id).slice(0, 4).map((a) => <Tag key={a}>{areaName(a)}</Tag>)}</div>
              <div className="mt-auto flex items-center justify-between border-t border-border pt-4 mt-5">
                <AvatarStack names={members.map((m) => m.researcher.name)} />
                <span className="text-xs text-muted-foreground tabular">{projectsForTeam(t.id).length} project(s)</span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
