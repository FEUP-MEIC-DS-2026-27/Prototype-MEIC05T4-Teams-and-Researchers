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
    <section aria-labelledby="pt-teams-title">
      <div className="pt-filters" role="search">
        <label>
          Search by name
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label>
          Research area
          <select value={areaId} onChange={(e) => setAreaId(e.target.value)}>
            <option value="">All areas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </label>
        {filtering && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setAreaId("");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="pt-count" role="status">
        {visible.length} of {teams.length} {teams.length === 1 ? "team" : "teams"}
      </p>

      {visible.length === 0 ? (
        <p>{filtering ? "No teams match the current filters." : "No teams yet."}</p>
      ) : (
        <table className="pt-table">
          <caption id="pt-teams-title" className="pt-sr-only">Teams directory</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Description</th>
              <th scope="col">Research areas</th>
              <th scope="col">Leader</th>
              {isAdmin && <th scope="col"><span className="pt-sr-only">Actions</span></th>}
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
                    <ul className="pt-tags">
                      {t.areaIds.map((id) => (
                        <li key={id}>{areaName.get(id) ?? id}</li>
                      ))}
                    </ul>
                  )}
                </td>
                <td>{t.leaderId ? (leaderName.get(t.leaderId) ?? t.leaderId) : "—"}</td>
                {isAdmin && (
                  <td>
                    <button aria-label={`Edit ${t.name}`} onClick={() => onEdit(t)}>Edit</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
