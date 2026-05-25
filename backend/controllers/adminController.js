const Property = require("../models/Property");
const Subscription = require("../models/Subscription");
const User = require("../models/User");

const dashboard = async (req, res) => {
  const [users, properties, pendingProperties, activeSubscriptions] = await Promise.all([
    User.countDocuments(),
    Property.countDocuments(),
    Property.countDocuments({ status: "pending" }),
    Subscription.countDocuments({ status: "active", expiresAt: { $gt: new Date() } }),
  ]);
  res.json({ users, properties, pendingProperties, activeSubscriptions });
};

const listUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users });
};

const listProperties = async (req, res) => {
  const properties = await Property.find().populate("owner", "name email").sort({ createdAt: -1 });
  res.json({ properties });
};

const moderateProperty = async (req, res) => {
  const allowed = ["pending", "active", "rejected", "sold", "rented"];
  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ message: "Invalid property status" });
  }
  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, isFeatured: Boolean(req.body.isFeatured) },
    { new: true, runValidators: true }
  );
  if (!property) return res.status(404).json({ message: "Property not found" });
  res.json({ property });
};

module.exports = { dashboard, listUsers, listProperties, moderateProperty };
