import type { TeamsApi } from "./api";
import type { ResearchArea, Researcher, Team } from "./types";

/** Fictitious demo data, used when no API Gateway URL is provided. */
export const DEMO_AREAS: ResearchArea[] = [
  { id: "hci", name: "Human-Computer Interaction" },
  { id: "se", name: "Software Engineering" },
  { id: "ai", name: "Artificial Intelligence" },
  { id: "ds", name: "Data Science" },
  { id: "sec", name: "Cybersecurity" },
];

export const DEMO_RESEARCHERS: Researcher[] = [
  { id: "r1", name: "Ana Ribeiro" },
  { id: "r2", name: "Bruno Matos" },
  { id: "r3", name: "Carla Nogueira" },
  { id: "r4", name: "Diogo Faria" },
];

const DEMO_TEAMS: Team[] = [
  {
    id: "t1",
    name: "Interaction Lab",
    description: "Design and evaluation of interactive systems centred on people.",
    areaIds: ["hci"],
    leaderId: "r1",
    updatedAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "t2",
    name: "Trustworthy Software",
    description: "Engineering practices for reliable and secure software.",
    areaIds: ["se", "sec"],
    leaderId: "r2",
    updatedAt: "2026-02-03T10:00:00.000Z",
  },
];

export function createMemoryApi(initial: Team[] = DEMO_TEAMS): TeamsApi {
  let teams = initial.map((t) => ({ ...t, areaIds: [...t.areaIds] }));
  let seq = teams.length;

  return {
    async listTeams() {
      return teams.map((t) => ({ ...t }));
    },
    async listAreas() {
      return DEMO_AREAS;
    },
    async listResearchers() {
      return DEMO_RESEARCHERS;
    },
    async createTeam(input) {
      const team: Team = { ...input, id: `t${++seq}`, updatedAt: new Date().toISOString() };
      teams = [...teams, team];
      return { ...team };
    },
    async updateTeam(id, input) {
      const current = teams.find((t) => t.id === id);
      if (!current) throw new Error("Team not found.");
      const updated: Team = { ...current, ...input, updatedAt: new Date().toISOString() };
      teams = teams.map((t) => (t.id === id ? updated : t));
      return { ...updated };
    },
  };
}
