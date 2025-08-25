import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiGet, useAuth } from "../../auth";

const Home: React.FC = () => {
  const { token } = useAuth();
  const [props, setProps] = useState<any[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    apiGet("/api/properties", token).then(setProps).catch(console.error);
  }, [token]);

  const p = props[0];
  return (
    <div className="container">
      <h2 style={{ margin: "6px 0 12px" }}>Bayhan</h2>
      {p && (
        <>
          <div className="grid">
            <div className="card">
              <img className="property-img" src={p.images?.[0]} alt={p.name} />
              <div style={{ marginTop: 8, fontWeight: 700 }}>{p.name}</div>
              <div style={{ color: "var(--hint)", fontSize: 12 }}>{p.location}</div>
              <div style={{ marginTop: 8 }} className="grid cols-2">
                <button className="button" onClick={() => nav("/booking")}>Бронирование</button>
                <button className="button" onClick={() => nav("/swap")}>Обмен</button>
              </div>
            </div>
          </div>
          <div className="footer-nav" style={{ marginTop: 12 }}>
            <Link to="/history">История</Link>
            <Link to="/profile">Профиль</Link>
            <Link to="/admin">Admin</Link>
            <a href="https://maps.google.com" target="_blank">Карта</a>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;