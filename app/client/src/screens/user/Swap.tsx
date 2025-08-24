import React, { useEffect, useState } from "react";
import { apiGet, apiPost, useAuth } from "../../lib/auth";
import CalendarGrid from "../../components/CalendarGrid";
import { getTg } from "../../lib/telegram";
import { useNavigate } from "react-router-dom";

const Swap: React.FC = () => {
  const { token } = useAuth();
  const [myConfirmed, setMyConfirmed] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [fromBooking, setFromBooking] = useState<any | null>(null);
  const [toSlot, setToSlot] = useState<any | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    async function load() {
      const bookings = await apiGet("/api/bookings/history?type=bookings", token!);
      const mine = bookings.filter((b: any) => b.status === "CONFIRMED");
      setMyConfirmed(mine);
    }
    if (token) load().catch(console.error);
  }, [token]);

  useEffect(() => {
    const tg = getTg();
    if (!tg) return;
    tg.BackButton.show();
    tg.BackButton.onClick(() => nav(-1));

    if (fromBooking && toSlot) {
      tg.MainButton.setParams({ text: "Отправить запрос обмена" });
      tg.MainButton.show();
      tg.MainButton.onClick(async () => {
        try {
          await apiPost("/api/exchange/request", token!, { fromBookingId: fromBooking.id, toSlotId: toSlot.id });
          nav("/history");
        } catch (e) { alert(String(e)); }
      });
    } else tg.MainButton.hide();
  }, [fromBooking, toSlot]);

  async function fetchAvailable() {
    const slots = await apiGet("/api/exchange/search", token!);
    setAvailable(slots);
  }

  return (
    <div className="container">
      <h3>Обмен неделями</h3>
      {step === 1 && (
        <div className="grid">
          {myConfirmed.map((b) => (
            <div className="card" key={b.id} onClick={() => { setFromBooking(b); setStep(2); fetchAvailable(); }}>
              <div style={{ fontWeight: 700 }}>{new Date(b.slot.startDate).toLocaleDateString()} — {new Date(b.slot.endDate).toLocaleDateString()}</div>
              <div style={{ fontSize: 12, color: "var(--hint)" }}>{b.slot.slotType === "HOLIDAY" ? "Праздничная неделя" : "Обычная"}</div>
            </div>
          ))}
          {!myConfirmed.length && <div className="card">Нет подтвержденных броней для обмена.</div>}
        </div>
      )}
      {step === 2 && (
        <>
          <p style={{ color: "var(--hint)" }}>Выберите желаемую неделю взамен</p>
          <CalendarGrid slots={available} onSelect={(s) => setToSlot(s)} />
        </>
      )}
    </div>
  );
};

export default Swap;