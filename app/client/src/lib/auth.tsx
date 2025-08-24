import React, { createContext, useContext, useEffect, useState } from "react";
import { getTg } from "./telegram";

type Ctx = { token: string | null; user: any | null; setToken: (t: string | null) => void; };
const AuthCtx = createContext<Ctx>({ token: null, user: null, setToken: () => {} });
export const useAuth = () => useContext(AuthCtx);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    async function bootstrap() {
      if (token) {
        const profile = await fetch("/api/bookings/profile", { headers: { Authorization: "Bearer " + token } })
          .then((r) => (r.ok ? r.json() : Promise.reject(r)))
          .catch(() => null);
        if (profile?.ok) setUser(profile.data);
        return;
      }

      const tg = getTg();
      let initData: string | undefined;
      if (tg?.initData) initData = tg.initData;

      const resp = await fetch("/api/auth/telegram/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData })
      }).then((r) => r.json());

      if (resp?.ok) {
        localStorage.setItem("token", resp.token);
        setToken(resp.token);
        setUser(resp.user);
      }
    }
    bootstrap().catch(console.error);
  }, [token]);

  return <AuthCtx.Provider value={{ token, user, setToken }}>{children}</AuthCtx.Provider>;
};

export async function apiGet(path: string, token: string) {
  const res = await fetch(path, { headers: { Authorization: "Bearer " + token } });
  const json = await res.json();
  if (!json.ok) throw new Error(json.message || "API error");
  return json.data;
}

export async function apiPost(path: string, token: string, body?: any) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify(body || {})
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.message || "API error");
  return json.data;
}