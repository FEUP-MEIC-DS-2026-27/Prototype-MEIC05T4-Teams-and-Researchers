export type AcademicCategory =
  | "Full Professor"
  | "Associate Professor"
  | "Assistant Professor"
  | "Senior Researcher"
  | "Postdoctoral Researcher"
  | "PhD Student"
  | "Research Assistant";

export const CATEGORIES: AcademicCategory[] = [
  "Full Professor",
  "Associate Professor",
  "Assistant Professor",
  "Senior Researcher",
  "Postdoctoral Researcher",
  "PhD Student",
  "Research Assistant",
];

export type ResearcherStatus = "active" | "inactive";

export type TeamRole = "Coordinator" | "Senior member" | "Member" | "Associate";
export const TEAM_ROLES: TeamRole[] = ["Coordinator", "Senior member", "Member", "Associate"];

export interface ResearchArea {
  id: string;
  name: string;
  description: string;
}

export interface Researcher {
  id: string;
  name: string;
  category: AcademicCategory;
  affiliation: string;
  email: string;
  bio: string;
  areaIds: string[];
  skills: string[];
  status: ResearcherStatus;
  source: string;
  updatedAt: string; // ISO date
}

export interface Team {
  id: string;
  name: string;
  acronym: string;
  description: string;
  objectives: string[];
  areaIds: string[];
  updatedAt: string;
}

/** Many-to-many link between researchers and teams, with a role per participation. */
export interface Membership {
  researcherId: string;
  teamId: string;
  role: TeamRole;
}

export interface Dataset {
  researchers: Researcher[];
  teams: Team[];
  memberships: Membership[];
}
