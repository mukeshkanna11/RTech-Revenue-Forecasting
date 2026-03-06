const express = require("express");
const {
  createRevenue,
  getAllRevenues,
  getRevenueById,
  updateRevenue,
  deleteRevenue,
  getForecast,
  compareTarget
} = require("./revenue.controller");

const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");

const router = express.Router();

/**
 * Admin Only - Create Revenue
 */
router.post("/", protect, authorize("admin"), createRevenue);

/**
 * All Authenticated Users - View Revenues
 */
router.get("/", protect, getAllRevenues);

router.get("/forecast", protect, getForecast);

router.get("/compare", protect, compareTarget);

router.get("/:id", protect, getRevenueById);

router.put("/:id", protect, authorize("admin"), updateRevenue);

router.delete("/:id", protect, authorize("admin"), deleteRevenue);

module.exports = router;