import { afterEach, describe, expect, it, vi } from "vitest";
import { loadTeams } from "../teamsOverviewApi";

describe("Teams Overview API", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("loads the Teams Overview response from the configured API", async () => {
    const teams = [{ id: "team-1", name: "Alpha Team", status: "active", memberCount: 5 }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => teams,
    });
    vi.stubEnv("PUBLIC_USE_MOCK", "false");
    vi.stubEnv("PUBLIC_TEAMS_API_URL", "http://localhost:8082/api/");
    vi.stubGlobal("fetch", fetchMock);

    await expect(loadTeams()).resolves.toEqual(teams);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8082/api/teams", {
      headers: { Accept: "application/json" },
    });
  });

  it("reports HTTP errors instead of falling back to mock data", async () => {
    vi.stubEnv("PUBLIC_USE_MOCK", "false");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    await expect(loadTeams()).rejects.toThrow("Teams API error (503).");
  });

  it("rejects responses that do not match the Teams Overview contract", async () => {
    vi.stubEnv("PUBLIC_USE_MOCK", "false");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ id: "team-1", name: "Alpha Team", status: "active", memberCount: "five" }],
      }),
    );

    await expect(loadTeams()).rejects.toThrow("The Teams API returned an unexpected response.");
  });
});
