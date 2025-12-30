import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onChangePassword: (currentPassword: string, newPassword: string) => { success: boolean; error?: string };
}

export const PasswordSettings = ({
  isOpen,
  onClose,
  currentEmail,
  onChangePassword,
}: PasswordSettingsProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    if (!currentPassword) {
      toast.error('Digite sua senha atual');
      return;
    }

    if (!newPassword) {
      toast.error('Digite a nova senha');
      return;
    }
    
    if (newPassword.length < 4) {
      toast.error('A nova senha deve ter pelo menos 4 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    const result = onChangePassword(currentPassword, newPassword);
    if (result.success) {
      toast.success('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } else {
      toast.error(result.error || 'Erro ao alterar senha');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            Alterar Senha
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              Logado como: <span className="font-medium text-foreground">{currentEmail}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Senha atual</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha atual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Nova senha</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Confirmar nova senha</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirmar nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 gradient-primary"
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              Alterar Senha
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
