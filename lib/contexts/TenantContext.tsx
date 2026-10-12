import React, {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../auth";
import { getTenantsForCurrentUser } from "../services/tenantService";
import type { PlatformTenant } from "../types/tenant";

type TenantContextValue = {
  tenants: PlatformTenant[];
  activeTenant: PlatformTenant | null;
  loading: boolean;
  error: string | null;
  selectTenant: (tenantId: string) => void;
  refreshTenants: () => Promise<void>;
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<PlatformTenant[]>([]);
  const [activeTenant, setActiveTenant] = useState<PlatformTenant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTenants = useCallback(async () => {
    if (!user) {
      setTenants([]);
      setActiveTenant(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getTenantsForCurrentUser();
      setTenants(result);
      setActiveTenant((current) => {
        if (current && result.some((tenant) => tenant.id === current.id)) {
          return current;
        }

        return result[0] ?? null;
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load tenants.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshTenants();
  }, [refreshTenants]);

  const selectTenant = useCallback(
    (tenantId: string) => {
      setActiveTenant(tenants.find((tenant) => tenant.id === tenantId) ?? null);
    },
    [tenants],
  );

  const value = useMemo(
    () => ({
      tenants,
      activeTenant,
      loading,
      error,
      selectTenant,
      refreshTenants,
    }),
    [activeTenant, error, loading, refreshTenants, selectTenant, tenants],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);

  if (!context) {
    throw new Error("useTenant must be used within TenantProvider");
  }

  return context;
}
