const express = require("express");
const {
  createOrder,
  createServiceAccessOrder,
  unlockDemoServiceAccess,
  serviceAccessStatus,
  verifyPayment,
  mySubscriptions,
} = require("../controllers/subscriptionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", mySubscriptions);
router.get("/service-access", serviceAccessStatus);
router.post("/service-access/orders", createServiceAccessOrder);
router.post("/service-access/demo-unlock", unlockDemoServiceAccess);
router.post("/orders", createOrder);
router.post("/verify", verifyPayment);

module.exports = router;
