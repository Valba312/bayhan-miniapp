import React, { useEffect, useState } from "react";
import { apiGet, apiPost, useAuth } from "../../auth";
import CalendarGrid from "../../components/CalendarGrid";
import { getTg } from "../../lib/telegram";
import { useNavigate } from "react-router-dom";

const Booking: React.FC = () => {
  const { token } = useAuth();
  const [property, setProperty] = useState<any | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    async function load() {
      const props = await apiGet("/api/properties", token!);
      setProperty(props[0]);
      const s = await apiGet(`/api/properties/${props[0].id}/slots`, token!);
      setSlots(s);
    }
    if (token) load().catch(console.error);
  }, [token]);

  useEffect(() => {
    const tg = getTg();
    if (!tg) return;
    if (selected) {
      tg.MainButton.setParams({ text: "Запросить бронь" });
      tg.MainButton.show();
      tg.MainButton.onClick(async () => {
        try {
          await apiPost(`/api/bookings/${selected.id}/request`, token!, {});
          tg.MainButton.hide();
          nav("/history");
        } catch (e) { alert(String(e)); }
      });
    } else {
      tg.MainButton.hide();
    }
    tg.BackButton.show();
    tg.BackButton.onClick(() => nav(-1));
  }, [selected, token]);

  return (
    <div className="container">
      <h3>Бронирование — {property?.name}</h3>
      <CalendarGrid slots={slots} onSelect={(s) => setSelected(s)} />
    </div>
  );
};

export default Booking;