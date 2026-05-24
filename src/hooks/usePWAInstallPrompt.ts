import { useCallback } from 'react';
import { toast } from 'sonner';
import { usePWAInstall } from '@/contexts/PWAInstallContext';

const isIOS = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

const isAndroid = () => /android/i.test(window.navigator.userAgent);

const isSecurePWAOrigin = () =>
  window.isSecureContext ||
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

const getManualInstallInstructions = () => {
  if (isIOS()) {
    return 'iPhone Safari: Compartilhar > Adicionar à Tela de Início';
  }

  if (isAndroid()) {
    return 'Android Chrome: menu ⋮ > Adicionar à tela inicial ou Instalar app';
  }

  return 'Chrome Desktop: menu ⋮ > Transmitir, salvar e compartilhar > Instalar página como app';
};

export const usePWAInstallPrompt = () => {
  const {
    deferredPrompt,
    isInstalled,
    isStandalone,
    consumeDeferredPrompt,
  } = usePWAInstall();

  const promptInstall = useCallback(async () => {
    console.log('PWA install clicked');

    const prompt = consumeDeferredPrompt();

    if (!prompt) {
      const secureOriginMessage = isSecurePWAOrigin()
        ? ''
        : ' O PWA precisa estar em HTTPS para instalar.';

      toast.info('Instale manualmente', {
        description: `${getManualInstallInstructions()}${secureOriginMessage}`,
        duration: 9000,
      });
      return;
    }

    await prompt.prompt();
    await prompt.userChoice;
  }, [consumeDeferredPrompt]);

  return {
    canInstall: !isInstalled && !isStandalone,
    hasNativePrompt: Boolean(deferredPrompt),
    promptInstall,
  };
};
