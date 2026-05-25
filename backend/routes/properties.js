const express = require("express");
const {
  listProperties,
  getProperty,
  createProperty,
  createPropertyUploadSignature,
  updateProperty,
  deleteProperty,
  myProperties,
} = require("../controllers/propertyController");
const { protect, optionalProtect } = require("../middleware/authMiddleware");
const { requireServiceAccess } = require("../middleware/serviceAccessMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", listProperties);
router.get("/mine", protect, myProperties);
router.post("/upload-signature", protect, requireServiceAccess, createPropertyUploadSignature);
router.post("/", protect, requireServiceAccess, upload.array("images", 10), createProperty);
router.put("/:id", protect, upload.array("images", 10), updateProperty);
router.delete("/:id", protect, deleteProperty);
router.get("/:id", optionalProtect, getProperty);

module.exports = router;
