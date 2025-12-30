import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Heart, Lock, Eye, EyeOff, Camera, Baby, Mail, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { PasswordReset } from './PasswordReset';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => { success: boolean; error?: string };
  hasUserRegistered: (email: string) => boolean;
}

export const LoginScreen = ({ onLogin, hasUserRegistered }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);

  const isNewUser = email && !hasUserRegistered(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Digite seu email');
      return;
    }

    if (!password) {
      setError('Digite sua senha');
      return;
    }

    if (password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres');
      return;
    }

    const result = onLogin(email, password);
    if (!result.success) {
      setError(result.error || 'Erro ao fazer login');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      toast.error(result.error || 'Erro ao fazer login');
    } else {
      if (isNewUser) {
        toast.success('Conta criada! Sua senha foi salva.');
      } else {
        toast.success('Bem-vindo(a) de volta!');
      }
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
            {isNewUser 
              ? 'Primeiro acesso? Crie sua senha!' 
              : 'Entre com seu email e senha'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-left block">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-left block">
                {isNewUser ? 'Criar Senha' : 'Senha'}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isNewUser ? 'Crie uma senha' : 'Sua senha'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {isNewUser && (
                <p className="text-xs text-muted-foreground text-left">
                  Mínimo de 4 caracteres
                </p>
              )}
            </div>
            
            {error && (
              <p className="text-destructive text-sm animate-fade-in">{error}</p>
            )}

            <Button type="submit" className="w-full gradient-primary h-12 text-lg" size="lg">
              {isNewUser ? 'Criar Conta e Entrar' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border space-y-3">
            <button
              type="button"
              onClick={() => setIsPasswordResetOpen(true)}
              className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              <KeyRound className="w-4 h-4" />
              Esqueci minha senha
            </button>
            <p className="text-xs text-muted-foreground">
              Acesso exclusivo para membros da família
            </p>
          </div>
        </Card>
        
        <PasswordReset
          isOpen={isPasswordResetOpen}
          onClose={() => setIsPasswordResetOpen(false)}
        />
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
