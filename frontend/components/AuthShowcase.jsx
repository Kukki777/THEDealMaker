"use client";

import { motion } from "framer-motion";
import { HOME_PHOTOS } from "@/lib/showcase";

export default function AuthShowcase({ title }) {
  return (
    <motion.aside
      animate={{ opacity: 1, x: 0 }}
      className="auth-showcase"
      initial={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="auth-photo"
        style={{ backgroundImage: `url("${HOME_PHOTOS[1].image}")` }}
      />
      <p className="eyebrow">THEDealMaker members</p>
      <h2>{title}</h2>
      <div className="auth-benefits">
        <span>Verified listings</span>
        <span>Mobile OTP access</span>
        <span>Owner dashboard</span>
      </div>
    </motion.aside>
  );
}
