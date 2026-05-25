const express = require("express");
const { sendInquiry } = require("../controllers/contactController");

const router = express.Router();

router.post("/", sendInquiry);

module.exports = router;
