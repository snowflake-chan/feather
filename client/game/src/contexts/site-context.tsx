'use client';

import { createContext, FC, ReactNode, useContext } from 'react';

import { ServerConfigForClient } from '../../configs/client';

export interface SiteContextProviderProps {
  clientConfig: ServerConfigForClient;
  children?: ReactNode;
}

const SiteContext = createContext<SiteContextProviderProps | undefined>(
  undefined,
);

export const SiteContextProvider: FC<SiteContextProviderProps> = ({
  clientConfig,
  children,
}) => {
  const value = {
    clientConfig,
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};

export const useSiteContext = () => {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSiteContext must be used within a SiteContextProvider');
  }
  return context;
};
