import { useState, useEffect } from 'react';

const AUTH_KEY = 'family-album-auth';
const USERS_KEY = 'family-album-users';

// Usuários autorizados
const AUTHORIZED_USERS = [
  { email: 'thaisapgalk@gmail.com' },
  { email: 'emersonstobbe02@gmail.com' }
];

interface User {
  email: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    const storedAuth = sessionStorage.getItem(AUTH_KEY);
    
    if (storedAuth) {
      const user = JSON.parse(storedAuth);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Verificar se é um usuário autorizado
    const authorizedUser = AUTHORIZED_USERS.find(u => u.email === normalizedEmail);
    if (!authorizedUser) {
      return { success: false, error: 'Este email não tem permissão para acessar' };
    }

    // Buscar usuários cadastrados
    const storedUsers = localStorage.getItem(USERS_KEY);
    const users: Record<string, string> = storedUsers ? JSON.parse(storedUsers) : {};

    // Se o usuário ainda não definiu senha, é primeiro login
    if (!users[normalizedEmail]) {
      // Primeiro login - salvar senha
      users[normalizedEmail] = password;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      const user = { email: normalizedEmail };
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
      setCurrentUser(user);
      setIsAuthenticated(true);
      setIsFirstLogin(true);
      return { success: true };
    }

    // Verificar senha
    if (users[normalizedEmail] !== password) {
      return { success: false, error: 'Senha incorreta' };
    }

    const user = { email: normalizedEmail };
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const changePassword = (currentPassword: string, newPassword: string): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

    const storedUsers = localStorage.getItem(USERS_KEY);
    const users: Record<string, string> = storedUsers ? JSON.parse(storedUsers) : {};

    if (users[currentUser.email] !== currentPassword) {
      return { success: false, error: 'Senha atual incorreta' };
    }

    users[currentUser.email] = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true };
  };

  const hasUserRegistered = (email: string): boolean => {
    const storedUsers = localStorage.getItem(USERS_KEY);
    const users: Record<string, string> = storedUsers ? JSON.parse(storedUsers) : {};
    return !!users[email.toLowerCase().trim()];
  };

  return {
    isAuthenticated,
    isLoading,
    currentUser,
    isFirstLogin,
    login,
    logout,
    changePassword,
    hasUserRegistered,
  };
};
