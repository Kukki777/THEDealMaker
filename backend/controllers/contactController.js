const Inquiry = require("../models/Inquiry");

const sendInquiry = async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const phone = String(req.body.phone || "").trim();
  const message = String(req.body.message || "").trim();
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 2) {
    return res.status(400).json({ message: "Enter your name, valid email, and enquiry details." });
  }
  const inquiry = await Inquiry.create({ name, email, phone, message });
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO_EMAIL || !process.env.EMAIL_FROM) {
    inquiry.deliveryStatus = "failed";
    inquiry.deliveryError = "Inquiry email is not configured yet.";
    await inquiry.save();
    return res.status(503).json({ message: "Your inquiry was saved, but email delivery is not configured yet." });
  }

  const emailPayload = {
    from: process.env.EMAIL_FROM,
    to: process.env.CONTACT_TO_EMAIL.trim().toLowerCase(),
    reply_to: email,
    subject: `THEDealMaker inquiry from ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      "",
      message,
    ].join("\n"),
  };

  let emailResponse;
  try {
    emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });
  } catch {
    inquiry.deliveryStatus = "failed";
    inquiry.deliveryError = "Unable to connect to email provider.";
    await inquiry.save();
    return res.status(502).json({ message: "Your inquiry was saved, but email delivery is currently unavailable." });
  }

  const result = await emailResponse.json().catch(() => ({}));
  if (!emailResponse.ok) {
    inquiry.deliveryStatus = "failed";
    inquiry.deliveryError = result.message || "Unable to deliver inquiry right now.";
    await inquiry.save();
    const testRecipientError = /only send testing emails to your own email/i.test(inquiry.deliveryError);
    const configurationError = /api key|domain|verify|validation/i.test(inquiry.deliveryError);
    return res.status(502).json({
      message: testRecipientError
        ? "Your inquiry was saved. Resend test mode can deliver only to your Resend account email until your domain is verified."
        : configurationError
        ? "Your inquiry was saved. Email delivery needs a valid Resend API key/domain configuration."
        : "Your inquiry was saved, but email delivery is currently unavailable.",
    });
  }

  inquiry.deliveryStatus = "sent";
  inquiry.emailId = result.id;
  await inquiry.save();
  res.json({ message: "Thank you. Your inquiry has been delivered to our team." });
};

module.exports = { sendInquiry };
