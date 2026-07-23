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
import { getEvidenceForCase, getEvidenceVaultDashboard } from "../services/evidenceVaultService";
import type { EvidenceRecord, EvidenceVaultDashboard } from "../types/evidenceVault";

type EvidenceContextValue = {
  evidence: EvidenceRecord[];
  dashboard: EvidenceVaultDashboard | null;
  loading: boolean;
  error: string | null;
  refreshEvidence: () => Promise<void>;
};

const EvidenceContext = createContext<EvidenceContextValue | null>(null);

export function EvidenceProvider({ children }: PropsWithChildren) {
  const { activeCase } = useCase();
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [dashboard, setDashboard] = useState<EvidenceVaultDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshEvidence = useCallback(async () => {
    if (!activeCase) {
      setEvidence([]);
      setDashboard(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [records, vaultDashboard] = await Promise.all([
        getEvidenceForCase(activeCase.id),
        getEvidenceVaultDashboard(activeCase.id),
      ]);
      setEvidence(records);
      setDashboard(vaultDashboard);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load evidence.");
    } finally {
      setLoading(false);
    }
  }, [activeCase]);

  useEffect(() => {
    void refreshEvidence();
  }, [refreshEvidence]);

  const value = useMemo(
    () => ({ evidence, dashboard, loading, error, refreshEvidence }),
    [dashboard, error, evidence, loading, refreshEvidence],
  );

  return <EvidenceContext.Provider value={value}>{children}</EvidenceContext.Provider>;
}

export function useEvidence(): EvidenceContextValue {
  const context = useContext(EvidenceContext);

  if (!context) {
    throw new Error("useEvidence must be used within EvidenceProvider");
  }

  return context;
}
