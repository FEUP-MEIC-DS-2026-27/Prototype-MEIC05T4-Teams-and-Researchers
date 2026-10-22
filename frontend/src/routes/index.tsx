import { createFileRoute } from "@tanstack/react-router";
import { OverviewPage } from "@/modules/dashboard/OverviewPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview - HumanISE.info" },
      { name: "description", content: "HumanISE researchers and teams at a glance." },
      { property: "og:title", content: "Overview - HumanISE.info" },
      { property: "og:description", content: "People and teams of HumanISE at a glance." },
    ],
  }),
  component: OverviewPage,
});
