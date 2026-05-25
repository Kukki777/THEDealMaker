const express = require("express");
const { me, requestMobileOtp, verifyMobileOtp } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/mobile/request-otp", requestMobileOtp);
router.post("/mobile/verify-otp", verifyMobileOtp);
router.get("/me", protect, me);

module.exports = router;
