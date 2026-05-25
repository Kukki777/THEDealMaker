const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, enum: ["service_access", "basic", "pro", "elite"], required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
    },
    razorpayOrderId: { type: String, required: true, unique: true },
    startsAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
