export interface ResearchArea {
  id: string;
  name: string;
}

export interface Researcher {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  areaIds: string[];
  leaderId: string;
  updatedAt: string;
}

export type TeamInput = Omit<Team, "id" | "updatedAt">;

export type TeamErrors = Partial<Record<keyof TeamInput, string>>;
