import { createFileRoute } from "@tanstack/react-router";
import { OverviewPage } from "@/modules/dashboard/OverviewPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview - HumanISE.info" },
      { name: "description", content: "People and teams of HumanISE at a glance: researchers, teams, research areas and data quality." },
      { property: "og:title", content: "Overview - HumanISE.info" },
      { property: "og:description", content: "People and teams of HumanISE at a glance." },
    ],
  }),
  component: OverviewPage,
});
