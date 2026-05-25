const crypto = require("crypto");
const getRazorpay = require("../config/razorpay");
const { hasServiceAccess } = require("../middleware/serviceAccessMiddleware");
const Subscription = require("../models/Subscription");
const Transaction = require("../models/Transaction");

const PLANS = {
  service_access: { amount: 11100, days: null },
  basic: { amount: 49900, days: 30 },
  pro: { amount: 99900, days: 30 },
  elite: { amount: 199900, days: 30 },
};

const serviceAccessStatus = async (req, res) => {
  const unlocked = await hasServiceAccess(req.user._id);
  res.json({
    unlocked,
    amount: 11100,
    paymentReady: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    demoEnabled: process.env.SERVICE_ACCESS_DEMO_MODE === "true",
  });
};

const createServiceAccessOrder = async (req, res) => {
  if (await hasServiceAccess(req.user._id)) {
    return res.json({ unlocked: true });
  }
  req.body.plan = "service_access";
  return createOrder(req, res);
};

const unlockDemoServiceAccess = async (req, res) => {
  if (process.env.SERVICE_ACCESS_DEMO_MODE !== "true") {
    return res.status(403).json({ message: "Demo service unlock is unavailable." });
  }
  if (await hasServiceAccess(req.user._id)) {
    return res.json({ unlocked: true });
  }

  await Subscription.create({
    user: req.user._id,
    plan: "service_access",
    amount: 11100,
    status: "active",
    razorpayOrderId: `demo_service_access_${req.user._id}_${Date.now()}`,
    startsAt: new Date(),
  });
  res.json({ unlocked: true, demo: true, message: "Demo access enabled for all services." });
};

const createOrder = async (req, res) => {
  const selected = PLANS[req.body.plan];
  if (!selected) return res.status(400).json({ message: "Invalid subscription plan" });

  const order = await getRazorpay().orders.create({
    amount: selected.amount,
    currency: "INR",
    receipt: `sub_${Date.now()}`,
    notes: { userId: String(req.user._id), plan: req.body.plan },
  });
  const subscription = await Subscription.create({
    user: req.user._id,
    plan: req.body.plan,
    amount: selected.amount,
    razorpayOrderId: order.id,
  });
  res.status(201).json({ order, subscriptionId: subscription._id, keyId: process.env.RAZORPAY_KEY_ID });
};

const verifyPayment = async (req, res) => {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ message: "Payment verification fields are required" });
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  if (!process.env.RAZORPAY_KEY_SECRET || expected !== signature) {
    return res.status(400).json({ message: "Payment signature is invalid" });
  }

  const subscription = await Subscription.findOne({ razorpayOrderId: orderId, user: req.user._id });
  if (!subscription) return res.status(404).json({ message: "Subscription order not found" });

  const days = PLANS[subscription.plan].days;
  subscription.status = "active";
  subscription.startsAt = new Date();
  subscription.expiresAt = days
    ? new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    : undefined;
  await subscription.save();
  await Transaction.create({
    user: req.user._id,
    subscription: subscription._id,
    orderId,
    paymentId,
    signature,
    amount: subscription.amount,
  });
  res.json({ message: "Subscription activated", subscription });
};

const mySubscriptions = async (req, res) => {
  const subscriptions = await Subscription.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ subscriptions });
};

module.exports = {
  createOrder,
  createServiceAccessOrder,
  unlockDemoServiceAccess,
  serviceAccessStatus,
  verifyPayment,
  mySubscriptions,
};
