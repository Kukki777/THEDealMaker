const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    deliveryStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    deliveryError: { type: String, trim: true },
    emailId: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
