import type { ResearchArea, Researcher, Team, TeamErrors, TeamInput } from "./types";

/** Contract with the People, Roles & Teams service, reached through the API Gateway. */
export interface TeamsApi {
  listTeams(): Promise<Team[]>;
  listAreas(): Promise<ResearchArea[]>;
  listResearchers(): Promise<Researcher[]>;
  createTeam(input: TeamInput): Promise<Team>;
  updateTeam(id: string, input: TeamInput): Promise<Team>;
}

/** A non-2xx answer from the gateway. */
export class ApiError extends Error {
  readonly status: number;
  /** Problems the service attached to individual form fields, keyed like `TeamInput`. */
  readonly fieldErrors?: TeamErrors;

  constructor(message: string, status: number, fieldErrors?: TeamErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const TEAM_FIELDS: (keyof TeamInput)[] = ["name", "description", "areaIds", "leaderId"];

function errorMessage(status: number): string {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You don't have permission to do this.";
  return `The request failed (HTTP ${status}).`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Reads the `ApiError` body from docs/openapi.yaml. Anything else (HTML error pages, …) is ignored. */
function readErrorBody(text: string): { detail?: string; fieldErrors?: TeamErrors } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {};
  }
  if (!isRecord(parsed)) return {};

  const detail =
    typeof parsed.message === "string" && parsed.message.trim() ? parsed.message.trim() : undefined;

  let fieldErrors: TeamErrors | undefined;
  if (isRecord(parsed.fieldErrors)) {
    const found: TeamErrors = {};
    for (const field of TEAM_FIELDS) {
      const message = parsed.fieldErrors[field];
      if (typeof message === "string" && message.trim()) found[field] = message.trim();
    }
    if (Object.keys(found).length > 0) fieldErrors = found;
  }

  return { detail, fieldErrors };
}

function toApiError(status: number, body: string): ApiError {
  if (status === 401 || status === 403) return new ApiError(errorMessage(status), status);

  const { detail, fieldErrors } = readErrorBody(body);
  return new ApiError(
    detail ? `API request failed (${status}): ${detail}` : errorMessage(status),
    status,
    // docs/openapi.yaml: a 409 on a team write means the name is already taken.
    fieldErrors ?? (status === 409 ? { name: detail ?? "A team with this name already exists." } : undefined),
  );
}

const isString = (value: unknown): value is string => typeof value === "string";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isListOf<T>(isItem: (value: unknown) => value is T): (value: unknown) => value is T[] {
  return (value): value is T[] => Array.isArray(value) && value.every(isItem);
}

// `updatedAt` is not checked: the UI never reads it and the ERD has no such column (docs/openapi.yaml).
function isTeam(value: unknown): value is Team {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isString(value.description) &&
    isStringArray(value.areaIds) &&
    isString(value.leaderId)
  );
}

function isLookup(value: unknown): value is ResearchArea & Researcher {
  return isRecord(value) && isString(value.id) && isString(value.name);
}

const isTeamList = isListOf(isTeam);
const isLookupList = isListOf(isLookup);

/**
 * REST client for the API Gateway. `getToken` is called on every request so the Shell
 * can refresh the token without remounting. The service must enforce admin-only writes
 * itself (403); `isAdmin` in the UI is only a convenience.
 *
 * Successful responses are checked against the documented shape, so a gateway that answers
 * with something else produces an error the UI can show instead of crashing it.
 */
export function createHttpApi(baseUrl: string, getToken?: () => string | undefined): TeamsApi {
  const root = baseUrl.trim().replace(/\/+$/, "");
  if (!root) throw new Error("API Gateway base URL is required.");

  async function request<T>(
    path: string,
    isValid: (value: unknown) => value is T,
    method = "GET",
    body?: unknown,
  ): Promise<T> {
    const token = getToken?.();
    const headers = {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    let response: Response;
    let responseBody: string;
    try {
      response = await fetch(`${root}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      responseBody = await response.text();
    } catch (cause) {
      throw new Error("Could not reach the server. Check your connection and try again.", { cause });
    }

    if (!response.ok) throw toApiError(response.status, responseBody);

    if (!responseBody) {
      throw new Error(`The API returned an empty response for ${path}.`);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(responseBody);
    } catch {
      throw new Error(`The API returned invalid JSON for ${path}.`);
    }
    if (!isValid(parsed)) {
      throw new Error(`The API returned an unexpected response for ${path}.`);
    }
    return parsed;
  }

  return {
    listTeams: () => request("/teams", isTeamList),
    listAreas: () => request("/research-areas", isLookupList),
    listResearchers: () => request("/researchers", isLookupList),
    createTeam: (input) => request("/teams", isTeam, "POST", input),
    updateTeam: (id, input) => request(`/teams/${encodeURIComponent(id)}`, isTeam, "PUT", input),
  };
}
