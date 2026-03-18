// src/modules/revenue/revenues.controller.js

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
  const { department, month, year, amount } = req.body;

  // Check for duplicates
  const existing = await revenueService.findRevenue({ department, month, year });

  if (existing) {
    // SaaS-level approach: you can either reject or auto-update
    // Option 1: reject duplicate
    return res.status(400).json({
      success: false,
      message: `Revenue for department '${department}' in ${month}/${year} already exists.`,
    });

    // Option 2: auto-update instead of rejecting
    // existing.amount = amount;
    // await existing.save();
    // return res.status(200).json({
    //   success: true,
    //   message: "Revenue updated successfully",
    //   data: existing,
    // });
  }

  const revenue = await revenueService.createRevenue(req.body);

  res.status(201).json({
    success: true,
    message: "Revenue created successfully",
    data: revenue,
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
    ...result,
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
    data: revenue,
  });
});

/**
 * =====================================
 * UPDATE REVENUE
 * PUT /api/v1/revenues/:id
 * =====================================
 */
const updateRevenue = asyncHandler(async (req, res) => {
  const { department, month, year } = req.body;

  // Optional SaaS-level validation: prevent duplicates on update
  const duplicate = await revenueService.findRevenue({ department, month, year });
  if (duplicate && duplicate._id.toString() !== req.params.id) {
    throw new ApiError(
      400,
      `Revenue for department '${department}' in ${month}/${year} already exists.`
    );
  }

  const updatedRevenue = await revenueService.updateRevenue(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Revenue updated successfully",
    data: updatedRevenue,
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
    message: "Revenue deleted successfully",
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
    data: trend,
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
    data: analytics,
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
    data: forecast,
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
    data: result,
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
  compareTarget,
};