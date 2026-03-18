// src/modules/revenue/revenue.service.js

const mongoose = require("mongoose");
const Revenue = require("./revenue.model");
const Target = require("../target/target.model");
const ApiError = require("../../utils/ApiError");

/**
 * =====================================
 * CREATE REVENUE (Upsert: update existing or create new)
 * =====================================
 */
const createRevenue = async (payload) => {
  const { department, month, year, amount } = payload;

  if (!department || !month || !year || !amount) {
    throw new ApiError(400, "All fields are required: department, month, year, amount");
  }

  // 🔄 Upsert: update existing revenue or create new one
  const revenue = await Revenue.findOneAndUpdate(
    { department, month, year, isDeleted: false },
    { $set: { amount } },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  return revenue;
};

/**
 * =====================================
 * FIND REVENUE (Helper for duplicate checks)
 * =====================================
 */
const findRevenue = async (filter) => {
  return Revenue.findOne({ ...filter, isDeleted: false }).lean();
};

/**
 * =====================================
 * GET ALL REVENUES (Advanced Filtering + Pagination)
 * =====================================
 */
const getAllRevenue = async (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 10, 100);
  const skip = (page - 1) * limit;

  const filter = { isDeleted: false };

  if (query.year) filter.year = Number(query.year);
  if (query.month) filter.month = Number(query.month);
  if (query.department) filter.department = query.department;

  if (query.minAmount || query.maxAmount) {
    filter.amount = {};
    if (query.minAmount) filter.amount.$gte = Number(query.minAmount);
    if (query.maxAmount) filter.amount.$lte = Number(query.maxAmount);
  }

  const [revenues, total] = await Promise.all([
    Revenue.find(filter)
      .sort({ year: -1, month: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Revenue.countDocuments(filter)
  ]);

  return {
    data: revenues,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * =====================================
 * GET REVENUE BY ID
 * =====================================
 */
const getRevenueById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Revenue ID");
  }

  const revenue = await Revenue.findOne({ _id: id, isDeleted: false }).lean();
  if (!revenue) throw new ApiError(404, "Revenue not found");

  return revenue;
};

/**
 * =====================================
 * UPDATE REVENUE (Prevent duplicates on update)
 * =====================================
 */
const updateRevenue = async (id, payload) => {
  const { department, month, year } = payload;

  if (department && month && year) {
    const duplicate = await findRevenue({ department, month, year });
    if (duplicate && duplicate._id.toString() !== id) {
      throw new ApiError(
        400,
        `Revenue for department '${department}' in ${month}/${year} already exists`
      );
    }
  }

  const revenue = await Revenue.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true, runValidators: true }
  ).lean();

  if (!revenue) throw new ApiError(404, "Revenue not found");
  return revenue;
};

/**
 * =====================================
 * SOFT DELETE REVENUE
 * =====================================
 */
const softDeleteRevenue = async (id) => {
  const revenue = await Revenue.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  ).lean();

  if (!revenue) throw new ApiError(404, "Revenue not found");
  return revenue;
};

/**
 * =====================================
 * REVENUE TREND (Chart Analytics)
 * =====================================
 */
const getRevenueTrend = async () => {
  return Revenue.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { year: "$year", month: "$month" },
        revenue: { $sum: "$amount" }
      }
    },
    {
      $project: {
        year: "$_id.year",
        month: "$_id.month",
        revenue: 1,
        _id: 0
      }
    },
    { $sort: { year: 1, month: 1 } }
  ]);
};

/**
 * =====================================
 * DEPARTMENT REVENUE ANALYTICS
 * =====================================
 */
const getDepartmentRevenue = async () => {
  return Revenue.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$department",
        totalRevenue: { $sum: "$amount" },
        months: { $addToSet: "$month" }
      }
    },
    {
      $project: {
        department: "$_id",
        totalRevenue: 1,
        activeMonths: { $size: "$months" },
        _id: 0
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);
};

/**
 * =====================================
 * FORECAST (Weighted Moving Average)
 * =====================================
 */
const getForecast = async (months = 3) => {
  const revenues = await Revenue.find({ isDeleted: false })
    .sort({ year: 1, month: 1 })
    .lean();

  const amounts = revenues.map(r => r.amount);
  if (amounts.length < 3) {
    throw new ApiError(400, "Minimum 3 months data required for forecast");
  }

  const forecasts = [];
  const data = [...amounts];

  for (let i = 0; i < months; i++) {
    const last3 = data.slice(-3);
    const weightedAvg = (last3[0] * 0.2) + (last3[1] * 0.3) + (last3[2] * 0.5);
    const next = Math.round(weightedAvg);
    forecasts.push(next);
    data.push(next);
  }

  return forecasts;
};

/**
 * =====================================
 * TARGET VS REVENUE COMPARISON
 * =====================================
 */
const compareTargetVsRevenue = async (month, year) => {
  const [revenue, target] = await Promise.all([
    Revenue.findOne({ month, year, isDeleted: false }).lean(),
    Target.findOne({ month, year, isDeleted: false }).lean()
  ]);

  const actual = revenue?.amount || 0;
  const targetAmount = target?.targetAmount || 0;
  const achievementPercent =
    targetAmount > 0 ? Number(((actual / targetAmount) * 100).toFixed(2)) : 0;

  return {
    month,
    year,
    target: targetAmount,
    actual,
    difference: actual - targetAmount,
    achievementPercent
  };
};

module.exports = {
  createRevenue,
  findRevenue,
  getAllRevenue,
  getRevenueById,
  updateRevenue,
  softDeleteRevenue,
  getRevenueTrend,
  getDepartmentRevenue,
  getForecast,
  compareTargetVsRevenue
};