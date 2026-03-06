const express = require("express");

const router = express.Router();

/**
 * ==========================================
 * Import All Module Routes
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

const API = "/api/v1";


/**
 * ==========================================
 * HEALTH CHECK
 * GET /api/v1/health
 * ==========================================
 */

router.get(`${API}/health`, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Revenue Forecast API running successfully 🚀",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    serverTime: new Date(),
  });
});


/**
 * ==========================================
 * AUTH MODULE
 * Base: /api/v1/auth
 * ==========================================
 */

router.use(`${API}/auth`, authRoutes);


/**
 * ==========================================
 * CLIENT MODULE
 * Base: /api/v1/clients
 * ==========================================
 */

router.use(`${API}/clients`, clientRoutes);


/**
 * ==========================================
 * INVOICE MODULE
 * Base: /api/v1/invoices
 * ==========================================
 */

router.use(`${API}/invoices`, invoiceRoutes);


/**
 * ==========================================
 * REVENUE MODULE
 * Base: /api/v1/revenues
 * ==========================================
 */

router.use(`${API}/revenues`, revenueRoutes);


/**
 * ==========================================
 * TARGET MODULE
 * Base: /api/v1/targets
 * ==========================================
 */

router.use(`${API}/targets`, targetRoutes);


/**
 * ==========================================
 * FORECAST MODULE
 * Base: /api/v1/forecast
 * ==========================================
 */

router.use(`${API}/forecast`, forecastRoutes);


/**
 * ==========================================
 * DASHBOARD MODULE
 * Base: /api/v1/dashboard
 * ==========================================
 */

router.use(`${API}/dashboard`, dashboardRoutes);


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
    timestamp: new Date(),
  });
});


module.exports = router;