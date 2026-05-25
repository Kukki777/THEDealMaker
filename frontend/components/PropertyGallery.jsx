"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { HOME_PHOTOS } from "@/lib/showcase";

export default function PropertyGallery({ images = [] }) {
  const gallery = images.length
    ? images.map((image) => image.url).filter(Boolean)
    : HOME_PHOTOS.map((home) => home.image);
  const [selected, setSelected] = useState(0);

  return (
    <section className="property-gallery" aria-label="Property photos">
      <div className="gallery-stage">
        <AnimatePresence mode="wait">
          <motion.div
            className="gallery-stage-image"
            key={gallery[selected]}
            style={{ backgroundImage: `url("${gallery[selected]}")` }}
            initial={{ opacity: 0, scale: 1.025 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        </AnimatePresence>
        <span className="premium-pill">Premium selection</span>
        <span className="photo-count">{selected + 1} / {gallery.length}</span>
      </div>
      <div className="gallery-thumbnails">
        {gallery.map((image, index) => (
          <button
            aria-label={`Show photo ${index + 1}`}
            className={selected === index ? "selected" : ""}
            key={image}
            onClick={() => setSelected(index)}
            style={{ backgroundImage: `url("${image}")` }}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}
