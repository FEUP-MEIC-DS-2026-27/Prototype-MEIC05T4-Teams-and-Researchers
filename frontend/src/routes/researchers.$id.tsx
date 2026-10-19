import { createFileRoute } from "@tanstack/react-router";
import { ResearcherProfile } from "@/modules/researchers/ResearcherProfile";

export const Route = createFileRoute("/researchers/$id")({
  head: () => ({
    meta: [
      { title: "Researcher profile - HumanISE.info" },
      { name: "description", content: "Profile of a HumanISE researcher: teams, roles, research areas, competences and related work." },
      { property: "og:title", content: "Researcher profile - HumanISE.info" },
      { property: "og:description", content: "Teams, roles, research areas and competences of a HumanISE researcher." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <ResearcherProfile id={id} />;
}
