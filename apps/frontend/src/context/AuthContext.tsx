import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  provider: "github" | "google";
  github_username: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGithub: () => void;
  loginWithGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    axios
      .get(`${BACKEND_URL}/api/v1/auth/me`)
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      })
      .finally(() => setIsLoading(false));
  }, []);

  function loginWithGithub() {
    window.location.href = `${BACKEND_URL}/api/v1/auth/github`;
  }

  function loginWithGoogle() {
    window.location.href = `${BACKEND_URL}/api/v1/auth/google`;
  }

  function logout() {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGithub,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
