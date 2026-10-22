import { useState, type FormEvent } from "react";
import type { Team, TeamErrors, TeamInput } from "./types";
import { validateTeam } from "./validation";

interface Props {
  team?: Team;
  teams: Team[];
  saving: boolean;
  error?: string;
  onSubmit: (input: TeamInput) => void;
  onCancel: () => void;
}

export function TeamForm({ team, teams, saving, error, onSubmit, onCancel }: Props) {
  // areaIds e leaderId ainda não têm campos no formulário (ver TODOs abaixo).
  const [values, setValues] = useState<TeamInput>({
    name: team?.name ?? "",
    description: team?.description ?? "",
    areaIds: team?.areaIds ?? [],
    leaderId: team?.leaderId ?? "",
  });
  const [errors, setErrors] = useState<TeamErrors>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = { ...values, name: values.name.trim(), description: values.description.trim() };
    const found = validateTeam(clean, teams, team?.id);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(clean);
  }

  return (
    <form className="pt-form" onSubmit={handleSubmit} noValidate>
      <h2>{team ? `Edit team: ${team.name}` : "Create team"}</h2>

      <label>
        Name
        <input value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
        {errors.name && <span className="pt-error" role="alert">{errors.name}</span>}
      </label>

      <label>
        Description
        <textarea
          rows={4}
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
        />
        {errors.description && <span className="pt-error" role="alert">{errors.description}</span>}
      </label>

      {/* TODO [Pessoa 1]: seletor múltiplo de áreas de investigação (areaIds), recebendo a lista de áreas por props. */}
      {/* TODO [Pessoa 2]: seletor do líder da equipa (leaderId), recebendo a lista de investigadores por props. */}

      {error && <p className="pt-error" role="alert">{error}</p>}

      <div className="pt-actions">
        <button type="button" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="pt-primary" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
