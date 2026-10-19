import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SEED } from "./seed";
import type { Dataset, TeamRole } from "./types";
import * as ops from "./operations";

export type DemoRole = "visitor" | "researcher" | "coordinator";

/** Demo identities used by the role switcher (no real authentication). */
export const DEMO_IDENTITY: Record<Exclude<DemoRole, "visitor">, string> = {
  researcher: "r06", // André Pinto
  coordinator: "r01", // Helena Vasconcelos - coordinates ISL
};

const DATA_KEY = "humanise-demo-data-v1";
const ROLE_KEY = "humanise-demo-role";

interface Ctx {
  data: Dataset;
  role: DemoRole;
  setRole: (r: DemoRole) => void;
  actingId: string | null;
  hydrated: boolean;
  lastUpdated: Date;
  refreshing: boolean;
  refresh: () => void;
  reset: () => void;
  updateSkills: (researcherId: string, skills: string[]) => void;
  updateTeamDescription: (teamId: string, description: string) => void;
  upsertMember: (teamId: string, researcherId: string, role: TeamRole) => void;
  removeMember: (teamId: string, researcherId: string) => void;
}

const DataContext = createContext<Ctx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Dataset>(SEED);
  const [role, setRoleState] = useState<DemoRole>("visitor");
  const [hydrated, setHydrated] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DATA_KEY);
      if (raw) setData(JSON.parse(raw));
      const r = localStorage.getItem(ROLE_KEY) as DemoRole | null;
      if (r) setRoleState(r);
    } catch {
      /* ignore corrupt storage */
    }
    setLastUpdated(new Date());
    setHydrated(true);
  }, []);

  const commit = useCallback((fn: (d: Dataset) => Dataset) => {
    setData((prev) => {
      const next = fn(prev);
      localStorage.setItem(DATA_KEY, JSON.stringify(next));
      return next;
    });
    setLastUpdated(new Date());
  }, []);

  const setRole = useCallback((r: DemoRole) => {
    setRoleState(r);
    localStorage.setItem(ROLE_KEY, r);
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      try {
        const raw = localStorage.getItem(DATA_KEY);
        setData(raw ? JSON.parse(raw) : SEED);
      } catch {
        setData(SEED);
      }
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 700);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      data,
      role,
      setRole,
      actingId: role === "visitor" ? null : DEMO_IDENTITY[role],
      hydrated,
      lastUpdated,
      refreshing,
      refresh,
      reset: () => {
        localStorage.removeItem(DATA_KEY);
        setData(SEED);
        setLastUpdated(new Date());
      },
      updateSkills: (id, skills) => commit((d) => ops.updateSkills(d, id, skills)),
      updateTeamDescription: (id, desc) => commit((d) => ops.updateTeamDescription(d, id, desc)),
      upsertMember: (t, r, ro) => commit((d) => ops.upsertMember(d, t, r, ro)),
      removeMember: (t, r) => commit((d) => ops.removeMember(d, t, r)),
    }),
    [data, role, setRole, hydrated, lastUpdated, refreshing, refresh, commit],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}

/** Permission helpers for the demo roles. */
export function usePermissions() {
  const { role, actingId, data } = useData();
  return {
    canEditResearcher: (id: string) => role === "researcher" && actingId === id,
    canManageTeam: (teamId: string) =>
      role === "coordinator" &&
      !!actingId &&
      data.memberships.some((m) => m.teamId === teamId && m.researcherId === actingId && m.role === "Coordinator"),
  };
}
