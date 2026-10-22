import type { ResearchArea, Researcher, Team, TeamInput } from "./types";

/** Contract with the People, Roles & Teams service, reached through the API Gateway. */
export interface TeamsApi {
  listTeams(): Promise<Team[]>;
  listAreas(): Promise<ResearchArea[]>;
  listResearchers(): Promise<Researcher[]>;
  createTeam(input: TeamInput): Promise<Team>;
  updateTeam(id: string, input: TeamInput): Promise<Team>;
}

export function createHttpApi(baseUrl: string, getToken?: () => string | undefined): TeamsApi {
  const root = baseUrl.replace(/\/$/, "");

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = getToken?.();
    const res = await fetch(`${root}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      throw new Error(body?.message ?? `Request failed (${res.status})`);
    }
    return res.json() as Promise<T>;
  }

  return {
    listTeams: () => request("/teams"),
    listAreas: () => request("/research-areas"),
    listResearchers: () => request("/researchers"),
    createTeam: (input) => request("/teams", { method: "POST", body: JSON.stringify(input) }),
    updateTeam: (id, input) =>
      request(`/teams/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) }),
  };
}
