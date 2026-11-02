import { useState, type FormEvent } from "react";
import type { ResearchArea, Researcher, Team, TeamErrors, TeamInput } from "./types";
import { validateTeam } from "./validation";

interface Props {
  team?: Team;
  teams: Team[];
  researchAreas: ResearchArea[];
  researchers: Researcher[];
  saving: boolean;
  error?: string;
  onSubmit: (input: TeamInput) => void;
  onCancel: () => void;
}

export function TeamForm({ team, teams, researchAreas, researchers, saving, error, onSubmit, onCancel }: Props) {
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
        <input
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "team-name-error" : undefined}
        />
        {errors.name && <span id="team-name-error" className="pt-error" role="alert">{errors.name}</span>}
      </label>

      <label>
        Description
        <textarea
          rows={4}
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          aria-invalid={errors.description ? "true" : undefined}
          aria-describedby={errors.description ? "team-description-error" : undefined}
        />
        {errors.description && (
          <span id="team-description-error" className="pt-error" role="alert">{errors.description}</span>
        )}
      </label>

      <label>
        Leader
        <select
          value={values.leaderId}
          onChange={(e) => setValues({ ...values, leaderId: e.target.value })}
          aria-invalid={errors.leaderId ? "true" : undefined}
          aria-describedby={errors.leaderId ? "team-leader-error" : undefined}
        >
          <option value="">Select a leader</option>
          {researchers.map((researcher) => (
            <option key={researcher.id} value={researcher.id}>{researcher.name}</option>
          ))}
        </select>
        {errors.leaderId && <span id="team-leader-error" className="pt-error" role="alert">{errors.leaderId}</span>}
      </label>

      <fieldset
        className="pt-fieldset"
        style={{ border: "none", padding: 0, margin: 0 }}
        aria-invalid={errors.areaIds ? "true" : undefined}
        aria-describedby={errors.areaIds ? "team-areas-error" : undefined}
      >
        <legend style={{ fontWeight: "bold", marginBottom: "8px" }}>Research Areas</legend>
        {researchAreas?.map((area) => (
          <label key={area.id} style={{ display: "block", marginBottom: "4px" }}>
            <input
              type="checkbox"
              value={area.id}
              checked={values.areaIds.includes(area.id)}
              onChange={(e) => {
                const isChecked = e.target.checked;
                const newAreaIds = isChecked
                  ? [...values.areaIds, area.id]
                  : values.areaIds.filter((id) => id !== area.id);
                  
                setValues({ ...values, areaIds: newAreaIds });
              }}
              style={{ marginRight: "8px" }}
            />
            {area.name}
          </label>
        ))}
      </fieldset>
      {errors.areaIds && <span id="team-areas-error" className="pt-error" role="alert">{errors.areaIds}</span>}

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
