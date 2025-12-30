import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Heart, Lock, Eye, EyeOff, Camera, Baby } from 'lucide-react';
import { toast } from 'sonner';

interface LoginScreenProps {
  onLogin: (password: string) => boolean;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

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
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      toast.error('Senha incorreta');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Floating icons */}
        <div className="absolute -top-8 -left-8 w-16 h-16 rounded-full bg-card shadow-card flex items-center justify-center animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
          <Camera className="w-8 h-8 text-primary" />
        </div>
        <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-card shadow-card flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
          <Baby className="w-6 h-6 text-accent" />
        </div>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-card shadow-card flex items-center justify-center animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>
          <Heart className="w-7 h-7 text-primary fill-primary" />
        </div>

        <Card 
          className={`p-8 text-center shadow-hover backdrop-blur-sm bg-card/95 animate-scale-in ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center shadow-soft">
                <Heart className="w-12 h-12 text-primary-foreground fill-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <Lock className="w-4 h-4 text-accent-foreground" />
              </div>
            </div>
          </div>
          
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
            Álbum da Família
          </h1>
          <p className="text-muted-foreground mb-8">
            Área restrita • Digite a senha para acessar
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 text-lg"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {error && (
              <p className="text-destructive text-sm animate-fade-in">{error}</p>
            )}

            <Button type="submit" className="w-full gradient-primary h-12 text-lg" size="lg">
              Entrar no Álbum
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Apenas membros da família podem acessar
            </p>
          </div>
        </Card>
      </div>

      {/* Add shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};
