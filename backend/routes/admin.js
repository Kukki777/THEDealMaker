const express = require("express");
const {
  dashboard,
  listUsers,
  listProperties,
  moderateProperty,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, adminOnly);
router.get("/dashboard", dashboard);
router.get("/users", listUsers);
router.get("/properties", listProperties);
router.patch("/properties/:id", moderateProperty);

module.exports = router;
