const asyncHandler = require("../../utils/asyncHandler");
const revenueService = require("./revenue.service");
const ApiError = require("../../utils/ApiError");

/**
 * ===============================
 * Create Revenue
 * POST /api/v1/revenues
 * ===============================
 */
const createRevenue = asyncHandler(async (req, res) => {
  const revenue = await revenueService.createRevenue(req.body);

  res.status(201).json({
    success: true,
    data: revenue
  });
});

/**
 * ===============================
 * Get All Revenues (Pagination)
 * GET /api/v1/revenues
 * ===============================
 */
const getAllRevenues = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const revenues = await revenueService.getAllRevenue({
    page: Number(page),
    limit: Number(limit)
  });

  res.status(200).json({
    success: true,
    data: revenues
  });
});

/**
 * ===============================
 * Get Revenue By ID
 * GET /api/v1/revenues/:id
 * ===============================
 */
const getRevenueById = asyncHandler(async (req, res) => {
  const revenue = await revenueService.getRevenueById(req.params.id);

  if (!revenue) {
    throw new ApiError(404, "Revenue not found");
  }

  res.status(200).json({
    success: true,
    data: revenue
  });
});

/**
 * ===============================
 * Update Revenue
 * PUT /api/v1/revenues/:id
 * ===============================
 */
const updateRevenue = asyncHandler(async (req, res) => {
  const updated = await revenueService.updateRevenue(
    req.params.id,
    req.body
  );

  if (!updated) {
    throw new ApiError(404, "Revenue not found");
  }

  res.status(200).json({
    success: true,
    data: updated
  });
});

/**
 * ===============================
 * Delete Revenue (Soft Delete)
 * DELETE /api/v1/revenues/:id
 * ===============================
 */
const deleteRevenue = asyncHandler(async (req, res) => {
  const deleted = await revenueService.softDeleteRevenue(req.params.id);

  if (!deleted) {
    throw new ApiError(404, "Revenue not found");
  }

  res.status(200).json({
    success: true,
    message: "Revenue deleted successfully"
  });
});

/**
 * ===============================
 * Forecast Revenue
 * GET /api/v1/revenues/forecast
 * ===============================
 */
const getForecast = asyncHandler(async (req, res) => {
  const forecast = await revenueService.getForecast();

  res.status(200).json({
    success: true,
    data: forecast
  });
});

/**
 * ===============================
 * Compare Target vs Revenue
 * GET /api/v1/revenues/compare
 * ===============================
 */
const compareTarget = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    throw new ApiError(400, "Month and year required");
  }

  const data = await revenueService.compareTargetVsRevenue(
    Number(month),
    Number(year)
  );

  res.status(200).json({
    success: true,
    data
  });
});

module.exports = {
  createRevenue,
  getAllRevenues,
  getRevenueById,
  updateRevenue,
  deleteRevenue,
  getForecast,
  compareTarget
};