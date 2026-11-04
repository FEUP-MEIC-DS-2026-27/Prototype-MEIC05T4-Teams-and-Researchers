import { useEffect, useState } from "react";
import { ApiError, type TeamsApi } from "./api";
import { TeamForm } from "./TeamForm";
import { TeamsTable } from "./TeamsTable";
import type { ResearchArea, Researcher, Team, TeamErrors, TeamInput } from "./types";

export interface TeamsAdminProps {
  api: TeamsApi;
  /** UI hint only. The API must enforce the same permission on every write. */
  isAdmin: boolean;
  demoMode?: boolean;
}

type Mode = { kind: "list" } | { kind: "create" } | { kind: "edit"; team: Team };

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function TeamsAdminApp({ api, isAdmin, demoMode = false }: TeamsAdminProps) {
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
    <div className="alert alert-danger d-flex flex-wrap align-items-center gap-3 mb-0" role="alert">
      <p className="mb-0">{lookupError}</p>
      <button className="btn btn-outline-danger" onClick={retry}>Retry</button>
    </div>
  );

  if (isAdmin && mode.kind !== "list") {
    return (
      <div className="d-flex flex-column gap-3">
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
    <div className="d-flex flex-column gap-3">
      {demoMode && (
        <div className="alert alert-warning mb-0" role="note">
          Demonstration data only. Changes are held in memory and will not persist.
        </div>
      )}
      <header className="d-flex flex-wrap align-items-end justify-content-between gap-3">
        <div>
          <p className="text-body-secondary mb-1">HumanISE.info</p>
          <h1 className="h3 mb-0">Teams</h1>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => openForm({ kind: "create" })}>New team</button>
        )}
      </header>
      {notice && <p className="alert alert-success py-2 mb-0" role="status">{notice}</p>}
      {!loadError && lookupBanner}
      {loading ? (
        <p className="d-flex align-items-center gap-2 text-body-secondary mb-0" role="status">
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          Loading teams…
        </p>
      ) : loadError ? (
        <div className="alert alert-danger mb-0" role="alert">
          <p className="mb-2">{loadError}</p>
          <button className="btn btn-outline-danger" onClick={retry}>Retry</button>
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
