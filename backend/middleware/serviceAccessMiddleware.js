const Subscription = require("../models/Subscription");

const hasServiceAccess = async (userId) => Boolean(
  await Subscription.exists({
    user: userId,
    plan: "service_access",
    status: "active",
  })
);

const requireServiceAccess = async (req, res, next) => {
  if (await hasServiceAccess(req.user._id)) {
    return next();
  }
  return res.status(402).json({
    message: "Please complete the one-time Rs. 111 service access payment first.",
  });
};

module.exports = { hasServiceAccess, requireServiceAccess };
