const Revenue = require("./revenue.model");
const Target = require("../target/target.model");
const ApiError = require("../../utils/ApiError");

/**
 * ================================
 * CREATE REVENUE
 * ================================
 */
const createRevenue = async (payload) => {

  const existing = await Revenue.findOne({
    month: payload.month,
    year: payload.year,
    department: payload.department,
    isDeleted: false
  });

  if (existing) {
    throw new ApiError(
      400,
      "Revenue already exists for this month, year, and department"
    );
  }

  return await Revenue.create(payload);
};


/**
 * ================================
 * GET ALL REVENUES (Pagination + Filter)
 * ================================
 */
const getAllRevenue = async (query) => {

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const filter = { isDeleted: false };

  if (query.year) filter.year = query.year;
  if (query.department) filter.department = query.department;

  const revenues = await Revenue.find(filter)
    .sort({ year: -1, month: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Revenue.countDocuments(filter);

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
 * ================================
 * GET REVENUE BY ID
 * ================================
 */
const getRevenueById = async (id) => {

  const revenue = await Revenue.findOne({
    _id: id,
    isDeleted: false
  });

  if (!revenue) {
    throw new ApiError(404, "Revenue not found");
  }

  return revenue;
};


/**
 * ================================
 * UPDATE REVENUE
 * ================================
 */
const updateRevenue = async (id, payload) => {

  const revenue = await Revenue.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true }
  );

  if (!revenue) {
    throw new ApiError(404, "Revenue not found");
  }

  return revenue;
};


/**
 * ================================
 * SOFT DELETE REVENUE
 * ================================
 */
const softDeleteRevenue = async (id) => {

  const revenue = await Revenue.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!revenue) {
    throw new ApiError(404, "Revenue not found");
  }

  return revenue;
};


/**
 * ================================
 * REVENUE TREND (For Charts)
 * ================================
 */
const getRevenueTrend = async () => {

  const trend = await Revenue.aggregate([
    { $match: { isDeleted: false } },

    {
      $group: {
        _id: {
          year: "$year",
          month: "$month"
        },
        revenue: { $sum: "$amount" }
      }
    },

    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1
      }
    }
  ]);

  return trend;
};


/**
 * ================================
 * DEPARTMENT REVENUE ANALYTICS
 * ================================
 */
const getDepartmentRevenue = async () => {

  return await Revenue.aggregate([
    { $match: { isDeleted: false } },

    {
      $group: {
        _id: "$department",
        totalRevenue: { $sum: "$amount" }
      }
    },

    {
      $project: {
        department: "$_id",
        totalRevenue: 1,
        _id: 0
      }
    },

    { $sort: { totalRevenue: -1 } }
  ]);
};


/**
 * ================================
 * FORECAST (Moving Average Method)
 * ================================
 */
const getForecast = async (months = 3) => {

  const revenues = await Revenue.find({ isDeleted: false })
    .sort({ year: 1, month: 1 });

  const amounts = revenues.map(r => r.amount);

  if (amounts.length < 3) {
    throw new ApiError(
      400,
      "Not enough data for forecasting"
    );
  }

  const forecasts = [];
  let data = [...amounts];

  for (let i = 0; i < months; i++) {

    const lastThree = data.slice(-3);

    const avg =
      lastThree.reduce((a, b) => a + b, 0) / 3;

    forecasts.push(Math.round(avg));

    data.push(avg);
  }

  return forecasts;
};


/**
 * ================================
 * COMPARE TARGET VS REVENUE
 * ================================
 */
const compareTargetVsRevenue = async (month, year) => {

  const revenue = await Revenue.findOne({
    month,
    year,
    isDeleted: false
  });

  const target = await Target.findOne({
    month,
    year,
    isDeleted: false
  });

  const actual = revenue ? revenue.amount : 0;
  const targetAmount = target ? target.targetAmount : 0;

  return {
    month,
    year,
    target: targetAmount,
    actual,
    difference: actual - targetAmount,
    achievementPercent:
      targetAmount > 0
        ? ((actual / targetAmount) * 100).toFixed(2)
        : 0
  };
};


module.exports = {
  createRevenue,
  getAllRevenue,
  getRevenueById,
  updateRevenue,
  softDeleteRevenue,
  getRevenueTrend,
  getDepartmentRevenue,
  getForecast,
  compareTargetVsRevenue
};