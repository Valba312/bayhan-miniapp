import React, { useEffect, useState } from "react";
import { apiGet, apiPost, useAuth } from "../../auth";

const ExchangesModeration: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    const ex = await apiGet("/api/bookings/history?type=exchanges", token!);
    setItems(ex);
  }

  useEffect(() => { if (token) load().catch(console.error); }, [token]);

  async function accept(id: number) {
    await apiPost(`/api/exchange/${id}/accept`, token!, {});
    await load();
  }
  async function decline(id: number) {
    await apiPost(`/api/exchange/${id}/decline`, token!, {});
    await load();
  }

  return (
    <div className="container">
      <h3>Admin — Exchanges</h3>
      <div className="grid">
        {items.map((e) => (
          <div key={e.id} className="card" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            #{e.id} — <span className="badge">{e.status}</span>
            {e.status === "PENDING" && (
              <>
                <button className="button" onClick={() => accept(e.id)}>Принять</button>
                <button className="button" onClick={() => decline(e.id)} style={{ background: "transparent", color: "crimson", border: "1px solid crimson" }}>Отклонить</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default ExchangesModeration;