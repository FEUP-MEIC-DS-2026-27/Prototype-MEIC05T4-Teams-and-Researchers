import { createFileRoute } from "@tanstack/react-router";
import { ResearchersPage, type ResearchersSearch } from "@/modules/researchers/ResearchersPage";

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

export const Route = createFileRoute("/researchers/")({
  validateSearch: (s: { q?: unknown; team?: unknown; area?: unknown; category?: unknown; status?: unknown; sort?: unknown; view?: unknown; page?: unknown }): ResearchersSearch => ({
    q: str(s.q),
    team: str(s.team),
    area: str(s.area),
    category: str(s.category),
    status: str(s.status),
    sort: str(s.sort) as ResearchersSearch["sort"],
    view: s.view === "cards" ? "cards" : undefined,
    page: typeof s.page === "number" && s.page > 1 ? s.page : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Researchers - HumanISE.info" },
      { name: "description", content: "Search HumanISE researchers by name, competence, team, research area and academic category." },
      { property: "og:title", content: "Researchers - HumanISE.info" },
      { property: "og:description", content: "Search HumanISE researchers by name, competence, team and area." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return <ResearchersPage search={search} setSearch={(patch) => navigate({ search: (prev) => ({ ...prev, page: undefined, ...patch }), replace: true })} />;
}
