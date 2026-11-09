export interface TeamOverview {
  id: string | number;
  name: string;
  status: string;
  memberCount: number;
}

const mockTeams: TeamOverview[] = [
  { id: "team-1", name: "Alpha Team", status: "active", memberCount: 5 },
  { id: "team-2", name: "Beta Team", status: "inactive", memberCount: 3 },
];

function isTeamOverview(value: unknown): value is TeamOverview {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const team = value as Record<string, unknown>;
  return (
    (typeof team.id === "string" || typeof team.id === "number") &&
    typeof team.name === "string" &&
    typeof team.status === "string" &&
    typeof team.memberCount === "number" &&
    Number.isInteger(team.memberCount) &&
    team.memberCount >= 0
  );
}

function isTeamOverviewList(value: unknown): value is TeamOverview[] {
  return Array.isArray(value) && value.every(isTeamOverview);
}

function apiUrl(): string {
  const url = import.meta.env.PUBLIC_TEAMS_API_URL || "/api/people";
  return url.replace(/\/+$/, "");
}

/** Use the same mock switch and teams endpoint as the VA1 Teams Overview. */
export function readTeams(): TeamOverview[] | undefined {
  return import.meta.env.PUBLIC_USE_MOCK === "false" ? undefined : mockTeams;
}

export async function loadTeams(): Promise<TeamOverview[]> {
  let response: Response;
  try {
    response = await fetch(`${apiUrl()}/teams`, {
      headers: { Accept: "application/json" },
    });
  } catch (cause) {
    throw new Error("Could not reach the Teams API.", { cause });
  }

  if (!response.ok) {
    throw new Error(`Teams API error (${response.status}).`);
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch (cause) {
    throw new Error("The Teams API returned invalid JSON.", { cause });
  }

  if (!isTeamOverviewList(result)) {
    throw new Error("The Teams API returned an unexpected response.");
  }

  return result;
}
