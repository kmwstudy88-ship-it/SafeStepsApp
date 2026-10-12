import React, {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getFamiliesForTenant, type FamilyListItem } from "../services/familyService";
import { useTenant } from "./TenantContext";

type FamilyContextValue = {
  families: FamilyListItem[];
  activeFamily: FamilyListItem | null;
  loading: boolean;
  error: string | null;
  selectFamily: (familyId: string) => void;
  refreshFamilies: () => Promise<void>;
};

const FamilyContext = createContext<FamilyContextValue | null>(null);

export function FamilyProvider({ children }: PropsWithChildren) {
  const { activeTenant } = useTenant();
  const [families, setFamilies] = useState<FamilyListItem[]>([]);
  const [activeFamily, setActiveFamily] = useState<FamilyListItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshFamilies = useCallback(async () => {
    if (!activeTenant) {
      setFamilies([]);
      setActiveFamily(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getFamiliesForTenant(activeTenant.id);
      setFamilies(result);
      setActiveFamily((current) => {
        if (current && result.some((family) => family.id === current.id)) {
          return current;
        }

        return result[0] ?? null;
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load families.");
    } finally {
      setLoading(false);
    }
  }, [activeTenant]);

  useEffect(() => {
    void refreshFamilies();
  }, [refreshFamilies]);

  const selectFamily = useCallback(
    (familyId: string) => {
      setActiveFamily(families.find((family) => family.id === familyId) ?? null);
    },
    [families],
  );

  const value = useMemo(
    () => ({
      families,
      activeFamily,
      loading,
      error,
      selectFamily,
      refreshFamilies,
    }),
    [activeFamily, error, families, loading, refreshFamilies, selectFamily],
  );

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamily(): FamilyContextValue {
  const context = useContext(FamilyContext);

  if (!context) {
    throw new Error("useFamily must be used within FamilyProvider");
  }

  return context;
}
