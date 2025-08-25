import React, { useEffect } from "react";
import { useAuth } from "./AuthProvider";
import LoginScreen from "./LoginScreen";

const Spinner = () => (
  <div style={{ padding: 16 }}>
    <div className="spinner" />
  </div>
);

const ErrorScreen: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div style={{ padding: 16 }}>
    Ошибка авторизации.
    <div>
      <button className="button" onClick={onRetry} style={{ marginTop: 8 }}>
        Повторить
      </button>
    </div>
  </div>
);

const Private: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status, setStatus, retry } = useAuth();

  useEffect(() => {
    if (status === "loading") {
      const t = setTimeout(() => setStatus("unauthorized"), 4000);
      return () => clearTimeout(t);
    }
  }, [status, setStatus]);

  if (status === "loading" || status === "idle") return <Spinner />;
  if (status === "unauthorized") return <LoginScreen />;
  if (status === "error") return <ErrorScreen onRetry={retry} />;
  if (status === "authenticated") return <>{children}</>;
  return null;
};

export default Private;
