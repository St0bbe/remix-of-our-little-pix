import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Heart, Lock, Eye, EyeOff, Camera, Baby, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { emailSchema, passwordSchema } from '@/lib/validation';

type AuthMode = 'signin' | 'signup' | 'recovery' | 'reset';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Check for recovery mode from URL
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'recovery') {
      setMode('reset');
    }
  }, [searchParams]);

  // Check if already authenticated and listen for auth changes
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && mode !== 'reset') {
        navigate('/');
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session && mode !== 'reset') {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, mode]);

  const validateInputs = () => {
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setError(emailResult.error.errors[0].message);
      return false;
    }

    if (mode !== 'recovery') {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        setError(passwordResult.error.errors[0].message);
        return false;
      }

      if (mode === 'signup' && password !== confirmPassword) {
        setError('As senhas não coincidem');
        return false;
      }
    }

    return true;
  };

  const checkEmailAllowed = async (emailToCheck: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('allowed_emails')
      .select('email')
      .eq('email', emailToCheck.toLowerCase().trim())
      .maybeSingle();
    
    return !!data && !error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateInputs()) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setIsLoading(true);

    try {
      // Check if email is allowed (for signin and signup)
      if (mode === 'signin' || mode === 'signup') {
        const isAllowed = await checkEmailAllowed(email);
        if (!isAllowed) {
          setError('Este email não tem permissão para acessar o sistema');
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
          setIsLoading(false);
          return;
        }
      }

      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Email ou senha incorretos');
          } else {
            setError(error.message);
          }
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
        } else {
          toast.success('Bem-vindo(a) de volta!');
          navigate('/');
        }
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              display_name: displayName || email.split('@')[0]
            }
          }
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            setError('Este email já está cadastrado');
          } else {
            setError(error.message);
          }
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
        } else {
          toast.success('Conta criada com sucesso!');
          navigate('/');
        }
      } else if (mode === 'recovery') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?type=recovery`
        });

        if (error) {
          setError(error.message);
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
        } else {
          toast.success('Email de recuperação enviado!');
          setMode('signin');
        }
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.updateUser({
          password
        });

        if (error) {
          setError(error.message);
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
        } else {
          toast.success('Senha atualizada com sucesso!');
          navigate('/');
        }
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Entrar';
      case 'signup': return 'Criar Conta';
      case 'recovery': return 'Recuperar Senha';
      case 'reset': return 'Nova Senha';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signin': return 'Entre com seu email e senha';
      case 'signup': return 'Crie sua conta para começar';
      case 'recovery': return 'Digite seu email para recuperar a senha';
      case 'reset': return 'Digite sua nova senha';
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

        <Card className={`p-8 text-center shadow-hover backdrop-blur-sm bg-card/95 animate-scale-in ${isShaking ? 'animate-shake' : ''}`}>
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
            {getTitle()}
          </h1>
          <p className="text-muted-foreground mb-8">
            {getSubtitle()}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (not for reset mode) */}
            {mode !== 'reset' && (
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
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Display Name (only for signup) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-left block">Nome (opcional)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Seu nome"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10 h-12"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Password (not for recovery mode) */}
            {mode !== 'recovery' && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-left block">
                  {mode === 'reset' ? 'Nova Senha' : 'Senha'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {(mode === 'signup' || mode === 'reset') && (
                  <p className="text-xs text-muted-foreground text-left">
                    Mínimo de 6 caracteres
                  </p>
                )}
              </div>
            )}

            {/* Confirm Password (only for signup) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-left block">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-12"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
            
            {error && (
              <p className="text-destructive text-sm animate-fade-in">{error}</p>
            )}

            <Button 
              type="submit" 
              className="w-full gradient-primary h-12 text-lg" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Aguarde...' : getTitle()}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border space-y-3">
            {mode === 'signin' && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('recovery')}
                  className="text-sm text-primary hover:text-primary/80 transition-colors block mx-auto"
                >
                  Esqueci minha senha
                </button>
                <p className="text-sm text-muted-foreground">
                  Não tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    Criar conta
                  </button>
                </p>
              </>
            )}
            
            {mode === 'signup' && (
              <p className="text-sm text-muted-foreground">
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Entrar
                </button>
              </p>
            )}

            {mode === 'recovery' && (
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-sm text-primary hover:text-primary/80 transition-colors block mx-auto"
              >
                Voltar para login
              </button>
            )}
          </div>
        </Card>
      </div>

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

export default Auth;
