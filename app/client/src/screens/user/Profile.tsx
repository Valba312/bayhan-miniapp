import React, { useEffect, useState } from "react";
import { apiGet, useAuth } from "../../auth";

const Profile: React.FC = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    if (!token) return;
    apiGet("/api/bookings/profile", token).then(setProfile).catch(console.error);
  }, [token]);

  return (
    <div className="container">
      <h3>Профиль</h3>
      {profile && (
        <div className="card">
          <div><b>{profile.firstName} {profile.lastName}</b> @{profile.username}</div>
          <div style={{ marginTop: 6, color: "var(--hint)" }}>Язык: {profile.language}</div>
          <div style={{ marginTop: 8 }}>
            <b>Владения</b>
            {profile.ownerships.map((o: any) => (
              <div key={o.id} style={{ fontSize: 14, marginTop: 4 }}>
                {o.property.name}: {o.property.fractionText || "1/8"} (в очереди: {o.queueIndex})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;