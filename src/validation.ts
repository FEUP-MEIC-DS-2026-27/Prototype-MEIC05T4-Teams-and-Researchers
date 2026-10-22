import type { Team, TeamErrors, TeamInput } from "./types";

export const NAME_MAX = 80;
export const DESCRIPTION_MAX = 1000;

export function validateTeam(
  input: TeamInput,
  existing: Team[],
  editingId?: string,
): TeamErrors {
  const errors: TeamErrors = {};
  const name = input.name.trim();

  if (!name) errors.name = "Name is required.";
  else if (name.length > NAME_MAX) errors.name = `Name must have at most ${NAME_MAX} characters.`;
  else if (
    existing.some((t) => t.id !== editingId && t.name.trim().toLowerCase() === name.toLowerCase())
  ) {
    errors.name = "A team with this name already exists.";
  }

  if (!input.description.trim()) errors.description = "Description is required.";
  else if (input.description.length > DESCRIPTION_MAX)
    errors.description = `Description must have at most ${DESCRIPTION_MAX} characters.`;

  if (input.areaIds.length === 0) errors.areaIds = "Select at least one research area.";
  if (!input.leaderId) errors.leaderId = "Select a team leader.";

  return errors;
}
