import { useEffect, useState } from "react";
import type { TeamsApi } from "./api";
import { TeamForm } from "./TeamForm";
import { TeamsTable } from "./TeamsTable";
import type { ResearchArea, Researcher, Team, TeamInput } from "./types";
import "./styles.css";

export interface TeamsAdminProps {
  api: TeamsApi;
  isAdmin: boolean;
}

type Mode = { kind: "list" } | { kind: "create" } | { kind: "edit"; team: Team };

export function TeamsAdminApp({ api, isAdmin }: TeamsAdminProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [loadError, setLoadError] = useState<string>();
  const [areas, setAreas] = useState<ResearchArea[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [notice, setNotice] = useState<string>();

  useEffect(() => {
    setLoadError(undefined);
    void api
      .listTeams()
      .then(setTeams, (e) => setLoadError(e instanceof Error ? e.message : "Failed to load the teams."));
  }, [api]);

  // Lookups only used to display names in the table; the table falls back to raw ids.
  useEffect(() => {
    void api.listAreas().then(setAreas, () => undefined);
    void api.listResearchers().then(setResearchers, () => undefined);
  }, [api]);

  function openForm(next: Mode) {
    setNotice(undefined);
    setMode(next);
  }

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

  if (isAdmin && mode.kind !== "list") {
    return (
      <div className="pt-root">
        <TeamForm
          key={mode.kind === "edit" ? mode.team.id : "new"}
          team={mode.kind === "edit" ? mode.team : undefined}
          teams={teams}
          saving={saving}
          error={saveError}
          onSubmit={(input) => void save(input)}
          onCancel={() => setMode({ kind: "list" })}
        />
      </div>
    );
  }

  return (
    <div className="pt-root">
      <header className="pt-header">
        <h1>Teams</h1>
        {isAdmin && (
          <button className="pt-primary" onClick={() => openForm({ kind: "create" })}>New team</button>
        )}
      </header>
      {!isAdmin && (
        <p className="pt-readonly" role="note">
          You have read-only access. Only administrators can create or edit teams.
        </p>
      )}
      {notice && <p className="pt-notice" role="status">{notice}</p>}
      {loadError && <p className="pt-error" role="alert">{loadError}</p>}
      <TeamsTable
        teams={teams}
        areas={areas}
        researchers={researchers}
        isAdmin={isAdmin}
        onEdit={(team) => openForm({ kind: "edit", team })}
      />
    </div>
  );
}
