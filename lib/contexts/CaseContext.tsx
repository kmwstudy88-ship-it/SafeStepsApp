import React, {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useFamily } from "./FamilyContext";
import { getCasesForFamily, type CaseListItem } from "../services/caseService";

type CaseContextValue = {
  cases: CaseListItem[];
  activeCase: CaseListItem | null;
  loading: boolean;
  error: string | null;
  selectCase: (caseId: string) => void;
  refreshCases: () => Promise<void>;
};

const CaseContext = createContext<CaseContextValue | null>(null);

export function CaseProvider({ children }: PropsWithChildren) {
  const { activeFamily } = useFamily();
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [activeCase, setActiveCase] = useState<CaseListItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCases = useCallback(async () => {
    if (!activeFamily) {
      setCases([]);
      setActiveCase(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getCasesForFamily(activeFamily.id);
      setCases(result);
      setActiveCase((current) => {
        if (current && result.some((item) => item.id === current.id)) {
          return current;
        }

        return result[0] ?? null;
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load cases.");
    } finally {
      setLoading(false);
    }
  }, [activeFamily]);

  useEffect(() => {
    void refreshCases();
  }, [refreshCases]);

  const selectCase = useCallback(
    (caseId: string) => {
      setActiveCase(cases.find((item) => item.id === caseId) ?? null);
    },
    [cases],
  );

  const value = useMemo(
    () => ({
      cases,
      activeCase,
      loading,
      error,
      selectCase,
      refreshCases,
    }),
    [activeCase, cases, error, loading, refreshCases, selectCase],
  );

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
}

export function useCase(): CaseContextValue {
  const context = useContext(CaseContext);

  if (!context) {
    throw new Error("useCase must be used within CaseProvider");
  }

  return context;
}
