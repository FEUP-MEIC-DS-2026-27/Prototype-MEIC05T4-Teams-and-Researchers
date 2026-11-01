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
  const normalizedBaseUrl = baseUrl.trim().replace(/\/+$/, "");
  if (!normalizedBaseUrl) {
    throw new Error("API Gateway base URL is required.");
  }

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    if (options.body !== undefined) headers.set("Content-Type", "application/json");

    const token = getToken?.();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(`${normalizedBaseUrl}${path}`, { ...options, headers });
    const body = await response.text();

    if (!response.ok) {
      let message = body;
      try {
        const parsed: unknown = JSON.parse(body);
        if (
          parsed &&
          typeof parsed === "object" &&
          "message" in parsed &&
          typeof parsed.message === "string"
        ) {
          message = parsed.message;
        }
      } catch {
        // Keep the response body as the error detail when it is not JSON.
      }

      throw new Error(
        message
          ? `API request failed (${response.status}): ${message}`
          : `API request failed (${response.status} ${response.statusText}).`,
      );
    }

    if (!body) {
      throw new Error(`API request returned an empty response for ${path}.`);
    }

    try {
      return JSON.parse(body) as T;
    } catch {
      throw new Error(`API request returned invalid JSON for ${path}.`);
    }
  }

  return {
    listTeams: () => request<Team[]>("/teams"),
    listAreas: () => request<ResearchArea[]>("/research-areas"),
    listResearchers: () => request<Researcher[]>("/researchers"),
    createTeam: (input) =>
      request<Team>("/teams", { method: "POST", body: JSON.stringify(input) }),
    updateTeam: (id, input) =>
      request<Team>(`/teams/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
  };
}
