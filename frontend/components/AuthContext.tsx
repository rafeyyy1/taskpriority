"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, registerUser as apiRegister, logout as apiLogout, getCurrentUser } from "@/lib/api";

interface User {
  id: string;
  username: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      if (storedToken) {
        try {
          setToken(storedToken);
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Failed to restore session:", error);
          if (typeof window !== 'undefined') {
            localStorage.removeItem("token");
          }
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const { token: receivedToken, user: receivedUser } = await apiLogin(credentials);
      if (typeof window !== 'undefined') {
        localStorage.setItem("token", receivedToken);
      }
      setToken(receivedToken);
      setUser(receivedUser);
    } catch (error: any) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
      }
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      await apiRegister(userData);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout request error on backend:", error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
      }
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
