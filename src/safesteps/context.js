import React, { createContext, useContext } from 'react';
import lessons from '../curriculum/lessons.json';

const SafeStepsContext = createContext(null);

export function SafeStepsProvider({ children }) {
  return (
    <SafeStepsContext.Provider value={lessons}>
      {children}
    </SafeStepsContext.Provider>
  );
}

export function useSafeSteps() {
  return useContext(SafeStepsContext);
}