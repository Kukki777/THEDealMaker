require("dotenv").config({ quiet: true });
const cors = require("cors");
const dns = require("dns");
const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const propertyRoutes = require("./routes/properties");
const userRoutes = require("./routes/users");
const subscriptionRoutes = require("./routes/subscriptions");
const adminRoutes = require("./routes/admin");
const contactRoutes = require("./routes/contact");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dns.setDefaultResultOrder("ipv4first");

const app = express();
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "thedealmaker-api" });
});
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => console.log(`THEDealMaker API running on port ${port}`));
};

if (require.main === module) {
  start().catch((error) => {
    console.error(`Unable to start API: ${error.message}`);
    process.exit(1);
  });
}

module.exports = app;
