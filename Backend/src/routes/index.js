const express = require("express");
const router = express.Router();

/**
 * ==========================================
 * Import Module Routes
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
 * HEALTH CHECK
 * GET /api/v1/health
 * ==========================================
 */
router.get("/health", (req, res) => {
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
 * MODULE ROUTES
 * Base paths: /api/v1/{module}
 * ==========================================
 */
router.use("/auth", authRoutes);
router.use("/clients", clientRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/revenues", revenueRoutes);
router.use("/targets", targetRoutes);
router.use("/forecast", forecastRoutes);
router.use("/dashboard", dashboardRoutes);

/**
 * ==========================================
 * GLOBAL 404 HANDLER
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

module.exports = router;