import { describe, expect, it } from "vitest";
import { removeMember, updateSkills, upsertMember } from "@/modules/data/operations";
import { filterResearchers, overviewMetrics } from "@/modules/data/queries";
import { SEED } from "@/modules/data/seed";

describe("HumanISE demo data rules", () => {
  it("seed has 24 researchers, 5 teams", () => {
    expect(SEED.researchers).toHaveLength(24);
    expect(SEED.teams).toHaveLength(5);
  });

  it("removing a member removes only the team link", () => {
    const d = removeMember(SEED, "isl", "r07");
    expect(d.memberships.some((m) => m.teamId === "isl" && m.researcherId === "r07")).toBe(false);
    expect(d.researchers.find((r) => r.id === "r07")).toBeDefined();
  });

  it("a researcher in two teams is counted once in totals", () => {
    const d = upsertMember(SEED, "seq", "r01", "Associate");
    expect(overviewMetrics(d).total).toBe(24);
  });

  it("updated competences are searchable", () => {
    const d = updateSkills(SEED, "r06", ["Quantum widgets"]);
    expect(filterResearchers(d, { q: "quantum" }).map((r) => r.id)).toEqual(["r06"]);
  });
});
