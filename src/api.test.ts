import { createHttpApi } from "./api";
import type { Team, TeamInput } from "./types";

const team: Team = {
  id: "team/1",
  name: "Interaction Lab",
  description: "Interactive systems research.",
  areaIds: ["hci"],
  leaderId: "researcher-1",
  updatedAt: "2026-01-15T10:00:00.000Z",
};

const teamInput: TeamInput = {
  name: team.name,
  description: team.description,
  areaIds: team.areaIds,
  leaderId: team.leaderId,
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("createHttpApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads teams and attaches the current bearer token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([team]));
    vi.stubGlobal("fetch", fetchMock);
    const api = createHttpApi("https://gateway.example/api///", () => "access-token");

    await expect(api.listTeams()).resolves.toEqual([team]);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://gateway.example/api/teams");
    const headers = new Headers(options.headers);
    expect(headers.get("Accept")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer access-token");
  });

  it("loads areas and researchers from their endpoints", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse([{ id: "hci", name: "HCI" }]))
      .mockResolvedValueOnce(jsonResponse([{ id: "researcher-1", name: "Ana Ribeiro" }]));
    vi.stubGlobal("fetch", fetchMock);
    const api = createHttpApi("/gateway");

    await expect(api.listAreas()).resolves.toEqual([{ id: "hci", name: "HCI" }]);
    await expect(api.listResearchers()).resolves.toEqual([
      { id: "researcher-1", name: "Ana Ribeiro" },
    ]);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "/gateway/research-areas",
      "/gateway/researchers",
    ]);
  });

  it("creates and updates teams with JSON payloads", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(team, 201))
      .mockResolvedValueOnce(jsonResponse(team));
    vi.stubGlobal("fetch", fetchMock);
    const api = createHttpApi("https://gateway.example");

    await expect(api.createTeam(teamInput)).resolves.toEqual(team);
    await expect(api.updateTeam(team.id, teamInput)).resolves.toEqual(team);
    const createOptions = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const updateOptions = fetchMock.mock.calls[1]?.[1] as RequestInit;
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "https://gateway.example/teams",
      "https://gateway.example/teams/team%2F1",
    ]);
    expect(createOptions.method).toBe("POST");
    expect(createOptions.body).toBe(JSON.stringify(teamInput));
    expect(new Headers(createOptions.headers).get("Content-Type")).toBe("application/json");
    expect(updateOptions.method).toBe("PUT");
    expect(updateOptions.body).toBe(JSON.stringify(teamInput));
  });

  it("surfaces API errors from JSON responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ message: "Unavailable" }, 503)));
    const api = createHttpApi("/gateway");

    await expect(api.listTeams()).rejects.toThrow("API request failed (503): Unavailable");
  });

  it("rejects an empty API Gateway URL", () => {
    expect(() => createHttpApi(" /// ")).toThrow("API Gateway base URL is required.");
  });
});
