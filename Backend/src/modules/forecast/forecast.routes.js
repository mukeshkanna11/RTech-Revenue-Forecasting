// ==========================
// forecast.routes.js
// ==========================
const express = require("express");
const { param, query, validationResult } = require("express-validator");
const { getForecast, getDepartmentForecast } = require("./forecast.controller");

const router = express.Router();

/**
 * Async wrapper to handle errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * ================================
 * GET GLOBAL FORECAST
 * @route GET /api/forecast?months=6
 * Query Params:
 *  - months: optional, number of months to forecast
 * ================================
 */
router.get(
  "/",
  query("months")
    .optional()
    .isInt({ min: 1, max: 36 })
    .withMessage("Months must be an integer between 1 and 36"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    await getForecast(req, res, next);
  })
);

/**
 * ================================
 * GET DEPARTMENT FORECAST
 * @route GET /api/forecast/department/:department?months=6
 * Path Params:
 *  - department: required, string
 * Query Params:
 *  - months: optional, number of months to forecast
 * ================================
 */
router.get(
  "/department/:department",
  param("department")
    .exists()
    .withMessage("Department is required")
    .isString()
    .trim()
    .escape(),
  query("months")
    .optional()
    .isInt({ min: 1, max: 36 })
    .withMessage("Months must be an integer between 1 and 36"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    await getDepartmentForecast(req, res, next);
  })
);

module.exports = router;