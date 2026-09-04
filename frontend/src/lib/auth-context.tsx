"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { CurrentUser } from "./types";
import { login as apiLogin } from "./api";

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem("sdl_user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        // ignore corrupted value
      }
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const res = await apiLogin(email, password);
    const currentUser: CurrentUser = { fullName: res.fullName, email: res.email, role: res.role };
    localStorage.setItem("sdl_token", res.token);
    localStorage.setItem("sdl_user", JSON.stringify(currentUser));
    setUser(currentUser);
  }

  function logout() {
    localStorage.removeItem("sdl_token");
    localStorage.removeItem("sdl_user");
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
