import type { Team, TeamErrors, TeamInput } from "./types";

// TODO [Pessoa 3]: validar descrição, áreas (>= 1), líder, limites de tamanho e nome duplicado.
export function validateTeam(input: TeamInput, _existing: Team[], _editingId?: string): TeamErrors {
  const errors: TeamErrors = {};
  if (!input.name.trim()) errors.name = "Name is required.";
  return errors;
}
