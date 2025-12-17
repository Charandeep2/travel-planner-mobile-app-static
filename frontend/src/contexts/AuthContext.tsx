import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, token: string) => void;
  logout: () => void;
  bootstrapFromStorage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface JwtPayload {
  email: string;
  exp: number;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (email: string, token: string) => {
    const userObj: User = { email };
    setUser(userObj);
    setToken(token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', email);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
  };

  const bootstrapFromStorage = () => {
    const storedToken = localStorage.getItem('authToken');
    const storedEmail = localStorage.getItem('userEmail');

    if (storedToken && storedEmail) {
      try {
        const decoded: JwtPayload = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;

        // Check if token is expired
        if (decoded.exp > currentTime) {
          setUser({ email: storedEmail });
          setToken(storedToken);
        } else {
          // Token expired, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('userEmail');
        }
      } catch (error) {
        // Invalid token, clear storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
      }
    }
  };

  useEffect(() => {
    bootstrapFromStorage();
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    bootstrapFromStorage
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};