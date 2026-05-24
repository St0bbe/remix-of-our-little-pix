import { useSyncExternalStore } from 'react';

type BeforeInstallPromptChoice = {
  outcome: 'accepted' | 'dismissed';
  platform: string;
};

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<BeforeInstallPromptChoice>;
};

type PWAInstallSnapshot = {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  isStandalone: boolean;
  isInstallAvailable: boolean;
};

const listeners = new Set<() => void>();
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let isInstalled = false;
let initialized = false;
let standaloneLogged = false;
let standaloneQuery: MediaQueryList | null = null;

const isBrowser = typeof window !== 'undefined';
const installedStorageKey = 'nossa-familia-pwa-installed';

const hasInstalledMarker = () => {
  if (!isBrowser) {
    return false;
  }

  return window.localStorage.getItem(installedStorageKey) === 'true';
};

const isStandaloneDisplayMode = () => {
  if (!isBrowser) {
    return false;
  }

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    navigatorWithStandalone.standalone === true
  );
};

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

const updateInstalledState = () => {
  const standalone = isStandaloneDisplayMode();
  isInstalled = standalone || hasInstalledMarker();

  if (standalone && !standaloneLogged) {
    console.log('PWA standalone mode');
    standaloneLogged = true;
  }

  emitChange();
};

const handleBeforeInstallPrompt = (event: Event) => {
  event.preventDefault();
  console.log('beforeinstallprompt fired');

  if (!isStandaloneDisplayMode()) {
    deferredPrompt = event as BeforeInstallPromptEvent;
    isInstalled = false;
    emitChange();
  }
};

const handleAppInstalled = () => {
  console.log('PWA installed');
  deferredPrompt = null;
  isInstalled = true;
  window.localStorage.setItem(installedStorageKey, 'true');
  emitChange();
};

export const initializePWAInstall = () => {
  if (!isBrowser || initialized) {
    return;
  }

  initialized = true;
  standaloneQuery = window.matchMedia('(display-mode: standalone)');

  updateInstalledState();

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
  standaloneQuery.addEventListener('change', updateInstalledState);
};

export const getPWAInstallSnapshot = (): PWAInstallSnapshot => {
  const isStandalone = isStandaloneDisplayMode();

  return {
    deferredPrompt,
    isInstalled: isInstalled || isStandalone || hasInstalledMarker(),
    isStandalone,
    isInstallAvailable: Boolean(deferredPrompt) && !isStandalone,
  };
};

export const subscribeToPWAInstall = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const consumeDeferredPrompt = () => {
  const prompt = deferredPrompt;
  deferredPrompt = null;
  emitChange();

  return prompt;
};

export const usePWAInstallSnapshot = () =>
  useSyncExternalStore(
    subscribeToPWAInstall,
    getPWAInstallSnapshot,
    getPWAInstallSnapshot,
  );
