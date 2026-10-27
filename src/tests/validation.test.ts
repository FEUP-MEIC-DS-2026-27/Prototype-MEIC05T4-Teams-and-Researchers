import type { Team, TeamInput } from "../types";
import {
  TEAM_DESCRIPTION_MAX_LENGTH,
  TEAM_NAME_MAX_LENGTH,
  validateTeam,
} from "../validation";

const validInput: TeamInput = {
  name: "Data Crew",
  description: "A team working on data-intensive systems.",
  areaIds: ["ds"],
  leaderId: "r1",
};

const existingTeam: Team = {
  ...validInput,
  id: "t1",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("validateTeam", () => {
  it("accepts a complete team", () => {
    expect(validateTeam(validInput, [])).toEqual({});
  });

  it("requires a name and description", () => {
    const errors = validateTeam(
      { ...validInput, name: "   ", description: "   " },
      [],
    );

    expect(errors).toEqual({
      name: "Name is required.",
      description: "Description is required.",
    });
  });

  it("requires at least one research area and a leader", () => {
    const errors = validateTeam({ ...validInput, areaIds: [], leaderId: "  " }, []);

    expect(errors.areaIds).toBe("Select at least one research area.");
    expect(errors.leaderId).toBe("Leader is required.");
  });

  it("enforces name and description limits", () => {
    const errors = validateTeam(
      {
        ...validInput,
        name: "n".repeat(TEAM_NAME_MAX_LENGTH + 1),
        description: "d".repeat(TEAM_DESCRIPTION_MAX_LENGTH + 1),
      },
      [],
    );

    expect(errors.name).toMatch(/between 1 and 100/);
    expect(errors.description).toMatch(/between 1 and 500/);
  });

  it("rejects duplicate names ignoring case and surrounding whitespace", () => {
    const errors = validateTeam({ ...validInput, name: "  data crew " }, [existingTeam]);

    expect(errors.name).toBe("A team with this name already exists.");
  });

  it("allows an edited team to keep its own name", () => {
    expect(validateTeam({ ...validInput, name: "  DATA CREW " }, [existingTeam], "t1")).toEqual(
      {},
    );
  });
});
