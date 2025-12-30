import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Heart, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface LoginScreenProps {
  onLogin: (password: string) => boolean;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!password) {
      setError('Digite a senha');
      return;
    }

    const success = onLogin(password);
    if (!success) {
      setError('Senha incorreta');
      toast.error('Senha incorreta');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center animate-scale-in">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-soft">
            <Heart className="w-10 h-10 text-primary-foreground fill-primary-foreground" />
          </div>
        </div>
        
        <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
          Álbum da Família
        </h1>
        <p className="text-muted-foreground mb-8">
          Digite a senha para acessar as fotos
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}

          <Button type="submit" className="w-full gradient-primary" size="lg">
            Entrar
          </Button>
        </form>
      </Card>
    </div>
  );
};
