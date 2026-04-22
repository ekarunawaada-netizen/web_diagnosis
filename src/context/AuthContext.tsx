"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import apiClient, { setAccessToken } from "@/lib/axios";

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
   * Restore session on mount.
   *
   * Urutan:
   *   1. GET /api/auth/me  — jika cookie masih valid, server kembalikan user + token
   *   2. POST /api/auth/refresh — fallback jika /me gagal (token expired)
   *   3. Keduanya gagal → user belum login
   */
  const tryRestoreSession = useCallback(async () => {
    try {
      // Step 1: coba /me dulu
      const meRes = await apiClient.get("/api/auth/me");
      const tokenFromMe: string | null =
        meRes.data?.accessToken ?? meRes.data?.data?.accessToken ?? null;

      if (tokenFromMe) setAccessToken(tokenFromMe);

      const fetchedUser =
        meRes.data?.user ?? meRes.data?.data?.user ?? meRes.data?.data ?? null;
      setUser(fetchedUser);

    } catch {
      // /me gagal → coba /refresh
      try {
        const refreshRes = await apiClient.post("/api/auth/refresh");
        const newToken: string | null =
          refreshRes.data?.accessToken ?? refreshRes.data?.data?.accessToken ?? null;

        if (newToken) setAccessToken(newToken);

        const meRes = await apiClient.get("/api/auth/me");
        const fetchedUser =
          meRes.data?.user ?? meRes.data?.data?.user ?? meRes.data?.data ?? null;
        setUser(fetchedUser);

      } catch {
        // Keduanya gagal — tidak ada sesi aktif
        setAccessToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    tryRestoreSession();
  }, [tryRestoreSession]);

  // ─── Dengarkan event global 'auth:expired' dari axios interceptor ─────────────
  useEffect(() => {
    const handleExpired = () => {
      setAccessToken(null);
      setUser(null);
    };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, []);

  // ─── login ──────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (username: string, password: string, rememberMe = false) => {
      const { data } = await apiClient.post("/api/auth/login", {
        username,
        password,
        rememberMe,
      });
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
      // Tetap clear state meski server call gagal
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

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
