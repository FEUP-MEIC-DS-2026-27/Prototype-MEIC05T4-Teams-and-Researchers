import { AREAS, PROJECTS, PUBLICATIONS } from "./seed";
import type { Dataset, Membership, Researcher, Team } from "./types";

export const areaName = (id: string) => AREAS.find((a) => a.id === id)?.name ?? id;

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const getResearcher = (d: Dataset, id: string) => d.researchers.find((r) => r.id === id);
export const getTeam = (d: Dataset, id: string) => d.teams.find((t) => t.id === id);

export const membershipsOf = (d: Dataset, researcherId: string) =>
  d.memberships.filter((m) => m.researcherId === researcherId);

export const membersOf = (d: Dataset, teamId: string) =>
  d.memberships
    .filter((m) => m.teamId === teamId)
    .map((m) => ({ membership: m, researcher: getResearcher(d, m.researcherId)! }))
    .filter((x) => x.researcher);

export const coordinatorOf = (d: Dataset, teamId: string) => {
  const m = d.memberships.find((x) => x.teamId === teamId && x.role === "Coordinator");
  return m ? getResearcher(d, m.researcherId) : undefined;
};

export const coordinatedTeamIds = (d: Dataset, researcherId: string) =>
  d.memberships.filter((m) => m.researcherId === researcherId && m.role === "Coordinator").map((m) => m.teamId);

/** Areas present in a team = declared team areas ∪ member areas. */
export const teamAreaIds = (d: Dataset, teamId: string) => {
  const t = getTeam(d, teamId);
  const set = new Set(t?.areaIds ?? []);
  membersOf(d, teamId).forEach(({ researcher }) => researcher.areaIds.forEach((a) => set.add(a)));
  return [...set];
};

export const teamSkills = (d: Dataset, teamId: string) => {
  const counts = new Map<string, number>();
  membersOf(d, teamId).forEach(({ researcher }) =>
    researcher.skills.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1)),
  );
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
};

export const projectsForResearcher = (id: string) => PROJECTS.filter((p) => p.researcherIds.includes(id));
export const publicationsForResearcher = (id: string) => PUBLICATIONS.filter((p) => p.researcherIds.includes(id));
export const projectsForTeam = (id: string) => PROJECTS.filter((p) => p.teamId === id);
export const publicationsForTeam = (id: string) => PUBLICATIONS.filter((p) => p.teamId === id);

export const allSkills = (d: Dataset) =>
  [...new Set(d.researchers.flatMap((r) => r.skills))].sort((a, b) => a.localeCompare(b));

// ---------- Overview metrics (people counted once) ----------
export function overviewMetrics(d: Dataset) {
  const areaSet = new Set(d.researchers.flatMap((r) => r.areaIds));
  return {
    total: d.researchers.length,
    active: d.researchers.filter((r) => r.status === "active").length,
    teams: d.teams.length,
    areas: areaSet.size,
  };
}

/** Unique researchers per team. A person in two teams appears in both bars. */
export const compositionByTeam = (d: Dataset) =>
  d.teams
    .map((t) => ({
      id: t.id,
      label: t.acronym,
      name: t.name,
      value: new Set(d.memberships.filter((m) => m.teamId === t.id).map((m) => m.researcherId)).size,
    }))
    .sort((a, b) => b.value - a.value);

export const compositionByArea = (d: Dataset) =>
  AREAS.map((a) => ({
    id: a.id,
    label: a.name,
    name: a.name,
    value: d.researchers.filter((r) => r.areaIds.includes(a.id)).length,
  })).sort((a, b) => b.value - a.value);

export const compositionByCategory = (d: Dataset, researchers: Researcher[] = d.researchers) => {
  const map = new Map<string, number>();
  researchers.forEach((r) => map.set(r.category, (map.get(r.category) ?? 0) + 1));
  return [...map.entries()]
    .map(([label, value]) => ({ id: label, label, name: label, value }))
    .sort((a, b) => b.value - a.value);
};

export const multiTeamCount = (d: Dataset) =>
  d.researchers.filter((r) => new Set(membershipsOf(d, r.id).map((m) => m.teamId)).size > 1).length;

// ---------- Data quality ----------
export type QualityKind = "incomplete" | "outdated" | "unassigned" | "inactive-member" | "no-coordinator";
export interface QualityAlert {
  id: string;
  kind: QualityKind;
  severity: "warning" | "error";
  title: string;
  reason: string;
  target: { type: "researcher" | "team"; id: string; name: string };
}

const MONTH = 1000 * 60 * 60 * 24 * 30;

export function qualityAlerts(d: Dataset, now = Date.now()): QualityAlert[] {
  const out: QualityAlert[] = [];
  d.researchers.forEach((r) => {
    const missing: string[] = [];
    if (!r.bio.trim()) missing.push("biography");
    if (r.skills.length < 2) missing.push(r.skills.length === 0 ? "competences" : "at least 2 competences");
    if (missing.length)
      out.push({ id: `inc-${r.id}`, kind: "incomplete", severity: "warning", title: "Incomplete profile", reason: `Missing ${missing.join(" and ")}.`, target: { type: "researcher", id: r.id, name: r.name } });
    const months = Math.floor((now - new Date(r.updatedAt).getTime()) / MONTH);
    if (months >= 12)
      out.push({ id: `old-${r.id}`, kind: "outdated", severity: "warning", title: "Outdated information", reason: `Profile not updated for ${months} months (threshold: 12).`, target: { type: "researcher", id: r.id, name: r.name } });
    const ms = membershipsOf(d, r.id);
    if (r.status === "active" && ms.length === 0)
      out.push({ id: `una-${r.id}`, kind: "unassigned", severity: "warning", title: "No team assigned", reason: "Active researcher without any team participation.", target: { type: "researcher", id: r.id, name: r.name } });
    if (r.status === "inactive" && ms.length > 0)
      out.push({ id: `ina-${r.id}`, kind: "inactive-member", severity: "warning", title: "Inactive team member", reason: `Marked inactive but still listed in ${ms.length} team(s).`, target: { type: "researcher", id: r.id, name: r.name } });
  });
  d.teams.forEach((t) => {
    if (!d.memberships.some((m) => m.teamId === t.id && m.role === "Coordinator"))
      out.push({ id: `nco-${t.id}`, kind: "no-coordinator", severity: "error", title: "Team without coordinator", reason: "No member holds the Coordinator role.", target: { type: "team", id: t.id, name: t.name } });
    const months = Math.floor((now - new Date(t.updatedAt).getTime()) / MONTH);
    if (months >= 12)
      out.push({ id: `old-${t.id}`, kind: "outdated", severity: "warning", title: "Outdated team description", reason: `Team page not updated for ${months} months.`, target: { type: "team", id: t.id, name: t.name } });
  });
  return out;
}

// ---------- Researcher listing ----------
export interface ResearcherFilters {
  q?: string | undefined;
  team?: string | undefined;
  area?: string | undefined;
  category?: string | undefined;
  status?: string | undefined;
  sort?: "name" | "-name" | "category" | "updated" | undefined;
}

export function filterResearchers(d: Dataset, f: ResearcherFilters) {
  const q = f.q?.trim().toLowerCase();
  let list = d.researchers.filter((r) => {
    if (q && !r.name.toLowerCase().includes(q) && !r.skills.some((s) => s.toLowerCase().includes(q))) return false;
    if (f.team && !d.memberships.some((m) => m.researcherId === r.id && m.teamId === f.team)) return false;
    if (f.area && !r.areaIds.includes(f.area)) return false;
    if (f.category && r.category !== f.category) return false;
    if (f.status && r.status !== f.status) return false;
    return true;
  });
  const sort = f.sort ?? "name";
  list = [...list].sort((a, b) => {
    if (sort === "-name") return b.name.localeCompare(a.name);
    if (sort === "category") return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
    if (sort === "updated") return b.updatedAt.localeCompare(a.updatedAt);
    return a.name.localeCompare(b.name);
  });
  return list;
}

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;

export function researchersToCsv(d: Dataset, list: Researcher[]) {
  const header = ["Name", "Category", "Affiliation", "Status", "Teams (role)", "Research areas", "Competences", "Updated"];
  const rows = list.map((r) => [
    r.name,
    r.category,
    r.affiliation,
    r.status,
    membershipsOf(d, r.id).map((m) => `${getTeam(d, m.teamId)?.acronym} (${m.role})`).join("; "),
    r.areaIds.map(areaName).join("; "),
    r.skills.join("; "),
    r.updatedAt,
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

// ---------- Collaboration graph ----------
/** Edge between two researchers = number of teams they share. */
export function collaborationEdges(memberships: Membership[]) {
  const byTeam = new Map<string, string[]>();
  memberships.forEach((m) => byTeam.set(m.teamId, [...(byTeam.get(m.teamId) ?? []), m.researcherId]));
  const edges = new Map<string, { a: string; b: string; teams: string[] }>();
  byTeam.forEach((ids, teamId) => {
    const uniq = [...new Set(ids)].sort();
    for (let i = 0; i < uniq.length; i++)
      for (let j = i + 1; j < uniq.length; j++) {
        const a = uniq[i]!, b = uniq[j]!;
        const key = `${a}|${b}`;
        const e = edges.get(key) ?? { a, b, teams: [] as string[] };
        e.teams.push(teamId);
        edges.set(key, e);
      }
  });
  return [...edges.values()];
}

export const sortTeamsByName = (teams: Team[]) => [...teams].sort((a, b) => a.name.localeCompare(b.name));
