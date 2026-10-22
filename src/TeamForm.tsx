import { useState, type FormEvent } from "react";
import type { ResearchArea, Researcher, Team, TeamErrors, TeamInput } from "./types";
import { DESCRIPTION_MAX, NAME_MAX, validateTeam } from "./validation";

interface Props {
  team?: Team;
  teams: Team[];
  areas: ResearchArea[];
  researchers: Researcher[];
  saving: boolean;
  error?: string;
  onSubmit: (input: TeamInput) => void;
  onCancel: () => void;
}

export function TeamForm({ team, teams, areas, researchers, saving, error, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<TeamInput>({
    name: team?.name ?? "",
    description: team?.description ?? "",
    areaIds: team?.areaIds ?? [],
    leaderId: team?.leaderId ?? "",
  });
  const [errors, setErrors] = useState<TeamErrors>({});

  const toggleArea = (id: string) =>
    setValues((v) => ({
      ...v,
      areaIds: v.areaIds.includes(id) ? v.areaIds.filter((a) => a !== id) : [...v.areaIds, id],
    }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = { ...values, name: values.name.trim(), description: values.description.trim() };
    const found = validateTeam(clean, teams, team?.id);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(clean);
  }

  return (
    <form className="pt-form" onSubmit={handleSubmit} noValidate aria-label={team ? "Edit team" : "Create team"}>
      <h2>{team ? `Edit team: ${team.name}` : "Create team"}</h2>

      <label>
        Name
        <input
          value={values.name}
          maxLength={NAME_MAX}
          aria-invalid={!!errors.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
        />
        {errors.name && <span className="pt-error" role="alert">{errors.name}</span>}
      </label>

      <label>
        Description
        <textarea
          rows={4}
          value={values.description}
          maxLength={DESCRIPTION_MAX}
          aria-invalid={!!errors.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
        />
        {errors.description && <span className="pt-error" role="alert">{errors.description}</span>}
      </label>

      <fieldset>
        <legend>Research areas</legend>
        <div className="pt-checks">
          {areas.map((a) => (
            <label key={a.id} className="pt-check">
              <input
                type="checkbox"
                checked={values.areaIds.includes(a.id)}
                onChange={() => toggleArea(a.id)}
              />
              {a.name}
            </label>
          ))}
        </div>
        {errors.areaIds && <span className="pt-error" role="alert">{errors.areaIds}</span>}
      </fieldset>

      <label>
        Leader
        <select
          value={values.leaderId}
          aria-invalid={!!errors.leaderId}
          onChange={(e) => setValues({ ...values, leaderId: e.target.value })}
        >
          <option value="">Select a leader…</option>
          {researchers.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        {errors.leaderId && <span className="pt-error" role="alert">{errors.leaderId}</span>}
      </label>

      {error && <p className="pt-error" role="alert">{error}</p>}

      <div className="pt-actions">
        <button type="button" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="pt-primary" disabled={saving}>
          {saving ? "Saving…" : team ? "Save changes" : "Create team"}
        </button>
      </div>
    </form>
  );
}
