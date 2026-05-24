import { createContext, ReactNode, useContext } from 'react';
import {
  consumeDeferredPrompt,
  usePWAInstallSnapshot,
} from '@/lib/pwaInstallStore';

type PWAInstallContextValue = ReturnType<typeof usePWAInstallSnapshot> & {
  consumeDeferredPrompt: typeof consumeDeferredPrompt;
};

const PWAInstallContext = createContext<PWAInstallContextValue | null>(null);

export const PWAInstallProvider = ({ children }: { children: ReactNode }) => {
  const snapshot = usePWAInstallSnapshot();

  return (
    <PWAInstallContext.Provider
      value={{
        ...snapshot,
        consumeDeferredPrompt,
      }}
    >
      {children}
    </PWAInstallContext.Provider>
  );
};

export const usePWAInstall = () => {
  const context = useContext(PWAInstallContext);

  if (!context) {
    throw new Error('usePWAInstall must be used inside PWAInstallProvider');
  }

  return context;
};
