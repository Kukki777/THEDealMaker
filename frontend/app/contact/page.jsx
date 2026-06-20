"use client";

import { useState } from "react";
import { Reveal } from "@/components/MotionReveal";
import { apiRequest } from "@/lib/api";

const channels = [
  { title: "Private viewings", text: "Schedule a residence tour with our concierge team." },
  { title: "Owners", text: "Discuss positioning, imagery, and premium visibility." },
  { title: "Service access", text: "Guidance on the one-time access pass and secure checkout." },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    setError("");
    setMessage("");
    try {
      const result = await apiRequest("/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMessage(result.message);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="interior-shell">
      <section className="contact-layout">
        <Reveal className="contact-copy">
          <p className="eyebrow">Concierge desk</p>
          <h1>Begin your private property conversation.</h1>
          <p>
            Share what you are seeking or listing. Your inquiry is delivered
            securely to THEDealMaker for a personal response.
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <form className="concierge-form" onSubmit={submit}>
            <label className="field">
              <span>Full name</span>
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" />
            </label>
            <label className="field">
              <span>Email address</span>
              <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" />
            </label>
            <label className="field">
              <span>Mobile number</span>
              <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+91 XXXXXXXXXX" />
            </label>
            <label className="field wide">
              <span>How may we assist?</span>
              <textarea required rows="6" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Tell us about the home or location you have in mind." />
            </label>
            {message && <p className="success-banner wide">{message}</p>}
            {error && <p className="form-error wide">{error}</p>}
            <button className="gold-button wide" disabled={sending} type="submit">
              {sending ? "Sending inquiry..." : "Send inquiry"}
            </button>
          </form>
        </Reveal>
      </section>
      <div className="contact-options">
        {channels.map((channel) => (
          <article className="contact-option" key={channel.title}>
            <h2>{channel.title}</h2>
            <p>{channel.text}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
