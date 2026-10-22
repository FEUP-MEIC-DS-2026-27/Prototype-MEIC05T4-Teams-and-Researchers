import { useCallback, useEffect, useMemo, useState } from "react";
import type { TeamsApi } from "./api";
import { TeamForm } from "./TeamForm";
import type { ResearchArea, Researcher, Team, TeamInput } from "./types";
import "./styles.css";

export interface TeamsAdminProps {
  api: TeamsApi;
  /** Only administrators may create or edit teams; others get a read-only directory. */
  isAdmin: boolean;
}

type Mode = { kind: "list" } | { kind: "create" } | { kind: "edit"; team: Team };

export function TeamsAdminApp({ api, isAdmin }: TeamsAdminProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [areas, setAreas] = useState<ResearchArea[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(undefined);
    try {
      const [t, a, r] = await Promise.all([api.listTeams(), api.listAreas(), api.listResearchers()]);
      setTeams(t);
      setAreas(a);
      setResearchers(r);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load teams.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const areaName = useMemo(() => new Map(areas.map((a) => [a.id, a.name])), [areas]);
  const researcherName = useMemo(() => new Map(researchers.map((r) => [r.id, r.name])), [researchers]);

  async function save(input: TeamInput) {
    setSaving(true);
    setSaveError(undefined);
    try {
      if (mode.kind === "edit") {
        const updated = await api.updateTeam(mode.team.id, input);
        setTeams((ts) => ts.map((t) => (t.id === updated.id ? updated : t)));
        setNotice(`Team "${updated.name}" updated.`);
      } else {
        const created = await api.createTeam(input);
        setTeams((ts) => [...ts, created]);
        setNotice(`Team "${created.name}" created.`);
      }
      setMode({ kind: "list" });
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save the team.");
    } finally {
      setSaving(false);
    }
  }

  function open(next: Mode) {
    setSaveError(undefined);
    setNotice(undefined);
    setMode(next);
  }

  if (loading) return <p className="pt-root" role="status">Loading teams…</p>;
  if (loadError)
    return (
      <div className="pt-root">
        <p className="pt-error" role="alert">{loadError}</p>
        <button onClick={() => void load()}>Retry</button>
      </div>
    );

  if (mode.kind !== "list" && isAdmin) {
    return (
      <div className="pt-root">
        <TeamForm
          key={mode.kind === "edit" ? mode.team.id : "new"}
          team={mode.kind === "edit" ? mode.team : undefined}
          teams={teams}
          areas={areas}
          researchers={researchers}
          saving={saving}
          error={saveError}
          onSubmit={(input) => void save(input)}
          onCancel={() => open({ kind: "list" })}
        />
      </div>
    );
  }

  return (
    <div className="pt-root">
      <header className="pt-header">
        <h1>Teams</h1>
        {isAdmin && (
          <button className="pt-primary" onClick={() => open({ kind: "create" })}>
            New team
          </button>
        )}
      </header>
      {notice && <p className="pt-notice" role="status">{notice}</p>}
      {teams.length === 0 ? (
        <p>No teams yet.</p>
      ) : (
        <table className="pt-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Research areas</th>
              <th>Leader</th>
              {isAdmin && <th />}
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.description}</td>
                <td>{t.areaIds.map((id) => areaName.get(id) ?? id).join(", ")}</td>
                <td>{researcherName.get(t.leaderId) ?? t.leaderId}</td>
                {isAdmin && (
                  <td>
                    <button aria-label={`Edit ${t.name}`} onClick={() => open({ kind: "edit", team: t })}>
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
