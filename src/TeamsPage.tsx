import { useEffect, useState } from "react";
import styles from "./TeamsOverview.module.css";
import { loadTeams, readTeams, type TeamOverview } from "./teamsOverviewApi";

function statusClass(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
      return styles.statusActive;
    case "inactive":
      return styles.statusInactive;
    default:
      return "";
  }
}

/** Read-only Teams page exposed to the VA1 host. */
export default function TeamsPage() {
  const ready = readTeams();
  const [teams, setTeams] = useState<TeamOverview[]>(ready ?? []);
  const [loading, setLoading] = useState(ready === undefined);
  const [error, setError] = useState<string>();
  const [search, setSearch] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    if (ready) return;

    let active = true;
    setLoading(true);
    setError(undefined);

    loadTeams().then(
      (loadedTeams) => {
        if (active) setTeams(loadedTeams);
      },
      (loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Could not load teams.");
        }
      },
    ).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [loadAttempt, ready]);

  const query = search.trim().toLowerCase();
  const visibleTeams = teams.filter((team) => team.name.toLowerCase().includes(query));

  return (
    <section className={styles.teamsOverview} aria-labelledby="teams-overview-title" aria-busy={loading}>
      <header className={styles.header}>
        <h2 id="teams-overview-title">Teams Overview</h2>
        <p>Monitor the teams in the system, their current status and number of members.</p>
      </header>

      {loading ? (
        <div className={styles.loading} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          <p>Loading teams…</p>
        </div>
      ) : error ? (
        <div className={styles.error} role="alert">
          <h3 className={styles.errorTitle}>Could not load teams</h3>
          <p>{error}</p>
          <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
            Try again
          </button>
        </div>
      ) : teams.length === 0 ? (
        <div className={styles.empty}>
          <h3 className={styles.emptyTitle}>No teams to display</h3>
          <p>There are no teams in the system yet. Teams will appear here once they are created.</p>
        </div>
      ) : (
        <>
          <div className={styles.search}>
            <label htmlFor="teams-search-input">Search teams</label>
            <input
              id="teams-search-input"
              type="search"
              placeholder="Search by team name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {visibleTeams.length === 0 ? (
            <div className={styles.noResults}>
              <h3 className={styles.noResultsTitle}>No teams match “{search.trim()}”</h3>
              <p>Try a different name or clear the search to see all teams.</p>
              <button type="button" onClick={() => setSearch("")}>Clear search</button>
            </div>
          ) : (
            <>
              <p className={styles.count} role="status">
                {visibleTeams.length} {visibleTeams.length === 1 ? "team" : "teams"}
              </p>
              <ul className={styles.grid}>
                {visibleTeams.map((team) => (
                  <li key={team.id} className={styles.team}>
                    <h3 className={styles.teamName}>{team.name}</h3>
                    <p className={styles.teamDetail}>
                      Status:{" "}
                      <span className={`${styles.status} ${statusClass(team.status)}`}>{team.status}</span>
                    </p>
                    <p className={styles.teamDetail}>Members: {team.memberCount}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}
