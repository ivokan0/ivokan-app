import React, { createContext, useMemo, useState } from 'react';

type AppContextValue = {
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
};

export const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [showWelcome, setShowWelcome] = useState(true);

  const value = useMemo(() => ({ showWelcome, setShowWelcome }), [showWelcome]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};


