const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const normalizePhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
};

const getFirebaseAdminAuth = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;

  if (!getApps().length) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }
  return getAuth();
};

const syncUser = async (account) => {
  const firebaseUid = account.uid;
  const primaryEmail = account.email?.toLowerCase();
  const email = primaryEmail || `${firebaseUid}@users.rentsell.local`;
  const phone = normalizePhone(account.phone_number);

  let user = await User.findOne({ firebaseUid });
  if (!user && primaryEmail) user = await User.findOne({ email });
  if (!user && phone) user = await User.findOne({ phone });
  if (!user) {
    user = new User({ firebaseUid, name: account.name || "THEDealMaker Member" });
  }

  user.firebaseUid = firebaseUid;
  user.name = account.name || user.name;
  user.email = email;
  if (phone) user.phone = phone;
  user.avatar = account.picture || user.avatar;
  user.emailVerified = Boolean(primaryEmail && account.email_verified);
  user.phoneVerified = Boolean(phone);
  await user.save();
  return user;
};

const protect = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (process.env.JWT_SECRET) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload.authProvider === "mobile_otp") {
          req.user = await User.findById(payload.userId);
          if (!req.user) throw new Error("Mobile account unavailable");
          return next();
        }
      } catch (error) {
        // Firebase tokens fall through to Firebase Admin verification.
      }
    }

    const auth = getFirebaseAdminAuth();
    if (!auth) {
      return res.status(503).json({ message: "Authentication is not configured" });
    }
    const account = await auth.verifyIdToken(token);
    req.user = await syncUser(account);
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired session" });
  }
};

const optionalProtect = (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return next();
  return protect(req, res, next);
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = { protect, optionalProtect, adminOnly };
