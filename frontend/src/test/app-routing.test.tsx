import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it.each(["/researchers", "/researchers/r01", "/teams", "/teams/isl"])(
    "matches the teams-and-researchers page %s",
    (path) => {
      const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

      expect(router.matchRoutes(path).at(-1)?.routeId).not.toBe(rootRouteId);
    },
  );

  it.each(["/areas", "/areas/hci", "/collaborations"])(
    "does not register the unrelated page %s",
    (path) => {
      const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

      expect(router.matchRoutes(path).at(-1)?.routeId).toBe(rootRouteId);
    },
  );
});
