import PWAInstallButton from './PWAInstallButton';
import { usePWAInstallPrompt } from '@/hooks/usePWAInstallPrompt';

export const InstallPWA = () => {
  const { canInstall } = usePWAInstallPrompt();
  
  if (!canInstall) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-soft">
      <div className="text-center sm:text-left">
        <h3 className="font-semibold text-primary">Instale o App</h3>
        <p className="text-sm text-muted-foreground">Acesse suas memórias com um toque direto da tela inicial.</p>
      </div>
      <PWAInstallButton className="sm:w-auto px-6 h-11" />
    </div>
  );
};
