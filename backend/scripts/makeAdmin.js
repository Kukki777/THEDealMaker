require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const makeAdmin = async () => {
  const identifier = String(process.argv[2] || "").toLowerCase().trim();
  if (!identifier) {
    throw new Error("Usage: npm run make:admin -- your-email@example.com | 9876543210");
  }

  await connectDB();
  const digits = identifier.replace(/\D/g, "");
  const phone = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  const lookup = /^[6-9]\d{9}$/.test(phone)
    ? { phone }
    : { email: identifier };
  const user = await User.findOneAndUpdate(
    lookup,
    { role: "admin" },
    { returnDocument: "after" }
  );
  if (!user) {
    throw new Error("Register that account first, then run this command again");
  }

  console.log(`${user.name} is now an admin`);
};

makeAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
