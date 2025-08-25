import React, { createContext, useContext, useState } from "react";

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthorized" | "error";

interface AuthContext {
  token: string | null;
  user: any | null;
  status: AuthStatus;
  setStatus: (s: AuthStatus) => void;
  retry: () => void;
}

const Ctx = createContext<AuthContext>({
  token: null,
  user: null,
  status: "authenticated",
  setStatus: () => {},
  retry: () => {}
});

export const useAuth = () => useContext(Ctx);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>("authenticated");
  return (
    <Ctx.Provider value={{ token: null, user: null, status, setStatus, retry: () => {} }}>
      {children}
    </Ctx.Provider>
  );
};

export default AuthProvider;
