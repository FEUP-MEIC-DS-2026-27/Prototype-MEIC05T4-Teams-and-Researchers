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
    <section className="d-flex flex-column gap-3" aria-label="Teams directory">
      <div className="row g-3 align-items-end" role="search">
        <label className="col-md-5 col-lg-4">
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
        <ul className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3 list-unstyled mb-0">
          {visible.map((team) => (
            <li className="col" key={team.id}>
              <article
                className="card h-100"
                aria-labelledby={`team-title-${team.id}`}
              >
                <div className="card-body d-flex flex-column align-items-start">
                  <h2 className="h6 fw-semibold mb-2" id={`team-title-${team.id}`}>
                    {team.name}
                  </h2>
                  <p className="small text-body-secondary mb-3">{team.description}</p>

                  <div className="mb-3">
                    <p className="small fw-semibold mb-2">Research areas</p>
                    {team.areaIds.length === 0 ? (
                      <span className="small text-body-secondary">No research areas</span>
                    ) : (
                      <ul className="list-unstyled d-flex flex-wrap gap-1 mb-0">
                        {team.areaIds.map((id) => (
                          <li key={id}>
                            <span className="badge text-bg-light border fw-normal">
                              {areaName.get(id) ?? id}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <p className="small text-body-secondary mb-3">
                    <span className="fw-semibold text-body">Leader:</span>{" "}
                    {team.leaderId ? (leaderName.get(team.leaderId) ?? team.leaderId) : "—"}
                  </p>

                  {isAdmin && (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm mt-auto"
                      aria-label={`Edit ${team.name}`}
                      onClick={() => onEdit(team)}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
