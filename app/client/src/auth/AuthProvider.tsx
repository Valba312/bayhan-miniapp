import React, { createContext, useContext, useEffect, useState } from "react";
import { getTg } from "../lib/telegram";

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthorized" | "error";

interface AuthContext {
  token: string | null;
  user: any | null;
  status: AuthStatus;
  setStatus: (s: AuthStatus) => void;
  loginDev?: () => Promise<void>;
  retry: () => void;
}

const Ctx = createContext<AuthContext>({
  token: null,
  user: null,
  status: "idle",
  setStatus: () => {},
  retry: () => {}
});

export const useAuth = () => useContext(Ctx);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<any | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const allowDev = import.meta.env.VITE_ALLOW_DEV_AUTH === "1";
  const [retryCount, setRetryCount] = useState(0);

  const retry = () => setRetryCount((c) => c + 1);

  useEffect(() => {
    async function bootstrap() {
      setStatus("loading");
      try {
        const stored = localStorage.getItem("token");
        if (stored) {
          const res = await fetch("/api/auth/verify", { headers: { Authorization: "Bearer " + stored } });
          if (res.ok) {
            const data = await res.json();
            setToken(stored);
            setUser(data.user);
            setStatus("authenticated");
            return;
          }
          localStorage.removeItem("token");
        }

        const tg = getTg();
        if (tg?.initData) {
          const res = await fetch("/api/auth/telegram", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData: tg.initData })
          });
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem("token", data.token);
            setToken(data.token);
            setUser(data.user);
            setStatus("authenticated");
            return;
          }
          throw new Error("telegram auth failed");
        }

        setStatus("unauthorized");
      } catch (e) {
        console.error(e);
        setStatus("error");
      }
    }
    bootstrap();
  }, [retryCount]);

  const loginDev = allowDev
    ? async () => {
        setStatus("loading");
        try {
          const res = await fetch("/api/auth/dev", { method: "POST" });
          if (!res.ok) throw new Error("dev auth failed");
          const data = await res.json();
          localStorage.setItem("token", data.token);
          setToken(data.token);
          setUser(data.user);
          setStatus("authenticated");
        } catch (e) {
          console.error(e);
          setStatus("error");
        }
      }
    : undefined;

  return <Ctx.Provider value={{ token, user, status, setStatus, loginDev, retry }}>{children}</Ctx.Provider>;
};

export default AuthProvider;
