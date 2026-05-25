const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    orderId: { type: String, required: true },
    paymentId: { type: String, required: true, unique: true },
    signature: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["paid", "failed"], default: "paid" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
