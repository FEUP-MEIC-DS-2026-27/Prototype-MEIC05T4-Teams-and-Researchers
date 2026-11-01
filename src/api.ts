import type { ResearchArea, Researcher, Team, TeamInput } from "./types";

/** Contract with the People, Roles & Teams service, reached through the API Gateway. */
export interface TeamsApi {
  listTeams(): Promise<Team[]>;
  listAreas(): Promise<ResearchArea[]>;
  listResearchers(): Promise<Researcher[]>;
  createTeam(input: TeamInput): Promise<Team>;
  updateTeam(id: string, input: TeamInput): Promise<Team>;
}

function errorMessage(status: number): string {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You don't have permission to do this.";
  return `The request failed (HTTP ${status}).`;
}

/**
 * REST client for the API Gateway. `getToken` is called on every request so the Shell
 * can refresh the token without remounting. The service must enforce admin-only writes
 * itself (403); `isAdmin` in the UI is only a convenience.
 */
export function createHttpApi(baseUrl: string, getToken?: () => string | undefined): TeamsApi {
  const root = baseUrl.replace(/\/+$/, "");

  async function request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
    const token = getToken?.();
    const res = await fetch(`${root}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) throw new Error(errorMessage(res.status));
    return (await res.json()) as T;
  }

  return {
    listTeams: () => request<Team[]>("/teams"),
    listAreas: () => request<ResearchArea[]>("/research-areas"),
    listResearchers: () => request<Researcher[]>("/researchers"),
    createTeam: (input) => request<Team>("/teams", "POST", input),
    updateTeam: (id, input) => request<Team>(`/teams/${encodeURIComponent(id)}`, "PUT", input),
  };
}
