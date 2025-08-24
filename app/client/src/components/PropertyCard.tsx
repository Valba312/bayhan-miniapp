import React from "react";
import styles from "./PropertyCard.module.scss";

type Props = { property: any; onBook: () => void; onSwap: () => void; };

const PropertyCard: React.FC<Props> = ({ property, onBook, onSwap }) => {
  return (
    <div className="card">
      <img className="property-img" src={property.images?.[0]} alt={property.name} />
      <div className={styles.header}>
        <div>
          <div className={styles.title}>{property.name}</div>
          <div className={styles.subtitle}>{property.location}</div>
        </div>
        <div className="badge">{property.fractionText || "1/8"}</div>
      </div>
      <div className={styles.meta}>
        <span>Комнат: {property.rooms ?? "-"}</span>
        <span>Площадь: {property.areaM2 ?? "-"} м²</span>
      </div>
      <div className={styles.actions}>
        <button className="button" onClick={onBook}>Забронировать</button>
        <button className="button" onClick={onSwap} style={{ background: "transparent", color: "var(--link)", border: "1px solid var(--link)" }}>Обменять неделю</button>
      </div>
      <div className={styles.manager}>Управляющий: +33 6 00 00 00 00</div>
    </div>
  );
};

export default PropertyCard;