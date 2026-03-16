const express = require("express");
const router = express.Router();

/**
 * ==========================================
 * Import All Module Routes
 * Each module exports a proper router
 * ==========================================
 */
const authRoutes = require("../modules/auth/auth.routes");
const revenueRoutes = require("../modules/revenue/revenue.routes");
const targetRoutes = require("../modules/target/target.routes");
const forecastRoutes = require("../modules/forecast/forecast.routes");
const dashboardRoutes = require("../modules/dashboard/dashboard.routes");
const clientRoutes = require("../modules/clients/client.routes");
const invoiceRoutes = require("../modules/invoice/invoice.routes");

/**
 * ==========================================
 * API VERSION
 * ==========================================
 */
const API_VERSION = "/api/v1";

/**
 * ==========================================
 * HEALTH CHECK
 * GET /api/v1/health
 * ==========================================
 */
router.get(`${API_VERSION}/health`, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Revenue Forecast API running successfully 🚀",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    serverTime: new Date().toISOString(),
  });
});

/**
 * ==========================================
 * MODULE ROUTES REGISTRATION
 * Base paths follow: /api/v1/{module}
 * Each route file must export an express.Router()
 * ==========================================
 */
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/clients`, clientRoutes);
router.use(`${API_VERSION}/invoices`, invoiceRoutes);
router.use(`${API_VERSION}/revenues`, revenueRoutes);
router.use(`${API_VERSION}/targets`, targetRoutes);
router.use(`${API_VERSION}/forecast`, forecastRoutes);
router.use(`${API_VERSION}/dashboard`, dashboardRoutes);

/**
 * ==========================================
 * GLOBAL 404 ERROR HANDLER
 * ==========================================
 */
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route Not Found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

/**
 * ==========================================
 * GLOBAL 500 ERROR HANDLER
 * Catches all unhandled errors from async controllers
 * ==========================================
 */
router.use((err, req, res, next) => {
  console.error("[GlobalErrorHandler] Unhandled error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.name || "Internal Server Error",
    message: err.message || "Something went wrong",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;