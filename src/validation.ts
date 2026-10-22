import type { Team, TeamErrors, TeamInput } from "./types";

export function validateTeam(input: TeamInput, _existing: Team[], _editingId?: string): TeamErrors {
  const errors: TeamErrors = {};
  if (!input.name.trim()) errors.name = "Name is required.";
  return errors;
}
