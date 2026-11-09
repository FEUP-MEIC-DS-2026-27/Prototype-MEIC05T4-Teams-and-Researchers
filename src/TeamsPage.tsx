import { useMemo } from "react";
import styles from "./TeamsOverview.module.css";
import { createHttpApi, type TeamsApi } from "./api";
import { ErrorBoundary } from "./ErrorBoundary";
import { createMemoryApi } from "./memoryApi";
import { TeamsAdminApp } from "./TeamsAdminApp";

export interface TeamsPageProps {
  /** UI hint from the host session. The API must authorize every write independently. */
  isAdmin?: boolean;
  /** API Gateway base URL; paths from docs/openapi.yaml are appended to it. */
  apiBaseUrl?: string;
  /** Returns the current bearer token; called on every request. */
  getToken?: () => string | undefined;
  /** Replaces the built-in API (tests and host integrations). */
  api?: TeamsApi;
}

/** React entry point for embedding team management in the host router. */
export default function TeamsPage({ isAdmin, apiBaseUrl, getToken, api: suppliedApi }: TeamsPageProps) {
  const configuredApiUrl = apiBaseUrl ?? import.meta.env.PUBLIC_API_URL;
  const demoMode = !suppliedApi && !configuredApiUrl && import.meta.env.PUBLIC_USE_MOCK !== "false";
  const api = useMemo(
    () =>
      suppliedApi ??
      (demoMode ? createMemoryApi() : createHttpApi(configuredApiUrl || "/api", getToken)),
    [configuredApiUrl, demoMode, getToken, suppliedApi],
  );
  const canEdit = isAdmin ?? demoMode;

  return (
    <ErrorBoundary>
      <section className={styles.teamsOverview}>
        <TeamsAdminApp
          api={api}
          isAdmin={canEdit}
          demoMode={demoMode}
          title="Teams Overview"
          description="Monitor the teams in the system, their details and members."
        />
      </section>
    </ErrorBoundary>
  );
}
