const express = require("express");
const { getSummary } = require("./dashboard.controller");
const { protect } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.get("/summary", protect, getSummary);

module.exports = router;