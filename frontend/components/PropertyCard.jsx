"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatPrice } from "@/lib/api";
import { HOME_PHOTOS } from "@/lib/showcase";

export default function PropertyCard({ property, index = 0 }) {
  const image = property.images?.[0]?.url || HOME_PHOTOS[index % HOME_PHOTOS.length].image;

  return (
    <motion.article
      className="luxury-property-card"
      whileHover={{ y: -10, rotateX: 1.5, rotateY: -1.5 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
    >
      <Link href={`/properties/${property._id}`}>
        <div className="luxury-property-image" style={{ backgroundImage: `url("${image}")` }}>
          <span className="premium-pill">{property.isFeatured ? "Premium" : property.purpose}</span>
        </div>
        <div className="luxury-property-info">
          <div className="price-row">
            <p>{formatPrice(property.price)}</p>
            {property.purpose === "rent" && <small>/ month</small>}
          </div>
          <h3>{property.title}</h3>
          <p className="card-address">{property.locality}, {property.city}</p>
          <div className="card-specs">
            <span>{property.bedrooms} Beds</span>
            <span>{property.bathrooms} Baths</span>
            {property.areaSqFt && <span>{property.areaSqFt} sq.ft.</span>}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
