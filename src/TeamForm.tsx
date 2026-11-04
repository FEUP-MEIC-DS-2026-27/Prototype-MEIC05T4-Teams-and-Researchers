import { useEffect, useState, type FormEvent } from "react";
import type { ResearchArea, Researcher, Team, TeamErrors, TeamInput } from "./types";
import { validateTeam } from "./validation";

interface Props {
  team?: Team;
  teams: Team[];
  researchAreas: ResearchArea[];
  researchers: Researcher[];
  saving: boolean;
  error?: string;
  /** Per-field problems reported by the service after a save; shown like local validation errors. */
  serverErrors?: TeamErrors;
  onSubmit: (input: TeamInput) => void;
  onCancel: () => void;
}

export function TeamForm({
  team,
  teams,
  researchAreas,
  researchers,
  saving,
  error,
  serverErrors,
  onSubmit,
  onCancel,
}: Props) {
  const [values, setValues] = useState<TeamInput>({
    name: team?.name ?? "",
    description: team?.description ?? "",
    areaIds: team?.areaIds ?? [],
    leaderId: team?.leaderId ?? "",
  });
  const [errors, setErrors] = useState<TeamErrors>({});

  // Like local errors, these stay until the next submit replaces them.
  useEffect(() => {
    if (serverErrors) setErrors(serverErrors);
  }, [serverErrors]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = { ...values, name: values.name.trim(), description: values.description.trim() };
    const found = validateTeam(clean, teams, team?.id);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(clean);
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <div className="card-body d-flex flex-column gap-3">
      <h2 className="h4 mb-0">{team ? `Edit team: ${team.name}` : "Create team"}</h2>

      <div>
        <label className="form-label" htmlFor="team-name">Name</label>
        <input
          id="team-name"
          className={`form-control${errors.name ? " is-invalid" : ""}`}
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "team-name-error" : undefined}
        />
        {errors.name && <div id="team-name-error" className="invalid-feedback d-block" role="alert">{errors.name}</div>}
      </div>

      <div>
        <label className="form-label" htmlFor="team-description">Description</label>
        <textarea
          id="team-description"
          className={`form-control${errors.description ? " is-invalid" : ""}`}
          rows={4}
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          aria-invalid={errors.description ? "true" : undefined}
          aria-describedby={errors.description ? "team-description-error" : undefined}
        />
        {errors.description && (
          <div id="team-description-error" className="invalid-feedback d-block" role="alert">{errors.description}</div>
        )}
      </div>

      <div>
        <label className="form-label" htmlFor="team-leader">Leader</label>
        <select
          id="team-leader"
          className={`form-select${errors.leaderId ? " is-invalid" : ""}`}
          value={values.leaderId}
          onChange={(e) => setValues({ ...values, leaderId: e.target.value })}
          aria-invalid={errors.leaderId ? "true" : undefined}
          aria-describedby={errors.leaderId ? "team-leader-error" : undefined}
        >
          <option value="">Select a leader</option>
          {researchers.map((researcher) => (
            <option key={researcher.id} value={researcher.id}>
              {researcher.name}
            </option>
          ))}
        </select>
        {errors.leaderId && <div id="team-leader-error" className="invalid-feedback d-block" role="alert">{errors.leaderId}</div>}
      </div>

      <fieldset
        className="border rounded-2 p-3"
        aria-describedby={errors.areaIds ? "team-areas-error" : undefined}
      >
        <legend className="float-none w-auto px-1 fs-6 mb-2">Research areas</legend>
        {researchAreas.map((area) => (
          <div className="form-check" key={area.id}>
            <input
              id={`team-area-${area.id}`}
              className="form-check-input"
              type="checkbox"
              value={area.id}
              checked={values.areaIds.includes(area.id)}
              onChange={(e) => {
                const areaIds = e.target.checked
                  ? [...values.areaIds, area.id]
                  : values.areaIds.filter((id) => id !== area.id);
                setValues({ ...values, areaIds });
              }}
            />
            <label className="form-check-label" htmlFor={`team-area-${area.id}`}>
              {area.name}
            </label>
          </div>
        ))}
        {errors.areaIds && <div id="team-areas-error" className="invalid-feedback d-block" role="alert">{errors.areaIds}</div>}
      </fieldset>

      {error && <div className="alert alert-danger mb-0" role="alert">{error}</div>}

      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      </div>
    </form>
  );
}
