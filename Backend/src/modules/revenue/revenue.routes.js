const express = require("express");

const {
  createRevenue,
  getAllRevenues,
  getRevenueById,
  updateRevenue,
  deleteRevenue,
  getForecast,
  compareTarget,
  getRevenueTrend,
  getDepartmentRevenue
} = require("./revenue.controller");

const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");

const router = express.Router();

/**
 * =====================================
 * PUBLIC AUTHENTICATED ROUTES
 * =====================================
 */

router.use(protect);

/**
 * Revenue Listing
 */
router.get("/", getAllRevenues);

router.get("/trend", getRevenueTrend);

router.get("/department", getDepartmentRevenue);

router.get("/forecast", getForecast);

router.get("/compare", compareTarget);

router.get("/:id", getRevenueById);


/**
 * =====================================
 * ADMIN ONLY ROUTES
 * =====================================
 */

router.post(
  "/",
  authorize("admin"),
  createRevenue
);

router.put(
  "/:id",
  authorize("admin"),
  updateRevenue
);

router.delete(
  "/:id",
  authorize("admin"),
  deleteRevenue
);


module.exports = router;