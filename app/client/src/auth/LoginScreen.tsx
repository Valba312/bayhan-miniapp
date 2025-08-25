import React from "react";
import { useAuth } from "./AuthProvider";

const LoginScreen: React.FC = () => {
  const { loginDev } = useAuth();
  const allowDev = Boolean(loginDev);
  const bot = import.meta.env.VITE_TG_BOT;

  return (
    <div style={{ padding: 16, textAlign: "center" }}>
      <p>
        Это веб-версия бота. Войдите через Telegram или используйте Dev-вход в режиме разработки.
      </p>
      <div style={{ marginTop: 12 }}>
        <a
          className="button"
          href={`https://t.me/${bot}?startapp=1`}
          target="_blank"
          rel="noreferrer"
        >
          Открыть в Telegram
        </a>
      </div>
      {allowDev && (
        <div style={{ marginTop: 8 }}>
          <button className="button" onClick={loginDev}>
            Dev-вход
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
