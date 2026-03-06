const express = require("express");

const {
  getForecast,
  getDepartmentForecast
} = require("./forecast.controller");

const router = express.Router();

/**
 * ================================
 * GET GLOBAL FORECAST
 * ================================
 */

router.get(
  "/",
  getForecast
);

/**
 * ================================
 * DEPARTMENT FORECAST
 * ================================
 */

router.get(
  "/department/:department",
  getDepartmentForecast
);

module.exports = router;