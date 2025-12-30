import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AlertTriangle, KeyRound } from 'lucide-react';

interface PasswordResetProps {
  isOpen: boolean;
  onClose: () => void;
}

const USERS_KEY = 'family-album-users';
const AUTHORIZED_EMAILS = ['thaisapgalk@gmail.com', 'emersonstobbe02@gmail.com'];

export const PasswordReset = ({ isOpen, onClose }: PasswordResetProps) => {
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = () => {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedConfirm = confirmEmail.toLowerCase().trim();

    if (normalizedEmail !== normalizedConfirm) {
      toast.error('Os emails não coincidem');
      return;
    }

    if (!AUTHORIZED_EMAILS.includes(normalizedEmail)) {
      toast.error('Este email não está autorizado');
      return;
    }

    // Remove the user's password from storage
    const storedUsers = localStorage.getItem(USERS_KEY);
    const users: Record<string, string> = storedUsers ? JSON.parse(storedUsers) : {};

    if (!users[normalizedEmail]) {
      toast.error('Este email ainda não possui senha cadastrada');
      return;
    }

    delete users[normalizedEmail];
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    toast.success('Senha resetada com sucesso!', {
      description: 'No próximo login, você poderá criar uma nova senha.',
    });

    setEmail('');
    setConfirmEmail('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Resetar Senha
          </DialogTitle>
          <DialogDescription>
            Insira seu email para resetar sua senha. No próximo login, você poderá criar uma nova senha.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Esta ação irá apagar sua senha atual. Você precisará criar uma nova senha no próximo login.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-email">Confirme o Email</Label>
            <Input
              id="confirm-email"
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleReset}
            disabled={!email || !confirmEmail}
            className="bg-amber-500 hover:bg-amber-600"
          >
            Resetar Senha
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
