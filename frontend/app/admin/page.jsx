"use client";

import { useEffect, useState } from "react";
import { apiRequest, formatPrice } from "@/lib/api";

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    Promise.all([apiRequest("/admin/dashboard"), apiRequest("/admin/properties")])
      .then(([dashboard, listings]) => {
        setStats(dashboard);
        setProperties(listings.properties);
      })
      .catch((requestError) => setError(requestError.message));
  };

  useEffect(() => {
    Promise.all([apiRequest("/admin/dashboard"), apiRequest("/admin/properties")])
      .then(([dashboard, listings]) => {
        setStats(dashboard);
        setProperties(listings.properties);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const moderate = async (id, status) => {
    try {
      await apiRequest(`/admin/properties/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="interior-shell dashboard-shell">
      <div className="page-intro">
        <p className="eyebrow">Administration</p>
        <h1>Listing moderation</h1>
        <p>Review submitted homes before they go live in the marketplace.</p>
      </div>
      {error && <p className="form-error">{error}</p>}
      {stats && (
        <div className="stat-grid">
          <div><strong>{stats.users}</strong><span>Users</span></div>
          <div><strong>{stats.properties}</strong><span>Listings</span></div>
          <div><strong>{stats.pendingProperties}</strong><span>Pending review</span></div>
          <div><strong>{stats.activeSubscriptions}</strong><span>Subscriptions</span></div>
        </div>
      )}
      <div className="manage-list">
        {properties.map((property) => (
          <article className="manage-card" key={property._id}>
            <div>
              <span className={`status-chip status-${property.status}`}>{property.status}</span>
              <h2>{property.title}</h2>
              <p>{property.owner?.email} - {formatPrice(property.price)}</p>
            </div>
            <div className="inline-actions">
              <button className="approve-button" type="button" onClick={() => void moderate(property._id, "active")}>Approve</button>
              <button className="danger-button" type="button" onClick={() => void moderate(property._id, "rejected")}>Reject</button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
