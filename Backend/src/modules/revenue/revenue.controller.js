const asyncHandler = require("../../utils/asyncHandler");
const revenueService = require("./revenue.service");
const ApiError = require("../../utils/ApiError");

/**
 * =====================================
 * CREATE REVENUE
 * POST /api/v1/revenues
 * =====================================
 */
const createRevenue = asyncHandler(async (req, res) => {

  const revenue = await revenueService.createRevenue(req.body);

  res.status(201).json({
    success: true,
    message: "Revenue created successfully",
    data: revenue
  });

});


/**
 * =====================================
 * GET ALL REVENUES
 * GET /api/v1/revenues
 * =====================================
 */
const getAllRevenues = asyncHandler(async (req, res) => {

  const result = await revenueService.getAllRevenue(req.query);

  res.status(200).json({
    success: true,
    ...result
  });

});


/**
 * =====================================
 * GET REVENUE BY ID
 * GET /api/v1/revenues/:id
 * =====================================
 */
const getRevenueById = asyncHandler(async (req, res) => {

  const revenue = await revenueService.getRevenueById(req.params.id);

  res.status(200).json({
    success: true,
    data: revenue
  });

});


/**
 * =====================================
 * UPDATE REVENUE
 * PUT /api/v1/revenues/:id
 * =====================================
 */
const updateRevenue = asyncHandler(async (req, res) => {

  const updatedRevenue = await revenueService.updateRevenue(
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Revenue updated successfully",
    data: updatedRevenue
  });

});


/**
 * =====================================
 * DELETE REVENUE (SOFT DELETE)
 * DELETE /api/v1/revenues/:id
 * =====================================
 */
const deleteRevenue = asyncHandler(async (req, res) => {

  await revenueService.softDeleteRevenue(req.params.id);

  res.status(200).json({
    success: true,
    message: "Revenue deleted successfully"
  });

});


/**
 * =====================================
 * REVENUE TREND (Charts)
 * GET /api/v1/revenues/trend
 * =====================================
 */
const getRevenueTrend = asyncHandler(async (req, res) => {

  const trend = await revenueService.getRevenueTrend();

  res.status(200).json({
    success: true,
    data: trend
  });

});


/**
 * =====================================
 * DEPARTMENT REVENUE ANALYTICS
 * GET /api/v1/revenues/department
 * =====================================
 */
const getDepartmentRevenue = asyncHandler(async (req, res) => {

  const analytics = await revenueService.getDepartmentRevenue();

  res.status(200).json({
    success: true,
    data: analytics
  });

});


/**
 * =====================================
 * FORECAST REVENUE
 * GET /api/v1/revenues/forecast
 * =====================================
 */
const getForecast = asyncHandler(async (req, res) => {

  const months = Number(req.query.months) || 3;

  const forecast = await revenueService.getForecast(months);

  res.status(200).json({
    success: true,
    data: forecast
  });

});


/**
 * =====================================
 * TARGET VS REVENUE COMPARISON
 * GET /api/v1/revenues/compare
 * =====================================
 */
const compareTarget = asyncHandler(async (req, res) => {

  const { month, year } = req.query;

  if (!month || !year) {
    throw new ApiError(400, "Month and year are required");
  }

  const result = await revenueService.compareTargetVsRevenue(
    Number(month),
    Number(year)
  );

  res.status(200).json({
    success: true,
    data: result
  });

});


module.exports = {
  createRevenue,
  getAllRevenues,
  getRevenueById,
  updateRevenue,
  deleteRevenue,
  getRevenueTrend,
  getDepartmentRevenue,
  getForecast,
  compareTarget
};