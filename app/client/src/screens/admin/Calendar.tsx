import React, { useEffect, useState } from "react";
import { apiGet, apiPost, useAuth } from "../../auth";

const AdminCalendar: React.FC = () => {
  const { token } = useAuth();
  const [property, setProperty] = useState<any | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  async function load() {
    const props = await apiGet("/api/properties", token!);
    setProperty(props[0]);
    const s = await apiGet(`/api/properties/${props[0].id}/slots`, token!);
    setSlots(s);
    const all = await fetch("/api/bookings/history?type=bookings", { headers: { Authorization: "Bearer " + token } }).then(r => r.json());
    if (all.ok) setBookings(all.data);
  }

  useEffect(() => { if (token) load().catch(console.error); }, [token]);

  async function confirm(id: number) {
    await apiPost(`/api/bookings/admin/${id}/confirm`, token!, {});
    await load();
  }
  async function decline(id: number) {
    await apiPost(`/api/bookings/admin/${id}/decline`, token!, {});
    await load();
  }

  return (
    <div className="container">
      <h3>Admin — Calendar ({property?.name})</h3>
      <div className="grid">
        <div className="card">
          <b>Слоты</b>
          {slots.map((s) => (
            <div key={s.id} style={{ marginTop: 8 }}>
              {new Date(s.startDate).toLocaleDateString()} — <span className="badge">{s.slotType}</span> — {s.isOpen ? "open" : "closed"}
            </div>
          ))}
        </div>
        <div className="card">
          <b>Заявки на модерацию</b>
          {bookings
            .filter((b) => b.status === "PENDING")
            .map((b) => (
              <div key={b.id} style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                #{b.id}: {new Date(b.slot.startDate).toLocaleDateString()}
                <button className="button" onClick={() => confirm(b.id)}>Подтвердить</button>
                <button className="button" onClick={() => decline(b.id)} style={{ background: "transparent", color: "crimson", border: "1px solid crimson" }}>Отклонить</button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AdminCalendar;