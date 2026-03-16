// src/modules/dashboard/dashboard.routes.js

const express = require("express");
const router = express.Router();
const dashboardController = require("./dashboard.controller");

// GET /api/v1/dashboard/summary
router.get("/summary", dashboardController.getSummary);

module.exports = router;