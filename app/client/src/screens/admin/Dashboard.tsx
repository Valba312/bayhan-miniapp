import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  return (
    <div className="container">
      <h3>Admin</h3>
      {!isAdmin && <div className="card">Доступ только для администраторов.</div>}
      {isAdmin && (
        <div className="grid">
          <Link className="card" to="/admin/properties">Объекты</Link>
          <Link className="card" to="/admin/calendar">Календарь</Link>
          <Link className="card" to="/admin/exchanges">Обмены</Link>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;