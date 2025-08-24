import React from "react";

type Props = { slots: any[]; onSelect?: (slot: any) => void };

const formatDate = (d: string) => new Date(d).toLocaleDateString();

const CalendarGrid: React.FC<Props> = ({ slots, onSelect }) => {
  return (
    <div className="calendar-grid">
      {slots.map((s) => {
        const status = s.isOpen ? "Доступно" : s.bookings?.length ? s.bookings[0].status : "Недоступно";
        const cls = "calendar-item" + (s.slotType === "HOLIDAY" ? " holiday" : "") + (!s.isOpen ? " blocked" : "");
        return (
          <div className={cls} key={s.id} onClick={() => s.isOpen && onSelect?.(s)}>
            <div style={{ fontWeight: 700 }}>{formatDate(s.startDate)} — {formatDate(s.endDate)}</div>
            <div style={{ fontSize: 12, color: "var(--hint)" }}>{s.slotType === "HOLIDAY" ? "Праздничная неделя" : "Обычная"}</div>
            <div style={{ marginTop: 6 }}><span className="badge">{status}</span></div>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarGrid;