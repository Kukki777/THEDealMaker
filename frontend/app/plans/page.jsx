"use client";

import Link from "next/link";
import { useState } from "react";
import { apiRequest, getAuthToken } from "@/lib/api";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: "Rs. 499",
    description: "Ideal for one property owner.",
    features: ["1 active listing", "30 day visibility", "Owner enquiries"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "Rs. 999",
    description: "Built for active sellers.",
    features: ["More visibility", "Featured-ready listings", "Priority support"],
    featured: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: "Rs. 1,999",
    description: "For professional portfolios.",
    features: ["Maximum reach", "Premium promotion", "Business support"],
  },
];

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PlansPage() {
  const [message, setMessage] = useState("");
  const [paying, setPaying] = useState("");

  const checkout = async (plan) => {
    if (!(await getAuthToken())) {
      setMessage("Sign in first to choose a paid plan.");
      return;
    }
    setPaying(plan.id);
    setMessage("");
    try {
      const ready = await loadRazorpay();
      if (!ready) throw new Error("Unable to load the payment window.");
      const result = await apiRequest("/subscriptions/orders", {
        method: "POST",
        body: JSON.stringify({ plan: plan.id }),
      });
      const payment = new window.Razorpay({
        key: result.keyId,
        amount: result.order.amount,
        currency: "INR",
        name: "THEDealMaker",
        description: `${plan.name} subscription`,
        order_id: result.order.id,
        handler: async (response) => {
          try {
            await apiRequest("/subscriptions/verify", {
              method: "POST",
              body: JSON.stringify(response),
            });
            setMessage("Payment received. Your plan is now active.");
          } catch (requestError) {
            setMessage(requestError.message);
          }
        },
      });
      payment.open();
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setPaying("");
    }
  };

  return (
    <main className="interior-shell">
      <div className="center-intro">
        <p className="eyebrow">Private membership</p>
        <h1>Give remarkable homes the attention they deserve.</h1>
        <p>Choose your visibility tier and complete protected payment through Razorpay.</p>
      </div>
      {message && <p className="notice-banner">{message}</p>}
      <div className="plans-grid">
        {plans.map((plan) => (
          <article className={`plan-card ${plan.featured ? "featured-plan" : ""}`} key={plan.id}>
            {plan.featured && <span className="popular-label">Most popular</span>}
            <h2>{plan.name}</h2>
            <p className="plan-price">{plan.price}<small>/month</small></p>
            <p>{plan.description}</p>
            <ul>
              {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <button className={plan.featured ? "primary-button full-button" : "quiet-button full-button"} type="button" disabled={paying === plan.id} onClick={() => void checkout(plan)}>
              {paying === plan.id ? "Opening..." : "Choose plan"}
            </button>
          </article>
        ))}
      </div>
      <p className="sign-in-note">Encrypted Razorpay checkout | Need to list first? <Link href="/list-property">Submit a property</Link></p>
    </main>
  );
}
