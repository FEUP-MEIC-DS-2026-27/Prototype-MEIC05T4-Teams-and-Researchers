import { useEffect, useState } from "react";
import type { TeamsApi } from "./api";
import { TeamForm } from "./TeamForm";
import type { Team, TeamInput } from "./types";
import "./styles.css";

export interface TeamsAdminProps {
  api: TeamsApi;
  isAdmin: boolean;
}

type Mode = { kind: "list" } | { kind: "create" } | { kind: "edit"; team: Team };

export function TeamsAdminApp({ api }: TeamsAdminProps) {
  // TODO [Pessoa 5]: usar isAdmin para esconder "New team"/"Edit" a utilizadores sem permissão (modo só de leitura).
  const [teams, setTeams] = useState<Team[]>([]);
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  // TODO [Pessoa 4]: estados de loading e de erro ao carregar, com botão "Retry".
  useEffect(() => {
    void api.listTeams().then(setTeams);
  }, [api]);

  async function save(input: TeamInput) {
    setSaving(true);
    setSaveError(undefined);
    try {
      if (mode.kind === "edit") {
        const updated = await api.updateTeam(mode.team.id, input);
        setTeams((ts) => ts.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await api.createTeam(input);
        setTeams((ts) => [...ts, created]);
      }
      setMode({ kind: "list" });
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save the team.");
    } finally {
      setSaving(false);
    }
  }

  if (mode.kind !== "list") {
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
        <button className="pt-primary" onClick={() => setMode({ kind: "create" })}>New team</button>
      </header>
      {/* TODO [Pessoa 6]: mostrar áreas e líder na tabela, pesquisa/filtro por nome e feedback visual após guardar. */}
      <table className="pt-table">
        <thead>
          <tr><th>Name</th><th>Description</th><th /></tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.description}</td>
              <td>
                <button aria-label={`Edit ${t.name}`} onClick={() => setMode({ kind: "edit", team: t })}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
