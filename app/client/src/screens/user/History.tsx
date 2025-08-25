import React, { useEffect, useState } from "react";
import { apiGet, useAuth } from "../../auth";

const History: React.FC = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [exchanges, setExchanges] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const b = await apiGet("/api/bookings/history?type=bookings", token!);
      setBookings(b);
      const e = await apiGet("/api/bookings/history?type=exchanges", token!);
      setExchanges(e);
    }
    if (token) load().catch(console.error);
  }, [token]);

  return (
    <div className="container">
      <h3>История</h3>
      <div className="grid">
        <div className="card">
          <b>Брони</b>
          {bookings.map((b) => (
            <div key={b.id} style={{ marginTop: 8 }}>
              #{b.id} — {new Date(b.slot.startDate).toLocaleDateString()} — <span className="badge">{b.status}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <b>Обмены</b>
          {exchanges.map((e) => (
            <div key={e.id} style={{ marginTop: 8 }}>
              #{e.id} — <span className="badge">{e.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;