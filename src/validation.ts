import type { Team, TeamErrors, TeamInput } from "./types";

export const TEAM_NAME_MIN_LENGTH = 1;
export const TEAM_NAME_MAX_LENGTH = 100;
export const TEAM_DESCRIPTION_MIN_LENGTH = 1;
export const TEAM_DESCRIPTION_MAX_LENGTH = 500;

export function validateTeam(input: TeamInput, existing: Team[], editingId?: string): TeamErrors {
  const errors: TeamErrors = {};

  const name = input.name.trim();
  const description = input.description.trim();

  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length < TEAM_NAME_MIN_LENGTH || name.length > TEAM_NAME_MAX_LENGTH) {
    errors.name = `Name must be between ${TEAM_NAME_MIN_LENGTH} and ${TEAM_NAME_MAX_LENGTH} characters.`;
  } else if (
    existing.some(
      (team) => team.id !== editingId && team.name.trim().toLowerCase() === name.toLowerCase(),
    )
  ) {
    errors.name = "A team with this name already exists.";
  }

  if (!description) {
    errors.description = "Description is required.";
  } else if (
    description.length < TEAM_DESCRIPTION_MIN_LENGTH ||
    description.length > TEAM_DESCRIPTION_MAX_LENGTH
  ) {
    errors.description = `Description must be between ${TEAM_DESCRIPTION_MIN_LENGTH} and ${TEAM_DESCRIPTION_MAX_LENGTH} characters.`;
  }

  if (!input.areaIds.some((areaId) => areaId.trim().length > 0)) {
    errors.areaIds = "Select at least one research area.";
  }

  if (!input.leaderId.trim()) {
    errors.leaderId = "Leader is required.";
  }

  return errors;
}
