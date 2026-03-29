"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type User = {
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage for dummy persistence
    const storedUser = localStorage.getItem("mediscan_dummy_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse dummy user data", e);
      }
    }
  }, []);

  const login = (email: string, customName?: string) => {
    // Dummy login logic: always succeed, extract username from email
    const nameStr = email.split("@")[0] || "User";
    const defaultName = nameStr.charAt(0).toUpperCase() + nameStr.slice(1);
    const name = customName || defaultName;
    
    const loggedInUser = { email, name };
    setUser(loggedInUser);
    localStorage.setItem("mediscan_dummy_user", JSON.stringify(loggedInUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mediscan_dummy_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
