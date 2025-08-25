import React, { useEffect, useState } from "react";
import { apiGet, useAuth } from "../../auth";

const AdminProperties: React.FC = () => {
  const { token } = useAuth();
  const [props, setProps] = useState<any[]>([]);
  useEffect(() => {
    if (!token) return;
    apiGet("/api/properties", token).then(setProps).catch(console.error);
  }, [token]);

  return (
    <div className="container">
      <h3>Admin — Properties</h3>
      <div className="grid">
        {props.map((p) => (
          <div className="card" key={p.id}>
            <b>{p.name}</b>
            <div style={{ fontSize: 12, color: "var(--hint)" }}>{p.location}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProperties;