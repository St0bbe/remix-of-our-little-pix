import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstallPrompt } from '@/hooks/usePWAInstallPrompt';
import { cn } from '@/lib/utils';

type PWAInstallButtonProps = {
  className?: string;
};

const PWAInstallButton = ({ className }: PWAInstallButtonProps) => {
  const { canInstall, promptInstall } = usePWAInstallPrompt();

  if (!canInstall) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        promptInstall();
      }}
      className={cn(
        "w-full h-12 border-primary/30 bg-background/80 text-primary shadow-soft hover:bg-primary/10 hover:text-primary",
        className,
      )}
    >
      <Download className="w-5 h-5" />
      Baixar app
    </Button>
  );
};

export default PWAInstallButton;
