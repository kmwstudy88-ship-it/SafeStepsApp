import { createContext, useContext, useEffect, useState } from 'react';

const SafeStepsContext = createContext(null);

export function SafeStepsProvider({ children, curriculum }: { children: React.ReactNode; curriculum: any }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(curriculum);
  }, [curriculum]);

  if (!data) return null;

  return (
    <SafeStepsContext.Provider value={data}>
      {children}
    </SafeStepsContext.Provider>
  );
}

export function useSafeSteps() {
  return useContext(SafeStepsContext);
}