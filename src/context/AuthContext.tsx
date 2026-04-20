"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import apiClient, { setAccessToken, getAccessToken } from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = {
  id: number;
  username: string;
  permId: number;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const didInitRef = useRef(false);

  /**
   * Try to silently restore session on mount using the httpOnly refresh-token
   * cookie (set by the backend on login). If the cookie is valid a new
   * access-token is returned and we fetch the current user profile.
   */
  const tryRestoreSession = useCallback(async () => {
    try {
      const { data } = await apiClient.post("/api/auth/refresh");
      setAccessToken(data.accessToken);

      // Fetch full user profile
      const meRes = await apiClient.get("/api/auth/me");
      setUser(meRes.data.user ?? meRes.data);
    } catch {
      // Cookie is absent or expired — user is not authenticated
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    tryRestoreSession();
  }, [tryRestoreSession]);

  // ─── login ──────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (username: string, password: string, rememberMe = false) => {
      const { data } = await apiClient.post("/api/auth/login", {
        username,
        password,
        rememberMe,
      });

      // Backend returns { accessToken, user: { id, username, permId } }
      setAccessToken(data.accessToken);
      setUser(data.user);
    },
    []
  );

  // ─── logout ─────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch {
      // Always clear client-side state even if the server call fails
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  // ─── Context value ───────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
