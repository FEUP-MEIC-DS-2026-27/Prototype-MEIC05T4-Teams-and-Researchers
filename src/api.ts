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
  const root = baseUrl.trim().replace(/\/+$/, "");
  if (!root) throw new Error("API Gateway base URL is required.");

  async function request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
    const token = getToken?.();
    const headers = {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${root}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const responseBody = await response.text();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(errorMessage(response.status));
      }

      let detail = responseBody;
      try {
        const parsed: unknown = JSON.parse(responseBody);
        if (
          parsed &&
          typeof parsed === "object" &&
          "message" in parsed &&
          typeof parsed.message === "string"
        ) {
          detail = parsed.message;
        } else {
          detail = "";
        }
      } catch {
        // Keep a non-JSON response body as the error detail.
      }

      throw new Error(
        detail
          ? `API request failed (${response.status}): ${detail} (HTTP ${response.status}).`
          : errorMessage(response.status),
      );
    }

    if (!responseBody) {
      throw new Error(`The API returned an empty response for ${path}.`);
    }

    try {
      return JSON.parse(responseBody) as T;
    } catch {
      throw new Error(`The API returned invalid JSON for ${path}.`);
    }
  }

  return {
    listTeams: () => request<Team[]>("/teams"),
    listAreas: () => request<ResearchArea[]>("/research-areas"),
    listResearchers: () => request<Researcher[]>("/researchers"),
    createTeam: (input) => request<Team>("/teams", "POST", input),
    updateTeam: (id, input) => request<Team>(`/teams/${encodeURIComponent(id)}`, "PUT", input),
  };
}
