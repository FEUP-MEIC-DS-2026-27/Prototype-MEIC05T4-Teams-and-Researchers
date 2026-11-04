import { useMemo } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { createMemoryApi } from "./memoryApi";
import { TeamsAdminApp } from "./TeamsAdminApp";

export interface TeamsPageProps {
  /** UI hint from the Shell's authenticated session. The API must still authorize every write. */
  isAdmin?: boolean;
}

/** React entry point for embedding the teams directory in the VA1 router. */
export default function TeamsPage({ isAdmin = false }: TeamsPageProps) {
  const api = useMemo(() => createMemoryApi(), []);

  return (
    <ErrorBoundary>
      <div className="alert alert-warning mb-3" role="note">
        <strong>Demonstration data only.</strong> These teams, research areas and leaders exist only in page memory;
        they are not loaded from or saved to the backend.
      </div>
      <TeamsAdminApp
        api={api}
        isAdmin={isAdmin}
      />
    </ErrorBoundary>
  );
}
