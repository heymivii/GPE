import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth';
import tokenStorage from '../lib/tokenStorage';
import type { User, LoginDto, RegisterDto, AuthResponse } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = tokenStorage.getAccessToken();
        if (!token) {
          setIsLoading(false);
          return;
        }
        const userData = await authApi.getProfile();
        setUser(userData);
      } catch {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          try {
            const userData = await authApi.getProfile();
            setUser(userData);
          } catch {
            clearTokens();
          }
        } else {
          clearTokens();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const tryRefreshToken = async (): Promise<boolean> => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const response = await authApi.refresh({ refreshToken });
      // Le magasin courant est conservé : rafraîchir ne rend pas la session
      // persistante si l'utilisateur n'avait pas coché « se souvenir de moi ».
      tokenStorage.updateTokens({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      });
      return true;
    } catch {
      return false;
    }
  };

  const clearTokens = () => {
    tokenStorage.clear();
  };

  const login = async (data: LoginDto): Promise<void> => {
    try {
      const response: AuthResponse = await authApi.login(data);
      tokenStorage.setSession(
        {
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        },
        data.rememberMe === true,
      );
      setUser(response.user);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  };

  const register = async (data: RegisterDto): Promise<void> => {
    try {
      const response: AuthResponse = await authApi.register(data);
      // Une inscription vaut consentement à rester connecté.
      tokenStorage.setSession(
        {
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        },
        true,
      );
      setUser(response.user);
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      tokenStorage.clear();
      localStorage.removeItem('skywalk-onboarding-completed');
      localStorage.removeItem('skywalk-onboarding-draft');
      localStorage.removeItem('skywalk-user-data');
      localStorage.removeItem('skywalk-dashboard-preferences');
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const userData = await authApi.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du profil:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
