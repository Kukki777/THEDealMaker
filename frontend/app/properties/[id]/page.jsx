"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFirebaseAuth } from "@/components/FirebaseAuthProvider";
import MapExperience from "@/components/MapExperience";
import PropertyGallery from "@/components/PropertyGallery";
import { apiRequest, formatPrice } from "@/lib/api";

export default function PropertyPage() {
  const params = useParams();
  const { user } = useFirebaseAuth();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest(`/properties/${params.id}`)
      .then((result) => setProperty(result.property))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <main className="interior-shell"><div className="empty-state">Loading property...</div></main>;
  }

  if (error || !property) {
    return (
      <main className="interior-shell">
        <div className="empty-state">
          <strong>Property unavailable</strong>
          <p>{error}</p>
          <Link className="quiet-button link-button" href="/#properties">Back to listings</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="interior-shell property-page">
      <Link className="back-link" href="/#properties">Back to properties</Link>
      <div className="property-layout">
        <section>
          <PropertyGallery images={property.images} />
          <div className="detail-heading">
            <span className="status-chip status-active">{property.purpose === "rent" ? "For rent" : "For sale"}</span>
            <h1>{property.title}</h1>
            <p>{property.locality}, {property.city}</p>
          </div>
          <div className="detail-specs">
            <span><strong>{property.bedrooms}</strong> Bedrooms</span>
            <span><strong>{property.bathrooms}</strong> Bathrooms</span>
            {property.areaSqFt && <span><strong>{property.areaSqFt}</strong> sq.ft.</span>}
            <span><strong>{property.propertyType}</strong> Type</span>
          </div>
          <div className="description-card">
            <h2>About this property</h2>
            <p>{property.description}</p>
          </div>
          <MapExperience compact location={`${property.locality}, ${property.city}`} />
        </section>
        <aside className="contact-card">
          <p className="price">
            {formatPrice(property.price)}
            {property.purpose === "rent" && <small>/month</small>}
          </p>
          <h2>Contact owner</h2>
          <p>{property.owner?.name || "Property owner"}</p>
          {property.owner?.phone ? (
            <a className="primary-button link-button full-button" href={`tel:${property.owner.phone}`}>
              Call {property.owner.phone}
            </a>
          ) : user ? (
            <p className="contact-unavailable">Owner has not added a contact number yet.</p>
          ) : (
            <Link className="primary-button link-button full-button" href="/login">
              Sign in to connect
            </Link>
          )}
        </aside>
      </div>
    </main>
  );
}
