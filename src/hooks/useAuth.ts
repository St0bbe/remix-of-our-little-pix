import { useState, useEffect } from 'react';
import { emailSchema, passwordSchema, simpleHash } from '@/lib/validation';

const AUTH_KEY = 'family-album-auth';
const USERS_KEY = 'family-album-users';

// Usuários autorizados (emails em lowercase)
const AUTHORIZED_USERS = [
  'thaisapgalk@gmail.com',
  'emersonstobbe02@gmail.com'
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
      try {
        const user = JSON.parse(storedAuth);
        // Validate stored email is still authorized
        if (AUTHORIZED_USERS.includes(user.email)) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem(AUTH_KEY);
        }
      } catch {
        sessionStorage.removeItem(AUTH_KEY);
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Validate email format
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      return { success: false, error: emailResult.error.errors[0].message };
    }

    // Validate password format
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      return { success: false, error: passwordResult.error.errors[0].message };
    }

    const normalizedEmail = emailResult.data.toLowerCase();
    
    // Verificar se é um usuário autorizado
    if (!AUTHORIZED_USERS.includes(normalizedEmail)) {
      return { success: false, error: 'Este email não tem permissão para acessar' };
    }

    // Hash the password
    const hashedPassword = await simpleHash(password);

    // Buscar usuários cadastrados
    const storedUsers = localStorage.getItem(USERS_KEY);
    let users: Record<string, string> = {};
    
    try {
      users = storedUsers ? JSON.parse(storedUsers) : {};
    } catch {
      users = {};
    }

    // Se o usuário ainda não definiu senha, é primeiro login
    if (!users[normalizedEmail]) {
      users[normalizedEmail] = hashedPassword;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      const user = { email: normalizedEmail };
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
      setCurrentUser(user);
      setIsAuthenticated(true);
      setIsFirstLogin(true);
      return { success: true };
    }

    // Verificar senha (compare hashes)
    if (users[normalizedEmail] !== hashedPassword) {
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

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

    // Validate new password
    const passwordResult = passwordSchema.safeParse(newPassword);
    if (!passwordResult.success) {
      return { success: false, error: passwordResult.error.errors[0].message };
    }

    const storedUsers = localStorage.getItem(USERS_KEY);
    let users: Record<string, string> = {};
    
    try {
      users = storedUsers ? JSON.parse(storedUsers) : {};
    } catch {
      return { success: false, error: 'Erro ao processar dados' };
    }

    const currentHash = await simpleHash(currentPassword);
    if (users[currentUser.email] !== currentHash) {
      return { success: false, error: 'Senha atual incorreta' };
    }

    const newHash = await simpleHash(newPassword);
    users[currentUser.email] = newHash;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true };
  };

  const hasUserRegistered = (email: string): boolean => {
    const storedUsers = localStorage.getItem(USERS_KEY);
    try {
      const users: Record<string, string> = storedUsers ? JSON.parse(storedUsers) : {};
      return !!users[email.toLowerCase().trim()];
    } catch {
      return false;
    }
  };

  // Reset password (clears the stored hash so user can set a new one)
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!AUTHORIZED_USERS.includes(normalizedEmail)) {
      return { success: false, error: 'Email não autorizado' };
    }

    const storedUsers = localStorage.getItem(USERS_KEY);
    let users: Record<string, string> = {};
    
    try {
      users = storedUsers ? JSON.parse(storedUsers) : {};
    } catch {
      users = {};
    }

    delete users[normalizedEmail];
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true };
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
    resetPassword,
  };
};
