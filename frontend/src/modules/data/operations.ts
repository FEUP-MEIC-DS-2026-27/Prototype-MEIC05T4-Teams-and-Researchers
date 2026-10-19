import type { Dataset, TeamRole } from "./types";

const today = () => new Date().toISOString().slice(0, 10);

export function normalizeSkills(skills: string[]) {
  const seen = new Set<string>();
  return skills
    .map((s) => s.trim().replace(/\s+/g, " "))
    .filter((s) => s && !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()));
}

export function validateSkills(skills: string[]): string | null {
  const n = normalizeSkills(skills);
  if (n.length === 0) return "Add at least one competence.";
  if (n.length > 12) return "Use at most 12 competences.";
  if (n.some((s) => s.length > 40)) return "Each competence must have 40 characters or fewer.";
  return null;
}

export function validateDescription(desc: string): string | null {
  const t = desc.trim();
  if (t.length < 30) return "Description must have at least 30 characters.";
  if (t.length > 600) return "Description must have 600 characters or fewer.";
  return null;
}

export const updateSkills = (d: Dataset, id: string, skills: string[]): Dataset => ({
  ...d,
  researchers: d.researchers.map((r) => (r.id === id ? { ...r, skills: normalizeSkills(skills), updatedAt: today(), source: "Self-reported (demo)" } : r)),
});

export const updateTeamDescription = (d: Dataset, id: string, description: string): Dataset => ({
  ...d,
  teams: d.teams.map((t) => (t.id === id ? { ...t, description: description.trim(), updatedAt: today() } : t)),
});

/** Adds a member or changes their role. Only one Coordinator per team is kept by the UI. */
export function upsertMember(d: Dataset, teamId: string, researcherId: string, role: TeamRole): Dataset {
  const exists = d.memberships.some((m) => m.teamId === teamId && m.researcherId === researcherId);
  const memberships = exists
    ? d.memberships.map((m) => (m.teamId === teamId && m.researcherId === researcherId ? { ...m, role } : m))
    : [...d.memberships, { teamId, researcherId, role }];
  return { ...d, memberships, teams: d.teams.map((t) => (t.id === teamId ? { ...t, updatedAt: today() } : t)) };
}

/** Removes only the link between researcher and team - the researcher record stays. */
export const removeMember = (d: Dataset, teamId: string, researcherId: string): Dataset => ({
  ...d,
  memberships: d.memberships.filter((m) => !(m.teamId === teamId && m.researcherId === researcherId)),
  teams: d.teams.map((t) => (t.id === teamId ? { ...t, updatedAt: today() } : t)),
});
