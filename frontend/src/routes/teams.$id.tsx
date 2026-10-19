import { createFileRoute } from "@tanstack/react-router";
import { TeamDetail } from "@/modules/teams/TeamDetail";

export const Route = createFileRoute("/teams/$id")({
  head: () => ({
    meta: [
      { title: "Team - HumanISE.info" },
      { name: "description", content: "HumanISE team overview: objectives, coordinator, members, roles and research areas." },
      { property: "og:title", content: "Team - HumanISE.info" },
      { property: "og:description", content: "Objectives, coordinator, members and research areas of a HumanISE team." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <TeamDetail id={id} />;
}
