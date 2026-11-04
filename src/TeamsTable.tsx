import { useMemo, useState } from "react";
import type { ResearchArea, Researcher, Team } from "./types";

interface Props {
  teams: Team[];
  areas: ResearchArea[];
  researchers: Researcher[];
  isAdmin: boolean;
  onEdit: (team: Team) => void;
}

export function TeamsTable({ teams, areas, researchers, isAdmin, onEdit }: Props) {
  const [query, setQuery] = useState("");
  const [areaId, setAreaId] = useState("");

  const areaName = useMemo(() => new Map(areas.map((a) => [a.id, a.name])), [areas]);
  const leaderName = useMemo(() => new Map(researchers.map((r) => [r.id, r.name])), [researchers]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams.filter(
      (t) => (!q || t.name.toLowerCase().includes(q)) && (!areaId || t.areaIds.includes(areaId)),
    );
  }, [teams, query, areaId]);

  const filtering = query.trim() !== "" || areaId !== "";

  return (
    <section className="d-flex flex-column gap-3" aria-labelledby="pt-teams-title">
      <div className="row g-3 align-items-end" role="search">
        <label className="col-md-5">
          <span className="form-label">Search by name</span>
          <input className="form-control" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label className="col-md-4">
          <span className="form-label">Research area</span>
          <select className="form-select" value={areaId} onChange={(e) => setAreaId(e.target.value)}>
            <option value="">All areas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </label>
        {filtering && (
          <div className="col-md-auto">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setQuery("");
                setAreaId("");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <p className="text-body-secondary small mb-0" role="status">
        {visible.length} of {teams.length} {teams.length === 1 ? "team" : "teams"}
      </p>

      {visible.length === 0 ? (
        <p className="text-body-secondary mb-0">{filtering ? "No teams match the current filters." : "No teams yet."}</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle mb-0">
            <caption id="pt-teams-title" className="visually-hidden">Teams directory</caption>
            <thead className="table-light">
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Description</th>
                <th scope="col">Research areas</th>
                <th scope="col">Leader</th>
                {isAdmin && <th scope="col"><span className="visually-hidden">Actions</span></th>}
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t.id}>
                  <th scope="row">{t.name}</th>
                  <td>{t.description}</td>
                  <td>
                    {t.areaIds.length === 0 ? (
                      "—"
                    ) : (
                      <ul className="list-unstyled d-flex flex-wrap gap-1 mb-0">
                        {t.areaIds.map((id) => (
                          <li key={id}>
                            <span className="badge text-bg-light border">{areaName.get(id) ?? id}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td>{t.leaderId ? (leaderName.get(t.leaderId) ?? t.leaderId) : "—"}</td>
                  {isAdmin && (
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        aria-label={`Edit ${t.name}`}
                        onClick={() => onEdit(t)}
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
