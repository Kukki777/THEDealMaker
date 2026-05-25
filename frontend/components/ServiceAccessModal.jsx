"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { apiRequest, getAuthToken } from "@/lib/api";

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function ServiceAccessModal({ open, onClose, onUnlocked }) {
  const [signedIn, setSignedIn] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [demoEnabled, setDemoEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");
  const onUnlockedRef = useRef(onUnlocked);

  useEffect(() => {
    onUnlockedRef.current = onUnlocked;
  }, [onUnlocked]);

  useEffect(() => {
    if (!open) return;
    let active = true;

    getAuthToken().then(async (token) => {
      if (active) {
        setLoading(true);
        setMessage("");
      }
      if (!token) {
        if (active) {
          setSignedIn(false);
          setLoading(false);
        }
        return;
      }
      setSignedIn(true);
      try {
        const status = await apiRequest("/subscriptions/service-access");
        if (!active) return;
        if (status.unlocked) {
          onUnlockedRef.current();
          return;
        }
        setPaymentReady(status.paymentReady);
        setDemoEnabled(status.demoEnabled);
      } catch (error) {
        if (active) setMessage(error.message);
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [open]);

  const payNow = async () => {
    if (!paymentReady) {
      setMessage("Razorpay test keys are not configured yet. Add test keys to enable the secure Rs. 111 payment.");
      return;
    }
    setPaying(true);
    setMessage("");
    try {
      if (!(await loadRazorpay())) throw new Error("Unable to load Razorpay checkout.");
      const result = await apiRequest("/subscriptions/service-access/orders", { method: "POST" });
      if (result.unlocked) return onUnlockedRef.current();
      const payment = new window.Razorpay({
        key: result.keyId,
        amount: result.order.amount,
        currency: "INR",
        name: "THEDealMaker",
        description: "Lifetime service access",
        order_id: result.order.id,
        handler: async (response) => {
          try {
            await apiRequest("/subscriptions/verify", {
              method: "POST",
              body: JSON.stringify(response),
            });
            onUnlockedRef.current();
          } catch (error) {
            setMessage(error.message);
          }
        },
        theme: { color: "#d2aa62" },
      });
      payment.open();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPaying(false);
    }
  };

  const unlockDemo = async () => {
    setPaying(true);
    setMessage("");
    try {
      const result = await apiRequest("/subscriptions/service-access/demo-unlock", { method: "POST" });
      if (result.unlocked) onUnlockedRef.current();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div animate={{ opacity: 1 }} className="access-backdrop" exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
          <motion.section
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            className="access-modal"
            exit={{ opacity: 0, y: 20 }}
            initial={{ opacity: 0, y: 32, rotateX: -8 }}
          >
            <button aria-label="Close payment dialog" className="modal-close" onClick={onClose} type="button">x</button>
            <p className="eyebrow">Member access</p>
            <h2>Avail all services with one payment.</h2>
            <p className="access-copy">
              Pay only once to unlock buying, renting, selling houses and plot services.
            </p>
            <div className="access-price">
              <strong>Rs. 111</strong>
              <span>one-time access</span>
            </div>
            {!signedIn && !loading ? (
              <Link className="primary-button link-button full-button" href="/login">Sign in to pay</Link>
            ) : (
              <button className="primary-button full-button" disabled={loading || paying} onClick={() => void payNow()} type="button">
                {loading ? "Checking access..." : paying ? "Opening checkout..." : "Pay Now"}
              </button>
            )}
            {message && <p className="form-error auth-feedback">{message}</p>}
            {!paymentReady && signedIn && !loading && (
              <>
                {demoEnabled && (
                  <button className="demo-access-button full-button" disabled={paying} onClick={() => void unlockDemo()} type="button">
                    Unlock in Demo Mode
                  </button>
                )}
                <p className="payment-hint">
                  {demoEnabled
                    ? "Development only: this skips payment while Razorpay is being configured."
                    : "Use Razorpay test mode keys first; no real charge is required while building."}
                </p>
              </>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
