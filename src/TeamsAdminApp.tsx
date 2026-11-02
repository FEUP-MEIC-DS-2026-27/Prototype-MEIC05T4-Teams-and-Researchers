import { useEffect, useState } from "react";
import { ApiError, type TeamsApi } from "./api";
import { TeamForm } from "./TeamForm";
import { TeamsTable } from "./TeamsTable";
import type { ResearchArea, Researcher, Team, TeamErrors, TeamInput } from "./types";
import "./styles.css";

export interface TeamsAdminProps {
  api: TeamsApi;
  isAdmin: boolean;
}

type Mode = { kind: "list" } | { kind: "create" } | { kind: "edit"; team: Team };

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function TeamsAdminApp({ api, isAdmin }: TeamsAdminProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [saveFieldErrors, setSaveFieldErrors] = useState<TeamErrors>();
  const [areas, setAreas] = useState<ResearchArea[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [lookupError, setLookupError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(undefined);

    api.listTeams().then(
      (loadedTeams) => {
        if (active) setTeams(loadedTeams);
      },
      (error: unknown) => {
        if (active) {
          setLoadError(errorText(error, "Failed to load the teams."));
        }
      },
    ).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [api, loadAttempt]);

  // Lookups feed the form's area and leader pickers and the table's names. One failing
  // does not discard the other; the table falls back to raw ids.
  useEffect(() => {
    let active = true;
    setLookupError(undefined);

    Promise.allSettled([api.listAreas(), api.listResearchers()]).then(
      ([loadedAreas, loadedResearchers]) => {
        if (!active) return;
        if (loadedAreas.status === "fulfilled") setAreas(loadedAreas.value);
        if (loadedResearchers.status === "fulfilled") setResearchers(loadedResearchers.value);

        const failure = [loadedAreas, loadedResearchers].find(
          (result): result is PromiseRejectedResult => result.status === "rejected",
        );
        if (failure) {
          setLookupError(
            `Could not load research areas or researchers: ${errorText(failure.reason, "unknown error")}`,
          );
        }
      },
    );

    return () => {
      active = false;
    };
  }, [api, loadAttempt]);

  function openForm(next: Mode) {
    setNotice(undefined);
    setSaveError(undefined);
    setSaveFieldErrors(undefined);
    setMode(next);
  }

  async function save(input: TeamInput) {
    setSaving(true);
    setSaveError(undefined);
    setSaveFieldErrors(undefined);
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
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        setSaveFieldErrors(error.fieldErrors);
      } else {
        setSaveError(errorText(error, "Failed to save the team."));
      }
    } finally {
      setSaving(false);
    }
  }

  // Retry reloads teams and lookups together, so one button covers every failed request.
  const retry = () => setLoadAttempt((attempt) => attempt + 1);
  const lookupBanner = lookupError && (
    <div className="pt-load-error">
      <p className="pt-error" role="alert">{lookupError}</p>
      <button onClick={retry}>Retry</button>
    </div>
  );

  if (isAdmin && mode.kind !== "list") {
    return (
      <div className="pt-root">
        {lookupBanner}
        <TeamForm
          key={mode.kind === "edit" ? mode.team.id : "new"}
          team={mode.kind === "edit" ? mode.team : undefined}
          teams={teams}
          researchAreas={areas}
          researchers={researchers}
          saving={saving}
          error={saveError}
          serverErrors={saveFieldErrors}
          onSubmit={(input) => void save(input)}
          onCancel={() => openForm({ kind: "list" })}
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
      {!loadError && lookupBanner}
      {loading ? (
        <p role="status">Loading teams…</p>
      ) : loadError ? (
        <div className="pt-load-error">
          <p className="pt-error" role="alert">{loadError}</p>
          <button onClick={retry}>Retry</button>
        </div>
      ) : (
        <TeamsTable
          teams={teams}
          areas={areas}
          researchers={researchers}
          isAdmin={isAdmin}
          onEdit={(team) => openForm({ kind: "edit", team })}
        />
      )}
    </div>
  );
}
