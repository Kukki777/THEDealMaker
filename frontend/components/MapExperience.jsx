"use client";

import Link from "next/link";

export default function MapExperience({ location = "Bandra West, Mumbai", compact = false }) {
  const mapKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const query = encodeURIComponent(location);
  const embedUrl = mapKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapKey}&q=${query}&maptype=satellite`
    : null;
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <section className={`map-panel ${compact ? "map-compact" : ""}`}>
      <div className="map-heading">
        <div>
          <p className="eyebrow">Satellite view</p>
          <h2>Explore the neighborhood</h2>
          <p>{location}</p>
        </div>
        <Link className="outline-gold-button link-button" href={externalUrl} rel="noopener noreferrer" target="_blank">
          Open Maps
        </Link>
      </div>
      {embedUrl ? (
        <iframe
          allowFullScreen
          className="map-frame"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          title={`Satellite map of ${location}`}
        />
      ) : (
        <div className="map-placeholder">
          <div className="map-grid" />
          <div className="map-road road-one" />
          <div className="map-road road-two" />
          <div className="map-pin">
            <span />
            <strong>Selected residence</strong>
            <small>{location}</small>
          </div>
          <p className="map-setup">
            Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to enable the live Google satellite map.
          </p>
        </div>
      )}
    </section>
  );
}
