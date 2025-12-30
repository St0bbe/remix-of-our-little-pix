import { useState, useEffect } from 'react';

const AUTH_KEY = 'family-album-auth';
const PASSWORD_KEY = 'family-album-password';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    const storedAuth = sessionStorage.getItem(AUTH_KEY);
    const storedPassword = localStorage.getItem(PASSWORD_KEY);
    
    setHasPassword(!!storedPassword);
    
    if (!storedPassword) {
      // No password set, allow access
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(storedAuth === 'true');
    }
    
    setIsLoading(false);
  }, []);

  const login = (password: string): boolean => {
    const storedPassword = localStorage.getItem(PASSWORD_KEY);
    
    if (password === storedPassword) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  const setPassword = (newPassword: string) => {
    localStorage.setItem(PASSWORD_KEY, newPassword);
    sessionStorage.setItem(AUTH_KEY, 'true');
    setHasPassword(true);
    setIsAuthenticated(true);
  };

  const removePassword = () => {
    localStorage.removeItem(PASSWORD_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    setHasPassword(false);
    setIsAuthenticated(true);
  };

  return {
    isAuthenticated,
    isLoading,
    hasPassword,
    login,
    logout,
    setPassword,
    removePassword,
  };
};
