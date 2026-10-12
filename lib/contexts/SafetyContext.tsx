import React, {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useCase } from "./CaseContext";
import { getSafetyDashboardForCase, getSafetyPlansForCase } from "../services/safetyService";
import type { SafetyDashboardSummary, SafetyPlan } from "../types/safety";

type SafetyContextValue = {
  plans: SafetyPlan[];
  activePlan: SafetyPlan | null;
  dashboard: SafetyDashboardSummary | null;
  loading: boolean;
  error: string | null;
  refreshSafety: () => Promise<void>;
};

const SafetyContext = createContext<SafetyContextValue | null>(null);

export function SafetyProvider({ children }: PropsWithChildren) {
  const { activeCase } = useCase();
  const [plans, setPlans] = useState<SafetyPlan[]>([]);
  const [dashboard, setDashboard] = useState<SafetyDashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSafety = useCallback(async () => {
    if (!activeCase) {
      setPlans([]);
      setDashboard(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [nextPlans, nextDashboard] = await Promise.all([
        getSafetyPlansForCase(activeCase.id),
        getSafetyDashboardForCase(activeCase.id),
      ]);
      setPlans(nextPlans);
      setDashboard(nextDashboard);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load safety data.");
    } finally {
      setLoading(false);
    }
  }, [activeCase]);

  useEffect(() => {
    void refreshSafety();
  }, [refreshSafety]);

  const value = useMemo(
    () => ({
      plans,
      activePlan: plans.find((plan) => plan.plan_status === "active") ?? plans[0] ?? null,
      dashboard,
      loading,
      error,
      refreshSafety,
    }),
    [dashboard, error, loading, plans, refreshSafety],
  );

  return <SafetyContext.Provider value={value}>{children}</SafetyContext.Provider>;
}

export function useSafety(): SafetyContextValue {
  const context = useContext(SafetyContext);

  if (!context) {
    throw new Error("useSafety must be used within SafetyProvider");
  }

  return context;
}
