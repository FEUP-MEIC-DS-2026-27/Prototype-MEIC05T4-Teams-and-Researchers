import type { ResearchArea, Researcher, Team, TeamInput } from "./types";

/** Contract with the People, Roles & Teams service, reached through the API Gateway. */
export interface TeamsApi {
  listTeams(): Promise<Team[]>;
  listAreas(): Promise<ResearchArea[]>;
  listResearchers(): Promise<Researcher[]>;
  createTeam(input: TeamInput): Promise<Team>;
  updateTeam(id: string, input: TeamInput): Promise<Team>;
}

export function createHttpApi(_baseUrl: string, _getToken?: () => string | undefined): TeamsApi {
  const notImplemented = () => Promise.reject(new Error("HTTP API not implemented yet."));
  return {
    listTeams: notImplemented,
    listAreas: notImplemented,
    listResearchers: notImplemented,
    createTeam: notImplemented,
    updateTeam: notImplemented,
  };
}
