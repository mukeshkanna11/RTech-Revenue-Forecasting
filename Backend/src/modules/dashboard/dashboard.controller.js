// src/modules/dashboard/dashboard.controller.js

const asyncHandler = require("../../utils/asyncHandler");
const dashboardService = require("./dashboard.service");

const getSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardSummary();
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Dashboard summary fetched successfully",
    data,
    meta: { fetchedAt: new Date().toISOString() },
  });
});

module.exports = { getSummary };