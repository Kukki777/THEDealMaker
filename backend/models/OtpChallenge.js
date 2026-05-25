const mongoose = require("mongoose");

const otpChallengeSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, trim: true },
    name: { type: String, trim: true, maxlength: 80 },
    sessionId: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OtpChallenge", otpChallengeSchema);
