const normalizePhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
};

const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

const updateProfile = async (req, res) => {
  ["name", "avatar"].forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });
  if (req.body.phone !== undefined) {
    const phone = normalizePhone(req.body.phone);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: "Enter a valid 10-digit Indian mobile number" });
    }
    req.user.phone = phone;
  }
  await req.user.save();
  res.json({ user: req.user });
};

module.exports = { getProfile, updateProfile };
