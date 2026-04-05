import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '../types';
import { apiClient } from '../services/api';

interface AuthContextValue {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (full_name: string, email: string, password: string, role: User['role'], hospital_id: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'medexchange_current_user';
const LOCAL_STORAGE_TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);

      // normalize storage from earlier versions and always use hospital_id
      if (parsed && parsed.hospital_id && parsed.id) {
        return parsed as User;
      }

      if (parsed && parsed.hospitalId && parsed.id) {
        return {
          id: parsed.id,
          full_name: parsed.fullName || parsed.full_name || '',
          email: parsed.email,
          role: parsed.role,
          hospital_id: parsed.hospitalId,
        };
      }

      return null;
    } catch {
      return null;
    }
  });
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  }, [user]);

  // Verify token on mount
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      
      // If we have both token and user in localStorage, keep them
      if (token && storedUser) {
        try {
          setIsLoading(true);
          await apiClient.auth.verify();
          // Verification passed, keep user logged in
        } catch (err) {
          // Verification failed, clear everything
          localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    verifyUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.auth.login(email, password);
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;

        // Convert backend field names to frontend format
        const formattedUser: User = {
          id: userData.id,
          full_name: userData.fullName,
          email: userData.email,
          role: userData.role,
          hospital_id: userData.hospitalId,
        };

        // Save token and normalized user
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(formattedUser));

        setUser(formattedUser);
      }
    } catch (err: any) {
      const message = err.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    setUser(null);
    setError(null);
  }, []);

  const signup = useCallback(async (
    full_name: string,
    email: string,
    password: string,
    role: User['role'],
    hospital_id: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.auth.signup(full_name, email, password, role, hospital_id);
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;

        // Convert backend field names to frontend format
        const formattedUser: User = {
          id: userData.id,
          full_name: userData.fullName,
          email: userData.email,
          role: userData.role,
          hospital_id: userData.hospitalId,
        };

        // Save token and normalized user
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(formattedUser));

        setUser(formattedUser);
      }
    } catch (err: any) {
      const message = err.message || 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      users,
      login,
      logout,
      signup,
      updateUser,
      isLoading,
      error,
    }),
    [user, users, login, logout, signup, updateUser, isLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
