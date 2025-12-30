import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  hasPassword: boolean;
  onSetPassword: (password: string) => void;
  onRemovePassword: () => void;
}

export const PasswordSettings = ({
  isOpen,
  onClose,
  hasPassword,
  onSetPassword,
  onRemovePassword,
}: PasswordSettingsProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    if (!password) {
      toast.error('Digite uma senha');
      return;
    }
    
    if (password.length < 4) {
      toast.error('A senha deve ter pelo menos 4 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    onSetPassword(password);
    toast.success('Senha definida com sucesso!');
    setPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleRemove = () => {
    onRemovePassword();
    toast.success('Proteção por senha removida');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            Proteção por Senha
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {hasPassword ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                O álbum está protegido por senha. Você pode alterá-la ou removê-la.
              </p>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Nova senha</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nova senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  <Label>Confirmar nova senha</Label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirmar senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="destructive" 
                  onClick={handleRemove}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover Senha
                </Button>
                <Button 
                  onClick={handleSave}
                  className="flex-1 gradient-primary"
                  disabled={!password || !confirmPassword}
                >
                  Alterar Senha
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground text-center">
                Defina uma senha para proteger o álbum. Apenas quem souber a senha poderá acessar.
              </p>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite a senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  <Label>Confirmar senha</Label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirmar senha"
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
                  disabled={!password || !confirmPassword}
                >
                  Definir Senha
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
