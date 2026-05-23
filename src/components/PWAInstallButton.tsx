import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstallPrompt } from '@/hooks/usePWAInstallPrompt';

const PWAInstallButton = () => {
  const { canInstall, promptInstall } = usePWAInstallPrompt();

  if (!canInstall) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={promptInstall}
      className="w-full h-12 border-primary/30 bg-background/80 text-primary shadow-soft hover:bg-primary/10 hover:text-primary"
    >
      <Download className="w-5 h-5" />
      Instalar app
    </Button>
  );
};

export default PWAInstallButton;
