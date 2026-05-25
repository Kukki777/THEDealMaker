"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useFirebaseAuth } from "@/components/FirebaseAuthProvider";
import { apiRequest, formatPrice } from "@/lib/api";

export default function DashboardPage() {
  return (
    <Suspense fallback={<main className="interior-shell"><div className="empty-state">Loading your dashboard...</div></main>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { loading: authLoading, user } = useFirebaseAuth();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    Promise.all([apiRequest("/auth/me"), apiRequest("/properties/mine")])
      .then(([account, listings]) => {
        setProfile(account.user);
        setProperties(listings.properties);
      })
      .catch((requestError) => {
        setError(requestError.message);
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, router]);

  const removeProperty = async (id) => {
    if (!window.confirm("Delete this property listing?")) return;
    try {
      await apiRequest(`/properties/${id}`, { method: "DELETE" });
      setProperties((current) => current.filter((property) => property._id !== id));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="interior-shell dashboard-shell">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>{profile ? `Hello, ${profile.name}` : "Your properties"}</h1>
          <p>Track moderation status and manage every listing you have submitted.</p>
          {profile && (
            <p className="profile-contact">
              {profile.email?.endsWith("@phone.rentsell.local") || profile.email?.endsWith("@users.rentsell.local")
                ? "Mobile verified account"
                : profile.email}
              {" | "}
              {profile.phone || "No mobile added"}
            </p>
          )}
        </div>
        <Link className="primary-button link-button" href="/list-property">Add property</Link>
      </div>
      {searchParams.get("created") && (
        <p className="success-banner">Your property was submitted and is waiting for review.</p>
      )}
      {error && <p className="form-error">{error}</p>}
      {loading ? (
        <div className="empty-state">Loading your dashboard...</div>
      ) : properties.length === 0 ? (
        <div className="empty-state">
          <strong>No properties submitted</strong>
          <p>List your first property to start receiving enquiries.</p>
          <Link className="primary-button link-button" href="/list-property">List property</Link>
        </div>
      ) : (
        <div className="manage-list">
          {properties.map((property) => (
            <article className="manage-card" key={property._id}>
              <div>
                <span className={`status-chip status-${property.status}`}>{property.status}</span>
                <h2>{property.title}</h2>
                <p>{property.locality}, {property.city} - {formatPrice(property.price)}</p>
              </div>
              <div className="inline-actions">
                {property.status === "active" && (
                  <Link className="quiet-button link-button" href={`/properties/${property._id}`}>View</Link>
                )}
                <button className="danger-button" type="button" onClick={() => void removeProperty(property._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
