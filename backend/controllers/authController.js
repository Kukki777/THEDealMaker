const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const OtpChallenge = require("../models/OtpChallenge");
const User = require("../models/User");

const publicUser = (user) => ({
  id: user._id,
  firebaseUid: user.firebaseUid,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  phone: user.phone,
  emailVerified: user.emailVerified,
  phoneVerified: user.phoneVerified,
  role: user.role,
});

const normalizePhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
};

const twoFactorRequest = async (path) => {
  const response = await fetch(`https://2factor.in/API/V1/${path}`, { method: "POST" });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.Status !== "Success") {
    throw new Error(result.Details || "Unable to send or verify OTP right now");
  }
  return result;
};

const requestMobileOtp = async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const name = String(req.body.name || "").trim();
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ message: "Enter a valid 10-digit Indian mobile number" });
  }
  if (name && name.length < 2) {
    return res.status(400).json({ message: "Enter a valid full name" });
  }
  if (!process.env.TWO_FACTOR_API_KEY) {
    return res.status(503).json({ message: "2Factor OTP is not configured. Add TWO_FACTOR_API_KEY in backend/.env." });
  }

  try {
    const result = await twoFactorRequest(
      `${encodeURIComponent(process.env.TWO_FACTOR_API_KEY)}/SMS/+91${phone}/AUTOGEN`
    );
    const challenge = await OtpChallenge.create({
      phone,
      name,
      sessionId: result.Details,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    res.json({
      challengeId: challenge._id,
      message: `OTP sent to +91 ${phone.slice(0, 2)}XXXX${phone.slice(-4)}`,
    });
  } catch (error) {
    res.status(502).json({ message: error.message });
  }
};

const verifyMobileOtp = async (req, res) => {
  const challengeId = String(req.body.challengeId || "");
  const otp = String(req.body.otp || "").trim();
  if (!/^\d{4,6}$/.test(otp)) {
    return res.status(400).json({ message: "Enter the OTP received on your mobile" });
  }
  if (!process.env.TWO_FACTOR_API_KEY || !process.env.JWT_SECRET) {
    return res.status(503).json({ message: "Mobile authentication is not configured" });
  }

  const challenge = await OtpChallenge.findOne({
    _id: challengeId,
    expiresAt: { $gt: new Date() },
  }).catch(() => null);
  if (!challenge) {
    return res.status(400).json({ message: "OTP request expired. Send a new OTP." });
  }

  try {
    const result = await twoFactorRequest(
      `${encodeURIComponent(process.env.TWO_FACTOR_API_KEY)}/SMS/VERIFY/${encodeURIComponent(challenge.sessionId)}/${encodeURIComponent(otp)}`
    );
    if (result.Details !== "OTP Matched") {
      return res.status(400).json({ message: "OTP is incorrect or expired" });
    }

    let user = await User.findOne({ phone: challenge.phone });
    if (!user) {
      user = new User({
        name: challenge.name || "THEDealMaker Member",
        email: `${challenge.phone}@phone.rentsell.local`,
        phone: challenge.phone,
      });
    } else if (challenge.name) {
      user.name = challenge.name;
    }
    user.phoneVerified = true;
    await user.save();
    await challenge.deleteOne();

    const token = jwt.sign(
      { userId: user._id.toString(), authProvider: "mobile_otp", nonce: crypto.randomUUID() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    res.json({ token, user: publicUser(user) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const me = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};

module.exports = { me, requestMobileOtp, verifyMobileOtp };
